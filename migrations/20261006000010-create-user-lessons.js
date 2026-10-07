'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_lessons', {
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
      status: {
        type: Sequelize.ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'),
        defaultValue: 'NOT_STARTED',
        allowNull: false
      },
      sentencesCompleted: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      quizScore: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
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

    await queryInterface.addIndex('user_lessons', ['userId']);
    await queryInterface.addIndex('user_lessons', ['lessonId']);
    await queryInterface.addIndex('user_lessons', ['userId', 'lessonId'], { unique: true });
    await queryInterface.addIndex('user_lessons', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_lessons');
  }
};
