import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ActivityService } from '../services/activityService';
import { ApiResponse } from '../utils/apiResponse';

export class ActivityController {
  static async getCalendar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;

      const calendar = await ActivityService.getCalendar(userId, year, month);
      ApiResponse.success(res, calendar, 'Activity calendar retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const filter = (req.query.filter as string) || 'all';
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
      const levelId = req.query.levelId ? parseInt(req.query.levelId as string, 10) : undefined;

      const historyData = await ActivityService.getHistory(userId, filter, page, limit, categoryId, levelId);
      ApiResponse.success(res, historyData.history, 'Learning history retrieved', 200, historyData.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getDayDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const date = req.params.date as string;
      const dayData = await ActivityService.getDayDetail(userId, date);
      ApiResponse.success(res, dayData, `Learning details for ${date}`);
    } catch (error) {
      next(error);
    }
  }
}
