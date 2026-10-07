import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserLearningSessionAttributes {
  id: number;
  userId: number;
  startedAt: Date;
  endedAt?: Date | null;
  sentencesLearned: number;
  durationSeconds: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserLearningSessionCreationAttributes extends Optional<UserLearningSessionAttributes, 'id' | 'endedAt' | 'sentencesLearned' | 'durationSeconds'> {}

export class UserLearningSession extends Model<UserLearningSessionAttributes, UserLearningSessionCreationAttributes> implements UserLearningSessionAttributes {
  declare id: number;
  declare userId: number;
  declare startedAt: Date;
  declare endedAt?: Date | null;
  declare sentencesLearned: number;
  declare durationSeconds: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

UserLearningSession.init(
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
    startedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sentencesLearned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    durationSeconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'user_learning_sessions',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['startedAt'] },
    ],
  }
);
