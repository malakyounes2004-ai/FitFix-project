# FitFix Database Schema - Table Format

## Database: FitFix

This document presents the FitFix database schema in relational table format. Note: FitFix uses Firestore (NoSQL), but this representation converts the collections into relational tables for documentation and understanding purposes.

---

## Table 1: USERS

**Description**: Stores all user accounts (Admin, Employee, and User roles)

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| uid | VARCHAR(128) | NOT NULL | PRIMARY KEY | - | Firebase Auth UID (unique identifier) |
| email | VARCHAR(255) | NOT NULL | UNIQUE | - | User email address (lowercase) |
| displayName | VARCHAR(255) | NOT NULL | - | - | Full name of the user |
| role | VARCHAR(20) | NOT NULL | INDEX | - | User role: 'admin', 'employee', or 'user' |
| isActive | BOOLEAN | NOT NULL | - | TRUE | Account active status |
| phoneNumber | VARCHAR(50) | NULL | - | NULL | Contact phone number |
| photoURL | VARCHAR(500) | NULL | - | NULL | Profile picture URL |
| createdAt | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Account creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | - | CURRENT_TIMESTAMP | Last update timestamp |
| lastLogin | TIMESTAMP | NULL | - | NULL | Last login timestamp |
| signupMethod | VARCHAR(20) | NULL | - | NULL | 'mobile' or 'employee' |
| createdBy | VARCHAR(128) | NULL | FOREIGN KEY (users.uid) | NULL | UID of creator |
| assignedEmployeeId | VARCHAR(128) | NULL | FOREIGN KEY (users.uid) | NULL | UID of assigned employee/coach (for users) |
| dateOfBirth | DATE | NULL | - | NULL | Date of birth |
| age | INTEGER | NULL | - | NULL | Calculated age |
| gender | VARCHAR(10) | NULL | - | NULL | User gender: 'male' or 'female' |
| height | DECIMAL(5,2) | NULL | - | NULL | Height in cm |
| weight | DECIMAL(5,2) | NULL | - | NULL | Weight in kg |
| address | VARCHAR(500) | NULL | - | NULL | Physical address |
| country | VARCHAR(100) | NULL | - | NULL | Country |
| city | VARCHAR(100) | NULL | - | NULL | City |
| fitnessGoals | JSON | NULL | - | NULL | Array of fitness goals |
| planType | VARCHAR(50) | NULL | - | NULL | Selected plan type |
| pushToken | VARCHAR(500) | NULL | - | NULL | FCM push notification token |
| status | VARCHAR(20) | NULL | INDEX | NULL | 'active', 'inactive', or 'pending' (for employees) |
| verified | BOOLEAN | NULL | - | FALSE | Employee verification status |
| subscriptionId | VARCHAR(128) | NULL | FOREIGN KEY (subscriptions.id) | NULL | Reference to subscription document |

**Indexes:**
- PRIMARY KEY: uid
- UNIQUE: email
- INDEX: role, assignedEmployeeId, status, createdAt

---

## Table 2: CHATS

**Description**: Chat conversations between users

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| chatId | VARCHAR(255) | NOT NULL | PRIMARY KEY | - | Unique chat identifier (format: role1_id1__role2_id2) |
| participant1Id | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid) | - | First participant UID |
| participant2Id | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid) | - | Second participant UID |
| participants | JSON | NOT NULL | INDEX | - | Array of participant UIDs [participant1Id, participant2Id] |
| lastMessageContent | TEXT | NULL | - | NULL | Last message content |
| lastMessageSenderId | VARCHAR(128) | NULL | FOREIGN KEY (users.uid) | NULL | Last message sender UID |
| lastMessageSenderRole | VARCHAR(20) | NULL | - | NULL | Last message sender role |
| lastMessageCreatedAt | TIMESTAMP | NULL | - | NULL | Last message timestamp |
| lastActivity | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Last activity timestamp |
| updatedAt | TIMESTAMP | NOT NULL | - | CURRENT_TIMESTAMP | Last update timestamp |
| createdAt | TIMESTAMP | NOT NULL | - | CURRENT_TIMESTAMP | Chat creation timestamp |
| unreadCount | JSON | NULL | - | NULL | Unread count per user {userId: count} |

