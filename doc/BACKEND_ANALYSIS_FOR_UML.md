# FitFix Backend System Analysis
## Complete Backend Architecture Documentation for UML Diagram Generation

---

## 1. DATABASE ANALYSIS (Firestore)

### 1.1 Collections Overview

Firestore is a NoSQL document database. All collections are top-level, and relationships are established through document references (UIDs or IDs).

---

### 1.2 Collection: `users`

**Purpose:** Central collection storing all user accounts (Admin, Employee, and User roles)

**Document ID:** Firebase Authentication UID (unique identifier from Firebase Auth)

**Main Attributes:**

| Attribute | Data Type | Description | Required |
|-----------|-----------|-------------|----------|
| `email` | String | Login email (system-generated for users: `fullname@fitfix.com`) | Yes |
| `realEmail` | String | Actual user email address (for communication) | No (users only) |
| `loginEmail` | String | System-generated login email (duplicate of `email` for clarity) | No (users only) |
| `displayName` | String | Full name of the user | Yes |
| `role` | String | User role: `"admin"`, `"employee"`, or `"user"` | Yes |
| `isActive` | Boolean | Account active status | Yes |
| `phoneNumber` | String | Contact phone number | No |
| `photoURL` | String | Profile picture URL | No |
| `createdAt` | Timestamp | Account creation timestamp | Yes |
| `updatedAt` | Timestamp | Last update timestamp | Yes |
| `lastLogin` | Timestamp | Last login timestamp | No |
| `signupMethod` | String | `"mobile"` or `"employee"` | No |
| `createdBy` | String | UID of creator (for employees/users created by others) | No |

**User-Specific Attributes (role = "user"):**

| Attribute | Data Type | Description |
|-----------|-----------|-------------|
| `assignedEmployeeId` | String | UID of assigned employee/coach | No |
| `dateOfBirth` | String | Date of birth | No |
| `age` | Number | Calculated age | No |
| `gender` | String | User gender | No |
| `height` | Number | Height in cm | No |
| `weight` | Number | Weight in kg | No |
| `fitnessGoals` | Array<String> | List of fitness goals | No |
| `planType` | String | Selected plan type | No |
| `pushToken` | String | FCM push notification token | No |

**Nested Objects:**

- **`mealPlan`** (Object): Current meal plan assigned to user
  - `goal`: String
  - `totalCalories`: Number
  - `breakfast`: Object
  - `lunch`: Object
  - `dinner`: Object
  - `snacks`: Object
  - `dailyMacros`: Object { proteins, carbs, fats, allZero }
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

- **`reminders`** (Object): User reminder settings
  - `water`: Object { enabled: Boolean, intervalHours: Number, startTime: String }
  - `sleep`: Object { enabled: Boolean, time: String }
  - `gym`: Object { enabled: Boolean, time: String }
  - `meal`: Object { enabled: Boolean, time: String }

- **`resetPassword`** (Object): Password reset OTP data (temporary)
  - `codeHash`: String (SHA-256 hash)
  - `expiresAt`: Timestamp
  - `attempts`: Number
  - `verified`: Boolean
  - `createdAt`: Timestamp
  - `verifiedAt`: Timestamp

**Relationships:**
- **1-to-1** with Firebase Authentication (UID is the link)
- **Many-to-1** with Employee (via `assignedEmployeeId`)
- **1-to-1** with MealPlan (stored as nested object or in `mealPlans` collection)
- **1-to-1** with WorkoutPlan (stored in `workoutPlans` collection)

---

### 1.3 Collection: `mealPlans`

**Purpose:** Legacy collection for meal plans (new system stores in `users/{uid}/mealPlan`)

**Document ID:** Auto-generated Firestore ID

**Main Attributes:**

| Attribute | Data Type | Description |
|-----------|-----------|-------------|
| `userId` | String | UID of user who owns this meal plan |
| `status` | String | `"active"` or `"inactive"` |
| `goal` | String | Meal plan goal |
| `totalCalories` | Number | Daily calorie target |
| `breakfast` | Object | Breakfast meal details |
| `lunch` | Object | Lunch meal details |
| `dinner` | Object | Dinner meal details |
| `snacks` | Object | Snacks details |
| `dailyMacros` | Object | { proteins, carbs, fats, allZero } |
| `createdAt` | Timestamp | Creation timestamp |
| `updatedAt` | Timestamp | Update timestamp |

**Relationships:**
- **Many-to-1** with User (via `userId`)

---

### 1.4 Collection: `mealPlanTemplates`

**Purpose:** Reusable meal plan templates created by employees

**Document ID:** Auto-generated Firestore ID

**Main Attributes:**

