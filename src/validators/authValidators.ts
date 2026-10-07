import { body } from 'express-validator';

export const registerValidationRules = [
  body('name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 120 }),
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('englishLevel')
    .optional()
    .isIn(['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced'])
    .withMessage('Invalid English level selected'),
  body('dailyGoal')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Daily goal must be a valid positive number'),
];

export const loginValidationRules = [
  body('email').trim().isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileValidationRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('englishLevel').optional().isIn(['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced']),
  body('learningGoal').optional().trim().notEmpty(),
  body('dailyGoal').optional().isInt({ min: 1, max: 100 }),
];
