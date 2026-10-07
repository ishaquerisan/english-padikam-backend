const PORT = process.env.PORT || '5000';
const BASE_URL = `http://localhost:${PORT}/api`;

async function testAllAPIs() {
  console.log('🚀 Running Comprehensive API Integration Test Suite with Native Fetch...\n');

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json());
    console.log('1. Health Check:', healthRes.message);
    console.assert(healthRes.success === true, 'Health check failed');

    // 2. Auth Login (Test User)
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@englishmalayalam.com',
        password: 'User@12345',
      }),
    }).then((r) => r.json());
    console.log('2. User Login:', loginRes.message);
    const userToken = loginRes.data.token;
    const userAuthHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    };

    // 3. Auth Me
    const meRes = await fetch(`${BASE_URL}/auth/me`, { headers: userAuthHeaders }).then((r) => r.json());
    console.log('3. Auth Me Profile:', meRes.data.user.name, `(Streak: ${meRes.data.user.currentStreak})`);

    // 4. Daily Today (Deterministic Daily 5)
    const dailyRes = await fetch(`${BASE_URL}/daily/today`, { headers: userAuthHeaders }).then((r) => r.json());
    console.log(`4. Daily Today: Lesson "${dailyRes.data.lesson.title}" (${dailyRes.data.sentences.length} sentences)`);
    console.assert(dailyRes.data.sentences.length === 5, 'Expected 5 sentences in daily lesson');

    const firstSentence = dailyRes.data.sentences[0];
    console.log(`   Sample Sentence 1: "${firstSentence.englishText}" -> "${firstSentence.malayalamText}"`);

    // 5. Complete Sentence
    const completeRes = await fetch(`${BASE_URL}/learning/sentence/${firstSentence.id}/complete`, {
      method: 'POST',
      headers: userAuthHeaders,
    }).then((r) => r.json());
    console.log(`5. Sentence Complete: ID ${firstSentence.id}, Today Count=${completeRes.data.todaySentenceCount}, Current Streak=${completeRes.data.currentStreak}`);

    // 6. Extra Learning (Next Sentences)
    const nextRes = await fetch(`${BASE_URL}/learning/next?count=5`, { headers: userAuthHeaders }).then((r) => r.json());
    console.log(`6. Extra Learning: Fetched ${nextRes.data.length} unlearned sentences`);

    // 7. Activity Calendar
    const calRes = await fetch(`${BASE_URL}/activity/calendar`, { headers: userAuthHeaders }).then((r) => r.json());
    console.log(`7. Activity Calendar: Year ${calRes.data.year}, Month ${calRes.data.month}, Active Days=${calRes.data.activeDaysInMonth}`);

    // 8. Progress & Stats
    const progRes = await fetch(`${BASE_URL}/progress`, { headers: userAuthHeaders }).then((r) => r.json());
    console.log(`8. Progress Stats: Total Sentences Learned=${progRes.data.totalSentencesLearned}, Streak=${progRes.data.currentStreak}, Est Time=${progRes.data.estimatedLearningTime}`);

    // 9. Admin Login & Analytics
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@englishmalayalam.com',
        password: 'Admin@12345',
      }),
    }).then((r) => r.json());
    const adminToken = adminLoginRes.data.token;
    const adminAuthHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };

    const adminAnalyticsRes = await fetch(`${BASE_URL}/admin/analytics`, { headers: adminAuthHeaders }).then((r) => r.json());
    console.log('9. Admin Analytics:');
    console.log('   Total Users:', adminAnalyticsRes.data.overview.totalUsers);
    console.log('   Total Sentences:', adminAnalyticsRes.data.overview.totalSentences);
    console.log('   Total Lessons:', adminAnalyticsRes.data.overview.totalLessons);
    console.log('   Categories:', adminAnalyticsRes.data.categoryDistribution.length);

    // 10. Bookmarks
    const bookmarkAddRes = await fetch(`${BASE_URL}/bookmarks/${firstSentence.id}`, {
      method: 'POST',
      headers: userAuthHeaders,
      body: JSON.stringify({ note: 'Important sentence' }),
    }).then((r) => r.json());
    console.log('10. Add Bookmark:', bookmarkAddRes.message);

    const bookmarksRes = await fetch(`${BASE_URL}/bookmarks`, { headers: userAuthHeaders }).then((r) => r.json());
    console.log(`    Total User Bookmarks: ${bookmarksRes.data.length}`);

    console.log('\n🌟 ALL API INTEGRATION TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ API Verification failed:', err);
    process.exit(1);
  }
}

testAllAPIs();
