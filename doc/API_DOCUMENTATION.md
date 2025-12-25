# FitFix API Documentation

Base URL: `http://localhost:3000/api`

All protected routes require an `Authorization` header:
```
Authorization: Bearer <idToken>
```

---

## Authentication Routes

### POST `/api/auth/register`
Register a new user (typically for initial admin setup or public registration).

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe",
  "role": "user" // Optional: "admin" | "employee" | "user" (default: "user")
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "uid": "firebase_uid_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user"
  }
}
```

---

### POST `/api/auth/login`
Login with email and password.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "uid": "firebase_uid_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "admin",
    "photoURL": null,
    "isActive": true
  },
  "token": "firebase_id_token_here",
  "refreshToken": "firebase_refresh_token_here"
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### GET `/api/auth/profile`
Get current user profile (Protected).

**Headers**:
```
Authorization: Bearer <idToken>
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "uid": "firebase_uid_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "admin",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

## Admin Routes

All admin routes require admin authentication.

### POST `/api/admin/employees`
Create a new employee (Admin only).

**Request Body**:
```json
{
  "email": "coach@fitfix.com",
  "password": "securePassword123",
  "displayName": "John Coach",
  "phoneNumber": "+1234567890"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Employee created successfully",
  "employee": {
    "uid": "employee_uid_456",
    "email": "coach@fitfix.com",
    "displayName": "John Coach",
    "role": "employee"
  }
}
```

---

### GET `/api/admin/employees`
Get all employees (Admin only).

**Response** (200 OK):
```json
{
  "success": true,
  "count": 5,
  "employees": [
    {
      "uid": "employee_uid_1",
      "email": "coach1@fitfix.com",
      "displayName": "Coach One",
      "role": "employee",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### GET `/api/admin/users`
Get all users (Admin only).

**Response** (200 OK):
```json
{
  "success": true,
  "count": 20,
  "users": [
    {
      "uid": "user_uid_1",
      "email": "client@example.com",
      "displayName": "Jane Doe",
      "role": "user",
      "assignedEmployeeId": "employee_uid_1",
      "isActive": true
    }
  ]
}
```

---

### GET `/api/admin/dashboard/stats`
Get dashboard statistics (Admin only).

**Response** (200 OK):
```json
{
  "success": true,
  "stats": {
    "totalEmployees": 5,
    "totalUsers": 20,
    "totalSubscriptions": 15,
    "activeSubscriptions": 12,
    "revenue": 12000
  }
}
```

---

### PATCH `/api/admin/employees/:employeeId/status`
Update employee status (Admin only).

**Request Body**:
```json
{
  "isActive": false
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Employee deactivated successfully"
}
```

---

## Employee Routes

All employee routes require employee authentication.

### POST `/api/employee/users`
Create a new user (Employee only).

**Request Body**:
```json
{
  "email": "client@example.com",
  "password": "securePassword123",
  "displayName": "Jane Doe",
  "phoneNumber": "+1234567891",
  "dateOfBirth": "1990-01-15",
  "gender": "female",
  "height": 165,
  "weight": 70,
  "fitnessGoals": ["weight_loss", "muscle_toning"]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "uid": "user_uid_789",
    "email": "client@example.com",
    "displayName": "Jane Doe",
    "role": "user"
  }
}
```

---

### GET `/api/employee/users`
Get all users assigned to this employee.

**Response** (200 OK):
```json
{
  "success": true,
  "count": 8,
  "users": [
    {
      "uid": "user_uid_1",
      "email": "client1@example.com",
      "displayName": "Client One",
      "assignedEmployeeId": "current_employee_uid",
      "role": "user",
      "isActive": true
    }
  ]
}
```

---

### POST `/api/employee/users/:userId/meal-plans`
Assign a meal plan to a user (Employee only).

**Request Body**:
```json
{
  "planName": "Weight Loss Meal Plan",
  "meals": [
    {
      "day": 1,
      "mealType": "breakfast",
      "name": "Oatmeal with Berries",
      "description": "Healthy breakfast option",
      "calories": 350,
      "protein": 12,
      "carbs": 55,
      "fats": 8,
      "ingredients": ["oats", "blueberries", "almond milk", "honey"]
    }
  ],
  "startDate": "2024-01-20",
  "endDate": "2024-02-20",
  "notes": "Follow this plan strictly for best results"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Meal plan assigned successfully",
  "mealPlanId": "meal_plan_id_123"
}
```

---

### POST `/api/employee/users/:userId/workout-plans`
Assign a workout plan to a user (Employee only).

**Request Body**:
```json
{
  "planName": "Beginner Strength Training",
  "workouts": [
    {
      "day": 1,
      "name": "Upper Body Day",
      "description": "Focus on chest, back, and arms",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 3,
          "reps": "8-10",
          "weight": 60,
          "restTime": 90,
          "notes": "Focus on form"
        }
      ],
      "estimatedDuration": 60,
      "targetMuscles": ["chest", "triceps", "shoulders"]
    }
  ],
  "startDate": "2024-01-20",
  "endDate": "2024-02-20",
  "notes": "Rest 1 day between workout days"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Workout plan assigned successfully",
  "workoutPlanId": "workout_plan_id_456"
}
```

---

### GET `/api/employee/users/:userId/progress`
Get user progress (Employee only).

**Response** (200 OK):
```json
{
  "success": true,
  "progress": [
    {
      "id": "progress_id_1",
      "userId": "user_uid_123",
      "date": "2024-01-15T10:00:00Z",
      "weight": 70,
      "bodyFat": 25,
      "workoutCompleted": true,
      "mealPlanFollowed": true
    }
  ]
}
```

---

## User Routes (User only)

All user routes require user authentication.

### GET `/api/user/meal-plans`
Get user's active meal plans.

**Response** (200 OK):
```json
{
  "success": true,
  "mealPlans": [
    {
      "id": "meal_plan_id_123",
      "userId": "user_uid_789",
      "planName": "Weight Loss Meal Plan",
      "meals": [...],
      "status": "active",
      "startDate": "2024-01-20T00:00:00Z"
    }
  ]
}
```

---

### GET `/api/user/workout-plans`
Get user's active workout plans.

**Response** (200 OK):
```json
{
  "success": true,
  "workoutPlans": [
    {
      "id": "workout_plan_id_456",
      "userId": "user_uid_789",
      "planName": "Beginner Strength Training",
      "workouts": [...],
      "status": "active",
      "startDate": "2024-01-20T00:00:00Z"
    }
  ]
}
```

---

### GET `/api/user/progress`
Get user's progress history.

**Query Parameters**:
- `limit` (optional): Number of entries to return (default: 30)

**Response** (200 OK):
```json
{
  "success": true,
  "progress": [
    {
      "id": "progress_id_1",
      "userId": "user_uid_789",
      "date": "2024-01-15T10:00:00Z",
      "weight": 70,
      "bodyFat": 25,
      "workoutCompleted": true,
      "mealPlanFollowed": true,
      "photos": []
    }
  ]
}
```

---

### POST `/api/user/progress`
Add a new progress entry.

**Request Body**:
```json
{
  "date": "2024-01-15",
  "weight": 70,
  "bodyFat": 25,
  "muscleMass": 50,
  "measurements": {
    "chest": 95,
    "waist": 80,
    "hips": 95,
    "arms": 30,
    "thighs": 55
  },
  "photos": ["https://storage.googleapis.com/..."],
  "notes": "Feeling great!",
  "workoutCompleted": true,
  "mealPlanFollowed": true
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Progress entry added successfully",
  "progressId": "progress_id_new"
}
```

---

### PATCH `/api/user/profile`
Update user profile.

**Request Body** (all fields optional):
```json
{
  "displayName": "Jane Doe Updated",
  "phoneNumber": "+1234567891",
  "dateOfBirth": "1990-01-15",
  "gender": "female",
  "height": 165,
  "weight": 70,
  "fitnessGoals": ["weight_loss", "muscle_toning"],
  "photoURL": "https://storage.googleapis.com/..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

## Example API Calls

### Using cURL

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fitfix.com",
    "password": "adminPassword123"
  }'
