import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiDollarSign, FiMessageCircle, FiSettings, FiCalendar, FiClipboard } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <FiHome />, path: '/admin-dashboard' },
  { key: 'employees', label: 'Employee', icon: <FiUsers />, path: '/admin/employees' },
  { key: 'employeeRequests', label: 'Employee Requests', icon: <FiClipboard />, path: '/admin/employee-requests' },
  { key: 'subscriptions', label: 'Subscriptions', icon: <FiCalendar />, path: '/admin/subscriptions' },
  { key: 'payments', label: 'Payments', icon: <FiDollarSign />, path: '/payments/admin' },
  { key: 'chat', label: 'Chat', icon: <FiMessageCircle />, path: '/admin/chat' },
  { key: 'settings', label: 'Settings', icon: <FiSettings />, path: '/settings' }
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));

  // Listen for profile updates
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(updatedUser
        
      );
    };

    // Listen for storage events (when profile is updated in Settings)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event (same-tab updates)
    window.addEventListener('profileUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavClick = (path) => {
    if (path && path !== '#') {
      navigate(path);
    }
  };

  // Determine active nav based on current path
  const getActiveNav = () => {
    const path = location.pathname;
    if (path === '/admin-dashboard') return 'dashboard';
    if (path === '/admin/employees') return 'employees';
    if (path === '/admin/employee-requests') return 'employeeRequests';
    if (path === '/admin/subscriptions') return 'subscriptions';
    if (path === '/payments/admin') return 'payments';
    if (path === '/admin/chat') return 'chat';
    if (path === '/settings') return 'settings';
    return 'dashboard';
  };

  const activeNav = getActiveNav();

  return (
    <aside className={`w-64 rounded-r-[32px] p-6 flex flex-col gap-10 transition-colors ${
      isDarkMode 
        ? 'bg-[#0f111f]' 
        : 'bg-white border-r border-gray-200'
    }`}>
      <div className="flex items-center gap-3">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="avatar"
            className={`w-14 h-14 rounded-2xl object-cover border ${
              isDarkMode ? 'border-white/10' : 'border-gray-200'
            }`}
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1f36ff] to-[#15b5ff] flex items-center justify-center text-white font-bold text-lg border ${
            isDarkMode ? 'border-white/10' : 'border-gray-200'
          } ${user.photoURL ? 'hidden' : ''}`}
        >
          {(user.displayName || user.email || 'A')[0].toUpperCase()}
        </div>
        <div>
          <p className={`font-semibold text-lg ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {user.displayName || 'Admin'}
          </p>
          <span className={`text-xs ${
            isDarkMode ? 'text-white/60' : 'text-gray-500'
          }`}>
            Administrator
          </span>
        </div>
      </div>
      
      <nav className="flex flex-col gap-4">
        {navItems.map(({ key, label, icon, path }) => (
          <button
            key={key}
            onClick={() => handleNavClick(path)}
            className={`flex items-center gap-3 text-sm font-semibold px-4 py-3 rounded-2xl transition ${
              activeNav === key
                ? 'bg-[#1f36ff] text-white shadow-lg shadow-blue-900/40'
                : isDarkMode 
                  ? 'text-white/70 hover:bg-white/5'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
      
      <div className="mt-auto">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between text-xs p-3 rounded-2xl transition ${
            isDarkMode 
              ? 'bg-white/5 hover:bg-white/10' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <span className={isDarkMode ? 'text-white/60' : 'text-gray-600'}>Light</span>
          <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs transition-all ${
            isDarkMode 
              ? 'bg-[#1f36ff] text-white' 
              : 'bg-gray-300 text-gray-700'
          }`}>
            <span>Dark</span>
          </div>
        </button>
      </div>
      
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-2xl transition-colors font-medium text-sm"
      >
        Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;

