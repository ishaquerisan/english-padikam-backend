'use strict';
const vocabularies = require('./data/vocabularies.json');
const sentenceVocabularies = require('./data/sentence_vocabularies.json');

module.exports = {
  up: async (queryInterface) => {
    if (vocabularies && vocabularies.length > 0) {
      const formattedVocabs = vocabularies.map(v => ({
        id: v.id,
        word: v.word,
        phonetic: v.phonetic || null,
        partOfSpeech: v.partOfSpeech || null,
        malayalamMeaning: v.malayalamMeaning,
        englishMeaning: v.englishMeaning || null,
        exampleSentence: v.exampleSentence || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await queryInterface.bulkInsert('vocabularies', formattedVocabs, {
        updateOnDuplicate: ['word', 'phonetic', 'partOfSpeech', 'malayalamMeaning', 'englishMeaning', 'exampleSentence']
      });
    }

    if (sentenceVocabularies && sentenceVocabularies.length > 0) {
      const formattedSentenceVocabs = sentenceVocabularies.map(sv => ({
        sentenceId: sv.sentenceId,
        vocabularyId: sv.vocabularyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const chunkSize = 500;
      for (let i = 0; i < formattedSentenceVocabs.length; i += chunkSize) {
        const chunk = formattedSentenceVocabs.slice(i, i + chunkSize);
        await queryInterface.bulkInsert('sentence_vocabularies', chunk, {
          ignoreDuplicates: true
        });
      }
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('sentence_vocabularies', null, {});
    await queryInterface.bulkDelete('vocabularies', null, {});
  }
};
