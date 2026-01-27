# FitFix Firestore Collections Schema

## Database: Firebase Firestore (NoSQL)

This document presents the FitFix database schema as Firestore collections with their actual field types and structure.

---

## Collection 1: `users`

**Document ID**: Firebase Auth UID (String)

**Description**: Stores all user accounts (Admin, Employee, and User roles)

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| uid | String | NOT NULL | PRIMARY KEY | - | Firebase Auth UID (same as document ID) |
| email | String | NOT NULL | UNIQUE | - | User email address (lowercase) |
| displayName | String | NOT NULL | - | - | Full name of the user |
| role | String | NOT NULL | INDEX | - | User role: 'admin', 'employee', or 'user' |
| isActive | Boolean | NOT NULL | - | true | Account active status |
| phoneNumber | String | NULL | - | null | Contact phone number |
| photoURL | String | NULL | - | null | Profile picture URL |
| createdAt | Timestamp | NOT NULL | INDEX | ServerTimestamp | Account creation timestamp |
| updatedAt | Timestamp | NOT NULL | - | ServerTimestamp | Last update timestamp |
| lastLogin | Timestamp | NULL | - | null | Last login timestamp |
| signupMethod | String | NULL | - | null | 'mobile' or 'employee' |
| createdBy | String | NULL | REFERENCE (users) | null | UID of creator |
| assignedEmployeeId | String | NULL | REFERENCE (users), INDEX | null | UID of assigned employee/coach (for users) |
| dateOfBirth | String | NULL | - | null | Date of birth (ISO string) |
| age | Number | NULL | - | null | Calculated age |
| gender | String | NULL | - | null | User gender: 'male' or 'female' |
| height | Number | NULL | - | null | Height in cm |
| weight | Number | NULL | - | null | Weight in kg |
| address | String | NULL | - | null | Physical address |
| country | String | NULL | - | null | Country |
| city | String | NULL | - | null | City |
| fitnessGoals | Array<String> | NULL | - | null | Array of fitness goals |
| planType | String | NULL | - | null | Selected plan type |
| pushToken | String | NULL | - | null | FCM push notification token |
| status | String | NULL | INDEX | null | 'active', 'inactive', or 'pending' (for employees) |
| verified | Boolean | NULL | - | false | Employee verification status |
| subscriptionId | String | NULL | REFERENCE (subscriptions) | null | Reference to subscription document |
| mealPlan | Map | NULL | - | null | Nested object: Current meal plan |
| reminders | Map | NULL | - | null | Nested object: Reminder settings |
| resetPassword | Map | NULL | - | null | Nested object: Password reset OTP data |

**Nested Objects:**

**mealPlan** (Map):
- goal: String
- totalCalories: Number
- breakfast: Map
- lunch: Map
- dinner: Map
- snacks: Map
- dailyMacros: Map {proteins: Number, carbs: Number, fats: Number, allZero: Boolean}
- createdAt: Timestamp
- updatedAt: Timestamp

**reminders** (Map):
- water: Map {enabled: Boolean, intervalHours: Number, startTime: String}
- sleep: Map {enabled: Boolean, time: String}
- gym: Map {enabled: Boolean, time: String}
- meal: Map {enabled: Boolean, time: String}

**resetPassword** (Map):
- codeHash: String
- expiresAt: Timestamp
- attempts: Number
- verified: Boolean
- createdAt: Timestamp
- verifiedAt: Timestamp

**Indexes:**
- Collection: users
- Fields: role, email, assignedEmployeeId, status, createdAt

---

## Collection 2: `chats`

**Document ID**: String (Format: `{role1}_{id1}__{role2}_{id2}`)

**Description**: Chat conversations between users

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| chatId | String | NOT NULL | PRIMARY KEY | - | Unique chat identifier (same as document ID) |
| participants | Array<String> | NOT NULL | INDEX | - | Array of participant UIDs [participant1Id, participant2Id] |
| lastMessage | Map | NULL | - | null | Last message object |
| lastActivity | Timestamp | NOT NULL | INDEX | ServerTimestamp | Last activity timestamp |
| updatedAt | Timestamp | NOT NULL | - | ServerTimestamp | Last update timestamp |
| createdAt | Timestamp | NOT NULL | - | ServerTimestamp | Chat creation timestamp |
| unreadCount | Map<String, Number> | NULL | - | null | Unread count per user {userId: count} |

