'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('quizzes', {
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
      sentenceId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'sentences',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      questionType: {
        type: Sequelize.ENUM('ENG_TO_MAL', 'MAL_TO_ENG', 'FILL_BLANK', 'CORRECT_SENTENCE', 'VOCAB_MEANING'),
        defaultValue: 'ENG_TO_MAL',
        allowNull: false
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      malayalamQuestion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      explanation: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.addIndex('quizzes', ['lessonId']);
    await queryInterface.addIndex('quizzes', ['sentenceId']);
    await queryInterface.addIndex('quizzes', ['questionType']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('quizzes');
  }
};
