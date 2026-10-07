import { Transaction } from 'sequelize';
import { User } from '../models/User';
import { UserStreak } from '../models/UserStreak';
import { getTodayDateString, isConsecutiveDay, isSameDay } from '../utils/dateUtils';

export class StreakService {
  /**
   * Updates user streak based on meaningful learning activity on a calendar date (Asia/Kolkata)
   */
  static async updateStreakOnActiveLearning(
    userId: number,
    transaction?: Transaction
  ): Promise<{ currentStreak: number; longestStreak: number; isNewDay: boolean }> {
    const today = getTodayDateString();

    let userStreak = await UserStreak.findOne({
      where: { userId },
      transaction,
    });

    if (!userStreak) {
      userStreak = await UserStreak.create(
        {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
        },
        { transaction }
      );

      // Update User table summary
      await User.update(
        {
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
        },
        { where: { id: userId }, transaction }
      );

      return { currentStreak: 1, longestStreak: 1, isNewDay: true };
    }

    const lastActive = userStreak.lastActiveDate;

    // Scenario 2: Same day activity - streak unchanged
    if (lastActive && isSameDay(lastActive, today)) {
      return {
        currentStreak: userStreak.currentStreak,
        longestStreak: userStreak.longestStreak,
        isNewDay: false,
      };
    }

    let newCurrentStreak = 1;

    // Scenario 3: Next consecutive calendar day - increment streak
    if (lastActive && isConsecutiveDay(lastActive, today)) {
      newCurrentStreak = userStreak.currentStreak + 1;
    } else {
      // Scenario 1 & 4: First active day or skipped one/more days - reset to 1
      newCurrentStreak = 1;
    }

    const newLongestStreak = Math.max(userStreak.longestStreak, newCurrentStreak);

    // Save streak
    userStreak.currentStreak = newCurrentStreak;
    userStreak.longestStreak = newLongestStreak;
    userStreak.lastActiveDate = today;
    await userStreak.save({ transaction });

    // Sync to User model
    const user = await User.findByPk(userId, { transaction });
    if (user) {
      user.currentStreak = newCurrentStreak;
      user.longestStreak = newLongestStreak;
      user.lastActiveDate = today;
      // Increment totalLearningDays if new active day
      user.totalLearningDays = (user.totalLearningDays || 0) + 1;
      await user.save({ transaction });
    }

    return {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      isNewDay: true,
    };
  }

  /**
   * Retrieves streak info for user
   */
  static async getUserStreak(userId: number): Promise<UserStreak | null> {
    return UserStreak.findOne({ where: { userId } });
  }
}
