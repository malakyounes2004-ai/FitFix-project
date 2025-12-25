# FitFix Database Schema Documentation

This document provides a complete overview of all Firestore collections used in the FitFix application, including their structure, relationships, and usage.

---

## 📊 Database Collections Overview

The FitFix application uses **14 main collections** in Firebase Firestore:

1. **users** - All user accounts (Admin, Employee, User)
2. **chats** - Chat conversations between users
3. **messages** - Individual messages (also stored as subcollection)
4. **notifications** - System notifications
5. **payments** - User payments to employees
6. **employeePayments** - Employee subscription payments
7. **subscriptions** - Employee subscription records
8. **employeeRequests** - Employee signup requests
9. **mealPlans** - Assigned meal plans to users
10. **mealPlanTemplates** - Reusable meal plan templates
11. **workoutPlans** - Assigned workout plans to users
12. **exercises** - Exercise library with GIFs
13. **progress** - User progress tracking (subcollection under users)
14. **adminTransactions** - Admin transaction records

---

## 📋 Collection Schemas

### 1. `users` Collection

**Document ID**: Firebase Auth UID

**Description**: Stores all user accounts (Admin, Employee, and User roles)

**Schema**:
```javascript
{
  uid: string,                    // Firebase Auth UID (same as document ID)
  email: string,                  // User email (lowercase)
  displayName: string,            // Full name
  role: string,                   // 'admin' | 'employee' | 'user'
  phoneNumber: string,            // Optional
  photoURL: string,               // Optional profile photo URL
  createdAt: Timestamp,           // Account creation date
  updatedAt: Timestamp,          // Last update date
  
  // Employee-specific fields
  status: string,                 // 'active' | 'inactive' | 'pending' (for employees)
  verified: boolean,              // Employee verification status
  assignedUsers: array,           // Array of user UIDs assigned to employee
  subscriptionId: string,         // Reference to subscription document
  
  // User-specific fields
  assignedEmployeeId: string,     // UID of assigned employee/coach
  gender: string,                 // 'male' | 'female'
  dateOfBirth: Timestamp,         // Date of birth
  address: string,                // Physical address
  country: string,                // Country
  city: string,                   // City
  goals: array,                   // Fitness goals
  medicalConditions: array,       // Medical conditions (optional)
  
  // Common fields
  lastLogin: Timestamp,          // Last login timestamp
  isActive: boolean,              // Account active status
}
```

**Indexes Required**:
- `role` (for filtering by role)
- `email` (for unique email lookups)
- `assignedEmployeeId` (for finding users by employee)
- `status` (for employee status filtering)

---

### 2. `chats` Collection

**Document ID**: `{role1}_{userId1}__{role2}_{userId2}` (e.g., `admin_abc123__emp_def456`)

**Description**: Chat conversations between users

**Schema**:
```javascript
{
  chatId: string,                 // Same as document ID
  participants: array,            // Array of user UIDs [userId1, userId2]
  lastMessage: {
    content: string,              // Last message content
    senderId: string,             // Sender UID
    senderRole: string,           // Sender role
    createdAt: Timestamp          // Last message timestamp
  },
  lastActivity: Timestamp,        // Last activity timestamp
  updatedAt: Timestamp,           // Last update timestamp
  createdAt: Timestamp,           // Chat creation timestamp
  unreadCount: {                  // Unread count per user
    [userId]: number
  },
  
  // Subcollection: messages
  messages/{messageId}: {
    messageId: string,
    chatId: string,
    senderId: string,
    senderRole: string,
    recipientId: string,
    content: string,
    type: string,                  // 'text' | 'image' | 'file'
    read: boolean,
    readAt: Timestamp | null,
    createdAt: Timestamp,
    reactions: {                  // Message reactions
      [emoji]: [userId1, userId2]
    }
  }
}
```

**Chat ID Format**:
- Admin ↔ Employee: `admin_{adminId}__emp_{employeeId}`
- Employee ↔ User: `emp_{employeeId}__user_{userId}`
- Admin ↔ User: `admin_{adminId}__user_{userId}`

**Indexes Required**:
- `participants` (array-contains for finding user chats)
- `lastActivity` (for sorting chats by activity)

---

### 3. `messages` Collection

**Document ID**: Auto-generated message ID (`msg_{timestamp}_{random}`)

**Description**: Backup storage for messages (also stored in `chats/{chatId}/messages`)

**Schema**:
```javascript
{
  messageId: string,              // Same as document ID
  chatId: string,                 // Reference to chat document
  senderId: string,               // Sender UID
  senderRole: string,             // 'admin' | 'employee' | 'user'
  recipientId: string,             // Recipient UID
  content: string,                // Message content
  type: string,                   // 'text' | 'image' | 'file'
  read: boolean,                   // Read status
  readAt: Timestamp | null,       // Read timestamp
  createdAt: Timestamp,           // Message creation timestamp
  reactions: object                // Message reactions
}
```

