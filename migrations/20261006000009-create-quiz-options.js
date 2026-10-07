'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('quiz_options', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      quizId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'quizzes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      optionText: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      malayalamText: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isCorrect: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      orderNumber: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
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

    await queryInterface.addIndex('quiz_options', ['quizId']);
    await queryInterface.addIndex('quiz_options', ['isCorrect']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('quiz_options');
  }
};
