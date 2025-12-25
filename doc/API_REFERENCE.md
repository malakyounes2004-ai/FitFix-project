# FitFix API Reference

Complete API documentation for FitFix backend endpoints. Suitable for web (React) and mobile (React Native/Expo) applications.

**Base URL**: `http://localhost:3000/api` (development) or your production URL

**Authentication**: Most endpoints require a Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [Admin Endpoints](#admin-endpoints)
3. [Employee (Coach) Endpoints](#employee-coach-endpoints)
4. [User (Client) Endpoints](#user-client-endpoints)
5. [Chat Endpoints](#chat-endpoints)
6. [Payment Endpoints](#payment-endpoints)
7. [Notification Endpoints](#notification-endpoints)
8. [Subscription Endpoints](#subscription-endpoints)
9. [Employee Request Endpoints](#employee-request-endpoints)
10. [Meal Plan Endpoints](#meal-plan-endpoints)
11. [Utility Endpoints](#utility-endpoints)

---

## Authentication

### POST `/api/auth/login`

Login with email and password.

**Headers**: None required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "firebase_id_token",
    "user": {
      "uid": "user123",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "user",
      "assignedEmployeeId": "emp123",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLogin": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Allowed Roles**: Public (no authentication required)

---

### POST `/api/auth/register`

Register a new user account.

**Headers**: None required

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "displayName": "Jane Doe",
  "role": "user",
  "gender": "female",
  "dateOfBirth": "1990-01-01",
  "address": "123 Main St",
  "country": "USA",
  "city": "New York",
  "goals": ["weight_loss", "muscle_gain"]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "firebase_id_token",
    "user": {
      "uid": "user456",
      "email": "newuser@example.com",
      "displayName": "Jane Doe",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Allowed Roles**: Public (no authentication required)

---

### GET `/api/auth/profile`

Get current user profile.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user",
    "phoneNumber": "+1234567890",
    "photoURL": "https://example.com/photo.jpg",
    "assignedEmployeeId": "emp123",
    "gender": "male",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "address": "123 Main St",
    "country": "USA",
    "city": "New York",
    "goals": ["weight_loss"],
    "medicalConditions": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "isActive": true
  }
}
```

**Allowed Roles**: All authenticated users (admin, employee, user)

---

## Admin Endpoints

### POST `/api/admin/employees`

Create a new employee account.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "email": "employee@example.com",
  "password": "password123",
  "displayName": "Coach Smith",
  "phoneNumber": "+1234567890",
  "status": "active"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "uid": "emp123",
    "email": "employee@example.com",
    "displayName": "Coach Smith",
    "role": "employee",
    "status": "active",
    "verified": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Admin only

---

### GET `/api/admin/employees`

Get all employees.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "uid": "emp123",
      "email": "employee@example.com",
      "displayName": "Coach Smith",
      "role": "employee",
      "status": "active",
      "verified": true,
      "assignedUsers": ["user123", "user456"],
      "subscriptionId": "sub123",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Allowed Roles**: Admin only

---

### GET `/api/admin/employees/:employeeId/report`

Get employee report.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "employeeId": "emp123",
    "totalUsers": 10,
    "activeUsers": 8,
    "totalPayments": 5000,
    "recentActivity": []
  }
}
```

**Allowed Roles**: Admin only

---

### PUT `/api/admin/employees/:uid`

Update employee information.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "displayName": "Updated Name",
  "phoneNumber": "+1234567890",
  "status": "active"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "uid": "emp123",
    "displayName": "Updated Name",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Admin only

---

### DELETE `/api/admin/employees/:uid`

Delete an employee.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

**Allowed Roles**: Admin only

---

### PATCH `/api/admin/employees/:employeeId/status`

Update employee status (legacy endpoint).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "status": "inactive"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Employee status updated",
  "data": {
    "status": "inactive"
  }
}
```

**Allowed Roles**: Admin only

---

### GET `/api/admin/users`

Get all users.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "uid": "user123",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "user",
      "assignedEmployeeId": "emp123",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Allowed Roles**: Admin only

---

### GET `/api/admin/users/:uid`

Get user by ID.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user",
    "assignedEmployeeId": "emp123",
    "gender": "male",
    "goals": ["weight_loss"]
  }
}
```

**Allowed Roles**: Admin only

---

### PUT `/api/admin/users/:uid`

Update user information.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "displayName": "Updated Name",
  "assignedEmployeeId": "emp456",
  "goals": ["muscle_gain"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "uid": "user123",
    "displayName": "Updated Name",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Admin only

---

### DELETE `/api/admin/users/:uid`

Delete a user.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Allowed Roles**: Admin only

---

### GET `/api/admin/dashboard/stats`

Get admin dashboard statistics.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "totalEmployees": 10,
    "totalPayments": 50000,
    "activeSubscriptions": 8,
    "pendingPayments": 5
  }
}
```

**Allowed Roles**: Admin only

---

### POST `/api/admin/sendEmployeeAccount`

Send employee account credentials via email.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "employeeId": "emp123",
  "email": "employee@example.com",
  "password": "temporary_password"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Account credentials sent successfully"
}
```

**Allowed Roles**: Admin only

---

### POST `/api/admin/reset-employee-password`

Reset employee password.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "employeeId": "emp123",
  "newPassword": "new_password123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Allowed Roles**: Admin only

---

### POST `/api/admin/cleanup-old-payments`

Cleanup old employee payments.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Old payments cleaned up",
  "deletedCount": 10
}
```

**Allowed Roles**: Admin only

---

### GET `/api/admin/reports/overview`

Get reports overview.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalReports": 50,
    "recentReports": []
  }
}
```

**Allowed Roles**: Admin only

---

### POST `/api/admin/reports/send-email`

Send employee report via email.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "employeeId": "emp123",
  "recipientEmail": "admin@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Report sent successfully"
}
```

**Allowed Roles**: Admin only

---

## Employee (Coach) Endpoints

### GET `/api/employee/admin`

Get admin information (for employee dashboard).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "adminEmail": "admin@example.com",
    "adminName": "Admin User"
  }
}
```

**Allowed Roles**: Employee, Admin

---

### POST `/api/employee/users`

Create a new user (client).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "email": "client@example.com",
  "password": "password123",
  "displayName": "Client Name",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "address": "123 Main St",
  "country": "USA",
  "city": "New York",
  "goals": ["weight_loss"],
  "medicalConditions": []
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "uid": "user123",
    "email": "client@example.com",
    "displayName": "Client Name",
    "role": "user",
    "assignedEmployeeId": "emp123",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Employee, Admin

---

### GET `/api/employee/users`

Get all users assigned to current employee.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "uid": "user123",
      "email": "client@example.com",
      "displayName": "Client Name",
      "role": "user",
      "assignedEmployeeId": "emp123",
      "goals": ["weight_loss"]
    }
  ]
}
```

**Allowed Roles**: Employee, Admin

---

### PUT `/api/employee/users/:userId`

Update user information.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "displayName": "Updated Name",
  "goals": ["muscle_gain"],
  "medicalConditions": ["none"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "uid": "user123",
    "displayName": "Updated Name",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Employee, Admin

---

### DELETE `/api/employee/users/:userId`

Delete a user.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Allowed Roles**: Employee, Admin

---

### POST `/api/employee/users/:userId/meal-plans`

Assign meal plan to user.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "title": "Weight Loss Plan",
  "description": "7-day meal plan",
  "meals": [
    {
      "day": "Monday",
      "breakfast": "Oatmeal with fruits",
      "lunch": "Grilled chicken salad",
      "dinner": "Baked fish with vegetables",
      "snacks": "Apple",
      "calories": 1500
    }
  ],
  "duration": 7,
  "startDate": "2024-01-15",
  "endDate": "2024-01-22"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Meal plan assigned successfully",
  "data": {
    "id": "plan123",
    "userId": "user123",
    "employeeId": "emp123",
    "title": "Weight Loss Plan",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Employee, Admin

---

### POST `/api/employee/users/:userId/workout-plans`

Assign workout plan to user.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "title": "Strength Training",
  "description": "Weekly workout routine",
  "exercises": [
    {
      "exerciseId": "ex123",
      "name": "Push-ups",
      "sets": 3,
      "reps": "10-12",
      "rest": 60,
      "day": "Monday",
      "gifUrl": "https://example.com/pushup.gif"
    }
  ],
  "duration": 4,
  "startDate": "2024-01-15",
  "endDate": "2024-02-15"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Workout plan assigned successfully",
  "data": {
    "id": "workout123",
    "userId": "user123",
    "employeeId": "emp123",
    "title": "Strength Training",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Employee, Admin

---

### GET `/api/employee/users/:userId/progress`

Get user progress entries.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "progress123",
      "userId": "user123",
      "date": "2024-01-15T00:00:00.000Z",
      "weight": 75.5,
      "bodyFat": 15.0,
      "measurements": {
        "chest": 100,
        "waist": 80,
        "hips": 95,
        "arms": 35,
        "thighs": 60
      },
      "photos": [],
      "notes": "Good progress",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Allowed Roles**: Employee, Admin

---

### POST `/api/employee/users/:userId/send-report`

Send user report via email.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "recipientEmail": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Report sent successfully"
}
```

**Allowed Roles**: Employee, Admin

---

### POST `/api/employee/users/:userId/ai-plans`

Generate AI-powered meal/workout plan.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "planType": "meal",
  "notes": "Focus on high protein, low carb"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "AI plan generated successfully",
  "data": {
    "type": "meal",
    "items": [
      {
        "title": "Breakfast",
        "details": "Oatmeal with protein powder"
      }
    ],
    "generatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Employee, Admin

---

### POST `/api/employee/users/:userId/notifications`

Create notification for user.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "type": "plan",
  "title": "New Meal Plan",
  "message": "Your new meal plan is ready",
  "priority": "high"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "id": "notif123",
    "userId": "user123",
    "type": "plan",
    "title": "New Meal Plan",
    "read": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Employee, Admin

---

### POST `/api/employee/upload-gifs`

Upload exercise GIF files (male and female).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
Content-Type: multipart/form-data
```

**Request Body** (Form Data):
```
maleGif: <file>
femaleGif: <file>
exerciseName: "Push-up"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "GIFs uploaded successfully",
  "data": {
    "maleGifUrl": "https://storage.googleapis.com/...",
    "femaleGifUrl": "https://storage.googleapis.com/..."
  }
}
```

**Allowed Roles**: Employee, Admin

---

### GET `/api/employee/exercises`

Get all exercises in library.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "ex123",
      "name": "Push-up",
      "muscleGroup": "chest",
      "equipment": "bodyweight",
      "defaultSets": 3,
      "defaultReps": 10,
      "gifMaleUrl": "https://example.com/male.gif",
      "gifFemaleUrl": "https://example.com/female.gif",
      "createdBy": "emp123"
    }
  ]
}
```

**Allowed Roles**: Employee, Admin

---

### POST `/api/employee/exercises`

Create new exercise.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "name": "Squat",
  "muscleGroup": "legs",
  "equipment": "bodyweight",
  "defaultSets": 3,
  "defaultReps": 12,
  "notes": "Keep back straight",
  "gifMaleUrl": "https://example.com/male.gif",
  "gifFemaleUrl": "https://example.com/female.gif"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Exercise created successfully",
  "data": {
    "id": "ex123",
    "name": "Squat",
    "muscleGroup": "legs",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Employee, Admin

---

### PUT `/api/employee/exercises/:exerciseId`

Update exercise.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "name": "Updated Squat",
  "defaultSets": 4,
  "defaultReps": 15
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Exercise updated successfully",
  "data": {
    "id": "ex123",
    "name": "Updated Squat",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Employee, Admin

---

### DELETE `/api/employee/exercises/:exerciseId`

Delete exercise.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Exercise deleted successfully"
}
```

**Allowed Roles**: Employee, Admin

---

### GET `/api/employee/workout-plans/:userId`

Get user's workout plan.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "workout123",
    "userId": "user123",
    "title": "Strength Training",
    "exercises": [
      {
        "exerciseId": "ex123",
        "name": "Push-up",
        "sets": 3,
        "reps": "10-12",
        "day": "Monday"
      }
    ],
    "isActive": true
  }
}
```

**Allowed Roles**: Employee, Admin

---

### POST `/api/employee/workout-plans/:userId`

Create or update user workout plan.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "title": "Strength Training",
  "description": "Weekly routine",
  "exercises": [
    {
      "exerciseId": "ex123",
      "name": "Push-up",
      "sets": 3,
      "reps": "10-12",
      "rest": 60,
      "day": "Monday",
      "gifUrl": "https://example.com/pushup.gif"
    }
  ],
  "duration": 4,
  "startDate": "2024-01-15",
  "endDate": "2024-02-15"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Workout plan saved successfully",
  "data": {
    "id": "workout123",
    "userId": "user123",
    "isActive": true
  }
}
```

**Allowed Roles**: Employee, Admin

---

### DELETE `/api/employee/workout-plans/:userId`

Delete user workout plan.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Workout plan deleted successfully"
}
```

**Allowed Roles**: Employee, Admin

---

## User (Client) Endpoints

### GET `/api/user/profile`

Get current user profile.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user",
    "assignedEmployeeId": "emp123",
    "gender": "male",
    "goals": ["weight_loss"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Allowed Roles**: All authenticated users

---

### PATCH `/api/user/profile`

Update user profile.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "displayName": "Updated Name",
  "phoneNumber": "+1234567890",
  "goals": ["muscle_gain"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "uid": "user123",
    "displayName": "Updated Name",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: All authenticated users

---

### POST `/api/user/change-password`

Change user password.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Allowed Roles**: All authenticated users

---

### POST `/api/user/change-email`

Change user email.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "newEmail": "newemail@example.com",
  "password": "current_password"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Email changed successfully"
}
```

**Allowed Roles**: All authenticated users

---

### DELETE `/api/user/account`

Delete user account.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Allowed Roles**: All authenticated users

---

### POST `/api/user/progress`

Create progress entry.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "date": "2024-01-15",
  "weight": 75.5,
  "bodyFat": 15.0,
  "muscleMass": 60.0,
  "measurements": {
    "chest": 100,
    "waist": 80,
    "hips": 95,
    "arms": 35,
    "thighs": 60
  },
  "photos": [
    {
      "url": "https://example.com/photo.jpg",
      "type": "front",
      "uploadedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "notes": "Feeling great!",
  "workoutCompleted": true,
  "mealPlanFollowed": true
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Progress entry created successfully",
  "data": {
    "id": "progress123",
    "userId": "user123",
    "date": "2024-01-15T00:00:00.000Z",
    "weight": 75.5,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: User only

---

### GET `/api/user/progress`

Get all progress entries for current user.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "progress123",
      "userId": "user123",
      "date": "2024-01-15T00:00:00.000Z",
      "weight": 75.5,
      "bodyFat": 15.0,
      "measurements": {
        "chest": 100,
        "waist": 80
      },
      "photos": [],
      "notes": "Good progress",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Allowed Roles**: User only

---

### GET `/api/user/progress/:id`

Get specific progress entry.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "progress123",
    "userId": "user123",
    "date": "2024-01-15T00:00:00.000Z",
    "weight": 75.5,
    "bodyFat": 15.0,
    "measurements": {
      "chest": 100,
      "waist": 80
    },
    "photos": [],
    "notes": "Good progress"
  }
}
```

**Allowed Roles**: User only

---

### PUT `/api/user/progress/:id`

Update progress entry.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "weight": 74.0,
  "notes": "Updated notes"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Progress updated successfully",
  "data": {
    "id": "progress123",
    "weight": 74.0,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: User only

---

### DELETE `/api/user/progress/:id`

Delete progress entry.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Progress entry deleted successfully"
}
```

**Allowed Roles**: User only

---

### GET `/api/user/meal-plans`

Get user's meal plans.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "plan123",
      "userId": "user123",
      "employeeId": "emp123",
      "title": "Weight Loss Plan",
      "description": "7-day meal plan",
      "meals": [
        {
          "day": "Monday",
          "breakfast": "Oatmeal",
          "lunch": "Chicken salad",
          "dinner": "Baked fish",
          "calories": 1500
        }
      ],
      "isActive": true,
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-01-22T00:00:00.000Z"
    }
  ]
}
```

**Allowed Roles**: User only

---

### GET `/api/user/workout-plans`

Get user's workout plans.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "workout123",
    "userId": "user123",
    "employeeId": "emp123",
    "title": "Strength Training",
    "description": "Weekly routine",
    "exercises": [
      {
        "exerciseId": "ex123",
        "name": "Push-up",
        "sets": 3,
        "reps": "10-12",
        "rest": 60,
        "day": "Monday",
        "gifUrl": "https://example.com/pushup.gif"
      }
    ],
    "isActive": true,
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-02-15T00:00:00.000Z"
  }
}
```

**Allowed Roles**: User only

---

## Chat Endpoints

### POST `/api/chat/send`

Send a message.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "recipientId": "user456",
  "content": "Hello!",
  "type": "text"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "msg123",
    "chatId": "chat123",
    "senderId": "user123",
    "recipientId": "user456",
    "content": "Hello!",
    "type": "text",
    "read": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: All authenticated users

---

### POST `/api/chat/create-or-get`

Create or get existing chat.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "participantId": "user456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "chatId": "chat123",
    "participants": ["user123", "user456"],
    "lastMessage": {
      "content": "Hello!",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "unreadCount": {
      "user123": 0,
      "user456": 1
    }
  }
}
```

**Allowed Roles**: All authenticated users

---

### GET `/api/chat/chats`

Get all chats for current user.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "chatId": "chat123",
      "participants": ["user123", "user456"],
      "lastMessage": {
        "content": "Hello!",
        "senderId": "user123",
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      "unreadCount": {
        "user123": 0,
        "user456": 1
      },
      "lastActivity": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Allowed Roles**: All authenticated users

---

### GET `/api/chat/messages/:chatId`

Get messages for a chat.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "messageId": "msg123",
      "chatId": "chat123",
      "senderId": "user123",
      "recipientId": "user456",
      "content": "Hello!",
      "type": "text",
      "read": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Allowed Roles**: All authenticated users

---

### POST `/api/chat/mark-read/:chatId`

Mark messages as read.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

**Allowed Roles**: All authenticated users

---

### GET `/api/chat/unread-count`

Get unread message count.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalUnread": 5,
    "byChat": {
      "chat123": 3,
      "chat456": 2
    }
  }
}
```

**Allowed Roles**: All authenticated users

---

### POST `/api/chat/presence`

Update user presence (online/offline).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "status": "online"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Presence updated"
}
```

**Allowed Roles**: All authenticated users

---

### GET `/api/chat/presence/:userId`

Get user presence status.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "status": "online",
    "lastSeen": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: All authenticated users

---

### POST `/api/chat/typing`

Set typing indicator.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "chatId": "chat123",
  "isTyping": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Typing status updated"
}
```

**Allowed Roles**: All authenticated users

---

### POST `/api/chat/reaction`

Toggle message reaction.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "messageId": "msg123",
  "emoji": "👍"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Reaction toggled",
  "data": {
    "messageId": "msg123",
    "reactions": {
      "👍": ["user123"]
    }
  }
}
```

