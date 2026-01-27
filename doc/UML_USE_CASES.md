# UML Use Cases - FitFix Platform

## Document Information
- **Platform**: FitFix - Fitness Management System
- **Version**: 1.0
- **Date**: 2024
- **Purpose**: Functional requirements documentation for graduation project

---

## Use Case 1: User Login

| **Attribute** | **Description** |
|---------------|------------------|
| **Use Case Name** | User Login |
| **Use Case ID** | UC-001 |
| **Priority** | High |
| **Primary Actor** | User (Regular User, Employee/Coach, Admin) |
| **Description** | Authenticated users access the FitFix platform by providing valid credentials (email and password) through a secure login interface. The system validates credentials against the Firebase Authentication service and grants appropriate access based on user role. |
| **Preconditions** | 1. User must have a registered account in the system<br>2. User must have a valid email address and password<br>3. User's account must be active (not suspended or deleted)<br>4. Backend API server must be running and accessible<br>5. Firebase Authentication service must be operational |
| **Typical Course of Events** | **Actor Action:**<br>1. User navigates to the login page (web or mobile application)<br>2. User enters their registered email address<br>3. User enters their password<br>4. User clicks the "Login" button<br><br>**System Response:**<br>5. System validates input format (email structure, password length)<br>6. System sends authentication request to backend API (`POST /api/auth/login`)<br>7. Backend validates credentials against Firebase Authentication<br>8. Backend retrieves user profile data from Firestore database<br>9. Backend generates JWT token for session management<br>10. Backend returns user data and authentication token to frontend<br>11. Frontend stores token in localStorage/sessionStorage<br>12. System redirects user to appropriate dashboard based on role:<br>    - Regular User → `/dashboard`<br>    - Employee/Coach → `/employee/{userId}`<br>    - Admin → `/admin`<br>13. System displays success notification |
| **Postconditions** | 1. User is authenticated and logged into the system<br>2. JWT token is stored in client-side storage<br>3. User session is established with backend API<br>4. User is redirected to role-appropriate dashboard<br>5. User profile data is loaded and displayed<br>6. System logs the login activity for audit purposes |

---

## Use Case 2: User Registration

| **Attribute** | **Description** |
|---------------|------------------|
| **Use Case Name** | User Registration |
| **Use Case ID** | UC-002 |
| **Priority** | High |
| **Primary Actor** | Prospective User |
| **Description** | New users create an account on the FitFix platform by providing personal information and credentials. The system validates the information, creates a user account in Firebase Authentication, stores user profile in Firestore, and assigns the user to an available coach. Registration requires admin approval or automatic assignment based on system configuration. |
| **Preconditions** | 1. User must have a valid email address<br>2. User must not already have an existing account<br>3. Backend API server must be running<br>4. Firebase Authentication and Firestore services must be operational<br>5. At least one active coach (employee) must exist in the system for user assignment |
| **Typical Course of Events** | **Actor Action:**<br>1. User navigates to registration/contact page<br>2. User clicks "Get Account" or "Request Account" button<br>3. User is redirected to contact admin page or employee signup form<br>4. User fills in registration form with:<br>   - Full name<br>   - Email address<br>   - Phone number (optional)<br>   - Address, country, city<br>   - Gender<br>   - Date of birth<br>   - Preferred subscription plan<br>5. User submits the registration form<br><br>**System Response:**<br>6. System validates all required fields<br>7. System checks if email already exists in database<br>8. System executes reCAPTCHA v3 verification<br>9. System creates employee request record in Firestore (`employeeRequests` collection)<br>10. System sets request status to "pending"<br>11. System sends notification to admin about new registration request<br>12. System displays success message to user<br>13. Admin reviews and approves the request<br>14. System automatically creates Firebase Auth account<br>15. System creates user document in Firestore with role "user"<br>16. System assigns user to available coach (employee)<br>17. System creates subscription record<br>18. System sends welcome email with login credentials to user |
| **Postconditions** | 1. User account is created in Firebase Authentication<br>2. User profile is stored in Firestore database<br>3. User is assigned to a coach (employee)<br>4. Subscription record is created<br>5. User receives email with login credentials<br>6. User can now log in to the system<br>7. Registration request is marked as "approved" in system records |

---

## Use Case 3: Password Reset (OTP-based)

