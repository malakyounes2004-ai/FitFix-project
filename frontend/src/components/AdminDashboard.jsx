import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiMessageCircle, FiUsers, FiDollarSign } from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';
import { useTheme } from '../context/ThemeContext';
import { useDashboardLoader } from '../hooks/useDashboardLoader';

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState(null);

  // Use the unified dashboard loader hook - loads instantly from cache
  const {
    stats,
    weeklyStats,
    employeeActivity,
    pendingNotifications,
    pendingRequests
  } = useDashboardLoader('admin');

  // Handle authentication errors
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Listen for employee approval events to refresh dashboard
    const handleEmployeeApproved = () => {
      // Hook will automatically update via realtime listeners
      console.log('Employee approved event received');
    };
    
    window.addEventListener('employeeApproved', handleEmployeeApproved);
    
    return () => {
      window.removeEventListener('employeeApproved', handleEmployeeApproved);
    };
  }, [navigate]);

  return (
    <div className={`min-h-screen flex transition-colors ${
      isDarkMode 
        ? 'bg-[#05050c] text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 px-10 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {error && (
              <div className="mt-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
            >
              <FiBell className="text-lg" />
              {pendingNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                  {pendingNotifications}
                </span>
              )}
            </button>
            <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center">
              <FiMessageCircle className="text-lg" />
            </button>
          </div>
        </div>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="fixed top-20 right-10 w-96 bg-[#111324] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[500px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-white">Employee Requests</h3>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {pendingNotifications === 0 ? (
                <p className="text-white/60 text-sm text-center py-8">No pending requests</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-emerald-400 text-sm font-semibold mb-3">
                      {pendingNotifications} pending request{pendingNotifications > 1 ? 's' : ''}
                    </p>
                    {pendingRequests.length > 0 && (
                      <div className="space-y-2">
                        {pendingRequests.map((request) => (
                          <div 
                            key={request.id}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition cursor-pointer"
                            onClick={() => {
                              setShowNotifications(false);
                              navigate('/admin/employee-requests');
                            }}
                          >
                            <p className="text-white font-semibold text-sm">{request.fullName}</p>
                            <p className="text-white/60 text-xs mt-1">{request.email}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-emerald-400">{request.selectedPlanLabel || request.selectedPlan}</span>
                              <span className="text-xs text-white/40">
                                {request.createdAt 
                                  ? (() => {
                                      try {
                                        const date = request.createdAt.seconds 
                                          ? new Date(request.createdAt.seconds * 1000)
                                          : new Date(request.createdAt);
                                        return date.toLocaleDateString();
                                      } catch {
                                        return 'Just now';
                                      }
                                    })()
                                  : 'Just now'}
                              </span>
                            </div>
                          </div>
                        ))}
                        {pendingRequests.length < pendingNotifications && (
                          <p className="text-white/40 text-xs text-center py-2">
                            +{pendingNotifications - pendingRequests.length} more request{pendingNotifications - pendingRequests.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/admin/employee-requests');
                    }}
                    className="w-full bg-[#1f36ff] hover:bg-[#1b2ed1] text-white px-4 py-3 rounded-xl transition font-medium mt-4"
                  >
                    View All Requests
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Left column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Hero */}
            <section className="bg-gradient-to-r from-[#f8eedf] to-[#fbe3d3] rounded-[32px] p-6 flex flex-col lg:flex-row gap-6 text-[#111324]">
              <div className="flex-1">
                <p className="text-sm font-semibold mb-2">Welcome back!</p>
                <h2 className="text-3xl font-black leading-tight">Ready to add employee?</h2>
                <p className="text-sm text-black/60 mt-3">Your guidance powers every member's journey</p>
              </div>
              <div className="w-full lg:w-56 h-56 rounded-[28px] overflow-hidden border border-black/5 shadow-lg">
                <img src="/hero-image.png" alt="athlete" className="w-full h-full object-cover" />
              </div>
            </section>

            {/* Health cards */}
            <section className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-[28px] p-6 backdrop-blur">
                <p className="text-sm text-white/70 mb-4">Total Employees</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-5xl font-black leading-none">{stats.totalEmployees}</p>
                    <p className="text-sm text-white/60 mt-2">Active coaches</p>
                  </div>
                  <FiUsers className="text-5xl text-[#1f9fff]" />
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/50">Updates in real-time</p>
                </div>
              </div>
              <div className="bg-[#1f36ff] rounded-[28px] p-6 text-white">
                <p className="text-sm text-white/80 mb-4">Total Payments</p>
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-5xl font-black leading-none">{stats.totalPayments}</p>
                    <span className="text-sm text-white/70 mt-1 block">
                      ${stats.totalPaymentAmount.toFixed(2)} received
                    </span>
                  </div>
                  <FiDollarSign className="text-5xl" />
                </div>
                <div className="mt-6 h-24 rounded-2xl bg-white/15 flex items-end gap-1 p-2">
                  {Array.from({ length: 20 }).map((_, idx) => (
                    <span
                      key={idx}
                      className="flex-1 rounded-full bg-white/70"
                      style={{ height: `${30 + idx * 2}px` }}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Activity banner */}
            <section className="bg-gradient-to-r from-[#1f36ff] to-[#15b5ff] rounded-[32px] p-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-white/60">Congrats!</p>
                <h3 className="text-2xl font-semibold">Your activity is much better than yesterday.</h3>
              </div>
              <button className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
                →
              </button>
            </section>
          </div>

          {/* Right column */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <section className="bg-[#111324] rounded-[32px] p-6 space-y-6 border border-white/5">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-white/60 mb-4">User Signups This Week</p>
                <div className="bg-white/5 rounded-2xl p-4 h-48 flex gap-2 items-end">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const count = weeklyStats[day] || 0;
                    const maxCount = Math.max(...Object.values(weeklyStats), 1);
                    const heightPercent = (count / maxCount) * 100;
                    const minHeight = count > 0 ? 20 : 10;
                    const barHeight = Math.max(minHeight, heightPercent);
                    
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="relative w-full flex items-end justify-center" style={{ height: '140px' }}>
                          <div
                            className="w-full rounded-full bg-gradient-to-t from-[#1f36ff] to-[#15b5ff] transition-all duration-300 group-hover:from-[#2547ff] group-hover:to-[#20c5ff]"
                            style={{ height: `${barHeight}%` }}
                          />
                          {count > 0 && (
                            <span className="absolute -top-6 text-xs font-bold text-white/90">{count}</span>
                          )}
                        </div>
                        <span className="text-xs text-white/60">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-white/60 mb-4">Employee Status</p>
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between hover:bg-emerald-500/20 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <FiUsers className="text-emerald-400 text-xl" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{employeeActivity.active}</p>
                        <p className="text-xs text-white/60 mt-0.5">Active Employees</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-emerald-400 text-xs font-bold">✓</span>
                    </div>
                  </div>
                  
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-center justify-between hover:bg-red-500/20 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                        <FiUsers className="text-red-400 text-xl" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{employeeActivity.inactive}</p>
                        <p className="text-xs text-white/60 mt-0.5">Inactive Employees</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="text-red-400 text-xs font-bold">✕</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

