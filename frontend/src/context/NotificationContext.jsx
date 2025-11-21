import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext(null);

/**
 * NotificationProvider Component
 * Manages simple website-style notifications
 */
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  /**
   * Show a notification
   * @param {Object} options
   * @param {string} options.type - 'success' or 'error'
   * @param {string} options.message - Message to display
   * @param {number} options.duration - Duration in milliseconds (default: 4000)
   */
  const showNotification = useCallback(({ type, message, duration = 4000 }) => {
    setNotification({ type, message, duration });
  }, []);

  /**
   * Clear notification
   */
  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const value = {
    showNotification,
    clearNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Simple notification at top of page */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onClose={clearNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};

/**
 * Custom hook to use notification context
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;

