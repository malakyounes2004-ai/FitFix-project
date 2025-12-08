# FitFix - Comprehensive Project Analysis for University Defense

## Table of Contents
1. [High-Level Overview](#1-high-level-overview)
2. [Technology Stack](#2-technology-stack)
3. [Overall Application Flow](#3-overall-application-flow)
4. [Main Features](#4-main-features)
5. [Custom & Advanced Parts](#5-custom--advanced-parts)
6. [Answers for Professor Questions](#6-answers-for-professor-questions)
7. [Important Files Summary](#7-important-files-summary)
8. [Project Story & Key Technologies](#8-project-story--key-technologies)

---

## 1. High-Level Overview

### What is FitFix?
**FitFix** is a comprehensive **Health & Fitness Coaching Management System** that connects fitness coaches (employees) with their clients (users) through a web-based platform. It enables coaches to create personalized meal and workout plans, track client progress, manage subscriptions, and communicate through real-time chat.

### Main Idea / Purpose / Use Case
The system solves the problem of **scalable fitness coaching** by:
- **For Coaches (Employees)**: Providing tools to manage multiple clients, create personalized plans, track progress, and communicate efficiently
- **For Clients (Users)**: Offering access to personalized meal/workout plans, progress tracking, and direct communication with their coach
- **For Administrators**: Overseeing the entire platform, managing employees, subscriptions, payments, and system-wide analytics

### Main Actors / Roles

1. **Admin**
   - Full system access
   - Manages employees (create, approve, deactivate)
   - Views all users, payments, subscriptions
   - Approves employee payment requests
   - Manages subscription plans
   - Access to analytics dashboard

2. **Employee (Coach)**
   - Manages assigned clients (users)
   - Creates and assigns meal/workout plans
   - Tracks client progress
   - Communicates via chat
   - Uploads exercise GIFs to library
   - Renews client subscriptions
   - Requests payments from admin

3. **User (Client)**
   - Views assigned meal/workout plans
   - Tracks personal progress (weight, photos, notes)
   - Communicates with assigned coach
   - Receives notifications
   - Makes subscription payments

### Core Modules / Sections

1. **Authentication & Authorization** (`/api/auth`, `AuthGuard.jsx`, `ProtectedRoute.jsx`)
2. **Admin Dashboard** (`AdminDashboard.jsx`, `/api/admin`)
3. **Employee Dashboard** (`EmployeeDashboard.jsx`, `/api/employee`)
4. **User Management** (`EmployeeAddUser.jsx`, `EmployeeMyUsers.jsx`, `employeeController.js`)
5. **Meal Plans** (`AddMealPlanContent.jsx`, `SelectReadyPlanContent.jsx`, `/api/mealPlans`)
6. **Workout Plans** (`EmployeeGymPlans.jsx`, `EmployeeExercisesLibrary.jsx`, `workoutController.js`)
7. **Chat System** (`AdminChat.jsx`, `EmployeeChat.jsx`, `chatController.js`)
8. **Payments** (`UserPaymentPage.jsx`, `EmployeeApprovalPage.jsx`, `paymentController.js`)
9. **Subscriptions** (`Subscriptions.jsx`, `subscriptionController.js`)
10. **Notifications** (`NotificationContext.jsx`, `notificationController.js`)
11. **AI Plan Generation** (`aiController.js` - OpenAI integration)

---

## 2. Technology Stack

### Frontend Framework
**React 18.2.0** with **Vite 5.0.8** as the build tool
- **Why Vite**: Fast development server, instant HMR (Hot Module Replacement), optimized production builds
- **Entry Point**: `frontend/src/main.jsx` - Initializes React app with ErrorBoundary
- **Main App**: `frontend/src/App.jsx` - Contains all routes and providers

### Backend / API Layer
**Node.js** with **Express.js 5.1.0**
- **Server Entry**: `src/server.js` - Sets up Express server, middleware, and routes
- **Port**: 3000 (configurable via `PORT` env variable)
- **API Base**: `/api/*` - All API endpoints prefixed with `/api`

### Database & Storage
**Firebase Firestore** (NoSQL document database)
- **Backend Access**: Firebase Admin SDK (`src/firebase.js`)
- **Frontend Access**: Firebase Client SDK (`frontend/src/config/firebaseClient.js`)
- **Storage**: Firebase Storage for exercise GIFs, profile photos
- **Collections**: `users`, `chats`, `messages`, `payments`, `subscriptions`, `notifications`, `exercises`, `mealPlans`, `workoutPlans`

### Main Libraries & Tools

#### **React Router DOM 6.20.0**
- **Purpose**: Client-side routing and navigation
- **Usage**: 
  - `App.jsx` - Defines all routes with `BrowserRouter`, `Routes`, `Route`
  - `ProtectedRoute.jsx` - Wraps protected routes with role-based access
  - `AuthGuard.jsx` - Global authentication check on app load
- **Example**: Routes like `/admin`, `/employee-dashboard`, `/employee/my-users` are protected by role

#### **GSAP 3.13.0** (GreenSock Animation Platform)
- **Purpose**: High-performance animations for UI elements
- **Usage Examples**:
  - `LoginTwoColumn.jsx` (lines 45-100): Animates login form entrance (card fade-in, logo slide, form fields stagger)
  - `EmployeeDashboard.jsx` (lines 147-250): Animates fitness tip cards, energy bars, floating icons
  - `AdminDashboard.jsx`: CSS animations for dashboard cards
  - `AboutUs.jsx`: Scroll-triggered animations
- **Why GSAP**: Smooth 60fps animations, timeline control, better performance than CSS animations for complex sequences

#### **Tailwind CSS 3.3.6**
- **Purpose**: Utility-first CSS framework for rapid UI development
- **Usage**: All components use Tailwind classes (e.g., `bg-gray-100`, `text-3xl`, `rounded-lg`)
- **Config**: `frontend/tailwind.config.js` - Custom theme configuration
- **Why Tailwind**: Fast development, consistent design system, small production bundle

#### **Axios 1.6.2**
- **Purpose**: HTTP client for API requests
- **Usage**: 
  - All API calls from frontend (e.g., `axios.get('/api/employee/users')`)
  - Includes JWT token in `Authorization: Bearer <token>` header
  - Base URL: `http://localhost:3000/api`
- **Example**: `EmployeeDashboard.jsx` uses Axios to fetch assigned users

#### **Firebase Admin SDK 13.6.0**
- **Purpose**: Server-side Firebase operations (authentication, Firestore, Storage)
- **Usage**: 
  - `src/firebase.js` - Initializes Admin SDK with service account credentials
  - All controllers use `db` (Firestore) and `auth` (Authentication) from this SDK
- **Why Admin SDK**: Secure server-side operations, full access to Firebase services

#### **Firebase Client SDK 10.14.1**
- **Purpose**: Client-side Firebase operations (authentication state, Firestore listeners)
- **Usage**: 
  - `frontend/src/config/firebaseClient.js` - Initializes client SDK
  - Enables real-time Firestore listeners for live data updates
  - IndexedDB persistence for offline support

#### **Framer Motion 12.23.24**
- **Purpose**: React animation library (used in some components)
- **Usage**: Alternative to GSAP for React-specific animations

#### **React Icons 4.12.0**
- **Purpose**: Icon library (Feather Icons, Font Awesome, etc.)
- **Usage**: Icons like `FiMessageCircle`, `FiUsers`, `FiBell` throughout the UI

#### **Node-Cron 3.0.3**
- **Purpose**: Scheduled tasks (cron jobs)
- **Usage**: `src/scheduler/reminders.js`
  - Daily reminders at 8 AM
  - Weekly progress reminders on Mondays
  - Hourly subscription expiration checks

#### **OpenAI 4.104.0**
- **Purpose**: AI-powered meal/workout plan generation
- **Usage**: `src/controllers/aiController.js`
  - Uses GPT-4o-mini to generate personalized plans based on user profile
  - Takes user data (age, weight, height, goals) and generates JSON plan items

#### **Multer 2.0.2**
- **Purpose**: File upload middleware for Express
- **Usage**: `workoutController.js` - Handles GIF file uploads for exercises
- **Example**: `uploadGifsMiddleware` processes `maleGif` and `femaleGif` files

#### **Nodemailer 7.0.10**
- **Purpose**: Email sending service
- **Usage**: `src/utils/emailService.js`
  - Sends welcome emails to new users
  - Sends subscription reminders
  - Sends payment notifications

#### **Browser Image Compression 2.0.2**
- **Purpose**: Client-side image compression before upload
- **Usage**: Reduces file size for progress photos, profile images

---

## 3. Overall Application Flow

### When User Opens the App

1. **Entry Point**: `frontend/src/main.jsx`
   - Loads React app with `ErrorBoundary` wrapper
   - Renders `App` component

2. **App Component** (`App.jsx`):
   - Wraps app with `ThemeProvider` (dark/light mode)
   - Wraps with `NotificationProvider` (global notifications)
   - Sets up `BrowserRouter` for routing
   - Wraps routes with `AuthGuard` component

3. **AuthGuard** (`AuthGuard.jsx`):
   - Checks `localStorage` for `token` and `user` data
   - If authenticated: Redirects to role-appropriate dashboard
   - If not authenticated: Redirects to `/login`
   - Prevents flash of protected content

4. **Login Page** (`LoginTwoColumn.jsx`):
   - GSAP animations on mount (card fade-in, form fields stagger)
   - User enters email/password
   - On submit: POST to `/api/auth/login`
   - Backend authenticates with Firebase Auth REST API
   - Returns `token` and `user` object (with role)
   - Frontend stores in `localStorage`
   - Redirects based on role:
     - `admin` → `/admin`
     - `employee` → `/employee/{userId}`
     - `user` → `/dashboard`

### Authentication Flow

**Backend Authentication** (`src/controllers/authController.js`):
1. Receives email/password from frontend
2. Calls Firebase Auth REST API: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword`
3. Gets `idToken` and `refreshToken` from Firebase
4. Fetches user profile from Firestore `users` collection
5. Returns token + user data (including `role`) to frontend

**Frontend Authentication**:
- Token stored in `localStorage.getItem('token')`
- User data stored in `localStorage.getItem('user')`
- Token sent in API requests: `Authorization: Bearer <token>`

**Token Verification** (`src/middleware/authMiddleware.js`):
- `authenticate()`: Verifies token for any authenticated user
- `verifyAdmin()`: Checks role === 'admin'
- `verifyEmployee()`: Checks role === 'employee' or 'admin'
- `verifyUser()`: Checks role === 'user'
- Uses `admin.auth().verifyIdToken()` to validate JWT

### Role-Based Access Control

**Frontend Protection** (`ProtectedRoute.jsx`):
- Checks `localStorage` for token and user
- Extracts role from user object
- Compares with `requiredRole` prop
- If wrong role: Redirects to appropriate dashboard
- If no token: Redirects to `/login`

**Backend Protection** (`src/middleware/authMiddleware.js`):
- Middleware functions verify token and role
- Applied to routes in `src/routes/*.js`
- Example: `router.get('/employees', verifyAdmin, getEmployees)`

**Route Structure** (`App.jsx`):
```
Public Routes:
- /login
- /contact-admin (employee signup)
- /about

Protected Routes (by role):
- /admin/* → requires 'admin'
- /employee/* → requires 'employee'
- /dashboard → requires 'user'
- /payments/* → role-specific
```

### Navigation & Routing

**Route Configuration** (`App.jsx` lines 64-316):
- Uses React Router `Routes` and `Route` components
- Each protected route wrapped in `<ProtectedRoute requiredRole="...">`
- Default route `/` redirects to `/login`
- Catch-all `*` redirects to `/login`

**Key Routes**:
- `/admin` → `AdminDashboard`
- `/admin/employees` → `EmployeeManagement`
- `/admin/subscriptions` → `Subscriptions`
- `/employee-dashboard` → `EmployeeDashboard`
- `/employee/my-users` → `EmployeeMyUsers`
- `/employee/add-user` → `EmployeeAddUser`
- `/employee/meal-plans/add` → `AddMealPlanContent`
- `/employee/exercises` → `EmployeeExercisesLibrary`
- `/employee/chat` → `EmployeeChat`

### Data Flow

**Frontend → Backend → Database**:

1. **User Action** (e.g., create user):
   - Component: `EmployeeAddUser.jsx`
   - Calls: `axios.post('/api/employee/users', userData)`

2. **Backend Route** (`src/routes/employee.js`):
   - `router.post('/users', verifyEmployee, createUser)`
   - Middleware verifies token and employee role

3. **Controller** (`src/controllers/employeeController.js`):
   - `createUser()` function
   - Validates input
   - Creates user in Firebase Auth
   - Saves to Firestore `users` collection
   - Sends welcome email
   - Returns success response

4. **Database** (Firestore):
   - Document created: `users/{userId}`
   - Fields: `email`, `displayName`, `role`, `assignedEmployeeId`, etc.

5. **Response to Frontend**:
   - Success/error response
   - Frontend updates UI (shows notification, refreshes list)

**Real-time Updates**:
- Firestore listeners in `useDashboardLoader.js`
- Subscribes to collection changes
- Updates UI automatically when data changes
- Falls back to API polling if listeners fail

---

## 4. Main Features

### 4.1 Employee Dashboard

**What it does**: Central hub for coaches to view their assigned clients, statistics, and quick actions.

**Files**:
- `frontend/src/pages/EmployeeDashboard.jsx` (770 lines)
- `frontend/src/hooks/useDashboardLoader.js` (data loading)
- `frontend/src/components/EmployeeSidebar.jsx` (navigation)

**Flow**:
1. User navigates to `/employee-dashboard` or `/employee/{userId}`
2. `AuthGuard` verifies authentication and role
3. `ProtectedRoute` checks role === 'employee'
4. `EmployeeDashboard` component mounts
5. `useDashboardLoader('employee', userId)` hook loads data:
   - Checks `localStorage` cache first (instant display)
   - Fetches assigned users from `/api/employee/users`
   - Calculates stats (total users, active users, progress entries)
6. GSAP animations trigger:
   - Fitness tip card fades in
   - Energy bar animates based on time of day
   - Floating icons animate continuously
7. Dashboard displays:
   - Welcome message with animated illustration
   - Statistics cards (total users, active users, progress entries)
   - Weekly user signup chart
   - Assigned users list
   - Quick action buttons

**Custom Logic**:
- **Energy Level Calculation** (lines 66-75): Calculates energy based on time of day (morning = high, afternoon = low)
- **GSAP Animations** (lines 147-250): Complex timeline animations for tip cards, energy bars, floating icons
- **Cached Data Loading**: Uses `localStorage` cache for instant display, then updates via API

### 4.2 User Management (Employee Creates Clients)

**What it does**: Allows employees to create new client accounts with auto-generated login credentials.

**Files**:
- `frontend/src/pages/EmployeeAddUser.jsx`
- `src/controllers/employeeController.js` (`createUser` function)
- `src/routes/employee.js`

**Flow**:
1. Employee navigates to `/employee/add-user`
2. Fills form: Full Name, Real Email, Phone, Date of Birth, Gender, Height, Weight, Fitness Goals, Plan Type
3. On submit: `axios.post('/api/employee/users', formData)`
4. Backend `createUser()`:
   - Validates input
   - **Generates login email**: `fullname@fitfix.com` (lowercase, spaces → dots)
   - **Generates secure password**: 12 characters (letters, numbers, special chars)
   - Creates user in Firebase Auth with generated credentials
   - Saves to Firestore `users` collection with:
     - `realEmail`: User's actual email
     - `loginEmail`: Generated `@fitfix.com` email
     - `assignedEmployeeId`: Current employee's ID
     - `role`: 'user'
   - Sends welcome email to `realEmail` with login credentials
   - Creates notification for new user
5. Frontend receives success response
6. Shows notification: "User created successfully"
7. Redirects to `/employee/my-users` or refreshes user list

**Custom Logic**:
- **Email Generation** (lines 40-51): Converts "John Doe" → "john.doe@fitfix.com"
- **Password Generation** (lines 56-77): Ensures at least one of each character type, then shuffles
- **Age Calculation** (lines 90-99): Calculates age from date of birth if provided

### 4.3 Meal Plans

**What it does**: Employees create and assign personalized meal plans to clients.

**Files**:
- `frontend/src/pages/AddMealPlanContent.jsx` (create new plan)
- `frontend/src/pages/SelectReadyPlanContent.jsx` (select from existing)
- `frontend/src/pages/ViewUsersPlanContent.jsx` (view assigned plans)
- `src/routes/mealPlans.js`
- `src/controllers/aiController.js` (AI generation)

**Flow (Create New Plan)**:
1. Employee navigates to `/employee/meal-plans/add`
2. Selects a user from dropdown
3. Chooses plan type: "Create New" or "Generate with AI"
4. **If "Create New"**:
   - Enters plan name, description
   - Adds meal items manually (breakfast, lunch, dinner, snacks)
   - Saves to Firestore `mealPlans` collection
5. **If "Generate with AI"**:
   - Enters optional notes for AI
   - Calls `/api/ai/generate-plan` with `userId`, `planType='meal'`, `notes`
   - Backend `generateUserPlan()`:
     - Fetches user profile from Firestore
     - Builds prompt with user data (age, weight, height, goals, dietary preferences)
     - Calls OpenAI GPT-4o-mini API
     - Parses JSON response (array of meal items)
     - Saves to `users/{userId}/plans` subcollection
   - Frontend displays generated plan
6. Employee assigns plan to user
7. Plan saved to `users/{userId}/assignedMealPlans`
8. User receives notification

**Flow (Select Ready Plan)**:
1. Employee navigates to `/employee/meal-plans/select`
2. Views list of existing meal plans (from `mealPlans` collection)
3. Selects a plan
4. Assigns to one or multiple users
5. Plan copied to each user's `assignedMealPlans`

**Custom Logic**:
- **AI Integration**: Uses OpenAI API with structured prompts to generate personalized plans
- **Plan Storage**: Plans stored in both global `mealPlans` collection (reusable) and user-specific `assignedMealPlans`

### 4.4 Workout Plans & Exercise Library

**What it does**: Employees create workout plans with exercises from a library, upload exercise GIFs.

**Files**:
- `frontend/src/pages/EmployeeExercisesLibrary.jsx` (manage exercises)
- `frontend/src/pages/EmployeeGymPlans.jsx` (create workout plans)
- `frontend/src/pages/EmployeeUsersWorkoutPlans.jsx` (view assigned plans)
- `src/controllers/workoutController.js`
- `src/routes/employee.js` (workout routes)

**Flow (Add Exercise to Library)**:
1. Employee navigates to `/employee/exercises`
2. Clicks "Add Exercise"
3. Enters exercise name, description, muscle groups, equipment
4. **Uploads GIFs**:
   - Male version GIF (required)
   - Female version GIF (optional)
   - Uses `multer` middleware to handle file uploads
5. Backend `uploadExerciseGifs()`:
   - Validates GIF files (max 10MB, `image/gif` only)
   - Uploads to Firebase Storage: `exercises-gifs/{exerciseId}/male.gif` and `female.gif`
   - Gets public URLs
   - Saves exercise to Firestore `exercises` collection with GIF URLs
6. Exercise appears in library

**Flow (Create Workout Plan)**:
1. Employee navigates to `/employee/gym-plans`
2. Creates new plan: name, description, duration (weeks)
3. Adds exercises from library:
   - Opens exercise picker modal
   - Selects exercises
   - Sets sets, reps, rest time for each
4. Saves plan to Firestore `workoutPlans` collection
5. Assigns to users (similar to meal plans)

**Custom Logic**:
- **Dual GIF System**: Separate male/female GIFs for gender-appropriate exercise demonstrations
- **Multer Middleware**: Handles multipart form data for file uploads
- **Firebase Storage**: Stores GIFs with public URLs for fast CDN delivery

### 4.5 Chat System

**What it does**: Real-time messaging between admin, employees, and users.

**Files**:
- `frontend/src/pages/AdminChat.jsx`
- `frontend/src/pages/EmployeeChat.jsx`
- `src/controllers/chatController.js`
- `src/routes/chat.js`

**Flow**:
1. User navigates to `/employee/chat` or `/admin/chat`
2. Component loads chat list:
   - Calls `/api/chat/chats` to get all conversations
   - Backend queries Firestore `chats` collection where user is participant
   - Returns list with other participant info, last message, unread count
3. User selects a chat
4. Component loads messages:
   - Calls `/api/chat/messages/:chatId`
   - Backend queries `chats/{chatId}/messages` subcollection
   - Returns messages sorted by `createdAt` (ascending)
   - Marks messages as read
5. User sends message:
   - Types message, clicks send
   - POST to `/api/chat/send` with `recipientId`, `content`
   - Backend `sendMessage()`:
     - Validates participants (role-based: employee can only chat with assigned users)
     - Generates chat ID: `admin_{adminId}__emp_{employeeId}` (sorted)
     - Creates message in `chats/{chatId}/messages/{messageId}`
     - Updates chat document: `lastMessage`, `lastActivity`, `unreadCount`
     - Creates notification for recipient
   - Frontend updates UI with new message
6. Real-time updates (if Firestore listeners enabled):
   - Listens to `chats/{chatId}/messages` subcollection
   - New messages appear automatically

**Custom Logic**:
- **Chat ID Generation** (lines 12-40): Role-prefixed IDs ensure consistent chat identification
- **Role-Based Validation**: Employees can only chat with assigned users or admin
- **Unread Count Tracking**: Per-user unread count in chat document
- **Message Reactions**: Users can add emoji reactions to messages (❤️, 😂, 👍, etc.)

### 4.6 Payments

**What it does**: Users make subscription payments, employees approve, admin manages.

**Files**:
- `frontend/src/components/payments/UserPaymentPage.jsx` (user pays)
- `frontend/src/components/payments/EmployeeApprovalPage.jsx` (employee approves)
- `frontend/src/components/payments/AdminPaymentDashboard.jsx` (admin overview)
- `src/controllers/paymentController.js`
- `src/controllers/subscriptionPaymentsController.js`

**Flow (User Payment)**:
1. User navigates to `/payments/user`
2. Views subscription plans (from `subscriptions` collection)
3. Selects plan (e.g., "Monthly - $50")
4. Enters payment method: Cash, OMT, WhatsApp
5. Enters amount
6. Submits payment:
   - POST to `/api/payments` with `amount`, `method`, `employeeId`
   - Backend creates payment in `payments` collection:
     - `status`: 'pending'
     - `approvedByEmployee`: false
     - `approvedByAdmin`: false
7. Payment appears in employee's approval page
8. Employee approves/rejects
9. If approved, admin can finalize
10. Status updates to 'completed'

**Flow (Employee Payment Request)**:
1. Employee navigates to `/payments/employee`
2. Requests payment from admin
3. Admin approves in `/payments/admin`
4. Payment recorded in `employeePayments` collection

**Custom Logic**:
- **Two-Stage Approval**: Employee approves first, then admin finalizes
- **Payment Methods**: Cash, OMT (Oman Money Transfer), WhatsApp payment
- **Status Tracking**: `pending` → `approved` → `completed` or `rejected`

### 4.7 Subscriptions

**What it does**: Manages user subscription plans, renewals, and expirations.

**Files**:
- `frontend/src/pages/Subscriptions.jsx` (admin manages plans)
- `frontend/src/pages/EmployeeSubscriptionRenew.jsx` (employee renews)
- `src/controllers/subscriptionController.js`
- `src/services/subscriptionService.js`
- `src/scheduler/reminders.js` (expiration checks)

**Flow (Create Subscription Plan)**:
1. Admin navigates to `/admin/subscriptions`
2. Creates new plan: name, price, duration (days), features
3. Saves to Firestore `subscriptions` collection
4. Plan available for users to purchase

**Flow (User Subscribes)**:
1. User selects subscription plan
2. Makes payment (see Payments section)
3. On payment approval, subscription created:
   - `users/{userId}/subscriptions` subcollection
   - Fields: `planId`, `startDate`, `endDate`, `status: 'active'`
4. User gains access to features

**Flow (Renewal)**:
1. Employee navigates to `/employee/renew-subscription`
2. Selects user
3. Selects subscription plan
4. Processes payment
5. Updates subscription `endDate`
6. Status remains 'active'

**Flow (Expiration Check)**:
1. Cron job runs hourly (`src/scheduler/reminders.js` line 87)
2. Calls `checkSubscriptionExpirations()`:
   - Queries all active subscriptions
   - Checks if `endDate < now`
   - Sends reminder 3 days before expiration
   - Sets status to 'expired' if past end date
   - Creates notifications

**Custom Logic**:
- **Automated Expiration**: Cron job checks subscriptions hourly
- **Reminder System**: Notifications sent 3 days before expiration
- **Service Layer**: `subscriptionService.js` handles business logic separately from controller

### 4.8 Admin Dashboard

**What it does**: Overview of system statistics, employee activity, pending requests.

**Files**:
- `frontend/src/components/AdminDashboard.jsx`
- `frontend/src/components/AdminSidebar.jsx`
- `src/controllers/adminController.js`
- `frontend/src/hooks/useDashboardLoader.js`

**Flow**:
1. Admin logs in, redirected to `/admin`
2. `AdminDashboard` component mounts
3. `useDashboardLoader('admin')` hook loads data:
   - Fetches employees, users, payments, employee requests
   - Calculates stats:
     - Total employees
     - Total payments
     - Total payment amount
     - Weekly user signups
   - Loads pending employee requests
4. Dashboard displays:
   - Statistics cards
   - Weekly chart (user signups by day)
   - Employee activity (active/inactive)
   - Pending requests notification badge
   - Recent employee requests list
5. Real-time updates via Firestore listeners (if enabled)

**Custom Logic**:
- **Cached Loading**: Uses `localStorage` cache for instant display
- **Weekly Stats Calculation**: Groups user signups by day of week
- **Pending Requests**: Combines old payment-based requests and new employee request system

---

## 5. Custom & Advanced Parts

### 5.1 Custom Hooks

#### **useDashboardLoader** (`frontend/src/hooks/useDashboardLoader.js`)
- **Purpose**: Unified data loading for admin and employee dashboards
- **Features**:
  - **Instant Loading**: Loads from `localStorage` cache first (no loading spinner)
  - **Real-time Updates**: Firestore listeners for live data (currently disabled, uses API fallback)
  - **Automatic Stats Calculation**: Calculates statistics from raw data
  - **Cache Management**: Saves to cache after API fetch
- **Usage**: `const { stats, weeklyStats, employees } = useDashboardLoader('admin')`
- **Why**: Eliminates loading spinners, provides instant UI, falls back gracefully

#### **useNotification** (`frontend/src/hooks/useNotification.js`)
- **Purpose**: Global notification system
- **Usage**: `const { showNotification } = useNotification()`
- **Features**: Toast notifications, success/error/info types

#### **useToast** (`frontend/src/hooks/useToast.js`)
- **Purpose**: Toast message system (alternative to notifications)
- **Usage**: Similar to `useNotification`

### 5.2 Middleware

#### **Authentication Middleware** (`src/middleware/authMiddleware.js`)
- **Functions**:
  - `authenticate()`: Verifies token, adds `req.user`
  - `verifyAdmin()`: Ensures role === 'admin'
  - `verifyEmployee()`: Ensures role === 'employee' or 'admin'
  - `verifyUser()`: Ensures role === 'user'
- **How it works**:
  1. Extracts `Authorization: Bearer <token>` header
  2. Calls `admin.auth().verifyIdToken(token)`
  3. Fetches user document from Firestore
  4. Checks role
  5. Attaches user data to `req.user`
  6. Calls `next()` or returns 401/403 error

#### **Error Handling Middleware** (`src/server.js` lines 73-83)
- Global error handler for unhandled errors
- Logs error details
- Returns formatted error response
- Includes stack trace in development

### 5.3 GSAP Animation Setup

**Why GSAP**: Better performance than CSS animations for complex sequences, timeline control, smooth 60fps animations.

**Implementation Pattern**:
```javascript
// 1. Create refs for elements to animate
const cardRef = useRef(null);
const logoRef = useRef(null);

// 2. Set initial states (hidden)
gsap.set(cardRef.current, { opacity: 0, y: 30 });

// 3. Create timeline
const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

// 4. Animate elements in sequence
tl.to(cardRef.current, { opacity: 1, y: 0, duration: 0.7 })
  .to(logoRef.current, { opacity: 1, x: 0, duration: 0.5 }, '-=0.4'); // Overlap

// 5. Cleanup on unmount
return () => ctx.revert();
```

**Examples**:
- **Login Page** (`LoginTwoColumn.jsx`): Card fade-in, logo slide, form fields stagger
- **Employee Dashboard** (`EmployeeDashboard.jsx`): Fitness tip card, energy bar, floating icons
- **About Page** (`AboutUs.jsx`): Scroll-triggered animations

### 5.4 AI Integration

**OpenAI Integration** (`src/controllers/aiController.js`):
- **Model**: GPT-4o-mini (cost-effective, fast)
- **Purpose**: Generate personalized meal/workout plans
- **Flow**:
  1. Receives user profile (age, weight, height, goals, dietary preferences)
  2. Builds structured prompt with user data
  3. Calls OpenAI API with system prompt: "You are a world-class fitness and nutrition AI"
  4. Parses JSON response (array of plan items)
  5. Saves to Firestore `users/{userId}/plans`
- **Why AI**: Personalization at scale, saves coach time, consistent quality

**Prompt Engineering**:
- Structured JSON output format
- Includes user profile data
- Allows coach notes for customization
- Fallback parsing if JSON invalid

### 5.5 Design Patterns

#### **Context Providers**
- **ThemeContext** (`frontend/src/context/ThemeContext.jsx`):
  - Global dark/light mode
  - Persists to `localStorage`
  - Applies `dark` class to `document.documentElement`
- **NotificationContext** (`frontend/src/context/NotificationContext.jsx`):
  - Global notification state
  - Provides `showNotification()` function
- **ToastContext** (`frontend/src/context/ToastContext.jsx`):
  - Toast message system

#### **Protected Route Pattern**
- `ProtectedRoute.jsx`: HOC (Higher-Order Component) that wraps routes
- Checks authentication and role before rendering
- Redirects if unauthorized

#### **Service Layer Pattern**
- `src/services/subscriptionService.js`: Business logic separated from controllers
- Controllers handle HTTP, services handle business rules

#### **Middleware Pattern**
- Request → Middleware (auth, validation) → Controller → Response
- Reusable authentication/authorization logic

---

## 6. Answers for Professor Questions

### Q1: "How did you implement authentication and roles?"

**Answer**:
"We implemented a **dual-layer authentication system** using Firebase Authentication and custom role-based access control.

**Backend**: When a user logs in, we call Firebase Auth REST API to verify credentials and get an ID token. We then fetch the user's profile from Firestore, which includes a `role` field ('admin', 'employee', or 'user'). This role is stored in the user document when they're created.

**Token Verification**: For protected API endpoints, we use middleware functions in `src/middleware/authMiddleware.js`. The middleware extracts the JWT token from the `Authorization` header, verifies it using Firebase Admin SDK's `verifyIdToken()`, fetches the user document to check the role, and either allows the request or returns a 401/403 error.

**Frontend**: We store the token and user data in `localStorage` after login. The `ProtectedRoute` component checks the user's role before rendering protected pages. If the role doesn't match, it redirects to the appropriate dashboard.

**Why this approach**: Firebase handles the complex cryptography of JWT tokens, while we maintain fine-grained role control in our application logic. This gives us security from Firebase and flexibility for our business rules."

### Q2: "How does the dashboard work technically?"

**Answer**:
"The dashboard uses a **cached loading strategy** for instant display and real-time updates.

**Instant Loading**: When the dashboard component mounts, the `useDashboardLoader` hook first checks `localStorage` for cached data. If found, it displays immediately—no loading spinner. This gives users instant feedback.

**Data Fetching**: After displaying cached data, the hook fetches fresh data from the API. For the admin dashboard, it calls multiple endpoints in parallel: `/api/admin/employees`, `/api/payments/all`, `/api/employee-requests`, etc. For the employee dashboard, it fetches assigned users from `/api/employee/users`.

**Statistics Calculation**: The hook calculates statistics client-side from the raw data. For example, it counts active employees, sums payment amounts, and groups user signups by day of week for the weekly chart.

**Real-time Updates**: We have Firestore listeners set up (currently using API fallback for stability) that automatically update the dashboard when data changes in the database. This means if an employee creates a new user, the admin dashboard updates without a refresh.

**Why this approach**: The cache-first strategy eliminates perceived latency. Users see data instantly, then it updates in the background. This creates a smooth, app-like experience."

### Q3: "How are subscriptions and payments managed technically?"

**Answer**:
"Subscriptions and payments use a **two-stage approval workflow** with automated expiration management.

**Payment Flow**: When a user makes a payment, we create a document in the `payments` collection with status 'pending'. The payment must be approved by the assigned employee first, then by the admin. Each approval updates the payment document with timestamps and approver IDs. Once both approvals are complete, status changes to 'completed'.

**Subscription Management**: Subscriptions are stored in a subcollection `users/{userId}/subscriptions`. Each subscription has a `startDate`, `endDate`, and `status`. When a payment is completed, we create or extend the subscription by updating the `endDate`.

**Automated Expiration**: We use **node-cron** to run scheduled tasks. Every hour, a cron job checks all active subscriptions. If the `endDate` has passed, it sets status to 'expired'. It also sends reminder notifications 3 days before expiration.

**Service Layer**: Business logic is separated into `subscriptionService.js`, which handles expiration checks, renewal calculations, and status updates. This keeps controllers focused on HTTP handling.

**Why this approach**: The two-stage approval ensures accountability—employees verify payments first, then admins finalize. Automated expiration prevents manual tracking errors and ensures users are notified before losing access."

### Q4: "How did you integrate animations (GSAP) and why did you choose this approach?"

**Answer**:
"We chose **GSAP (GreenSock Animation Platform)** over CSS animations for complex, sequenced animations.

**Implementation**: We use GSAP's timeline API to create coordinated animation sequences. For example, on the login page, we animate the card fading in, then the logo sliding, then form fields appearing in a stagger effect—all with precise timing control using the `-=0.4` overlap syntax.

**Why GSAP**: 
1. **Performance**: GSAP uses JavaScript animation, which gives us more control and better performance for complex sequences than CSS keyframes.
2. **Timeline Control**: We can create intricate sequences where animations overlap, delay, or trigger based on scroll position.
3. **Browser Compatibility**: GSAP handles browser differences automatically.
4. **Ease Functions**: Built-in easing functions like 'power3.out' create natural-feeling animations.

**Example**: In the employee dashboard, we animate a fitness tip card with a floating effect, an energy bar that fills based on time of day, and background icons that continuously float. These would be difficult to coordinate with CSS alone.

**Cleanup**: We use `gsap.context()` to ensure animations are properly cleaned up when components unmount, preventing memory leaks."

### Q5: "How do you structure your React/Express/Firebase project and why this structure?"

**Answer**:
"We use a **feature-based structure** with clear separation of concerns.

**Frontend Structure** (`frontend/src/`):
- `components/`: Reusable UI components (buttons, cards, sidebars)
- `pages/`: Full-page components (dashboards, forms)
- `context/`: React Context providers (theme, notifications)
- `hooks/`: Custom React hooks (data loading, notifications)
- `config/`: Configuration files (Firebase client setup)
- `utils/`: Utility functions (Firebase Storage helpers)

**Backend Structure** (`src/`):
- `controllers/`: Business logic for each feature (auth, employees, payments)
- `routes/`: Express route definitions (maps URLs to controllers)
- `middleware/`: Request processing (authentication, validation)
- `services/`: Reusable business logic (subscription management)
- `utils/`: Helper functions (email sending, notifications)
- `scheduler/`: Cron jobs (reminders, expiration checks)

**Why this structure**:
1. **Separation of Concerns**: Controllers handle HTTP, services handle business logic, routes handle routing
2. **Scalability**: Easy to add new features by creating new controller/route files
3. **Maintainability**: Related code is grouped together (e.g., all payment logic in `paymentController.js`)
4. **Testability**: Each layer can be tested independently
5. **Team Collaboration**: Multiple developers can work on different features without conflicts

**Firebase Integration**: We initialize Firebase Admin SDK once in `src/firebase.js` and import it where needed. This ensures a single connection and consistent configuration."

---

## 7. Important Files Summary

### Entry Points
| File | Purpose |
|------|---------|
| `frontend/src/main.jsx` | React app entry point, renders App with ErrorBoundary |
| `frontend/src/App.jsx` | Main app component, defines all routes and providers |
| `src/server.js` | Express server entry point, sets up middleware and routes |

### Router / Routes Configuration
| File | Purpose |
|------|---------|
| `frontend/src/App.jsx` | React Router configuration, all route definitions (lines 64-316) |
| `src/routes/auth.js` | Authentication routes (`/api/auth/login`, `/api/auth/register`) |
| `src/routes/admin.js` | Admin-only routes (`/api/admin/*`) |
| `src/routes/employee.js` | Employee routes (`/api/employee/*`) |
| `src/routes/chat.js` | Chat system routes (`/api/chat/*`) |
| `src/routes/payments.js` | Payment routes (`/api/payments/*`) |
| `src/routes/subscriptions.js` | Subscription routes (`/api/subscriptions/*`) |

### Main Layouts
| File | Purpose |
|------|---------|
| `frontend/src/components/AdminSidebar.jsx` | Admin navigation sidebar |
| `frontend/src/components/EmployeeSidebar.jsx` | Employee navigation sidebar |

### Auth-Related Files
| File | Purpose |
|------|---------|
| `frontend/src/components/AuthGuard.jsx` | Global authentication check, redirects on app load |
| `frontend/src/components/ProtectedRoute.jsx` | Role-based route protection component |
| `frontend/src/components/LoginTwoColumn.jsx` | Login page with GSAP animations |
| `src/controllers/authController.js` | Login, register, get profile functions |
| `src/middleware/authMiddleware.js` | Token verification and role checking middleware |
| `src/firebase.js` | Firebase Admin SDK initialization (backend) |
| `frontend/src/config/firebaseClient.js` | Firebase Client SDK initialization (frontend) |

### Main Controllers / Services (Backend)
| File | Purpose |
|------|---------|
| `src/controllers/authController.js` | Authentication (login, register) |
| `src/controllers/adminController.js` | Admin operations (create employees, get stats) |
| `src/controllers/employeeController.js` | Employee operations (create users, assign plans) |
| `src/controllers/paymentController.js` | Payment creation and approval |
| `src/controllers/subscriptionController.js` | Subscription management |
| `src/controllers/chatController.js` | Chat messaging, chat list, message history |
| `src/controllers/workoutController.js` | Exercise library, workout plans, GIF uploads |
| `src/controllers/aiController.js` | AI-powered plan generation (OpenAI) |
| `src/services/subscriptionService.js` | Subscription expiration and renewal logic |
| `src/scheduler/reminders.js` | Cron jobs for daily/weekly reminders and expiration checks |

### Main Components (Frontend)
| File | Purpose |
|------|---------|
| `frontend/src/components/AdminDashboard.jsx` | Admin dashboard with statistics and charts |
| `frontend/src/pages/EmployeeDashboard.jsx` | Employee dashboard with assigned users and stats |
| `frontend/src/pages/EmployeeAddUser.jsx` | Form to create new client accounts |
| `frontend/src/pages/EmployeeMyUsers.jsx` | List of assigned clients |
| `frontend/src/pages/AddMealPlanContent.jsx` | Create or generate meal plans |
| `frontend/src/pages/EmployeeExercisesLibrary.jsx` | Manage exercise library, upload GIFs |
| `frontend/src/pages/EmployeeGymPlans.jsx` | Create workout plans from exercises |
| `frontend/src/pages/AdminChat.jsx` | Admin chat interface |
| `frontend/src/pages/EmployeeChat.jsx` | Employee chat interface |
| `frontend/src/components/payments/UserPaymentPage.jsx` | User payment submission |
| `frontend/src/components/payments/EmployeeApprovalPage.jsx` | Employee payment approval |
| `frontend/src/components/AssistantBot.jsx` | Animated assistant bot with GSAP |

### Custom Hooks
| File | Purpose |
|------|---------|
| `frontend/src/hooks/useDashboardLoader.js` | Unified dashboard data loading with cache |
| `frontend/src/hooks/useNotification.js` | Global notification system hook |
| `frontend/src/hooks/useToast.js` | Toast message hook |

### Context Providers
| File | Purpose |
|------|---------|
| `frontend/src/context/ThemeContext.jsx` | Dark/light mode theme management |
| `frontend/src/context/NotificationContext.jsx` | Global notification state |
| `frontend/src/context/ToastContext.jsx` | Toast message state |

---

## 8. Project Story & Key Technologies

### Project Story

**FitFix** was born from the need to modernize fitness coaching and make personalized health guidance accessible at scale. Traditional coaching methods rely on manual communication, paper-based plans, and fragmented tracking—limiting how many clients a coach can effectively manage.

Our platform bridges this gap by providing coaches with a comprehensive toolkit: automated client management, AI-powered plan generation, real-time communication, and progress tracking—all in one integrated system. For clients, it offers easy access to personalized meal and workout plans, direct communication with their coach, and tools to track their fitness journey.

The system is built with scalability in mind. Using Firebase's serverless infrastructure, we can handle thousands of users without managing servers. The role-based architecture ensures that admins can oversee the platform, coaches can focus on their clients, and users get a personalized experience tailored to their goals.

### Key Technologies & Why They Were Chosen

- **React + Vite**: 
  - **Why**: React's component-based architecture makes the UI modular and maintainable. Vite provides lightning-fast development with instant HMR, making iteration quick during development.

- **Express.js + Node.js**: 
  - **Why**: Express provides a minimal, flexible framework for building REST APIs. Node.js's event-driven architecture handles concurrent requests efficiently, perfect for real-time features like chat.

- **Firebase (Firestore + Auth + Storage)**: 
  - **Why**: Serverless infrastructure eliminates server management. Firestore's real-time capabilities enable live updates without WebSocket complexity. Firebase Auth handles secure authentication, and Storage provides CDN-backed file hosting for exercise GIFs.

- **GSAP**: 
  - **Why**: Professional-grade animations that enhance user experience. Better performance and control than CSS animations for complex sequences, creating a polished, modern feel.

- **Tailwind CSS**: 
  - **Why**: Rapid UI development with utility classes. Consistent design system without writing custom CSS. Small production bundle due to purging unused styles.

- **OpenAI API**: 
  - **Why**: Enables personalized plan generation at scale. Coaches can provide custom plans while AI handles routine personalization, saving time and ensuring consistency.

- **Node-Cron**: 
  - **Why**: Automated background tasks (reminders, expiration checks) without external job schedulers. Runs within the Node.js process, simplifying deployment.

- **Axios**: 
  - **Why**: Reliable HTTP client with interceptors for token management. Better error handling and request/response transformation than fetch.

- **React Router**: 
  - **Why**: Industry-standard client-side routing. Enables SPA navigation without page reloads, improving perceived performance.

---

## Conclusion

This project demonstrates a full-stack web application with modern architecture, real-time features, AI integration, and a focus on user experience. The codebase is structured for maintainability, scalability, and team collaboration, making it a solid foundation for a production fitness coaching platform.

---

**Document prepared for: University Project Defense**  
**Project: FitFix - Health & Fitness Coaching Management System**  
**Date: 2024**

