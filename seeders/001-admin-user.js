'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
    const userPasswordHash = await bcrypt.hash('User@12345', 10);

    const users = [
      {
        id: 1,
        name: 'Admin Teacher',
        email: 'admin@englishmalayalam.com',
        password: adminPasswordHash,
        role: 'ADMIN',
        nativeLanguage: 'Malayalam',
        englishLevel: 'Advanced',
        learningGoal: 'Teaching & Mentoring',
        dailyGoal: 5,
        currentStreak: 12,
        longestStreak: 25,
        lastActiveDate: '2026-10-06',
        totalSentencesLearned: 450,
        totalWordsLearned: 180,
        totalLearningDays: 32,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Rahul Nair',
        email: 'test@englishmalayalam.com',
        password: userPasswordHash,
        role: 'USER',
        nativeLanguage: 'Malayalam',
        englishLevel: 'Beginner',
        learningGoal: 'Daily Conversation',
        dailyGoal: 5,
        currentStreak: 5,
        longestStreak: 8,
        lastActiveDate: '2026-10-06',
        totalSentencesLearned: 35,
        totalWordsLearned: 15,
        totalLearningDays: 7,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    await queryInterface.bulkInsert('users', users, { updateOnDuplicate: ['name', 'password', 'role', 'status'] });

    // Seed User Streak
    const streaks = [
      {
        id: 1,
        userId: 1,
        currentStreak: 12,
        longestStreak: 25,
        lastActiveDate: '2026-10-06',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId: 2,
        currentStreak: 5,
        longestStreak: 8,
        lastActiveDate: '2026-10-06',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    await queryInterface.bulkInsert('user_streaks', streaks, { updateOnDuplicate: ['currentStreak', 'longestStreak', 'lastActiveDate'] });

    // Seed Daily Goals
    const dailyGoals = [
      {
        id: 1,
        userId: 1,
        targetSentences: 5,
        reminderEnabled: true,
        reminderTime: '08:00',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId: 2,
        targetSentences: 5,
        reminderEnabled: true,
        reminderTime: '08:30',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    await queryInterface.bulkInsert('daily_goals', dailyGoals, { updateOnDuplicate: ['targetSentences', 'reminderTime'] });
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('daily_goals', null, {});
    await queryInterface.bulkDelete('user_streaks', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
