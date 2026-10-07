import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface QuizOptionAttributes {
  id: number;
  quizId: number;
  optionText: string;
  malayalamText?: string | null;
  isCorrect: boolean;
  orderNumber: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuizOptionCreationAttributes extends Optional<QuizOptionAttributes, 'id' | 'malayalamText' | 'isCorrect' | 'orderNumber'> {}

export class QuizOption extends Model<QuizOptionAttributes, QuizOptionCreationAttributes> implements QuizOptionAttributes {
  declare id: number;
  declare quizId: number;
  declare optionText: string;
  declare malayalamText?: string | null;
  declare isCorrect: boolean;
  declare orderNumber: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

QuizOption.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    quizId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    optionText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    malayalamText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    orderNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'quiz_options',
    timestamps: true,
    indexes: [
      { fields: ['quizId'] },
      { fields: ['isCorrect'] },
    ],
  }
);