**Note**: Messages are primarily stored in `chats/{chatId}/messages` subcollection. This collection serves as a backup for easier querying.

---

### 4. `notifications` Collection

**Document ID**: Auto-generated

**Description**: System notifications for users

**Schema**:
```javascript
{
  type: string,                   // 'message' | 'payment' | 'plan' | 'system'
  title: string,                  // Notification title
  message: string,                 // Notification message
  userId: string,                  // Target user UID
  relatedId: string,              // Related entity ID (payment, chat, etc.)
  relatedType: string,            // Related entity type
  read: boolean,                   // Read status
  readAt: Timestamp | null,       // Read timestamp
  createdAt: Timestamp,           // Notification creation timestamp
  priority: string                 // 'low' | 'medium' | 'high'
}
```

**Indexes Required**:
- `userId` (for finding user notifications)
- `read` (for filtering unread notifications)
- `createdAt` (for sorting by date)

---

### 5. `payments` Collection

**Document ID**: Auto-generated

**Description**: User payments to employees for services

**Schema**:
```javascript
{
  id: string,                     // Same as document ID
  userId: string,                  // User UID who made payment
  employeeId: string,             // Employee UID receiving payment
  amount: number,                  // Payment amount
  method: string,                  // 'cash' | 'omt' | 'whatsapp'
  status: string,                  // 'pending' | 'completed' | 'rejected'
  approvedByEmployee: boolean,     // Employee approval status
  approvedByEmployeeAt: Timestamp | null,
  approvedByEmployeeId: string | null,
  approvedByAdmin: boolean,        // Admin approval status
  approvedByAdminAt: Timestamp | null,
  approvedByAdminId: string | null,
  rejectionReason: string | null,  // Rejection reason if rejected
  createdAt: Timestamp,           // Payment creation timestamp
  updatedAt: Timestamp             // Last update timestamp
}
```

**Payment Flow**:
1. User creates payment → `status: 'pending'`
2. Employee approves → `approvedByEmployee: true`
3. Admin approves → `status: 'completed'`

**Indexes Required**:
- `userId` (for user payment history)
- `employeeId` (for employee payment tracking)
- `status` (for filtering by status)

---

### 6. `employeePayments` Collection

**Document ID**: Auto-generated

**Description**: Employee subscription payments to become coaches

**Schema**:
```javascript
{
  id: string,                     // Same as document ID
  name: string,                    // Employee full name
  email: string,                   // Employee email (lowercase)
  phoneNumber: string,             // Phone number
  address: string,                 // Physical address
  country: string,                 // Country
  city: string,                    // City
  gender: string,                  // 'male' | 'female'
  dateOfBirth: Timestamp,          // Date of birth
  notes: string | null,            // Additional notes
  selectedPlan: string,            // Plan label (e.g., "Monthly Plan")
  selectedPlanKey: string,         // Plan key (e.g., "monthly")
  amount: number,                  // Payment amount
  paid: boolean,                   // Payment status
  timestamp: Timestamp,            // Payment timestamp
  createdAt: Timestamp,            // Document creation timestamp
  accountCreated: boolean          // Whether employee account was created
}
```

**Indexes Required**:
- `email` (for duplicate checking)
- `paid` (for filtering paid subscriptions)
- `accountCreated` (for finding unprocessed payments)

---

### 7. `subscriptions` Collection

**Document ID**: Auto-generated

**Description**: Employee subscription records

**Schema**:
```javascript
{
  id: string,                     // Same as document ID
  employeePaymentId: string,       // Reference to employeePayments document
  employeeEmail: string,           // Employee email
  employeeName: string,            // Employee name
  planType: string,                // 'monthly' | 'twoMonth' | 'threeMonth' | 'yearly'
  planLabel: string,               // Plan display label
  amount: number,                  // Subscription amount
  paymentDate: Timestamp,          // Payment date
  startDate: Timestamp,            // Subscription start date
  expirationDate: Timestamp,       // Subscription expiration date
  status: string,                  // 'active' | 'expired' | 'cancelled'
  isActive: boolean,               // Active status
  createdAt: Timestamp,            // Document creation timestamp
  reminderSent: boolean,           // Expiration reminder sent
  expirationEmailSent: boolean     // Expiration email sent
}
```

**Indexes Required**:
- `employeeEmail` (for finding employee subscriptions)
- `status` (for filtering by status)
- `expirationDate` (for finding expiring subscriptions)
- `isActive` (for active subscriptions)

---

