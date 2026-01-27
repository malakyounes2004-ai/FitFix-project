import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiUserPlus, FiMail, FiLock, FiPhone, FiUser, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX, FiCheck, FiKey } from 'react-icons/fi';
import { useNotification } from '../hooks/useNotification';
import AdminSidebar from '../components/AdminSidebar';
import { useTheme } from '../context/ThemeContext';

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    phoneNumber: ''
  });
  const [employees, setEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState({
    displayName: '',
    phoneNumber: '',
    isActive: true
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalData, setPasswordModalData] = useState({
    uid: '',
    email: '',
    name: '',
    newPassword: ''
  });
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);

  useEffect(() => {
    loadData();
    
    // Listen for employee approval events to refresh the list
    const handleEmployeeApproved = () => {
      console.log('Employee approved event received, refreshing employee list...');
      loadEmployees();
    };
    
    window.addEventListener('employeeApproved', handleEmployeeApproved);
    
    return () => {
      window.removeEventListener('employeeApproved', handleEmployeeApproved);
    };
  }, []);

  const loadData = async () => {
    await loadEmployees();
  };

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:3000/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Employees API response:', data);
      setEmployees(data.data || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      let errorMessage = 'Failed to load employees';
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
      
      showNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showNotification({
        type: 'error',
        message: 'Email and password are required'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:3000/api/admin/employees',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showNotification({
        type: 'success',
        message: '✅ Employee created! Credentials sent via email.'
      });

      // Reset form
      setFormData({
        email: '',
        password: '',
        displayName: '',
        phoneNumber: ''
      });

      // Reload data
      await loadData();
      
      // Close modal
      setShowAddEmployeeModal(false);
    } catch (error) {
      console.error('Create employee error:', error);
      const message = error.response?.data?.message || 'Failed to create employee';
      showNotification({
        type: 'error',
        message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee.uid);
    setEditFormData({
      displayName: employee.displayName || '',
      phoneNumber: employee.phoneNumber || '',
      isActive: employee.isActive !== false
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setEditFormData({ displayName: '', phoneNumber: '', isActive: true });
  };

  const handleUpdateEmployee = async (uid) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/employees/${uid}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification({
        type: 'success',
        message: '✅ Employee updated successfully'
      });

      setEditingEmployee(null);
      await loadEmployees();
    } catch (error) {
      console.error('Update employee error:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update employee'
      });
    }
  };

  const handleToggleStatus = async (uid, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/employees/${uid}`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification({
        type: 'success',
        message: `Employee ${!currentStatus ? 'activated' : 'deactivated'}`
      });

      await loadEmployees();
    } catch (error) {
      console.error('Toggle status error:', error);
      showNotification({
        type: 'error',
        message: 'Failed to update status'
      });
    }
  };

  const handleDeleteEmployee = async (uid, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:3000/api/admin/employees/${uid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification({
        type: 'success',
        message: '✅ Employee deleted successfully'
      });

      await loadEmployees();
    } catch (error) {
      console.error('Delete employee error:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete employee'
      });
    }
  };

  const handleOpenPasswordModal = (employee) => {
    setPasswordModalData({
      uid: employee.uid,
      email: employee.email,
      name: employee.displayName || employee.email,
      newPassword: ''
    });
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordModalData({ uid: '', email: '', name: '', newPassword: '' });
  };

  const handlePasswordChange = (e) => {
    setPasswordModalData({ ...passwordModalData, newPassword: e.target.value });
  };

  const handleResetPassword = async () => {
    if (!passwordModalData.newPassword || passwordModalData.newPassword.length < 6) {
      showNotification({
        type: 'error',
        message: 'Password must be at least 6 characters'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/admin/reset-employee-password',
        {
          uid: passwordModalData.uid,
          email: passwordModalData.email,
          name: passwordModalData.name,
          newPassword: passwordModalData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification({
        type: 'success',
        message: '✅ Password updated & email sent to employee!'
      });

      handleClosePasswordModal();
    } catch (error) {
      console.error('Reset password error:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to reset password'
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <header className="mb-8">
            <h1 className={`text-4xl font-black mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Employee Management
            </h1>
            <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
              Manage your team members
            </p>
          </header>

        {/* Existing Employees Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">All Employees ({employees.length})</h2>
              <p className="text-sm text-slate-400 mt-1">Manage your team members</p>
            </div>
         
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block w-8 h-8 border-4 border-[#1f36ff] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 mt-4">Loading employees...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500">No employees found</p>
              <p className="text-xs text-slate-600 mt-2">Click "Add Employee" to create your first employee</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Join Date</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.uid} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                      <td className="py-4 px-4">
                        {editingEmployee === employee.uid ? (
                          <input
                            type="text"
                            name="displayName"
                            value={editFormData.displayName}
                            onChange={handleEditChange}
                            className="bg-black/30 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1f36ff]"
                            placeholder="Full Name"
                          />
                        ) : (
                          <div>
                            <p className="font-semibold text-white">{employee.displayName || 'N/A'}</p>
                            <p className="text-xs text-slate-500">{employee.uid}</p>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {editingEmployee === employee.uid ? (
                          <div className="space-y-2">
                            <p className="text-sm text-slate-400">{employee.email}</p>
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={editFormData.phoneNumber}
                              onChange={handleEditChange}
                              className="bg-black/30 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1f36ff] w-full"
                              placeholder="Phone Number"
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-white">{employee.email}</p>
                            <p className="text-xs text-slate-400 mt-1">{employee.phoneNumber || 'No phone'}</p>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(employee.uid, employee.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 transition ${
                            employee.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {employee.isActive ? (
                            <>
                              <FiToggleRight className="text-lg" />
                              Active
                            </>
                          ) : (
                            <>
                              <FiToggleLeft className="text-lg" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-400">
                          {(() => {
                            if (!employee.createdAt) return 'N/A';
                            
                            // Handle Firestore Timestamp object
                            if (employee.createdAt?.toDate && typeof employee.createdAt.toDate === 'function') {
                              return new Date(employee.createdAt.toDate()).toLocaleDateString();
                            }
                            
                            // Handle ISO string or Date object
                            const date = new Date(employee.createdAt);
                            if (!isNaN(date.getTime())) {
                              return date.toLocaleDateString();
                            }
                            
                            return 'N/A';
                          })()}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        {editingEmployee === employee.uid ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateEmployee(employee.uid)}
                              className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition"
                              title="Save Changes"
                            >
                              <FiCheck />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 transition"
                              title="Cancel"
                            >
                              <FiX />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(employee)}
                              className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
                              title="Edit Employee"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleOpenPasswordModal(employee)}
                              className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition"
                              title="Reset Password"
                            >
                              <FiKey />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee.uid, employee.displayName)}
                              className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition"
                              title="Delete Employee"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        )}
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

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl my-8">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1f36ff]/20 flex items-center justify-center">
                    <FiUserPlus className="text-[#1f36ff] text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Add New Employee</h2>
                    <p className="text-sm text-slate-400">Credentials will be sent via email</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition"
                  title="Close"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    <FiUser className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full bg-black/30 border border-slate-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#1f36ff] transition"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    <FiMail className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-black/30 border border-slate-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#1f36ff] transition"
                    placeholder="employee@fitfix.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    <FiLock className="inline mr-2" />
                    Temporary Password
                  </label>
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-black/30 border border-slate-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#1f36ff] transition"
                    placeholder="TempPass123"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">Employee will be asked to change this on first login</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    <FiPhone className="inline mr-2" />
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full bg-black/30 border border-slate-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#1f36ff] transition"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-[#1f36ff] to-[#15b5ff] text-white py-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-blue-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating Account & Sending Email...' : 'Create Employee Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddEmployeeModal(false)}
                    disabled={isSubmitting}
                    className="px-6 bg-slate-800 text-slate-300 py-4 rounded-2xl font-bold hover:bg-slate-700 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <FiKey className="text-purple-400 text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Reset Password</h3>
                <p className="text-sm text-slate-400">Update employee login credentials</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-black/30 border border-slate-700 rounded-2xl p-4 mb-4">
                <p className="text-sm text-slate-400">Employee</p>
                <p className="font-semibold text-white mt-1">{passwordModalData.name}</p>
                <p className="text-sm text-slate-500 mt-1">{passwordModalData.email}</p>
              </div>

              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <FiLock className="inline mr-2" />
                New Password
              </label>
              <input
                type="text"
                value={passwordModalData.newPassword}
                onChange={handlePasswordChange}
                className="w-full bg-black/30 border border-slate-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 transition"
                placeholder="Enter new password (min 6 characters)"
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-2">
                ℹ️ Employee will receive an email with the new password
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleResetPassword}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update & Send Email'}
              </button>
              <button
                onClick={handleClosePasswordModal}
                disabled={isSubmitting}
                className="px-6 bg-slate-800 text-slate-300 py-3 rounded-2xl font-bold hover:bg-slate-700 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;