**lastMessage** (Map):
- content: String
- senderId: String
- senderRole: String
- createdAt: Timestamp

**Subcollection**: `messages`
- messageId: String
- chatId: String
- senderId: String
- senderRole: String
- recipientId: String
- content: String
- type: String ('text', 'image', 'file')
- read: Boolean
- readAt: Timestamp | null
- createdAt: Timestamp
- reactions: Map

**Indexes:**
- Collection: chats
- Fields: participants (array-contains), lastActivity

---

## Collection 3: `messages`

**Document ID**: String (Auto-generated: `msg_{timestamp}_{random}`)

**Description**: Backup storage for messages (also stored in chats/{chatId}/messages subcollection)

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| messageId | String | NOT NULL | PRIMARY KEY | - | Unique message identifier (same as document ID) |
| chatId | String | NOT NULL | REFERENCE (chats) | - | Reference to chat document |
| senderId | String | NOT NULL | REFERENCE (users) | - | Sender UID |
| senderRole | String | NOT NULL | - | - | Sender role: 'admin', 'employee', or 'user' |
| recipientId | String | NOT NULL | REFERENCE (users) | - | Recipient UID |
| content | String | NOT NULL | - | - | Message content |
| type | String | NOT NULL | - | 'text' | Message type: 'text', 'image', or 'file' |
| read | Boolean | NOT NULL | INDEX | false | Read status |
| readAt | Timestamp | NULL | - | null | Read timestamp |
| createdAt | Timestamp | NOT NULL | INDEX | ServerTimestamp | Message creation timestamp |
| reactions | Map | NULL | - | null | Message reactions {emoji: [userId1, userId2]} |

**Indexes:**
- Collection: messages
- Fields: chatId, senderId, recipientId, read, createdAt

---

## Collection 4: `notifications`

**Document ID**: String (Auto-generated)

**Description**: System notifications for users

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | String | NOT NULL | PRIMARY KEY | - | Unique notification identifier (same as document ID) |
| type | String | NOT NULL | INDEX | - | Notification type: 'message', 'payment', 'plan', 'system' |
| title | String | NOT NULL | - | - | Notification title |
| message | String | NOT NULL | - | - | Notification message |
| userId | String | NOT NULL | REFERENCE (users), INDEX | - | Target user UID |
| relatedId | String | NULL | - | null | Related entity ID (payment, chat, etc.) |
| relatedType | String | NULL | - | null | Related entity type |
| read | Boolean | NOT NULL | INDEX | false | Read status |
| readAt | Timestamp | NULL | - | null | Read timestamp |
| createdAt | Timestamp | NOT NULL | INDEX | ServerTimestamp | Notification creation timestamp |
| priority | String | NULL | - | 'medium' | Priority: 'low', 'medium', or 'high' |

**Indexes:**
- Collection: notifications
- Fields: type, userId, read, createdAt

---

## Collection 5: `payments`

**Document ID**: String (Auto-generated)

**Description**: User payments to employees for services

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | String | NOT NULL | PRIMARY KEY | - | Unique payment identifier (same as document ID) |
| userId | String | NOT NULL | REFERENCE (users), INDEX | - | User UID who made payment |
| employeeId | String | NOT NULL | REFERENCE (users), INDEX | - | Employee UID receiving payment |
| amount | Number | NOT NULL | - | - | Payment amount |
| method | String | NOT NULL | - | - | Payment method: 'cash', 'omt', 'whatsapp' |
| status | String | NOT NULL | INDEX | 'pending' | Payment status: 'pending', 'completed', 'rejected' |
| approvedByEmployee | Boolean | NOT NULL | - | false | Employee approval status |
| approvedByEmployeeAt | Timestamp | NULL | - | null | Employee approval timestamp |
| approvedByEmployeeId | String | NULL | REFERENCE (users) | null | Employee UID who approved |
| approvedByAdmin | Boolean | NOT NULL | - | false | Admin approval status |
| approvedByAdminAt | Timestamp | NULL | - | null | Admin approval timestamp |
| approvedByAdminId | String | NULL | REFERENCE (users) | null | Admin UID who approved |
| rejectionReason | String | NULL | - | null | Rejection reason if rejected |
| createdAt | Timestamp | NOT NULL | INDEX | ServerTimestamp | Payment creation timestamp |
| updatedAt | Timestamp | NOT NULL | - | ServerTimestamp | Last update timestamp |

