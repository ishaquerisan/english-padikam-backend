import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ProgressService } from '../services/progressService';
import { ApiResponse } from '../utils/apiResponse';

export class ProgressController {
  static async getOverall(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const stats = await ProgressService.getUserStatistics(userId);
      ApiResponse.success(res, stats, 'Overall learning progress and stats');
    } catch (error) {
      next(error);
    }
  }

  static async getWeekly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const weekly = await ProgressService.getWeeklyProgress(userId);
      ApiResponse.success(res, weekly, 'Weekly learning progress');
    } catch (error) {
      next(error);
    }
  }

  static async getMonthly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const monthly = await ProgressService.getMonthlyProgress(userId);
      ApiResponse.success(res, monthly, 'Monthly learning progress');
    } catch (error) {
      next(error);
    }
  }
}