**Allowed Roles**: All authenticated users

---

## Payment Endpoints

### POST `/api/payments/create`

Create a payment (user pays employee).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "amount": 100.00,
  "method": "cash",
  "employeeId": "emp123"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Payment submitted successfully",
  "data": {
    "id": "payment123",
    "userId": "user123",
    "employeeId": "emp123",
    "amount": 100.00,
    "method": "cash",
    "status": "pending",
    "approvedByEmployee": false,
    "approvedByAdmin": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: User only

---

### POST `/api/payments/employee-approve`

Employee approves payment.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "paymentId": "payment123",
  "decision": "approve",
  "rejectionReason": null
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Payment approved by employee",
  "data": {
    "id": "payment123",
    "approvedByEmployee": true,
    "approvedByEmployeeAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Employee, Admin

---

### POST `/api/payments/admin-approve`

Admin approves payment.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "paymentId": "payment123",
  "decision": "approve"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Payment approved by admin",
  "data": {
    "id": "payment123",
    "status": "completed",
    "approvedByAdmin": true,
    "approvedByAdminAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Admin only

---

### GET `/api/payments/user/:id`

Get payments for a user.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "payment123",
      "userId": "user123",
      "employeeId": "emp123",
      "amount": 100.00,
      "method": "cash",
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Allowed Roles**: All authenticated users (user can only see their own)

---

### GET `/api/payments/employee/:id`

Get payments for an employee.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "payment123",
      "userId": "user123",
      "employeeId": "emp123",
      "amount": 100.00,
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Allowed Roles**: All authenticated users (employee can only see their own)

---

### GET `/api/payments/all`

Get all payments (admin only).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "payment123",
      "userId": "user123",
      "employeeId": "emp123",
      "amount": 100.00,
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Allowed Roles**: Admin only

---

### DELETE `/api/payments/:paymentId`

Delete a payment.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Payment deleted successfully"
}
```

**Allowed Roles**: Admin only

---

## Notification Endpoints

### GET `/api/notifications`

Get all notifications for current user.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "notif123",
      "type": "message",
      "title": "New Message",
      "message": "You have a new message",
      "userId": "user123",
      "read": false,
      "priority": "medium",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Allowed Roles**: All authenticated users

---

### PUT `/api/notifications/:id/read`

Mark notification as read.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "notif123",
    "read": true,
    "readAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: All authenticated users

---

### PATCH `/api/notifications/:id/read`

Mark notification as read (alternative method).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response**: Same as PUT above

**Allowed Roles**: All authenticated users

---

### POST `/api/notifications/:id/seen`

Mark notification as seen (backward compatibility).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Notification marked as seen"
}
```

**Allowed Roles**: All authenticated users

---

## Subscription Endpoints

### GET `/api/subscriptions`

Get all subscriptions (admin only).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "sub123",
      "employeeEmail": "employee@example.com",
      "employeeName": "Coach Smith",
      "planType": "monthly",
      "planLabel": "Monthly Plan",
      "amount": 200,
      "startDate": "2024-01-01T00:00:00.000Z",
      "expirationDate": "2024-02-01T00:00:00.000Z",
      "status": "active",
      "isActive": true
    }
  ]
}
```

**Allowed Roles**: Admin only

---

### POST `/api/subscriptions/check-expirations`

Check subscription expirations (manual trigger).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Expiration check completed",
  "expiredCount": 2
}
```

