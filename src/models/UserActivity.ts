import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Sentence } from './Sentence';

export interface UserActivityAttributes {
  id: number;
  userId: number;
  activityDate: string;
  activityType: 'LOGIN' | 'LESSON_STARTED' | 'SENTENCE_VIEWED' | 'SENTENCE_COMPLETED' | 'VOCABULARY_LEARNED' | 'QUIZ_COMPLETED' | 'DAILY_GOAL_COMPLETED';
  sentenceId?: number | null;
  lessonId?: number | null;
  metadata?: object | null;
  createdAt?: Date;
}

export interface UserActivityCreationAttributes extends Optional<UserActivityAttributes, 'id' | 'sentenceId' | 'lessonId' | 'metadata' | 'createdAt'> {}

export class UserActivity extends Model<UserActivityAttributes, UserActivityCreationAttributes> implements UserActivityAttributes {
  declare id: number;
  declare userId: number;
  declare activityDate: string;
  declare activityType: 'LOGIN' | 'LESSON_STARTED' | 'SENTENCE_VIEWED' | 'SENTENCE_COMPLETED' | 'VOCABULARY_LEARNED' | 'QUIZ_COMPLETED' | 'DAILY_GOAL_COMPLETED';
  declare sentenceId?: number | null;
  declare lessonId?: number | null;
  declare metadata?: object | null;

  declare readonly createdAt: Date;

  declare sentence?: Sentence;
}

UserActivity.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    activityDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    activityType: {
      type: DataTypes.ENUM(
        'LOGIN',
        'LESSON_STARTED',
        'SENTENCE_VIEWED',
        'SENTENCE_COMPLETED',
        'VOCABULARY_LEARNED',
        'QUIZ_COMPLETED',
        'DAILY_GOAL_COMPLETED'
      ),
      allowNull: false,
    },
    sentenceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    lessonId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_activities',
    timestamps: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['activityDate'] },
      { fields: ['activityType'] },
      { fields: ['userId', 'activityDate'] },
      { fields: ['userId', 'activityType'] },
    ],
  }
);
