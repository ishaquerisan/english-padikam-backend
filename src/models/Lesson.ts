import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface LessonAttributes {
  id: number;
  categoryId: number;
  levelId: number;
  lessonNumber: number;
  dayNumber?: number | null;
  title: string;
  malayalamTitle: string;
  description?: string;
  sentenceCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LessonCreationAttributes extends Optional<LessonAttributes, 'id' | 'dayNumber' | 'sentenceCount' | 'status'> {}

export class Lesson extends Model<LessonAttributes, LessonCreationAttributes> implements LessonAttributes {
  declare id: number;
  declare categoryId: number;
  declare levelId: number;
  declare lessonNumber: number;
  declare dayNumber?: number | null;
  declare title: string;
  declare malayalamTitle: string;
  declare description?: string;
  declare sentenceCount: number;
  declare status: 'ACTIVE' | 'INACTIVE';

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Lesson.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    levelId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    lessonNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dayNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    malayalamTitle: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sentenceCount: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      defaultValue: 'ACTIVE',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'lessons',
    timestamps: true,
    indexes: [
      { fields: ['categoryId'] },
      { fields: ['levelId'] },
      { fields: ['lessonNumber'] },
      { fields: ['dayNumber'] },
      { fields: ['status'] },
    ],
  }
);
