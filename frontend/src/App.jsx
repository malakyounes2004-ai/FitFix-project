import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import LoginTwoColumn from './components/LoginTwoColumn';
import ProtectedRoute from './components/ProtectedRoute';
import AuthGuard from './components/AuthGuard';
import AdminDashboard from './components/AdminDashboard';
import UserPaymentPage from './components/payments/UserPaymentPage';
import EmployeeApprovalPage from './components/payments/EmployeeApprovalPage';
import AdminPaymentDashboard from './components/payments/AdminPaymentDashboard';
import UserPaymentSuccess from './components/payments/UserPaymentSuccess';
import EmployeeSignup from './pages/EmployeeSignup';
import EmployeePaymentSuccess from './pages/PaymentSuccess';
import EmployeeManagement from './pages/EmployeeManagement';
import Subscriptions from './pages/Subscriptions';
import AdminSubscriptionPayments from './pages/AdminSubscriptionPayments';
import AdminEmployeeRequests from './pages/AdminEmployeeRequests';
import AdminChat from './pages/AdminChat';
import EmployeeChat from './pages/EmployeeChat';
import Settings from './pages/Settings';
import EmployeeSettings from './pages/EmployeeSettings';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeAddUser from './pages/EmployeeAddUser';
import EmployeeMyUsers from './pages/EmployeeMyUsers';
import AddMealPlan from './pages/AddMealPlan';
import MealPlans from './pages/MealPlans';
import MealPlanManagement from './pages/MealPlanManagement';
import AddMealPlanContent from './pages/AddMealPlanContent';
import SelectReadyPlanContent from './pages/SelectReadyPlanContent';
import ViewUsersPlanContent from './pages/ViewUsersPlanContent';
import EmployeeExercisesLibrary from './pages/EmployeeExercisesLibrary';
import EmployeeGymPlans from './pages/EmployeeGymPlans';
import EmployeeUsersWorkoutPlans from './pages/EmployeeUsersWorkoutPlans';
import EmployeeSubscriptionRenew from './pages/EmployeeSubscriptionRenew';
import AboutUs from './pages/AboutUs';
import RecommendationsReports from './pages/RecommendationsReports';


const UserDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
        <p className="mt-4 text-gray-600">Welcome, {user.displayName || user.email}!</p>
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Role: <span className="font-semibold text-indigo-600">{user.role}</span></p>
        </div>
      </div>
    </div>
  );
};

function App() {
  // Log that App is rendering
  console.log('App component rendering...');
  
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
        <AuthGuard>
        <Routes>
          {/* Public routes - Login should be first */}
          <Route path="/login" element={<LoginTwoColumn />} />
          <Route path="/login-old" element={<Login />} />
          <Route path="/contact-admin" element={<EmployeeSignup />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/employee/payment-success" element={<EmployeePaymentSuccess />} />
          <Route path="/forgot-password" element={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h1 className="text-2xl font-bold mb-4">Forgot Password</h1><p className="text-gray-600">Feature coming soon</p></div></div>} />
          <Route
            path="/payments/user"
            element={
              <ProtectedRoute requiredRole="user">
                <UserPaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments/success"
            element={
              <ProtectedRoute requiredRole="user">
                <UserPaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments/employee"
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeApprovalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPaymentDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Protected routes with role-based access */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/employees" 
            element={
              <ProtectedRoute requiredRole="admin">
                <EmployeeManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/subscriptions" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Subscriptions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/payments" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSubscriptionPayments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/employee-requests" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminEmployeeRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/chat" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminChat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute requiredRole="admin">
                <RecommendationsReports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee-dashboard" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/add-user" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeAddUser />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/my-users" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeMyUsers />
              </ProtectedRoute>
            } 
          />
          {/* Meal Plans Section */}
          <Route 
            path="/employee/meal-plans/add" 
            element={
              <ProtectedRoute requiredRole="employee">
                <AddMealPlanContent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/meal-plans/select" 
            element={
              <ProtectedRoute requiredRole="employee">
                <SelectReadyPlanContent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/meal-plans/view" 
            element={
              <ProtectedRoute requiredRole="employee">
                <ViewUsersPlanContent />
              </ProtectedRoute>
            } 
          />
          {/* Gym / Workout Plans Section */}
          <Route 
            path="/employee/exercises" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeExercisesLibrary />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/gym-plans" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeGymPlans />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/workout-plans-overview" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeUsersWorkoutPlans />
              </ProtectedRoute>
            } 
          />
          {/* Subscription Renewal */}
          <Route 
            path="/employee/renew-subscription" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeSubscriptionRenew />
              </ProtectedRoute>
            } 
          />
          {/* Legacy routes for backward compatibility */}
          <Route 
            path="/employee/add-meal-plan" 
            element={
              <ProtectedRoute requiredRole="employee">
                <AddMealPlan />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/meal-plans" 
            element={
              <ProtectedRoute requiredRole="employee">
                <MealPlans />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/chat" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeChat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/settings" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/:userId/add-user" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeAddUser />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/:userId" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />
                 <Route 
                   path="/settings" 
                   element={
                     <ProtectedRoute>
                       <Settings />
                     </ProtectedRoute>
                   } 
                 />
                 <Route 
                   path="/dashboard" 
                   element={
                     <ProtectedRoute requiredRole="user">
                       <UserDashboard />
                     </ProtectedRoute>
                   } 
                 />
                 
                 {/* Default redirect - always go to login unless authenticated */}
                 <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch-all route for undefined paths - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </AuthGuard>
      </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;

