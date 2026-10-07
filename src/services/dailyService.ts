import { Op } from 'sequelize';
import { Lesson } from '../models/Lesson';
import { Sentence } from '../models/Sentence';
import { Category } from '../models/Category';
import { Level } from '../models/Level';
import { UserSentenceProgress } from '../models/UserSentenceProgress';
import { Bookmark } from '../models/Bookmark';
import { DailyGoal } from '../models/DailyGoal';
import { User } from '../models/User';
import { Vocabulary } from '../models/Vocabulary';
import { getTodayDateString } from '../utils/dateUtils';
import { UserActivity } from '../models/UserActivity';

export class DailyService {
  /**
   * Deterministic Daily 5 algorithm:
   * 1. Check user's current progress & level.
   * 2. Find the appropriate daily lesson (Day 1, Day 2, etc.) or first uncompleted primary lesson.
   * 3. Fetch its 5 sentences with category, level, vocabulary, bookmark and user progress status.
   * 4. Count sentences completed today.
   */
  static async getTodayDailyLesson(userId: number, customDate?: string) {
    const today = customDate || getTodayDateString();

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user's daily goal target
    let dailyGoal = await DailyGoal.findOne({ where: { userId } });
    const targetGoal = dailyGoal ? dailyGoal.targetSentences : (user.dailyGoal || 5);

    // Get user's registered level ID
    const level = await Level.findOne({ where: { name: user.englishLevel || 'Beginner' } }) || await Level.findByPk(1);
    const levelId = level ? level.id : 1;

    // Deterministic selection: find the lowest lessonNumber where sentences are not all mastered, or sequential based on user totalLearningDays + 1
    const userCompletedSentencesCount = await UserSentenceProgress.count({
      where: {
        userId,
        status: { [Op.in]: ['LEARNED', 'MASTERED'] },
      },
    });

    // Each lesson has 5 sentences, so lessonIndex = floor(completed / 5) + 1
    const calculatedLessonNumber = Math.max(1, Math.floor(userCompletedSentencesCount / 5) + 1);

    // Fetch the lesson
    let lesson = await Lesson.findOne({
      where: {
        lessonNumber: calculatedLessonNumber,
        status: 'ACTIVE',
      },
      include: [
        { model: Category, as: 'category' },
        { model: Level, as: 'level' },
      ],
    });

    if (!lesson) {
      // Fallback to first active lesson in level
      lesson = await Lesson.findOne({
        where: { levelId, status: 'ACTIVE' },
        include: [
          { model: Category, as: 'category' },
          { model: Level, as: 'level' },
        ],
        order: [['lessonNumber', 'ASC']],
      });
    }

    if (!lesson) {
      // Ultimate fallback to first available lesson
      lesson = await Lesson.findByPk(1, {
        include: [
          { model: Category, as: 'category' },
          { model: Level, as: 'level' },
        ],
      });
    }

    if (!lesson) {
      throw new Error('No lesson available in the database');
    }

    // Fetch exactly 5 sentences of this lesson
    const sentences = await Sentence.findAll({
      where: {
        lessonId: lesson.id,
        status: 'ACTIVE',
      },
      include: [
        { model: Category, as: 'category' },
        { model: Level, as: 'level' },
        { model: Vocabulary, as: 'vocabularies', through: { attributes: [] } },
      ],
      order: [['orderNumber', 'ASC']],
      limit: 5,
    });

    // Fetch user progress and bookmarks for these sentences
    const sentenceIds = sentences.map((s) => s.id);

    const progresses = await UserSentenceProgress.findAll({
      where: {
        userId,
        sentenceId: { [Op.in]: sentenceIds },
      },
    });

    const bookmarks = await Bookmark.findAll({
      where: {
        userId,
        sentenceId: { [Op.in]: sentenceIds },
      },
    });

    const progressMap = new Map<number, string>();
    progresses.forEach((p) => progressMap.set(p.sentenceId, p.status));

    const bookmarkSet = new Set<number>();
    bookmarks.forEach((b) => bookmarkSet.add(b.sentenceId));

    // Calculate today's completed sentences
    const todayCompletedCount = await UserActivity.count({
      where: {
        userId,
        activityDate: today,
        activityType: 'SENTENCE_COMPLETED',
      },
    });

    const enrichedSentences = sentences.map((s) => ({
      id: s.id,
      lessonId: s.lessonId,
      categoryId: s.categoryId,
      levelId: s.levelId,
      englishText: s.englishText,
      malayalamText: s.malayalamText,
      pronunciation: s.pronunciation,
      explanation: s.explanation,
      usageSituation: s.usageSituation,
      exampleResponse: s.exampleResponse,
      audioUrl: s.audioUrl,
      orderNumber: s.orderNumber,
      category: s.category,
      level: s.level,
      vocabularies: s.vocabularies,
      userStatus: progressMap.get(s.id) || 'NOT_STARTED',
      isLearned: progressMap.get(s.id) === 'LEARNED' || progressMap.get(s.id) === 'MASTERED',
      isBookmarked: bookmarkSet.has(s.id),
    }));

    const completedInLesson = enrichedSentences.filter((s) => s.isLearned).length;
    const remainingInLesson = Math.max(0, 5 - completedInLesson);

    return {
      date: today,
      goal: targetGoal,
      todayTotalCompleted: todayCompletedCount,
      goalCompleted: todayCompletedCount >= targetGoal,
      extraCompleted: Math.max(0, todayCompletedCount - targetGoal),
      lessonCompleted: completedInLesson === 5,
      completedInLesson,
      remainingInLesson,
      lesson: {
        id: lesson.id,
        lessonNumber: lesson.lessonNumber,
        dayNumber: lesson.dayNumber,
        title: lesson.title,
        malayalamTitle: lesson.malayalamTitle,
        description: lesson.description,
        category: lesson.category,
        level: lesson.level,
      },
      sentences: enrichedSentences,
    };
  }
}
