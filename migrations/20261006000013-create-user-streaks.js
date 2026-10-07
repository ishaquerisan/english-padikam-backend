'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_streaks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    await queryInterface.addIndex('user_streaks', ['userId'], { unique: true });
    await queryInterface.addIndex('user_streaks', ['lastActiveDate']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_streaks');
  }
};
