# FitFix CRUD API Documentation

Complete CRUD operations for Users, Employees, and UserProgress entities.

Base URL: `http://localhost:3000/api`

All protected routes require: `Authorization: Bearer <token>`

---

## 📋 Response Format

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 👤 Users CRUD

### Create User
**POST** `/api/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe",
  "role": "user"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "uid": "user_uid_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### Read User Profile (Self)
**GET** `/api/user/profile`  
**Auth:** User token required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "uid": "user_uid_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user",
    "isActive": true
  }
}
```

---

### Read All Users (Admin)
**GET** `/api/admin/users`  
**Auth:** Admin token required

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "uid": "user_uid_1",
      "email": "user1@example.com",
      "displayName": "User One",
      "role": "user"
    }
  ],
  "count": 1
}
```

---

### Read User by UID (Admin)
**GET** `/api/admin/users/:uid`  
**Auth:** Admin token required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "uid": "user_uid_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user"
  }
}
```

---

### Update User Profile (Self)
**PATCH** `/api/user/profile`  
**Auth:** User token required

**Body (all fields optional):**
```json
{
  "displayName": "John Updated",
  "phoneNumber": "+1234567890",
  "height": 175,
  "weight": 72,
  "fitnessGoals": ["weight_loss"],
  "photoURL": "https://..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "uid": "user_uid_123",
    "displayName": "John Updated",
    ...
  }
}
```

---

### Update User (Admin)
**PUT** `/api/admin/users/:uid`  
**Auth:** Admin token required

**Body:**
```json
{
  "displayName": "Updated Name",
  "phoneNumber": "+1234567890",
  "isActive": true,
  "height": 175,
  "weight": 72
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "uid": "user_uid_123",
    ...
  }
}
```

---

### Delete User (Admin)
**DELETE** `/api/admin/users/:uid`  
**Auth:** Admin token required

**Response (200):**
```json
{
  "success": true,
  "message": "User and associated data deleted successfully"
}
```

---

## 👨‍💼 Employees CRUD

### Create Employee
**POST** `/api/admin/employees`  
**Auth:** Admin token required

**Body:**
```json
{
  "email": "coach@fitfix.com",
  "password": "coach123",
  "displayName": "John Coach",
  "phoneNumber": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "uid": "employee_uid_456",
    "email": "coach@fitfix.com",
    "displayName": "John Coach",
    "role": "employee",
    "isActive": true
  }
}
```

---

### Read All Employees
**GET** `/api/admin/employees`  
**Auth:** Admin token required

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "uid": "employee_uid_1",
      "email": "coach1@fitfix.com",
      "displayName": "Coach One",
      "role": "employee"
    }
  ],
  "count": 1
}
```

---

### Update Employee
**PUT** `/api/admin/employees/:uid`  
**Auth:** Admin token required

**Body:**
```json
{
  "displayName": "Updated Coach",
  "phoneNumber": "+1234567890",
  "isActive": true,
  "photoURL": "https://..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "uid": "employee_uid_456",
    ...
  }
}
```

---

### Delete Employee
**DELETE** `/api/admin/employees/:uid`  
**Auth:** Admin token required

**Response (200):**
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

---

## 📊 UserProgress CRUD

### Create Progress Entry
**POST** `/api/user/progress`  
**Auth:** User token required

**Body:**
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
  "workoutCompleted": true,
  "mealPlanFollowed": true,
  "notes": "Feeling great!",
  "photos": ["https://..."]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Progress entry created successfully",
  "data": {
    "id": "progress_id_123",
    "userId": "user_uid_123",
    "date": "...",
    "weight": 70,
    ...
  }
}
```

---

### Read All Progress Entries
**GET** `/api/user/progress`  
**Auth:** User token required

**Query Parameters:**
- `limit` (optional): Number of entries (default: 30)
- `startAfter` (optional): Document ID for pagination

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "progress_id_1",
      "userId": "user_uid_123",
      "date": "...",
      "weight": 70,
      "bodyFat": 25,
      ...
    }
  ],
  "count": 1
}
```

---

### Read Progress Entry by ID
**GET** `/api/user/progress/:id`  
**Auth:** User token required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "progress_id_123",
    "userId": "user_uid_123",
    "date": "...",
    "weight": 70,
    ...
  }
}
```

---

### Update Progress Entry
**PUT** `/api/user/progress/:id`  
**Auth:** User token required

**Body (all fields optional):**
```json
{
  "weight": 72,
  "bodyFat": 24,
  "workoutCompleted": true,
  "notes": "Updated notes"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Progress entry updated successfully",
  "data": {
    "id": "progress_id_123",
    ...
  }
}
```

---

### Delete Progress Entry
**DELETE** `/api/user/progress/:id`  
**Auth:** User token required

**Response (200):**
```json
{
  "success": true,
  "message": "Progress entry deleted successfully"
}
```

---

## 🔐 Authentication

### Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "user_uid_123",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "..."
  }
}
```

---

## 📝 Complete Endpoint List

### Users
- `POST /api/auth/register` - Create user
- `GET /api/user/profile` - Get own profile
- `PATCH /api/user/profile` - Update own profile
- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/users/:uid` - Get user by UID (admin)
- `PUT /api/admin/users/:uid` - Update user (admin)
- `DELETE /api/admin/users/:uid` - Delete user (admin)

### Employees
- `POST /api/admin/employees` - Create employee (admin)
- `GET /api/admin/employees` - Get all employees (admin)
- `PUT /api/admin/employees/:uid` - Update employee (admin)
- `DELETE /api/admin/employees/:uid` - Delete employee (admin)

### UserProgress
- `POST /api/user/progress` - Create progress entry
- `GET /api/user/progress` - Get all progress entries
- `GET /api/user/progress/:id` - Get progress by ID
- `PUT /api/user/progress/:id` - Update progress entry
- `DELETE /api/user/progress/:id` - Delete progress entry

---

## 🛡️ Role-Based Access

- **Admin**: Can access all endpoints
- **Employee**: Can access employee-specific endpoints
- **User**: Can only access their own data

---

## ⚠️ Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

---

**All endpoints return consistent JSON format with `success` and `data` fields.**