**Indexes:**
- PRIMARY KEY: chatId
- INDEX: participants (array-contains), lastActivity

---

## Table 3: MESSAGES

**Description**: Individual messages in chat conversations

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| messageId | VARCHAR(255) | NOT NULL | PRIMARY KEY | - | Unique message identifier |
| chatId | VARCHAR(255) | NOT NULL | FOREIGN KEY (chats.chatId) | - | Reference to chat document |
| senderId | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid) | - | Sender UID |
| senderRole | VARCHAR(20) | NOT NULL | - | - | Sender role: 'admin', 'employee', or 'user' |
| recipientId | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid) | - | Recipient UID |
| content | TEXT | NOT NULL | - | - | Message content |
| type | VARCHAR(20) | NOT NULL | - | 'text' | Message type: 'text', 'image', or 'file' |
| read | BOOLEAN | NOT NULL | INDEX | FALSE | Read status |
| readAt | TIMESTAMP | NULL | - | NULL | Read timestamp |
| createdAt | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Message creation timestamp |
| reactions | JSON | NULL | - | NULL | Message reactions {emoji: [userId1, userId2]} |

**Indexes:**
- PRIMARY KEY: messageId
- FOREIGN KEY: chatId, senderId, recipientId
- INDEX: read, createdAt

---

## Table 4: NOTIFICATIONS

**Description**: System notifications for users

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | VARCHAR(255) | NOT NULL | PRIMARY KEY | - | Unique notification identifier |
| type | VARCHAR(50) | NOT NULL | INDEX | - | Notification type: 'message', 'payment', 'plan', 'system' |
| title | VARCHAR(255) | NOT NULL | - | - | Notification title |
| message | TEXT | NOT NULL | - | - | Notification message |
| userId | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid), INDEX | - | Target user UID |
| relatedId | VARCHAR(255) | NULL | - | NULL | Related entity ID (payment, chat, etc.) |
| relatedType | VARCHAR(50) | NULL | - | NULL | Related entity type |
| read | BOOLEAN | NOT NULL | INDEX | FALSE | Read status |
| readAt | TIMESTAMP | NULL | - | NULL | Read timestamp |
| createdAt | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Notification creation timestamp |
| priority | VARCHAR(20) | NULL | - | 'medium' | Priority: 'low', 'medium', or 'high' |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: userId
- INDEX: type, userId, read, createdAt

---

## Table 5: PAYMENTS

**Description**: User payments to employees for services

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | VARCHAR(255) | NOT NULL | PRIMARY KEY | - | Unique payment identifier |
| userId | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid), INDEX | - | User UID who made payment |
| employeeId | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid), INDEX | - | Employee UID receiving payment |
| amount | DECIMAL(10,2) | NOT NULL | - | - | Payment amount |
| method | VARCHAR(50) | NOT NULL | - | - | Payment method: 'cash', 'omt', 'whatsapp' |
| status | VARCHAR(20) | NOT NULL | INDEX | 'pending' | Payment status: 'pending', 'completed', 'rejected' |
| approvedByEmployee | BOOLEAN | NOT NULL | - | FALSE | Employee approval status |
| approvedByEmployeeAt | TIMESTAMP | NULL | - | NULL | Employee approval timestamp |
| approvedByEmployeeId | VARCHAR(128) | NULL | FOREIGN KEY (users.uid) | NULL | Employee UID who approved |
| approvedByAdmin | BOOLEAN | NOT NULL | - | FALSE | Admin approval status |
| approvedByAdminAt | TIMESTAMP | NULL | - | NULL | Admin approval timestamp |
| approvedByAdminId | VARCHAR(128) | NULL | FOREIGN KEY (users.uid) | NULL | Admin UID who approved |
| rejectionReason | TEXT | NULL | - | NULL | Rejection reason if rejected |
| createdAt | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Payment creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | - | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: userId, employeeId, approvedByEmployeeId, approvedByAdminId
- INDEX: userId, employeeId, status, createdAt

