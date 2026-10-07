import { Router } from 'express';
import { DailyController } from '../controllers/dailyController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/today', DailyController.getToday);
router.get('/:date', DailyController.getByDate);

export default router;
