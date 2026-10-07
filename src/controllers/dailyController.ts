import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { DailyService } from '../services/dailyService';
import { ApiResponse } from '../utils/apiResponse';

export class DailyController {
  static async getToday(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await DailyService.getTodayDailyLesson(userId);
      ApiResponse.success(res, data, "Today's daily recommended sentences");
    } catch (error) {
      next(error);
    }
  }

  static async getByDate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { date } = req.params;
      const data = await DailyService.getTodayDailyLesson(userId, date);
      ApiResponse.success(res, data, `Daily sentences for ${date}`);
    } catch (error) {
      next(error);
    }
  }
}