---

## Table 6: EMPLOYEE_PAYMENTS

**Description**: Employee subscription payments to become coaches

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | VARCHAR(255) | NOT NULL | PRIMARY KEY | - | Unique payment identifier |
| name | VARCHAR(255) | NOT NULL | - | - | Employee full name |
| email | VARCHAR(255) | NOT NULL | UNIQUE, INDEX | - | Employee email (lowercase) |
| phoneNumber | VARCHAR(50) | NULL | - | NULL | Phone number |
| address | VARCHAR(500) | NULL | - | NULL | Physical address |
| country | VARCHAR(100) | NULL | - | NULL | Country |
| city | VARCHAR(100) | NULL | - | NULL | City |
| gender | VARCHAR(10) | NULL | - | NULL | Gender: 'male' or 'female' |
| dateOfBirth | DATE | NULL | - | NULL | Date of birth |
| notes | TEXT | NULL | - | NULL | Additional notes |
| selectedPlan | VARCHAR(100) | NOT NULL | - | - | Plan label (e.g., "Monthly Plan") |
| selectedPlanKey | VARCHAR(50) | NOT NULL | - | - | Plan key (e.g., "monthly") |
| amount | DECIMAL(10,2) | NOT NULL | - | - | Payment amount |
| paid | BOOLEAN | NOT NULL | INDEX | FALSE | Payment status |
| timestamp | TIMESTAMP | NULL | - | NULL | Payment timestamp |
| createdAt | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Document creation timestamp |
| accountCreated | BOOLEAN | NOT NULL | INDEX | FALSE | Whether employee account was created |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: email
- INDEX: email, paid, accountCreated, createdAt

---

## Table 7: SUBSCRIPTIONS

**Description**: Employee subscription records

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | VARCHAR(255) | NOT NULL | PRIMARY KEY | - | Unique subscription identifier |
| employeePaymentId | VARCHAR(255) | NULL | FOREIGN KEY (employee_payments.id) | NULL | Reference to employeePayments document |
| employeeEmail | VARCHAR(255) | NOT NULL | INDEX | - | Employee email |
| employeeName | VARCHAR(255) | NOT NULL | - | - | Employee name |
| planType | VARCHAR(50) | NOT NULL | - | - | Plan type: 'monthly', 'twoMonth', 'threeMonth', 'yearly' |
| planLabel | VARCHAR(100) | NOT NULL | - | - | Plan display label |
| amount | DECIMAL(10,2) | NOT NULL | - | - | Subscription amount |
| paymentDate | TIMESTAMP | NULL | - | NULL | Payment date |
| startDate | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Subscription start date |
| expirationDate | TIMESTAMP | NOT NULL | INDEX | - | Subscription expiration date |
| status | VARCHAR(20) | NOT NULL | INDEX | 'active' | Subscription status: 'active', 'expired', 'cancelled' |
| isActive | BOOLEAN | NOT NULL | INDEX | TRUE | Active status |
| createdAt | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Document creation timestamp |
| reminderSent | BOOLEAN | NOT NULL | - | FALSE | Expiration reminder sent |
| expirationEmailSent | BOOLEAN | NOT NULL | - | FALSE | Expiration email sent |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: employeePaymentId
- INDEX: employeeEmail, status, expirationDate, isActive, createdAt

---

## Table 8: EMPLOYEE_REQUESTS

