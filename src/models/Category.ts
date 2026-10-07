import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CategoryAttributes {
  id: number;
  name: string;
  slug: string;
  malayalamName: string;
  icon: string;
  description?: string;
  orderNumber: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'orderNumber' | 'status'> {}

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare malayalamName: string;
  declare icon: string;
  declare description?: string;
  declare orderNumber: number;
  declare status: 'ACTIVE' | 'INACTIVE';

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    malayalamName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING(50),
      defaultValue: 'MessageSquare',
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    orderNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    tableName: 'categories',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['slug'] },
      { fields: ['status'] },
      { fields: ['orderNumber'] },
    ],
  }
);
