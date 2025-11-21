import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * 
 * Protects routes based on authentication and role.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authenticated
 * @param {string} props.requiredRole - Required role ('admin', 'employee', 'user') or null for any authenticated user
 * @param {boolean} props.allowRoles - Array of allowed roles (alternative to requiredRole)
 */
const ProtectedRoute = ({ children, requiredRole = null, allowRoles = null }) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Get user data from localStorage
  const userStr = localStorage.getItem('user');
  let user = null;
  
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
  }

  // Helper function to decode JWT token (client-side only, not for security)
  const decodeToken = (token) => {
    try {
      if (!token) return null;
      
      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      // Decode the payload (second part)
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Get role from token or user object
  const getRole = () => {
    // First try to get from user object in localStorage
    if (user?.role) {
      return user.role;
    }
    
    // If not in user object, try to decode token
    if (token) {
      const decoded = decodeToken(token);
      // Firebase tokens might have custom claims or we can check user_id
      // For now, we'll rely on the user object stored during login
      return decoded?.role || null;
    }
    
    return null;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Check if user has required role
  const hasRequiredRole = () => {
    if (!requiredRole && !allowRoles) {
      // No role requirement, just need to be authenticated
      return true;
    }

    const userRole = getRole();
    
    if (!userRole) {
      return false;
    }

    // Check against requiredRole
    if (requiredRole) {
      return userRole === requiredRole;
    }

    // Check against allowRoles array
    if (allowRoles && Array.isArray(allowRoles)) {
      return allowRoles.includes(userRole);
    }

    return false;
  };

  // Get redirect path based on role
  const getRedirectPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'employee':
        return '/employee-dashboard';
      case 'user':
        return '/dashboard';
      default:
        return '/login';
    }
  };

  // Not authenticated - redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but wrong role - redirect to appropriate dashboard
  if (!hasRequiredRole()) {
    const userRole = getRole();
    const redirectPath = getRedirectPath(userRole);
    
    return (
      <Navigate 
        to={redirectPath} 
        replace 
        state={{ message: `Access denied. This page requires ${requiredRole || allowRoles?.join(' or ')} role.` }}
      />
    );
  }

  // Authenticated and has correct role - render children
  return <>{children}</>;
};

export default ProtectedRoute;

