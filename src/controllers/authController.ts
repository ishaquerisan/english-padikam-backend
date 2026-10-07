import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { UserStreak } from '../models/UserStreak';
import { DailyGoal } from '../models/DailyGoal';
import { generateToken } from '../utils/jwt';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, englishLevel, learningGoal, dailyGoal } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        ApiResponse.error(res, 'An account with this email already exists', 400);
        return;
      }

      const user = await User.create({
        name,
        email,
        password,
        role: 'USER',
        nativeLanguage: 'Malayalam',
        englishLevel: englishLevel || 'Beginner',
        learningGoal: learningGoal || 'Daily Conversation',
        dailyGoal: dailyGoal || 5,
        currentStreak: 0,
        longestStreak: 0,
        totalSentencesLearned: 0,
        totalWordsLearned: 0,
        totalLearningDays: 0,
        status: 'ACTIVE',
      });

      // Create initial streak record
      await UserStreak.create({
        userId: user.id,
        currentStreak: 0,
        longestStreak: 0,
      });

      // Create initial daily goal record
      await DailyGoal.create({
        userId: user.id,
        targetSentences: dailyGoal || 5,
        reminderEnabled: true,
        reminderTime: '08:00',
      });

      const token = generateToken({
        id: user.id,
        email: user.id === 1 ? 'admin@englishmalayalam.com' : user.email,
        role: user.role,
      });

      ApiResponse.success(
        res,
        {
          token,
          user: user.toJSON(),
        },
        'Registration successful! Welcome to Angleyam.',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        ApiResponse.error(res, 'Invalid email or password', 401);
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        ApiResponse.error(res, 'Invalid email or password', 401);
        return;
      }

      if (user.status !== 'ACTIVE') {
        ApiResponse.error(res, 'This account is inactive or suspended', 403);
        return;
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      ApiResponse.success(
        res,
        {
          token,
          user: user.toJSON(),
        },
        'Logged in successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      const streak = await UserStreak.findOne({ where: { userId: req.user.id } });
      const dailyGoal = await DailyGoal.findOne({ where: { userId: req.user.id } });

      ApiResponse.success(
        res,
        {
          user: req.user.toJSON(),
          streak: streak ? { current: streak.currentStreak, longest: streak.longestStreak } : null,
          dailyGoal: dailyGoal ? dailyGoal.targetSentences : 5,
        },
        'User profile retrieved'
      );
    } catch (error) {
      next(error);
    }
  }
}