| Attribute | Data Type | Description |
|-----------|-----------|-------------|
| `name` | String | Template name |
| `goal` | String | Template goal |
| `totalCalories` | Number | Daily calorie target |
| `breakfast` | Object | Breakfast meal details |
| `lunch` | Object | Lunch meal details |
| `dinner` | Object | Dinner meal details |
| `snacks` | Object | Snacks details |
| `createdBy` | String | UID of employee who created template |
| `createdAt` | Timestamp | Creation timestamp |
| `updatedAt` | Timestamp | Update timestamp |

**Relationships:**
- **Many-to-1** with Employee (via `createdBy`)

---

### 1.5 Collection: `workoutPlans`

**Purpose:** Workout plans assigned to users

**Document ID:** User UID (1-to-1 relationship with user)

**Main Attributes:**

| Attribute | Data Type | Description |
|-----------|-----------|-------------|
| `planName` | String | Name of workout plan |
| `goal` | String | Workout goal |
| `daysPerWeek` | Number | Number of workout days |
| `workouts` | Array<Object> | Array of workout objects |
| `createdAt` | Timestamp | Creation timestamp |
| `updatedAt` | Timestamp | Update timestamp |

**Workout Object Structure:**
- `day`: Number (day of week)
- `name`: String
- `exercises`: Array<Object>
  - `exerciseId`: String (reference to exercises collection)
  - `name`: String
  - `sets`: Number
  - `reps`: Number
  - `rest`: Number (seconds)
  - `notes`: String

**Relationships:**
- **1-to-1** with User (document ID = user UID)
- **Many-to-Many** with Exercise (via `exerciseId` in workout exercises)

---

### 1.6 Collection: `exercises`

**Purpose:** Exercise library available to all employees

**Document ID:** Auto-generated Firestore ID

**Main Attributes:**

| Attribute | Data Type | Description |
|-----------|-----------|-------------|
| `name` | String | Exercise name |
| `muscleGroup` | String | Target muscle group |
| `equipment` | String | Required equipment |
| `defaultSets` | Number | Default number of sets |
| `defaultReps` | Number | Default number of reps |
| `notes` | String | Exercise notes |
| `gifMaleUrl` | String | URL to male demonstration GIF |
| `gifFemaleUrl` | String | URL to female demonstration GIF |
| `createdBy` | String | UID of employee who created exercise |
| `createdAt` | Timestamp | Creation timestamp |
| `updatedAt` | Timestamp | Update timestamp |

**Relationships:**
- **Many-to-1** with Employee (via `createdBy`)
- **Many-to-Many** with WorkoutPlan (via references in workout exercises)

---

### 1.7 Collection: `progress`

**Purpose:** User progress tracking entries

**Document ID:** Auto-generated Firestore ID

**Main Attributes:**

| Attribute | Data Type | Description |
|-----------|-----------|-------------|
| `userId` | String | UID of user who owns this progress entry |
| `date` | Timestamp | Date of progress entry |
| `weight` | Number | Weight in kg |
| `bodyFat` | Number | Body fat percentage |
| `muscleMass` | Number | Muscle mass in kg |
| `measurements` | Object | Body measurements |
  - `chest`: Number
  - `waist`: Number
  - `hips`: Number
  - `arms`: Number
  - `thighs`: Number
| `photos` | Array<String> | Array of photo URLs |
| `notes` | String | Additional notes |
| `workoutCompleted` | Boolean | Whether workout was completed |
| `mealPlanFollowed` | Boolean | Whether meal plan was followed |
| `createdAt` | Timestamp | Creation timestamp |
| `updatedAt` | Timestamp | Update timestamp |

**Relationships:**
- **Many-to-1** with User (via `userId`)

---

### 1.8 Collection: `notifications`

**Purpose:** Push notifications and in-app notifications

**Document ID:** Auto-generated Firestore ID

**Main Attributes:**

| Attribute | Data Type | Description |
|-----------|-----------|-------------|
| `userId` | String | UID of user who receives notification |
| `type` | String | Notification type: `"push"`, `"in-app"`, etc. |
| `title` | String | Notification title |
| `message` | String | Notification message/body |
| `createdBy` | String | UID of user who created notification |
| `seen` | Boolean | Whether notification was seen |
| `isRead` | Boolean | Whether notification was read |
| `scheduledAt` | Timestamp | Scheduled delivery time |
| `createdAt` | Timestamp | Creation timestamp |
| `meta` | Object | Additional metadata |
  - `triggeredBy`: String (role)
  - `delivery`: String (type)

**Relationships:**
- **Many-to-1** with User (via `userId`)
- **Many-to-1** with User (via `createdBy` - employee/admin who sent it)

---

### 1.9 Collection: `chats`

**Purpose:** Chat conversations between users

**Document ID:** Generated chat ID (format: `admin_{adminId}__emp_{employeeId}` or `emp_{employeeId}__user_{userId}`)

