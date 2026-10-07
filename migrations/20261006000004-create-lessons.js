'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('lessons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      categoryId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      levelId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'levels',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      lessonNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      dayNumber: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      malayalamTitle: {
        type: Sequelize.STRING(250),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sentenceCount: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        defaultValue: 'ACTIVE',
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('lessons', ['categoryId']);
    await queryInterface.addIndex('lessons', ['levelId']);
    await queryInterface.addIndex('lessons', ['lessonNumber']);
    await queryInterface.addIndex('lessons', ['dayNumber']);
    await queryInterface.addIndex('lessons', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('lessons');
  }
};
