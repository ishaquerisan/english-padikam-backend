'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('levels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      malayalamName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      targetSentences: {
        type: Sequelize.INTEGER,
        defaultValue: 1000,
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

    await queryInterface.addIndex('levels', ['name'], { unique: true });
    await queryInterface.addIndex('levels', ['code'], { unique: true });
    await queryInterface.addIndex('levels', ['orderNumber']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('levels');
  }
};
