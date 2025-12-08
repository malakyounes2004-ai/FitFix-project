import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';
import { 
  FiRefreshCw, 
  FiCheckCircle, 
  FiDollarSign, 
  FiTrendingUp,
  FiCalendar,
  FiRepeat
} from 'react-icons/fi';
import { useNotification } from '../hooks/useNotification';
import AdminSidebar from '../components/AdminSidebar';
import { useTheme } from '../context/ThemeContext';

const AdminSubscriptionPayments = () => {
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalRevenue: 0,
    renewalCount: 0,
    thisMonthRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs for GSAP animations
  const headerRef = useRef(null);
  const statsCardsRef = useRef(null);
  const tableRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    loadData(true);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // GSAP entrance animations
  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        // Header animation
        gsap.from(headerRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.6,
          ease: 'power3.out'
        });

        // Stats cards animation
        if (statsCardsRef.current) {
          gsap.from(statsCardsRef.current.children, {
            opacity: 0,
            y: 30,
            stagger: 0.1,
            duration: 0.5,
            ease: 'power3.out',
            delay: 0.2
          });
        }

        // Table animation
        gsap.from(tableRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power3.out',
          delay: 0.4
        });
      });

      return () => ctx.revert();
    }
  }, [isLoading]);

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const token = localStorage.getItem('token');
      
      // Fetch both payments and stats in parallel
      const [paymentsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/subscription-payments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/subscription-payments/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPayments(paymentsRes.data.data || []);
      setStats(statsRes.data.data || {
        totalPayments: 0,
        totalRevenue: 0,
        renewalCount: 0,
        thisMonthRevenue: 0
      });
    } catch (error) {
      console.error('Failed to load subscription payments:', error);
      
      let errorMessage = 'Failed to load payments';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Admin access required.';
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Make sure the backend is running.';
      }
      
      if (showLoading) {
        showNotification({
          type: 'error',
          message: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadData(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className={`min-h-screen flex transition-colors ${
      isDarkMode 
        ? 'bg-[#05050c] text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header ref={headerRef} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs uppercase tracking-[0.5em] mb-2 ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  Subscription Revenue
                </p>
                <h1 className="text-4xl font-black mb-2">Subscription Payments</h1>
                <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                  Track all subscription renewals and payments from coaches
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#1f36ff] to-[#15b5ff] text-white hover:shadow-lg hover:shadow-blue-500/50'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30'
                } disabled:opacity-50`}
              >
                <FiRefreshCw className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </header>

          {/* Stats Cards */}
          <div ref={statsCardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className={`rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] ${
              isDarkMode 
                ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20' 
                : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Total Revenue
                  </p>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-200'
                }`}>
                  <FiDollarSign className={`text-2xl ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
              </div>
            </div>

            {/* This Month */}
            <div className={`rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] ${
              isDarkMode 
                ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    This Month
                  </p>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {formatCurrency(stats.thisMonthRevenue)}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? 'bg-blue-500/20' : 'bg-blue-200'
                }`}>
                  <FiTrendingUp className={`text-2xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              </div>
            </div>

            {/* Total Payments */}
            <div className={`rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] ${
              isDarkMode 
                ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20' 
                : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Total Payments
                  </p>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {stats.totalPayments}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? 'bg-purple-500/20' : 'bg-purple-200'
                }`}>
                  <FiCalendar className={`text-2xl ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
              </div>
            </div>

            {/* Renewals */}
            <div className={`rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] ${
              isDarkMode 
                ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20' 
                : 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Renewals
                  </p>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    {stats.renewalCount}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? 'bg-amber-500/20' : 'bg-amber-200'
                }`}>
                  <FiRepeat className={`text-2xl ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div 
            ref={tableRef}
            className={`rounded-[32px] p-8 ${
              isDarkMode 
                ? 'bg-slate-900/80 border border-slate-800' 
                : 'bg-white border border-gray-200 shadow-xl'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Payment History</h2>
              <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {payments.length} payment{payments.length !== 1 ? 's' : ''} found
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-16">
                <div className={`inline-block w-12 h-12 border-4 rounded-full animate-spin ${
                  isDarkMode 
                    ? 'border-[#1f36ff] border-t-transparent' 
                    : 'border-blue-600 border-t-transparent'
                }`}></div>
                <p className={`mt-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Loading payments...
                </p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-16">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  isDarkMode ? 'bg-slate-800' : 'bg-gray-100'
                }`}>
                  <FiDollarSign className={`text-3xl ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`} />
                </div>
                <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  No payments found
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                  Subscription payments will appear here when coaches renew their plans
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-4 px-4 text-sm font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>Coach Name</th>
                      <th className={`text-left py-4 px-4 text-sm font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>Email</th>
                      <th className={`text-left py-4 px-4 text-sm font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>Plan</th>
                      <th className={`text-left py-4 px-4 text-sm font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>Amount</th>
                      <th className={`text-left py-4 px-4 text-sm font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>Renewal?</th>
                      <th className={`text-left py-4 px-4 text-sm font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr 
                        key={payment.id}
                        className={`border-b transition-colors ${
                          isDarkMode 
                            ? 'border-slate-800 hover:bg-slate-800/50' 
                            : 'border-gray-100 hover:bg-gray-50'
                        }`}
                        style={{
                          animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                        }}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                              isDarkMode 
                                ? 'bg-gradient-to-br from-[#1f36ff] to-[#15b5ff]' 
                                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            }`}>
                              {(payment.employeeName || 'U')[0].toUpperCase()}
                            </div>
                            <span className="font-semibold">{payment.employeeName || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className={`py-4 px-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          {payment.employeeEmail || 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isDarkMode 
                              ? 'bg-blue-500/20 text-blue-300' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {payment.planLabel || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {formatCurrency(payment.amount)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {payment.renewed ? (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              isDarkMode 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              <FiCheckCircle className="text-sm" />
                              Yes
                            </span>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isDarkMode 
                                ? 'bg-slate-700 text-slate-400' 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              No
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formatDate(payment.createdAt)}
                            </p>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                              {formatTime(payment.createdAt)}
                            </p>
                          </div>
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

      {/* Animation styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSubscriptionPayments;

