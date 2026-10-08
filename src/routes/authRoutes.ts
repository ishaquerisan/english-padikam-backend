import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { registerValidationRules, loginValidationRules } from '../validators/authValidators';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registerValidationRules, validateRequest, AuthController.register);
router.post('/login', loginValidationRules, validateRequest, AuthController.login);
router.post('/google', AuthController.googleLogin);
router.post('/firebase', AuthController.googleLogin);
router.get('/me', authenticate, AuthController.me);

export default router;
