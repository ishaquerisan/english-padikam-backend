import { Quiz } from '../models/Quiz';
import { QuizOption } from '../models/QuizOption';
import { Lesson } from '../models/Lesson';
import { UserActivity } from '../models/UserActivity';
import { UserLesson } from '../models/UserLesson';
import { getTodayDateString } from '../utils/dateUtils';

export class QuizService {
  /**
   * Fetches quizzes for a lesson
   */
  static async getLessonQuizzes(lessonId: number) {
    const quizzes = await Quiz.findAll({
      where: { lessonId },
      include: [
        {
          model: QuizOption,
          as: 'options',
          attributes: ['id', 'optionText', 'malayalamText', 'orderNumber'], // Do not expose isCorrect directly
        },
      ],
      order: [
        ['orderNumber', 'ASC'],
        [{ model: QuizOption, as: 'options' }, 'orderNumber', 'ASC'],
      ],
    });

    return quizzes;
  }

  /**
   * Evaluates quiz submission
   */
  static async submitQuizAnswer(userId: number, quizId: number, selectedOptionId: number) {
    const today = getTodayDateString();

    const quiz = await Quiz.findByPk(quizId, {
      include: [{ model: QuizOption, as: 'options' }],
    });

    if (!quiz) throw new Error('Quiz question not found');

    const selectedOption = (quiz as any).options.find((o: any) => o.id === selectedOptionId);
    const correctOption = (quiz as any).options.find((o: any) => o.isCorrect);

    if (!selectedOption) throw new Error('Invalid option selected');

    const isCorrect = selectedOption.isCorrect;

    // Log Activity
    await UserActivity.create({
      userId,
      activityDate: today,
      activityType: 'QUIZ_COMPLETED',
      lessonId: quiz.lessonId,
      metadata: {
        quizId,
        isCorrect,
        score: isCorrect ? 100 : 0,
      },
    });

    return {
      quizId,
      isCorrect,
      selectedOptionId,
      correctOptionId: correctOption ? correctOption.id : null,
      explanation: quiz.explanation,
    };
  }
}
