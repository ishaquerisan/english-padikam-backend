import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserVocabularyAttributes {
  id: number;
  userId: number;
  vocabularyId: number;
  masteryLevel: number;
  reviewCount: number;
  lastReviewedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserVocabularyCreationAttributes extends Optional<UserVocabularyAttributes, 'id' | 'masteryLevel' | 'reviewCount' | 'lastReviewedAt'> {}

export class UserVocabulary extends Model<UserVocabularyAttributes, UserVocabularyCreationAttributes> implements UserVocabularyAttributes {
  declare id: number;
  declare userId: number;
  declare vocabularyId: number;
  declare masteryLevel: number;
  declare reviewCount: number;
  declare lastReviewedAt: Date;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

UserVocabulary.init(
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
    vocabularyId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    masteryLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    lastReviewedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'user_vocabularies',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['vocabularyId'] },
      { unique: true, fields: ['userId', 'vocabularyId'] },
      { fields: ['masteryLevel'] },
    ],
  }
);
