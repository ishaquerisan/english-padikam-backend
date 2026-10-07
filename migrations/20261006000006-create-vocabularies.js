'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vocabularies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      word: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      phonetic: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      partOfSpeech: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      malayalamMeaning: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      englishMeaning: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      exampleSentence: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('vocabularies', ['word'], { unique: true });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('vocabularies');
  }
};
