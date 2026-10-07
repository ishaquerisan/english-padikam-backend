import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { updateProfileValidationRules } from '../validators/authValidators';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.put('/profile', updateProfileValidationRules, validateRequest, UserController.updateProfile);

export default router;