| **Attribute** | **Description** |
|---------------|------------------|
| **Use Case Name** | Password Reset (OTP-based) |
| **Use Case ID** | UC-003 |
| **Priority** | High |
| **Primary Actor** | Authenticated or Unauthenticated User |
| **Description** | Users who have forgotten their password can request a password reset through an OTP (One-Time Password) verification process. The system sends a verification code to the user's registered email, validates the code, and allows the user to set a new password. This process ensures secure password recovery without requiring the user to remember their old password. |
| **Preconditions** | 1. User must have a registered account in the system<br>2. User must have access to their registered email address<br>3. Email service must be configured and operational<br>4. Backend API server must be running<br>5. User's account must exist in Firebase Authentication |
| **Typical Course of Events** | **Actor Action:**<br>1. User navigates to login page<br>2. User clicks "Forgot Password" link<br>3. User enters their registered email address<br>4. User clicks "Send Reset Code" button<br><br>**System Response:**<br>5. System validates email format<br>6. System checks if email exists in database<br>7. System generates a 6-digit OTP code<br>8. System stores OTP code in database with expiration time (e.g., 10 minutes)<br>9. System sends email containing OTP code to user's email address<br>10. System displays message confirming code has been sent<br><br>**Actor Action:**<br>11. User checks email and retrieves OTP code<br>12. User enters OTP code in verification form<br>13. User enters new password<br>14. User confirms new password<br>15. User clicks "Reset Password" button<br><br>**System Response:**<br>16. System validates OTP code format (6 digits)<br>17. System verifies OTP code matches stored code<br>18. System checks OTP expiration time<br>19. System validates new password meets security requirements (minimum length, complexity)<br>20. System verifies password and confirmation match<br>21. System updates password in Firebase Authentication<br>22. System invalidates OTP code (one-time use)<br>23. System logs password reset activity<br>24. System displays success message<br>25. System redirects user to login page |
| **Postconditions** | 1. User's password is successfully updated in Firebase Authentication<br>2. OTP code is invalidated and cannot be reused<br>3. User can log in with new password<br>4. Password reset activity is logged for security audit<br>5. User session is cleared (if previously logged in)<br>6. User is redirected to login page |

---

## Use Case 4: View Workout Plan

| **Attribute** | **Description** |
|---------------|------------------|
| **Use Case Name** | View Workout Plan |
| **Use Case ID** | UC-004 |
| **Priority** | High |
| **Primary Actor** | Regular User |
| **Description** | Authenticated users can view their personalized workout plan assigned by their coach. The workout plan includes exercise details, sets, reps, rest periods, and instructional GIFs or images. Users can view daily, weekly, or complete workout schedules through the web or mobile interface. |
| **Preconditions** | 1. User must be authenticated and logged in<br>2. User must have an active subscription<br>3. User must be assigned to a coach (employee)<br>4. Coach must have created a workout plan for the user<br>5. Workout plan data must exist in Firestore database<br>6. Backend API server must be accessible |
| **Typical Course of Events** | **Actor Action:**<br>1. User logs into the system<br>2. User navigates to "Workouts" or "My Workout Plan" section<br>3. User selects a specific day or week to view<br><br>**System Response:**<br>4. System retrieves user's authentication token from storage<br>5. System sends API request to backend (`GET /api/workouts` or `/api/workouts/user/{userId}`)<br>6. Backend validates user authentication token<br>7. Backend retrieves user's assigned coach ID<br>8. Backend queries Firestore for workout plan associated with user<br>9. Backend retrieves exercise details including:<br>   - Exercise name and description<br>   - Sets and repetitions<br>   - Rest periods<br>   - Exercise GIFs (male/female versions)<br>   - Target muscle groups<br>   - Difficulty level<br>10. Backend formats workout data with proper date associations<br>11. Backend returns workout plan data to frontend<br>12. Frontend displays workout plan in organized format<br>13. System renders exercise GIFs based on user's gender preference<br>14. System displays workout schedule (daily/weekly view) |
| **Postconditions** | 1. User can view their complete workout plan<br>2. Workout exercises are displayed with all details<br>3. Exercise GIFs are loaded and displayed<br>4. Workout schedule is visible for selected time period<br>5. User can navigate between different days/weeks<br>6. System logs workout plan view activity |

---

## Use Case 5: View Meal Plan

