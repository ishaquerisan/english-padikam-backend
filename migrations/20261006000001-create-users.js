'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(191),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('USER', 'ADMIN'),
        defaultValue: 'USER',
        allowNull: false
      },
      nativeLanguage: {
        type: Sequelize.STRING(50),
        defaultValue: 'Malayalam',
        allowNull: false
      },
      englishLevel: {
        type: Sequelize.STRING(50),
        defaultValue: 'Beginner',
        allowNull: false
      },
      learningGoal: {
        type: Sequelize.STRING(100),
        defaultValue: 'Daily Conversation',
        allowNull: false
      },
      dailyGoal: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
        allowNull: false
      },
      currentStreak: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      longestStreak: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lastActiveDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      totalSentencesLearned: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      totalWordsLearned: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      totalLearningDays: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
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

    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['status']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['lastActiveDate']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};