### 8. `employeeRequests` Collection

**Document ID**: Auto-generated

**Description**: Employee signup requests (before approval)

**Schema**:
```javascript
{
  id: string,                     // Same as document ID
  fullName: string,                // Applicant full name
  email: string,                   // Applicant email (lowercase)
  phone: string,                   // Phone number
  address: string,                 // Physical address
  country: string,                 // Country
  city: string,                    // City
  gender: string,                  // 'male' | 'female'
  dateOfBirth: Timestamp,         // Date of birth
  notes: string | null,            // Additional notes
  selectedPlan: string,            // Selected subscription plan
  selectedPlanKey: string,         // Plan key
  amount: number,                  // Payment amount
  recaptchaScore: number,          // reCAPTCHA score (0-1)
  phoneVerified: boolean,          // Phone verification status
  status: string,                  // 'pending' | 'approved' | 'rejected'
  reviewedBy: string | null,       // Admin UID who reviewed
  reviewedAt: Timestamp | null,    // Review timestamp
  rejectionReason: string | null,   // Rejection reason
  createdAt: Timestamp,           // Request creation timestamp
  updatedAt: Timestamp             // Last update timestamp
}
```

**Indexes Required**:
- `email` (for duplicate checking)
- `status` (for filtering by status)
- `createdAt` (for sorting by date)

---

### 9. `mealPlans` Collection

**Document ID**: Auto-generated

**Description**: Meal plans assigned to users

**Schema**:
```javascript
{
  id: string,                     // Same as document ID
  userId: string,                  // User UID
  employeeId: string,              // Employee UID who created the plan
  title: string,                   // Plan title
  description: string,             // Plan description
  meals: array,                    // Array of meal objects
    [{
      day: string,                 // Day of week or date
      breakfast: string,            // Breakfast details
      lunch: string,                // Lunch details
      dinner: string,               // Dinner details
      snacks: string,               // Snacks (optional)
      calories: number             // Daily calories
    }],
  duration: number,                // Plan duration in days
  startDate: Timestamp,            // Plan start date
  endDate: Timestamp,              // Plan end date
  isActive: boolean,               // Active status
  createdAt: Timestamp,           // Plan creation timestamp
  updatedAt: Timestamp             // Last update timestamp
}
```

**Indexes Required**:
- `userId` (for finding user meal plans)
- `employeeId` (for finding employee-created plans)
- `isActive` (for active plans)

---

### 10. `mealPlanTemplates` Collection

**Document ID**: Auto-generated

**Description**: Reusable meal plan templates

**Schema**:
```javascript
{
  id: string,                     // Same as document ID
  title: string,                   // Template title
  description: string,             // Template description
  category: string,                 // Template category
  meals: array,                    // Array of meal objects (same as mealPlans)
  duration: number,                // Template duration in days
  createdBy: string,               // Employee UID who created template
  createdAt: Timestamp,           // Template creation timestamp
  updatedAt: Timestamp             // Last update timestamp
}
```

**Indexes Required**:
- `createdBy` (for finding employee templates)
- `category` (for filtering by category)

---

### 11. `workoutPlans` Collection

**Document ID**: User UID (one plan per user)

**Description**: Workout plans assigned to users

**Schema**:
```javascript
{
  id: string,                     // Same as document ID (userId)
  userId: string,                  // User UID
  employeeId: string,              // Employee UID who created the plan
  title: string,                   // Plan title
  description: string,             // Plan description
  exercises: array,                // Array of exercise objects
    [{
      exerciseId: string,          // Reference to exercises collection
      name: string,                // Exercise name
      sets: number,                // Number of sets
      reps: string,                // Reps (e.g., "10-12")
      rest: number,                // Rest time in seconds
      day: string,                 // Day of week
      gifUrl: string,               // Exercise GIF URL
      gifUrlFemale: string | null  // Female-specific GIF URL
    }],
  duration: number,                // Plan duration in weeks
  startDate: Timestamp,            // Plan start date
  endDate: Timestamp,              // Plan end date
  isActive: boolean,               // Active status
  createdAt: Timestamp,           // Plan creation timestamp
  updatedAt: Timestamp             // Last update timestamp
}
```

**Indexes Required**:
- `userId` (for finding user workout plans)
- `employeeId` (for finding employee-created plans)
- `isActive` (for active plans)

---

### 12. `exercises` Collection

**Document ID**: Auto-generated

**Description**: Exercise library with GIFs

