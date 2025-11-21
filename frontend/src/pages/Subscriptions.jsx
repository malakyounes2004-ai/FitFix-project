import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiRefreshCw, FiCheckCircle, FiXCircle, FiClock, FiCalendar } from 'react-icons/fi';
import { useNotification } from '../hooks/useNotification';
import AdminSidebar from '../components/AdminSidebar';
import { useTheme } from '../context/ThemeContext';

const Subscriptions = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    loadSubscriptions(true); // Show loading on initial load
    
    // Auto-refresh every 30 seconds to show new subscriptions (silent refresh)
    const interval = setInterval(() => {
      loadSubscriptions(false); // Silent refresh, no loading spinner
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadSubscriptions = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:3000/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Sort by creation date (newest first) so new subscriptions appear at top
      const sortedSubscriptions = (data.data || []).sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA; // Newest first
      });
      
      setSubscriptions(sortedSubscriptions);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      let errorMessage = 'Failed to load subscriptions';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Admin access required.';
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Make sure the backend is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      if (showLoading) {
        showNotification({
          type: 'error',
          message: errorMessage
        });
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleCheckExpirations = async () => {
    try {
      setIsChecking(true);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/subscriptions/check-expirations', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification({
        type: 'success',
        message: 'Subscription expirations checked successfully'
      });
      await loadSubscriptions();
    } catch (error) {
      console.error('Failed to check expirations:', error);
      showNotification({
        type: 'error',
        message: 'Failed to check expirations'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusBadge = (subscription) => {
    if (subscription.status === 'expired' || !subscription.isActive) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 flex items-center gap-1">
          <FiXCircle /> Expired
        </span>
      );
    }
    
    if (!subscription.expirationDate) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-400 flex items-center gap-1">
          <FiClock /> Unknown
        </span>
      );
    }
    
    const now = new Date();
    const expirationDate = timestampToDate(subscription.expirationDate);
    if (!expirationDate) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-400 flex items-center gap-1">
          <FiClock /> Unknown
        </span>
      );
    }
    
    const daysUntilExpiration = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration <= 2 && daysUntilExpiration > 0) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
          <FiClock /> Expiring Soon
        </span>
      );
    }
    
    if (daysUntilExpiration <= 0) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 flex items-center gap-1">
          <FiXCircle /> Expired
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
        <FiCheckCircle /> Active
      </span>
    );
  };

  // Helper function to convert Firestore timestamp to Date
  const timestampToDate = (timestamp) => {
    if (!timestamp) return null;
    
    try {
      // Handle Firestore Timestamp with toDate method
      if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      // Handle Firestore Timestamp with seconds property
      else if (timestamp && timestamp.seconds) {
        return new Date(timestamp.seconds * 1000);
      }
      // Handle Firestore Timestamp with _seconds property
      else if (timestamp && timestamp._seconds) {
        return new Date(timestamp._seconds * 1000);
      }
      // Handle regular Date object
      else if (timestamp instanceof Date) {
        return timestamp;
      }
      // Handle ISO string or number
      else {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
      }
    } catch (error) {
      console.error('Error converting timestamp:', error, timestamp);
      return null;
    }
  };

  const formatDate = (timestamp) => {
    const date = timestampToDate(timestamp);
    if (!date) return 'N/A';
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysUntilExpiration = (subscription) => {
    if (!subscription.expirationDate) return 'N/A';
    const now = new Date();
    const expirationDate = timestampToDate(subscription.expirationDate);
    if (!expirationDate) return 'N/A';
    
    const days = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
    
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `${days} days remaining`;
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active' && s.isActive);
  const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired' || !s.isActive);

  return (
    <div className={`min-h-screen flex transition-colors ${
      isDarkMode 
        ? 'bg-[#05050c] text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black mb-2">Subscriptions</h1>
              <p className="text-slate-400">Manage employee subscriptions and expirations</p>
            </div>
            <button
              onClick={handleCheckExpirations}
              disabled={isChecking}
              className="flex items-center gap-2 bg-gradient-to-r from-[#1f36ff] to-[#15b5ff] text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-blue-500/50 transition disabled:opacity-50"
            >
              <FiRefreshCw className={`text-xl ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Check Expirations'}
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Subscriptions</p>
                <p className="text-3xl font-bold">{subscriptions.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <FiCalendar className="text-blue-400 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Active</p>
                <p className="text-3xl font-bold text-emerald-400">{activeSubscriptions.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <FiCheckCircle className="text-emerald-400 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Expired</p>
                <p className="text-3xl font-bold text-rose-400">{expiredSubscriptions.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
                <FiXCircle className="text-rose-400 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6">All Subscriptions</h2>

          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block w-8 h-8 border-4 border-[#1f36ff] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 mt-4">Loading subscriptions...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500">No subscriptions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Subscription Plan</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Payment Date</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Account Created</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Expire Date</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Time Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-white">{subscription.employeeName || 'N/A'}</p>
                          <p className="text-xs text-slate-400 mt-1">{subscription.employeeEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <span className="text-sm font-semibold text-white">{subscription.planLabel || subscription.planType || 'N/A'}</span>
                          <p className="text-xs text-slate-400 mt-1">${subscription.amount || 0}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {(() => {
                          const paymentTimestamp = subscription.paymentDate || subscription.startDate || subscription.createdAt;
                          const paymentDate = timestampToDate(paymentTimestamp);
                          
                          if (!paymentDate) {
                            return <span className="text-sm text-slate-500">N/A</span>;
                          }
                          
                          return (
                            <>
                              <p className="text-sm text-white font-medium">{formatDate(paymentTimestamp)}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {paymentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </>
                          );
                        })()}
                      </td>
                      <td className="py-4 px-4">
                        {(() => {
                          if (!subscription.accountCreatedAt) {
                            return <span className="text-sm text-slate-500 italic">Not created yet</span>;
                          }
                          
                          const accountDate = timestampToDate(subscription.accountCreatedAt);
                          if (!accountDate) {
                            return <span className="text-sm text-slate-500">Invalid Date</span>;
                          }
                          
                          return (
                            <>
                              <p className="text-sm text-white font-medium">{formatDate(subscription.accountCreatedAt)}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {accountDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </>
                          );
                        })()}
                      </td>
                      <td className="py-4 px-4">
                        {(() => {
                          if (!subscription.expirationDate) {
                            return <span className="text-sm text-slate-500">N/A</span>;
                          }
                          
                          const expireDate = timestampToDate(subscription.expirationDate);
                          if (!expireDate) {
                            return <span className="text-sm text-slate-500">Invalid Date</span>;
                          }
                          
                          return (
                            <>
                              <p className="text-sm text-white font-medium">{formatDate(subscription.expirationDate)}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {expireDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </>
                          );
                        })()}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(subscription)}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-300 font-medium">{getDaysUntilExpiration(subscription)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;

