# Postman Quick Reference - FitFix API

Base URL: `http://localhost:3000/api`

---

## 🔐 Auth Endpoints

### 1. Login
**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
    "email": "admin@gmail.com",
    "password": "admin123"
}
```
**Response:** Returns `token` - **Save this token!**

---

### 2. Register
**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/register`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
    "email": "user@example.com",
    "password": "password123",
    "displayName": "John Doe",
    "role": "user"
}
```

---

### 3. Get Profile (Auth)
**Method:** `GET`  
**URL:** `http://localhost:3000/api/auth/profile`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 👤 User Endpoints

### 4. Get User Profile
**Method:** `GET`  
**URL:** `http://localhost:3000/api/user/profile`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 5. Get User Progress
**Method:** `GET`  
**URL:** `http://localhost:3000/api/user/progress`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 6. Add Progress Entry
**Method:** `POST`  
**URL:** `http://localhost:3000/api/user/progress`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
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
    "notes": "Feeling great today!"
}
```

---

### 7. Update User Profile
**Method:** `PATCH`  
**URL:** `http://localhost:3000/api/user/profile`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
    "displayName": "John Doe Updated",
    "phoneNumber": "+1234567890",
    "height": 175,
    "weight": 72,
    "fitnessGoals": ["weight_loss", "muscle_gain"]
}
```

---

## 👨‍💼 Admin Endpoints

### 8. Get All Users
**Method:** `GET`  
**URL:** `http://localhost:3000/api/admin/users`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

---

### 9. Get All Employees
**Method:** `GET`  
**URL:** `http://localhost:3000/api/admin/employees`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

---

### 10. Create Employee
**Method:** `POST`  
**URL:** `http://localhost:3000/api/admin/employees`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
    "email": "coach@fitfix.com",
    "password": "coach123",
    "displayName": "John Coach",
    "phoneNumber": "+1234567890"
}
```

---

### 11. Get Dashboard Stats
**Method:** `GET`  
**URL:** `http://localhost:3000/api/admin/dashboard/stats`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

---

### 12. Update Employee Status
**Method:** `PATCH`  
**URL:** `http://localhost:3000/api/admin/employees/:employeeId/status`  
**Example URL:** `http://localhost:3000/api/admin/employees/abc123xyz/status`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
    "isActive": false
}
```

---

## 📋 Quick Copy-Paste List

### Public Endpoints (No Token):
1. `POST http://localhost:3000/api/auth/login`
2. `POST http://localhost:3000/api/auth/register`

### Protected Endpoints (Need Token):
3. `GET http://localhost:3000/api/auth/profile`
4. `GET http://localhost:3000/api/user/profile`
5. `GET http://localhost:3000/api/user/progress`
6. `POST http://localhost:3000/api/user/progress`
7. `PATCH http://localhost:3000/api/user/profile`
8. `GET http://localhost:3000/api/admin/users`
9. `GET http://localhost:3000/api/admin/employees`
10. `POST http://localhost:3000/api/admin/employees`
11. `GET http://localhost:3000/api/admin/dashboard/stats`
12. `PATCH http://localhost:3000/api/admin/employees/:employeeId/status`

---

## 🚀 Postman Setup Steps

1. **Create Environment Variables:**
   - Click "Environments" → "Create Environment"
   - Add variable: `base_url` = `http://localhost:3000/api`
   - Add variable: `auth_token` = (leave empty, will be set automatically)

2. **Import Collection:**
   - Click "Import"
   - Select `FitFix_API.postman_collection.json`
   - The collection will use your environment variables

3. **First Request - Login:**
   - Run "Auth → Login" request
   - Check "Tests" tab - it auto-saves the token to `auth_token` variable

4. **Use Token in Other Requests:**
   - All other requests use `{{auth_token}}` automatically
   - Just run them!

---

## 💡 Pro Tips

- **Save Token:** After login, the token is saved to `auth_token` variable
- **Use Variables:** Replace `YOUR_TOKEN_HERE` with `{{auth_token}}` in Postman
- **Test Order:** Always login first, then use the token for other requests
- **Role Check:** Admin endpoints require admin role token, User endpoints require user role token

---

## ⚠️ Common Errors

**401 Unauthorized:**
- Missing or invalid token
- Solution: Login again and copy the new token

**403 Forbidden:**
- Wrong role (e.g., using user token for admin endpoint)
- Solution: Use correct role token

**404 Not Found:**
- Wrong URL or method
- Solution: Check the URL and HTTP method

---

**Ready to test!** Import the Postman collection or use these URLs directly.

