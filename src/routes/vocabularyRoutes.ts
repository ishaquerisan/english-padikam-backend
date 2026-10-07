import { Router } from 'express';
import { VocabularyController, QuizController, BookmarkController } from '../controllers/vocabularyController';
import { authenticate } from '../middleware/authMiddleware';
import { quizSubmissionRule, sentenceIdParamRule } from '../validators/learningValidators';
import { validateRequest } from '../middleware/validateRequest';

export const vocabularyRouter = Router();
vocabularyRouter.use(authenticate);
vocabularyRouter.get('/', VocabularyController.getAll);
vocabularyRouter.get('/:id', VocabularyController.getById);

export const quizRouter = Router();
quizRouter.use(authenticate);
quizRouter.get('/:lessonId', QuizController.getByLesson);
quizRouter.post('/:quizId/submit', quizSubmissionRule, validateRequest, QuizController.submitQuiz);

export const bookmarkRouter = Router();
bookmarkRouter.use(authenticate);
bookmarkRouter.get('/', BookmarkController.getAll);
bookmarkRouter.post('/:sentenceId', sentenceIdParamRule, validateRequest, BookmarkController.addBookmark);
bookmarkRouter.delete('/:sentenceId', sentenceIdParamRule, validateRequest, BookmarkController.removeBookmark);