| **Attribute** | **Description** |
|---------------|------------------|
| **Use Case Name** | View Meal Plan |
| **Use Case ID** | UC-005 |
| **Priority** | High |
| **Primary Actor** | Regular User |
| **Description** | Authenticated users can view their personalized meal plan created by their assigned coach. The meal plan includes daily meals (breakfast, lunch, dinner, snacks), nutritional information (calories, proteins, carbs, fats), and meal descriptions. Users can view meal plans by day or week through the application interface. |
| **Preconditions** | 1. User must be authenticated and logged in<br>2. User must have an active subscription<br>3. User must be assigned to a coach<br>4. Coach must have created a meal plan for the user<br>5. Meal plan data must exist in Firestore database<br>6. Backend API server must be accessible |
| **Typical Course of Events** | **Actor Action:**<br>1. User logs into the system<br>2. User navigates to "Meal Plan" or "Nutrition" section<br>3. User selects a specific day to view meal plan<br><br>**System Response:**<br>4. System retrieves user's authentication token<br>5. System sends API request to backend (`GET /api/meal-plans/user/{userId}` or similar)<br>6. Backend validates authentication token<br>7. Backend retrieves user's meal plan from Firestore<br>8. Backend queries meal plan document containing:<br>   - Daily meal structure (breakfast, lunch, dinner, snacks)<br>   - Food items and quantities<br>   - Nutritional macros (calories, proteins, carbohydrates, fats)<br>   - Meal descriptions and preparation notes<br>   - Meal plan start and end dates<br>9. Backend calculates daily nutritional totals<br>10. Backend returns formatted meal plan data to frontend<br>11. Frontend displays meal plan in organized daily format<br>12. System shows nutritional breakdown (macros) for each meal<br>13. System displays total daily calories and macros<br>14. System allows navigation between different days |
| **Postconditions** | 1. User can view their complete meal plan<br>2. Daily meals are displayed with all details<br>3. Nutritional information is visible and calculated<br>4. Meal plan is accessible for selected date range<br>5. User can navigate between different days<br>6. System logs meal plan view activity |

---

## Use Case 6: Track Progress

| **Attribute** | **Description** |
|---------------|------------------|
| **Use Case Name** | Track Progress |
| **Use Case ID** | UC-006 |
| **Priority** | Medium |
| **Primary Actor** | Regular User |
| **Description** | Users can record and track their fitness progress including body measurements (weight, body fat percentage, muscle mass), workout completion, and progress photos. The system stores progress data, generates progress reports, and displays progress trends over time through charts and graphs. |
| **Preconditions** | 1. User must be authenticated and logged in<br>2. User must have an active subscription<br>3. User must be assigned to a coach<br>4. Backend API server must be accessible<br>5. Firestore database must be operational |
| **Typical Course of Events** | **Actor Action:**<br>1. User navigates to "Progress" or "My Progress" section<br>2. User clicks "Add Progress Entry" or "Record Progress"<br>3. User enters progress data:<br>   - Current weight<br>   - Body measurements (optional)<br>   - Body fat percentage (optional)<br>   - Progress photos (optional)<br>   - Workout completion status<br>4. User submits progress entry<br><br>**System Response:**<br>5. System validates input data (numeric values, date ranges)<br>6. System uploads progress photos to Firebase Storage (if provided)<br>7. System sends API request to backend (`POST /api/progress`)<br>8. Backend validates authentication token<br>9. Backend validates progress data format<br>10. Backend creates progress entry document in Firestore<br>11. Backend stores progress data with timestamp<br>12. Backend associates progress entry with user ID<br>13. Backend calculates progress trends (if multiple entries exist)<br>14. Backend returns success confirmation to frontend<br>15. Frontend refreshes progress display<br>16. System displays updated progress chart/graph<br><br>**Actor Action (View Progress):**<br>17. User views progress history<br><br>**System Response:**<br>18. System retrieves all progress entries for user<br>19. System generates progress charts showing trends<br>20. System displays progress timeline with photos and measurements |
| **Postconditions** | 1. Progress entry is saved in Firestore database<br>2. Progress photos are stored in Firebase Storage (if uploaded)<br>3. Progress data is associated with user account<br>4. Progress trends are calculated and updated<br>5. Coach can view user's progress data<br>6. Progress reports are available for review<br>7. System logs progress tracking activity |

---

