import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { useNotification } from '../../hooks/useNotification';

const statusColors = {
  pending: 'bg-amber-500/20 text-amber-200 border border-amber-400/30',
  completed: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
  rejected: 'bg-rose-500/20 text-rose-200 border border-rose-400/30'
};

const formatAmount = (value) => {
  const num = Number(value);
  return Number.isNaN(num) ? value : num.toFixed(2);
};

const EmployeeApprovalPage = () => {
  const { showNotification } = useNotification();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processingId, setProcessingId] = useState(null);

  const user = useMemo(() => {
    try {
      const data = localStorage.getItem('user');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to parse user', error);
      return null;
    }
  }, []);

  const employeeId = user?.uid;

  const loadPayments = async () => {
    if (!employeeId) {
      setIsLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:3000/api/payments/employee/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(data.data || []);
    } catch (error) {
      console.error('Failed to fetch payments', error);
      showNotification({ type: 'error', message: 'Could not load payment list.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleDecision = async (paymentId, decision) => {
    try {
      setProcessingId(paymentId);
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/payments/employee-approve',
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
      console.error('Decision error', error);
      const message = error.response?.data?.message || 'Action failed. Try again.';
      showNotification({ type: 'error', message });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (filter === 'pending') {
      return payment.status === 'pending' && !payment.approvedByEmployee;
    }
    if (filter === 'completed') {
      return payment.status === 'completed';
    }
    if (filter === 'rejected') {
      return payment.status === 'rejected';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-emerald-400 mb-3">Coach Console</p>
          <h1 className="text-4xl font-black">Approve Client Payments</h1>
          <p className="text-slate-300 mt-3">Review offline payments, keep everything transparent, and notify admins instantly.</p>
        </header>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur">
          <div className="flex flex-wrap gap-3 items-center justify-between mb-8">
            <div className="flex gap-2">
              {['pending', 'completed', 'rejected', 'all'].map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition ${
                    filter === option ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={loadPayments}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
            >
              <FiRefreshCw className="animate-spin-slower" />
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <FiRefreshCw className="text-3xl animate-spin mb-4" />
              Loading payment requests...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto w-24 h-24 border border-dashed border-slate-700 rounded-full flex items-center justify-center animate-pulse mb-5">
                <span className="text-slate-500 text-sm">No data</span>
              </div>
              <p className="text-slate-400">No payments in this state. Enjoy the calm!</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6 hover:border-emerald-500/30 transition"
                >
                  <div className="flex-1">
                    <p className="text-sm uppercase tracking-[0.4em] text-slate-500">{payment.method}</p>
                    <p className="text-3xl font-semibold mt-2">${formatAmount(payment.amount)}</p>
                    <p className="text-slate-400 text-sm mt-1">
                      Submitted {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'Recently'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[260px]">
                    <span className={`inline-flex items-center justify-center px-4 py-1 rounded-full text-xs uppercase tracking-[0.3em] ${statusColors[payment.status]}`}>
                      {payment.status}
                    </span>
                    {payment.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDecision(payment.id, 'reject')}
                          disabled={processingId === payment.id}
                          className="flex-1 border border-rose-400/50 text-rose-200 rounded-xl py-2 hover:bg-rose-500/10 transition disabled:opacity-60"
                        >
                          <FiXCircle className="inline mr-1" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleDecision(payment.id, 'approve')}
                          disabled={processingId === payment.id}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-black rounded-xl py-2 font-semibold shadow-lg disabled:opacity-60"
                        >
                          <FiCheckCircle className="inline mr-1" />
                          Approve
                        </button>
                      </div>
                    )}
                    {payment.status !== 'pending' && (
                      <p className="text-slate-400 text-sm">
                        Reviewed by: {payment.approvedByEmployeeId ? `Coach ${payment.approvedByEmployeeId.slice(-4)}` : 'N/A'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeApprovalPage;

