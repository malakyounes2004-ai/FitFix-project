// Quick login test script
// Usage: node test-login.js

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';
const email = 'admin@gmail.com';
const password = 'admin123';

async function testLogin() {
  console.log('🧪 Testing Admin Login...\n');

  try {
    // Login
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const loginData = await loginResponse.json();

    if (!loginData.success) {
      console.error(`❌ Login failed: ${loginData.message}`);
      console.error('\nTroubleshooting:');
      console.error('  - Check that user exists in Firebase Auth');
      console.error('  - Verify password is correct');
      console.error('  - Ensure user document exists in Firestore with role="admin"');
      process.exit(1);
    }

    const token = loginData.token;
    console.log('✅ Login successful!');
    console.log(`👤 User: ${loginData.user.displayName}`);
    console.log(`📋 Role: ${loginData.user.role}`);
    console.log(`🔑 Token: ${token.substring(0, 30)}...\n`);

    // Test admin endpoint
    console.log('2. Testing admin endpoint (dashboard stats)...');
    const statsResponse = await fetch(`${API_BASE}/admin/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const statsData = await statsResponse.json();

    if (statsData.success) {
      console.log('✅ Admin endpoint accessible!');
      console.log(`📊 Total Users: ${statsData.stats.totalUsers}`);
      console.log(`📊 Total Employees: ${statsData.stats.totalEmployees}`);
      console.log(`📊 Total Subscriptions: ${statsData.stats.totalSubscriptions}\n`);
    } else {
      console.error(`❌ Failed: ${statsData.message}\n`);
    }

    console.log('✅ Test completed!\n');
    console.log('💡 To use this token in other requests:');
    console.log(`   Authorization: Bearer ${token}\n`);
    console.log('Example cURL:');
    console.log(`   curl http://localhost:3000/api/admin/dashboard/stats \\`);
    console.log(`     -H "Authorization: Bearer ${token}"\n`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error('\nMake sure the server is running: npm run dev');
    process.exit(1);
  }
}

testLogin();

