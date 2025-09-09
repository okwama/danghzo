// Test script to verify uplift sales payload validation
const axios = require('axios');

const API_BASE_URL = 'http://192.168.100.2:3000/api';

// Test payloads to check validation
const testPayloads = [
  {
    name: "Complete payload with userId",
    payload: {
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
    }
  },
  {
    name: "Payload without userId (what might be happening)",
    payload: {
      clientId: 1,
      status: 'pending',
      totalAmount: 250.0,
      upliftSaleItems: [
        {
          productId: 1,
          quantity: 2,
          unitPrice: 100.0,
          total: 200.0
        }
      ]
    }
  },
  {
    name: "Payload with null userId",
    payload: {
      clientId: 1,
      userId: null,
      status: 'pending',
      totalAmount: 250.0,
      upliftSaleItems: [
        {
          productId: 1,
          quantity: 2,
          unitPrice: 100.0,
          total: 200.0
        }
      ]
    }
  },
  {
    name: "Payload with string userId",
    payload: {
      clientId: 1,
      userId: "1",
      status: 'pending',
      totalAmount: 250.0,
      upliftSaleItems: [
        {
          productId: 1,
          quantity: 2,
          unitPrice: 100.0,
          total: 200.0
        }
      ]
    }
  }
];

async function testPayloadValidation() {
  console.log('🧪 Testing Uplift Sales Payload Validation...\n');
  
  for (const test of testPayloads) {
    console.log(`📋 Testing: ${test.name}`);
    console.log('📦 Payload:', JSON.stringify(test.payload, null, 2));
    
    try {
      // Test without authentication first to see validation errors
      const response = await axios.post(`${API_BASE_URL}/uplift-sales`, test.payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Response:', response.status, response.data);
    } catch (error) {
      if (error.response) {
        console.log('❌ Error:', error.response.status, error.response.data);
        
        // Check if it's a validation error or auth error
        if (error.response.status === 400) {
          console.log('🔍 This is a validation error - check the payload structure');
        } else if (error.response.status === 401) {
          console.log('🔐 This is an authentication error - payload structure is valid');
        }
      } else {
        console.log('❌ Network Error:', error.message);
      }
    }
    
    console.log('---\n');
  }
  
  console.log('💡 Analysis:');
  console.log('1. If you see 401 errors, the payload structure is valid but needs authentication');
  console.log('2. If you see 400 errors, there are validation issues with the payload');
  console.log('3. The Flutter app might be missing userId in the payload');
}

// Run the test
testPayloadValidation();