**Main Attributes:**

| Attribute | Data Type | Description |
|-----------|-----------|-------------|
| `participants` | Array<String> | Array of participant UIDs |
| `lastMessage` | Object | Last message in chat |
| `lastMessageAt` | Timestamp | Timestamp of last message |
| `createdAt` | Timestamp | Chat creation timestamp |
| `updatedAt` | Timestamp | Last update timestamp |

**Relationships:**
- **Many-to-Many** with User (via `participants` array)

---

### 1.10 Collection: `messages`

**Purpose:** Individual chat messages

**Document ID:** Auto-generated Firestore ID

**Main Attributes:**

| Attribute | Data Type | Description |
|-----------|-----------|-------------|
| `chatId` | String | Reference to chat document ID |
| `senderId` | String | UID of message sender |
| `recipientId` | String | UID of message recipient |
| `content` | String | Message content |
| `type` | String | Message type: `"text"`, `"image"`, etc. |
| `read` | Boolean | Whether message was read |
| `createdAt` | Timestamp | Message creation timestamp |

**Relationships:**
- **Many-to-1** with Chat (via `chatId`)
- **Many-to-1** with User (via `senderId`)
- **Many-to-1** with User (via `recipientId`)

---

### 1.11 Collection: `subscriptions`

**Purpose:** Employee subscription plans

**Document ID:** Auto-generated Firestore ID

**Main Attributes:**

| Attribute | Data Type | Description |
|-----------|-----------|-------------|
| `employeeId` | String | UID of employee |
| `planName` | String | Subscription plan name |
| `duration` | Number | Duration in days |
| `startDate` | Timestamp | Subscription start date |
| `expirationDate` | Timestamp | Subscription expiration date |
| `status` | String | `"active"` or `"expired"` |
| `isActive` | Boolean | Active status flag |
| `employeePaymentId` | String | Reference to employee payment |
| `totalPayments` | Number | Total amount paid |
| `accountCreated` | Boolean | Whether employee account was created |
| `accountCreatedAt` | Timestamp | Account creation timestamp |
| `accountCreatedUid` | String | Created employee UID |
| `createdAt` | Timestamp | Subscription creation timestamp |
| `updatedAt` | Timestamp | Update timestamp |

**Relationships:**
- **Many-to-1** with Employee (via `employeeId`)
- **1-to-1** with EmployeePayment (via `employeePaymentId`)

---

### 1.12 Collection: `employeePayments`

**Purpose:** Employee payment records

**Document ID:** Auto-generated Firestore ID

**Main Attributes:**

| Attribute | Data Type | Description |
|-----------|-----------|-------------|
| `selectedPlan` | String | Selected subscription plan |
| `amount` | Number | Payment amount |
| `status` | String | Payment status |
| `accountCreated` | Boolean | Whether account was created |
| `accountCreatedAt` | Timestamp | Account creation timestamp |
| `createdEmployeeUid` | String | Created employee UID |
| `createdAt` | Timestamp | Payment creation timestamp |

**Relationships:**
- **1-to-1** with Subscription (via reference in subscriptions)

---

### 1.13 Key Relationships Summary

**User-Employee Relationship:**
- Users have `assignedEmployeeId` field pointing to Employee UID
- **Relationship:** Many Users to One Employee (Many-to-1)

**User-MealPlan Relationship:**
- New system: Meal plan stored as nested object in `users/{uid}/mealPlan`
- Legacy system: Meal plans in `mealPlans` collection with `userId` reference
- **Relationship:** One User to One Active Meal Plan (1-to-1)

**User-WorkoutPlan Relationship:**
- Workout plan document ID = User UID
- **Relationship:** One User to One Workout Plan (1-to-1)

**User-Progress Relationship:**
- Progress entries have `userId` field
- **Relationship:** One User to Many Progress Entries (1-to-Many)

**User-Notifications Relationship:**
- Notifications have `userId` field
- **Relationship:** One User to Many Notifications (1-to-Many)

**User-Reminders Relationship:**
- Reminders stored as nested object in `users/{uid}/reminders`
- **Relationship:** One User to One Reminders Object (1-to-1)

**Exercise-WorkoutPlan Relationship:**
- Exercises referenced by `exerciseId` in workout plan exercises
- **Relationship:** Many Exercises to Many Workout Plans (Many-to-Many)

**Chat-User Relationship:**
- Chat participants array contains user UIDs
- **Relationship:** Many Users to Many Chats (Many-to-Many)

**Authentication UID Link:**
- All user documents use Firebase Authentication UID as document ID
- This creates a direct 1-to-1 relationship between Firebase Auth and Firestore user documents

---

## 2. USER ROLES & PERMISSIONS

### 2.1 Role: Admin

