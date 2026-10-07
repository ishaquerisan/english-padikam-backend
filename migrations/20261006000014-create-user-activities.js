'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_activities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      activityDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      activityType: {
        type: Sequelize.ENUM(
          'LOGIN',
          'LESSON_STARTED',
          'SENTENCE_VIEWED',
          'SENTENCE_COMPLETED',
          'VOCABULARY_LEARNED',
          'QUIZ_COMPLETED',
          'DAILY_GOAL_COMPLETED'
        ),
        allowNull: false
      },
      sentenceId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true
      },
      lessonId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('user_activities', ['userId']);
    await queryInterface.addIndex('user_activities', ['activityDate']);
    await queryInterface.addIndex('user_activities', ['activityType']);
    await queryInterface.addIndex('user_activities', ['userId', 'activityDate']);
    await queryInterface.addIndex('user_activities', ['userId', 'activityType']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_activities');
  }
};
