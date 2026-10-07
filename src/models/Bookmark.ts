import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Sentence } from './Sentence';

export interface BookmarkAttributes {
  id: number;
  userId: number;
  sentenceId: number;
  note?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookmarkCreationAttributes extends Optional<BookmarkAttributes, 'id' | 'note'> {}

export class Bookmark extends Model<BookmarkAttributes, BookmarkCreationAttributes> implements BookmarkAttributes {
  declare id: number;
  declare userId: number;
  declare sentenceId: number;
  declare note?: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare sentence?: Sentence;
}

Bookmark.init(
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
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'bookmarks',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['sentenceId'] },
      { unique: true, fields: ['userId', 'sentenceId'] },
    ],
  }
);
