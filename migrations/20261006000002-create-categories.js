'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      slug: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true
      },
      malayalamName: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      icon: {
        type: Sequelize.STRING(50),
        defaultValue: 'MessageSquare',
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      orderNumber: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
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

    await queryInterface.addIndex('categories', ['slug'], { unique: true });
    await queryInterface.addIndex('categories', ['status']);
    await queryInterface.addIndex('categories', ['orderNumber']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('categories');
  }
};
