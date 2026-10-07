import { Op, Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import { Sentence } from '../models/Sentence';
import { Category } from '../models/Category';
import { Level } from '../models/Level';
import { Lesson } from '../models/Lesson';
import { UserSentenceProgress } from '../models/UserSentenceProgress';
import { UserActivity } from '../models/UserActivity';
import { User } from '../models/User';
import { UserLesson } from '../models/UserLesson';
import { DailyGoal } from '../models/DailyGoal';
import { Bookmark } from '../models/Bookmark';
import { Vocabulary } from '../models/Vocabulary';
import { UserLearningSession } from '../models/UserLearningSession';
import { StreakService } from './streakService';
import { getTodayDateString } from '../utils/dateUtils';

export class LearningService {
  /**
   * Extra learning algorithm:
   * Returns fresh sentences that user has not completed yet,
   * matched by preferred level or category.
   */
  static async getNextSentences(
    userId: number,
    count = 5,
    categoryId?: number,
    levelId?: number
  ) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Get all learned sentence IDs
    const learnedProgress = await UserSentenceProgress.findAll({
      where: {
        userId,
        status: { [Op.in]: ['LEARNED', 'MASTERED'] },
      },
      attributes: ['sentenceId'],
    });
    const learnedIds = learnedProgress.map((p) => p.sentenceId);

    // Build filter
    const whereClause: any = {
      status: 'ACTIVE',
    };

    if (learnedIds.length > 0) {
      whereClause.id = { [Op.notIn]: learnedIds };
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (levelId) {
      whereClause.levelId = levelId;
    }

    const sentences = await Sentence.findAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category' },
        { model: Level, as: 'level' },
        { model: Lesson, as: 'lesson' },
        { model: Vocabulary, as: 'vocabularies', through: { attributes: [] } },
      ],
      order: [
        ['levelId', 'ASC'],
        ['lessonId', 'ASC'],
        ['orderNumber', 'ASC'],
      ],
      limit: Math.min(50, Math.max(1, count)),
    });

    // Fetch bookmarks
    const sentenceIds = sentences.map((s) => s.id);
    const bookmarks = await Bookmark.findAll({
      where: {
        userId,
        sentenceId: { [Op.in]: sentenceIds },
      },
    });
    const bookmarkSet = new Set(bookmarks.map((b) => b.sentenceId));

    return sentences.map((s) => ({
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
      lesson: s.lesson,
      vocabularies: s.vocabularies,
      isLearned: false,
      isBookmarked: bookmarkSet.has(s.id),
    }));
  }

  /**
   * Starts a sentence viewing activity
   */
  static async startSentence(userId: number, sentenceId: number) {
    const today = getTodayDateString();
    const sentence = await Sentence.findByPk(sentenceId);
    if (!sentence) throw new Error('Sentence not found');

    const [progress, created] = await UserSentenceProgress.findOrCreate({
      where: { userId, sentenceId },
      defaults: {
        userId,
        sentenceId,
        status: 'VIEWED',
        firstViewedAt: new Date(),
        lastPracticedAt: new Date(),
        practiceCount: 1,
      },
    });

    if (!created) {
      progress.practiceCount += 1;
      progress.lastPracticedAt = new Date();
      await progress.save();
    }

    // Log Activity: SENTENCE_VIEWED
    await UserActivity.create({
      userId,
      activityDate: today,
      activityType: 'SENTENCE_VIEWED',
      sentenceId,
      lessonId: sentence.lessonId,
    });

    return { success: true, status: progress.status };
  }

  /**
   * Completes a sentence using a database transaction
   */
  static async completeSentence(userId: number, sentenceId: number) {
    const today = getTodayDateString();

    return await sequelize.transaction(async (t: Transaction) => {
      const sentence = await Sentence.findByPk(sentenceId, { transaction: t });
      if (!sentence) throw new Error('Sentence not found');

      // 1. Update / Create Sentence Progress
      let progress = await UserSentenceProgress.findOne({
        where: { userId, sentenceId },
        transaction: t,
      });

      const wasAlreadyLearned = progress && (progress.status === 'LEARNED' || progress.status === 'MASTERED');

      if (!progress) {
        progress = await UserSentenceProgress.create(
          {
            userId,
            sentenceId,
            status: 'LEARNED',
            firstViewedAt: new Date(),
            completedAt: new Date(),
            practiceCount: 1,
            lastPracticedAt: new Date(),
          },
          { transaction: t }
        );
      } else {
        progress.status = 'LEARNED';
        progress.completedAt = progress.completedAt || new Date();
        progress.practiceCount += 1;
        progress.lastPracticedAt = new Date();
        await progress.save({ transaction: t });
      }

      // 2. Log Activity: SENTENCE_COMPLETED
      await UserActivity.create(
        {
          userId,
          activityDate: today,
          activityType: 'SENTENCE_COMPLETED',
          sentenceId,
          lessonId: sentence.lessonId,
          metadata: {
            categoryId: sentence.categoryId,
            levelId: sentence.levelId,
          },
        },
        { transaction: t }
      );

      // 3. Update Streak & Active Learning Day
      const streakResult = await StreakService.updateStreakOnActiveLearning(userId, t);

      // 4. Update User total count if newly learned
      if (!wasAlreadyLearned) {
        await User.increment('totalSentencesLearned', {
          by: 1,
          where: { id: userId },
          transaction: t,
        });
      }

      // 5. Check Daily Goal Completion
      const todaySentenceCount = await UserActivity.count({
        where: {
          userId,
          activityDate: today,
          activityType: 'SENTENCE_COMPLETED',
        },
        transaction: t,
      });

      const dailyGoalRecord = await DailyGoal.findOne({
        where: { userId },
        transaction: t,
      });
      const targetGoal = dailyGoalRecord ? dailyGoalRecord.targetSentences : 5;

      let goalJustCompleted = false;
      if (todaySentenceCount === targetGoal) {
        goalJustCompleted = true;
        await UserActivity.create(
          {
            userId,
            activityDate: today,
            activityType: 'DAILY_GOAL_COMPLETED',
            lessonId: sentence.lessonId,
            metadata: { targetGoal, achievedCount: todaySentenceCount },
          },
          { transaction: t }
        );
      }

      // 6. Update Lesson Progress
      let userLesson = await UserLesson.findOne({
        where: { userId, lessonId: sentence.lessonId },
        transaction: t,
      });

      // Count completed sentences in this lesson
      const completedInLesson = await UserSentenceProgress.count({
        where: {
          userId,
          status: { [Op.in]: ['LEARNED', 'MASTERED'] },
        },
        include: [
          {
            model: Sentence,
            as: 'sentence',
            where: { lessonId: sentence.lessonId },
            attributes: [],
          },
        ],
        transaction: t,
      });

      const isLessonComplete = completedInLesson >= 5;

      if (!userLesson) {
        userLesson = await UserLesson.create(
          {
            userId,
            lessonId: sentence.lessonId,
            status: isLessonComplete ? 'COMPLETED' : 'IN_PROGRESS',
            sentencesCompleted: completedInLesson,
            completedAt: isLessonComplete ? new Date() : null,
          },
          { transaction: t }
        );
      } else {
        userLesson.sentencesCompleted = completedInLesson;
        if (isLessonComplete && userLesson.status !== 'COMPLETED') {
          userLesson.status = 'COMPLETED';
          userLesson.completedAt = new Date();
        } else if (!isLessonComplete && userLesson.status === 'NOT_STARTED') {
          userLesson.status = 'IN_PROGRESS';
        }
        await userLesson.save({ transaction: t });
      }

      return {
        sentenceId,
        status: progress.status,
        todaySentenceCount,
        dailyGoal: targetGoal,
        goalCompleted: todaySentenceCount >= targetGoal,
        goalJustCompleted,
        currentStreak: streakResult.currentStreak,
        longestStreak: streakResult.longestStreak,
        lessonCompleted: isLessonComplete,
      };
    });
  }

  /**
   * Starts a learning session
   */
  static async startSession(userId: number) {
    const session = await UserLearningSession.create({
      userId,
      startedAt: new Date(),
      sentencesLearned: 0,
      durationSeconds: 0,
    });
    return session;
  }

  /**
   * Ends a learning session
   */
  static async endSession(userId: number, sessionId: number, sentencesLearned: number, durationSeconds: number) {
    const session = await UserLearningSession.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('Learning session not found');
    }

    session.endedAt = new Date();
    session.sentencesLearned = sentencesLearned;
    session.durationSeconds = durationSeconds;
    await session.save();

    return session;
  }
}
