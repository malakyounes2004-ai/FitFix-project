// Complete API test script
// Tests all endpoints with proper authentication
// Usage: node test-all-endpoints.js

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

// Test credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

let adminToken = '';

// Helper function to make requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { response, data, success: response.ok };
  } catch (error) {
    return { error: error.message, success: false };
  }
}

// Test functions
async function testLogin() {
  console.log('\n📝 Testing: POST /auth/login');
  const result = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })
  });

  if (result.success && result.data.success) {
    adminToken = result.data.token;
    console.log('✅ Login successful');
    console.log(`   User: ${result.data.user.displayName} (${result.data.user.role})`);
    console.log(`   Token: ${adminToken.substring(0, 30)}...`);
    return true;
  } else {
    console.log('❌ Login failed:', result.data?.message || result.error);
    return false;
  }
}

async function testGetProfile() {
  console.log('\n📝 Testing: GET /auth/profile');
  const result = await makeRequest(`${API_BASE}/auth/profile`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  if (result.success && result.data.success) {
    console.log('✅ Profile retrieved');
    console.log(`   Email: ${result.data.user.email}`);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.message || result.error);
    return false;
  }
}

async function testGetUserProfile() {
  console.log('\n📝 Testing: GET /user/profile');
  const result = await makeRequest(`${API_BASE}/user/profile`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  if (result.success && result.data.success) {
    console.log('✅ User profile retrieved');
    return true;
  } else {
    console.log('❌ Failed:', result.data?.message || result.error);
    return false;
  }
}

async function testGetUserProgress() {
  console.log('\n📝 Testing: GET /user/progress');
  const result = await makeRequest(`${API_BASE}/user/progress`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  if (result.success && result.data.success) {
    console.log('✅ Progress retrieved');
    console.log(`   Found ${result.data.progress.length} entries`);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.message || result.error);
    return false;
  }
}

async function testAddProgress() {
  console.log('\n📝 Testing: POST /user/progress');
  const result = await makeRequest(`${API_BASE}/user/progress`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      weight: 70,
      bodyFat: 25,
      workoutCompleted: true,
      mealPlanFollowed: true,
      notes: 'Test entry'
    })
  });

  if (result.success && result.data.success) {
    console.log('✅ Progress added');
    console.log(`   Progress ID: ${result.data.progressId}`);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.message || result.error);
    return false;
  }
}

async function testUpdateProfile() {
  console.log('\n📝 Testing: PATCH /user/profile');
  const result = await makeRequest(`${API_BASE}/user/profile`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      displayName: 'Admin Updated'
    })
  });

  if (result.success && result.data.success) {
    console.log('✅ Profile updated');
    return true;
  } else {
    console.log('❌ Failed:', result.data?.message || result.error);
    return false;
  }
}

async function testGetAdminUsers() {
  console.log('\n📝 Testing: GET /admin/users');
  const result = await makeRequest(`${API_BASE}/admin/users`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  if (result.success && result.data.success) {
    console.log('✅ Users retrieved');
    console.log(`   Total users: ${result.data.count}`);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.message || result.error);
    return false;
  }
}

async function testGetAdminEmployees() {
  console.log('\n📝 Testing: GET /admin/employees');
  const result = await makeRequest(`${API_BASE}/admin/employees`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  if (result.success && result.data.success) {
    console.log('✅ Employees retrieved');
    console.log(`   Total employees: ${result.data.count}`);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.message || result.error);
    return false;
  }
}

async function testCreateEmployee() {
  console.log('\n📝 Testing: POST /admin/employees');
  const result = await makeRequest(`${API_BASE}/admin/employees`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: `coach${Date.now()}@fitfix.com`,
      password: 'coach123',
      displayName: 'Test Coach'
    })
  });

  if (result.success && result.data.success) {
    console.log('✅ Employee created');
    console.log(`   Employee UID: ${result.data.employee.uid}`);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.message || result.error);
    return false;
  }
}

async function testGetDashboardStats() {
  console.log('\n📝 Testing: GET /admin/dashboard/stats');
  const result = await makeRequest(`${API_BASE}/admin/dashboard/stats`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  if (result.success && result.data.success) {
    console.log('✅ Dashboard stats retrieved');
    console.log(`   Total Users: ${result.data.stats.totalUsers}`);
    console.log(`   Total Employees: ${result.data.stats.totalEmployees}`);
    return true;
  } else {
    console.log('❌ Failed:', result.data?.message || result.error);
    return false;
  }
}

async function testInvalidRoute() {
  console.log('\n📝 Testing: Invalid route (should return 404)');
  const result = await makeRequest(`${API_BASE}/invalid/route`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  if (!result.success && result.data?.message === 'Route not found') {
    console.log('✅ Correctly returns 404 for invalid route');
    return true;
  } else {
    console.log('❌ Unexpected response');
    return false;
  }
}

async function testUnauthorized() {
  console.log('\n📝 Testing: Request without token (should return 401)');
  const result = await makeRequest(`${API_BASE}/user/profile`);

  if (!result.success && result.data?.message?.includes('Unauthorized')) {
    console.log('✅ Correctly returns 401 for missing token');
    return true;
  } else {
    console.log('❌ Unexpected response');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 FitFix API - Complete Endpoint Tests');
  console.log('=' .repeat(50));

  const results = [];

  // Must login first
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot continue without valid token');
    process.exit(1);
  }

  // Auth endpoints
  results.push(await testGetProfile());

  // User endpoints
  results.push(await testGetUserProfile());
  results.push(await testGetUserProgress());
  results.push(await testAddProgress());
  results.push(await testUpdateProfile());

  // Admin endpoints
  results.push(await testGetAdminUsers());
  results.push(await testGetAdminEmployees());
  results.push(await testCreateEmployee());
  results.push(await testGetDashboardStats());

  // Error handling
  results.push(await testInvalidRoute());
  results.push(await testUnauthorized());

  // Summary
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`\n📊 Test Results: ${passed}/${total} passed`);

  if (passed === total) {
    console.log('✅ All tests passed!\n');
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed\n`);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