## Use Case 7: Chat with Coach

| **Use Case Name** | Chat with Coach |
| **Use Case ID** | UC-007 |
| **Priority** | High |
| **Primary Actor** | Regular User, Employee/Coach |
| **Description** | Users and coaches can communicate in real-time through a chat interface. The system supports text messaging, message delivery status, and chat history. Messages are stored in Firestore and synchronized in real-time using Firebase Realtime Database or Firestore listeners. Both users and coaches can initiate conversations and exchange messages. |
| **Preconditions** | 1. User must be authenticated and logged in<br>2. User must be assigned to a coach (for users)<br>3. Coach must be authenticated and active<br>4. Real-time database services (Firestore) must be operational<br>5. Backend API server must be accessible<br>6. WebSocket or real-time listeners must be configured |
| **Typical Course of Events** | **Actor Action (User):**<br>1. User navigates to "Chat" or "Messages" section<br>2. User selects their assigned coach from chat list<br>3. User types a message in the chat input field<br>4. User clicks "Send" button<br><br>**System Response:**<br>5. System validates message content (not empty, length limits)<br>6. System creates message object with:<br>   - Sender ID (user ID)<br>   - Receiver ID (coach ID)<br>   - Message content<br>   - Timestamp<br>   - Message status (sending, sent, delivered)<br>7. System sends message to backend API (`POST /api/chat/send`)<br>8. Backend validates authentication token<br>9. Backend validates sender and receiver relationship<br>10. Backend stores message in Firestore (`messages` or `chats` collection)<br>11. Backend updates chat conversation document<br>12. Backend sends push notification to coach (if coach is offline)<br>13. Backend returns message confirmation to sender<br>14. Frontend displays message in chat interface<br>15. System updates message status to "sent"<br>16. Real-time listener updates chat for coach<br><br>**Actor Action (Coach):**<br>17. Coach receives notification or opens chat<br>18. Coach views new message<br>19. Coach types reply message<br>20. Coach sends message<br><br>**System Response:**<br>21. System repeats steps 5-16 with coach as sender and user as receiver |
| **Postconditions** | 1. Message is stored in Firestore database<br>2. Chat conversation is updated with latest message<br>3. Message appears in both user's and coach's chat interfaces<br>4. Message delivery status is tracked<br>5. Push notification is sent to recipient (if applicable)<br>6. Chat history is preserved and accessible<br>7. System logs chat activity for moderation purposes |

---

## Use Case 8: Configure Reminders

| **Attribute** | **Description** |
|---------------|------------------|
| **Use Case Name** | Configure Reminders |
| **Use Case ID** | UC-008 |
| **Priority** | Medium |
| **Primary Actor** | Regular User |
| **Description** | Users can configure automated reminders for workouts, meals, and other fitness-related activities. The system allows users to set reminder types, frequencies, times, and notification preferences. Reminders are scheduled using a backend scheduler service and sent via push notifications or email. |
| **Preconditions** | 1. User must be authenticated and logged in<br>2. User must have an active subscription<br>3. Backend scheduler service must be running<br>4. Notification service (push notifications or email) must be configured<br>5. Backend API server must be accessible |
| **Typical Course of Events** | **Actor Action:**<br>1. User navigates to "Settings" or "Reminders" section<br>2. User clicks "Add Reminder" or "Configure Reminders"<br>3. User selects reminder type:<br>   - Workout reminder<br>   - Meal reminder<br>   - Water intake reminder<br>   - Progress tracking reminder<br>4. User configures reminder settings:<br>   - Reminder time (specific time of day)<br>   - Frequency (daily, weekly, specific days)<br>   - Notification method (push, email, both)<br>   - Reminder message/custom text<br>5. User saves reminder configuration<br><br>**System Response:**<br>6. System validates reminder configuration (time format, frequency)<br>7. System sends API request to backend (`POST /api/reminders`)<br>8. Backend validates authentication token<br>9. Backend validates reminder data<br>10. Backend creates reminder document in Firestore<br>11. Backend stores reminder configuration with user ID<br>12. Backend schedules reminder using cron job or task scheduler<br>13. Backend calculates next reminder execution time<br>14. Backend stores reminder in scheduler queue<br>15. Backend returns success confirmation to frontend<br>16. Frontend displays saved reminder in reminders list<br><br>**System Action (Reminder Execution):**<br>17. Scheduler service checks for due reminders<br>18. System retrieves reminder details from database<br>19. System sends notification via configured method (push/email)<br>20. System updates reminder last sent timestamp<br>21. System schedules next reminder occurrence |
| **Postconditions** | 1. Reminder configuration is saved in Firestore<br>2. Reminder is scheduled in backend scheduler service<br>3. Reminder appears in user's reminders list<br>4. System will send notifications at configured times<br>5. Reminder execution is logged<br>6. User can edit or delete reminders<br>7. Reminders are active and operational |

