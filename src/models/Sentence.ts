import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Category } from './Category';
import { Level } from './Level';
import { Lesson } from './Lesson';
import { Vocabulary } from './Vocabulary';

export interface SentenceAttributes {
  id: number;
  lessonId: number;
  categoryId: number;
  levelId: number;
  englishText: string;
  malayalamText: string;
  pronunciation: string;
  explanation: string;
  usageSituation: string;
  exampleResponse?: string | null;
  audioUrl?: string | null;
  orderNumber: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SentenceCreationAttributes extends Optional<SentenceAttributes, 'id' | 'exampleResponse' | 'audioUrl' | 'orderNumber' | 'status'> {}

export class Sentence extends Model<SentenceAttributes, SentenceCreationAttributes> implements SentenceAttributes {
  declare id: number;
  declare lessonId: number;
  declare categoryId: number;
  declare levelId: number;
  declare englishText: string;
  declare malayalamText: string;
  declare pronunciation: string;
  declare explanation: string;
  declare usageSituation: string;
  declare exampleResponse?: string | null;
  declare audioUrl?: string | null;
  declare orderNumber: number;
  declare status: 'ACTIVE' | 'INACTIVE';

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare category?: Category;
  declare level?: Level;
  declare lesson?: Lesson;
  declare vocabularies?: Vocabulary[];
}

Sentence.init(
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
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    levelId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    englishText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    malayalamText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pronunciation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    usageSituation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    exampleResponse: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    audioUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    orderNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
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
    tableName: 'sentences',
    timestamps: true,
    indexes: [
      { fields: ['lessonId'] },
      { fields: ['categoryId'] },
      { fields: ['levelId'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
    ],
  }
);
