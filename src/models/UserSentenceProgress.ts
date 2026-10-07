import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserSentenceProgressAttributes {
  id: number;
  userId: number;
  sentenceId: number;
  status: 'NOT_STARTED' | 'VIEWED' | 'LEARNED' | 'MASTERED';
  firstViewedAt: Date;
  completedAt?: Date | null;
  practiceCount: number;
  lastPracticedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSentenceProgressCreationAttributes extends Optional<UserSentenceProgressAttributes, 'id' | 'status' | 'completedAt' | 'practiceCount' | 'lastPracticedAt'> {}

export class UserSentenceProgress extends Model<UserSentenceProgressAttributes, UserSentenceProgressCreationAttributes> implements UserSentenceProgressAttributes {
  declare id: number;
  declare userId: number;
  declare sentenceId: number;
  declare status: 'NOT_STARTED' | 'VIEWED' | 'LEARNED' | 'MASTERED';
  declare firstViewedAt: Date;
  declare completedAt?: Date | null;
  declare practiceCount: number;
  declare lastPracticedAt: Date;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

UserSentenceProgress.init(
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
    sentenceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('NOT_STARTED', 'VIEWED', 'LEARNED', 'MASTERED'),
      defaultValue: 'VIEWED',
      allowNull: false,
    },
    firstViewedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    practiceCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    lastPracticedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'user_sentence_progress',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['sentenceId'] },
      { unique: true, fields: ['userId', 'sentenceId'] },
      { fields: ['status'] },
      { fields: ['completedAt'] },
    ],
  }
);
