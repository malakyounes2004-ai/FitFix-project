import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiEye, FiRefreshCw, FiShield, FiDownload, FiFile } from 'react-icons/fi';
import { useNotification } from '../hooks/useNotification';
import AdminSidebar from '../components/AdminSidebar';
import { useTheme } from '../context/ThemeContext';

const statusStyles = {
  pending: 'bg-amber-500/15 text-amber-200 border border-amber-400/40',
  approved: 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/40',
  rejected: 'bg-rose-500/15 text-rose-200 border border-rose-400/40'
};

const AdminEmployeeRequests = () => {
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  const formatRecaptcha = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(2) : 'N/A';
  };

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/employee-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Failed to load requests', error);
      showNotification({ type: 'error', message: 'Unable to fetch requests.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this request? An employee account will be created.')) {
      return;
    }

    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:3000/api/employee-requests/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const responseData = response.data || {};
      const employeeUid = responseData.data?.employeeUid;

      showNotification({
        type: 'success',
        message: 'Request approved! Employee account created and credentials sent via email.'
      });

      // Refresh requests list
      await loadRequests();
      
      // Trigger a custom event to refresh other pages (employee list, payments, dashboard)
      window.dispatchEvent(new CustomEvent('employeeApproved', { 
        detail: { employeeUid } 
      }));
    } catch (error) {
      console.error('Approve error', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to approve request'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return; // User cancelled

    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:3000/api/employee-requests/reject/${id}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification({
        type: 'success',
        message: 'Request rejected successfully'
      });

      await loadRequests();
    } catch (error) {
      console.error('Reject error', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to reject request'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length
  };

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
            <h1 className="text-4xl font-black">Employee Requests</h1>
            <p className="text-slate-300 mt-2">Review and approve employee registration requests</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-6 py-4 flex items-center gap-3">
            <FiShield className="text-3xl text-emerald-400" />
            <div>
              <p className="text-sm text-slate-400">Pending Requests</p>
              <p className="text-2xl font-semibold">{stats.pending}</p>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  filter === status
                    ? 'bg-emerald-500 text-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={loadRequests}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <FiRefreshCw className="animate-spin-slower" />
            Refresh
          </button>
        </div>

        {/* Requests Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[720px]">
              <thead>
                <tr className="text-slate-400 uppercase text-xs tracking-[0.3em]">
                  <th className="py-3">Employee</th>
                  <th className="py-3">Contact</th>
                  <th className="py-3">Location</th>
                  <th className="py-3">Plan</th>
                  <th className="py-3">Verification</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400">
                      Loading requests...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center">
                      <div className="inline-flex items-center gap-2 text-slate-500">
                        <span className="w-8 h-8 rounded-full border border-dashed border-slate-700" />
                        No requests found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-900/60 transition">
                      <td className="py-4">
                        <p className="font-semibold text-white">{request.fullName}</p>
                        <p className="text-slate-500 text-xs mt-1">{request.email}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-slate-300">{request.phone}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-slate-300">{request.city}, {request.country}</p>
                      </td>
                      <td className="py-4">
                        <p className="font-semibold text-white">{request.selectedPlanLabel || request.selectedPlan}</p>
                        <p className="text-slate-500 text-xs mt-1">${request.amount}</p>
                      </td>
                      <td className="py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${request.phoneVerified ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            <span className="text-xs text-slate-400">Phone: {request.phoneVerified ? 'Verified' : 'Not Verified'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${request.recaptchaScore >= 0.5 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            <span className="text-xs text-slate-400">reCAPTCHA: {formatRecaptcha(request.recaptchaScore)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-4 py-1 rounded-full text-xs uppercase tracking-[0.3em] ${statusStyles[request.status]}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          {request.cvUrl && (
                            <a
                              href={request.cvUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition"
                              title="View CV"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiFile />
                            </a>
                          )}
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="p-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleReject(request.id)}
                                disabled={processingId === request.id}
                                className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition disabled:opacity-50"
                                title="Reject"
                              >
                                <FiXCircle />
                              </button>
                              <button
                                onClick={() => handleApprove(request.id)}
                                disabled={processingId === request.id}
                                className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition disabled:opacity-50 flex items-center gap-1"
                                title="Approve"
                              >
                                <FiCheckCircle />
                              </button>
                            </>
                          )}
                        </div>
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

      {/* Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Request Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <FiXCircle className="text-2xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-1">Full Name</p>
                  <p className="text-white font-semibold">{selectedRequest.fullName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-1">Email</p>
                  <p className="text-white">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-1">Phone</p>
                  <p className="text-white">{selectedRequest.phone}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-1">Gender</p>
                  <p className="text-white capitalize">{selectedRequest.gender}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-1">Date of Birth</p>
                  <p className="text-white">{selectedRequest.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-1">Location</p>
                  <p className="text-white">{selectedRequest.city}, {selectedRequest.country}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-1">Address</p>
                  <p className="text-white">{selectedRequest.address}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-1">Subscription Plan</p>
                  <p className="text-white font-semibold">{selectedRequest.selectedPlanLabel || selectedRequest.selectedPlan}</p>
                  <p className="text-slate-400 text-sm">${selectedRequest.amount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-[0.3em] ${statusStyles[selectedRequest.status]}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-1">Phone Verified</p>
                  <p className={`${selectedRequest.phoneVerified ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedRequest.phoneVerified ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-1">reCAPTCHA Score</p>
                  <p className="text-white">{formatRecaptcha(selectedRequest.recaptchaScore)}</p>
                </div>
                {selectedRequest.notes && (
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-1">Notes</p>
                    <p className="text-white">{selectedRequest.notes}</p>
                  </div>
                )}
                {selectedRequest.cvUrl && (
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">CV Document</p>
                    <div className="flex items-center gap-3">
                      <a
                        href={selectedRequest.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-xl hover:bg-blue-500/30 transition"
                      >
                        <FiFile className="text-lg" />
                        <span>Preview CV</span>
                      </a>
                      <a
                        href={selectedRequest.cvUrl}
                        download
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl hover:bg-emerald-500/30 transition"
                      >
                        <FiDownload className="text-lg" />
                        <span>Download CV</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleReject(selectedRequest.id);
                  }}
                  className="flex-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-xl py-3 font-semibold hover:bg-rose-500/30 transition"
                >
                  Reject Request
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleApprove(selectedRequest.id);
                  }}
                  className="flex-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl py-3 font-semibold hover:bg-emerald-500/30 transition"
                >
                  Approve & Create Account
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeeRequests;

