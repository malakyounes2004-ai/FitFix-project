import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { HiOutlineShieldCheck } from 'react-icons/hi';
import { useNotification } from '../../hooks/useNotification';
import AdminSidebar from '../AdminSidebar';
import { useTheme } from '../../context/ThemeContext';

const statusStyles = {
  pending: 'bg-amber-500/15 text-amber-200 border border-amber-400/40',
  completed: 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/40',
  rejected: 'bg-rose-500/15 text-rose-200 border border-rose-400/40'
};

const formatAmount = (value) => {
  const num = Number(value);
  return Number.isNaN(num) ? value : num.toFixed(2);
};

const AdminPaymentDashboard = () => {
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch both user payments and employee signup payments
      const [userPaymentsRes, employeePaymentsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/payments/all', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/employee-payments/all', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      const userPayments = (userPaymentsRes.data.data || []).map(p => ({
        ...p,
        type: 'user',
        status: p.status || 'pending'
      }));
      
      const employeePayments = (employeePaymentsRes.data.data || []).map(p => ({
        ...p,
        id: p.id,
        userId: p.name || p.email,
        employeeId: 'Employee Signup',
        method: p.selectedPlan || 'Signup',
        status: 'completed', // Employee payments are auto-approved
        type: 'employee',
        createdAt: p.createdAt || p.timestamp
      }));
      
      // Combine both payment types
      setPayments([...userPayments, ...employeePayments]);
    } catch (error) {
      console.error('Failed to load payments', error);
      showNotification({ type: 'error', message: 'Unable to fetch payments.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    
    // Listen for employee approval events to refresh payments
    const handleEmployeeApproved = () => {
      console.log('Employee approved event received, refreshing payments...');
      loadPayments();
    };
    
    window.addEventListener('employeeApproved', handleEmployeeApproved);
    
    return () => {
      window.removeEventListener('employeeApproved', handleEmployeeApproved);
    };
  }, []);

  const handleAdminApproval = async (paymentId, decision = 'approve') => {
    try {
      setProcessingId(paymentId);
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/payments/admin-approve',
        { paymentId, decision },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      showNotification({
        type: decision === 'approve' ? 'success' : 'error',
        message: decision === 'approve' ? 'Payment approved' : 'Payment rejected'
      });
      await loadPayments();
    } catch (error) {
      console.error('Admin approval error', error);
      const message = error.response?.data?.message || 'Action failed.';
      showNotification({ type: 'error', message });
    } finally {
      setProcessingId(null);
    }
  };

  const visiblePayments = payments;

  return (
    <div className={`min-h-screen flex transition-colors ${
      isDarkMode 
        ? 'bg-[#05050c] text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <AdminSidebar />
      <div className="flex-1 px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-emerald-400 mb-2">Admin Control</p>
            <h1 className="text-4xl font-black">Payment Verification Desk</h1>
            <p className="text-slate-300 mt-2">
              One place to validate every offline transaction with real-time status badges.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-6 py-4 flex items-center gap-3">
            <HiOutlineShieldCheck className="text-3xl text-emerald-400" />
            <div>
              <p className="text-sm text-slate-400">Verified this week</p>
              <p className="text-2xl font-semibold">{payments.filter((p) => p.status === 'completed').length}</p>
            </div>
          </div>
        </header>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur space-y-6">
          <div className="flex flex-wrap gap-3 items-center justify-end">
            <button
              onClick={loadPayments}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
            >
              <FiRefreshCw className="animate-spin-slower" />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[720px]">
              <thead>
                <tr className="text-slate-400 uppercase text-xs tracking-[0.3em]">
                  <th className="py-3">Payment</th>
                  <th className="py-3">Client</th>
                  <th className="py-3">Coach</th>
                  <th className="py-3">Method</th>
                  <th className="py-3">Submitted</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400">
                      Loading payments...
                    </td>
                  </tr>
                ) : visiblePayments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center">
                      <div className="inline-flex items-center gap-2 text-slate-500">
                        <span className="w-8 h-8 rounded-full border border-dashed border-slate-700" />
                        No payments found in this filter.
                      </div>
                    </td>
                  </tr>
                ) : (
                  visiblePayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-900/60 transition">
                      <td className="py-4">
                        <p className="font-semibold text-white">${formatAmount(payment.amount)}</p>
                        <p className="text-slate-500 text-xs">{payment.id}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-white font-medium">{payment.userId}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-slate-300">{payment.employeeId}</p>
                      </td>
                      <td className="py-4 capitalize">{payment.method}</td>
                      <td className="py-4 text-slate-400">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-4">
                        <span className={`px-4 py-1 rounded-full text-xs uppercase tracking-[0.3em] ${statusStyles[payment.status]}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {payment.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleAdminApproval(payment.id, 'reject')}
                              disabled={processingId === payment.id}
                              className="px-4 py-2 rounded-xl border border-rose-400/50 text-rose-200 hover:bg-rose-500/10 transition disabled:opacity-60"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleAdminApproval(payment.id, 'approve')}
                              disabled={processingId === payment.id}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold flex items-center gap-2 shadow-lg disabled:opacity-60"
                            >
                              <FiCheckCircle />
                              Approve
                            </button>
                          </div>
                        ) : (
                          <p className="text-right text-slate-500 text-sm">No action</p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentDashboard;

