
# FitFix - Health & Fitness Coaching Management System

<div align="center">

![FitFix](https://img.shields.io/badge/FitFix-Health%20%26%20Fitness-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![Firebase](https://img.shields.io/badge/Firebase-Enabled-orange)
![License](https://img.shields.io/badge/License-ISC-lightgrey)

**A comprehensive web-based platform connecting fitness coaches with their clients through personalized meal plans, workout routines, progress tracking, and real-time communication.**

[Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**FitFix** is a full-stack health and fitness coaching management system designed to streamline the relationship between fitness coaches and their clients. The platform enables coaches to manage multiple clients efficiently, create personalized meal and workout plans, track progress, and communicate in real-time.

### Key Benefits

- **For Coaches (Employees)**: Manage multiple clients, create personalized plans, track progress, and communicate efficiently
- **For Clients (Users)**: Access personalized meal/workout plans, track progress, and communicate directly with their coach
- **For Administrators**: Oversee the entire platform, manage employees, subscriptions, payments, and system-wide analytics

---

## ✨ Features

### 🔐 Authentication & Authorization
- Role-based access control (Admin, Employee, User)
- Secure authentication with Firebase Auth
- JWT token-based session management
- Password reset functionality
- reCAPTCHA integration

### 👥 User Management
- **Admin Dashboard**: Manage employees, view all users, approve payments, manage subscriptions
- **Employee Dashboard**: Create and manage clients, assign plans, track progress, handle payments
- **User Dashboard**: View assigned plans, track personal progress, upload photos, chat with coach

### 📝 Meal & Workout Plans
- Create and assign personalized meal plans
- Create and assign workout routines with exercise GIFs
- Support for male and female-specific exercises
- Plan templates and customization
- Progress tracking and analytics

### 💬 Real-Time Communication
- Real-time chat system using Firebase Firestore
- Chat between Admin, Employees, and Users
- Message read receipts
- Search functionality
- Notification system

### 💳 Payment Management
- Subscription management
- Payment tracking and history
- Employee payment requests
- Admin payment approval workflow
- Payment analytics and reports

### 📊 Analytics & Reports
- Dashboard statistics for all roles
- Progress tracking with visualizations
- User activity reports
- Payment and subscription analytics
- AI-powered recommendations

### 🤖 AI Features
- AI-powered workout and meal plan recommendations
- Intelligent progress analysis
- Personalized suggestions based on user goals

### 🎨 User Interface
- Modern, responsive design with Tailwind CSS
- Dark/Light mode support
- Animated components with Framer Motion and GSAP
- Toast notifications
- Error boundaries for better error handling

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js v5.1.0
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **Additional**: 
  - OpenAI API (for AI features)
  - Nodemailer (for email notifications)
  - Node-cron (for scheduled tasks)
  - Multer (for file uploads)

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.3.6
- **Routing**: React Router DOM 6.20.0
- **HTTP Client**: Axios 1.6.2
- **Animations**: 
  - Framer Motion 12.23.24
  - GSAP 3.13.0
- **Charts**: Recharts 3.5.1
- **Icons**: React Icons 4.12.0

---

## 📁 Project Structure

```
FitFix/
├── src/                          # Backend source code
│   ├── controllers/              # Business logic layer
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── userController.js
│   │   ├── chatController.js
│   │   ├── paymentController.js
│   │   ├── workoutController.js
│   │   └── ...
│   ├── routes/                   # API route definitions
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── employee.js
│   │   ├── user.js
│   │   ├── chat.js
│   │   └── ...
│   ├── middleware/               # Middleware functions
│   │   └── authMiddleware.js
│   ├── services/                 # Service layer
│   │   ├── emailService.js
│   │   └── subscriptionService.js
│   ├── scheduler/                # Scheduled tasks
│   │   └── reminders.js
│   ├── utils/                    # Utility functions
│   │   ├── createAdmin.js
│   │   └── testConnection.js
│   ├── firebase.js               # Firebase initialization
│   └── server.js                 # Express server setup
├── frontend/                     # Frontend React application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── EmployeeSidebar.jsx
│   │   │   ├── payments/
│   │   │   ├── reports/
│   │   │   └── ...
│   │   ├── pages/                # Page components
│   │   │   ├── EmployeeChat.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   └── ...
│   │   ├── context/              # React Context providers
│   │   │   ├── ThemeContext.jsx
│   │   │   ├── NotificationContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useNotification.js
│   │   │   └── useToast.js
│   │   ├── config/               # Configuration files
│   │   │   └── firebaseClient.js
│   │   ├── services/             # API service functions
│   │   └── utils/                # Utility functions
│   ├── public/                   # Static assets
│   ├── package.json
│   └── vite.config.js
├── doc/                          # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── QUICK_START.md
│   ├── PROJECT_REPORT.md
│   └── ...
├── package.json                  # Backend dependencies
├── .env                          # Environment variables (not in git)
└── README.md                     # This file
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Firebase project** with:
  - Firestore Database enabled
  - Firebase Authentication enabled
  - Firebase Storage enabled
- **Firebase service account key** (JSON file)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/FitFix.git
cd FitFix
```

### Step 2: Install Backend Dependencies

```bash
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 4: Firebase Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one

2. **Enable Firebase Services**:
   - Enable **Firestore Database** (create database in test mode for development)
   - Enable **Firebase Authentication** (Email/Password provider)
   - Enable **Firebase Storage**

3. **Get Service Account Key**:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `serviceAccountKey.json` in the root directory

4. **Get Web API Key**:
   - Go to Project Settings > General
   - Copy the "Web API Key"

### Step 5: Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
FIREBASE_API_KEY=your_firebase_web_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional, for AI features
EMAIL_HOST=smtp.gmail.com                 # Optional, for email features
EMAIL_USER=your_email@gmail.com           # Optional
EMAIL_PASS=your_app_password              # Optional
```

### Step 6: Test Firebase Connection

```bash
npm run test-connection
```

Expected output:
```
✅ Service account key found
✅ Firebase Auth connected successfully
✅ Firestore connected successfully
✅ All connection tests passed!
```

---

## ⚡ Quick Start

### 1. Create First Admin User

```bash
npm run create-admin
```

Follow the prompts to create your admin account.

### 2. Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

Backend will run on `http://localhost:3000`

### 3. Start Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Run Both Servers Together

From the root directory:

```bash
npm run dev:all
```

This will start both backend and frontend concurrently.

---

## 📖 Usage

### Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Login with your admin credentials (created in step 1)
3. You'll be redirected to the appropriate dashboard based on your role:
   - **Admin** → `/admin-dashboard`
   - **Employee** → `/employee-dashboard`
   - **User** → `/dashboard`

### API Testing

You can test the API using:

- **cURL**: See examples in `doc/API_DOCUMENTATION.md`
- **Postman**: Import `FitFix_API.postman_collection.json`
- **Frontend**: Use the React application

### Example API Calls

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@fitfix.com", "password": "password123"}'
```

**Get Profile (Protected):**
```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📚 API Documentation

Comprehensive API documentation is available in the `doc/` directory:

- **[API Documentation](./doc/API_DOCUMENTATION.md)** - Complete API reference
- **[API Endpoints Summary](./doc/API_ENDPOINTS_SUMMARY.md)** - Quick reference
- **[Postman Collection](./FitFix_API.postman_collection.json)** - Import for testing
- **[Quick Start Guide](./doc/QUICK_START.md)** - Get started in 5 minutes
- **[Project Report](./doc/PROJECT_REPORT.md)** - Detailed project analysis

### Main API Endpoints

- **Authentication**: `/api/auth/*`
- **Admin**: `/api/admin/*`
- **Employee**: `/api/employee/*`
- **User**: `/api/user/*`
- **Chat**: `/api/chat/*`
- **Payments**: `/api/payments/*`
- **Subscriptions**: `/api/subscriptions/*`
- **Notifications**: `/api/notifications/*`

---

## 🖼️ Screenshots

> _Add screenshots of your application here_

---

## 🔧 Available Scripts

### Backend Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server with nodemon
npm run dev:all        # Start both backend and frontend
npm run create-admin   # Create admin user
npm run test-connection # Test Firebase connection
npm run test-api       # Test API endpoints
```

### Frontend Scripts

```bash
cd frontend
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
```

---

## 🐛 Troubleshooting

### Common Issues

**"Firebase Admin SDK initialization failed"**
- Ensure `serviceAccountKey.json` exists in the root directory
- Verify the JSON file is valid and not corrupted

**"Firestore database not found"**
- Create Firestore database in Firebase Console
- See `doc/FIRESTORE_SETUP.md` for detailed instructions

**"Port already in use"**
- Change `PORT` in `.env` to a different port
- Or stop the process using the port

**"User profile not found" after login**
- Run `npm run create-admin` to create user properly
- Or manually create user document in Firestore

For more troubleshooting help, see:
- [Quick Start Guide](./doc/QUICK_START.md)
- [Firestore Setup](./doc/FIRESTORE_SETUP.md)
- [API Documentation](./doc/API_DOCUMENTATION.md)

---

## 🤝 Contributing

This is a senior project. For questions, issues, or contributions:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Firebase for providing excellent backend services
- React and Vite communities for amazing tools
- All open-source contributors whose packages made this project possible

---

<div align="center">

**Built with ❤️ for Health & Fitness Coaching**

⭐ Star this repo if you find it helpful!

</div>