**Backend Actions:**
- Create, read, update, delete employees
- Create, read, update, delete users
- View all users and employees
- Manage employee subscriptions
- Send employee account credentials
- Reset employee passwords
- View dashboard statistics
- Generate and send employee reports
- Cleanup old payment records
- View reports overview

**Accessible Endpoints:**
- `/api/admin/*` (all admin routes)
- `/api/auth/profile` (own profile)
- `/api/user/profile` (own profile)
- `/api/user/change-password` (own password)
- `/api/user/change-email` (own email)
- `/api/user/account` (own account deletion)
- `/api/chat/*` (can chat with employees and users)

**Data Read/Write Permissions:**
- **Read:** All users, all employees, all subscriptions, all payments, all reports
- **Write:** All users, all employees, employee subscriptions, employee credentials

---

### 2.2 Role: Employee (Coach)

**Backend Actions:**
- Create users (assigned to themselves)
- Read, update, delete their assigned users
- Assign meal plans to users
- Assign workout plans to users
- Update meal plans for users
- Delete meal plans for users
- View user progress
- Send user reports via email
- Create notifications for users
- Create, read, update, delete exercises
- Create, read, update, delete workout plans
- Upload exercise GIFs
- Generate AI meal/workout plans for users
- View their own subscription
- Renew their subscription
- Chat with admin and assigned users

**Accessible Endpoints:**
- `/api/employee/*` (all employee routes)
- `/api/auth/profile` (own profile)
- `/api/user/profile` (own profile)
- `/api/user/change-password` (own password)
- `/api/user/change-email` (own email)
- `/api/user/account` (own account deletion)
- `/api/mealPlans/*` (meal plan management)
- `/api/chat/*` (can chat with admin and assigned users)
- `/api/subscriptions/employee/:employeeId` (own subscription)
- `/api/subscriptions/renew` (renew own subscription)

**Data Read/Write Permissions:**
- **Read:** Own profile, assigned users, user progress, exercises, workout plans, own subscription
- **Write:** Assigned users, meal plans, workout plans, exercises, notifications, user progress (view only)

---

### 2.3 Role: User (Client)

**Backend Actions:**
- View own profile
- Update own profile
- Change own password
- Change own email
- Delete own account
- View own meal plans
- View own workout plans
- Create, read, update, delete own progress entries
- View own reminders
- Update own reminders
- View own notifications
- Mark notifications as read
- Save push notification token
- View chat contacts
- Send/receive messages with assigned employee
- Request password reset

**Accessible Endpoints:**
- `/api/user/*` (user routes - restricted to own data)
- `/api/auth/profile` (own profile)
- `/api/auth/forgot-password` (public)
- `/api/auth/verify-reset-code` (public)
- `/api/auth/reset-password` (public)
- `/api/notifications/*` (own notifications)
- `/api/chat/*` (can chat with assigned employee)

**Data Read/Write Permissions:**
- **Read:** Own profile, own meal plans, own workout plans, own progress, own reminders, own notifications
- **Write:** Own profile, own progress, own reminders, own notifications (mark as read), push token

---

## 3. AUTHENTICATION & SECURITY

### 3.1 Firebase Authentication Integration

**Authentication Flow:**
1. User logs in with email and password via Firebase Auth REST API
2. Backend receives Firebase ID token (JWT) from client
3. Backend verifies token using Firebase Admin SDK
4. Backend fetches user document from Firestore using UID from token
5. User data attached to request object (`req.user`)

**Token Verification:**
- Tokens verified using `admin.auth().verifyIdToken(idToken)`
- Decoded token contains: `uid`, `email`, `emailVerified`, `iat`, `exp`
- Token expiration handled by Firebase (typically 1 hour)

---

### 3.2 Email System Architecture

**Login Email (System Email):**
- Format: `fullname@fitfix.com` (e.g., `john.doe@fitfix.com`)
- Generated from user's full name (lowercase, spaces replaced with dots)
- Stored in Firebase Authentication
- Used for login authentication
- Used for password reset identification

**Real Email:**
- User's actual email address (e.g., `user@gmail.com`)
- Stored in Firestore `users/{uid}/realEmail`
- Used for:
  - Welcome emails
  - Progress reports
  - Password reset OTP delivery
  - All external communications

**Email Flow:**
- User enters login email (`name@fitfix.com`) for authentication
- Backend identifies user via Firebase Auth
- Backend retrieves `realEmail` from Firestore
- All emails sent to `realEmail`, not login email

---

### 3.3 Authentication Middleware

**Middleware Types:**

1. **`authenticate`** - Generic authentication
   - Verifies Firebase ID token
   - Fetches user document from Firestore
   - Attaches user data to `req.user`
   - Automatically detects public routes and bypasses auth

2. **`verifyAdmin`** - Admin-only access
   - Verifies token
   - Checks `user.role === 'admin'`
   - Returns 403 if not admin

