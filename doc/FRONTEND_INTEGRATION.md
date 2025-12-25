# Frontend Integration Guide

This guide provides code examples for integrating the FitFix API with React (Website) and Flutter (Mobile App).

---

## React Integration (Website for Admin + Employee)

### 1. Setup

Install required packages:
```bash
npm install axios
# or
yarn add axios
```

### 2. API Service Configuration

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Auth Service

Create `src/services/authService.js`:

```javascript
import api from './api';

export const authService = {
  // Login
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    throw new Error(response.data.message);
  },

  // Register
  async register(email, password, displayName, role = 'user') {
    const response = await api.post('/auth/register', {
      email,
      password,
      displayName,
      role
    });
    return response.data;
  },

  // Get current user profile
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get stored user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};
```

### 4. Admin Service

Create `src/services/adminService.js`:

```javascript
import api from './api';

export const adminService = {
  // Create employee
  async createEmployee(employeeData) {
    const response = await api.post('/admin/employees', employeeData);
    return response.data;
  },

  // Get all employees
  async getEmployees() {
    const response = await api.get('/admin/employees');
    return response.data;
  },

  // Get all users
  async getUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Get dashboard stats
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Update employee status
  async updateEmployeeStatus(employeeId, isActive) {
    const response = await api.patch(`/admin/employees/${employeeId}/status`, {
      isActive
    });
    return response.data;
  }
};
```

### 5. Employee Service

Create `src/services/employeeService.js`:

```javascript
import api from './api';

export const employeeService = {
  // Create user
  async createUser(userData) {
    const response = await api.post('/employee/users', userData);
    return response.data;
  },

  // Get my users
  async getMyUsers() {
    const response = await api.get('/employee/users');
    return response.data;
  },

  // Assign meal plan
  async assignMealPlan(userId, mealPlanData) {
    const response = await api.post(`/employee/users/${userId}/meal-plans`, mealPlanData);
    return response.data;
  },

  // Assign workout plan
  async assignWorkoutPlan(userId, workoutPlanData) {
    const response = await api.post(`/employee/users/${userId}/workout-plans`, workoutPlanData);
    return response.data;
  },

  // Get user progress
  async getUserProgress(userId) {
    const response = await api.get(`/employee/users/${userId}/progress`);
    return response.data;
  }
};
```

### 6. React Login Component Example

```javascript
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'employee') {
        navigate('/employee/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
```

### 7. Protected Route Component

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

function ProtectedRoute({ children, requiredRole }) {
  const user = authService.getCurrentUser();

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

export default ProtectedRoute;
```

### 8. Usage in App.js

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## Flutter Integration (Mobile App for Users)

### 1. Setup

Add dependencies to `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  shared_preferences: ^2.2.2
  provider: ^6.1.1
```

### 2. API Service

Create `lib/services/api_service.dart`:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';
  // For mobile, use your server's IP: 'http://192.168.1.100:3000/api'

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> body) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();
    
    final response = await http.post(
      url,
      headers: headers,
      body: jsonEncode(body),
    );

    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> get(String endpoint) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();
    
    final response = await http.get(url, headers: headers);
    return _handleResponse(response);
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Request failed: ${response.statusCode}');
    }
  }
}
```

### 3. Auth Service

Create `lib/services/auth_service.dart`:

```dart
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _api.post('/auth/login', {
      'email': email,
      'password': password,
    });

    if (response['success'] == true) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', response['token']);
      await prefs.setString('user', jsonEncode(response['user']));
    }

    return response;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

  Future<Map<String, dynamic>?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('user');
    if (userJson != null) {
      return jsonDecode(userJson);
    }
    return null;
  }

  Future<bool> isAuthenticated() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey('token');
  }
}
```

### 4. User Service

Create `lib/services/user_service.dart`:

```dart
import 'api_service.dart';

class UserService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> getProfile() async {
    return await _api.get('/auth/profile');
  }

  Future<Map<String, dynamic>> getMealPlans() async {
    // Implement based on your API endpoints
    return await _api.get('/user/meal-plans');
  }

  Future<Map<String, dynamic>> getWorkoutPlans() async {
    // Implement based on your API endpoints
    return await _api.get('/user/workout-plans');
  }

  Future<Map<String, dynamic>> getProgress() async {
    // Implement based on your API endpoints
    return await _api.get('/user/progress');
  }
}
```

### 5. Login Screen Example

Create `lib/screens/login_screen.dart`:

```dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  bool _loading = false;
  String? _error;

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await _authService.login(
        _emailController.text,
        _passwordController.text,
      );

      if (response['success'] == true) {
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        setState(() {
          _error = response['message'] ?? 'Login failed';
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error: ${e.toString()}';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_error != null)
                Padding(
                  padding: EdgeInsets.only(bottom: 16.0),
                  child: Text(
                    _error!,
                    style: TextStyle(color: Colors.red),
                  ),
                ),
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(labelText: 'Email'),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your email';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(labelText: 'Password'),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your password';
                  }
                  return null;
                },
              ),
              SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loading ? null : _login,
                child: _loading
                    ? CircularProgressIndicator()
                    : Text('Login'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 6. Main App with Auth Check

Update `lib/main.dart`:

```dart
import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'services/auth_service.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FitFix',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  @override
  _AuthWrapperState createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  final _authService = AuthService();
  bool _isLoading = true;
  bool _isAuthenticated = false;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final isAuth = await _authService.isAuthenticated();
    setState(() {
      _isAuthenticated = isAuth;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return _isAuthenticated ? HomeScreen() : LoginScreen();
  }
}
```

---

## Environment Configuration

### React (.env)
```env
REACT_APP_API_URL=http://localhost:3000/api
```

### Flutter
For Flutter, you'll need to use your computer's local IP address when testing on a physical device:
```dart
// Use: http://192.168.1.100:3000/api (replace with your IP)
```

---

## Important Notes

1. **CORS**: Make sure your Express server has CORS enabled (already configured in `server.js`).

2. **Token Storage**: 
   - React: Using `localStorage` (web-safe)
   - Flutter: Using `SharedPreferences` (mobile-safe)

3. **Error Handling**: Always handle API errors gracefully in your UI.

4. **Token Refresh**: Implement token refresh logic if tokens expire frequently.

5. **Network Security**: In production, use HTTPS and secure token storage.

6. **State Management**: Consider using Redux (React) or Provider/Riverpod (Flutter) for better state management.

