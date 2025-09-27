const mysql = require('mysql2/promise');

// Test configuration - update with your database credentials
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'impulsep_moonsun',
  multipleStatements: true
};

async function testBulkProductReports() {
  let connection;
  
  try {
    console.log('🚀 Testing Bulk Product Reports Stored Procedure');
    console.log('📊 Database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Test data - matches the Flutter app payload structure
    const testData = {
      journeyPlanId: 123,
      clientId: 456,
      userId: 789,
      products: [
        {
          productName: 'Coca Cola 500ml',
          quantity: 50,
          comment: 'Good stock levels',
          productId: 101
        },
        {
          productName: 'Pepsi 500ml',
          quantity: 30,
          comment: 'Low stock',
          productId: 102
        },
        {
          productName: 'Fanta Orange 500ml',
          quantity: 25,
          comment: 'Medium stock',
          productId: 103
        }
      ]
    };
    
    console.log('📋 Test data:', JSON.stringify(testData, null, 2));
    
    // Convert products to JSON for stored procedure
    const productsJson = JSON.stringify(testData.products);
    console.log('📋 Products JSON:', productsJson);
    
    // Call stored procedure
    console.log('🚀 Calling stored procedure...');
    const [results] = await connection.execute(
      'CALL BulkInsertProductReports(?, ?, ?, ?)',
      [testData.journeyPlanId, testData.clientId, testData.userId, productsJson]
    );
    
    console.log('✅ Stored procedure executed successfully');
    console.log('📊 Results:', JSON.stringify(results, null, 2));
    
    // Extract result from stored procedure response
    if (results && results.length > 0 && results[0].length > 0) {
      const procedureResult = results[0][0];
      console.log('📊 Procedure result:', procedureResult);
      
      if (procedureResult.status === 'SUCCESS') {
        console.log('✅ Bulk insert successful!');
        console.log(`📊 Inserted ${procedureResult.inserted_count} product reports`);
        console.log(`📊 Journey Plan ID: ${procedureResult.journey_plan_id}`);
        console.log(`📊 Client ID: ${procedureResult.client_id}`);
        console.log(`📊 User ID: ${procedureResult.user_id}`);
        
        // Verify the data was inserted correctly
        console.log('🔍 Verifying inserted data...');
        const [verificationResults] = await connection.execute(
          'SELECT * FROM ProductReport WHERE reportId = ? AND clientId = ? AND userId = ? ORDER BY createdAt DESC LIMIT ?',
          [testData.journeyPlanId, testData.clientId, testData.userId, testData.products.length]
        );
        
        console.log('📊 Verification results:', JSON.stringify(verificationResults, null, 2));
        console.log(`✅ Verified ${verificationResults.length} records inserted`);
        
        // Check if all products were inserted
        if (verificationResults.length === testData.products.length) {
          console.log('✅ All products were inserted successfully!');
        } else {
          console.log(`⚠️ Expected ${testData.products.length} products, but found ${verificationResults.length}`);
        }
        
      } else {
        console.error('❌ Stored procedure returned error:', procedureResult.message);
      }
    } else {
      console.error('❌ No results returned from stored procedure');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testBulkProductReports()
  .then(() => {
    console.log('🏁 Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });

