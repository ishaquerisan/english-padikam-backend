import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface VocabularyAttributes {
  id: number;
  word: string;
  phonetic?: string | null;
  partOfSpeech?: string | null;
  malayalamMeaning: string;
  englishMeaning?: string | null;
  exampleSentence?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VocabularyCreationAttributes extends Optional<VocabularyAttributes, 'id' | 'phonetic' | 'partOfSpeech' | 'englishMeaning' | 'exampleSentence'> {}

export class Vocabulary extends Model<VocabularyAttributes, VocabularyCreationAttributes> implements VocabularyAttributes {
  declare id: number;
  declare word: string;
  declare phonetic?: string | null;
  declare partOfSpeech?: string | null;
  declare malayalamMeaning: string;
  declare englishMeaning?: string | null;
  declare exampleSentence?: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Vocabulary.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    word: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    phonetic: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    partOfSpeech: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    malayalamMeaning: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    englishMeaning: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    exampleSentence: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'vocabularies',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['word'] },
    ],
  }
);
