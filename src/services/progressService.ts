import { Op } from 'sequelize';
import { UserActivity } from '../models/UserActivity';
import { User } from '../models/User';
import { UserStreak } from '../models/UserStreak';
import { UserVocabulary } from '../models/UserVocabulary';
import { getTodayDateString, getStartOfWeek } from '../utils/dateUtils';

export class ProgressService {
  /**
   * Calculates 7-day weekly breakdown from Monday to Sunday
   */
  static async getWeeklyProgress(userId: number) {
    const mondayStr = getStartOfWeek();
    const mondayDate = new Date(mondayStr + 'T00:00:00Z');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weekData: { day: string; date: string; sentences: number; isActive: boolean }[] = [];

    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayDate);
      d.setUTCDate(mondayDate.getUTCDate() + i);
      const dStr = d.toISOString().split('T')[0];
      weekDates.push(dStr);
    }

    const activities = await UserActivity.findAll({
      where: {
        userId,
        activityDate: {
          [Op.in]: weekDates,
        },
        activityType: 'SENTENCE_COMPLETED',
      },
    });

    const countByDate = new Map<string, number>();
    activities.forEach((act) => {
      countByDate.set(act.activityDate, (countByDate.get(act.activityDate) || 0) + 1);
    });

    let totalSentences = 0;
    let activeDays = 0;

    for (let i = 0; i < 7; i++) {
      const dStr = weekDates[i];
      const count = countByDate.get(dStr) || 0;
      totalSentences += count;
      if (count > 0) activeDays++;

      weekData.push({
        day: days[i],
        date: dStr,
        sentences: count,
        isActive: count > 0,
      });
    }

    const averagePerDay = Math.round((totalSentences / 7) * 10) / 10;

    return {
      startDate: weekDates[0],
      endDate: weekDates[6],
      totalSentences,
      averagePerDay,
      activeDays,
      totalDays: 7,
      breakdown: weekData,
    };
  }

  /**
   * Calculates monthly summary metrics
   */
  static async getMonthlyProgress(userId: number) {
    const today = getTodayDateString();
    const [year, month] = today.split('-');
    const startDate = `${year}-${month}-01`;

    const activities = await UserActivity.findAll({
      where: {
        userId,
        activityDate: {
          [Op.gte]: startDate,
        },
      },
    });

    const userStreak = await UserStreak.findOne({ where: { userId } });

    let totalSentences = 0;
    const dailyCountMap = new Map<string, number>();
    const quizScores: number[] = [];

    activities.forEach((act) => {
      if (act.activityType === 'SENTENCE_COMPLETED') {
        totalSentences++;
        dailyCountMap.set(act.activityDate, (dailyCountMap.get(act.activityDate) || 0) + 1);
      } else if (act.activityType === 'QUIZ_COMPLETED' && act.metadata && (act.metadata as any).score !== undefined) {
        quizScores.push((act.metadata as any).score);
      }
    });

    const activeDays = dailyCountMap.size;
    let bestDayCount = 0;
    let bestDayDate = '';

    dailyCountMap.forEach((count, date) => {
      if (count > bestDayCount) {
        bestDayCount = count;
        bestDayDate = date;
      }
    });

    const currentDayOfMonth = parseInt(today.split('-')[2], 10);
    const averageDaily = Math.round((totalSentences / Math.max(1, currentDayOfMonth)) * 10) / 10;
    const quizAverage = quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : null;

    return {
      month: `${year}-${month}`,
      totalSentences,
      activeDays,
      averageDailyLearning: averageDaily,
      bestLearningDay: {
        date: bestDayDate || today,
        sentences: bestDayCount,
      },
      longestStreak: userStreak ? userStreak.longestStreak : 0,
      quizAverage,
    };
  }

  /**
   * Retrieves full aggregated statistics for user dashboard
   */
  static async getUserStatistics(userId: number) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const streak = await UserStreak.findOne({ where: { userId } });

    const totalWordsLearned = await UserVocabulary.count({ where: { userId } });

    const quizActivities = await UserActivity.findAll({
      where: {
        userId,
        activityType: 'QUIZ_COMPLETED',
      },
    });

    const quizScores: number[] = [];
    quizActivities.forEach((q) => {
      if (q.metadata && (q.metadata as any).score !== undefined) {
        quizScores.push((q.metadata as any).score);
      }
    });

    const averageQuizScore = quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : 85;

    const totalLearningDays = Math.max(1, user.totalLearningDays || 1);
    const totalSentences = user.totalSentencesLearned || 0;
    const avgDailySentences = Math.round((totalSentences / totalLearningDays) * 10) / 10;

    // Estimate learning time: 1.5 mins per sentence + 3 mins per quiz
    const totalMinutes = Math.round(totalSentences * 1.5 + quizActivities.length * 3);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const estimatedTimeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return {
      totalSentencesLearned: totalSentences,
      totalLearningDays: user.totalLearningDays || 0,
      currentStreak: streak ? streak.currentStreak : user.currentStreak,
      longestStreak: streak ? streak.longestStreak : user.longestStreak,
      totalWordsLearned: Math.max(totalWordsLearned, Math.round(totalSentences * 0.4)),
      averageDailySentences: avgDailySentences,
      totalQuizzes: quizActivities.length,
      averageQuizScore,
      estimatedLearningTime: estimatedTimeString,
      estimatedMinutes: totalMinutes,
    };
  }
}
