# Firestore Database Structure

This document describes the Firestore collections and document structure for the FitFix Health & Fitness Coaching System.

## Collections Overview

### 1. `users` Collection
Stores all user accounts (Admin, Employee, and User roles).

**Document ID**: User's Firebase Auth UID

**Document Structure**:
```javascript
{
  email: string,
  displayName: string,
  phoneNumber: string | null,
  role: "admin" | "employee" | "user",
  isActive: boolean,
  photoURL: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // For employees
  createdBy: string (uid) | null, // Admin who created this employee
  
  // For users (clients)
  assignedEmployeeId: string (uid) | null, // Employee assigned to this user
  dateOfBirth: Date | null,
  gender: "male" | "female" | "other" | null,
  height: number | null, // in cm
  weight: number | null, // in kg
  fitnessGoals: string[] // e.g., ["weight_loss", "muscle_gain", "endurance"]
}
```

**Example Document**:
```javascript
// Admin
{
  email: "admin@fitfix.com",
  displayName: "Admin User",
  role: "admin",
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// Employee
{
  email: "coach@fitfix.com",
  displayName: "John Coach",
  phoneNumber: "+1234567890",
  role: "employee",
  isActive: true,
  createdBy: "admin_uid_123",
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// User (Client)
{
  email: "client@example.com",
  displayName: "Jane Doe",
  phoneNumber: "+1234567891",
  role: "user",
  isActive: true,
  assignedEmployeeId: "employee_uid_456",
  dateOfBirth: Date("1990-01-15"),
  gender: "female",
  height: 165,
  weight: 70,
  fitnessGoals: ["weight_loss", "muscle_toning"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### 1b. `employees` Collection
Although employee profiles also live in the `users` collection, this lightweight collection makes it easier to query active coaches, their payout metrics, and audit data without scanning all user documents.

**Document ID**: Employee UID (same as `users` doc)

**Document Structure**:
```javascript
{
  uid: string,             // employee UID (duplicate for convenience)
  displayName: string,
  email: string,
  phoneNumber: string | null,
  specialization: string | null,
  activeClients: number,   // denormalized counter
  totalCollected: number,  // sum of approved payments for quick dashboards
  status: "active" | "inactive",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

This document can be kept in sync via Cloud Functions or explicit admin actions whenever employees are created/updated.

---

### 1c. `payments` Collection
Stores every manual/offline payment attempt initiated by a user.

**Document ID**: Auto-generated (also stored in `id` field for convenience)

**Document Structure**:
```javascript
{
  id: string,
  userId: string,              // UID of the client
  employeeId: string,          // UID of the assigned coach
  amount: number,              // stored in the platform's base currency
  status: "pending" | "completed" | "rejected",
  method: "cash" | "omt" | "whatsapp",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  approvedByEmployee: boolean,
  approvedByEmployeeAt: Timestamp | null,
  approvedByEmployeeId: string | null,
  approvedByAdmin: boolean,
  approvedByAdminAt: Timestamp | null,
  approvedByAdminId: string | null,
  rejectionReason: string | null
}
```

---

### 1d. `adminTransactions` Collection
Keeps an immutable audit trail of every admin action on a payment (approval/rejection). These entries power finance dashboards and compliance exports.

**Document ID**: Auto-generated

**Document Structure**:
```javascript
{
  id: string,
  paymentId: string,
  adminId: string,
  adminEmail: string,
  action: "approve" | "reject",
  amount: number,
  userId: string,
  employeeId: string,
  statusAfterAction: "completed" | "rejected",
  createdAt: Timestamp,
  notes: string | null
}
```

---

### 2. `subscriptions` Collection
Stores user subscription information.

**Document ID**: Auto-generated

**Document Structure**:
```javascript
{
  userId: string (uid),
  planType: "basic" | "premium" | "elite",
  amount: number, // Subscription price
  currency: string, // e.g., "USD"
  status: "active" | "cancelled" | "expired" | "pending",
  startDate: Timestamp,
  endDate: Timestamp | null,
  renewalDate: Timestamp | null,
  paymentMethod: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### 3. `mealPlans` Collection
Stores meal plans assigned to users.

**Document ID**: Auto-generated

**Document Structure**:
```javascript
{
  userId: string (uid),
  assignedBy: string (uid), // Employee who assigned this plan
  planName: string,
  meals: [
    {
      day: number, // 1-7 (Monday-Sunday)
      mealType: "breakfast" | "lunch" | "dinner" | "snack",
      name: string,
      description: string,
      calories: number,
      protein: number, // grams
      carbs: number, // grams
      fats: number, // grams
      ingredients: string[]
    }
  ],
  startDate: Timestamp,
  endDate: Timestamp | null,
  notes: string | null,
  status: "active" | "completed" | "cancelled",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### 4. `workoutPlans` Collection
Stores workout plans assigned to users.

**Document ID**: Auto-generated

**Document Structure**:
```javascript
{
  userId: string (uid),
  assignedBy: string (uid), // Employee who assigned this plan
  planName: string,
  workouts: [
    {
      day: number, // 1-7 (Monday-Sunday)
      name: string,
      description: string,
      exercises: [
        {
          name: string,
          sets: number,
          reps: number | string, // e.g., "10-12" or 15
          weight: number | null, // kg
          duration: number | null, // seconds (for cardio)
          restTime: number, // seconds between sets
          notes: string | null
        }
      ],
      estimatedDuration: number, // minutes
      targetMuscles: string[]
    }
  ],
  startDate: Timestamp,
  endDate: Timestamp | null,
  notes: string | null,
  status: "active" | "completed" | "cancelled",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### 5. `progress` Collection
Stores user progress tracking data.

**Document ID**: Auto-generated

**Document Structure**:
```javascript
{
  userId: string (uid),
  date: Timestamp,
  weight: number | null, // kg
  bodyFat: number | null, // percentage
  muscleMass: number | null, // kg
  measurements: {
    chest: number | null, // cm
    waist: number | null, // cm
    hips: number | null, // cm
    arms: number | null, // cm
    thighs: number | null // cm
  },
  photos: string[], // URLs to photos stored in Firebase Storage
  notes: string | null,
  workoutCompleted: boolean,
  mealPlanFollowed: boolean,
  createdAt: Timestamp
}
```

---

### 6. `messages` Collection
Stores chat messages between users, employees, and admins.

**Document ID**: Auto-generated

**Document Structure**:
```javascript
{
  chatId: string, // Composite ID: "user1_uid_user2_uid" (sorted)
  participants: string[], // Array of UIDs
  messages: [
    {
      messageId: string,
      senderId: string (uid),
      senderRole: "admin" | "employee" | "user",
      content: string,
      type: "text" | "image" | "file",
      fileUrl: string | null,
      read: boolean,
      readAt: Timestamp | null,
      createdAt: Timestamp
    }
  ],
  lastMessage: {
    content: string,
    senderId: string,
    createdAt: Timestamp
  },
  updatedAt: Timestamp
}
```

**Alternative Structure (Subcollection)**:
You might prefer to use subcollections for messages:
- `chats/{chatId}/messages/{messageId}`

---

### 7. `notifications` Collection
Stores push notifications for users.

**Document ID**: Auto-generated

**Document Structure**:
```javascript
{
  userId: string (uid),
  title: string,
  body: string,
  type: "workout_reminder" | "meal_reminder" | "message" | "plan_assigned" | "general",
  data: object | null, // Additional data (e.g., planId, messageId)
  read: boolean,
  readAt: Timestamp | null,
  createdAt: Timestamp
}
```

---

## Firestore Security Rules (Example)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserData().role == 'admin';
    }
    
    function isEmployee() {
      return isAuthenticated() && getUserData().role == 'employee';
    }
    
    function isUser() {
      return isAuthenticated() && getUserData().role == 'user';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (
        request.auth.uid == userId || 
        isAdmin() || 
        (isEmployee() && resource.data.assignedEmployeeId == request.auth.uid)
      );
      allow create: if isAdmin() || isEmployee();
      allow update: if request.auth.uid == userId || isAdmin() || 
        (isEmployee() && resource.data.assignedEmployeeId == request.auth.uid);
      allow delete: if isAdmin();
    }
    
    // Meal Plans
    match /mealPlans/{planId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        resource.data.assignedBy == request.auth.uid ||
        isAdmin()
      );
      allow create: if isEmployee() || isAdmin();
      allow update, delete: if isAdmin() || resource.data.assignedBy == request.auth.uid;
    }
    
    // Workout Plans
    match /workoutPlans/{planId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        resource.data.assignedBy == request.auth.uid ||
        isAdmin()
      );
      allow create: if isEmployee() || isAdmin();
      allow update, delete: if isAdmin() || resource.data.assignedBy == request.auth.uid;
    }
    
    // Progress
    match /progress/{progressId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        isAdmin() ||
        (isEmployee() && get(/databases/$(database)/documents/users/$(resource.data.userId)).data.assignedEmployeeId == request.auth.uid)
      );
      allow create: if isUser() || isEmployee() || isAdmin();
      allow update, delete: if isAdmin() || resource.data.userId == request.auth.uid;
    }
    
    // Messages
    match /messages/{messageId} {
      allow read, write: if isAuthenticated() && request.auth.uid in resource.data.participants;
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read, write: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## Indexes Required

Create these composite indexes in Firestore:

1. **users** collection:
   - `role` (Ascending) + `createdAt` (Descending)
   - `assignedEmployeeId` (Ascending) + `role` (Ascending)

2. **progress** collection:
   - `userId` (Ascending) + `date` (Descending)

3. **messages** collection:
   - `chatId` (Ascending) + `createdAt` (Descending)

4. **notifications** collection:
   - `userId` (Ascending) + `read` (Ascending) + `createdAt` (Descending)

---

## Data Relationships

```
Admin
  └── Creates → Employees
        └── Creates → Users
              └── Assigned → Meal Plans
              └── Assigned → Workout Plans
              └── Tracks → Progress
              └── Receives → Notifications
              └── Sends/Receives → Messages
```