**Description**: Employee signup requests (before approval)

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | VARCHAR(255) | NOT NULL | PRIMARY KEY | - | Unique request identifier |
| fullName | VARCHAR(255) | NOT NULL | - | - | Applicant full name |
| email | VARCHAR(255) | NOT NULL | UNIQUE, INDEX | - | Applicant email (lowercase) |
| phone | VARCHAR(50) | NULL | - | NULL | Phone number |
| address | VARCHAR(500) | NULL | - | NULL | Physical address |
| country | VARCHAR(100) | NULL | - | NULL | Country |
| city | VARCHAR(100) | NULL | - | NULL | City |
| gender | VARCHAR(10) | NULL | - | NULL | Gender: 'male' or 'female' |
| dateOfBirth | DATE | NULL | - | NULL | Date of birth |
| notes | TEXT | NULL | - | NULL | Additional notes |
| selectedPlan | VARCHAR(100) | NOT NULL | - | - | Selected subscription plan |
| selectedPlanKey | VARCHAR(50) | NOT NULL | - | - | Plan key |
| amount | DECIMAL(10,2) | NOT NULL | - | - | Payment amount |
| recaptchaScore | DECIMAL(3,2) | NULL | - | NULL | reCAPTCHA score (0-1) |
| phoneVerified | BOOLEAN | NOT NULL | - | FALSE | Phone verification status |
| status | VARCHAR(20) | NOT NULL | INDEX | 'pending' | Request status: 'pending', 'approved', 'rejected' |
| reviewedBy | VARCHAR(128) | NULL | FOREIGN KEY (users.uid) | NULL | Admin UID who reviewed |
| reviewedAt | TIMESTAMP | NULL | - | NULL | Review timestamp |
| rejectionReason | TEXT | NULL | - | NULL | Rejection reason |
| createdAt | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Request creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | - | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: email
- FOREIGN KEY: reviewedBy
- INDEX: email, status, createdAt

---

## Table 9: MEAL_PLANS

**Description**: Meal plans assigned to users

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | VARCHAR(255) | NOT NULL | PRIMARY KEY | - | Unique meal plan identifier |
| userId | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid), INDEX | - | User UID |
| employeeId | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid), INDEX | - | Employee UID who created the plan |
| title | VARCHAR(255) | NOT NULL | - | - | Plan title |
| description | TEXT | NULL | - | NULL | Plan description |
| goal | VARCHAR(100) | NULL | - | NULL | Meal plan goal |
| totalCalories | INTEGER | NULL | - | NULL | Daily calorie target |
| meals | JSON | NOT NULL | - | - | Array of meal objects (breakfast, lunch, dinner, snacks) |
| dailyMacros | JSON | NULL | - | NULL | Daily macros {proteins, carbs, fats, allZero} |
| duration | INTEGER | NULL | - | NULL | Plan duration in days |
| startDate | TIMESTAMP | NULL | - | NULL | Plan start date |
| endDate | TIMESTAMP | NULL | - | NULL | Plan end date |
| isActive | BOOLEAN | NOT NULL | INDEX | TRUE | Active status |
| createdAt | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Plan creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | - | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: userId, employeeId
- INDEX: userId, employeeId, isActive, createdAt

---

## Table 10: MEAL_PLAN_TEMPLATES

**Description**: Reusable meal plan templates

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | VARCHAR(255) | NOT NULL | PRIMARY KEY | - | Unique template identifier |
| title | VARCHAR(255) | NOT NULL | - | - | Template title |
| description | TEXT | NULL | - | NULL | Template description |
| category | VARCHAR(100) | NULL | INDEX | NULL | Template category |
| meals | JSON | NOT NULL | - | - | Array of meal objects (same structure as mealPlans) |
| duration | INTEGER | NULL | - | NULL | Template duration in days |
| createdBy | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid), INDEX | - | Employee UID who created template |
| createdAt | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Template creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | - | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: createdBy
- INDEX: createdBy, category, createdAt

---

## Table 11: WORKOUT_PLANS

**Description**: Workout plans assigned to users

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | VARCHAR(255) | NOT NULL | PRIMARY KEY | - | Unique workout plan identifier (usually userId) |
| userId | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid), INDEX | - | User UID |
| employeeId | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid), INDEX | - | Employee UID who created the plan |
| title | VARCHAR(255) | NOT NULL | - | - | Plan title |
| description | TEXT | NULL | - | NULL | Plan description |
| exercises | JSON | NOT NULL | - | - | Array of exercise objects with sets, reps, rest, day, gifUrl |
| duration | INTEGER | NULL | - | NULL | Plan duration in weeks |
| startDate | TIMESTAMP | NULL | - | NULL | Plan start date |
| endDate | TIMESTAMP | NULL | - | NULL | Plan end date |
| isActive | BOOLEAN | NOT NULL | INDEX | TRUE | Active status |
| createdAt | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Plan creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | - | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: userId, employeeId
- INDEX: userId, employeeId, isActive, createdAt