**Allowed Roles**: Admin only

---

### GET `/api/subscriptions/plans`

Get available subscription plans.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "key": "monthly",
      "label": "Monthly Plan",
      "amount": 200,
      "months": 1
    },
    {
      "key": "twoMonth",
      "label": "2 Month Plan",
      "amount": 390,
      "months": 2
    },
    {
      "key": "threeMonth",
      "label": "3 Month Plan",
      "amount": 599,
      "months": 3
    },
    {
      "key": "yearly",
      "label": "Yearly Plan",
      "amount": 2300,
      "months": 12
    }
  ]
}
```

**Allowed Roles**: All authenticated users

---

### GET `/api/subscriptions/employee/:employeeId`

Get employee's subscription.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "sub123",
    "employeeEmail": "employee@example.com",
    "planType": "monthly",
    "status": "active",
    "expirationDate": "2024-02-01T00:00:00.000Z"
  }
}
```

**Allowed Roles**: Employee, Admin

---

### POST `/api/subscriptions/renew`

Renew employee subscription.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "planType": "monthly",
  "paymentDate": "2024-01-15"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Subscription renewed successfully",
  "data": {
    "id": "sub123",
    "expirationDate": "2024-02-15T00:00:00.000Z",
    "status": "active"
  }
}
```

**Allowed Roles**: Employee, Admin

---

## Employee Request Endpoints

### POST `/api/employee-requests`

Create employee signup request (public).

**Headers**: None required

**Request Body**:
```json
{
  "fullName": "John Coach",
  "email": "coach@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "country": "USA",
  "city": "New York",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "notes": "Experienced trainer",
  "selectedPlan": "monthly",
  "amount": 200,
  "recaptchaScore": 0.9,
  "phoneVerified": true
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Employee request submitted successfully",
  "data": {
    "id": "req123",
    "email": "coach@example.com",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Public (no authentication required)

---

### GET `/api/employee-requests`

Get all employee requests (admin only).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "req123",
      "fullName": "John Coach",
      "email": "coach@example.com",
      "status": "pending",
      "selectedPlan": "monthly",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Allowed Roles**: Admin only

---

### POST `/api/employee-requests/approve/:id`

Approve employee request.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Employee request approved",
  "data": {
    "id": "req123",
    "status": "approved"
  }
}
```

**Allowed Roles**: Admin only

---

### POST `/api/employee-requests/reject/:id`

Reject employee request.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "rejectionReason": "Insufficient qualifications"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Employee request rejected",
  "data": {
    "id": "req123",
    "status": "rejected",
    "rejectionReason": "Insufficient qualifications"
  }
}
```

**Allowed Roles**: Admin only

---

## Meal Plan Endpoints

### POST `/api/mealPlans/bulkAssign`

Bulk assign meal plan to multiple users.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "userIds": ["user123", "user456"],
  "title": "Weight Loss Plan",
  "meals": [
    {
      "day": "Monday",
      "breakfast": "Oatmeal",
      "lunch": "Chicken salad",
      "dinner": "Baked fish",
      "calories": 1500
    }
  ],
  "duration": 7,
  "startDate": "2024-01-15",
  "endDate": "2024-01-22"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Meal plans assigned successfully",
  "data": {
    "assignedCount": 2
  }
}
```

**Allowed Roles**: Employee, Admin

---

### PUT `/api/mealPlans/:userId`

Update meal plan for user.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "title": "Updated Plan",
  "meals": [
    {
      "day": "Monday",
      "breakfast": "Updated breakfast",
      "lunch": "Updated lunch",
      "dinner": "Updated dinner",
      "calories": 1600
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Meal plan updated successfully",
  "data": {
    "id": "plan123",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Employee, Admin

---

### DELETE `/api/mealPlans/:userId`

Delete meal plan for user.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Meal plan deleted successfully"
}
```

