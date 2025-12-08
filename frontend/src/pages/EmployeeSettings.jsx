import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiCamera, FiEdit2, FiTrash2, FiSave, FiX, FiArrowLeft } from 'react-icons/fi';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../context/ThemeContext';
import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeeSettings = () => {
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Email change
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  
  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Update states
  const [updating, setUpdating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.role !== 'employee') {
      showNotification({
        type: 'error',
        message: 'Access denied. Employee access required.'
      });
      navigate('/login', { replace: true });
      return;
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification({ type: 'error', message: 'Not authenticated. Please login again.' });
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        setDisplayName(userData.displayName || '');
        setEmail(userData.email || '');
        setBio(userData.bio || '');
        setPhotoURL(userData.photoURL || '');
        setPhotoPreview(userData.photoURL || '');
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification({ type: 'error', message: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification({ type: 'error', message: 'Image size must be less than 5MB' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to a temporary location or convert to base64
    // For now, we'll use base64 (in production, upload to Firebase Storage)
    handlePhotoUpload(file);
  };

  const handlePhotoUpload = async (file) => {
    setUploadingPhoto(true);
    try {
      // Convert to base64 for now (in production, upload to Firebase Storage)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        
        // Update profile with photo URL
        const token = localStorage.getItem('token');
        await axios.patch(
          'http://localhost:3000/api/user/profile',
          { photoURL: base64String },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setPhotoURL(base64String);
        showNotification({ type: 'success', message: 'Profile photo updated successfully' });
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...storedUser, photoURL: base64String };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Dispatch event to update sidebar
        window.dispatchEvent(new Event('profileUpdated'));
        loadProfile(); // Reload to get updated data
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload photo:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to upload photo'
      });
      setPhotoPreview(photoURL); // Revert preview
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!displayName.trim()) {
      showNotification({ type: 'error', message: 'Display name cannot be empty' });
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'http://localhost:3000/api/user/profile',
        { displayName: displayName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification({ type: 'success', message: 'Display name updated successfully' });
        setUser(response.data.data);
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...storedUser, displayName: displayName.trim() };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Dispatch event to update sidebar
        window.dispatchEvent(new Event('profileUpdated'));
      }
    } catch (error) {
      console.error('Failed to update display name:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update display name'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateBio = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'http://localhost:3000/api/user/profile',
        { bio: bio.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification({ type: 'success', message: 'Bio updated successfully' });
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to update bio:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update bio'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotification({ type: 'error', message: 'All password fields are required' });
      return;
    }

    if (newPassword.length < 6) {
      showNotification({ type: 'error', message: 'New password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/user/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification({ type: 'success', message: 'Password changed successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to change password'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    
    if (!newEmail || !emailPassword) {
      showNotification({ type: 'error', message: 'Email and password are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      showNotification({ type: 'error', message: 'Invalid email format' });
      return;
    }

    setEmailLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/user/change-email',
        { newEmail: newEmail.trim(), password: emailPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification({ type: 'success', message: response.data.message || 'Email changed successfully' });
        setNewEmail('');
        setEmailPassword('');
        setShowEmailForm(false);
        loadProfile(); // Reload profile to get new email
      }
    } catch (error) {
      console.error('Failed to change email:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to change email'
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showNotification({ type: 'error', message: 'Password is required to delete account' });
      return;
    }

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        'http://localhost:3000/api/user/account',
        {
          data: { password: deletePassword },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        showNotification({ type: 'success', message: 'Account deleted successfully' });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete account'
      });
      setDeletePassword('');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex transition-colors ${
        isDarkMode ? 'bg-[#05050c] text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <EmployeeSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f36ff] mx-auto mb-4"></div>
            <p className="text-gray-500">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors ${
      isDarkMode ? 'bg-[#05050c] text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <EmployeeSidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-lg transition ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-4xl font-black mb-2">Settings</h1>
                <p className="text-slate-400">Manage your account settings and preferences</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Profile Photo Section */}
          <div className={`mb-6 rounded-2xl p-6 shadow-lg ${
            isDarkMode ? 'bg-[#0a0a15] border border-slate-800' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#1f36ff] to-[#15b5ff] flex items-center justify-center text-white text-3xl font-bold">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (displayName || email || 'U')[0].toUpperCase()
                  )}
                </div>
                <label
                  htmlFor="photo-upload"
                  className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
                    isDarkMode ? 'bg-[#1f36ff]' : 'bg-[#1f36ff]'
                  } text-white shadow-lg`}
                  title="Change photo"
                >
                  {uploadingPhoto ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiCamera className="w-4 h-4" />
                  )}
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">Profile Photo</h2>
                <p className="text-sm text-gray-500">Upload a new profile picture (max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Display Name Section */}
          <div className={`mb-6 rounded-2xl p-6 shadow-lg ${
            isDarkMode ? 'bg-[#0a0a15] border border-slate-800' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <FiUser className="w-5 h-5 text-[#1f36ff]" />
              <h2 className="text-xl font-bold">Full Name</h2>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your full name"
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#1f36ff]`}
              />
              <button
                onClick={handleUpdateDisplayName}
                disabled={updating || !displayName.trim() || displayName === user?.displayName}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  updating || !displayName.trim() || displayName === user?.displayName
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#1f36ff] text-white hover:bg-[#1b2ed1]'
                }`}
              >
                {updating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Email Section */}
          <div className={`mb-6 rounded-2xl p-6 shadow-lg ${
            isDarkMode ? 'bg-[#0a0a15] border border-slate-800' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FiMail className="w-5 h-5 text-[#1f36ff]" />
                <div>
                  <h2 className="text-xl font-bold">Email Address</h2>
                  <p className="text-sm text-gray-500 mt-1">Current: {email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailForm(!showEmailForm)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {showEmailForm ? <FiX className="w-5 h-5" /> : <FiEdit2 className="w-5 h-5" />}
              </button>
            </div>
            
            {showEmailForm && (
              <form onSubmit={handleChangeEmail} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">New Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email address"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#1f36ff]`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    placeholder="Enter your password to confirm"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#1f36ff]`}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className={`px-6 py-3 rounded-lg font-semibold transition ${
                      emailLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#1f36ff] text-white hover:bg-[#1b2ed1]'
                    }`}
                  >
                    {emailLoading ? 'Updating...' : 'Update Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailForm(false);
                      setNewEmail('');
                      setEmailPassword('');
                    }}
                    className="px-6 py-3 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Password Section */}
          <div className={`mb-6 rounded-2xl p-6 shadow-lg ${
            isDarkMode ? 'bg-[#0a0a15] border border-slate-800' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FiLock className="w-5 h-5 text-[#1f36ff]" />
                <h2 className="text-xl font-bold">Password</h2>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {showPasswordForm ? <FiX className="w-5 h-5" /> : <FiEdit2 className="w-5 h-5" />}
              </button>
            </div>
            
            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#1f36ff]`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#1f36ff]`}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#1f36ff]`}
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className={`px-6 py-3 rounded-lg font-semibold transition ${
                      passwordLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#1f36ff] text-white hover:bg-[#1b2ed1]'
                    }`}
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="px-6 py-3 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bio Section */}
          <div className={`mb-6 rounded-2xl p-6 shadow-lg ${
            isDarkMode ? 'bg-[#0a0a15] border border-slate-800' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <FiEdit2 className="w-5 h-5 text-[#1f36ff]" />
              <h2 className="text-xl font-bold">Bio / About Me</h2>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#1f36ff] resize-none`}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleUpdateBio}
                disabled={updating || bio === user?.bio}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  updating || bio === user?.bio
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#1f36ff] text-white hover:bg-[#1b2ed1]'
                }`}
              >
                {updating ? 'Saving...' : 'Save Bio'}
              </button>
            </div>
          </div>

          {/* Delete Account Section */}
          <div className={`mb-6 rounded-2xl p-6 shadow-lg border-2 ${
            isDarkMode 
              ? 'bg-[#0a0a15] border-red-900/50' 
              : 'bg-white border-red-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <FiTrash2 className="w-5 h-5 text-red-500" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
                <p className="text-sm text-gray-500 mt-1">Permanently delete your account and all associated data</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl ${
            isDarkMode ? 'bg-[#0a0a15] border border-slate-800' : 'bg-white border border-gray-200'
          }`}>
            <h3 className="text-2xl font-bold text-red-600 mb-2">Delete Account</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This action cannot be undone. This will permanently delete your account and all associated data.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Enter your password to confirm</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deletePassword}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                  deleteLoading || !deletePassword
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
                className="px-6 py-3 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default EmployeeSettings;