---

## Table 12: EXERCISES

**Description**: Exercise library with GIFs

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | VARCHAR(255) | NOT NULL | PRIMARY KEY | - | Unique exercise identifier |
| name | VARCHAR(255) | NOT NULL | INDEX | - | Exercise name |
| description | TEXT | NULL | - | NULL | Exercise description |
| category | VARCHAR(100) | NULL | INDEX | NULL | Exercise category |
| muscleGroups | JSON | NULL | INDEX | NULL | Array of targeted muscle groups |
| difficulty | VARCHAR(20) | NULL | INDEX | NULL | Difficulty: 'beginner', 'intermediate', 'advanced' |
| equipment | JSON | NULL | - | NULL | Array of required equipment |
| gifUrl | VARCHAR(500) | NULL | - | NULL | Male/default GIF URL |
| gifUrlFemale | VARCHAR(500) | NULL | - | NULL | Female-specific GIF URL |
| instructions | JSON | NULL | - | NULL | Array of exercise instructions |
| tips | JSON | NULL | - | NULL | Array of exercise tips |
| createdAt | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Exercise creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | - | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY: id
- INDEX: name, category, difficulty, muscleGroups (array-contains), createdAt

---

## Table 13: PROGRESS

**Description**: User progress tracking entries

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | VARCHAR(255) | NOT NULL | PRIMARY KEY | - | Unique progress entry identifier |
| userId | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid), INDEX | - | User UID (parent document) |
| date | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Progress date |
| weight | DECIMAL(5,2) | NULL | - | NULL | Weight in kg |
| bodyFat | DECIMAL(5,2) | NULL | - | NULL | Body fat percentage |
| chestMeasurement | DECIMAL(5,2) | NULL | - | NULL | Chest measurement in cm |
| waistMeasurement | DECIMAL(5,2) | NULL | - | NULL | Waist measurement in cm |
| hipsMeasurement | DECIMAL(5,2) | NULL | - | NULL | Hips measurement in cm |
| armsMeasurement | DECIMAL(5,2) | NULL | - | NULL | Arms measurement in cm |
| thighsMeasurement | DECIMAL(5,2) | NULL | - | NULL | Thighs measurement in cm |
| photos | JSON | NULL | - | NULL | Array of progress photo URLs with type and uploadedAt |
| notes | TEXT | NULL | - | NULL | Progress notes |
| createdAt | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Entry creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | - | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: userId
- INDEX: userId, date (composite), createdAt

---

## Table 14: ADMIN_TRANSACTIONS

**Description**: Admin transaction records

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| id | VARCHAR(255) | NOT NULL | PRIMARY KEY | - | Unique transaction identifier |
| type | VARCHAR(50) | NOT NULL | INDEX | - | Transaction type |
| amount | DECIMAL(10,2) | NOT NULL | - | - | Transaction amount |
| description | TEXT | NULL | - | NULL | Transaction description |
| relatedId | VARCHAR(255) | NULL | - | NULL | Related entity ID |
| relatedType | VARCHAR(50) | NULL | - | NULL | Related entity type |
| createdBy | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid), INDEX | - | Admin UID |
| createdAt | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | Transaction timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: createdBy
- INDEX: createdBy, type, createdAt

---

## Table 15: REMINDERS

**Description**: User reminder configurations (stored as nested object in users, represented as separate table)

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| userId | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid), PRIMARY KEY | - | User UID |
| waterEnabled | BOOLEAN | NOT NULL | - | FALSE | Water reminder enabled |
| waterIntervalHours | INTEGER | NULL | - | NULL | Water reminder interval in hours |
| waterStartTime | TIME | NULL | - | NULL | Water reminder start time |
| sleepEnabled | BOOLEAN | NOT NULL | - | FALSE | Sleep reminder enabled |
| sleepTime | TIME | NULL | - | NULL | Sleep reminder time |
| gymEnabled | BOOLEAN | NOT NULL | - | FALSE | Gym reminder enabled |
| gymTime | TIME | NULL | - | NULL | Gym reminder time |
| mealEnabled | BOOLEAN | NOT NULL | - | FALSE | Meal reminder enabled |
| mealTime | TIME | NULL | - | NULL | Meal reminder time |
| updatedAt | TIMESTAMP | NOT NULL | - | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY: userId
- FOREIGN KEY: userId

