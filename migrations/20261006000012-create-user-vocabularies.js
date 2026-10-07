'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_vocabularies', {
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
      vocabularyId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'vocabularies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      masteryLevel: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      reviewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      lastReviewedAt: {
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

    await queryInterface.addIndex('user_vocabularies', ['userId']);
    await queryInterface.addIndex('user_vocabularies', ['vocabularyId']);
    await queryInterface.addIndex('user_vocabularies', ['userId', 'vocabularyId'], { unique: true });
    await queryInterface.addIndex('user_vocabularies', ['masteryLevel']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_vocabularies');
  }
};
