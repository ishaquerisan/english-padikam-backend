'use strict';
const sentences = require('./data/sentences.json');

module.exports = {
  up: async (queryInterface) => {
    const formattedSentences = sentences.map(s => ({
      id: s.id,
      lessonId: s.lessonId,
      categoryId: s.categoryId,
      levelId: s.levelId,
      englishText: s.englishText,
      malayalamText: s.malayalamText,
      pronunciation: s.pronunciation,
      explanation: s.explanation,
      usageSituation: s.usageSituation,
      exampleResponse: s.exampleResponse || null,
      audioUrl: s.audioUrl || null,
      orderNumber: s.orderNumber || 1,
      status: s.status || 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Batch insert 500 records at a time for optimal MySQL speed
    const chunkSize = 500;
    for (let i = 0; i < formattedSentences.length; i += chunkSize) {
      const chunk = formattedSentences.slice(i, i + chunkSize);
      await queryInterface.bulkInsert('sentences', chunk, {
        updateOnDuplicate: [
          'lessonId',
          'categoryId',
          'levelId',
          'englishText',
          'malayalamText',
          'pronunciation',
          'explanation',
          'usageSituation',
          'exampleResponse',
          'audioUrl',
          'orderNumber',
          'status'
        ]
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('sentences', null, {});
  }
};
