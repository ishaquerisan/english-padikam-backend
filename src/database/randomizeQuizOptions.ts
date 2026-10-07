import fs from 'fs';
import path from 'path';
import { sequelize, Quiz, QuizOption, Sentence } from '../models';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const malDistractorPool = [
  "നിങ്ങൾ നാളെ ഇവിടെ വരുമോ?",
  "എനിക്ക് ഇതിനെക്കുറിച്ച് കൂടുതൽ വിവരങ്ങൾ അറിയില്ലായിരുന്നു.",
  "ദയവായി കുറച്ചു സമയം കാത്തിരിക്കൂ.",
  "ഇത് എവിടെ നിന്നാണ് വാങ്ങിയത് എന്ന് പറയാമോ?",
  "നമുക്ക് അടുത്ത ആഴ്ച വീണ്ടും സംസാരിക്കാം.",
  "അദ്ദേഹം ഇന്നലെ ഓഫീസിൽ വന്നിരുന്നില്ല.",
  "ഈ ജോലി കൃത്യസമയത്ത് പൂർത്തിയാക്കാൻ സാധിക്കും.",
  "നിങ്ങൾക്ക് എന്തെങ്കിലും സഹായം ആവശ്യമുണ്ടോ?",
  "ഞാൻ ഉടൻ തന്നെ തിരികെ വിളിക്കാം.",
  "ഇതിന്റെ ശരിയായ അർത്ഥം എന്താണെന്ന് മനസ്സിലായില്ല.",
  "കാലാവസ്ഥ വളരെ സുഖകരമായിരിക്കുന്നു.",
  "ഇവിടെ അടുത്തുള്ള ബസ് സ്റ്റോപ്പ് എവിടെയാണ്?",
  "നമുക്ക് ഒരുമിച്ച് ഉച്ചഭക്ഷണം കഴിക്കാം.",
  "നിങ്ങളുടെ ഫോൺ നമ്പർ തരാമോ?",
  "ഇത് വളരെ അത്യാവശ്യമായ ഒരു കാര്യമാണ്."
];

const engDistractorPool = [
  "I am waiting for your response.",
  "Please send me the details right now.",
  "We should meet again tomorrow morning.",
  "Could you please explain this to me once more?",
  "I will reach the office in fifteen minutes.",
  "Do you have any questions regarding this project?",
  "It is very important to practice speaking daily.",
  "Where can I find the nearest grocery store?",
  "Thank you so much for your kind support.",
  "Let us discuss this matter during the meeting.",
  "I have already completed all the assigned tasks.",
  "Would you like to join us for dinner tonight?",
  "Please remember to keep your belongings safe.",
  "I am not sure about the exact timing yet."
];

async function randomizeQuizzes() {
  console.log('🔄 Starting random shuffling of quiz options in Database & JSON...');

  // Fetch all sentences to create dynamic realistic distractors
  const sentences = await Sentence.findAll({ attributes: ['id', 'englishText', 'malayalamText'] });
  const sentenceList = sentences.map(s => ({ eng: s.englishText, mal: s.malayalamText }));

  const quizzes = await Quiz.findAll({
    include: [{ model: QuizOption, as: 'options' }],
  });

  console.log(`Found ${quizzes.length} quizzes in database.`);

  const updatedQuizOptionsJson: any[] = [];
  let optionIdCounter = 1;

  for (const quiz of quizzes) {
    const isEngToMal = quiz.questionType === 'ENG_TO_MAL' || quiz.question.includes('Malayalam meaning');
    const correctOpt = (quiz as any).options?.find((o: any) => o.isCorrect) || (quiz as any).options?.[0];
    const correctText = correctOpt ? correctOpt.optionText : (quiz.explanation?.replace(/Correct.*: /i, '') || 'Correct Answer');

    // Pick 3 unique distractors
    const distractors: string[] = [];
    const pool = isEngToMal
      ? [...malDistractorPool, ...sentenceList.map(s => s.mal)]
      : [...engDistractorPool, ...sentenceList.map(s => s.eng)];

    while (distractors.length < 3) {
      const candidate = pool[Math.floor(Math.random() * pool.length)];
      if (candidate && candidate !== correctText && !distractors.includes(candidate)) {
        distractors.push(candidate);
      }
    }

    // Build raw 4 options
    const rawOptions = [
      { text: correctText, isCorrect: true },
      { text: distractors[0], isCorrect: false },
      { text: distractors[1], isCorrect: false },
      { text: distractors[2], isCorrect: false },
    ];

    // Shuffle the options randomly
    const shuffled = shuffleArray(rawOptions);

    // Update database options for this quiz
    const existingOptions = (quiz as any).options || [];
    for (let i = 0; i < shuffled.length; i++) {
      const item = shuffled[i];
      const optId = existingOptions[i]?.id || optionIdCounter++;

      if (existingOptions[i]) {
        await existingOptions[i].update({
          optionText: item.text,
          isCorrect: item.isCorrect,
          orderNumber: i + 1,
        });
      } else {
        await QuizOption.create({
          id: optId,
          quizId: quiz.id,
          optionText: item.text,
          isCorrect: item.isCorrect,
          orderNumber: i + 1,
        });
      }

      updatedQuizOptionsJson.push({
        id: optId,
        quizId: quiz.id,
        optionText: item.text,
        malayalamText: isEngToMal ? item.text : null,
        isCorrect: item.isCorrect,
        orderNumber: i + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Update seeders JSON file
  const jsonPath = path.resolve(__dirname, '../../seeders/data/quiz_options.json');
  if (fs.existsSync(path.dirname(jsonPath))) {
    fs.writeFileSync(jsonPath, JSON.stringify(updatedQuizOptionsJson, null, 2));
    console.log(`✅ Saved ${updatedQuizOptionsJson.length} randomized options to seeders/data/quiz_options.json`);
  }

  console.log('🎉 Successfully randomized all quiz answer options in Database!');
  process.exit(0);
}

randomizeQuizzes().catch((err) => {
  console.error('❌ Error randomizing quiz options:', err);
  process.exit(1);
});
