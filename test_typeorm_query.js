const { DataSource } = require('typeorm');
const { FeedbackReport } = require('./dist/entities/feedback-report.entity').FeedbackReport;
const { ProductReport } = require('./dist/entities/product-report.entity').ProductReport;
const { VisibilityReport } = require('./dist/entities/visibility-report.entity').VisibilityReport;
const { Between } = require('typeorm');

async function testTypeORMQuery() {
  console.log('🧪 Testing TypeORM query vs Direct MySQL query...\n');

  // Create TypeORM connection
  const dataSource = new DataSource({
    type: 'mysql',
    host: '102.130.125.52',
    port: 3306,
    username: 'impulsep_bryan',
    password: '@bo9511221.qwerty',
    database: 'impulsep_moonsun',
    entities: [FeedbackReport, ProductReport, VisibilityReport],
    synchronize: false,
    logging: true, // Enable query logging
  });

  try {
    await dataSource.initialize();
    console.log('✅ TypeORM initialized\n');

    // Calculate week start/end (same logic as server)
    const now = new Date();
    const weekday = now.getDay();
    const daysToSubtract = weekday === 0 ? 6 : weekday - 1;
    const weekStart = new Date(now.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    console.log(`📅 Week start: ${weekStart.toISOString()}`);
    console.log(`📅 Week end: ${weekEnd.toISOString()}\n`);

    // Get repositories
    const feedbackRepo = dataSource.getRepository(FeedbackReport);
    const productRepo = dataSource.getRepository(ProductReport);
    const visibilityRepo = dataSource.getRepository(VisibilityReport);

    console.log('🔍 Testing TypeORM queries...\n');

    // Test feedback reports
    const feedbackReports = await feedbackRepo.find({
      where: {
        createdAt: Between(weekStart, weekEnd),
        userId: 94,
      },
      relations: ['client', 'user'],
    });

    console.log(`📊 TypeORM Feedback reports: ${feedbackReports.length}`);
    if (feedbackReports.length > 0) {
      console.log(`  - First report: ${feedbackReports[0].createdAt}`);
      console.log(`  - Client ID: ${feedbackReports[0].clientId}`);
      console.log(`  - User ID: ${feedbackReports[0].userId}`);
    }

    // Test product reports
    const productReports = await productRepo.find({
      where: {
        createdAt: Between(weekStart, weekEnd),
        userId: 94,
      },
      relations: ['client', 'user'],
    });

    console.log(`📊 TypeORM Product reports: ${productReports.length}`);
    if (productReports.length > 0) {
      console.log(`  - First report: ${productReports[0].createdAt}`);
      console.log(`  - Client ID: ${productReports[0].clientId}`);
      console.log(`  - User ID: ${productReports[0].userId}`);
    }

    // Test visibility reports
    const visibilityReports = await visibilityRepo.find({
      where: {
        createdAt: Between(weekStart, weekEnd),
        userId: 94,
      },
      relations: ['client', 'user'],
    });

    console.log(`📊 TypeORM Visibility reports: ${visibilityReports.length}`);
    if (visibilityReports.length > 0) {
      console.log(`  - First report: ${visibilityReports[0].createdAt}`);
      console.log(`  - Client ID: ${visibilityReports[0].clientId}`);
      console.log(`  - User ID: ${visibilityReports[0].userId}`);
    }

    console.log('\n🔍 Summary:');
    console.log(`  - Total reports found: ${feedbackReports.length + productReports.length + visibilityReports.length}`);
    console.log(`  - Should return empty: ${feedbackReports.length === 0 && productReports.length === 0 && visibilityReports.length === 0}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

testTypeORMQuery();
