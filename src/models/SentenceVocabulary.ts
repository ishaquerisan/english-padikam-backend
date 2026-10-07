import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface SentenceVocabularyAttributes {
  id: number;
  sentenceId: number;
  vocabularyId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SentenceVocabularyCreationAttributes extends Optional<SentenceVocabularyAttributes, 'id'> {}

export class SentenceVocabulary extends Model<SentenceVocabularyAttributes, SentenceVocabularyCreationAttributes> implements SentenceVocabularyAttributes {
  declare id: number;
  declare sentenceId: number;
  declare vocabularyId: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

SentenceVocabulary.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    sentenceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    vocabularyId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'sentence_vocabularies',
    timestamps: true,
    indexes: [
      { fields: ['sentenceId'] },
      { fields: ['vocabularyId'] },
      { unique: true, fields: ['sentenceId', 'vocabularyId'] },
    ],
  }
);
