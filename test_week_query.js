const mysql = require('mysql2/promise');

async function testWeekQuery() {
  const connection = await mysql.createConnection({
    host: '102.130.125.52',
    port: 3306,
    user: 'impulsep_bryan',
    password: '@bo9511221.qwerty',
    database: 'impulsep_moonsun'
  });

  try {
    console.log('🧪 Testing the exact week calculation from the server...\n');

    // Simulate the server's week calculation
    const now = new Date();
    console.log(`📅 Current time: ${now.toString()}`);
    console.log(`📅 Current time (ISO): ${now.toISOString()}`);
    console.log(`📅 Current time (UTC): ${now.toUTCString()}\n`);

    // Server's week start calculation (Monday)
    const weekStart = new Date(now);
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 1, Sunday = 0
    weekStart.setDate(now.getDate() - daysToSubtract);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Add 6 days to get to Sunday
    weekEnd.setHours(23, 59, 59, 999); // End of day

    console.log(`🔍 Server's week calculation:`);
    console.log(`  - Day of week: ${dayOfWeek} (0=Sunday, 1=Monday, etc.)`);
    console.log(`  - Days to subtract: ${daysToSubtract}`);
    console.log(`  - Week start: ${weekStart.toString()}`);
    console.log(`  - Week end: ${weekEnd.toString()}`);
    console.log(`  - Week start (ISO): ${weekStart.toISOString()}`);
    console.log(`  - Week end (ISO): ${weekEnd.toISOString()}`);
    console.log(`  - Week start (UTC): ${weekStart.toUTCString()}`);
    console.log(`  - Week end (UTC): ${weekEnd.toUTCString()}\n`);

    // Test the exact query with these parameters
    console.log('🔍 Testing database query with server parameters...\n');

    const [feedbackReports] = await connection.execute(`
      SELECT COUNT(*) as count, 
             MIN(createdAt) as earliest,
             MAX(createdAt) as latest
      FROM FeedbackReport 
      WHERE createdAt BETWEEN ? AND ? AND userId = 94
    `, [weekStart, weekEnd]);

    const [productReports] = await connection.execute(`
      SELECT COUNT(*) as count, 
             MIN(createdAt) as earliest,
             MAX(createdAt) as latest
      FROM ProductReport 
      WHERE createdAt BETWEEN ? AND ? AND userId = 94
    `, [weekStart, weekEnd]);

    const [visibilityReports] = await connection.execute(`
      SELECT COUNT(*) as count, 
             MIN(createdAt) as earliest,
             MAX(createdAt) as latest
      FROM VisibilityReport 
      WHERE createdAt BETWEEN ? AND ? AND userId = 94
    `, [weekStart, weekEnd]);

    console.log('📊 Query results with server parameters:');
    console.log(`  - Feedback reports: ${feedbackReports[0].count}`);
    if (feedbackReports[0].count > 0) {
      console.log(`    Earliest: ${feedbackReports[0].earliest}`);
      console.log(`    Latest: ${feedbackReports[0].latest}`);
    }
    
    console.log(`  - Product reports: ${productReports[0].count}`);
    if (productReports[0].count > 0) {
      console.log(`    Earliest: ${productReports[0].earliest}`);
      console.log(`    Latest: ${productReports[0].latest}`);
    }
    
    console.log(`  - Visibility reports: ${visibilityReports[0].count}`);
    if (visibilityReports[0].count > 0) {
      console.log(`    Earliest: ${visibilityReports[0].earliest}`);
      console.log(`    Latest: ${visibilityReports[0].latest}`);
    }

    // Now let's check what reports exist for user 94 on September 1st specifically
    console.log('\n🔍 Checking reports for user 94 on September 1st specifically...\n');
    
    const september1Start = new Date('2025-09-01T00:00:00.000Z');
    const september1End = new Date('2025-09-01T23:59:59.999Z');
    
    console.log(`📅 September 1st range:`);
    console.log(`  - Start: ${september1Start.toISOString()}`);
    console.log(`  - End: ${september1End.toISOString()}`);

    const [sept1Feedback] = await connection.execute(`
      SELECT COUNT(*) as count, 
             MIN(createdAt) as earliest,
             MAX(createdAt) as latest
      FROM FeedbackReport 
      WHERE createdAt BETWEEN ? AND ? AND userId = 94
    `, [september1Start, september1End]);

    const [sept1Product] = await connection.execute(`
      SELECT COUNT(*) as count, 
             MIN(createdAt) as earliest,
             MAX(createdAt) as latest
      FROM ProductReport 
      WHERE createdAt BETWEEN ? AND ? AND userId = 94
    `, [september1Start, september1End]);

    const [sept1Visibility] = await connection.execute(`
      SELECT COUNT(*) as count, 
             MIN(createdAt) as earliest,
             MAX(createdAt) as latest
      FROM VisibilityReport 
      WHERE createdAt BETWEEN ? AND ? AND userId = 94
    `, [september1Start, september1End]);

    console.log('📊 September 1st results for user 94:');
    console.log(`  - Feedback reports: ${sept1Feedback[0].count}`);
    if (sept1Feedback[0].count > 0) {
      console.log(`    Earliest: ${sept1Feedback[0].earliest}`);
      console.log(`    Latest: ${sept1Feedback[0].latest}`);
    }
    
    console.log(`  - Product reports: ${sept1Product[0].count}`);
    if (sept1Product[0].count > 0) {
      console.log(`    Earliest: ${sept1Product[0].earliest}`);
      console.log(`    Latest: ${sept1Product[0].latest}`);
    }
    
    console.log(`  - Visibility reports: ${sept1Visibility[0].count}`);
    if (sept1Visibility[0].count > 0) {
      console.log(`    Earliest: ${sept1Visibility[0].earliest}`);
      console.log(`    Latest: ${sept1Visibility[0].latest}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testWeekQuery();
