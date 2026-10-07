import { Router } from 'express';
import { StreakController, GoalController } from '../controllers/streakController';
import { authenticate } from '../middleware/authMiddleware';
import { updateDailyGoalRule } from '../validators/learningValidators';
import { validateRequest } from '../middleware/validateRequest';

export const streakRouter = Router();
streakRouter.use(authenticate);
streakRouter.get('/', StreakController.getStreak);
streakRouter.get('/history', StreakController.getStreak);

export const goalRouter = Router();
goalRouter.use(authenticate);
goalRouter.get('/', GoalController.getGoals);
goalRouter.put('/', updateDailyGoalRule, validateRequest, GoalController.updateGoals);
