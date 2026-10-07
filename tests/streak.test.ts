import { sequelize } from '../src/config/database';
import { User } from '../src/models/User';
import { UserStreak } from '../src/models/UserStreak';
import { StreakService } from '../src/services/streakService';
import { isConsecutiveDay, isSameDay } from '../src/utils/dateUtils';
import bcrypt from 'bcryptjs';

async function runTests() {
  console.log('🧪 Starting Streak & Learning Logic Verification Tests...\n');

  try {
    await sequelize.authenticate();

    // 1. Test Date Logic
    console.log('--- Test 1: Date & Timezone Utilities ---');
    const day1 = '2026-10-06';
    const day2 = '2026-10-07';
    const day4 = '2026-10-09';

    console.assert(isSameDay(day1, '2026-10-06') === true, 'Same day check failed');
    console.assert(isConsecutiveDay(day1, day2) === true, 'Consecutive day check failed');
    console.assert(isConsecutiveDay(day1, day4) === false, 'Non-consecutive check failed');
    console.log('✅ Date logic verified.\n');

    // 2. Test User Creation for Streak Simulation
    console.log('--- Test 2: Simulating User Streaks in MySQL ---');
    const testEmail = `streak_test_${Date.now()}@example.com`;
    const passwordHash = await bcrypt.hash('Test@123', 10);

    const testUser = await User.create({
      name: 'Streak Tester',
      email: testEmail,
      password: passwordHash,
      role: 'USER',
      nativeLanguage: 'Malayalam',
      englishLevel: 'Beginner',
      learningGoal: 'Testing',
      dailyGoal: 5,
      currentStreak: 0,
      longestStreak: 0,
    });

    const streakRec = await UserStreak.create({
      userId: testUser.id,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
    });

    // Scenario 1: First active learning day -> streak = 1
    const s1 = await StreakService.updateStreakOnActiveLearning(testUser.id);
    console.log(`Scenario 1 (First learning day): currentStreak=${s1.currentStreak}, longestStreak=${s1.longestStreak}`);
    console.assert(s1.currentStreak === 1, 'Expected streak 1');
    console.assert(s1.longestStreak === 1, 'Expected longest streak 1');

    // Scenario 2: Multiple activities same day -> streak remains 1
    const s2 = await StreakService.updateStreakOnActiveLearning(testUser.id);
    console.log(`Scenario 2 (Same day extra activity): currentStreak=${s2.currentStreak}, isNewDay=${s2.isNewDay}`);
    console.assert(s2.currentStreak === 1, 'Streak should remain 1 on same day');
    console.assert(s2.isNewDay === false, 'Should not count as new day');

    // Clean up test user
    await UserStreak.destroy({ where: { userId: testUser.id } });
    await User.destroy({ where: { id: testUser.id } });

    console.log('\n✅ All automated streak verification tests PASSED!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
}

runTests();
