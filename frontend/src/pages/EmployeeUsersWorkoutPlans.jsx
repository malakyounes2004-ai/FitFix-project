// frontend/src/pages/EmployeeUsersWorkoutPlans.jsx
// Users Workout Plans Overview Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiEye, 
  FiEdit2, 
  FiTrash2, 
  FiX, 
  FiImage, 
  FiTarget,
  FiCalendar,
  FiUser,
  FiActivity
} from 'react-icons/fi';
import axios from 'axios';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../context/ThemeContext';
import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeeUsersWorkoutPlans = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();

  // State
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlans, setFilteredPlans] = useState([]);
  
  // Modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter plans based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlans(workoutPlans);
    } else {
      const searchLower = searchTerm.toLowerCase();
      setFilteredPlans(workoutPlans.filter(plan => {
        const user = getUserById(plan.userId);
        return (
          (user?.displayName && user.displayName.toLowerCase().includes(searchLower)) ||
          (user?.loginEmail && user.loginEmail.toLowerCase().includes(searchLower)) ||
          (user?.email && user.email.toLowerCase().includes(searchLower)) ||
          (plan.goal && plan.goal.toLowerCase().includes(searchLower)) ||
          (plan.experience && plan.experience.toLowerCase().includes(searchLower))
        );
      }));
    }
  }, [searchTerm, workoutPlans, users]);

  // Fetch all data (users and their workout plans)
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch users first
      const usersResponse = await axios.get('http://localhost:3000/api/employee/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let usersData = [];
      if (usersResponse.data.success) {
        usersData = usersResponse.data.data || [];
        setUsers(usersData);
      }

      // Fetch workout plans for each user
      console.log('📋 Fetching workout plans for', usersData.length, 'users...');
      const plansWithData = [];

      // Use Promise.all for faster parallel fetching
      const planPromises = usersData.map(async (user) => {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/employee/workout-plans/${user.uid}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (response.data.success && response.data.data) {
            return {
              ...response.data.data,
              userId: user.uid
            };
          }
          return null;
        } catch (err) {
          // User doesn't have a plan (404), skip silently
          if (err.response?.status !== 404) {
            console.error(`Error fetching plan for user ${user.uid}:`, err);
          }
          return null;
        }
      });

      const results = await Promise.all(planPromises);
      
      // Filter out null results (users without plans)
      const validPlans = results.filter(plan => plan !== null);
      
      console.log('✅ Found', validPlans.length, 'workout plans');
      
      setWorkoutPlans(validPlans);
      setFilteredPlans(validPlans);

    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification({
        type: 'error',
        message: 'Failed to load workout plans'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get user by ID
  const getUserById = (userId) => {
    return users.find(u => u.uid === userId);
  };

  // Handle view plan
  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setShowViewModal(true);
  };

  // Handle edit plan
  const handleEditPlan = (plan) => {
    navigate(`/employee/gym-plans?userId=${plan.userId}`);
  };

  // Handle delete plan
  const openDeleteModal = (plan) => {
    setSelectedPlan(plan);
    setShowDeleteModal(true);
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:3000/api/employee/workout-plans/${selectedPlan.userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification({
          type: 'success',
          message: 'Workout plan deleted successfully'
        });
        setShowDeleteModal(false);
        setSelectedPlan(null);
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete workout plan'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    let date;
    if (timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get goal color
  const getGoalColor = (goal) => {
    const colors = {
      'Gain Muscle': isDarkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-700',
      'Lose Fat': isDarkMode ? 'bg-orange-600/20 text-orange-400' : 'bg-orange-100 text-orange-700',
      'Maintain': isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700',
      'Strength': isDarkMode ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-700',
      'Endurance': isDarkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-700'
    };
    return colors[goal] || (isDarkMode ? 'bg-gray-600/20 text-gray-400' : 'bg-gray-100 text-gray-700');
  };

  // Get experience color
  const getExperienceColor = (experience) => {
    const colors = {
      'Beginner': isDarkMode ? 'bg-teal-600/20 text-teal-400' : 'bg-teal-100 text-teal-700',
      'Intermediate': isDarkMode ? 'bg-yellow-600/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      'Advanced': isDarkMode ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-700'
    };
    return colors[experience] || (isDarkMode ? 'bg-gray-600/20 text-gray-400' : 'bg-gray-100 text-gray-700');
  };

  return (
    <div className={`min-h-screen flex transition-colors ${isDarkMode ? 'bg-[#0a0d1a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <EmployeeSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Users Workout Plans</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                View and manage all user workout plans
              </p>
            </div>
            <div className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
              <span className="font-semibold">{workoutPlans.length}</span> Plans Total
            </div>
          </div>

          {/* Search Bar */}
          <div className={`p-6 rounded-2xl mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="relative">
              <FiSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search by user name, email, goal, or experience..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              />
            </div>
          </div>

          {/* Plans Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className={`text-center py-20 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <FiActivity className="mx-auto text-5xl mb-4 opacity-30" />
              <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {workoutPlans.length === 0 ? 'No workout plans created yet' : 'No plans match your search'}
              </p>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {workoutPlans.length === 0 ? 'Create workout plans for your users in the Gym Plans section' : 'Try a different search term'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan, index) => {
                const user = getUserById(plan.userId);
                const totalExercises = plan.days?.reduce((sum, day) => sum + (day.exercises?.length || 0), 0) || 0;
                
                return (
                  <div
                    key={plan.userId || index}
                    className={`p-6 rounded-2xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' 
                        : 'bg-white border border-gray-200 hover:shadow-lg'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                        isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{user?.displayName || 'Unknown User'}</h3>
                        <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {user?.loginEmail || user?.email || 'No email'}
                        </p>
                      </div>
                    </div>

                    {/* Plan Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getGoalColor(plan.goal)}`}>
                          <FiTarget className="inline mr-1" />
                          {plan.goal || 'No goal'}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getExperienceColor(plan.experience)}`}>
                          {plan.experience || 'No level'}
                        </span>
                      </div>

                      <div className={`grid grid-cols-2 gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="text-center">
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Days/Week</p>
                          <p className="text-lg font-bold">{plan.daysPerWeek || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Exercises</p>
                          <p className="text-lg font-bold">{totalExercises}</p>
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FiCalendar />
                        <span>Updated: {formatDate(plan.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewPlan(plan)}
                        className={`flex-1 px-3 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                          isDarkMode 
                            ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400' 
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                        }`}
                      >
                        <FiEye /> View
                      </button>
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className={`flex-1 px-3 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                          isDarkMode 
                            ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400' 
                            : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                        }`}
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(plan)}
                        className={`px-3 py-2 rounded-xl flex items-center justify-center transition-all ${
                          isDarkMode 
                            ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400' 
                            : 'bg-red-100 hover:bg-red-200 text-red-700'
                        }`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* View Plan Modal */}
      {showViewModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-2xl'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Workout Plan Details</h2>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getUserById(selectedPlan.userId)?.displayName || 'Unknown User'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedPlan(null);
                  }}
                  className={`p-2 rounded-xl transition-all ${
                    isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Plan Summary */}
              <div className="flex flex-wrap gap-3 mt-4">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getGoalColor(selectedPlan.goal)}`}>
                  {selectedPlan.goal}
                </span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getExperienceColor(selectedPlan.experience)}`}>
                  {selectedPlan.experience}
                </span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-gray-600/50 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  {selectedPlan.daysPerWeek} days/week
                </span>
              </div>
            </div>

            {/* Modal Body - Days List */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedPlan.days && selectedPlan.days.length > 0 ? (
                <div className="space-y-4">
                  {selectedPlan.days.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`p-5 rounded-xl border ${
                        isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <h3 className="text-lg font-semibold mb-4">{day.title || `Day ${dayIndex + 1}`}</h3>
                      
                      {day.exercises && day.exercises.length > 0 ? (
                        <div className="space-y-3">
                          {day.exercises.map((exercise, exIndex) => (
                            <div
                              key={exIndex}
                              className={`p-4 rounded-xl flex items-center gap-4 ${
                                isDarkMode ? 'bg-gray-600' : 'bg-white border border-gray-200'
                              }`}
                            >
                              {/* Exercise GIF */}
                              <div className="flex-shrink-0">
                                {exercise.gifMaleUrl ? (
                                  <img
                                    src={exercise.gifMaleUrl}
                                    alt={exercise.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                                    isDarkMode ? 'bg-gray-500' : 'bg-gray-100'
                                  }`}>
                                    <FiImage className="text-xl opacity-40" />
                                  </div>
                                )}
                              </div>

                              {/* Exercise Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{exercise.name}</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {exercise.muscleGroup && (
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                      isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {exercise.muscleGroup}
                                    </span>
                                  )}
                                  {exercise.equipment && (
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                      isDarkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                                    }`}>
                                      {exercise.equipment}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Sets x Reps */}
                              <div className={`text-center px-4 py-2 rounded-xl ${
                                isDarkMode ? 'bg-gray-500' : 'bg-gray-100'
                              }`}>
                                <p className="text-lg font-bold">{exercise.sets} × {exercise.reps}</p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Sets × Reps</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-sm text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No exercises in this day
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FiActivity className="mx-auto text-4xl mb-3 opacity-50" />
                  <p>No workout days in this plan</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditPlan(selectedPlan);
                  }}
                  className={`px-6 py-2 rounded-xl font-medium transition-all ${
                    isDarkMode 
                      ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400' 
                      : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                  }`}
                >
                  <FiEdit2 className="inline mr-2" /> Edit Plan
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedPlan(null);
                  }}
                  className={`px-6 py-2 rounded-xl font-medium ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 max-w-md w-full ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-2xl'
          }`}>
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-red-600/20' : 'bg-red-100'
            }`}>
              <FiTrash2 className={`text-2xl ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            
            <h2 className="text-xl font-bold text-center mb-2">Delete Workout Plan</h2>
            <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to delete the workout plan for{' '}
              <strong>{getUserById(selectedPlan.userId)?.displayName || 'this user'}</strong>?
              This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPlan(null);
                }}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlan}
                disabled={isDeleting}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                  isDeleting
                    ? 'bg-red-500/60 cursor-not-allowed text-white/60'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeUsersWorkoutPlans;

