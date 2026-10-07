import { Op } from 'sequelize';
import { UserActivity } from '../models/UserActivity';
import { Sentence } from '../models/Sentence';
import { Category } from '../models/Category';
import { Level } from '../models/Level';
import { Lesson } from '../models/Lesson';
import { Vocabulary } from '../models/Vocabulary';
import { UserStreak } from '../models/UserStreak';
import { getTodayDateString, getDaysInMonth, getStartOfWeek } from '../utils/dateUtils';
import { UserSentenceProgress } from '../models/UserSentenceProgress';

export class ActivityService {
  /**
   * Generates a GitHub-style activity calendar for a specific year and month
   */
  static async getCalendar(userId: number, yearParam?: number, monthParam?: number) {
    const today = new Date();
    const year = yearParam || today.getFullYear();
    const month = monthParam || today.getMonth() + 1; // 1-12

    const daysCount = getDaysInMonth(year, month);
    const monthPadded = month.toString().padStart(2, '0');
    const startDate = `${year}-${monthPadded}-01`;
    const endDate = `${year}-${monthPadded}-${daysCount.toString().padStart(2, '0')}`;

    // Fetch all user activities for this month
    const activities = await UserActivity.findAll({
      where: {
        userId,
        activityDate: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    // Group activities by date
    const dateMap = new Map<string, {
      sentences: number;
      vocabularies: number;
      quizzes: number;
      quizScores: number[];
      sessionsDuration: number;
    }>();

    for (let day = 1; day <= daysCount; day++) {
      const dStr = `${year}-${monthPadded}-${day.toString().padStart(2, '0')}`;
      dateMap.set(dStr, {
        sentences: 0,
        vocabularies: 0,
        quizzes: 0,
        quizScores: [],
        sessionsDuration: 0,
      });
    }

    activities.forEach((act) => {
      const entry = dateMap.get(act.activityDate);
      if (entry) {
        if (act.activityType === 'SENTENCE_COMPLETED') {
          entry.sentences += 1;
        } else if (act.activityType === 'VOCABULARY_LEARNED') {
          entry.vocabularies += 1;
        } else if (act.activityType === 'QUIZ_COMPLETED') {
          entry.quizzes += 1;
          if (act.metadata && (act.metadata as any).score !== undefined) {
            entry.quizScores.push((act.metadata as any).score);
          }
        }
      }
    });

    const calendarDays = [];
    let totalSentencesInMonth = 0;
    let activeDaysInMonth = 0;

    for (let day = 1; day <= daysCount; day++) {
      const dStr = `${year}-${monthPadded}-${day.toString().padStart(2, '0')}`;
      const data = dateMap.get(dStr)!;

      // Intensity level: 0: 0, 1: 1-4, 2: 5-9, 3: 10-19, 4: 20+
      let intensity = 0;
      if (data.sentences >= 20) intensity = 4;
      else if (data.sentences >= 10) intensity = 3;
      else if (data.sentences >= 5) intensity = 2;
      else if (data.sentences >= 1) intensity = 1;

      if (data.sentences > 0 || data.quizzes > 0) {
        activeDaysInMonth++;
      }
      totalSentencesInMonth += data.sentences;

      // Estimated learning time: approx 1.5 - 2 mins per sentence + quiz time
      const estimatedMinutes = Math.round(data.sentences * 1.5 + data.quizzes * 2);

      const avgQuizScore = data.quizScores.length > 0
        ? Math.round(data.quizScores.reduce((a, b) => a + b, 0) / data.quizScores.length)
        : null;

      calendarDays.push({
        date: dStr,
        dayNumber: day,
        intensity,
        sentencesLearned: data.sentences,
        vocabulariesLearned: data.vocabularies,
        quizzesCompleted: data.quizzes,
        averageQuizScore: avgQuizScore,
        estimatedTimeMinutes: estimatedMinutes,
        isActiveDay: intensity > 0,
      });
    }

    return {
      year,
      month,
      daysInMonth: daysCount,
      totalSentencesInMonth,
      activeDaysInMonth,
      days: calendarDays,
    };
  }

  /**
   * Retrieves detailed learning day summary and sentences
   */
  static async getDayDetail(userId: number, date: string) {
    // 1. Fetch completed sentences for this day
    const sentenceActivities = await UserActivity.findAll({
      where: {
        userId,
        activityDate: date,
        activityType: 'SENTENCE_COMPLETED',
      },
      include: [
        {
          model: Sentence,
          as: 'sentence',
          include: [
            { model: Category, as: 'category' },
            { model: Level, as: 'level' },
            { model: Vocabulary, as: 'vocabularies', through: { attributes: [] } },
          ],
        },
      ],
    });

    const quizActivities = await UserActivity.findAll({
      where: {
        userId,
        activityDate: date,
        activityType: 'QUIZ_COMPLETED',
      },
    });

    const streak = await UserStreak.findOne({ where: { userId } });

    const sentences = sentenceActivities
      .filter((a) => (a as any).sentence)
      .map((a) => (a as any).sentence);

    const quizScores: number[] = [];
    quizActivities.forEach((q) => {
      if (q.metadata && (q.metadata as any).score !== undefined) {
        quizScores.push((q.metadata as any).score);
      }
    });

    const avgQuizScore = quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : null;

    const estimatedMinutes = Math.round(sentences.length * 1.5 + quizActivities.length * 2);

    return {
      date,
      totalSentences: sentences.length,
      vocabularyLearned: Math.round(sentences.length * 0.4),
      quizScore: avgQuizScore,
      quizzesCompleted: quizActivities.length,
      estimatedLearningTimeMinutes: estimatedMinutes,
      currentStreak: streak ? streak.currentStreak : 0,
      sentences,
    };
  }

  /**
   * Retrieves paginated learning history
   */
  static async getHistory(
    userId: number,
    filter = 'all',
    page = 1,
    limit = 20,
    categoryId?: number,
    levelId?: number
  ) {
    const today = getTodayDateString();
    const offset = (page - 1) * limit;

    const whereClause: any = {
      userId,
      activityType: 'SENTENCE_COMPLETED',
    };

    if (filter === 'today') {
      whereClause.activityDate = today;
    } else if (filter === 'week') {
      const startOfWeek = getStartOfWeek();
      whereClause.activityDate = { [Op.gte]: startOfWeek };
    } else if (filter === 'month') {
      const [year, month] = today.split('-');
      whereClause.activityDate = { [Op.gte]: `${year}-${month}-01` };
    }

    const { count, rows } = await UserActivity.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Sentence,
          as: 'sentence',
          include: [
            { model: Category, as: 'category' },
            { model: Level, as: 'level' },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const formattedHistory = rows.map((r: any) => ({
      id: r.id,
      activityDate: r.activityDate,
      activityType: r.activityType,
      createdAt: r.createdAt,
      sentence: r.sentence,
    }));

    return {
      history: formattedHistory,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}
