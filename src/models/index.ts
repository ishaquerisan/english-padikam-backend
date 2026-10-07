import { sequelize } from '../config/database';
import { User } from './User';
import { Category } from './Category';
import { Level } from './Level';
import { Lesson } from './Lesson';
import { Sentence } from './Sentence';
import { Vocabulary } from './Vocabulary';
import { SentenceVocabulary } from './SentenceVocabulary';
import { Quiz } from './Quiz';
import { QuizOption } from './QuizOption';
import { UserLesson } from './UserLesson';
import { UserSentenceProgress } from './UserSentenceProgress';
import { UserVocabulary } from './UserVocabulary';
import { UserStreak } from './UserStreak';
import { UserActivity } from './UserActivity';
import { UserLearningSession } from './UserLearningSession';
import { DailyGoal } from './DailyGoal';
import { Bookmark } from './Bookmark';

// ==========================================
// ASSOCIATIONS
// ==========================================

// User Associations
User.hasMany(UserLesson, { foreignKey: 'userId', as: 'userLessons', onDelete: 'CASCADE' });
UserLesson.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(UserSentenceProgress, { foreignKey: 'userId', as: 'sentenceProgresses', onDelete: 'CASCADE' });
UserSentenceProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(UserVocabulary, { foreignKey: 'userId', as: 'userVocabularies', onDelete: 'CASCADE' });
UserVocabulary.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(UserStreak, { foreignKey: 'userId', as: 'streak', onDelete: 'CASCADE' });
UserStreak.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(UserActivity, { foreignKey: 'userId', as: 'activities', onDelete: 'CASCADE' });
UserActivity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(UserLearningSession, { foreignKey: 'userId', as: 'sessions', onDelete: 'CASCADE' });
UserLearningSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(DailyGoal, { foreignKey: 'userId', as: 'dailyGoalConfig', onDelete: 'CASCADE' });
DailyGoal.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Bookmark, { foreignKey: 'userId', as: 'bookmarks', onDelete: 'CASCADE' });
Bookmark.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Category Associations
Category.hasMany(Lesson, { foreignKey: 'categoryId', as: 'lessons', onDelete: 'RESTRICT' });
Lesson.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Category.hasMany(Sentence, { foreignKey: 'categoryId', as: 'sentences', onDelete: 'RESTRICT' });
Sentence.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Level Associations
Level.hasMany(Lesson, { foreignKey: 'levelId', as: 'lessons', onDelete: 'RESTRICT' });
Lesson.belongsTo(Level, { foreignKey: 'levelId', as: 'level' });

Level.hasMany(Sentence, { foreignKey: 'levelId', as: 'sentences', onDelete: 'RESTRICT' });
Sentence.belongsTo(Level, { foreignKey: 'levelId', as: 'level' });

// Lesson Associations
Lesson.hasMany(Sentence, { foreignKey: 'lessonId', as: 'sentences', onDelete: 'CASCADE' });
Sentence.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

Lesson.hasMany(Quiz, { foreignKey: 'lessonId', as: 'quizzes', onDelete: 'CASCADE' });
Quiz.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

Lesson.hasMany(UserLesson, { foreignKey: 'lessonId', as: 'userLessons', onDelete: 'CASCADE' });
UserLesson.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

// Sentence & Vocabulary Many-to-Many
Sentence.belongsToMany(Vocabulary, {
  through: SentenceVocabulary,
  foreignKey: 'sentenceId',
  otherKey: 'vocabularyId',
  as: 'vocabularies',
});
Vocabulary.belongsToMany(Sentence, {
  through: SentenceVocabulary,
  foreignKey: 'vocabularyId',
  otherKey: 'sentenceId',
  as: 'sentences',
});

// Sentence Associations
Sentence.hasMany(UserSentenceProgress, { foreignKey: 'sentenceId', as: 'progresses', onDelete: 'CASCADE' });
UserSentenceProgress.belongsTo(Sentence, { foreignKey: 'sentenceId', as: 'sentence' });

Sentence.hasMany(Bookmark, { foreignKey: 'sentenceId', as: 'bookmarks', onDelete: 'CASCADE' });
Bookmark.belongsTo(Sentence, { foreignKey: 'sentenceId', as: 'sentence' });

Sentence.hasMany(Quiz, { foreignKey: 'sentenceId', as: 'quizzes', onDelete: 'SET NULL' });
Quiz.belongsTo(Sentence, { foreignKey: 'sentenceId', as: 'sentence' });

// Vocabulary Associations
Vocabulary.hasMany(UserVocabulary, { foreignKey: 'vocabularyId', as: 'userVocabularies', onDelete: 'CASCADE' });
UserVocabulary.belongsTo(Vocabulary, { foreignKey: 'vocabularyId', as: 'vocabulary' });

// Quiz Associations
Quiz.hasMany(QuizOption, { foreignKey: 'quizId', as: 'options', onDelete: 'CASCADE' });
QuizOption.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

export {
  sequelize,
  User,
  Category,
  Level,
  Lesson,
  Sentence,
  Vocabulary,
  SentenceVocabulary,
  Quiz,
  QuizOption,
  UserLesson,
  UserSentenceProgress,
  UserVocabulary,
  UserStreak,
  UserActivity,
  UserLearningSession,
  DailyGoal,
  Bookmark,
};
