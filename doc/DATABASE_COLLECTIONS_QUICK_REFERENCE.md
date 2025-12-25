# FitFix Database Collections - Quick Reference

A quick reference guide for all Firestore collections in the FitFix application.

---

## 📊 Collections Summary

| # | Collection Name | Document ID | Description | Key Fields |
|---|----------------|-------------|-------------|------------|
| 1 | `users` | Firebase Auth UID | All user accounts | `role`, `email`, `assignedEmployeeId` |
| 2 | `chats` | `{role1}_{id1}__{role2}_{id2}` | Chat conversations | `participants`, `lastMessage`, `unreadCount` |
| 3 | `messages` | Auto-generated | Message backup | `chatId`, `senderId`, `content`, `read` |
| 4 | `notifications` | Auto-generated | System notifications | `userId`, `type`, `read`, `title` |
| 5 | `payments` | Auto-generated | User payments | `userId`, `employeeId`, `status`, `amount` |
| 6 | `employeePayments` | Auto-generated | Employee subscriptions | `email`, `selectedPlan`, `paid`, `amount` |
| 7 | `subscriptions` | Auto-generated | Employee subscriptions | `employeeEmail`, `planType`, `status`, `expirationDate` |
| 8 | `employeeRequests` | Auto-generated | Employee signup requests | `email`, `status`, `selectedPlan` |
| 9 | `mealPlans` | Auto-generated | Assigned meal plans | `userId`, `employeeId`, `meals`, `isActive` |
| 10 | `mealPlanTemplates` | Auto-generated | Meal plan templates | `title`, `category`, `meals`, `createdBy` |
| 11 | `workoutPlans` | User UID | Workout plans | `userId`, `employeeId`, `exercises`, `isActive` |
| 12 | `exercises` | Auto-generated | Exercise library | `name`, `category`, `gifUrl`, `difficulty` |
| 13 | `progress` | Auto-generated | User progress (subcollection) | `userId`, `date`, `weight`, `photos` |
| 14 | `adminTransactions` | Auto-generated | Admin transactions | `type`, `amount`, `createdBy` |

---

## 🔗 Subcollections

| Parent Collection | Subcollection | Description |
|------------------|---------------|-------------|
| `users/{userId}` | `progress` | User progress tracking entries |
| `chats/{chatId}` | `messages` | Messages in a chat conversation |

---

## 📝 Collection Details

### 1. users
- **Purpose**: Store all user accounts (Admin, Employee, User)
- **Document ID**: Firebase Auth UID
- **Unique Fields**: `email` (lowercase)
- **Indexes**: `role`, `email`, `assignedEmployeeId`, `status`

### 2. chats
- **Purpose**: Chat conversations between users
- **Document ID Format**: `admin_{id}__emp_{id}` or `emp_{id}__user_{id}`
- **Subcollection**: `messages`
- **Indexes**: `participants` (array-contains), `lastActivity`

### 3. messages
- **Purpose**: Backup storage for messages
- **Document ID**: `msg_{timestamp}_{random}`
- **Note**: Also stored in `chats/{chatId}/messages` subcollection

### 4. notifications
- **Purpose**: System notifications
- **Document ID**: Auto-generated
- **Indexes**: `userId`, `read`, `createdAt`

### 5. payments
- **Purpose**: User payments to employees
- **Document ID**: Auto-generated
- **Status Flow**: `pending` → `completed` or `rejected`
- **Indexes**: `userId`, `employeeId`, `status`

### 6. employeePayments
- **Purpose**: Employee subscription payments
- **Document ID**: Auto-generated
- **Indexes**: `email`, `paid`, `accountCreated`

### 7. subscriptions
- **Purpose**: Employee subscription records
- **Document ID**: Auto-generated
- **Status**: `active`, `expired`, `cancelled`
- **Indexes**: `employeeEmail`, `status`, `expirationDate`, `isActive`

### 8. employeeRequests
- **Purpose**: Employee signup requests
- **Document ID**: Auto-generated
- **Status**: `pending`, `approved`, `rejected`
- **Indexes**: `email`, `status`, `createdAt`

### 9. mealPlans
- **Purpose**: Meal plans assigned to users
- **Document ID**: Auto-generated
- **Indexes**: `userId`, `employeeId`, `isActive`

### 10. mealPlanTemplates
- **Purpose**: Reusable meal plan templates
- **Document ID**: Auto-generated
- **Indexes**: `createdBy`, `category`

### 11. workoutPlans
- **Purpose**: Workout plans assigned to users
- **Document ID**: User UID (one plan per user)
- **Indexes**: `userId`, `employeeId`, `isActive`

### 12. exercises
- **Purpose**: Exercise library with GIFs
- **Document ID**: Auto-generated
- **Indexes**: `category`, `difficulty`, `muscleGroups` (array-contains)

### 13. progress
- **Purpose**: User progress tracking
- **Parent**: `users/{userId}`
- **Document ID**: Auto-generated
- **Indexes**: `userId` + `date` (composite)

### 14. adminTransactions
- **Purpose**: Admin transaction records
- **Document ID**: Auto-generated
- **Indexes**: `createdBy`, `createdAt`

---

## 🔍 Common Queries

### Get all active employees
```javascript
db.collection('users')
  .where('role', '==', 'employee')
  .where('status', '==', 'active')
```

### Get user's assigned employee
```javascript
db.collection('users')
  .where('assignedEmployeeId', '==', employeeId)
```

### Get active subscriptions
```javascript
db.collection('subscriptions')
  .where('isActive', '==', true)
  .where('status', '==', 'active')
```

### Get user's chats
```javascript
db.collection('chats')
  .where('participants', 'array-contains', userId)
  .orderBy('lastActivity', 'desc')
```

### Get user progress
```javascript
db.collection('users')
  .doc(userId)
  .collection('progress')
  .orderBy('date', 'desc')
```

---

## 📊 Collection Statistics

- **Total Collections**: 14
- **Subcollections**: 2
- **Collections with Auto-Generated IDs**: 12
- **Collections with Custom IDs**: 2 (`users`, `workoutPlans`)

---

## 🔐 Security Considerations

- All collections require authentication (except public endpoints)
- Role-based access control enforced in middleware
- Users can only access their own data or data assigned to them
- Admins have full access to all collections

---

## 📚 Related Documentation

- [Complete Database Schema](./DATABASE_SCHEMA.md) - Detailed schema documentation
- [Database Diagrams](./DATABASE_DIAGRAMS.md) - Visual diagrams
- [Flow Diagrams](./FLOW_DIAGRAMS.md) - Application flow diagrams
- [Firestore Security Rules](./FIRESTORE_SECURITY_RULES.md) - Security rules

---

**Last Updated**: Current Implementation
**Version**: 1.0.0

