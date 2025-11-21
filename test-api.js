// Quick API test script
// Usage: node test-api.js

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing FitFix API\n');

  // Test 1: Health Check
  console.log('1. Testing health check...');
  try {
    const health = await fetch(`${API_BASE.replace('/api', '')}/`);
    const healthData = await health.json();
    console.log('   ✅ Server is running');
    console.log(`   📋 ${healthData.message}\n`);
  } catch (error) {
    console.error('   ❌ Server is not running!');
    console.error('   Start the server with: npm run dev\n');
    process.exit(1);
  }

  // Test 2: Login
  console.log('2. Testing login...');
  console.log('   Enter your credentials:');
  
  // For interactive input, you can modify this or pass credentials as args
  const email = process.argv[2] || 'admin@fitfix.com';
  const password = process.argv[3] || 'password123';

  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password ? '***' : '(not provided)'}\n`);

  if (!password || password === 'password123') {
    console.log('   ⚠️  Using default credentials. Provide your own:');
    console.log('   node test-api.js your-email@example.com your-password\n');
  }

  try {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const loginData = await loginResponse.json();

    if (!loginData.success) {
      console.error(`   ❌ Login failed: ${loginData.message}`);
      console.error('\n   Troubleshooting:');
      console.error('   - Check that user exists in Firebase Auth');
      console.error('   - Verify password is correct');
      console.error('   - Ensure user document exists in Firestore\n');
      process.exit(1);
    }

    const token = loginData.token;
    console.log('   ✅ Login successful');
    console.log(`   👤 User: ${loginData.user.displayName} (${loginData.user.role})`);
    console.log(`   🔑 Token: ${token.substring(0, 20)}...\n`);

    // Test 3: Get Profile
    console.log('3. Testing protected route (get profile)...');
    try {
      const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        console.log('   ✅ Profile retrieved successfully');
        console.log(`   📋 Email: ${profileData.user.email}`);
        console.log(`   📋 Role: ${profileData.user.role}\n`);
      } else {
        console.error(`   ❌ Failed: ${profileData.message}\n`);
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }

    // Test 4: Role-specific endpoint
    console.log('4. Testing role-specific endpoint...');
    const role = loginData.user.role;
    
    if (role === 'user') {
      try {
        const progressResponse = await fetch(`${API_BASE}/user/progress`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const progressData = await progressResponse.json();
        
        if (progressData.success) {
          console.log('   ✅ User progress endpoint accessible');
          console.log(`   📊 Found ${progressData.progress.length} progress entries\n`);
        } else {
          console.error(`   ❌ Failed: ${progressData.message}\n`);
        }
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
      }
    } else if (role === 'employee') {
      try {
        const usersResponse = await fetch(`${API_BASE}/employee/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const usersData = await usersResponse.json();
        
        if (usersData.success) {
          console.log('   ✅ Employee users endpoint accessible');
          console.log(`   📊 Found ${usersData.count} users\n`);
        } else {
          console.error(`   ❌ Failed: ${usersData.message}\n`);
        }
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
      }
    } else if (role === 'admin') {
      try {
        const statsResponse = await fetch(`${API_BASE}/admin/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          console.log('   ✅ Admin dashboard endpoint accessible');
          console.log(`   📊 Total Users: ${statsData.stats.totalUsers}`);
          console.log(`   📊 Total Employees: ${statsData.stats.totalEmployees}\n`);
        } else {
          console.error(`   ❌ Failed: ${statsData.message}\n`);
        }
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
      }
    }

    console.log('✅ All tests completed!\n');
    console.log('💡 To use the token in other requests:');
    console.log(`   Authorization: Bearer ${token.substring(0, 30)}...\n`);

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

testAPI();

