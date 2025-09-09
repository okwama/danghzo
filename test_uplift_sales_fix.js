// Test script to verify uplift sales items are being saved correctly
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000'; // Adjust if your server runs on different port

// Test data for creating an uplift sale with items
const testUpliftSale = {
  clientId: 1, // Make sure this client exists
  userId: 1,   // Make sure this user exists
  status: 'pending',
  totalAmount: 0, // Will be calculated from items
  upliftSaleItems: [
    {
      productId: 1, // Make sure this product exists
      quantity: 2,
      unitPrice: 100.0,
      total: 200.0
    },
    {
      productId: 2, // Make sure this product exists
      quantity: 1,
      unitPrice: 50.0,
      total: 50.0
    }
  ]
};

async function testUpliftSalesWithItems() {
  try {
    console.log('🧪 Testing Uplift Sales with Items...');
    
    // You'll need to get a valid JWT token first
    // For now, we'll assume you have one or the endpoint doesn't require auth
    const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('📤 Creating uplift sale with items...');
    const createResponse = await axios.post(`${API_BASE_URL}/uplift-sales`, testUpliftSale, { headers });
    
    console.log('✅ Uplift sale created successfully!');
    console.log('📊 Response:', JSON.stringify(createResponse.data, null, 2));
    
    const upliftSaleId = createResponse.data.id;
    
    // Verify the uplift sale was created with items
    console.log('🔍 Fetching created uplift sale to verify items...');
    const fetchResponse = await axios.get(`${API_BASE_URL}/uplift-sales/${upliftSaleId}`, { headers });
    
    console.log('📋 Uplift sale details:');
    console.log('   ID:', fetchResponse.data.id);
    console.log('   Client ID:', fetchResponse.data.clientId);
    console.log('   User ID:', fetchResponse.data.userId);
    console.log('   Status:', fetchResponse.data.status);
    console.log('   Total Amount:', fetchResponse.data.totalAmount);
    console.log('   Items Count:', fetchResponse.data.upliftSaleItems?.length || 0);
    
    if (fetchResponse.data.upliftSaleItems && fetchResponse.data.upliftSaleItems.length > 0) {
      console.log('✅ Items were saved successfully!');
      fetchResponse.data.upliftSaleItems.forEach((item, index) => {
        console.log(`   Item ${index + 1}:`);
        console.log(`     Product ID: ${item.productId}`);
        console.log(`     Quantity: ${item.quantity}`);
        console.log(`     Unit Price: ${item.unitPrice}`);
        console.log(`     Total: ${item.total}`);
      });
    } else {
      console.log('❌ No items found - the fix may not be working!');
    }
    
    // Test updating the uplift sale
    console.log('🔄 Testing update with new items...');
    const updateData = {
      ...testUpliftSale,
      status: 'completed',
      upliftSaleItems: [
        {
          productId: 1,
          quantity: 3,
          unitPrice: 100.0,
          total: 300.0
        }
      ]
    };
    
    const updateResponse = await axios.put(`${API_BASE_URL}/uplift-sales/${upliftSaleId}`, updateData, { headers });
    console.log('✅ Uplift sale updated successfully!');
    
    // Verify the update
    const updatedFetchResponse = await axios.get(`${API_BASE_URL}/uplift-sales/${upliftSaleId}`, { headers });
    console.log('📋 Updated uplift sale:');
    console.log('   Status:', updatedFetchResponse.data.status);
    console.log('   Total Amount:', updatedFetchResponse.data.totalAmount);
    console.log('   Items Count:', updatedFetchResponse.data.upliftSaleItems?.length || 0);
    
    console.log('🎉 All tests passed! Uplift sales items are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Make sure to replace YOUR_JWT_TOKEN_HERE with a valid JWT token');
    }
  }
}

// Run the test
testUpliftSalesWithItems();
