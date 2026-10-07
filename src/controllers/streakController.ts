import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { StreakService } from '../services/streakService';
import { DailyGoal } from '../models/DailyGoal';
import { ApiResponse } from '../utils/apiResponse';

export class StreakController {
  static async getStreak(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const streak = await StreakService.getUserStreak(userId);
      ApiResponse.success(
        res,
        {
          currentStreak: streak ? streak.currentStreak : req.user!.currentStreak,
          longestStreak: streak ? streak.longestStreak : req.user!.longestStreak,
          lastActiveDate: streak ? streak.lastActiveDate : req.user!.lastActiveDate,
        },
        'Streak information retrieved'
      );
    } catch (error) {
      next(error);
    }
  }
}

export class GoalController {
  static async getGoals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      let goal = await DailyGoal.findOne({ where: { userId } });
      if (!goal) {
        goal = await DailyGoal.create({
          userId,
          targetSentences: req.user!.dailyGoal || 5,
          reminderEnabled: true,
          reminderTime: '08:00',
        });
      }
      ApiResponse.success(res, goal, 'Daily goal configuration retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateGoals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { targetSentences, reminderEnabled, reminderTime } = req.body;

      let goal = await DailyGoal.findOne({ where: { userId } });
      if (!goal) {
        goal = await DailyGoal.create({
          userId,
          targetSentences: targetSentences || 5,
          reminderEnabled: reminderEnabled !== undefined ? reminderEnabled : true,
          reminderTime: reminderTime || '08:00',
        });
      } else {
        if (targetSentences !== undefined) goal.targetSentences = targetSentences;
        if (reminderEnabled !== undefined) goal.reminderEnabled = reminderEnabled;
        if (reminderTime !== undefined) goal.reminderTime = reminderTime;
        await goal.save();
      }

      // Update user's default dailyGoal as well
      req.user!.dailyGoal = goal.targetSentences;
      await req.user!.save();

      ApiResponse.success(res, goal, 'Daily goal updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