**Indexes:**
- Collection: payments
- Fields: userId, employeeId, status, createdAt

---

## Collection 6: `employeePayments`

**Document ID**: String (Auto-generated)

**Description**: Employee subscription payments to become coaches

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | String | NOT NULL | PRIMARY KEY | - | Unique payment identifier (same as document ID) |
| name | String | NOT NULL | - | - | Employee full name |
| email | String | NOT NULL | UNIQUE, INDEX | - | Employee email (lowercase) |
| phoneNumber | String | NULL | - | null | Phone number |
| address | String | NULL | - | null | Physical address |
| country | String | NULL | - | null | Country |
| city | String | NULL | - | null | City |
| gender | String | NULL | - | null | Gender: 'male' or 'female' |
| dateOfBirth | String | NULL | - | null | Date of birth (ISO string) |
| notes | String | NULL | - | null | Additional notes |
| selectedPlan | String | NOT NULL | - | - | Plan label (e.g., "Monthly Plan") |
| selectedPlanKey | String | NOT NULL | - | - | Plan key (e.g., "monthly") |
| amount | Number | NOT NULL | - | - | Payment amount |
| paid | Boolean | NOT NULL | INDEX | false | Payment status |
| timestamp | Timestamp | NULL | - | null | Payment timestamp |
| createdAt | Timestamp | NOT NULL | INDEX | ServerTimestamp | Document creation timestamp |
| accountCreated | Boolean | NOT NULL | INDEX | false | Whether employee account was created |

**Indexes:**
- Collection: employeePayments
- Fields: email, paid, accountCreated, createdAt

---

## Collection 7: `subscriptions`

**Document ID**: String (Auto-generated)

**Description**: Employee subscription records

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | String | NOT NULL | PRIMARY KEY | - | Unique subscription identifier (same as document ID) |
| employeePaymentId | String | NULL | REFERENCE (employeePayments) | null | Reference to employeePayments document |
| employeeEmail | String | NOT NULL | INDEX | - | Employee email |
| employeeName | String | NOT NULL | - | - | Employee name |
| planType | String | NOT NULL | - | - | Plan type: 'monthly', 'twoMonth', 'threeMonth', 'yearly' |
| planLabel | String | NOT NULL | - | - | Plan display label |
| amount | Number | NOT NULL | - | - | Subscription amount |
| paymentDate | Timestamp | NULL | - | null | Payment date |
| startDate | Timestamp | NOT NULL | INDEX | ServerTimestamp | Subscription start date |
| expirationDate | Timestamp | NOT NULL | INDEX | - | Subscription expiration date |
| status | String | NOT NULL | INDEX | 'active' | Subscription status: 'active', 'expired', 'cancelled' |
| isActive | Boolean | NOT NULL | INDEX | true | Active status |
| createdAt | Timestamp | NOT NULL | INDEX | ServerTimestamp | Document creation timestamp |
| reminderSent | Boolean | NOT NULL | - | false | Expiration reminder sent |
| expirationEmailSent | Boolean | NOT NULL | - | false | Expiration email sent |

**Indexes:**
- Collection: subscriptions
- Fields: employeeEmail, status, expirationDate, isActive, createdAt

---

## Collection 8: `employeeRequests`

**Document ID**: String (Auto-generated)

