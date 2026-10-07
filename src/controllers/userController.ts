import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ApiResponse } from '../utils/apiResponse';
import { DailyGoal } from '../models/DailyGoal';

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const dailyGoal = await DailyGoal.findOne({ where: { userId: user.id } });

      ApiResponse.success(
        res,
        {
          ...user.toJSON(),
          dailyGoalConfig: dailyGoal,
        },
        'Profile retrieved'
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { name, englishLevel, learningGoal, dailyGoal } = req.body;

      if (name) user.name = name;
      if (englishLevel) user.englishLevel = englishLevel;
      if (learningGoal) user.learningGoal = learningGoal;
      if (dailyGoal) {
        user.dailyGoal = dailyGoal;
        await DailyGoal.upsert({
          userId: user.id,
          targetSentences: dailyGoal,
        });
      }

      await user.save();

      ApiResponse.success(res, user.toJSON(), 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
