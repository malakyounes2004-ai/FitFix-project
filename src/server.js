// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './firebase.js'; // Initialize Firebase
import './scheduler/reminders.js'; // Register cron jobs

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import employeeRoutes from './routes/employee.js';
import userRoutes from './routes/user.js';
import notificationRoutes from './routes/notifications.js';
import paymentRoutes from './routes/payments.js';
import employeePaymentRoutes from './routes/employeePayments.js';
import subscriptionRoutes from './routes/subscriptions.js';
import subscriptionPaymentRoutes from './routes/subscriptionPayments.js';
import employeeRequestRoutes from './routes/employeeRequests.js';
import recaptchaRoutes from './routes/recaptcha.js';
import chatRoutes from './routes/chat.js';
import mealPlansRoutes from './routes/mealPlans.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'FitFix API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      employee: '/api/employee',
      user: '/api/user',
      notifications: '/api/notifications',
      payments: '/api/payments'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/employee-payments', employeePaymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/subscription-payments', subscriptionPaymentRoutes);
app.use('/api/employee-requests', employeeRequestRoutes);
app.use('/api/verify-recaptcha', recaptchaRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/mealPlans', mealPlansRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error Details:');
  console.error('  URL:', req.method, req.url);
  console.error('  Error:', err.message);
  console.error('  Stack:', err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 FitFix API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
});
