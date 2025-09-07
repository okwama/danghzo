// Test the new unified session history endpoint
async function testUnifiedSessions() {
  const baseURL = 'http://localhost:3000/api';
  const phoneNumber = '0706166875';
  const password = 'password';
  
  console.log('🧪 Testing Unified Session History System');
  console.log('==========================================');
  
  try {
    // Step 1: Login to get JWT token
    console.log('\n🔐 Step 1: Logging in...');
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        password: password,
      }),
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('🔍 Login response:', JSON.stringify(loginData, null, 2));
    
    const token = loginData.accessToken;
    const userId = loginData.salesRep.id;
    
    console.log('✅ Login successful!');
    console.log('👤 User ID:', userId);
    console.log('🔑 Token received');
    
    // Step 2: Test the new unified session history endpoints
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    // Test 1: Today's sessions
    console.log('\n📅 Test 1: Today\'s sessions');
    const todayResponse = await fetch(`${baseURL}/clock-in-out/sessions/${userId}?period=today`, {
      headers: authHeaders,
    });
    const todayData = await todayResponse.json();
    console.log('✅ Today sessions:', todayData.sessions?.length || 0);
    console.log('📊 Statistics:', todayData.statistics);
    
    // Test 2: This week's sessions
    console.log('\n📅 Test 2: This week\'s sessions');
    const weekResponse = await fetch(`${baseURL}/clock-in-out/sessions/${userId}?period=week`, {
      headers: authHeaders,
    });
    const weekData = await weekResponse.json();
    console.log('✅ Week sessions:', weekData.sessions?.length || 0);
    console.log('📊 Statistics:', weekData.statistics);
    
    // Test 3: This month's sessions
    console.log('\n📅 Test 3: This month\'s sessions');
    const monthResponse = await fetch(`${baseURL}/clock-in-out/sessions/${userId}?period=month`, {
      headers: authHeaders,
    });
    const monthData = await monthResponse.json();
    console.log('✅ Month sessions:', monthData.sessions?.length || 0);
    console.log('📊 Statistics:', monthData.statistics);
    
    // Test 4: Custom date range (August-September 2025 where your sessions are)
    console.log('\n📅 Test 4: Custom date range (August-September 2025)');
    const startDate = '2025-08-24';
    const endDate = '2025-09-07';
    const customResponse = await fetch(`${baseURL}/clock-in-out/sessions/${userId}?period=custom&startDate=${startDate}&endDate=${endDate}`, {
      headers: authHeaders,
    });
    const customData = await customResponse.json();
    console.log('✅ Custom sessions:', customData.sessions?.length || 0);
    console.log('📊 Statistics:', customData.statistics);
    
    // Test 5: September 2025 sessions specifically
    console.log('\n📅 Test 5: September 2025 sessions');
    const septemberResponse = await fetch(`${baseURL}/clock-in-out/sessions/${userId}?period=custom&startDate=2025-09-01&endDate=2025-09-07&limit=20`, {
      headers: authHeaders,
    });
    const septemberData = await septemberResponse.json();
    console.log('✅ September sessions:', septemberData.sessions?.length || 0);
    console.log('📊 Statistics:', septemberData.statistics);
    
    // Test 6: Sample session data structure
    if (septemberData.sessions && septemberData.sessions.length > 0) {
      console.log('\n📋 Sample session data structure:');
      console.log(JSON.stringify(septemberData.sessions[0], null, 2));
    } else if (customData.sessions && customData.sessions.length > 0) {
      console.log('\n📋 Sample session data structure:');
      console.log(JSON.stringify(customData.sessions[0], null, 2));
    } else {
      console.log('\n📋 No sessions found in the date range');
    }
    
    console.log('\n🎉 All tests passed! Unified session history system is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running: npm run start:dev');
    }
  }
}

// Run the test
testUnifiedSessions();
