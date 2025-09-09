;// Comprehensive test script to trace uplift sales process
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// Test data that matches what Flutter app sends
const testPayload = {
  clientId: 1,
  userId: 1,
  status: 'pending',
  totalAmount: 250.0,
  upliftSaleItems: [
    {
      productId: 1,
      quantity: 2,
      unitPrice: 100.0,
      total: 200.0
    },
    {
      productId: 2,
      quantity: 1,
      unitPrice: 50.0,
      total: 50.0
    }
  ]
};

async function traceUpliftSalesProcess() {
  console.log('🔍 Starting Uplift Sales Process Trace...\n');
  
  try {
    // Step 1: Check if server is running
    console.log('📡 Step 1: Checking server connectivity...');
    try {
      const healthCheck = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Server is running and responding');
    } catch (error) {
      console.log('❌ Server is not responding:', error.message);
      console.log('💡 Make sure the NestJS server is running on port 3000');
      return;
    }
    
    // Step 2: Check if uplift-sales endpoint exists
    console.log('\n📡 Step 2: Checking uplift-sales endpoint...');
    try {
      const response = await axios.get(`${API_BASE_URL}/uplift-sales`);
      console.log('✅ Uplift-sales endpoint is accessible');
      console.log(`📊 Found ${response.data.length} existing uplift sales`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('🔐 Endpoint requires authentication (this is expected)');
      } else {
        console.log('❌ Uplift-sales endpoint error:', error.response?.data || error.message);
      }
    }
    
    // Step 3: Test the payload structure
    console.log('\n📦 Step 3: Analyzing payload structure...');
    console.log('📋 Payload being sent:');
    console.log(JSON.stringify(testPayload, null, 2));
    
    console.log('\n🔍 Payload analysis:');
    console.log(`   - clientId: ${testPayload.clientId} (type: ${typeof testPayload.clientId})`);
    console.log(`   - userId: ${testPayload.userId} (type: ${typeof testPayload.userId})`);
    console.log(`   - status: "${testPayload.status}" (type: ${typeof testPayload.status})`);
    console.log(`   - totalAmount: ${testPayload.totalAmount} (type: ${typeof testPayload.totalAmount})`);
    console.log(`   - upliftSaleItems: ${testPayload.upliftSaleItems.length} items`);
    
    testPayload.upliftSaleItems.forEach((item, index) => {
      console.log(`     Item ${index + 1}:`);
      console.log(`       - productId: ${item.productId} (type: ${typeof item.productId})`);
      console.log(`       - quantity: ${item.quantity} (type: ${typeof item.quantity})`);
      console.log(`       - unitPrice: ${item.unitPrice} (type: ${typeof item.unitPrice})`);
      console.log(`       - total: ${item.total} (type: ${typeof item.total})`);
    });
    
    // Step 4: Test database connectivity (if possible)
    console.log('\n🗄️ Step 4: Database connectivity check...');
    console.log('💡 Check the server logs for database connection status');
    
    // Step 5: Instructions for testing
    console.log('\n🧪 Step 5: Testing Instructions...');
    console.log('To test the uplift sales process:');
    console.log('1. Make sure the NestJS server is running');
    console.log('2. Check server logs for the debug messages we added');
    console.log('3. Try creating an uplift sale from the Flutter app');
    console.log('4. Watch the server console for these debug messages:');
    console.log('   - "🔍 UpliftSalesController: Received POST request"');
    console.log('   - "🔍 UpliftSalesService: Received create request"');
    console.log('   - "✅ UpliftSalesService: Created main uplift sale"');
    console.log('   - "✅ UpliftSalesService: Created X uplift sale items"');
    
    // Step 6: Common issues to check
    console.log('\n🔧 Step 6: Common Issues to Check...');
    console.log('1. Authentication: Make sure you have a valid JWT token');
    console.log('2. Database: Check if UpliftSale and UpliftSaleItem tables exist');
    console.log('3. Foreign Keys: Verify clientId and userId exist in their respective tables');
    console.log('4. Product IDs: Make sure the productId values exist in the Product table');
    console.log('5. Network: Check if the Flutter app can reach the backend');
    
    // Step 7: Manual test with curl (if no auth required)
    console.log('\n🌐 Step 7: Manual Test Command...');
    console.log('You can test manually with curl:');
    console.log(`curl -X POST ${API_BASE_URL}/uplift-sales \\`);
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
    console.log(`  -d '${JSON.stringify(testPayload)}'`);
    
  } catch (error) {
    console.error('❌ Error during trace:', error.message);
  }
}

// Run the trace
traceUpliftSalesProcess();
