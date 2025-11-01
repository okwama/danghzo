// Test Competitor Report API endpoints
async function testCompetitorReport() {
  const baseURL = 'http://localhost:3000/api';
  // Update these with your test credentials
  const phoneNumber = '0706166875'; // Change to your test user phone
  const password = 'password'; // Change to your test user password
  
  console.log('🧪 Testing Competitor Report System');
  console.log('====================================');
  
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
      const errorText = await loginResponse.text();
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}\n${errorText}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('🔍 Login response:', JSON.stringify(loginData, null, 2));
    
    const token = loginData.accessToken || loginData.access_token;
    const userId = loginData.salesRep?.id || loginData.user?.id;
    
    if (!token) {
      throw new Error('No access token received from login');
    }
    
    console.log('✅ Login successful!');
    console.log('👤 User ID:', userId);
    console.log('🔑 Token received');
    
    // Step 2: Setup auth headers
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    // Step 3: Get a journey plan and client (you may need to adjust these IDs)
    console.log('\n📋 Step 2: Getting journey plans...');
    const journeyPlansResponse = await fetch(`${baseURL}/journey-plans`, {
      headers: authHeaders,
    });
    
    let journeyPlanId = null;
    let clientId = null;
    
    if (journeyPlansResponse.ok) {
      const journeyPlansData = await journeyPlansResponse.json();
      if (journeyPlansData.length > 0) {
        journeyPlanId = journeyPlansData[0].id;
        clientId = journeyPlansData[0].clientId;
        console.log('✅ Found journey plan:', journeyPlanId);
        console.log('✅ Client ID:', clientId);
      }
    }
    
    // If no journey plan, use test values (you'll need to create one first)
    if (!journeyPlanId) {
      console.log('⚠️ No journey plan found, using test values');
      journeyPlanId = 1; // Update with a valid journey plan ID
      clientId = 1; // Update with a valid client ID
    }
    
    // Step 4: Test submitting a single competitor report
    console.log('\n📊 Step 3: Testing single competitor report submission...');
    const singleCompetitorReport = {
      type: 'COMPETITOR',
      journeyPlanId: journeyPlanId,
      clientId: clientId,
      details: {
        competitorName: 'Test Competitor Brand',
        productName: 'Competitor Product A',
        price: 99.99,
        quantity: 50,
        promotion: '20% off sale',
        comment: 'Found competitor product in store aisle',
        imageUrl: 'https://example.com/competitor-image.jpg'
      }
    };
    
    console.log('📤 Sending single competitor report:', JSON.stringify(singleCompetitorReport, null, 2));
    
    const singleReportResponse = await fetch(`${baseURL}/reports`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(singleCompetitorReport),
    });
    
    const singleReportData = await singleReportResponse.json();
    console.log('📥 Response status:', singleReportResponse.status);
    console.log('📥 Response data:', JSON.stringify(singleReportData, null, 2));
    
    if (singleReportResponse.ok && singleReportData.success) {
      console.log('✅ Single competitor report submitted successfully!');
      console.log('📋 Report ID:', singleReportData.report?.id || singleReportData.specificReport?.id);
    } else {
      console.error('❌ Failed to submit single competitor report');
      console.error('Error:', singleReportData.error || singleReportData.message);
    }
    
    // Step 5: Test submitting multiple competitor reports (bulk)
    console.log('\n📊 Step 4: Testing bulk competitor reports submission...');
    const bulkCompetitorReport = {
      type: 'COMPETITOR',
      journeyPlanId: journeyPlanId,
      clientId: clientId,
      details: [
        {
          competitorName: 'Brand A',
          productName: 'Product A',
          price: 89.99,
          quantity: 30,
          comment: 'First competitor found'
        },
        {
          competitorName: 'Brand B',
          productName: 'Product B',
          price: 79.99,
          quantity: 25,
          promotion: 'Buy 2 Get 1 Free',
          comment: 'Second competitor found'
        },
        {
          competitorName: 'Brand C',
          productName: 'Product C',
          price: 109.99,
          quantity: 15,
          comment: 'Third competitor found'
        }
      ]
    };
    
    console.log('📤 Sending bulk competitor reports:', JSON.stringify(bulkCompetitorReport, null, 2));
    
    const bulkReportResponse = await fetch(`${baseURL}/reports`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(bulkCompetitorReport),
    });
    
    const bulkReportData = await bulkReportResponse.json();
    console.log('📥 Response status:', bulkReportResponse.status);
    console.log('📥 Response data:', JSON.stringify(bulkReportData, null, 2));
    
    if (bulkReportResponse.ok && bulkReportData.success) {
      console.log('✅ Bulk competitor reports submitted successfully!');
      console.log('📋 Report ID:', bulkReportData.report?.id || bulkReportData.specificReport?.id);
    } else {
      console.error('❌ Failed to submit bulk competitor reports');
      console.error('Error:', bulkReportData.error || bulkReportData.message);
    }
    
    // Step 6: Test getting reports by journey plan
    console.log('\n📋 Step 5: Testing get reports by journey plan...');
    const getReportsResponse = await fetch(`${baseURL}/reports/journey-plan/${journeyPlanId}`, {
      headers: authHeaders,
    });
    
    const getReportsData = await getReportsResponse.json();
    console.log('📥 Response status:', getReportsResponse.status);
    console.log('📥 Response data:', JSON.stringify(getReportsData, null, 2));
    
    if (getReportsResponse.ok && getReportsData.success) {
      const reports = getReportsData.data;
      console.log('✅ Retrieved reports successfully!');
      console.log(`📊 Feedback reports: ${reports.feedbackReports?.length || 0}`);
      console.log(`📊 Product reports: ${reports.productReports?.length || 0}`);
      console.log(`📊 Visibility reports: ${reports.visibilityReports?.length || 0}`);
      console.log(`📊 Competitor reports: ${reports.competitorReports?.length || 0}`);
      
      if (reports.competitorReports && reports.competitorReports.length > 0) {
        console.log('\n🏆 Competitor Reports Found:');
        reports.competitorReports.forEach((report, index) => {
          console.log(`  ${index + 1}. ${report.competitorName} - ${report.productName} ($${report.price})`);
        });
      }
    } else {
      console.error('❌ Failed to get reports');
      console.error('Error:', getReportsData.error || getReportsData.message);
    }
    
    // Step 7: Test getting report counts
    console.log('\n📊 Step 6: Testing get report counts...');
    const countsResponse = await fetch(`${baseURL}/reports/counts?journeyPlanId=${journeyPlanId}`, {
      headers: authHeaders,
    });
    
    const countsData = await countsResponse.json();
    console.log('📥 Response status:', countsResponse.status);
    console.log('📥 Response data:', JSON.stringify(countsData, null, 2));
    
    if (countsResponse.ok && countsData.success) {
      const counts = countsData.data;
      console.log('✅ Retrieved report counts successfully!');
      console.log(`📊 Feedback count: ${counts.feedbackCount}`);
      console.log(`📊 Product count: ${counts.productCount}`);
      console.log(`📊 Visibility count: ${counts.visibilityCount}`);
      console.log(`📊 Competitor count: ${counts.competitorCount}`);
      console.log(`📊 Total count: ${counts.totalCount}`);
    } else {
      console.error('❌ Failed to get report counts');
      console.error('Error:', countsData.error || countsData.message);
    }
    
    console.log('\n✅ ===== TEST COMPLETE =====');
    console.log('All competitor report tests finished!');
    
  } catch (error) {
    console.error('\n❌ ===== TEST FAILED =====');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testCompetitorReport();