**Description**: Employee signup requests (before approval)

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | String | NOT NULL | PRIMARY KEY | - | Unique request identifier (same as document ID) |
| fullName | String | NOT NULL | - | - | Applicant full name |
| email | String | NOT NULL | UNIQUE, INDEX | - | Applicant email (lowercase) |
| phone | String | NULL | - | null | Phone number |
| address | String | NULL | - | null | Physical address |
| country | String | NULL | - | null | Country |
| city | String | NULL | - | null | City |
| gender | String | NULL | - | null | Gender: 'male' or 'female' |
| dateOfBirth | String | NULL | - | null | Date of birth (ISO string) |
| notes | String | NULL | - | null | Additional notes |
| selectedPlan | String | NOT NULL | - | - | Selected subscription plan |
| selectedPlanKey | String | NOT NULL | - | - | Plan key |
| amount | Number | NOT NULL | - | - | Payment amount |
| recaptchaScore | Number | NULL | - | null | reCAPTCHA score (0-1) |
| phoneVerified | Boolean | NOT NULL | - | false | Phone verification status |
| status | String | NOT NULL | INDEX | 'pending' | Request status: 'pending', 'approved', 'rejected' |
| reviewedBy | String | NULL | REFERENCE (users) | null | Admin UID who reviewed |
| reviewedAt | Timestamp | NULL | - | null | Review timestamp |
| rejectionReason | String | NULL | - | null | Rejection reason |
| createdAt | Timestamp | NOT NULL | INDEX | ServerTimestamp | Request creation timestamp |
| updatedAt | Timestamp | NOT NULL | - | ServerTimestamp | Last update timestamp |

**Indexes:**
- Collection: employeeRequests
- Fields: email, status, createdAt

---

## Collection 9: `mealPlans`

**Document ID**: String (Auto-generated)

**Description**: Meal plans assigned to users

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | String | NOT NULL | PRIMARY KEY | - | Unique meal plan identifier (same as document ID) |
| userId | String | NOT NULL | REFERENCE (users), INDEX | - | User UID |
| employeeId | String | NOT NULL | REFERENCE (users), INDEX | - | Employee UID who created the plan |
| title | String | NOT NULL | - | - | Plan title |
| description | String | NULL | - | null | Plan description |
| goal | String | NULL | - | null | Meal plan goal |
| totalCalories | Number | NULL | - | null | Daily calorie target |
| meals | Array<Map> | NOT NULL | - | - | Array of meal objects |
| dailyMacros | Map | NULL | - | null | Daily macros {proteins: Number, carbs: Number, fats: Number, allZero: Boolean} |
| duration | Number | NULL | - | null | Plan duration in days |
| startDate | Timestamp | NULL | - | null | Plan start date |
| endDate | Timestamp | NULL | - | null | Plan end date |
| isActive | Boolean | NOT NULL | INDEX | true | Active status |
| createdAt | Timestamp | NOT NULL | INDEX | ServerTimestamp | Plan creation timestamp |
| updatedAt | Timestamp | NOT NULL | - | ServerTimestamp | Last update timestamp |

**meals** (Array<Map>):
- day: String
- breakfast: Map {food: String, calories: Number, macros: Map}
- lunch: Map {food: String, calories: Number, macros: Map}
- dinner: Map {food: String, calories: Number, macros: Map}
- snacks: Map {food: String, calories: Number, macros: Map}
- totalCalories: Number

**Indexes:**
- Collection: mealPlans
- Fields: userId, employeeId, isActive, createdAt

---

## Collection 10: `mealPlanTemplates`

**Document ID**: String (Auto-generated)

**Description**: Reusable meal plan templates

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | String | NOT NULL | PRIMARY KEY | - | Unique template identifier (same as document ID) |
| title | String | NOT NULL | - | - | Template title |
| description | String | NULL | - | null | Template description |
| category | String | NULL | INDEX | null | Template category |
| meals | Array<Map> | NOT NULL | - | - | Array of meal objects (same structure as mealPlans) |
| duration | Number | NULL | - | null | Template duration in days |
| createdBy | String | NOT NULL | REFERENCE (users), INDEX | - | Employee UID who created template |
| createdAt | Timestamp | NOT NULL | INDEX | ServerTimestamp | Template creation timestamp |
| updatedAt | Timestamp | NOT NULL | - | ServerTimestamp | Last update timestamp |

**Indexes:**
- Collection: mealPlanTemplates
- Fields: createdBy, category, createdAt

---

## Collection 11: `workoutPlans`

**Document ID**: String (User UID - one plan per user)

