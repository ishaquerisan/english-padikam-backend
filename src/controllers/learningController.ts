import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { LearningService } from '../services/learningService';
import { DailyService } from '../services/dailyService';
import { ApiResponse } from '../utils/apiResponse';

export class LearningController {
  static async getNext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const count = parseInt(req.query.count as string, 10) || 5;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
      const levelId = req.query.levelId ? parseInt(req.query.levelId as string, 10) : undefined;

      const sentences = await LearningService.getNextSentences(userId, count, categoryId, levelId);
      ApiResponse.success(res, sentences, 'Next recommended sentences for extra learning');
    } catch (error) {
      next(error);
    }
  }

  static async getToday(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await DailyService.getTodayDailyLesson(userId);
      ApiResponse.success(res, data, "Today's learning state");
    } catch (error) {
      next(error);
    }
  }

  static async startSentence(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const sentenceId = parseInt(req.params.sentenceId, 10);
      const result = await LearningService.startSentence(userId, sentenceId);
      ApiResponse.success(res, result, 'Sentence viewing started');
    } catch (error) {
      next(error);
    }
  }

  static async completeSentence(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const sentenceId = parseInt(req.params.sentenceId, 10);
      const result = await LearningService.completeSentence(userId, sentenceId);
      ApiResponse.success(res, result, 'Sentence completed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async startSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const session = await LearningService.startSession(userId);
      ApiResponse.success(res, session, 'Learning session started', 201);
    } catch (error) {
      next(error);
    }
  }

  static async endSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { sessionId, sentencesLearned, durationSeconds } = req.body;
      const session = await LearningService.endSession(
        userId,
        sessionId,
        sentencesLearned || 0,
        durationSeconds || 0
      );
      ApiResponse.success(res, session, 'Learning session ended');
    } catch (error) {
      next(error);
    }
  }
}