**Schema**:
```javascript
{
  id: string,                     // Same as document ID
  name: string,                    // Exercise name
  description: string,             // Exercise description
  category: string,                // Exercise category
  muscleGroups: array,             // Targeted muscle groups
  difficulty: string,             // 'beginner' | 'intermediate' | 'advanced'
  equipment: array,                // Required equipment
  gifUrl: string,                  // Male/default GIF URL
  gifUrlFemale: string | null,    // Female-specific GIF URL
  instructions: array,            // Exercise instructions
  tips: array,                    // Exercise tips
  createdAt: Timestamp,           // Exercise creation timestamp
  updatedAt: Timestamp             // Last update timestamp
}
```

**Indexes Required**:
- `category` (for filtering by category)
- `difficulty` (for filtering by difficulty)
- `muscleGroups` (array-contains for muscle group filtering)

---

### 13. `progress` Collection (Subcollection)

**Parent Collection**: `users`

**Document ID**: Auto-generated

**Description**: User progress tracking entries

**Schema**:
```javascript
{
  id: string,                     // Same as document ID
  userId: string,                  // User UID (parent document ID)
  date: Timestamp,                 // Progress date
  weight: number,                  // Weight in kg
  bodyFat: number,                // Body fat percentage
  measurements: {                  // Body measurements
    chest: number,
    waist: number,
    hips: number,
    arms: number,
    thighs: number
  },
  photos: array,                   // Progress photo URLs
    [{
      url: string,                 // Photo URL
      type: string,                // 'front' | 'side' | 'back'
      uploadedAt: Timestamp
    }],
  notes: string,                   // Progress notes
  createdAt: Timestamp,            // Entry creation timestamp
  updatedAt: Timestamp             // Last update timestamp
}
```

**Indexes Required**:
- `userId` + `date` (composite for user progress timeline)
- `date` (for sorting by date)

---

### 14. `adminTransactions` Collection

**Document ID**: Auto-generated

**Description**: Admin transaction records

**Schema**:
```javascript
{
  id: string,                     // Same as document ID
  type: string,                    // Transaction type
  amount: number,                  // Transaction amount
  description: string,             // Transaction description
  relatedId: string,               // Related entity ID
  relatedType: string,             // Related entity type
  createdBy: string,               // Admin UID
  createdAt: Timestamp             // Transaction timestamp
}
```

**Indexes Required**:
- `createdBy` (for admin transaction history)
- `createdAt` (for sorting by date)

---

## 🔗 Collection Relationships

### Entity Relationship Diagram

```
users (Admin)
  ├── Creates → employeeRequests
  ├── Approves → employeePayments → Creates → subscriptions
  ├── Creates → users (Employee)
  └── Manages → payments

users (Employee)
  ├── Has → subscriptions
  ├── Creates → users (User)
  ├── Creates → mealPlans
  ├── Creates → workoutPlans
  ├── Creates → mealPlanTemplates
  ├── Approves → payments
  └── Chats → chats

users (User)
  ├── Assigned to → users (Employee)
  ├── Has → mealPlans
  ├── Has → workoutPlans
  ├── Has → progress (subcollection)
  ├── Creates → payments
  └── Chats → chats

chats
  ├── Contains → messages (subcollection)
  └── Participants → users

exercises
  └── Referenced by → workoutPlans
```

---

## 📊 Database Statistics Queries

### Common Queries

1. **Get all active employees**:
   ```javascript
   db.collection('users')
     .where('role', '==', 'employee')
     .where('status', '==', 'active')
   ```

2. **Get user's assigned employee**:
   ```javascript
   db.collection('users')
     .where('assignedEmployeeId', '==', employeeId)
   ```

3. **Get active subscriptions**:
   ```javascript
   db.collection('subscriptions')
     .where('isActive', '==', true)
     .where('status', '==', 'active')
   ```

4. **Get user's chats**:
   ```javascript
   db.collection('chats')
     .where('participants', 'array-contains', userId)
     .orderBy('lastActivity', 'desc')
   ```

5. **Get user progress**:
   ```javascript
   db.collection('users')
     .doc(userId)
     .collection('progress')
     .orderBy('date', 'desc')
   ```

---

## 🔒 Security Rules Considerations

When setting up Firestore Security Rules, consider:

1. **Role-based access**: Users can only read/write based on their role
2. **Ownership**: Users can only access their own data
3. **Employee assignment**: Users can only access data from their assigned employee
4. **Admin access**: Admins have full access to all collections

See `FIRESTORE_SECURITY_RULES.md` for complete security rules.

---

## 📝 Notes

- All timestamps use Firestore `Timestamp` type
- Email addresses are stored in lowercase for consistency
- Document IDs are either Firebase Auth UIDs (for users) or auto-generated
- Subcollections are used for hierarchical data (messages in chats, progress in users)
- Arrays are used for multi-value fields (participants, muscleGroups, etc.)

---

**Last Updated**: Current Implementation
**Version**: 1.0.0

