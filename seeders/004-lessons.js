'use strict';
const lessons = require('./data/lessons.json');

module.exports = {
  up: async (queryInterface) => {
    const formattedLessons = lessons.map(l => ({
      id: l.id,
      categoryId: l.categoryId,
      levelId: l.levelId,
      lessonNumber: l.lessonNumber,
      dayNumber: l.dayNumber,
      title: l.title,
      malayalamTitle: l.malayalamTitle,
      description: l.description || null,
      sentenceCount: l.sentenceCount || 5,
      status: l.status || 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Insert in batches of 200 for maximum MySQL stability and performance
    const chunkSize = 200;
    for (let i = 0; i < formattedLessons.length; i += chunkSize) {
      const chunk = formattedLessons.slice(i, i + chunkSize);
      await queryInterface.bulkInsert('lessons', chunk, {
        updateOnDuplicate: ['categoryId', 'levelId', 'lessonNumber', 'dayNumber', 'title', 'malayalamTitle', 'description', 'sentenceCount', 'status']
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('lessons', null, {});
  }
};
