import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface LevelAttributes {
  id: number;
  name: string;
  code: string;
  malayalamName: string;
  description?: string;
  targetSentences: number;
  orderNumber: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LevelCreationAttributes extends Optional<LevelAttributes, 'id' | 'targetSentences' | 'orderNumber'> {}

export class Level extends Model<LevelAttributes, LevelCreationAttributes> implements LevelAttributes {
  declare id: number;
  declare name: string;
  declare code: string;
  declare malayalamName: string;
  declare description?: string;
  declare targetSentences: number;
  declare orderNumber: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Level.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    malayalamName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    targetSentences: {
      type: DataTypes.INTEGER,
      defaultValue: 1000,
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
    tableName: 'levels',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['name'] },
      { unique: true, fields: ['code'] },
      { fields: ['orderNumber'] },
    ],
  }
);