3. **`verifyEmployee`** - Employee or Admin access
   - Verifies token
   - Checks `user.role === 'employee' || user.role === 'admin'`
   - Returns 403 if neither

4. **`verifyUser`** - User-only access
   - Verifies token
   - Checks `user.role === 'user'`
   - Returns 403 if not user

**Public Routes (No Authentication Required):**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-reset-code`
- `POST /api/auth/reset-password`

**Protected Routes:**
- All other routes require valid Firebase ID token
- Token passed in `Authorization: Bearer <token>` header

---

### 3.4 Password Reset System (OTP-Based)

**Flow:**
1. User requests password reset with login email
2. Backend verifies user exists in Firebase Auth
3. Backend generates 6-digit numeric OTP
4. OTP hashed using SHA-256
5. Hashed OTP stored in `users/{uid}/resetPassword` with:
   - `codeHash`: SHA-256 hash
   - `expiresAt`: 10 minutes from generation
   - `attempts`: 0
   - `verified`: false
6. OTP sent to user's `realEmail` (not login email)
7. User verifies OTP code
8. Backend validates OTP, checks expiration, limits attempts (max 5)
9. If valid, marks `resetPassword.verified = true`
10. User sets new password
11. Backend validates password strength
12. Backend updates password via Firebase Admin SDK
13. Backend removes `resetPassword` object from Firestore

**Security Features:**
- OTP hashed before storage (SHA-256)
- Timing-safe comparison for OTP verification
- 10-minute expiration
- Maximum 5 verification attempts
- Generic success messages (prevents email enumeration)
- Password strength validation (8+ chars, uppercase, lowercase, number, special char)

---

## 4. BACKEND FEATURES (High-Level)

### 4.1 User Management

**User Creation by Employee:**
- Employee provides user's real email and full name
- Backend generates login email (`fullname@fitfix.com`)
- Backend generates secure 12-character password
- User created in Firebase Authentication with login email
- User document created in Firestore with both emails
- User assigned to creating employee (`assignedEmployeeId`)
- Welcome email sent to real email with login credentials

**User Updates:**
- Employees can update assigned users' profiles
- Users can update their own profiles
- Admins can update any user

**User Deletion:**
- Soft delete or hard delete depending on implementation
- May cascade to related data (progress, plans, etc.)

---

### 4.2 Meal Plan Management

**Meal Plan Assignment:**
- Employee assigns meal plan to user
- Meal plan stored in `users/{uid}/mealPlan` (new system)
- Or stored in `mealPlans` collection with `userId` (legacy)
- Meal plan includes: breakfast, lunch, dinner, snacks
- Daily macros calculated automatically
- Meal plan can be updated or deleted by employee

**Meal Plan Templates:**
- Employees create reusable templates
- Templates stored in `mealPlanTemplates` collection
- Templates can be assigned to multiple users
- Templates can be updated or deleted

**Bulk Assignment:**
- Employee can assign same meal plan to multiple users
- Useful for group plans or similar goals

---

### 4.3 Workout Plan Management

**Workout Plan Assignment:**
- Employee creates workout plan for user
- Workout plan stored in `workoutPlans/{userId}` (1-to-1)
- Plan includes multiple workouts (days)
- Each workout contains exercises from exercise library
- Exercises referenced by `exerciseId`
- Workout plan can be updated or deleted

**Exercise Library:**
- Employees create exercises in shared library
- Exercises include: name, muscle group, equipment, sets, reps
- Exercises have male and female demonstration GIFs
- Exercises can be reused across multiple workout plans

---

### 4.4 Progress Tracking

**Progress Entry Creation:**
- Users create progress entries
- Each entry includes: date, weight, body fat, muscle mass, measurements, photos, notes
- Tracks workout completion and meal plan adherence
- Progress entries stored in `progress` collection
- Entries linked to user via `userId`

**Progress Viewing:**
- Users view their own progress
- Employees view assigned users' progress
- Progress can be filtered and paginated

---

### 4.5 Email System

**Email Types:**
1. **Welcome Email** - Sent to new users with login credentials
2. **Password Reset OTP** - 6-digit code sent to real email
3. **User Progress Report** - Comprehensive report sent to user's real email
4. **Employee Report** - Employee activity and subscription report
5. **Employee Credentials** - Login credentials for new employees
6. **Password Reset Notification** - Confirmation when password is reset
7. **Subscription Confirmation** - Employee subscription confirmation
8. **Subscription Reminder** - 2 days before expiration
9. **Subscription Expiration** - When subscription expires

**Email Service:**
- Uses Nodemailer with SMTP (Gmail or other providers)
- HTML email templates
- All emails sent to `realEmail`, never to login email

---

### 4.6 Reminder System

**Reminder Storage:**
- Reminders stored in `users/{uid}/reminders` (nested object)
- Four reminder types: water, sleep, gym, meal
- Water reminder: interval-based (every N hours starting at time)
- Other reminders: single time-based (HH:mm format)

**Reminder Configuration:**
- Users can enable/disable reminders
- Users can set times/intervals
- Default values provided if none exist
- No scheduling implementation (storage only)

---

### 4.7 Notification System

**Notification Creation:**
- Employees/admins create notifications for users
- Notifications stored in `notifications` collection
- Notifications can be push or in-app
- Notifications can be scheduled

**Notification Delivery:**
- Push notifications via FCM (Firebase Cloud Messaging)
- In-app notifications stored in database
- Users can mark notifications as read/seen

---

### 4.8 Chat System

**Chat Creation:**
- Chats created automatically when first message sent
- Chat ID generated based on participant roles
- Format: `admin_{adminId}__emp_{employeeId}` or `emp_{employeeId}__user_{userId}`

**Message Exchange:**
- Messages stored in `messages` collection
- Messages linked to chat via `chatId`
- Real-time updates possible (implementation depends on frontend)

**Chat Permissions:**
- Admin can chat with employees and users
- Employee can chat with admin and assigned users
- User can chat with assigned employee

---

## 5. API STRUCTURE (High-Level)

### 5.1 Authentication Domain (`/api/auth`)

**Responsibility:** User authentication and account management

**Endpoints:**
- Login, registration
- Password reset (forgot password, verify code, reset password)
- Profile retrieval

**Public Endpoints:** Login, register, password reset
**Protected Endpoints:** Profile

---

### 5.2 User Domain (`/api/user`)

**Responsibility:** User-facing operations for authenticated users

**Endpoints:**
- Profile management (view, update)
- Account settings (change password, change email, delete account)
- Progress tracking (CRUD)
- Meal plans (view own)
- Workout plans (view own)
- Reminders (view, update)
- Chat contacts
- Push token management

**Access:** All authenticated users (role-specific restrictions apply)

---

### 5.3 Employee Domain (`/api/employee`)

**Responsibility:** Employee/coach operations

**Endpoints:**
- User management (create, read, update, delete assigned users)
- Meal plan assignment and updates
- Workout plan assignment and updates
- User progress viewing
- Exercise library management (CRUD)
- Workout plan management (CRUD)
- Notification creation
- User report generation
- AI plan generation
- Exercise GIF uploads

**Access:** Employees and admins only

---

### 5.4 Admin Domain (`/api/admin`)

**Responsibility:** System administration

**Endpoints:**
- Employee management (CRUD)
- User management (CRUD)
- Dashboard statistics
- Employee reports
- Subscription management
- Payment cleanup
- Employee account credentials

**Access:** Admins only

---

### 5.5 Meal Plans Domain (`/api/mealPlans`)

**Responsibility:** Meal plan template and bulk operations

**Endpoints:**
- Bulk meal plan assignment
- Meal plan updates
- Meal plan deletion
- Meal plan template CRUD

**Access:** Employees only

---

### 5.6 Subscriptions Domain (`/api/subscriptions`)

**Responsibility:** Employee subscription management

**Endpoints:**
- View all subscriptions (admin)
- Check expirations (admin)
- View available plans
- View employee subscription
- Renew subscription

**Access:** Admins, employees (own subscription)

---

### 5.7 Notifications Domain (`/api/notifications`)

**Responsibility:** Notification management

**Endpoints:**
- Create notification (employee/admin)
- List user notifications
- Mark notification as read

**Access:** Employees/admins (create), users (view own)

---

### 5.8 Chat Domain (`/api/chat`)

**Responsibility:** Real-time messaging

**Endpoints:**
- Send message
- Get messages
- Get chat list
- Mark messages as read

**Access:** All authenticated users (role-based restrictions)

---

## 6. UML PREPARATION

### 6.1 Entity Classes (For Class Diagram)

#### Class: User
**Attributes:**
- `uid: String` (primary key, from Firebase Auth)
- `email: String`
- `realEmail: String`
- `loginEmail: String`
- `displayName: String`
- `role: String` (admin, employee, user)
- `isActive: Boolean`
- `phoneNumber: String`
- `photoURL: String`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`
- `lastLogin: Timestamp`
- `assignedEmployeeId: String` (foreign key)
- `pushToken: String`
- `dateOfBirth: String`
- `age: Number`
- `gender: String`
- `height: Number`
- `weight: Number`
- `fitnessGoals: Array<String>`
- `planType: String`

