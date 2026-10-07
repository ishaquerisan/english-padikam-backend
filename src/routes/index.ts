import { Router, Request, Response, NextFunction } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import dailyRoutes from './dailyRoutes';
import learningRoutes from './learningRoutes';
import activityRoutes from './activityRoutes';
import progressRoutes from './progressRoutes';
import { streakRouter, goalRouter } from './streakRoutes';
import { vocabularyRouter, quizRouter, bookmarkRouter } from './vocabularyRoutes';
import adminRoutes from './adminRoutes';
import { Category } from '../models/Category';
import { Level } from '../models/Level';
import { ApiResponse } from '../utils/apiResponse';

const router = Router();

// Public / Authenticated Core Metadata Routes
router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.findAll({
      where: { status: 'ACTIVE' },
      order: [['orderNumber', 'ASC'], ['name', 'ASC']],
    });
    ApiResponse.success(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    next(error);
  }
});

router.get('/levels', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const levels = await Level.findAll({
      order: [['orderNumber', 'ASC']],
    });
    ApiResponse.success(res, levels, 'Levels retrieved successfully');
  } catch (error) {
    next(error);
  }
});

// Feature Routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/daily', dailyRoutes);
router.use('/learning', learningRoutes);
router.use('/activity', activityRoutes);
router.use('/progress', progressRoutes);
router.use('/streak', streakRouter);
router.use('/goals', goalRouter);
router.use('/vocabulary', vocabularyRouter);
router.use('/quizzes', quizRouter);
router.use('/bookmarks', bookmarkRouter);
router.use('/admin', adminRoutes);

export default router;
