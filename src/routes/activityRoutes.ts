import { Router } from 'express';
import { ActivityController } from '../controllers/activityController';
import { authenticate } from '../middleware/authMiddleware';
import { calendarQueryRule } from '../validators/learningValidators';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate);

router.get('/calendar', calendarQueryRule, validateRequest, ActivityController.getCalendar);
router.get('/history', ActivityController.getHistory);
router.get('/day/:date', ActivityController.getDayDetail);

export default router;
