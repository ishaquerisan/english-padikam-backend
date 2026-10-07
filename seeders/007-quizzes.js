'use strict';
const quizzes = require('./data/quizzes.json');
const quizOptions = require('./data/quiz_options.json');

module.exports = {
  up: async (queryInterface) => {
    if (quizzes && quizzes.length > 0) {
      const formattedQuizzes = quizzes.map(q => ({
        id: q.id,
        lessonId: q.lessonId,
        sentenceId: q.sentenceId || null,
        questionType: q.questionType || 'ENG_TO_MAL',
        question: q.question,
        malayalamQuestion: q.malayalamQuestion || null,
        explanation: q.explanation || null,
        orderNumber: q.orderNumber || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const chunkSize = 500;
      for (let i = 0; i < formattedQuizzes.length; i += chunkSize) {
        const chunk = formattedQuizzes.slice(i, i + chunkSize);
        await queryInterface.bulkInsert('quizzes', chunk, {
          updateOnDuplicate: ['lessonId', 'sentenceId', 'questionType', 'question', 'malayalamQuestion', 'explanation', 'orderNumber']
        });
      }
    }

    if (quizOptions && quizOptions.length > 0) {
      const formattedOptions = quizOptions.map(qo => ({
        id: qo.id,
        quizId: qo.quizId,
        optionText: qo.optionText,
        malayalamText: qo.malayalamText || null,
        isCorrect: qo.isCorrect ? 1 : 0,
        orderNumber: qo.orderNumber || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const chunkSize = 500;
      for (let i = 0; i < formattedOptions.length; i += chunkSize) {
        const chunk = formattedOptions.slice(i, i + chunkSize);
        await queryInterface.bulkInsert('quiz_options', chunk, {
          updateOnDuplicate: ['quizId', 'optionText', 'malayalamText', 'isCorrect', 'orderNumber']
        });
      }
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('quiz_options', null, {});
    await queryInterface.bulkDelete('quizzes', null, {});
  }
};