**Relationships:**
- `assignedEmployee` → Employee (Many-to-1)
- `mealPlan` → MealPlan (1-to-1, composition)
- `reminders` → Reminders (1-to-1, composition)
- `progressEntries` → Progress[] (1-to-Many)
- `notifications` → Notification[] (1-to-Many)
- `chats` → Chat[] (Many-to-Many)
- `messages` → Message[] (1-to-Many as sender/recipient)

---

#### Class: MealPlan
**Attributes:**
- `goal: String`
- `totalCalories: Number`
- `breakfast: Object`
- `lunch: Object`
- `dinner: Object`
- `snacks: Object`
- `dailyMacros: Object`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

**Relationships:**
- `user` → User (1-to-1, composition)

---

#### Class: MealPlanTemplate
**Attributes:**
- `id: String` (primary key)
- `name: String`
- `goal: String`
- `totalCalories: Number`
- `breakfast: Object`
- `lunch: Object`
- `dinner: Object`
- `snacks: Object`
- `createdBy: String` (foreign key)
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

**Relationships:**
- `creator` → Employee (Many-to-1)

---

#### Class: WorkoutPlan
**Attributes:**
- `userId: String` (primary key, foreign key)
- `planName: String`
- `goal: String`
- `daysPerWeek: Number`
- `workouts: Array<Workout>`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