---

## Use Case 9: AI Fitness Assistant Interaction

| **Attribute** | **Description** |
|---------------|------------------|
| **Use Case Name** | AI Fitness Assistant Interaction |
| **Use Case ID** | UC-009 |
| **Priority** | Medium |
| **Primary Actor** | Regular User, Employee/Coach |
| **Description** | Users and coaches can interact with an AI-powered fitness assistant to get instant answers to fitness-related questions, receive workout suggestions, nutrition advice, and general fitness guidance. The AI assistant uses natural language processing to understand user queries and provides contextual responses based on user profile and fitness goals. Additionally, the AI can generate personalized meal plans based on user preferences, dietary restrictions, fitness goals, and nutritional requirements. |
| **Preconditions** | 1. User must be authenticated and logged in<br>2. AI service (OpenAI API or similar) must be configured and accessible<br>3. Backend API server must be running<br>4. User profile data must exist in database<br>5. API keys for AI service must be configured in backend<br>6. User must have an active subscription (for meal plan generation) |
| **Typical Course of Events** | **Actor Action (General Chat):**<br>1. User navigates to "AI Assistant" or "Chat with AI" section<br>2. User types a question or message in AI chat interface<br>3. User clicks "Send" button<br><br>**System Response:**<br>4. System validates message content (not empty, appropriate length)<br>5. System retrieves user profile data (fitness goals, current plan, progress)<br>6. System sends API request to backend (`POST /api/ai/chat`)<br>7. Backend validates authentication token<br>8. Backend retrieves user context from Firestore:<br>   - User's fitness goals<br>   - Current workout plan<br>   - Current meal plan<br>   - Recent progress data<br>   - Assigned coach information<br>   - Dietary preferences and restrictions<br>   - Body metrics (weight, height, activity level)<br>9. Backend constructs AI prompt with user context<br>10. Backend sends request to AI service (OpenAI API) with:<br>    - User's question<br>    - User context and profile<br>    - System instructions for fitness-focused responses<br>11. AI service processes request and generates response<br>12. Backend receives AI response<br>13. Backend stores conversation in Firestore for history<br>14. Backend returns AI response to frontend<br>15. Frontend displays AI response in chat interface<br>16. System updates chat history<br><br>**Actor Action (Meal Plan Generation):**<br>17. User requests meal plan generation (e.g., "Generate a meal plan for me" or "Create a 7-day meal plan")<br>18. User may specify preferences:<br>    - Dietary restrictions (vegetarian, vegan, keto, etc.)<br>    - Calorie target<br>    - Meal preferences<br>    - Allergies or food intolerances<br><br>**System Response:**<br>19. System identifies meal plan generation request<br>20. System retrieves comprehensive user data:<br>    - Current weight and height<br>    - Fitness goals (weight loss, muscle gain, maintenance)<br>    - Activity level<br>    - Current meal plan (if exists)<br>    - Dietary preferences from profile<br>21. System sends specialized API request to backend (`POST /api/ai/generate-meal-plan`)<br>22. Backend validates authentication and subscription status<br>23. Backend constructs detailed prompt for AI service including:<br>    - User's body metrics and goals<br>    - Daily calorie requirements<br>    - Macronutrient targets (proteins, carbs, fats)<br>    - Dietary restrictions and preferences<br>    - Meal plan duration (e.g., 7 days, 14 days)<br>    - Meal structure (breakfast, lunch, dinner, snacks)<br>24. Backend sends request to AI service with meal plan generation instructions<br>25. AI service generates structured meal plan with:<br>    - Daily meal breakdown<br>    - Food items and quantities<br>    - Nutritional information per meal<br>    - Total daily calories and macros<br>    - Meal preparation notes<br>26. Backend receives AI-generated meal plan<br>27. Backend validates meal plan structure and nutritional data<br>28. Backend calculates and verifies macro totals<br>29. Backend formats meal plan data according to system schema<br>30. Backend stores generated meal plan in Firestore<br>31. Backend associates meal plan with user account<br>32. Backend returns meal plan to frontend<br>33. Frontend displays generated meal plan in structured format<br>34. System shows daily meals with nutritional breakdown<br>35. System allows user to accept, modify, or regenerate meal plan<br><br>**Actor Action (Accept Meal Plan):**<br>36. User reviews generated meal plan<br>37. User clicks "Accept Meal Plan" or "Use This Plan"<br><br>**System Response:**<br>38. System sends API request to backend (`POST /api/meal-plans` or `PUT /api/meal-plans/{userId}`)<br>39. Backend updates user's active meal plan<br>40. Backend sets meal plan as active<br>41. Backend notifies assigned coach about new meal plan<br>42. System displays success message<br>43. User's meal plan is now active and visible in meal plan section |
| **Postconditions** | 1. AI response is generated and displayed to user<br>2. Conversation is stored in Firestore for history<br>3. User can view conversation history<br>4. AI assistant maintains context across conversation<br>5. System logs AI interactions for improvement<br>6. User receives helpful fitness guidance<br>7. Conversation can be continued in future sessions<br>8. **For meal plan generation:**<br>   - AI-generated meal plan is created and stored<br>9. **If meal plan is accepted:**<br>   - Meal plan becomes user's active meal plan<br>   - Meal plan is visible in user's meal plan section<br>   - Coach is notified of new meal plan<br>   - Meal plan can be modified by coach if needed<br>10. Generated meal plans are saved for future reference<br>11. User can request meal plan regeneration at any time |

