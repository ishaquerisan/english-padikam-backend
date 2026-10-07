import { Router } from 'express';
import { ProgressController } from '../controllers/progressController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', ProgressController.getOverall);
router.get('/weekly', ProgressController.getWeekly);
router.get('/monthly', ProgressController.getMonthly);

export default router;