**Relationships:**
- `user` → User (1-to-1)
- `exercises` → Exercise[] (Many-to-Many via workout exercises)

---

#### Class: Exercise
**Attributes:**
- `id: String` (primary key)
- `name: String`
- `muscleGroup: String`
- `equipment: String`
- `defaultSets: Number`
- `defaultReps: Number`
- `notes: String`
- `gifMaleUrl: String`
- `gifFemaleUrl: String`
- `createdBy: String` (foreign key)
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

**Relationships:**
- `creator` → Employee (Many-to-1)
- `workoutPlans` → WorkoutPlan[] (Many-to-Many)

---

#### Class: Progress
**Attributes:**
- `id: String` (primary key)
- `userId: String` (foreign key)
- `date: Timestamp`
- `weight: Number`
- `bodyFat: Number`
- `muscleMass: Number`
- `measurements: Object`
- `photos: Array<String>`
- `notes: String`
- `workoutCompleted: Boolean`
- `mealPlanFollowed: Boolean`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

**Relationships:**
- `user` → User (Many-to-1)

---

#### Class: Reminders
**Attributes:**
- `water: WaterReminder`
- `sleep: TimeReminder`
- `gym: TimeReminder`
- `meal: TimeReminder`

**Relationships:**
- `user` → User (1-to-1, composition)

---

#### Class: WaterReminder
**Attributes:**
- `enabled: Boolean`
- `intervalHours: Number`
- `startTime: String`

---

#### Class: TimeReminder
**Attributes:**
- `enabled: Boolean`
- `time: String`

---

#### Class: Notification
**Attributes:**
- `id: String` (primary key)
- `userId: String` (foreign key)
- `type: String`
- `title: String`
- `message: String`
- `createdBy: String` (foreign key)
- `seen: Boolean`
- `isRead: Boolean`
- `scheduledAt: Timestamp`
- `createdAt: Timestamp`
- `meta: Object`

**Relationships:**
- `user` → User (Many-to-1)
- `creator` → User (Many-to-1)

---

#### Class: Chat
**Attributes:**
- `id: String` (primary key, generated)
- `participants: Array<String>` (foreign keys)
- `lastMessage: Object`
- `lastMessageAt: Timestamp`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

**Relationships:**
- `participants` → User[] (Many-to-Many)
- `messages` → Message[] (1-to-Many)

---

#### Class: Message
**Attributes:**
- `id: String` (primary key)
- `chatId: String` (foreign key)
- `senderId: String` (foreign key)
- `recipientId: String` (foreign key)
- `content: String`
- `type: String`
- `read: Boolean`
- `createdAt: Timestamp`

**Relationships:**
- `chat` → Chat (Many-to-1)
- `sender` → User (Many-to-1)
- `recipient` → User (Many-to-1)

---

#### Class: Subscription
**Attributes:**
- `id: String` (primary key)
- `employeeId: String` (foreign key)
- `planName: String`
- `duration: Number`
- `startDate: Timestamp`
- `expirationDate: Timestamp`
- `status: String`
- `isActive: Boolean`
- `employeePaymentId: String` (foreign key)
- `totalPayments: Number`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

**Relationships:**
- `employee` → Employee (Many-to-1)
- `payment` → EmployeePayment (1-to-1)

---

#### Class: EmployeePayment
**Attributes:**
- `id: String` (primary key)
- `selectedPlan: String`
- `amount: Number`
- `status: String`
- `accountCreated: Boolean`
- `accountCreatedAt: Timestamp`
- `createdEmployeeUid: String`
- `createdAt: Timestamp`

**Relationships:**
- `subscription` → Subscription (1-to-1)

---

