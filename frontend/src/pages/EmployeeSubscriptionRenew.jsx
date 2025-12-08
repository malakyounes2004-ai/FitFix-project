import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import EmployeeSidebar from '../components/EmployeeSidebar';
import { getAuth } from 'firebase/auth';

// Animation styles
const animationStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

// Plan configurations matching backend
const PLANS = [
  {
    id: '1month',
    name: '1 Month',
    label: '1 Month Plan',
    duration: '30 days',
    price: 200,
    color: 'from-blue-500 to-blue-600',
    popular: false
  },
  {
    id: '2months',
    name: '2 Months',
    label: '2 Months Plan',
    duration: '60 days',
    price: 399,
    color: 'from-cyan-500 to-cyan-600',
    popular: false
  },
  {
    id: '3months',
    name: '3 Months',
    label: '3 Months Plan',
    duration: '90 days',
    price: 599,
    color: 'from-purple-500 to-purple-600',
    popular: true
  },
  {
    id: '12months',
    name: '12 Months',
    label: 'Yearly (12 Months)',
    duration: '365 days',
    price: 2300,
    color: 'from-emerald-500 to-emerald-600',
    popular: false,
    savings: '4 months free'
  }
];

const EmployeeSubscriptionRenew = () => {
  const { isDarkMode } = useTheme();
  const { showNotification } = useNotification();
  
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [renewLoading, setRenewLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Get auth token
  const getAuthToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return localStorage.getItem('token');
  };

  // Fetch current subscription
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = await getAuthToken();
      
      if (!token || !user.uid) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/subscriptions/employee/${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSubscription(data.data);
      } else {
        setError(data.message || 'Failed to fetch subscription');
      }
    } catch (err) {
      console.error('Fetch subscription error:', err);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  // Renew subscription
  const handleRenew = async () => {
    if (!selectedPlan) return;

    try {
      setRenewLoading(true);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = await getAuthToken();
      
      if (!token || !user.uid) {
        showNotification({
          type: 'error',
          message: 'Authentication required'
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/subscriptions/renew`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: user.uid,
          plan: selectedPlan.id
        })
      });

      const data = await response.json();

      if (data.success) {
        showNotification({
          type: 'success',
          message: 'Subscription renewed successfully!'
        });
        setSubscription(data.data.subscription);
        setShowConfirmModal(false);
        setSelectedPlan(null);
      } else {
        showNotification({
          type: 'error',
          message: data.message || 'Failed to renew subscription'
        });
      }
    } catch (err) {
      console.error('Renew subscription error:', err);
      showNotification({
        type: 'error',
        message: 'Failed to renew subscription'
      });
    } finally {
      setRenewLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!subscription?.expirationDate) return 0;
    const expDate = new Date(subscription.expirationDate);
    const now = new Date();
    const diff = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const isExpired = subscription?.status === 'expired' || !subscription?.isActive;
  const daysRemaining = getDaysRemaining();

  return (
    <>
      <style>{animationStyles}</style>
      <div className={`min-h-screen flex transition-colors ${
        isDarkMode 
          ? 'bg-[#05050c] text-white' 
          : 'bg-gray-50 text-gray-900'
      }`}>
        {/* Sidebar */}
        <EmployeeSidebar />

        {/* Main content */}
        <main className="flex-1 px-10 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
            <p className={`${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
              Manage and renew your subscription plan
            </p>
          </div>

          {loading ? (
            // Loading skeleton
            <div className="space-y-6">
              <div className={`rounded-[28px] p-6 animate-pulse ${
                isDarkMode ? 'bg-white/10' : 'bg-gray-200'
              }`} style={{ height: '180px' }} />
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`rounded-[28px] p-6 animate-pulse ${
                    isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                  }`} style={{ height: '280px' }} />
                ))}
              </div>
            </div>
          ) : error ? (
            // Error state
            <div className={`rounded-[28px] p-8 text-center ${
              isDarkMode ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-100 border border-red-300'
            }`}>
              <FiAlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <p className="text-lg font-medium mb-2">{error}</p>
              <button
                onClick={fetchSubscription}
                className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Current Subscription Card */}
              <section className={`rounded-[28px] p-6 mb-8 opacity-0 animate-[fadeIn_0.6s_ease-out_0.1s_forwards] ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-[#111324] to-[#0f111f] border border-white/10' 
                  : 'bg-white border border-gray-200 shadow-lg'
              }`}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Current Subscription
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                      Your active plan details
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    isExpired
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {isExpired ? (
                      <span className="flex items-center gap-2">
                        <FiAlertCircle /> Expired
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <FiCheckCircle /> Active
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Plan */}
                  <div className={`rounded-2xl p-5 ${
                    isDarkMode ? 'bg-white/5' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <FiCalendar className="text-blue-500 text-lg" />
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                        Current Plan
                      </span>
                    </div>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {subscription?.planLabel || 'N/A'}
                    </p>
                  </div>

                  {/* Expiration */}
                  <div className={`rounded-2xl p-5 ${
                    isDarkMode ? 'bg-white/5' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isExpired
                          ? isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                          : isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                      }`}>
                        <FiClock className={`text-lg ${isExpired ? 'text-red-500' : 'text-purple-500'}`} />
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                        Expiration Date
                      </span>
                    </div>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(subscription?.expirationDate)}
                    </p>
                  </div>

                  {/* Days Remaining */}
                  <div className={`rounded-2xl p-5 ${
                    isDarkMode ? 'bg-white/5' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isExpired
                          ? isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                          : daysRemaining <= 7
                            ? isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'
                            : isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                      }`}>
                        <FiRefreshCw className={`text-lg ${
                          isExpired ? 'text-red-500' : daysRemaining <= 7 ? 'text-amber-500' : 'text-emerald-500'
                        }`} />
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                        Days Remaining
                      </span>
                    </div>
                    <p className={`text-2xl font-bold ${
                      isExpired 
                        ? 'text-red-500' 
                        : daysRemaining <= 7 
                          ? 'text-amber-500' 
                          : isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {isExpired ? 'Expired' : `${daysRemaining} days`}
                    </p>
                  </div>
                </div>
              </section>

              {/* Renewal Plans */}
              <section className="mb-8">
                <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isExpired ? 'Renew Your Subscription' : 'Extend Your Subscription'}
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {PLANS.map((plan, index) => (
                    <div
                      key={plan.id}
                      className={`relative rounded-[28px] p-6 cursor-pointer transition-all duration-300 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards] hover:-translate-y-2 hover:shadow-2xl ${
                        selectedPlan?.id === plan.id
                          ? isDarkMode
                            ? 'bg-gradient-to-br from-[#1f36ff]/30 to-[#15b5ff]/30 border-2 border-[#1f36ff] shadow-lg shadow-[#1f36ff]/20'
                            : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 shadow-lg'
                          : isDarkMode
                            ? 'bg-[#111324] border border-white/10 hover:border-white/20'
                            : 'bg-white border border-gray-200 hover:border-gray-300 shadow-md'
                      }`}
                      style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                          MOST POPULAR
                        </div>
                      )}
                      
                      {plan.savings && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                          Save {plan.savings}
                        </div>
                      )}

                      <div className="text-center pt-4">
                        <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {plan.name}
                        </h3>
                        <p className={`text-sm mb-6 ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                          {plan.duration}
                        </p>
                        
                        <div className="mb-6">
                          <span className={`text-5xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            ${plan.price}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlan(plan);
                            setShowConfirmModal(true);
                          }}
                          className={`w-full py-3 px-6 rounded-2xl font-semibold text-white transition-all duration-300 ${
                            selectedPlan?.id === plan.id
                              ? `bg-gradient-to-r ${plan.color} shadow-lg hover:shadow-xl`
                              : isDarkMode
                                ? 'bg-white/10 hover:bg-white/20'
                                : 'bg-gray-800 hover:bg-gray-900'
                          }`}
                        >
                          {isExpired ? 'Renew Now' : 'Extend Plan'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !renewLoading && setShowConfirmModal(false)}
          />
          
          {/* Modal */}
          <div className={`relative w-full max-w-md rounded-[28px] p-8 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards] ${
            isDarkMode 
              ? 'bg-[#111324] border border-white/10' 
              : 'bg-white shadow-2xl'
          }`}>
            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Confirm Renewal
            </h3>
            <p className={`mb-6 ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
              You are about to {isExpired ? 'renew' : 'extend'} your subscription
            </p>

            <div className={`rounded-2xl p-5 mb-6 ${
              isDarkMode ? 'bg-white/5' : 'bg-gray-50'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <span className={`${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>Plan</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedPlan.name}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className={`${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>Duration</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedPlan.duration}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total</span>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${selectedPlan.price}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={renewLoading}
                className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } ${renewLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Cancel
              </button>
              <button
                onClick={handleRenew}
                disabled={renewLoading}
                className={`flex-1 py-3 px-6 rounded-2xl font-semibold text-white transition-all duration-300 bg-gradient-to-r ${selectedPlan.color} hover:shadow-lg ${
                  renewLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {renewLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <FiRefreshCw className="animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Confirm Renewal'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeSubscriptionRenew;

