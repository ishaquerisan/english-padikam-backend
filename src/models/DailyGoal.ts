import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface DailyGoalAttributes {
  id: number;
  userId: number;
  targetSentences: number;
  reminderEnabled: boolean;
  reminderTime: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DailyGoalCreationAttributes extends Optional<DailyGoalAttributes, 'id' | 'targetSentences' | 'reminderEnabled' | 'reminderTime'> {}

export class DailyGoal extends Model<DailyGoalAttributes, DailyGoalCreationAttributes> implements DailyGoalAttributes {
  declare id: number;
  declare userId: number;
  declare targetSentences: number;
  declare reminderEnabled: boolean;
  declare reminderTime: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

DailyGoal.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
    },
    targetSentences: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      allowNull: false,
    },
    reminderEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    reminderTime: {
      type: DataTypes.STRING(10),
      defaultValue: '08:00',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'daily_goals',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId'] },
    ],
  }
);
