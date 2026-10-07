import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserStreakAttributes {
  id: number;
  userId: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserStreakCreationAttributes extends Optional<UserStreakAttributes, 'id' | 'currentStreak' | 'longestStreak' | 'lastActiveDate'> {}

export class UserStreak extends Model<UserStreakAttributes, UserStreakCreationAttributes> implements UserStreakAttributes {
  declare id: number;
  declare userId: number;
  declare currentStreak: number;
  declare longestStreak: number;
  declare lastActiveDate?: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

UserStreak.init(
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
    currentStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    lastActiveDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'user_streaks',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId'] },
      { fields: ['lastActiveDate'] },
    ],
  }
);
