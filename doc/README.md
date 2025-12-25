# FitFix - Health & Fitness Coaching System

A comprehensive Health & Fitness / Lifestyle Coaching System with role-based access control for Admin, Employee, and User roles.

## 🏗️ Project Structure

```
FitFix/
├── src/
│   ├── controllers/
│   │   ├── adminController.js      # Admin operations
│   │   ├── authController.js       # Authentication (login, register)
│   │   └── employeeController.js   # Employee operations
│   ├── middleware/
│   │   └── authMiddleware.js       # Role-based authentication middleware
│   ├── routes/
│   │   ├── admin.js                # Admin routes
│   │   ├── auth.js                 # Auth routes
│   │   └── employee.js             # Employee routes
│   ├── firebase.js                 # Firebase Admin SDK initialization
│   └── server.js                   # Express server setup
├── serviceAccountKey.json          # Firebase service account (not in git)
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Firebase project with Firestore enabled
- Firebase service account key

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Firebase**:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Generate a new private key and save it as `serviceAccountKey.json` in the root directory
   - Get your Web API Key from Firebase Console > Project Settings > General
   - **Important**: Create Firestore Database (see [FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md))

4. **Create `.env` file**:
   ```env
   PORT=3000
   FIREBASE_API_KEY=your_firebase_web_api_key_here
   ```

5. **Start the server**:
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## 📚 Documentation

- **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes
- **[Setup Guide](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[Firestore Setup](./FIRESTORE_SETUP.md)** - Create and configure Firestore database
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference with examples
- **[Firestore Structure](./FIRESTORE_STRUCTURE.md)** - Database schema and security rules
- **[Frontend Integration](./FRONTEND_INTEGRATION.md)** - React and Flutter integration guides

## 🔐 Authentication & Roles

### Roles

1. **Admin**
   - Create and manage employees
   - View all users and employees
   - Access dashboard statistics
   - Manage subscriptions

2. **Employee**
   - Create and manage users (clients)
   - Assign meal and workout plans
   - Track user progress
   - Chat with users

3. **User** (Client)
   - View assigned meal/workout plans
   - Track personal progress
   - Upload progress photos
   - Chat with assigned employee
   - Receive notifications

### Authentication Flow

1. User logs in via `/api/auth/login` with email and password
2. Server authenticates with Firebase Auth REST API
3. Returns `idToken` and user data
4. Client stores token and includes it in `Authorization: Bearer <token>` header for protected routes

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/profile` - Get current user profile (Protected)

### Admin Routes (Admin only)
- `POST /api/admin/employees` - Create employee
- `GET /api/admin/employees` - Get all employees
- `GET /api/admin/users` - Get all users
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `PATCH /api/admin/employees/:employeeId/status` - Update employee status

### Employee Routes (Employee only)
- `POST /api/employee/users` - Create user
- `GET /api/employee/users` - Get my users
- `POST /api/employee/users/:userId/meal-plans` - Assign meal plan
- `POST /api/employee/users/:userId/workout-plans` - Assign workout plan
- `GET /api/employee/users/:userId/progress` - Get user progress

## 📦 Key Features

✅ **Role-based Authentication** - Secure middleware for Admin, Employee, and User roles  
✅ **Firebase Integration** - Admin SDK for backend operations  
✅ **RESTful API** - Clean, well-documented API endpoints  
✅ **Error Handling** - Comprehensive error responses  
✅ **Type Safety** - Consistent response formats  

## 🔧 Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage (for images/files)

## 📝 Example Usage

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@fitfix.com", "password": "password123"}'
```

### Create Employee (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email": "coach@fitfix.com",
    "password": "password123",
    "displayName": "John Coach"
  }'
```

## 🧪 Testing

Test the API using:
- **cURL** (see examples in API_DOCUMENTATION.md)
- **Postman** (import the endpoints)
- **Frontend applications** (React/Flutter - see FRONTEND_INTEGRATION.md)

## 🔒 Security Notes

1. **Never commit `serviceAccountKey.json`** - Add it to `.gitignore`
2. **Use environment variables** for sensitive data
3. **Enable CORS** only for trusted domains in production
4. **Implement rate limiting** for production
5. **Use HTTPS** in production
6. **Set up Firestore security rules** (see FIRESTORE_STRUCTURE.md)

## 📱 Frontend Integration

### React (Website)
See [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) for:
- API service setup
- Authentication flow
- Protected routes
- Example components

### Flutter (Mobile App)
See [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) for:
- API service setup
- Authentication flow
- State management
- Example screens

## 🗄️ Database Structure

See [FIRESTORE_STRUCTURE.md](./FIRESTORE_STRUCTURE.md) for:
- Collection schemas
- Document structures
- Security rules
- Required indexes

## 🐛 Troubleshooting

### "NOT_FOUND" Error (Firestore)
**This means your Firestore database hasn't been created yet.**
- See [FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md) for step-by-step instructions
- Go to Firebase Console > Firestore Database > Create database
- Run `npm run test-connection` after creating the database

### Firebase Admin SDK Error
- Ensure `serviceAccountKey.json` is in the root directory
- Verify the service account has proper permissions
- Check that the project ID matches your Firebase project

### Authentication Errors
- Check that `FIREBASE_API_KEY` is set in `.env`
- Verify Firebase Auth is enabled in Firebase Console
- Run `npm run test-connection` to diagnose issues

### CORS Errors
- Ensure CORS is enabled in `server.js`
- Check that frontend URL is allowed

## 📄 License

ISC

## 👥 Contributing

This is a senior project. For questions or issues, please contact the project maintainer.

---

**Built with ❤️ for Health & Fitness Coaching**

