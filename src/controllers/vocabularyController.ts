import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Vocabulary } from '../models/Vocabulary';
import { Sentence } from '../models/Sentence';
import { QuizService } from '../services/quizService';
import { BookmarkService } from '../services/bookmarkService';
import { ApiResponse } from '../utils/apiResponse';
import { Op } from 'sequelize';

export class VocabularyController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 30;
      const search = (req.query.search as string) || '';
      const offset = (page - 1) * limit;

      const whereClause: any = {};
      if (search) {
        whereClause[Op.or] = [
          { word: { [Op.like]: `%${search}%` } },
          { malayalamMeaning: { [Op.like]: `%${search}%` } },
          { englishMeaning: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Vocabulary.findAndCountAll({
        where: whereClause,
        order: [['word', 'ASC']],
        limit,
        offset,
      });

      ApiResponse.success(res, rows, 'Vocabulary list retrieved', 200, {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const vocab = await Vocabulary.findByPk(id, {
        include: [{ model: Sentence, as: 'sentences' }],
      });
      if (!vocab) {
        ApiResponse.error(res, 'Vocabulary not found', 404);
        return;
      }
      ApiResponse.success(res, vocab, 'Vocabulary word retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export class QuizController {
  static async getByLesson(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const lessonId = parseInt(req.params.lessonId as string, 10);
      const quizzes = await QuizService.getLessonQuizzes(lessonId);
      ApiResponse.success(res, quizzes, 'Lesson quizzes retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async submitQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const quizId = parseInt(req.params.quizId as string, 10);
      const { selectedOptionId } = req.body;
      const result = await QuizService.submitQuizAnswer(userId, quizId, selectedOptionId);
      ApiResponse.success(res, result, 'Quiz answer evaluated');
    } catch (error) {
      next(error);
    }
  }
}

export class BookmarkController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const bookmarks = await BookmarkService.getUserBookmarks(userId);
      ApiResponse.success(res, bookmarks, 'User bookmarks retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async addBookmark(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const sentenceId = parseInt(req.params.sentenceId as string, 10);
      const { note } = req.body;
      const bookmark = await BookmarkService.addBookmark(userId, sentenceId, note);
      ApiResponse.success(res, bookmark, 'Sentence bookmarked successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async removeBookmark(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const sentenceId = parseInt(req.params.sentenceId as string, 10);
      const removed = await BookmarkService.removeBookmark(userId, sentenceId);
      ApiResponse.success(res, { removed, sentenceId }, 'Bookmark removed successfully');
    } catch (error) {
      next(error);
    }
  }
}
