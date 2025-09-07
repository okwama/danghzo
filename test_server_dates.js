console.log('🧪 Testing server date calculation logic...\n');

// Simulate the server's exact date calculation
function getWeekStart(date) {
  const weekday = date.getDay();
  // getDay() returns: 0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday
  // We want Monday to be day 0, so:
  // Monday (1) -> 0 days to subtract
  // Tuesday (2) -> 1 day to subtract
  // Wednesday (3) -> 2 days to subtract
  // Thursday (4) -> 3 days to subtract
  // Friday (5) -> 4 days to subtract
  // Saturday (6) -> 5 days to subtract
  // Sunday (0) -> 6 days to subtract
  const daysToSubtract = weekday === 0 ? 6 : weekday - 1;
  
  const weekStart = new Date(date.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
  console.log(`📅 Original date: ${date.toISOString()}, weekday: ${weekday}, days to subtract: ${daysToSubtract}, week start: ${weekStart.toISOString()}`);
  
  return weekStart;
}

// Test with current date
const now = new Date();
console.log(`📅 Current time: ${now.toString()}`);
console.log(`📅 Current time (ISO): ${now.toISOString()}`);
console.log(`📅 Current time (UTC): ${now.toUTCString()}\n`);

const weekStart = getWeekStart(now);
const weekEnd = new Date(weekStart);
weekEnd.setDate(weekStart.getDate() + 6);
weekEnd.setHours(23, 59, 59, 999);

console.log(`📅 Week start: ${weekStart.toString()}`);
console.log(`📅 Week end: ${weekEnd.toString()}`);
console.log(`📅 Week start (ISO): ${weekStart.toISOString()}`);
console.log(`📅 Week end (ISO): ${weekEnd.toISOString()}`);
console.log(`📅 Week start (UTC): ${weekStart.toUTCString()}`);
console.log(`📅 Week end (UTC): ${weekEnd.toUTCString()}\n`);

// Now let's test the database query with these exact dates
const mysql = require('mysql2/promise');

async function testWithServerDates() {
  const connection = await mysql.createConnection({
    host: '102.130.125.52',
    port: 3306,
    user: 'impulsep_bryan',
    password: '@bo9511221.qwerty',
    database: 'impulsep_moonsun'
  });

  try {
    console.log('🔍 Testing database query with server date parameters...\n');

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

    console.log('📊 Query results with server date parameters:');
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

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testWithServerDates();
