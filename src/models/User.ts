import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'USER' | 'ADMIN';
  nativeLanguage: string;
  englishLevel: string;
  learningGoal: string;
  dailyGoal: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalSentencesLearned: number;
  totalWordsLearned: number;
  totalLearningDays: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'nativeLanguage' | 'englishLevel' | 'learningGoal' | 'dailyGoal' | 'currentStreak' | 'longestStreak' | 'lastActiveDate' | 'totalSentencesLearned' | 'totalWordsLearned' | 'totalLearningDays' | 'status'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: 'USER' | 'ADMIN';
  declare nativeLanguage: string;
  declare englishLevel: string;
  declare learningGoal: string;
  declare dailyGoal: number;
  declare currentStreak: number;
  declare longestStreak: number;
  declare lastActiveDate: string | null;
  declare totalSentencesLearned: number;
  declare totalWordsLearned: number;
  declare totalLearningDays: number;
  declare status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  public toJSON(): Partial<UserAttributes> {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('USER', 'ADMIN'),
      defaultValue: 'USER',
      allowNull: false,
    },
    nativeLanguage: {
      type: DataTypes.STRING(50),
      defaultValue: 'Malayalam',
      allowNull: false,
    },
    englishLevel: {
      type: DataTypes.STRING(50),
      defaultValue: 'Beginner',
      allowNull: false,
    },
    learningGoal: {
      type: DataTypes.STRING(100),
      defaultValue: 'Daily Conversation',
      allowNull: false,
    },
    dailyGoal: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      allowNull: false,
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
    totalSentencesLearned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    totalWordsLearned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    totalLearningDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
      defaultValue: 'ACTIVE',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['email'] },
      { fields: ['status'] },
      { fields: ['role'] },
      { fields: ['lastActiveDate'] },
    ],
    hooks: {
      beforeSave: async (user: User) => {
        if (user.changed('password') && user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);
