import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, 
  FiUserPlus, 
  FiEdit2, 
  FiTrash2, 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp,
  FiX,
  FiCheck,
  FiArrowUp,
  FiArrowDown,
  FiCoffee,
  FiPlus
} from 'react-icons/fi';
import axios from 'axios';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../context/ThemeContext';
import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeeMyUsers = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [viewingMealPlan, setViewingMealPlan] = useState(null);
  const [editingMealPlan, setEditingMealPlan] = useState(null);
  const [deletingMealPlan, setDeletingMealPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    planType: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        'http://localhost:3000/api/employee/users',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setUsers(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to load users'
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, showNotification]);

  // Initial load and real-time updates
  useEffect(() => {
    fetchUsers();

    // Listen for user creation events
    const handleUserCreated = () => {
      fetchUsers();
    };

    window.addEventListener('userCreated', handleUserCreated);
    
    // Poll for updates every 30 seconds (fallback if events don't work)
    const pollInterval = setInterval(fetchUsers, 30000);

    return () => {
      window.removeEventListener('userCreated', handleUserCreated);
      clearInterval(pollInterval);
    };
  }, [fetchUsers]);

  // Filter and sort users
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(term) ||
        user.realEmail?.toLowerCase().includes(term) ||
        user.loginEmail?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle dates
      if (sortField === 'createdAt' || sortField === 'lastLogin') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      // Handle strings
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, sortField, sortDirection]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.displayName.trim()) {
      errors.displayName = 'Full Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.gender) {
      errors.gender = 'Gender is required';
    }
    
    if (!formData.age.trim()) {
      errors.age = 'Age is required';
    } else if (isNaN(formData.age) || parseInt(formData.age) <= 0 || parseInt(formData.age) > 120) {
      errors.age = 'Please enter a valid age';
    }
    
    if (!formData.height.trim()) {
      errors.height = 'Height is required';
    } else if (isNaN(formData.height) || parseFloat(formData.height) <= 0) {
      errors.height = 'Please enter a valid height';
    }
    
    if (!formData.weight.trim()) {
      errors.weight = 'Weight is required';
    } else if (isNaN(formData.weight) || parseFloat(formData.weight) <= 0) {
      errors.weight = 'Please enter a valid weight';
    }
    
    if (!formData.planType) {
      errors.planType = 'Plan Type is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission (create user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification({
        type: 'error',
        message: 'Please fill in all required fields correctly'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:3000/api/employee/users',
        {
          email: formData.email,
          displayName: formData.displayName,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          gender: formData.gender,
          age: parseInt(formData.age),
          planType: formData.planType,
          role: 'user'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        showNotification({
          type: 'success',
          message: `User "${formData.displayName}" created successfully! Welcome email sent with login credentials.`
        });

        // Add new user to list immediately for instant feedback
        const newUser = response.data.data;
        if (newUser) {
          setUsers(prevUsers => [newUser, ...prevUsers]);
        }

        // Reset form
        setFormData({
          displayName: '',
          email: '',
          gender: '',
          age: '',
          height: '',
          weight: '',
          planType: ''
        });
        setFormErrors({});
        setShowAddForm(false);

        // Refresh users list to sync with server
        fetchUsers();
        
        // Trigger event for other components
        window.dispatchEvent(new CustomEvent('userCreated'));
      } else {
        throw new Error(response.data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to create user. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit user
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      displayName: user.displayName || '',
      email: user.realEmail || '',
      gender: user.gender || '',
      age: user.age?.toString() || '',
      height: user.height?.toString() || '',
      weight: user.weight?.toString() || '',
      planType: user.planType || ''
    });
    setFormErrors({});
  };

  // Handle update user
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification({
        type: 'error',
        message: 'Please fill in all required fields correctly'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `http://localhost:3000/api/employee/users/${editingUser.uid}`,
        {
          displayName: formData.displayName,
          realEmail: formData.email,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          gender: formData.gender,
          age: parseInt(formData.age),
          planType: formData.planType
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        showNotification({
          type: 'success',
          message: `User "${formData.displayName}" updated successfully!`
        });

        setEditingUser(null);
        setFormData({
          displayName: '',
          email: '',
          gender: '',
          age: '',
          height: '',
          weight: '',
          planType: ''
        });
        setFormErrors({});

        // Refresh users list
        fetchUsers();
      } else {
        throw new Error(response.data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to update user. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view meal plan
  const handleViewMealPlan = (user) => {
    // Use mealPlan from user data if available, otherwise set to null
    setViewingMealPlan({
      ...user,
      mealPlan: user.mealPlan || null
    });
  };

  // Handle edit meal plan
  const handleEditMealPlan = (user) => {
    if (!user.mealPlan) return;
    setEditingMealPlan({
      ...user,
      mealPlan: JSON.parse(JSON.stringify(user.mealPlan)) // Deep copy
    });
    setViewingMealPlan(null);
  };

  // Handle delete meal plan
  const handleDeleteMealPlan = async () => {
    if (!deletingMealPlan) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.delete(
        `http://localhost:3000/api/mealPlans/${deletingMealPlan.uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        showNotification({
          type: 'success',
          message: 'Meal plan deleted successfully'
        });
        setDeletingMealPlan(null);
        fetchUsers();
      } else {
        throw new Error(response.data.message || 'Failed to delete meal plan');
      }
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to delete meal plan'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update meal plan
  const handleUpdateMealPlan = async (updatedMealPlan) => {
    if (!editingMealPlan) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `http://localhost:3000/api/mealPlans/${editingMealPlan.uid}`,
        { mealPlan: updatedMealPlan },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        showNotification({
          type: 'success',
          message: 'Meal plan updated successfully'
        });
        setEditingMealPlan(null);
        fetchUsers();
      } else {
        throw new Error(response.data.message || 'Failed to update meal plan');
      }
    } catch (error) {
      console.error('Error updating meal plan:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to update meal plan'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete user
  const handleDelete = async () => {
    if (!deletingUser) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.delete(
        `http://localhost:3000/api/employee/users/${deletingUser.uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        showNotification({
          type: 'success',
          message: `User "${deletingUser.displayName}" deleted successfully!`
        });

        setDeletingUser(null);
        fetchUsers();
      } else {
        throw new Error(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to delete user. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Never';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />;
  };

  return (
    <div className={`min-h-screen flex transition-colors ${
      isDarkMode 
        ? 'bg-[#05050c] text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Sidebar */}
      <EmployeeSidebar />

      {/* Main content */}
      <main className="flex-1 px-6 py-8 overflow-x-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FiUsers className="text-4xl text-[#1f36ff]" />
              My Users
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Manage your assigned clients
            </p>
          </div>
          
          {/* Total Users Count Card */}
          <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-r from-[#1f36ff]/20 to-[#15b5ff]/20 border border-[#1f36ff]/30' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDarkMode ? 'bg-[#1f36ff]/30' : 'bg-blue-100'
            }`}>
              <FiUsers className="text-2xl text-[#1f36ff]" />
            </div>
            <div>
              <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {users.length}
              </p>
              <p className={`text-xs font-medium ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                Total Users
              </p>
            </div>
          </div>
        </div>

        {/* Add User Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingUser(null);
              setFormData({
                displayName: '',
                email: '',
                gender: '',
                age: '',
                height: '',
                weight: '',
                planType: ''
              });
              setFormErrors({});
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              showAddForm
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[#1f36ff] hover:bg-[#1b2ed1] text-white hover:shadow-lg hover:shadow-[#1f36ff]/40 hover:-translate-y-0.5 active:scale-[0.98]'
            }`}
          >
            <FiUserPlus className="text-lg" />
            {showAddForm ? 'Cancel' : 'Add New User'}
            {showAddForm ? <FiX className="ml-1" /> : <FiChevronDown className="ml-1" />}
          </button>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <div className={`mb-6 rounded-2xl p-6 border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#111324] border-white/5' 
              : 'bg-white border-gray-200 shadow-lg'
          }`}>
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border transition-all ${
                      formErrors.displayName
                        ? 'border-red-500'
                        : isDarkMode
                          ? 'border-white/10 bg-white/5 text-white'
                          : 'border-gray-300 bg-white'
                    }`}
                    placeholder="John Doe"
                  />
                  {formErrors.displayName && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.displayName}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Real Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border transition-all ${
                      formErrors.email
                        ? 'border-red-500'
                        : isDarkMode
                          ? 'border-white/10 bg-white/5 text-white'
                          : 'border-gray-300 bg-white'
                    }`}
                    placeholder="user@example.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border transition-all ${
                      formErrors.gender
                        ? 'border-red-500'
                        : isDarkMode
                          ? 'border-white/10 bg-white/5 text-white'
                          : 'border-gray-300 bg-white'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {formErrors.gender && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.gender}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Age <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="1"
                    max="120"
                    className={`w-full px-4 py-2 rounded-lg border transition-all ${
                      formErrors.age
                        ? 'border-red-500'
                        : isDarkMode
                          ? 'border-white/10 bg-white/5 text-white'
                          : 'border-gray-300 bg-white'
                    }`}
                    placeholder="25"
                  />
                  {formErrors.age && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.age}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Height (cm) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={`w-full px-4 py-2 rounded-lg border transition-all ${
                      formErrors.height
                        ? 'border-red-500'
                        : isDarkMode
                          ? 'border-white/10 bg-white/5 text-white'
                          : 'border-gray-300 bg-white'
                    }`}
                    placeholder="175"
                  />
                  {formErrors.height && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.height}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Weight (kg) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={`w-full px-4 py-2 rounded-lg border transition-all ${
                      formErrors.weight
                        ? 'border-red-500'
                        : isDarkMode
                          ? 'border-white/10 bg-white/5 text-white'
                          : 'border-gray-300 bg-white'
                    }`}
                    placeholder="70"
                  />
                  {formErrors.weight && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.weight}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Plan Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="planType"
                    value={formData.planType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border transition-all ${
                      formErrors.planType
                        ? 'border-red-500'
                        : isDarkMode
                          ? 'border-white/10 bg-white/5 text-white'
                          : 'border-gray-300 bg-white'
                    }`}
                  >
                    <option value="">Select Plan Type</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain / Weight Gain">Muscle Gain / Weight Gain</option>
                    <option value="Maintenance / Fitness / Healthy Lifestyle">Maintenance / Fitness / Healthy Lifestyle</option>
                  </select>
                  {formErrors.planType && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.planType}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      displayName: '',
                      email: '',
                      gender: '',
                      age: '',
                      height: '',
                      weight: '',
                      planType: ''
                    });
                    setFormErrors({});
                  }}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isDarkMode
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isSubmitting
                      ? 'bg-[#1f36ff]/60 cursor-not-allowed text-white/60'
                      : 'bg-[#1f36ff] hover:bg-[#1b2ed1] text-white hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className={`mb-6 rounded-xl p-4 ${
          isDarkMode ? 'bg-[#111324] border border-white/5' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? 'text-white/40' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'border-white/10 bg-white/5 text-white placeholder:text-white/40'
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f36ff]"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={`text-center py-12 rounded-xl ${
            isDarkMode ? 'bg-[#111324] border border-white/5' : 'bg-white border border-gray-200'
          }`}>
            <FiUsers className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-lg font-semibold text-gray-400">
              {searchTerm ? 'No users found matching your search' : 'No users yet'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {searchTerm ? 'Try a different search term' : 'Click "Add New User" to get started'}
            </p>
          </div>
        ) : (
          <div className={`rounded-xl overflow-hidden border ${
            isDarkMode ? 'bg-[#111324] border-white/5' : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-white/5' : 'bg-gray-50'}>
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('displayName')}
                    >
                      Full Name {getSortIcon('displayName')}
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('loginEmail')}
                    >
                      Login Email {getSortIcon('loginEmail')}
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('realEmail')}
                    >
                      Real Email {getSortIcon('realEmail')}
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('age')}
                    >
                      Age {getSortIcon('age')}
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('gender')}
                    >
                      Gender {getSortIcon('gender')}
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('planType')}
                    >
                      Plan Type {getSortIcon('planType')}
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('createdAt')}
                    >
                      Created At {getSortIcon('createdAt')}
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('lastLogin')}
                    >
                      Last Login {getSortIcon('lastLogin')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.uid}
                      className={`hover:bg-white/5 transition-colors ${
                        isDarkMode ? '' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {user.displayName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {user.loginEmail || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.realEmail || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.age || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                        {user.gender || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.planType || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewMealPlan(user)}
                            className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                            title="View meal plan"
                          >
                            <FiCoffee />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                            title="Edit user"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                            title="Delete user"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-[#111324] border border-white/5' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Edit User</h2>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setFormData({
                      displayName: '',
                      email: '',
                      gender: '',
                      age: '',
                      height: '',
                      weight: '',
                      planType: ''
                    });
                    setFormErrors({});
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        formErrors.displayName
                          ? 'border-red-500'
                          : isDarkMode
                            ? 'border-white/10 bg-white/5 text-white'
                            : 'border-gray-300 bg-white'
                      }`}
                    />
                    {formErrors.displayName && (
                      <p className="mt-1 text-sm text-red-400">{formErrors.displayName}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      Real Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        formErrors.email
                          ? 'border-red-500'
                          : isDarkMode
                            ? 'border-white/10 bg-white/5 text-white'
                            : 'border-gray-300 bg-white'
                      }`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      Gender <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        formErrors.gender
                          ? 'border-red-500'
                          : isDarkMode
                            ? 'border-white/10 bg-white/5 text-white'
                            : 'border-gray-300 bg-white'
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {formErrors.gender && (
                      <p className="mt-1 text-sm text-red-400">{formErrors.gender}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      Age <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      min="1"
                      max="120"
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        formErrors.age
                          ? 'border-red-500'
                          : isDarkMode
                            ? 'border-white/10 bg-white/5 text-white'
                            : 'border-gray-300 bg-white'
                      }`}
                    />
                    {formErrors.age && (
                      <p className="mt-1 text-sm text-red-400">{formErrors.age}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      Height (cm) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        formErrors.height
                          ? 'border-red-500'
                          : isDarkMode
                            ? 'border-white/10 bg-white/5 text-white'
                            : 'border-gray-300 bg-white'
                      }`}
                    />
                    {formErrors.height && (
                      <p className="mt-1 text-sm text-red-400">{formErrors.height}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      Weight (kg) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        formErrors.weight
                          ? 'border-red-500'
                          : isDarkMode
                            ? 'border-white/10 bg-white/5 text-white'
                            : 'border-gray-300 bg-white'
                      }`}
                    />
                    {formErrors.weight && (
                      <p className="mt-1 text-sm text-red-400">{formErrors.weight}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      Plan Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="planType"
                      value={formData.planType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        formErrors.planType
                          ? 'border-red-500'
                          : isDarkMode
                            ? 'border-white/10 bg-white/5 text-white'
                            : 'border-gray-300 bg-white'
                      }`}
                    >
                      <option value="">Select Plan Type</option>
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="Muscle Gain / Weight Gain">Muscle Gain / Weight Gain</option>
                      <option value="Maintenance / Fitness / Healthy Lifestyle">Maintenance / Fitness / Healthy Lifestyle</option>
                    </select>
                    {formErrors.planType && (
                      <p className="mt-1 text-sm text-red-400">{formErrors.planType}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUser(null);
                      setFormData({
                        displayName: '',
                        email: '',
                        gender: '',
                        age: '',
                        height: '',
                        weight: '',
                        planType: ''
                      });
                      setFormErrors({});
                    }}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      isSubmitting
                        ? 'bg-[#1f36ff]/60 cursor-not-allowed text-white/60'
                        : 'bg-[#1f36ff] hover:bg-[#1b2ed1] text-white hover:shadow-lg'
                    }`}
                  >
                    {isSubmitting ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Meal Plan Confirmation Modal */}
        {deletingMealPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl p-6 max-w-md w-full ${
              isDarkMode ? 'bg-[#111324] border border-white/5' : 'bg-white border border-gray-200'
            }`}>
              <h2 className="text-xl font-bold mb-4">Delete Meal Plan</h2>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete the meal plan for <strong>{deletingMealPlan.displayName}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingMealPlan(null)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isDarkMode
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMealPlan}
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isSubmitting
                      ? 'bg-red-500/60 cursor-not-allowed text-white/60'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Meal Plan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Meal Plan Modal */}
        {editingMealPlan && editingMealPlan.mealPlan && (
          <EditMealPlanModalComponent
            user={editingMealPlan}
            mealPlan={editingMealPlan.mealPlan}
            onSave={handleUpdateMealPlan}
            onCancel={() => setEditingMealPlan(null)}
            isDarkMode={isDarkMode}
            isSubmitting={isSubmitting}
            showNotification={showNotification}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl p-6 max-w-md w-full ${
              isDarkMode ? 'bg-[#111324] border border-white/5' : 'bg-white border border-gray-200'
            }`}>
              <h2 className="text-xl font-bold mb-4">Delete User</h2>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete <strong>{deletingUser.displayName}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingUser(null)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isDarkMode
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isSubmitting
                      ? 'bg-red-500/60 cursor-not-allowed text-white/60'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Meal Plan Modal */}
        {viewingMealPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-[#111324] border border-white/5' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Meal Plan - {viewingMealPlan.displayName || 'Unknown User'}
                </h2>
                <button
                  onClick={() => setViewingMealPlan(null)}
                  className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  <FiX size={24} />
                </button>
              </div>

              {viewingMealPlan.mealPlan ? (
                <div className="space-y-6">
                  {/* Goal Badge */}
                  {(() => {
                    const goal = viewingMealPlan.mealPlan.goal || 
                      (viewingMealPlan.planType === 'Weight Loss' ? 'Lose Weight' :
                       viewingMealPlan.planType === 'Muscle Gain / Weight Gain' ? 'Gain Weight' :
                       'Maintain Weight');
                    const getBadgeStyles = (goalType) => {
                      const goalLower = goalType.toLowerCase();
                      if (goalLower.includes('lose')) {
                        return isDarkMode
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-red-100 text-red-700 border-red-300';
                      } else if (goalLower.includes('gain')) {
                        return isDarkMode
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-green-100 text-green-700 border-green-300';
                      } else {
                        return isDarkMode
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-blue-100 text-blue-700 border-blue-300';
                      }
                    };
                    return (
                      <div className="mb-4">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full border font-semibold text-sm ${getBadgeStyles(goal)}`}>
                          Goal: {goal}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Stats Grid */}
                  <div className={`grid grid-cols-5 gap-4 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Total Calories</div>
                      <div className="text-xl font-bold">{viewingMealPlan.mealPlan.totalCalories || viewingMealPlan.mealPlan.calories || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">BMI</div>
                      <div className="text-xl font-bold">{viewingMealPlan.mealPlan.bmi || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">BMR</div>
                      <div className="text-xl font-bold">{viewingMealPlan.mealPlan.bmr || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">TDEE</div>
                      <div className="text-xl font-bold">{viewingMealPlan.mealPlan.tdee || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Portion Scale</div>
                      <div className="text-xl font-bold">{viewingMealPlan.mealPlan.portionScale || 'N/A'}x</div>
                    </div>
                  </div>

                  {/* Created At */}
                  {viewingMealPlan.mealPlan.createdAt && (
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Created: {formatDate(viewingMealPlan.mealPlan.createdAt)}
                    </div>
                  )}

                  {/* Breakfast */}
                  {viewingMealPlan.mealPlan.breakfast && (
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <h3 className="text-lg font-semibold mb-2">🍳 Breakfast: {viewingMealPlan.mealPlan.breakfast.title}</h3>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        {viewingMealPlan.mealPlan.breakfast.items.map((item, i) => {
                          const itemName = typeof item === 'string' ? item : (item.name || '');
                          const itemGrams = typeof item === 'object' && item.grams ? item.grams : null;
                          const itemBaseGrams = typeof item === 'object' && item.baseGrams ? item.baseGrams : null;
                          return (
                            <li key={i}>
                              {itemName}
                              {itemGrams && `: ${itemGrams}g`}
                              {itemBaseGrams && ` (base: ${itemBaseGrams}g)`}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Lunch */}
                  {viewingMealPlan.mealPlan.lunch && (
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <h3 className="text-lg font-semibold mb-2">🍽️ Lunch: {viewingMealPlan.mealPlan.lunch.title}</h3>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        {viewingMealPlan.mealPlan.lunch.items.map((item, i) => {
                          const itemName = typeof item === 'string' ? item : (item.name || '');
                          const itemGrams = typeof item === 'object' && item.grams ? item.grams : null;
                          const itemBaseGrams = typeof item === 'object' && item.baseGrams ? item.baseGrams : null;
                          return (
                            <li key={i}>
                              {itemName}
                              {itemGrams && `: ${itemGrams}g`}
                              {itemBaseGrams && ` (base: ${itemBaseGrams}g)`}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Dinner */}
                  {viewingMealPlan.mealPlan.dinner && (
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <h3 className="text-lg font-semibold mb-2">🍲 Dinner: {viewingMealPlan.mealPlan.dinner.title}</h3>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        {viewingMealPlan.mealPlan.dinner.items.map((item, i) => {
                          const itemName = typeof item === 'string' ? item : (item.name || '');
                          const itemGrams = typeof item === 'object' && item.grams ? item.grams : null;
                          const itemBaseGrams = typeof item === 'object' && item.baseGrams ? item.baseGrams : null;
                          return (
                            <li key={i}>
                              {itemName}
                              {itemGrams && `: ${itemGrams}g`}
                              {itemBaseGrams && ` (base: ${itemBaseGrams}g)`}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Snacks */}
                  {viewingMealPlan.mealPlan.snacks && viewingMealPlan.mealPlan.snacks.length > 0 && (
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <h3 className="text-lg font-semibold mb-3">🍎 Snacks</h3>
                      {viewingMealPlan.mealPlan.snacks.map((snack, i) => (
                        <div key={i} className="mb-4 last:mb-0">
                          <h4 className="font-medium mb-2">{snack.title}</h4>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            {snack.items.map((item, j) => {
                              const itemName = typeof item === 'string' ? item : (item.name || '');
                              const itemGrams = typeof item === 'object' && item.grams ? item.grams : null;
                              const itemBaseGrams = typeof item === 'object' && item.baseGrams ? item.baseGrams : null;
                              return (
                                <li key={j}>
                                  {itemName}
                                  {itemGrams && `: ${itemGrams}g`}
                                  {itemBaseGrams && ` (base: ${itemBaseGrams}g)`}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No meal plan assigned to this user yet.
                  </p>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Use the "Add Meal Plan" page to create and assign a meal plan.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Edit Meal Plan Modal Component
const EditMealPlanModalComponent = ({ user, mealPlan, onSave, onCancel, isDarkMode, isSubmitting, showNotification }) => {
  const [editedMealPlan, setEditedMealPlan] = useState(JSON.parse(JSON.stringify(mealPlan)));

  // Handle item name change
  const handleItemNameChange = (mealType, itemIndex, value) => {
    setEditedMealPlan(prev => {
      const newPlan = { ...prev };
      if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') {
        const items = [...newPlan[mealType].items];
        items[itemIndex] = { ...items[itemIndex], name: value };
        newPlan[mealType] = { ...newPlan[mealType], items };
      } else if (mealType.startsWith('snack-')) {
        const snackIndex = parseInt(mealType.split('-')[1]);
        const snacks = [...newPlan.snacks];
        const items = [...snacks[snackIndex].items];
        items[itemIndex] = { ...items[itemIndex], name: value };
        snacks[snackIndex] = { ...snacks[snackIndex], items };
        newPlan.snacks = snacks;
      }
      return newPlan;
    });
  };

  // Handle item baseGrams change
  const handleItemBaseGramsChange = (mealType, itemIndex, value) => {
    setEditedMealPlan(prev => {
      const newPlan = { ...prev };
      const baseGrams = value === '' ? 0 : parseFloat(value) || 0;
      const portionScale = prev.portionScale || 1;
      const grams = Math.round(baseGrams * portionScale);
      
      if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') {
        const items = [...newPlan[mealType].items];
        items[itemIndex] = { ...items[itemIndex], baseGrams, grams };
        newPlan[mealType] = { ...newPlan[mealType], items };
      } else if (mealType.startsWith('snack-')) {
        const snackIndex = parseInt(mealType.split('-')[1]);
        const snacks = [...newPlan.snacks];
        const items = [...snacks[snackIndex].items];
        items[itemIndex] = { ...items[itemIndex], baseGrams, grams };
        snacks[snackIndex] = { ...snacks[snackIndex], items };
        newPlan.snacks = snacks;
      }
      return newPlan;
    });
  };

  // Handle meal title change
  const handleMealTitleChange = (mealType, value) => {
    setEditedMealPlan(prev => {
      const newPlan = { ...prev };
      if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') {
        newPlan[mealType] = { ...newPlan[mealType], title: value };
      } else if (mealType.startsWith('snack-')) {
        const snackIndex = parseInt(mealType.split('-')[1]);
        const snacks = [...newPlan.snacks];
        snacks[snackIndex] = { ...snacks[snackIndex], title: value };
        newPlan.snacks = snacks;
      }
      return newPlan;
    });
  };

  // Add item
  const addItem = (mealType) => {
    setEditedMealPlan(prev => {
      const newPlan = { ...prev };
      const portionScale = prev.portionScale || 1;
      if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') {
        newPlan[mealType] = {
          ...newPlan[mealType],
          items: [...newPlan[mealType].items, { name: '', baseGrams: 0, grams: 0 }]
        };
      } else if (mealType.startsWith('snack-')) {
        const snackIndex = parseInt(mealType.split('-')[1]);
        const snacks = [...newPlan.snacks];
        snacks[snackIndex] = {
          ...snacks[snackIndex],
          items: [...snacks[snackIndex].items, { name: '', baseGrams: 0, grams: 0 }]
        };
        newPlan.snacks = snacks;
      }
      return newPlan;
    });
  };

  // Remove item
  const removeItem = (mealType, itemIndex) => {
    setEditedMealPlan(prev => {
      const newPlan = { ...prev };
      if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') {
        newPlan[mealType] = {
          ...newPlan[mealType],
          items: newPlan[mealType].items.filter((_, i) => i !== itemIndex)
        };
      } else if (mealType.startsWith('snack-')) {
        const snackIndex = parseInt(mealType.split('-')[1]);
        const snacks = [...newPlan.snacks];
        snacks[snackIndex] = {
          ...snacks[snackIndex],
          items: snacks[snackIndex].items.filter((_, i) => i !== itemIndex)
        };
        newPlan.snacks = snacks;
      }
      return newPlan;
    });
  };

  // Handle save
  const handleSave = () => {
    // Recalculate all grams based on portionScale
    const portionScale = editedMealPlan.portionScale || 1;
    const updatedPlan = {
      ...editedMealPlan,
      breakfast: {
        ...editedMealPlan.breakfast,
        items: editedMealPlan.breakfast.items.map(item => ({
          ...item,
          grams: Math.round((item.baseGrams || 0) * portionScale)
        }))
      },
      lunch: {
        ...editedMealPlan.lunch,
        items: editedMealPlan.lunch.items.map(item => ({
          ...item,
          grams: Math.round((item.baseGrams || 0) * portionScale)
        }))
      },
      dinner: {
        ...editedMealPlan.dinner,
        items: editedMealPlan.dinner.items.map(item => ({
          ...item,
          grams: Math.round((item.baseGrams || 0) * portionScale)
        }))
      },
      snacks: editedMealPlan.snacks.map(snack => ({
        ...snack,
        items: snack.items.map(item => ({
          ...item,
          grams: Math.round((item.baseGrams || 0) * portionScale)
        }))
      }))
    };
    onSave(updatedPlan);
  };

  // Render meal section
  const renderMealSection = (mealType, label) => {
    const meal = editedMealPlan[mealType];
    return (
      <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-2">{label} Title</label>
          <input
            type="text"
            value={meal.title}
            onChange={(e) => handleMealTitleChange(mealType, e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Items</label>
          {meal.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex gap-2 mb-2">
              <input
                type="text"
                value={item.name || ''}
                onChange={(e) => handleItemNameChange(mealType, itemIndex, e.target.value)}
                placeholder="Item name"
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="number"
                value={item.baseGrams || ''}
                onChange={(e) => handleItemBaseGramsChange(mealType, itemIndex, e.target.value)}
                placeholder="Base grams"
                min="0"
                step="1"
                className={`w-32 px-3 py-2 rounded-lg border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <span className={`px-3 py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                → {item.grams || 0}g
              </span>
              {meal.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(mealType, itemIndex)}
                  className={`px-3 py-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-100 hover:bg-red-200 text-red-700'
                  }`}
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(mealType)}
            className={`mt-2 px-3 py-2 rounded-lg text-sm ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
            }`}
          >
            <FiPlus className="inline mr-1" /> Add Item
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-xl'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Edit Meal Plan - {user.displayName}</h2>
          <button
            onClick={onCancel}
            className={`p-2 rounded-lg hover:bg-white/10 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {renderMealSection('breakfast', 'Breakfast')}
          {renderMealSection('lunch', 'Lunch')}
          {renderMealSection('dinner', 'Dinner')}
          
          {/* Snacks */}
          <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h3 className="text-lg font-semibold mb-3">Snacks</h3>
            {editedMealPlan.snacks.map((snack, snackIndex) => (
              <div key={snackIndex} className="mb-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">Snack {snackIndex + 1} Title</label>
                  <input
                    type="text"
                    value={snack.title}
                    onChange={(e) => handleMealTitleChange(`snack-${snackIndex}`, e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Items</label>
                  {snack.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => handleItemNameChange(`snack-${snackIndex}`, itemIndex, e.target.value)}
                        placeholder="Item name"
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                      <input
                        type="number"
                        value={item.baseGrams || ''}
                        onChange={(e) => handleItemBaseGramsChange(`snack-${snackIndex}`, itemIndex, e.target.value)}
                        placeholder="Base grams"
                        min="0"
                        step="1"
                        className={`w-32 px-3 py-2 rounded-lg border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                      <span className={`px-3 py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        → {item.grams || 0}g
                      </span>
                      {snack.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(`snack-${snackIndex}`, itemIndex)}
                          className={`px-3 py-2 rounded-lg ${
                            isDarkMode
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-red-100 hover:bg-red-200 text-red-700'
                          }`}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addItem(`snack-${snackIndex}`)}
                    className={`mt-2 px-3 py-2 rounded-lg text-sm ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                    }`}
                  >
                    <FiPlus className="inline mr-1" /> Add Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={onCancel}
            className={`px-6 py-2 rounded-lg ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMyUsers;

