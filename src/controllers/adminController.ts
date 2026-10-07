import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AdminService } from '../services/adminService';
import { ApiResponse } from '../utils/apiResponse';
import { Category, Level, Lesson, Quiz, Vocabulary } from '../models';


export class AdminController {
  static async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await AdminService.getDashboardAnalytics();
      ApiResponse.success(res, analytics, 'Admin analytics metrics');
    } catch (error) {
      next(error);
    }
  }

  static async getSentences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = (req.query.search as string) || '';
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
      const levelId = req.query.levelId ? parseInt(req.query.levelId as string, 10) : undefined;
      const lessonId = req.query.lessonId ? parseInt(req.query.lessonId as string, 10) : undefined;
      const status = req.query.status as string;

      const result = await AdminService.getSentences(page, limit, search, categoryId, levelId, status, lessonId);
      ApiResponse.success(res, result.sentences, 'Sentences retrieved', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async createSentence(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sentence = await AdminService.createSentence(req.body);
      ApiResponse.success(res, sentence, 'Sentence created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateSentence(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const sentence = await AdminService.updateSentence(id, req.body);
      ApiResponse.success(res, sentence, 'Sentence updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteSentence(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      await AdminService.deleteSentence(id);
      ApiResponse.success(res, { id }, 'Sentence deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = (req.query.search as string) || '';
      const role = req.query.role as string;
      const status = req.query.status as string;
      const englishLevel = req.query.englishLevel as string;

      const result = await AdminService.getUsers(page, limit, search, role, status, englishLevel);
      ApiResponse.success(res, result.users, 'Users list retrieved', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const user = await AdminService.updateUser(id, req.body);
      ApiResponse.success(res, user.toJSON(), 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const categories = await Category.findAll({ order: [['orderNumber', 'ASC']] });
      ApiResponse.success(res, categories, 'Categories retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getLevels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const levels = await Level.findAll({ order: [['orderNumber', 'ASC']] });
      ApiResponse.success(res, levels, 'Levels retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getLessons(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = (req.query.search as string) || '';
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
      const levelId = req.query.levelId ? parseInt(req.query.levelId as string, 10) : undefined;
      const status = req.query.status as string;

      const result = await AdminService.getLessons(page, limit, search, categoryId, levelId, status);
      ApiResponse.success(res, result.lessons, 'Lessons retrieved', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async createLesson(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const lesson = await AdminService.createLesson(req.body);
      ApiResponse.success(res, lesson, 'Lesson created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateLesson(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const lesson = await AdminService.updateLesson(id, req.body);
      ApiResponse.success(res, lesson, 'Lesson updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteLesson(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      await AdminService.deleteLesson(id);
      ApiResponse.success(res, { id }, 'Lesson deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getQuizzes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = (req.query.search as string) || '';
      const lessonId = req.query.lessonId ? parseInt(req.query.lessonId as string, 10) : undefined;
      const questionType = req.query.questionType as string;

      const result = await AdminService.getQuizzes(page, limit, search, lessonId, questionType);
      ApiResponse.success(res, result.quizzes, 'Quizzes retrieved', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async createQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const quiz = await AdminService.createQuiz(req.body);
      ApiResponse.success(res, quiz, 'Quiz created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const quiz = await AdminService.updateQuiz(id, req.body);
      ApiResponse.success(res, quiz, 'Quiz updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      await AdminService.deleteQuiz(id);
      ApiResponse.success(res, { id }, 'Quiz deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getVocabularies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = (req.query.search as string) || '';
      const partOfSpeech = req.query.partOfSpeech as string;

      const result = await AdminService.getVocabularies(page, limit, search, partOfSpeech);
      ApiResponse.success(res, result.vocabularies, 'Vocabularies retrieved', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async createVocabulary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const word = await AdminService.createVocabulary(req.body);
      ApiResponse.success(res, word, 'Vocabulary created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateVocabulary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const word = await AdminService.updateVocabulary(id, req.body);
      ApiResponse.success(res, word, 'Vocabulary updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteVocabulary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      await AdminService.deleteVocabulary(id);
      ApiResponse.success(res, { id }, 'Vocabulary deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
