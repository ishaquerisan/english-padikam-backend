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
   * 1. Check user's preferred category (learningGoal) & level (englishLevel).
   * 2. Find the active lesson for that category and level where the user has remaining unlearned sentences.
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
    const dailyGoal = await DailyGoal.findOne({ where: { userId } });
    const targetGoal = dailyGoal ? dailyGoal.targetSentences : (user.dailyGoal || 5);

    // 1. Resolve Category from user's learningGoal preference
    let category: Category | null = null;
    if (user.learningGoal) {
      const isNum = !isNaN(Number(user.learningGoal));
      category = await Category.findOne({
        where: {
          [Op.or]: [
            { name: user.learningGoal },
            { slug: user.learningGoal },
            ...(isNum ? [{ id: Number(user.learningGoal) }] : []),
          ],
        },
      });
    }

    if (!category) {
      category = (await Category.findOne({ where: { name: 'Daily Conversation' } })) || (await Category.findByPk(1));
    }
    const categoryId = category ? category.id : 1;

    // 2. Resolve Level from user's englishLevel preference
    let level: Level | null = null;
    if (user.englishLevel) {
      const isNum = !isNaN(Number(user.englishLevel));
      level = await Level.findOne({
        where: {
          [Op.or]: [
            { name: user.englishLevel },
            { code: user.englishLevel },
            ...(isNum ? [{ id: Number(user.englishLevel) }] : []),
          ],
        },
      });
    }

    if (!level) {
      level = (await Level.findOne({ where: { name: 'Beginner' } })) || (await Level.findByPk(1));
    }
    const levelId = level ? level.id : 1;

    // 3. Find candidate active lessons prioritizing (categoryId, levelId)
    let candidateLessons = await Lesson.findAll({
      where: {
        categoryId,
        levelId,
        status: 'ACTIVE',
      },
      include: [
        { model: Category, as: 'category' },
        { model: Level, as: 'level' },
      ],
      order: [['lessonNumber', 'ASC']],
    });

    if (candidateLessons.length === 0) {
      // Fallback: candidate lessons in this category
      candidateLessons = await Lesson.findAll({
        where: {
          categoryId,
          status: 'ACTIVE',
        },
        include: [
          { model: Category, as: 'category' },
          { model: Level, as: 'level' },
        ],
        order: [['lessonNumber', 'ASC']],
      });
    }

    if (candidateLessons.length === 0) {
      // Fallback: candidate lessons in this level
      candidateLessons = await Lesson.findAll({
        where: {
          levelId,
          status: 'ACTIVE',
        },
        include: [
          { model: Category, as: 'category' },
          { model: Level, as: 'level' },
        ],
        order: [['lessonNumber', 'ASC']],
      });
    }

    if (candidateLessons.length === 0) {
      // Ultimate fallback: all active lessons
      candidateLessons = await Lesson.findAll({
        where: {
          status: 'ACTIVE',
        },
        include: [
          { model: Category, as: 'category' },
          { model: Level, as: 'level' },
        ],
        order: [['lessonNumber', 'ASC']],
      });
    }

    if (candidateLessons.length === 0) {
      throw new Error('No lesson available in the database');
    }

    // 4. Determine which candidate lesson the user should learn today
    const candidateLessonIds = candidateLessons.map((l) => l.id);

    // Get all completed/learned sentence IDs for this user
    const userLearnedSentences = await UserSentenceProgress.findAll({
      where: {
        userId,
        status: { [Op.in]: ['LEARNED', 'MASTERED'] },
      },
      attributes: ['sentenceId'],
    });
    const learnedSentenceIdSet = new Set(userLearnedSentences.map((p) => p.sentenceId));

    // Get sentences belonging to candidate lessons
    const candidateSentences = await Sentence.findAll({
      where: {
        lessonId: { [Op.in]: candidateLessonIds },
        status: 'ACTIVE',
      },
      attributes: ['id', 'lessonId'],
      order: [['orderNumber', 'ASC']],
    });

    const lessonSentenceMap = new Map<number, number[]>();
    for (const s of candidateSentences) {
      if (!lessonSentenceMap.has(s.lessonId)) {
        lessonSentenceMap.set(s.lessonId, []);
      }
      lessonSentenceMap.get(s.lessonId)!.push(s.id);
    }

    // Find the first lesson with unlearned sentences
    let chosenLesson = candidateLessons.find((l) => {
      const sentenceIdsInLesson = lessonSentenceMap.get(l.id) || [];
      if (sentenceIdsInLesson.length === 0) return false;
      const completedCount = sentenceIdsInLesson.filter((id) => learnedSentenceIdSet.has(id)).length;
      return completedCount < sentenceIdsInLesson.length;
    });

    // If all candidate lessons are fully completed, pick the first one for review
    if (!chosenLesson) {
      chosenLesson = candidateLessons[0];
    }

    // 5. Fetch exactly 5 sentences of this chosen lesson
    const sentences = await Sentence.findAll({
      where: {
        lessonId: chosenLesson.id,
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
    const remainingInLesson = Math.max(0, enrichedSentences.length - completedInLesson);

    return {
      date: today,
      goal: targetGoal,
      todayTotalCompleted: todayCompletedCount,
      goalCompleted: todayCompletedCount >= targetGoal,
      extraCompleted: Math.max(0, todayCompletedCount - targetGoal),
      lessonCompleted: enrichedSentences.length > 0 && completedInLesson === enrichedSentences.length,
      completedInLesson,
      remainingInLesson,
      lesson: {
        id: chosenLesson.id,
        lessonNumber: chosenLesson.lessonNumber,
        dayNumber: chosenLesson.dayNumber,
        title: chosenLesson.title,
        malayalamTitle: chosenLesson.malayalamTitle,
        description: chosenLesson.description,
        category: chosenLesson.category,
        level: chosenLesson.level,
      },
      sentences: enrichedSentences,
    };
  }
}
