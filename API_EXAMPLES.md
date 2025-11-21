# FitFix API - Ready-to-Use Examples

Base URL: `http://localhost:3000/api`

## 🔐 Authentication Flow

### Step 1: Login to Get Token

**JavaScript (Fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin2@gmail.com',
    password: 'admin2123'
  })
});

const data = await response.json();
const token = data.token; // Save this token!
console.log('Token:', token);
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmail.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "user_uid_123",
    "email": "admin@gmail.com",
    "displayName": "admin",
    "role": "admin"
  },
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👤 User Endpoints

### GET /user/profile

**JavaScript:**
```javascript
const token = 'YOUR_TOKEN_HERE'; // From login

const response = await fetch('http://localhost:3000/api/user/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data);
```

**cURL:**
```bash
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### GET /user/progress

**JavaScript:**
```javascript
const token = 'YOUR_TOKEN_HERE';

const response = await fetch('http://localhost:3000/api/user/progress', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.progress);
```

**cURL:**
```bash
curl http://localhost:3000/api/user/progress \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### POST /user/progress

**JavaScript:**
```javascript
const token = 'YOUR_TOKEN_HERE';

const response = await fetch('http://localhost:3000/api/user/progress', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    weight: 70,
    bodyFat: 25,
    muscleMass: 50,
    measurements: {
      chest: 95,
      waist: 80,
      hips: 95,
      arms: 30,
      thighs: 55
    },
    workoutCompleted: true,
    mealPlanFollowed: true,
    notes: "Feeling great today!"
  })
});

const data = await response.json();
console.log(data);
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/user/progress \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 70,
    "bodyFat": 25,
    "workoutCompleted": true,
    "mealPlanFollowed": true
  }'
```

---

### PATCH /user/profile

**JavaScript:**
```javascript
const token = 'YOUR_TOKEN_HERE';

const response = await fetch('http://localhost:3000/api/user/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    displayName: "John Doe Updated",
    phoneNumber: "+1234567890",
    height: 175,
    weight: 72,
    fitnessGoals: ["weight_loss", "muscle_gain"]
  })
});

const data = await response.json();
console.log(data);
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Doe Updated",
    "height": 175,
    "weight": 72
  }'
```

---

## 👨‍💼 Admin Endpoints

### GET /admin/users

**JavaScript:**
```javascript
const token = 'YOUR_ADMIN_TOKEN_HERE'; // Must be admin role

const response = await fetch('http://localhost:3000/api/admin/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.users);
```

**cURL:**
```bash
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

---

### POST /admin/employees

**JavaScript:**
```javascript
const token = 'YOUR_ADMIN_TOKEN_HERE';

const response = await fetch('http://localhost:3000/api/admin/employees', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'coach@fitfix.com',
    password: 'coach123',
    displayName: 'John Coach',
    phoneNumber: '+1234567890'
  })
});

const data = await response.json();
console.log(data);
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/admin/employees \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach@fitfix.com",
    "password": "coach123",
    "displayName": "John Coach"
  }'
```

---

## 📝 Complete Example Script

**JavaScript (Complete Workflow):**
```javascript
const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  // Step 1: Login
  console.log('1. Logging in...');
  const loginResponse = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@gmail.com',
      password: 'admin123'
    })
  });
  
  const loginData = await loginResponse.json();
  if (!loginData.success) {
    console.error('Login failed:', loginData.message);
    return;
  }
  
  const token = loginData.token;
  console.log('✅ Logged in! Token:', token.substring(0, 30) + '...');
  console.log('Role:', loginData.user.role);
  
  // Step 2: Get Profile
  console.log('\n2. Getting profile...');
  const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const profileData = await profileResponse.json();
  console.log('Profile:', profileData.user);
  
  // Step 3: Admin - Get Users (if admin)
  if (loginData.user.role === 'admin') {
    console.log('\n3. Getting all users (admin)...');
    const usersResponse = await fetch(`${API_BASE}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const usersData = await usersResponse.json();
    console.log('Users:', usersData.users);
  }
  
  // Step 4: User - Get Progress (if user)
  if (loginData.user.role === 'user') {
    console.log('\n3. Getting progress (user)...');
    const progressResponse = await fetch(`${API_BASE}/user/progress`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const progressData = await progressResponse.json();
    console.log('Progress:', progressData.progress);
  }
}

testAPI();
```

---

## 🔧 Error Handling

**JavaScript with Error Handling:**
```javascript
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Request failed:', error.message);
    throw error;
  }
}

// Usage
const token = 'YOUR_TOKEN';
const data = await makeRequest('http://localhost:3000/api/user/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 📋 Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: Invalid or missing token"
}
```
**Solution:** Login again to get a fresh token.

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden: Admin access required"
}
```
**Solution:** Use an admin account token.

### 404 Not Found
```json
{
  "success": false,
  "message": "Route not found"
}
```
**Solution:** Check the URL and HTTP method.

---

## 🚀 Quick Test Commands

**Test Admin Login & Get Users:**
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Get users
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

**Test User Login & Get Progress:**
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Get progress
curl http://localhost:3000/api/user/progress \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📦 Postman Collection

Import `FitFix_API.postman_collection.json` into Postman:

1. Open Postman
2. Click "Import"
3. Select `FitFix_API.postman_collection.json`
4. Set environment variable `base_url` = `http://localhost:3000/api`
5. Run "Login" request - it will auto-save the token
6. All other requests will use the saved token automatically!

---

**Need more help?** Check [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) for detailed authentication setup.