---

## Use Case Summary Table

| **UC ID** | **Use Case Name** | **Priority** | **Primary Actor** | **Complexity** |
|-----------|-------------------|--------------|-------------------|----------------|
| UC-001 | User Login | High | User, Employee, Admin | Medium |
| UC-002 | User Registration | High | Prospective User | High |
| UC-003 | Password Reset (OTP-based) | High | User | Medium |
| UC-004 | View Workout Plan | High | Regular User | Low |
| UC-005 | View Meal Plan | High | Regular User | Low |
| UC-006 | Track Progress | Medium | Regular User | Medium |
| UC-007 | Chat with Coach | High | User, Coach | High |
| UC-008 | Configure Reminders | Medium | Regular User | Medium |
| UC-009 | AI Fitness Assistant Interaction | Medium | User, Coach | High |

---

## Technical Architecture Notes

### Authentication & Authorization
- **Authentication Method**: Firebase Authentication with JWT tokens
- **Role-Based Access Control**: Three roles (User, Employee/Coach, Admin)
- **Token Storage**: Client-side localStorage/sessionStorage
- **API Security**: Bearer token authentication on all protected endpoints

### Data Storage
- **Primary Database**: Google Cloud Firestore (NoSQL)
- **File Storage**: Firebase Storage (for images, GIFs, progress photos)
- **Real-time Communication**: Firestore real-time listeners for chat

### API Communication
- **Protocol**: RESTful API over HTTP/HTTPS
- **Base URL**: `http://localhost:3000/api` (development)
- **Request Format**: JSON
- **Response Format**: JSON with standardized structure (`{success, data, message}`)

### External Services
- **Email Service**: Node.js email service (Nodemailer) for OTP and notifications
- **AI Service**: OpenAI API or similar for AI assistant functionality
- **reCAPTCHA**: Google reCAPTCHA v3 for bot protection
- **Push Notifications**: Firebase Cloud Messaging (FCM) for mobile notifications

### Frontend Technologies
- **Web Framework**: React.js with Vite
- **State Management**: React Context API, React Hooks
- **UI Framework**: Tailwind CSS
- **Animation**: GSAP, Framer Motion
- **HTTP Client**: Axios

### Backend Technologies
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Firebase Admin SDK for Firestore
- **Scheduler**: Node-cron for reminder scheduling
- **Validation**: Express middleware for request validation

---

## Document Revision History

| **Version** | **Date** | **Author** | **Changes** |
|-------------|----------|-----------|-------------|
| 1.0 | 2024 | FitFix Development Team | Initial use case documentation |

---

**End of Document**

