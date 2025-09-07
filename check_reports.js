const mysql = require('mysql2/promise');

async function checkReports() {
  const connection = await mysql.createConnection({
    host: '102.130.125.52',
    port: 3306,
    user: 'impulsep_bryan',
    password: '@bo9511221.qwerty',
    database: 'impulsep_moonsun'
  });

  try {
    console.log('🔍 Checking reports for current month...\n');

    // Get current month start and end
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    console.log(`📅 Month range: ${monthStart.toISOString()} to ${monthEnd.toISOString()}`);
    console.log(`📅 Month start: ${monthStart.toDateString()}`);
    console.log(`📅 Month end: ${monthEnd.toDateString()}\n`);

    // Check total reports this month
    const [totalReports] = await connection.execute(`
      SELECT 
        'FeedbackReport' as table_name, 
        COUNT(*) as count,
        MIN(createdAt) as earliest,
        MAX(createdAt) as latest
      FROM FeedbackReport 
      WHERE createdAt BETWEEN ? AND ?
      UNION ALL
      SELECT 
        'ProductReport' as table_name, 
        COUNT(*) as count,
        MIN(createdAt) as earliest,
        MAX(createdAt) as latest
      FROM ProductReport 
      WHERE createdAt BETWEEN ? AND ?
      UNION ALL
      SELECT 
        'VisibilityReport' as table_name, 
        COUNT(*) as count,
        MIN(createdAt) as earliest,
        MAX(createdAt) as latest
      FROM VisibilityReport 
      WHERE createdAt BETWEEN ? AND ?
    `, [monthStart, monthEnd, monthStart, monthEnd, monthStart, monthEnd]);

    console.log('📊 Total reports this month:');
    totalReports.forEach(report => {
      console.log(`  - ${report.table_name}: ${report.count} reports`);
      if (report.count > 0) {
        console.log(`    Earliest: ${report.earliest}`);
        console.log(`    Latest: ${report.latest}`);
      }
    });

    console.log('\n🔍 Checking reports for user 94 specifically...\n');

    // Check reports for user 94 this month
    const [userReports] = await connection.execute(`
      SELECT 
        'FeedbackReport' as table_name, 
        COUNT(*) as count,
        MIN(createdAt) as earliest,
        MAX(createdAt) as latest
      FROM FeedbackReport 
      WHERE userId = 94 AND createdAt BETWEEN ? AND ?
      UNION ALL
      SELECT 
        'ProductReport' as table_name, 
        COUNT(*) as count,
        MIN(createdAt) as earliest,
        MAX(createdAt) as latest
      FROM ProductReport 
      WHERE userId = 94 AND createdAt BETWEEN ? AND ?
      UNION ALL
      SELECT 
        'VisibilityReport' as table_name, 
        COUNT(*) as count,
        MIN(createdAt) as earliest,
        MAX(createdAt) as latest
      FROM VisibilityReport 
      WHERE userId = 94 AND createdAt BETWEEN ? AND ?
    `, [monthStart, monthEnd, monthStart, monthEnd, monthStart, monthEnd]);

    console.log('👤 Reports for user 94 this month:');
    userReports.forEach(report => {
      console.log(`  - ${report.table_name}: ${report.count} reports`);
      if (report.count > 0) {
        console.log(`    Earliest: ${report.earliest}`);
        console.log(`    Latest: ${report.latest}`);
      }
    });

    console.log('\n🔍 Checking all reports for user 94 (any time)...\n');

    // Check all reports for user 94 (any time)
    const [allUserReports] = await connection.execute(`
      SELECT 
        'FeedbackReport' as table_name, 
        COUNT(*) as count,
        MIN(createdAt) as earliest,
        MAX(createdAt) as latest
      FROM FeedbackReport 
      WHERE userId = 94
      UNION ALL
      SELECT 
        'ProductReport' as table_name, 
        COUNT(*) as count,
        MIN(createdAt) as earliest,
        MAX(createdAt) as latest
      FROM ProductReport 
      WHERE userId = 94
      UNION ALL
      SELECT 
        'VisibilityReport' as table_name, 
        COUNT(*) as count,
        MIN(createdAt) as earliest,
        MAX(createdAt) as latest
      FROM VisibilityReport 
      WHERE userId = 94
    `);

    console.log('👤 All reports for user 94 (any time):');
    allUserReports.forEach(report => {
      console.log(`  - ${report.table_name}: ${report.count} reports`);
      if (report.count > 0) {
        console.log(`    Earliest: ${report.earliest}`);
        console.log(`    Latest: ${report.latest}`);
      }
    });

    console.log('\n🔍 Checking current week specifically...\n');

    // Check current week (Monday to Sunday)
    const currentWeekStart = new Date(now);
    const dayOfWeek = now.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 1, Sunday = 0
    currentWeekStart.setDate(now.getDate() - daysToSubtract);
    currentWeekStart.setHours(0, 0, 0, 0);

    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    console.log(`📅 Current week: ${currentWeekStart.toDateString()} to ${currentWeekEnd.toDateString()}`);
    console.log(`📅 Week start: ${currentWeekStart.toISOString()}`);
    console.log(`📅 Week end: ${currentWeekEnd.toISOString()}\n`);

    // Check reports for current week
    const [weekReports] = await connection.execute(`
      SELECT 
        'FeedbackReport' as table_name, 
        COUNT(*) as count
      FROM FeedbackReport 
      WHERE createdAt BETWEEN ? AND ?
      UNION ALL
      SELECT 
        'ProductReport' as table_name, 
        COUNT(*) as count
      FROM ProductReport 
      WHERE createdAt BETWEEN ? AND ?
      UNION ALL
      SELECT 
        'VisibilityReport' as table_name, 
        COUNT(*) as count
      FROM VisibilityReport 
      WHERE createdAt BETWEEN ? AND ?
    `, [currentWeekStart, currentWeekEnd, currentWeekStart, currentWeekEnd, currentWeekStart, currentWeekEnd]);

    console.log('📅 Reports for current week:');
    weekReports.forEach(report => {
      console.log(`  - ${report.table_name}: ${report.count} reports`);
    });

    // Check reports for user 94 in current week
    const [userWeekReports] = await connection.execute(`
      SELECT 
        'FeedbackReport' as table_name, 
        COUNT(*) as count
      FROM FeedbackReport 
      WHERE userId = 94 AND createdAt BETWEEN ? AND ?
      UNION ALL
      SELECT 
        'ProductReport' as table_name, 
        COUNT(*) as count
      FROM ProductReport 
      WHERE userId = 94 AND createdAt BETWEEN ? AND ?
      UNION ALL
      SELECT 
        'VisibilityReport' as table_name, 
        COUNT(*) as count
      FROM VisibilityReport 
      WHERE userId = 94 AND createdAt BETWEEN ? AND ?
    `, [currentWeekStart, currentWeekEnd, currentWeekStart, currentWeekEnd, currentWeekStart, currentWeekEnd]);

    console.log('\n👤 Reports for user 94 in current week:');
    userWeekReports.forEach(report => {
      console.log(`  - ${report.table_name}: ${report.count} reports`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkReports();