**Description**: Workout plans assigned to users

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | String | NOT NULL | PRIMARY KEY | - | Unique workout plan identifier (usually userId, same as document ID) |
| userId | String | NOT NULL | REFERENCE (users), INDEX | - | User UID |
| employeeId | String | NOT NULL | REFERENCE (users), INDEX | - | Employee UID who created the plan |
| title | String | NOT NULL | - | - | Plan title |
| description | String | NULL | - | null | Plan description |
| exercises | Array<Map> | NOT NULL | - | - | Array of exercise objects |
| duration | Number | NULL | - | null | Plan duration in weeks |
| startDate | Timestamp | NULL | - | null | Plan start date |
| endDate | Timestamp | NULL | - | null | Plan end date |
| isActive | Boolean | NOT NULL | INDEX | true | Active status |
| createdAt | Timestamp | NOT NULL | INDEX | ServerTimestamp | Plan creation timestamp |
| updatedAt | Timestamp | NOT NULL | - | ServerTimestamp | Last update timestamp |

**exercises** (Array<Map>):
- exerciseId: String (Reference to exercises collection)
- name: String
- sets: Number
- reps: String (e.g., "10-12")
- rest: Number (seconds)
- day: String (day of week)
- gifUrl: String
- gifUrlFemale: String | null

**Indexes:**
- Collection: workoutPlans
- Fields: userId, employeeId, isActive, createdAt

---

## Collection 12: `exercises`

**Document ID**: String (Auto-generated)

**Description**: Exercise library with GIFs

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | String | NOT NULL | PRIMARY KEY | - | Unique exercise identifier (same as document ID) |
| name | String | NOT NULL | INDEX | - | Exercise name |
| description | String | NULL | - | null | Exercise description |
| category | String | NULL | INDEX | null | Exercise category |
| muscleGroups | Array<String> | NULL | INDEX | null | Array of targeted muscle groups |
| difficulty | String | NULL | INDEX | null | Difficulty: 'beginner', 'intermediate', 'advanced' |
| equipment | Array<String> | NULL | - | null | Array of required equipment |
| gifUrl | String | NULL | - | null | Male/default GIF URL |
| gifUrlFemale | String | NULL | - | null | Female-specific GIF URL |
| instructions | Array<String> | NULL | - | null | Array of exercise instructions |
| tips | Array<String> | NULL | - | null | Array of exercise tips |
| createdAt | Timestamp | NOT NULL | INDEX | ServerTimestamp | Exercise creation timestamp |
| updatedAt | Timestamp | NOT NULL | - | ServerTimestamp | Last update timestamp |

**Indexes:**
- Collection: exercises
- Fields: name, category, difficulty, muscleGroups (array-contains), createdAt

---

## Collection 13: `progress` (Subcollection)

**Parent Collection**: `users`

**Document ID**: String (Auto-generated)

**Description**: User progress tracking entries

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | String | NOT NULL | PRIMARY KEY | - | Unique progress entry identifier (same as document ID) |
| userId | String | NOT NULL | REFERENCE (users), INDEX | - | User UID (parent document ID) |
| date | Timestamp | NOT NULL | INDEX | ServerTimestamp | Progress date |
| weight | Number | NULL | - | null | Weight in kg |
| bodyFat | Number | NULL | - | null | Body fat percentage |
| measurements | Map | NULL | - | null | Body measurements object |
| photos | Array<Map> | NULL | - | null | Array of progress photo objects |
| notes | String | NULL | - | null | Progress notes |
| createdAt | Timestamp | NOT NULL | INDEX | ServerTimestamp | Entry creation timestamp |
| updatedAt | Timestamp | NOT NULL | - | ServerTimestamp | Last update timestamp |

**measurements** (Map):
- chest: Number
- waist: Number
- hips: Number
- arms: Number
- thighs: Number

**photos** (Array<Map>):
- url: String
- type: String ('front', 'side', 'back')
- uploadedAt: Timestamp

**Indexes:**
- Collection: users/{userId}/progress
- Fields: userId, date (composite), createdAt

---

## Collection 14: `adminTransactions`

**Document ID**: String (Auto-generated)

