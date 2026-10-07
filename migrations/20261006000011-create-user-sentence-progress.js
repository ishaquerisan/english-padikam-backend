'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_sentence_progress', {
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
      sentenceId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'sentences',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('NOT_STARTED', 'VIEWED', 'LEARNED', 'MASTERED'),
        defaultValue: 'VIEWED',
        allowNull: false
      },
      firstViewedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      practiceCount: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      lastPracticedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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

    await queryInterface.addIndex('user_sentence_progress', ['userId']);
    await queryInterface.addIndex('user_sentence_progress', ['sentenceId']);
    await queryInterface.addIndex('user_sentence_progress', ['userId', 'sentenceId'], { unique: true });
    await queryInterface.addIndex('user_sentence_progress', ['status']);
    await queryInterface.addIndex('user_sentence_progress', ['completedAt']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_sentence_progress');
  }
};