**Allowed Roles**: Employee, Admin

---

### GET `/api/mealPlans/templates`

Get meal plan templates.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "template123",
      "title": "Weight Loss Template",
      "description": "7-day template",
      "category": "weight_loss",
      "meals": [
        {
          "day": "Monday",
          "breakfast": "Oatmeal",
          "lunch": "Chicken salad",
          "dinner": "Baked fish",
          "calories": 1500
        }
      ],
      "duration": 7,
      "createdBy": "emp123"
    }
  ]
}
```

**Allowed Roles**: Employee, Admin

---

### POST `/api/mealPlans/templates`

Create meal plan template.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "title": "New Template",
  "description": "Template description",
  "category": "weight_loss",
  "meals": [
    {
      "day": "Monday",
      "breakfast": "Oatmeal",
      "lunch": "Chicken salad",
      "dinner": "Baked fish",
      "calories": 1500
    }
  ],
  "duration": 7
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Template created successfully",
  "data": {
    "id": "template123",
    "title": "New Template",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Employee, Admin

---

### PUT `/api/mealPlans/templates/:templateId`

Update meal plan template.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**:
```json
{
  "title": "Updated Template",
  "meals": [
    {
      "day": "Monday",
      "breakfast": "Updated breakfast",
      "calories": 1600
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Template updated successfully",
  "data": {
    "id": "template123",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Employee, Admin

---

### DELETE `/api/mealPlans/templates/:templateId`

Delete meal plan template.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

**Allowed Roles**: Employee, Admin

---

## Utility Endpoints

### POST `/api/verify-recaptcha`

Verify reCAPTCHA token.

**Headers**: None required

**Request Body**:
```json
{
  "token": "recaptcha_token_string"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "score": 0.9,
  "message": "reCAPTCHA verified"
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Invalid reCAPTCHA token"
}
```

**Allowed Roles**: Public (no authentication required)

---

### POST `/api/employee-payments/submit`

Submit employee payment (for subscription).

**Headers**: None required

**Request Body**:
```json
{
  "name": "John Coach",
  "email": "coach@example.com",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "country": "USA",
  "city": "New York",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "selectedPlan": "monthly",
  "selectedPlanKey": "monthly",
  "amount": 200,
  "notes": "Payment notes"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Payment submitted successfully",
  "data": {
    "id": "empPayment123",
    "email": "coach@example.com",
    "paid": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Allowed Roles**: Public (no authentication required)

---

### GET `/api/employee-payments/all`

Get all employee payments (admin only).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "empPayment123",
      "email": "coach@example.com",
      "selectedPlan": "Monthly Plan",
      "amount": 200,
      "paid": true,
      "accountCreated": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Allowed Roles**: Admin only

---

### DELETE `/api/employee-payments/:paymentId`

Delete employee payment.

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Payment deleted successfully"
}
```

**Allowed Roles**: Admin only

---

### GET `/api/subscription-payments`

Get all subscription payments (admin only).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "subPayment123",
      "employeeEmail": "coach@example.com",
      "planType": "monthly",
      "amount": 200,
      "paymentDate": "2024-01-15T00:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Allowed Roles**: Admin only

---

### GET `/api/subscription-payments/stats`

Get subscription payment statistics (admin only).

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalPayments": 100,
    "totalAmount": 20000,
    "byPlan": {
      "monthly": 50,
      "yearly": 10
    }
  }
}
```

**Allowed Roles**: Admin only

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error description"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden: [Role] access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Notes for Mobile Development

1. **Base URL Configuration**: Use Axios with baseURL:
   ```javascript
   import axios from 'axios';
   
   const api = axios.create({
     baseURL: 'http://your-api-url.com/api',
     headers: {
       'Content-Type': 'application/json'
     }
   });
   ```

2. **Authentication**: Store Firebase ID token and add to requests:
   ```javascript
   api.interceptors.request.use((config) => {
     const token = await getFirebaseIdToken();
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

3. **File Uploads**: For endpoints requiring file uploads (e.g., `/api/employee/upload-gifs`), use `FormData`:
   ```javascript
   const formData = new FormData();
   formData.append('maleGif', file);
   formData.append('femaleGif', file);
   
   await api.post('/employee/upload-gifs', formData, {
     headers: { 'Content-Type': 'multipart/form-data' }
   });
   ```

4. **Date Formats**: All dates in request/response are ISO 8601 strings (e.g., `"2024-01-15T10:30:00.000Z"`).

5. **Pagination**: Currently, list endpoints return all results. Consider implementing pagination for production.

---

**Last Updated**: 2024-01-15
**API Version**: 1.0.0