**Description**: Admin transaction records

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | String | NOT NULL | PRIMARY KEY | - | Unique transaction identifier (same as document ID) |
| type | String | NOT NULL | INDEX | - | Transaction type |
| amount | Number | NOT NULL | - | - | Transaction amount |
| description | String | NULL | - | null | Transaction description |
| relatedId | String | NULL | - | null | Related entity ID |
| relatedType | String | NULL | - | null | Related entity type |
| createdBy | String | NOT NULL | REFERENCE (users), INDEX | - | Admin UID |
| createdAt | Timestamp | NOT NULL | INDEX | ServerTimestamp | Transaction timestamp |

**Indexes:**
- Collection: adminTransactions
- Fields: createdBy, type, createdAt

---

## Firestore Data Types Reference

| Firestore Type | Description | Example |
|----------------|-------------|---------|
| **String** | Text data | "John Doe", "user@example.com" |
| **Number** | Numeric data (integer or float) | 100, 75.5, 0 |
| **Boolean** | True/false value | true, false |
| **Timestamp** | Date and time | Firestore Timestamp object |
| **Array** | Ordered list of values | ["goal1", "goal2"], [1, 2, 3] |
| **Map** | Key-value pairs (object) | {name: "John", age: 30} |
| **Reference** | Reference to another document | DocumentReference |
| **Null** | Empty value | null |
| **GeoPoint** | Geographic coordinates | GeoPoint(lat, lng) |

---

## Firestore Indexes Summary

### Composite Indexes Required:

1. **users**
   - role + createdAt
   - assignedEmployeeId + createdAt
   - status + createdAt

2. **chats**
   - participants (array-contains) + lastActivity

3. **messages**
   - chatId + createdAt
   - senderId + createdAt
   - recipientId + read + createdAt

4. **notifications**
   - userId + read + createdAt
   - userId + type + createdAt

5. **payments**
   - userId + status + createdAt
   - employeeId + status + createdAt

6. **subscriptions**
   - employeeEmail + status + createdAt
   - isActive + expirationDate

7. **mealPlans**
   - userId + isActive + createdAt
   - employeeId + isActive + createdAt

8. **workoutPlans**
   - userId + isActive + createdAt
   - employeeId + isActive + createdAt

9. **exercises**
   - category + difficulty
   - muscleGroups (array-contains) + difficulty

10. **progress** (subcollection)
    - userId + date
    - date + createdAt

---

## Collection Relationships

Relationships in Firestore are maintained through:
- **Document References**: Storing document IDs as String fields
- **Document Paths**: Using full document paths
- **Subcollections**: Hierarchical data organization

**Key Relationships:**
- `users.assignedEmployeeId` → `users.uid` (where role = 'employee')
- `users.subscriptionId` → `subscriptions.id`
- `payments.userId` → `users.uid`
- `payments.employeeId` → `users.uid` (where role = 'employee')
- `mealPlans.userId` → `users.uid`
- `mealPlans.employeeId` → `users.uid` (where role = 'employee')
- `workoutPlans.userId` → `users.uid`
- `workoutPlans.employeeId` → `users.uid` (where role = 'employee')
- `chats.participants[]` → `users.uid`
- `messages.chatId` → `chats.chatId`
- `notifications.userId` → `users.uid`
- `subscriptions.employeePaymentId` → `employeePayments.id`
- `progress` (subcollection) → `users/{userId}/progress`

---

## Notes

- **Document IDs**: 
  - `users`: Firebase Auth UID
  - `chats`: Format `{role1}_{id1}__{role2}_{id2}`
  - `workoutPlans`: User UID (one plan per user)
  - Others: Auto-generated Firestore IDs

- **Timestamps**: 
  - Use Firestore `Timestamp` type
  - Can use `ServerTimestamp` for automatic server-side timestamp

- **Arrays**: 
  - Used for multi-value fields (participants, muscleGroups, fitnessGoals)
  - Can use `array-contains` queries

- **Maps (Objects)**: 
  - Used for nested data structures
  - Can nest multiple levels

- **References**: 
  - Stored as String (document ID or path)
  - No foreign key constraints (enforced in application code)

- **Subcollections**: 
  - `users/{userId}/progress` - User progress entries
  - `chats/{chatId}/messages` - Messages in a chat

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Database System**: Firebase Firestore (NoSQL Document Database)

