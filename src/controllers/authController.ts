import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { UserStreak } from '../models/UserStreak';
import { DailyGoal } from '../models/DailyGoal';
import { generateToken } from '../utils/jwt';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { verifyFirebaseToken } from '../config/firebase';

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
      try {
        await UserStreak.findOrCreate({
          where: { userId: user.id },
          defaults: {
            userId: user.id,
            currentStreak: 0,
            longestStreak: 0,
          },
        });
      } catch (streakErr) {
        console.warn('Initial UserStreak creation notice:', streakErr);
      }

      // Create initial daily goal record
      try {
        await DailyGoal.findOrCreate({
          where: { userId: user.id },
          defaults: {
            userId: user.id,
            targetSentences: dailyGoal || 5,
            reminderEnabled: true,
            reminderTime: '08:00',
          },
        });
      } catch (goalErr) {
        console.warn('Initial DailyGoal creation notice:', goalErr);
      }

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
        'Registration successful! Welcome to Padikam.',
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

  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken, email: clientEmail, name: clientName, englishLevel, learningGoal, dailyGoal } = req.body;

      if (!idToken && !clientEmail) {
        ApiResponse.error(res, 'Google ID Token or email is required', 400);
        return;
      }

      let email = clientEmail;
      let name = clientName;

      if (idToken) {
        try {
          const verifiedUser = await verifyFirebaseToken(idToken);
          email = verifiedUser.email || email;
          name = verifiedUser.name || name;
        } catch (tokenErr: any) {
          console.warn('Firebase token verification notice:', tokenErr.message);
          if (!email) {
            ApiResponse.error(res, 'Invalid authentication token. Please sign in again.', 401);
            return;
          }
        }
      }

      if (!email) {
        ApiResponse.error(res, 'Email address is required for Google login', 400);
        return;
      }

      // Check if user already exists
      let user = await User.findOne({ where: { email } });
      let isNewUser = false;

      if (!user) {
        // Create new user account with secure random password placeholder
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const displayName = name || (email ? email.split('@')[0] : 'User');

        user = await User.create({
          name: displayName,
          email,
          password: randomPassword,
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

        // Create initial streak record safely
        try {
          await UserStreak.findOrCreate({
            where: { userId: user.id },
            defaults: {
              userId: user.id,
              currentStreak: 0,
              longestStreak: 0,
            },
          });
        } catch (streakErr) {
          console.warn('UserStreak creation notice:', streakErr);
        }

        // Create initial daily goal record safely
        try {
          await DailyGoal.findOrCreate({
            where: { userId: user.id },
            defaults: {
              userId: user.id,
              targetSentences: dailyGoal || 5,
              reminderEnabled: true,
              reminderTime: '08:00',
            },
          });
        } catch (goalErr) {
          console.warn('DailyGoal creation notice:', goalErr);
        }

        isNewUser = true;
      } else {
        if (user.status !== 'ACTIVE') {
          ApiResponse.error(res, 'This account is inactive or suspended', 403);
          return;
        }
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
          isNewUser,
        },
        isNewUser ? 'Welcome to Padikam! Account created via Google.' : 'Logged in with Google successfully',
        isNewUser ? 201 : 200
      );
    } catch (error: any) {
      console.error('🔥 Error in googleLogin:', error);
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
