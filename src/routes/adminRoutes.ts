import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';

const router = Router();

// Protect all admin routes with authentication and ADMIN role requirement
router.use(authenticate, requireAdmin);

router.get('/analytics', AdminController.getAnalytics);
router.get('/sentences', AdminController.getSentences);
router.post('/sentences', AdminController.createSentence);
router.put('/sentences/:id', AdminController.updateSentence);
router.delete('/sentences/:id', AdminController.deleteSentence);

router.get('/users', AdminController.getUsers);
router.put('/users/:id', AdminController.updateUser);

router.get('/categories', AdminController.getCategories);
router.get('/levels', AdminController.getLevels);
router.get('/lessons', AdminController.getLessons);
router.post('/lessons', AdminController.createLesson);
router.put('/lessons/:id', AdminController.updateLesson);
router.delete('/lessons/:id', AdminController.deleteLesson);

router.get('/quizzes', AdminController.getQuizzes);
router.post('/quizzes', AdminController.createQuiz);
router.put('/quizzes/:id', AdminController.updateQuiz);
router.delete('/quizzes/:id', AdminController.deleteQuiz);

router.get('/vocabulary', AdminController.getVocabularies);
router.post('/vocabulary', AdminController.createVocabulary);
router.put('/vocabulary/:id', AdminController.updateVocabulary);
router.delete('/vocabulary/:id', AdminController.deleteVocabulary);

export default router;


