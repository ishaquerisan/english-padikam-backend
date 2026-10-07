'use strict';
const levels = require('./data/levels.json');

module.exports = {
  up: async (queryInterface) => {
    const formattedLevels = levels.map(lvl => ({
      id: lvl.id,
      name: lvl.name,
      code: lvl.code,
      malayalamName: lvl.malayalamName,
      description: lvl.description || null,
      targetSentences: lvl.targetSentences || 1000,
      orderNumber: lvl.orderNumber || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('levels', formattedLevels, {
      updateOnDuplicate: ['name', 'code', 'malayalamName', 'description', 'targetSentences', 'orderNumber']
    });
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('levels', null, {});
  }
};
