import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUserPlus } from 'react-icons/fi';
import axios from 'axios';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../context/ThemeContext';
import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeeAddUser = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    height: '',
    weight: '',
    gender: '',
    age: '',
    planType: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Set employee from localStorage immediately
    setEmployee(currentUser);
    
    if (currentUser.role !== 'employee') {
      showNotification({
        type: 'error',
        message: 'Access denied. Employee access required.'
      });
      navigate('/login', { replace: true });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
  }, [navigate, showNotification]);

  // Listen for user creation events to refresh dashboard
  useEffect(() => {
    const handleUserCreated = () => {
      // Optionally navigate to dashboard after user creation
      // Or just show a success message
    };

    window.addEventListener('userCreated', handleUserCreated);
    return () => {
      window.removeEventListener('userCreated', handleUserCreated);
    };
  }, []);

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
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
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
    
    if (!formData.gender) {
      errors.gender = 'Gender is required';
    }
    
    if (!formData.age.trim()) {
      errors.age = 'Age is required';
    } else if (isNaN(formData.age) || parseInt(formData.age) <= 0 || parseInt(formData.age) > 120) {
      errors.age = 'Please enter a valid age';
    }
    
    if (!formData.planType) {
      errors.planType = 'Plan Type is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
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
    setError(null);

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
          displayName: formData.fullName,
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
          message: `User "${formData.fullName}" created successfully! Welcome email sent with login credentials.`
        });

        // Reset form
        setFormData({
          fullName: '',
          email: '',
          height: '',
          weight: '',
          gender: '',
          age: '',
          planType: ''
        });
        setFormErrors({});

        // Trigger dashboard refresh event
        window.dispatchEvent(new CustomEvent('userCreated'));
      } else {
        throw new Error(response.data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create user. Please try again.';
      setError(errorMessage);
      showNotification({
        type: 'error',
        message: errorMessage
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
      {/* Sidebar */}
      <EmployeeSidebar />

      {/* Main content */}
      <main className="flex-1 px-10 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FiUserPlus className="text-4xl text-[#1f36ff]" />
              Add New User
            </h1>
            <p className="text-sm text-gray-400 mt-2">Create a new client account</p>
            {error && (
              <div className="mt-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-4xl">
          <section className={`rounded-[32px] p-8 border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#111324] border-white/5' 
              : 'bg-white border-gray-200 shadow-lg'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      formErrors.fullName
                        ? 'border-red-500/70 focus:ring-2 focus:ring-red-400 focus:border-red-400'
                        : isDarkMode
                          ? 'border-white/10 focus:ring-2 focus:ring-[#1f36ff] focus:border-[#1f36ff] bg-white/5 text-white'
                          : 'border-gray-300 focus:ring-2 focus:ring-[#1f36ff] focus:border-[#1f36ff] bg-white text-gray-900'
                    } focus:outline-none placeholder:text-gray-400`}
                    placeholder="John Doe"
                  />
                  {formErrors.fullName && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      formErrors.email
                        ? 'border-red-500/70 focus:ring-2 focus:ring-red-400 focus:border-red-400'
                        : isDarkMode
                          ? 'border-white/10 focus:ring-2 focus:ring-[#1f36ff] focus:border-[#1f36ff] bg-white/5 text-white'
                          : 'border-gray-300 focus:ring-2 focus:ring-[#1f36ff] focus:border-[#1f36ff] bg-white text-gray-900'
                    } focus:outline-none placeholder:text-gray-400`}
                    placeholder="user@example.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
                  )}
                </div>

                {/* Height */}
                <div>
                  <label htmlFor="height" className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Height (cm) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      formErrors.height
                        ? 'border-red-500/70 focus:ring-2 focus:ring-red-400 focus:border-red-400'
                        : isDarkMode
                          ? 'border-white/10 focus:ring-2 focus:ring-[#1f36ff] focus:border-[#1f36ff] bg-white/5 text-white'
                          : 'border-gray-300 focus:ring-2 focus:ring-[#1f36ff] focus:border-[#1f36ff] bg-white text-gray-900'
                    } focus:outline-none placeholder:text-gray-400`}
                    placeholder="175"
                  />
                  {formErrors.height && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.height}</p>
                  )}
                </div>

                {/* Weight */}
                <div>
                  <label htmlFor="weight" className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Weight (kg) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      formErrors.weight
                        ? 'border-red-500/70 focus:ring-2 focus:ring-red-400 focus:border-red-400'
                        : isDarkMode
                          ? 'border-white/10 focus:ring-2 focus:ring-[#1f36ff] focus:border-[#1f36ff] bg-white/5 text-white'
                          : 'border-gray-300 focus:ring-2 focus:ring-[#1f36ff] focus:border-[#1f36ff] bg-white text-gray-900'
                    } focus:outline-none placeholder:text-gray-400`}
                    placeholder="70"
                  />
                  {formErrors.weight && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.weight}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      formErrors.gender
                        ? 'border-red-500/70 focus:ring-2 focus:ring-red-400 focus:border-red-400'
                        : isDarkMode
                          ? 'border-white/10 focus:ring-2 focus:ring-[#1f36ff] focus:border-[#1f36ff] bg-white/5 text-white'
                          : 'border-gray-300 focus:ring-2 focus:ring-[#1f36ff] focus:border-[#1f36ff] bg-white text-gray-900'
                    } focus:outline-none`}
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

                {/* Age */}
                <div>
                  <label htmlFor="age" className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Age <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="1"
                    max="120"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      formErrors.age
                        ? 'border-red-500/70 focus:ring-2 focus:ring-red-400 focus:border-red-400'
                        : isDarkMode
                          ? 'border-white/10 focus:ring-2 focus:ring-[#1f36ff] focus:border-[#1f36ff] bg-white/5 text-white'
                          : 'border-gray-300 focus:ring-2 focus:ring-[#1f36ff] focus:border-[#1f36ff] bg-white text-gray-900'
                    } focus:outline-none placeholder:text-gray-400`}
                    placeholder="25"
                  />
                  {formErrors.age && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.age}</p>
                  )}
                </div>

                {/* Plan Type */}
                <div>
                  <label htmlFor="planType" className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Plan Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="planType"
                    name="planType"
                    value={formData.planType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      formErrors.planType
                        ? 'border-red-500/70 focus:ring-2 focus:ring-red-400 focus:border-red-400'
                        : isDarkMode
                          ? 'border-white/10 focus:ring-2 focus:ring-[#1f36ff] focus:border-[#1f36ff] bg-white/5 text-white'
                          : 'border-gray-300 focus:ring-2 focus:ring-[#1f36ff] focus:border-[#1f36ff] bg-white text-gray-900'
                    } focus:outline-none`}
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

              {/* Assigned Trainer/Coach (Read-only) */}
              <div>
                <label htmlFor="assignedTrainer" className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Assigned Trainer/Coach
                </label>
                <input
                  type="text"
                  id="assignedTrainer"
                  value={employee?.displayName || employee?.email || 'Loading...'}
                  readOnly
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    isDarkMode
                      ? 'border-white/10 bg-white/5 text-white/60 cursor-not-allowed'
                      : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Role (Read-only) */}
              <div>
                <label htmlFor="role" className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  value="User"
                  readOnly
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    isDarkMode
                      ? 'border-white/10 bg-white/5 text-white/60 cursor-not-allowed'
                      : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      fullName: '',
                      email: '',
                      height: '',
                      weight: '',
                      gender: '',
                      age: '',
                      planType: ''
                    });
                    setFormErrors({});
                    setError(null);
                  }}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isSubmitting
                      ? 'bg-[#1f36ff]/60 cursor-not-allowed text-white/60'
                      : 'bg-[#1f36ff] hover:bg-[#1b2ed1] text-white hover:shadow-lg hover:shadow-[#1f36ff]/40 hover:-translate-y-0.5 active:scale-[0.98]'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating User...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FiUserPlus className="text-lg" />
                      Add User
                    </span>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default EmployeeAddUser;

