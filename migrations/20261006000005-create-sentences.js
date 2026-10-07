'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sentences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      lessonId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'lessons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      englishText: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      malayalamText: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      pronunciation: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      explanation: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      usageSituation: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      exampleResponse: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      audioUrl: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      orderNumber: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
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

    await queryInterface.addIndex('sentences', ['lessonId']);
    await queryInterface.addIndex('sentences', ['categoryId']);
    await queryInterface.addIndex('sentences', ['levelId']);
    await queryInterface.addIndex('sentences', ['status']);
    await queryInterface.addIndex('sentences', ['createdAt']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('sentences');
  }
};