### 6.2 Relationship Summary (For ER Diagram)

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Employee | Many-to-1 | Users assigned to employees via `assignedEmployeeId` |
| User → MealPlan | 1-to-1 | One active meal plan per user (nested or referenced) |
| User → WorkoutPlan | 1-to-1 | One workout plan per user (document ID = user UID) |
| User → Progress | 1-to-Many | User has many progress entries |
| User → Reminders | 1-to-1 | One reminders object per user (nested) |
| User → Notifications | 1-to-Many | User receives many notifications |
| User → Chats | Many-to-Many | Users participate in multiple chats |
| User → Messages | 1-to-Many | User sends/receives many messages |
| Employee → MealPlanTemplate | 1-to-Many | Employee creates many templates |
| Employee → Exercise | 1-to-Many | Employee creates many exercises |
| Employee → Subscription | 1-to-Many | Employee can have multiple subscriptions |
| Exercise → WorkoutPlan | Many-to-Many | Exercises used in many workout plans |
| Subscription → EmployeePayment | 1-to-1 | One payment per subscription |

---

### 6.3 Sequence Diagram Scenarios

**Scenario 1: User Login**
1. Client → Backend: POST /api/auth/login (email, password)
2. Backend → Firebase Auth: Verify credentials
3. Firebase Auth → Backend: Return ID token
4. Backend → Firestore: Fetch user document
5. Firestore → Backend: Return user data
6. Backend → Client: Return token and user data

**Scenario 2: Employee Creates User**
1. Employee → Backend: POST /api/employee/users (user data)
2. Backend: Generate login email and password
3. Backend → Firebase Auth: Create user account
4. Firebase Auth → Backend: Return UID
5. Backend → Firestore: Create user document
6. Backend → Email Service: Send welcome email
7. Backend → Employee: Return created user data

**Scenario 3: Password Reset**
1. User → Backend: POST /api/auth/forgot-password (login email)
2. Backend → Firebase Auth: Verify user exists
3. Backend: Generate OTP, hash it
4. Backend → Firestore: Store hashed OTP
5. Backend → Firestore: Get user's realEmail
6. Backend → Email Service: Send OTP to realEmail
7. User → Backend: POST /api/auth/verify-reset-code (email, code)
8. Backend → Firestore: Verify OTP, check expiration
9. Backend → Firestore: Mark OTP as verified
10. User → Backend: POST /api/auth/reset-password (email, newPassword)
11. Backend → Firebase Auth: Update password
12. Backend → Firestore: Remove resetPassword object

**Scenario 4: Employee Assigns Meal Plan**
1. Employee → Backend: POST /api/employee/users/:userId/meal-plans
2. Backend → Firestore: Update user document with mealPlan
3. Backend → Firestore: Calculate and store daily macros
4. Backend → Employee: Return success

---

### 6.4 PlantUML Preparation Notes

**Class Diagram:**
- Use `@startuml` and `@enduml`
- Define classes with attributes and methods
- Use arrows for relationships: `-->` for associations, `--|>` for inheritance, `--o` for composition
- Use multiplicities: `1`, `*`, `0..1`, `1..*`

**ER Diagram:**
- Use `entity` keyword for entities
- Use `||--o{` for one-to-many, `}o--||` for many-to-one, `}o--o{` for many-to-many
- Include primary keys and foreign keys

**Sequence Diagram:**
- Use `participant` for actors
- Use `->` for synchronous calls, `-->` for asynchronous
- Use `activate` and `deactivate` for lifelines
- Use `alt`, `opt`, `loop` for control structures

---

## 7. SUMMARY

### 7.1 Architecture Overview

FitFix backend is a RESTful API built on Express.js with Firebase as the backend-as-a-service platform. The system uses Firebase Authentication for user authentication and Firestore for data storage. The architecture follows a role-based access control model with three distinct roles: Admin, Employee (Coach), and User (Client).

### 7.2 Key Design Patterns

- **Repository Pattern:** Controllers interact with Firestore collections
- **Middleware Pattern:** Authentication and authorization handled via middleware
- **Role-Based Access Control:** Permissions enforced at route level
- **Email Abstraction:** Email service separated from business logic
- **Dual Email System:** System email for authentication, real email for communication

### 7.3 Data Flow

1. **Authentication:** Client → Firebase Auth → Backend (token) → Firestore (user data)
2. **Data Operations:** Client → Backend (with token) → Middleware (verify) → Controller → Firestore → Response
3. **Email Operations:** Controller → Email Service → SMTP → User's realEmail

### 7.4 Security Considerations

- All sensitive operations require authentication
- OTP-based password reset with hashing and expiration
- Role-based endpoint protection
- Generic error messages to prevent enumeration
- Token-based authentication with expiration
- Password strength validation

---

**End of Backend Analysis Document**