---

## Table 16: PASSWORD_RESET_OTP

**Description**: Password reset OTP codes (stored as nested object in users, represented as separate table)

| Field Name | Data Type | Null | Key | Default | Description |
|------------|-----------|------|-----|---------|-------------|
| userId | VARCHAR(128) | NOT NULL | FOREIGN KEY (users.uid), PRIMARY KEY | - | User UID |
| codeHash | VARCHAR(255) | NULL | - | NULL | SHA-256 hash of OTP code |
| expiresAt | TIMESTAMP | NULL | INDEX | NULL | OTP expiration timestamp |
| attempts | INTEGER | NOT NULL | - | 0 | Number of verification attempts |
| verified | BOOLEAN | NOT NULL | - | FALSE | Verification status |
| createdAt | TIMESTAMP | NOT NULL | INDEX | CURRENT_TIMESTAMP | OTP creation timestamp |
| verifiedAt | TIMESTAMP | NULL | - | NULL | Verification timestamp |

**Indexes:**
- PRIMARY KEY: userId
- FOREIGN KEY: userId
- INDEX: expiresAt, createdAt

---

## Foreign Key Relationships Summary

1. **users**
   - `createdBy` → users.uid
   - `assignedEmployeeId` → users.uid
   - `subscriptionId` → subscriptions.id

2. **chats**
   - `participant1Id` → users.uid
   - `participant2Id` → users.uid
   - `lastMessageSenderId` → users.uid

3. **messages**
   - `chatId` → chats.chatId
   - `senderId` → users.uid
   - `recipientId` → users.uid

4. **notifications**
   - `userId` → users.uid

5. **payments**
   - `userId` → users.uid
   - `employeeId` → users.uid
   - `approvedByEmployeeId` → users.uid
   - `approvedByAdminId` → users.uid

6. **subscriptions**
   - `employeePaymentId` → employee_payments.id

7. **employee_requests**
   - `reviewedBy` → users.uid

8. **meal_plans**
   - `userId` → users.uid
   - `employeeId` → users.uid

9. **meal_plan_templates**
   - `createdBy` → users.uid

10. **workout_plans**
    - `userId` → users.uid
    - `employeeId` → users.uid

11. **progress**
    - `userId` → users.uid

12. **admin_transactions**
    - `createdBy` → users.uid

13. **reminders**
    - `userId` → users.uid

14. **password_reset_otp**
    - `userId` → users.uid

---

## Notes

- **Data Types**: 
  - VARCHAR(n): Variable-length string with max length n
  - TEXT: Large text field
  - INTEGER: Whole number
  - DECIMAL(p,s): Fixed-point number with p digits and s decimal places
  - BOOLEAN: True/False value
  - TIMESTAMP: Date and time value
  - DATE: Date value (no time)
  - TIME: Time value (no date)
  - JSON: JSON object/array (Firestore-specific, represented as JSON in relational format)

- **Default Values**: 
  - CURRENT_TIMESTAMP: Automatically set to current date/time
  - NULL: Field can be empty
  - Specific defaults: Listed in Default column

- **Keys**:
  - PRIMARY KEY: Unique identifier for each row
  - FOREIGN KEY: Reference to another table
  - UNIQUE: Field must be unique across all rows
  - INDEX: Field is indexed for faster queries

- **Firestore Considerations**:
  - This is a relational representation of a NoSQL database
  - In Firestore, relationships are maintained through UIDs/IDs, not foreign key constraints
  - Arrays are stored as JSON in this representation
  - Timestamps use Firestore Timestamp type in actual implementation

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Database System**: Firebase Firestore (NoSQL) - Represented as Relational Tables

