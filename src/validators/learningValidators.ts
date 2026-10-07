import { body, param, query } from 'express-validator';

export const sentenceIdParamRule = [
  param('sentenceId').isInt({ min: 1 }).withMessage('Valid sentence ID is required'),
];

export const updateDailyGoalRule = [
  body('targetSentences')
    .isInt({ min: 1, max: 100 })
    .withMessage('Target sentences must be a positive integer between 1 and 100'),
  body('reminderEnabled').optional().isBoolean(),
  body('reminderTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Time must be in HH:MM format (24hr)'),
];

export const quizSubmissionRule = [
  param('quizId').isInt({ min: 1 }).withMessage('Valid quiz ID is required'),
  body('selectedOptionId').isInt({ min: 1 }).withMessage('Valid selected option ID is required'),
];

export const calendarQueryRule = [
  query('year').optional().isInt({ min: 2020, max: 2050 }).withMessage('Year must be valid'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
];
