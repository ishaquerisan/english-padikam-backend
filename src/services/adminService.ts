import { Op } from 'sequelize';
import {
  User,
  Sentence,
  Lesson,
  Category,
  Level,
  Vocabulary,
  Quiz,
  QuizOption,
  UserActivity,
  UserSentenceProgress,
} from '../models';
import { getTodayDateString, getStartOfWeek } from '../utils/dateUtils';


export class AdminService {
  /**
   * Retrieves high-level analytics dashboard metrics
   */
  static async getDashboardAnalytics() {
    const today = getTodayDateString();
    const startOfWeek = getStartOfWeek();
    const [year, month] = today.split('-');
    const startOfMonth = `${year}-${month}-01`;

    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'ACTIVE' } });
    const totalSentences = await Sentence.count();
    const totalLessons = await Lesson.count();
    const totalVocabulary = await Vocabulary.count();
    const totalQuizzes = await Quiz.count();

    // Active Learners: DAU, WAU, MAU
    const dauActivities = await UserActivity.findAll({
      where: { activityDate: today },
      attributes: ['userId'],
      group: ['userId'],
    });
    const dau = dauActivities.length;

    const wauActivities = await UserActivity.findAll({
      where: { activityDate: { [Op.gte]: startOfWeek } },
      attributes: ['userId'],
      group: ['userId'],
    });
    const wau = wauActivities.length;

    const mauActivities = await UserActivity.findAll({
      where: { activityDate: { [Op.gte]: startOfMonth } },
      attributes: ['userId'],
      group: ['userId'],
    });
    const mau = mauActivities.length;

    const totalLearningActivities = await UserActivity.count({
      where: { activityType: 'SENTENCE_COMPLETED' },
    });

    const categoryStats = await Category.findAll({
      attributes: ['id', 'name', 'malayalamName'],
      include: [
        { model: Sentence, as: 'sentences', attributes: ['id'] },
      ],
    });

    const categoriesFormatted = categoryStats.map((c: any) => ({
      id: c.id,
      name: c.name,
      malayalamName: c.malayalamName,
      sentenceCount: c.sentences ? c.sentences.length : 0,
    }));

    return {
      overview: {
        totalUsers,
        activeUsers,
        totalSentences,
        totalLessons,
        totalVocabulary,
        totalQuizzes,
        todayActiveLearners: dau,
        totalSentencesLearned: totalLearningActivities,
      },
      engagement: {
        dau,
        wau,
        mau,
        goalCompletionRate: totalUsers > 0 ? Math.round((dau / totalUsers) * 100) : 0,
      },
      categoryDistribution: categoriesFormatted,
    };
  }

  /**
   * Sentence Management with filtering, search, and pagination
   */
  static async getSentences(
    page = 1,
    limit = 20,
    search = '',
    categoryId?: number,
    levelId?: number,
    status?: string,
    lessonId?: number
  ) {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { englishText: { [Op.like]: `%${search}%` } },
        { malayalamText: { [Op.like]: `%${search}%` } },
        { pronunciation: { [Op.like]: `%${search}%` } },
      ];
    }

    if (categoryId) whereClause.categoryId = categoryId;
    if (levelId) whereClause.levelId = levelId;
    if (lessonId) whereClause.lessonId = lessonId;
    if (status) whereClause.status = status;

    const { count, rows } = await Sentence.findAndCountAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category' },
        { model: Level, as: 'level' },
        { model: Lesson, as: 'lesson' },
      ],
      order: [['id', 'DESC']],
      limit,
      offset,
    });

    return {
      sentences: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Creates a new sentence
   */
  static async createSentence(data: any) {
    return Sentence.create(data);
  }

  /**
   * Updates an existing sentence
   */
  static async updateSentence(id: number, data: any) {
    const sentence = await Sentence.findByPk(id);
    if (!sentence) throw new Error('Sentence not found');
    return sentence.update(data);
  }

  /**
   * Deletes or deactivates a sentence
   */
  static async deleteSentence(id: number) {
    const sentence = await Sentence.findByPk(id);
    if (!sentence) throw new Error('Sentence not found');
    await sentence.destroy();
    return true;
  }

  /**
   * User management with search (name, email) and filters (role, status, englishLevel)
   */
  static async getUsers(
    page = 1,
    limit = 20,
    search = '',
    role?: string,
    status?: string,
    englishLevel?: string
  ) {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role) whereClause.role = role;
    if (status) whereClause.status = status;
    if (englishLevel) whereClause.englishLevel = englishLevel;

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      users: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Updates user role, status, or details
   */
  static async updateUser(userId: number, data: any) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    return user.update(data);
  }

  /**
   * Lessons management with search and filter
   */
  static async getLessons(
    page = 1,
    limit = 20,
    search = '',
    categoryId?: number,
    levelId?: number,
    status?: string
  ) {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { malayalamTitle: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (categoryId) whereClause.categoryId = categoryId;
    if (levelId) whereClause.levelId = levelId;
    if (status) whereClause.status = status;

    const { count, rows } = await Lesson.findAndCountAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category' },
        { model: Level, as: 'level' },
      ],
      order: [['lessonNumber', 'ASC']],
      limit,
      offset,
    });

    return {
      lessons: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async createLesson(data: any) {
    return Lesson.create(data);
  }

  static async updateLesson(id: number, data: any) {
    const lesson = await Lesson.findByPk(id);
    if (!lesson) throw new Error('Lesson not found');
    return lesson.update(data);
  }

  static async deleteLesson(id: number) {
    const lesson = await Lesson.findByPk(id);
    if (!lesson) throw new Error('Lesson not found');
    await lesson.destroy();
    return true;
  }

  /**
   * Quizzes management with search, lesson filter, and type filter
   */
  static async getQuizzes(
    page = 1,
    limit = 20,
    search = '',
    lessonId?: number,
    questionType?: string
  ) {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { question: { [Op.like]: `%${search}%` } },
        { malayalamQuestion: { [Op.like]: `%${search}%` } },
        { explanation: { [Op.like]: `%${search}%` } },
      ];
    }

    if (lessonId) whereClause.lessonId = lessonId;
    if (questionType) whereClause.questionType = questionType;

    const { count, rows } = await Quiz.findAndCountAll({
      where: whereClause,
      include: [
        { model: Lesson, as: 'lesson' },
        { model: QuizOption, as: 'options' },
      ],
      order: [['id', 'DESC']],
      limit,
      offset,
    });

    return {
      quizzes: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async createQuiz(data: any) {
    const { options, ...quizData } = data;
    const quiz = await Quiz.create(quizData);
    if (options && Array.isArray(options) && options.length > 0) {
      const optionsWithQuizId = options.map((opt: any, index: number) => ({
        ...opt,
        quizId: quiz.id,
        orderNumber: opt.orderNumber || index + 1,
      }));
      await QuizOption.bulkCreate(optionsWithQuizId);
    }
    return Quiz.findByPk(quiz.id, {
      include: [
        { model: Lesson, as: 'lesson' },
        { model: QuizOption, as: 'options' },
      ],
    });
  }

  static async updateQuiz(id: number, data: any) {
    const quiz = await Quiz.findByPk(id);
    if (!quiz) throw new Error('Quiz not found');

    const { options, ...quizData } = data;
    await quiz.update(quizData);

    if (options && Array.isArray(options)) {
      await QuizOption.destroy({ where: { quizId: id } });
      const optionsWithQuizId = options.map((opt: any, index: number) => ({
        ...opt,
        quizId: id,
        orderNumber: opt.orderNumber || index + 1,
      }));
      await QuizOption.bulkCreate(optionsWithQuizId);
    }

    return Quiz.findByPk(id, {
      include: [
        { model: Lesson, as: 'lesson' },
        { model: QuizOption, as: 'options' },
      ],
    });
  }

  static async deleteQuiz(id: number) {
    const quiz = await Quiz.findByPk(id);
    if (!quiz) throw new Error('Quiz not found');
    await quiz.destroy();
    return true;
  }

  /**
   * Vocabulary management
   */
  static async getVocabularies(
    page = 1,
    limit = 20,
    search = '',
    partOfSpeech?: string
  ) {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { word: { [Op.like]: `%${search}%` } },
        { malayalamMeaning: { [Op.like]: `%${search}%` } },
        { englishMeaning: { [Op.like]: `%${search}%` } },
        { phonetic: { [Op.like]: `%${search}%` } },
      ];
    }

    if (partOfSpeech) whereClause.partOfSpeech = partOfSpeech;

    const { count, rows } = await Vocabulary.findAndCountAll({
      where: whereClause,
      order: [['word', 'ASC']],
      limit,
      offset,
    });

    return {
      vocabularies: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async createVocabulary(data: any) {
    return Vocabulary.create(data);
  }

  static async updateVocabulary(id: number, data: any) {
    const word = await Vocabulary.findByPk(id);
    if (!word) throw new Error('Vocabulary word not found');
    return word.update(data);
  }

  static async deleteVocabulary(id: number) {
    const word = await Vocabulary.findByPk(id);
    if (!word) throw new Error('Vocabulary word not found');
    await word.destroy();
    return true;
  }
}