```

**Create Employee** (Admin):
```bash
curl -X POST http://localhost:3000/api/admin/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE" \
  -d '{
    "email": "coach@fitfix.com",
    "password": "coachPassword123",
    "displayName": "John Coach",
    "phoneNumber": "+1234567890"
  }'
```

**Create User** (Employee):
```bash
curl -X POST http://localhost:3000/api/employee/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE" \
  -d '{
    "email": "client@example.com",
    "password": "clientPassword123",
    "displayName": "Jane Doe",
    "height": 165,
    "weight": 70,
    "fitnessGoals": ["weight_loss"]
  }'
```

**Add Progress** (User):
```bash
curl -X POST http://localhost:3000/api/user/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE" \
  -d '{
    "weight": 70,
    "bodyFat": 25,
    "workoutCompleted": true,
    "mealPlanFollowed": true
  }'
```

**Get My Meal Plans** (User):
```bash
curl http://localhost:3000/api/user/meal-plans \
  -H "Authorization: Bearer YOUR_ID_TOKEN_HERE"
```

---

### Using JavaScript (Fetch API)

**Login**:
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@fitfix.com',
    password: 'adminPassword123'
  })
});

const data = await response.json();
const token = data.token; // Save this token for authenticated requests
```

**Get Profile**:
```javascript
const response = await fetch('http://localhost:3000/api/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.user);
```

**Create Employee** (Admin):
```javascript
const response = await fetch('http://localhost:3000/api/admin/employees', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    email: 'coach@fitfix.com',
    password: 'coachPassword123',
    displayName: 'John Coach'
  })
});

const data = await response.json();
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Common HTTP Status Codes**:
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
FIREBASE_API_KEY=your_firebase_web_api_key_here
```

The `serviceAccountKey.json` file should be in the root directory for Firebase Admin SDK initialization.

