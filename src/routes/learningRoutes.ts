import { Router } from 'express';
import { LearningController } from '../controllers/learningController';
import { authenticate } from '../middleware/authMiddleware';
import { sentenceIdParamRule } from '../validators/learningValidators';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate);

router.get('/next', LearningController.getNext);
router.get('/today', LearningController.getToday);
router.post('/sentence/:sentenceId/start', sentenceIdParamRule, validateRequest, LearningController.startSentence);
router.post('/sentence/:sentenceId/complete', sentenceIdParamRule, validateRequest, LearningController.completeSentence);
router.post('/session/start', LearningController.startSession);
router.post('/session/end', LearningController.endSession);

export default router;
