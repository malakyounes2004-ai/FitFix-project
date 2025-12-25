# Authentication Guide

This guide shows you how to authenticate and make protected API calls.

## Quick Steps

1. **Login** to get a token
2. **Use the token** in the `Authorization` header for protected routes

---

## Step 1: Login to Get Token

### Using cURL:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

### Response:
```json
{
  "success": true,
  "user": {
    "uid": "user_uid_123",
    "email": "your-email@example.com",
    "displayName": "Your Name",
    "role": "user"
  },
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the `token` value!** You'll need it for all protected routes.

---

## Step 2: Use Token in Protected Routes

### Using cURL:
```bash
curl http://localhost:3000/api/user/progress \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with the token from the login response.

---

## Examples

### Get User Progress (User Role Required)
```bash
# First, login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Then use the token
curl http://localhost:3000/api/user/progress \
  -H "Authorization: Bearer $TOKEN"
```

### Get Profile
```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Add Progress Entry
```bash
curl -X POST http://localhost:3000/api/user/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "weight": 70,
    "bodyFat": 25,
    "workoutCompleted": true,
    "mealPlanFollowed": true
  }'
```

---

## Using JavaScript/Fetch

```javascript
// Step 1: Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.token; // Save this!

// Step 2: Use token for protected routes
const progressResponse = await fetch('http://localhost:3000/api/user/progress', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const progressData = await progressResponse.json();
console.log(progressData);
```

---

## Using Postman

1. **Login Request:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "user@example.com",
       "password": "password123"
     }
     ```
   - Copy the `token` from the response

2. **Protected Request:**
   - Method: `GET`
   - URL: `http://localhost:3000/api/user/progress`
   - Headers:
     - `Authorization: Bearer YOUR_TOKEN_HERE`
   - Replace `YOUR_TOKEN_HERE` with the token from step 1

**Pro Tip:** In Postman, you can set up an environment variable:
- Create environment variable: `token`
- In the Authorization tab, select "Bearer Token"
- Use `{{token}}` as the token value
- After login, set `token` = the token from response

---

## Common Errors

### "Unauthorized: Invalid or missing token"
**Cause:** Missing or invalid Authorization header

**Solution:**
- Make sure you include: `Authorization: Bearer YOUR_TOKEN`
- Check that the token is correct (copy the entire token string)
- Verify you logged in successfully first

### "Forbidden: User access required"
**Cause:** Your account doesn't have the 'user' role

**Solution:**
- Check your user role in Firestore (`users/{uid}` collection)
- Make sure `role` field is set to `"user"`
- If you're an admin/employee, use the appropriate endpoints:
  - Admin: `/api/admin/*`
  - Employee: `/api/employee/*`

### "User profile not found"
**Cause:** User exists in Firebase Auth but not in Firestore

**Solution:**
- Create the user document in Firestore `users` collection
- Or use the registration endpoint: `POST /api/auth/register`

---

## Token Storage (Frontend)

### React (localStorage):
```javascript
// After login
localStorage.setItem('token', token);

// For API calls
const token = localStorage.getItem('token');
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Flutter (SharedPreferences):
```dart
// After login
final prefs = await SharedPreferences.getInstance();
await prefs.setString('token', token);

// For API calls
final token = await prefs.getString('token');
http.get(url, headers: {
  'Authorization': 'Bearer $token'
});
```

---

## Testing Your Setup

1. **Test Login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

2. **If login succeeds**, copy the token and test a protected route:
   ```bash
   curl http://localhost:3000/api/auth/profile \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **If login fails**, check:
   - User exists in Firebase Auth
   - User document exists in Firestore `users` collection
   - Password is correct

---

## Quick Reference

### Public Endpoints (No Token Required):
- `POST /api/auth/login`
- `POST /api/auth/register`

### Protected Endpoints (Token Required):
- `GET /api/auth/profile` - Any authenticated user
- `GET /api/user/*` - User role only
- `GET /api/employee/*` - Employee role only
- `GET /api/admin/*` - Admin role only

**All protected endpoints require:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

Need help? Check the [API Documentation](./API_DOCUMENTATION.md) for complete endpoint details.

