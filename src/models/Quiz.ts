import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { QuizOption } from './QuizOption';

export interface QuizAttributes {
  id: number;
  lessonId: number;
  sentenceId?: number | null;
  questionType: 'ENG_TO_MAL' | 'MAL_TO_ENG' | 'FILL_BLANK' | 'CORRECT_SENTENCE' | 'VOCAB_MEANING';
  question: string;
  malayalamQuestion?: string | null;
  explanation?: string | null;
  orderNumber: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuizCreationAttributes extends Optional<QuizAttributes, 'id' | 'sentenceId' | 'malayalamQuestion' | 'explanation' | 'orderNumber'> {}

export class Quiz extends Model<QuizAttributes, QuizCreationAttributes> implements QuizAttributes {
  declare id: number;
  declare lessonId: number;
  declare sentenceId?: number | null;
  declare questionType: 'ENG_TO_MAL' | 'MAL_TO_ENG' | 'FILL_BLANK' | 'CORRECT_SENTENCE' | 'VOCAB_MEANING';
  declare question: string;
  declare malayalamQuestion?: string | null;
  declare explanation?: string | null;
  declare orderNumber: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare options?: QuizOption[];
}

Quiz.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    lessonId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    sentenceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    questionType: {
      type: DataTypes.ENUM('ENG_TO_MAL', 'MAL_TO_ENG', 'FILL_BLANK', 'CORRECT_SENTENCE', 'VOCAB_MEANING'),
      defaultValue: 'ENG_TO_MAL',
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    malayalamQuestion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    orderNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'quizzes',
    timestamps: true,
    indexes: [
      { fields: ['lessonId'] },
      { fields: ['sentenceId'] },
      { fields: ['questionType'] },
    ],
  }
);
