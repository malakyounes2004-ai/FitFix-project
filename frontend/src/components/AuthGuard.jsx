import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../config/firebaseClient';

/**
 * AuthGuard Component
 * 
 * Checks authentication state on app load and redirects accordingly:
 * - If NOT authenticated → redirect to /login
 * - If authenticated → redirect based on role
 * 
 * This prevents any flash of protected pages before authentication check completes.
 */
const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let unsubscribe = null;
    
    const checkAuth = () => {
      try {
        // Check localStorage first (primary auth method)
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        // If we have token and user in localStorage, verify they're valid
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            
            // Only proceed if user has valid role
            if (user && user.role) {
              const role = user.role;
              
              // If on login page or root, redirect to appropriate dashboard
              if (location.pathname === '/login' || location.pathname === '/') {
                if (role === 'admin') {
                  navigate('/admin', { replace: true });
                } else if (role === 'employee') {
                  const userId = user.uid || '';
                  navigate(`/employee/${userId}`, { replace: true });
                } else if (role === 'user') {
                  navigate('/dashboard', { replace: true });
                }
                setIsChecking(false);
                return;
              }
              // If on a protected route, allow it (ProtectedRoute will handle role checks)
              setIsChecking(false);
              return;
            } else {
              // Invalid user data, clear storage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          } catch (error) {
            // Invalid user data, clear storage
            console.error('Error parsing user data:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
        
        // Also check Firebase auth state if available
        if (auth) {
          unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
              // Firebase user is authenticated
              // Check if we have user data in localStorage
              const userStr = localStorage.getItem('user');
              if (userStr) {
                try {
                  const user = JSON.parse(userStr);
                  if (user && user.role) {
                    const role = user.role;
                    
                    // If on login page or root, redirect to appropriate dashboard
                    if (location.pathname === '/login' || location.pathname === '/') {
                      if (role === 'admin') {
                        navigate('/admin', { replace: true });
                      } else if (role === 'employee') {
                        const userId = user.uid || firebaseUser.uid;
                        navigate(`/employee/${userId}`, { replace: true });
                      } else if (role === 'user') {
                        navigate('/dashboard', { replace: true });
                      }
                      setIsChecking(false);
                      return;
                    }
                    // If on a protected route, allow it
                    setIsChecking(false);
                    return;
                  }
                } catch (error) {
                  console.error('Error parsing user data:', error);
                }
              }
            }
            
            // Not authenticated - redirect to login if not already there
            if (location.pathname !== '/login' && 
                location.pathname !== '/contact-admin' && 
                location.pathname !== '/forgot-password' &&
                location.pathname !== '/about' &&
                !location.pathname.startsWith('/employee/payment-success')) {
              navigate('/login', { replace: true });
            }
            setIsChecking(false);
          });
        } else {
          // Firebase not available, use localStorage only
          // Not authenticated - redirect to login if not already there
          if (location.pathname !== '/login' && 
              location.pathname !== '/contact-admin' && 
              location.pathname !== '/forgot-password' &&
              location.pathname !== '/about' &&
              !location.pathname.startsWith('/employee/payment-success')) {
            navigate('/login', { replace: true });
          }
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // On error, redirect to login
        if (location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
        setIsChecking(false);
      }
    };

    checkAuth();
    
    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [navigate, location.pathname]);

  // Show nothing while checking (prevents flash of content)
  if (isChecking) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;

