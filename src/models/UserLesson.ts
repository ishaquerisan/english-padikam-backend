import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserLessonAttributes {
  id: number;
  userId: number;
  lessonId: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  sentencesCompleted: number;
  quizScore?: number | null;
  completedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserLessonCreationAttributes extends Optional<UserLessonAttributes, 'id' | 'status' | 'sentencesCompleted' | 'quizScore' | 'completedAt'> {}

export class UserLesson extends Model<UserLessonAttributes, UserLessonCreationAttributes> implements UserLessonAttributes {
  declare id: number;
  declare userId: number;
  declare lessonId: number;
  declare status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  declare sentencesCompleted: number;
  declare quizScore?: number | null;
  declare completedAt?: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

UserLesson.init(
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
    lessonId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'),
      defaultValue: 'NOT_STARTED',
      allowNull: false,
    },
    sentencesCompleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    quizScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'user_lessons',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['lessonId'] },
      { unique: true, fields: ['userId', 'lessonId'] },
      { fields: ['status'] },
    ],
  }
);
