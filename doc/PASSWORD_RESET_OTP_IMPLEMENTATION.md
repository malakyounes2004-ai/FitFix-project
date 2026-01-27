# Password Reset OTP Implementation

## Overview

This document describes the complete Email OTP (One-Time Password) password reset system implementation for FitFix backend.

## Flow

1. **User requests password reset** → `POST /api/auth/forgot-password`
2. **User verifies OTP code** → `POST /api/auth/verify-reset-code`
3. **User sets new password** → `POST /api/auth/reset-password`

## API Endpoints

### 1. POST /api/auth/forgot-password

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset code has been sent."
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Email is required"
}
```

**What it does:**
- Validates email format
- Checks if user exists in Firebase Auth (returns generic message if not found - security best practice)
- Generates a secure 6-digit numeric OTP
- Hashes the OTP using SHA-256
- Saves to Firestore with 10-minute expiration
- Sends OTP code via email
- Returns generic success message (prevents email enumeration)

---

### 2. POST /api/auth/verify-reset-code

**Request:**
```json
{
  "email": "user@example.com",
  "code": "483921"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Verification code is valid. You can now reset your password."
}
```

**Response (Error - Invalid Code):**
```json
{
  "success": false,
  "message": "Invalid verification code. 4 attempt(s) remaining."
}
```

**Response (Error - Expired):**
```json
{
  "success": false,
  "message": "Verification code has expired. Please request a new code."
}
```

**Response (Error - Max Attempts):**
```json
{
  "success": false,
  "message": "Too many failed attempts. Please request a new code."
}
```

**What it does:**
- Validates email and code format (6 digits)
- Checks if user exists
- Retrieves reset password data from Firestore
- Verifies code hasn't expired (10 minutes)
- Checks attempt limit (max 5 attempts)
- Compares hashed OTP using timing-safe comparison
- Marks code as verified if valid
- Increments attempts on failure

---

### 3. POST /api/auth/reset-password

**Request:**
```json
{
  "email": "user@example.com",
  "newPassword": "NewSecureP@ss123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

**Response (Error - Weak Password):**
```json
{
  "success": false,
  "message": "Password must be at least 8 characters long"
}
```

**Response (Error - Not Verified):**
```json
{
  "success": false,
  "message": "Please verify your code first before resetting your password."
}
```

**What it does:**
- Validates email and new password
- Validates password strength (8+ chars, uppercase, lowercase, number, special char)
- Checks if reset password request exists and is verified
- Checks expiration (even if verified)
- Updates password using Firebase Admin SDK
- Removes reset password data from Firestore

---

## Firestore Document Structure

### users/{uid}

```javascript
{
  // ... other user fields ...
  
  resetPassword: {
    codeHash: "a1b2c3d4e5f6...",  // SHA-256 hash of OTP
    expiresAt: Timestamp,          // 10 minutes from creation
    attempts: 0,                   // Number of failed verification attempts
    verified: false,                // Set to true after successful verification
    createdAt: Timestamp,          // When OTP was generated
    verifiedAt: Timestamp          // When OTP was verified (optional)
  }
}
```

**Example:**
```javascript
{
  email: "user@example.com",
  displayName: "John Doe",
  role: "user",
  // ... other fields ...
  resetPassword: {
    codeHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    expiresAt: Timestamp(2024, 1, 15, 10, 20, 0),  // 10 minutes from now
    attempts: 0,
    verified: false,
    createdAt: Timestamp(2024, 1, 15, 10, 10, 0)
  }
}
```

---

## Security Features

1. **OTP Hashing**: OTP codes are hashed using SHA-256 before storage
2. **Timing-Safe Comparison**: Uses `crypto.timingSafeEqual` to prevent timing attacks
3. **Expiration**: OTP codes expire after 10 minutes
4. **Attempt Limiting**: Maximum 5 verification attempts per OTP
5. **Email Enumeration Prevention**: Generic success messages regardless of email existence
6. **Password Strength Validation**: Enforces strong password requirements
7. **One-Time Use**: OTP is marked as verified and cannot be reused

---

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;':"\\,.<>/?)

---

## Email Template

The OTP email includes:
- 6-digit verification code (large, prominent display)
- 10-minute expiration notice
- Security warnings
- Instructions on how to use the code

---

## Error Handling

All endpoints return generic error messages to prevent information leakage:
- User existence is not revealed
- Specific error details are logged server-side only
- Client receives user-friendly messages

---

## Testing

### Test Flow:

1. **Request Password Reset:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com"}'
   ```

2. **Verify OTP Code:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/verify-reset-code \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "code": "483921"}'
   ```

3. **Reset Password:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "newPassword": "NewSecureP@ss123"}'
   ```

---

## Files Modified/Created

1. **src/utils/passwordUtils.js** - OTP generation, hashing, and password validation utilities
2. **src/controllers/authController.js** - Added three new controller functions
3. **src/routes/auth.js** - Added three new routes
4. **src/utils/emailService.js** - Added `sendPasswordResetOTP` function

---

## Environment Variables Required

- `EMAIL_USER` - Email address for sending emails
- `EMAIL_PASSWORD` - Email password or app password
- Firebase Admin SDK credentials (already configured)

---

## Notes

- OTP codes are 6-digit numeric codes (000000-999999)
- OTP expiration is 10 minutes from generation
- Maximum 5 verification attempts per OTP
- Reset password data is automatically cleaned up after expiration or max attempts
- All sensitive operations are logged server-side for debugging

