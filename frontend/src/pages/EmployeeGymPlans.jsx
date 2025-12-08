import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiPlus, FiSave, FiSearch, FiTrash2, FiImage, FiX, FiChevronDown } from 'react-icons/fi';
import axios from 'axios';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../context/ThemeContext';
import EmployeeSidebar from '../components/EmployeeSidebar';
import ExercisePickerModal from '../components/ExercisePickerModal';

const EmployeeGymPlans = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // === NEW: User Search State ===
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userSearchRef = useRef(null);

  // === NEW: Exercises Library State ===
  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);

  const [planData, setPlanData] = useState({
    goal: '',
    experience: '',
    daysPerWeek: 3,
    days: []
  });

  const goals = ['Gain Muscle', 'Lose Fat', 'Maintain', 'Strength', 'Endurance'];
  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchUsers();
    fetchExercises(); // === NEW: Fetch exercises on mount ===
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchWorkoutPlan(selectedUser.uid);
    } else {
      setWorkoutPlan(null);
      resetPlanData();
    }
  }, [selectedUser]);

  // === NEW: Filter users based on search term ===
  useEffect(() => {
    if (userSearchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const searchLower = userSearchTerm.toLowerCase();
      const filtered = users.filter(user => 
        (user.displayName && user.displayName.toLowerCase().includes(searchLower)) ||
        (user.loginEmail && user.loginEmail.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
      setFilteredUsers(filtered);
    }
  }, [userSearchTerm, users]);

  // === NEW: Close dropdown when clicking outside ===
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userSearchRef.current && !userSearchRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/employee/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.data || []);
        setFilteredUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification({
        type: 'error',
        message: 'Failed to load users'
      });
    } finally {
      setLoading(false);
    }
  };

  // === NEW: Fetch exercises from library ===
  const fetchExercises = async () => {
    try {
      setLoadingExercises(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/employee/exercises', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setExercises(response.data.data || []);
        console.log('✅ Loaded exercises library:', response.data.data?.length || 0, 'exercises');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      // Don't show notification, exercises will be loaded when modal opens
    } finally {
      setLoadingExercises(false);
    }
  };

  const fetchWorkoutPlan = async (userId) => {
    try {
      setLoadingPlan(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/employee/workout-plans/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setWorkoutPlan(response.data.data);
        setPlanData({
          goal: response.data.data.goal || '',
          experience: response.data.data.experience || '',
          daysPerWeek: response.data.data.daysPerWeek || 3,
          days: response.data.data.days || []
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // No plan exists yet
        setWorkoutPlan(null);
        resetPlanData();
      } else {
        console.error('Error fetching workout plan:', error);
        showNotification({
          type: 'error',
          message: 'Failed to load workout plan'
        });
      }
    } finally {
      setLoadingPlan(false);
    }
  };

  const resetPlanData = () => {
    setPlanData({
      goal: '',
      experience: '',
      daysPerWeek: 3,
      days: []
    });
  };

  // === NEW: Handle user selection from search dropdown ===
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUserSearchTerm(user.displayName || user.loginEmail || user.email || '');
    setIsUserDropdownOpen(false);
  };

  // === NEW: Clear selected user ===
  const handleClearUser = () => {
    setSelectedUser(null);
    setUserSearchTerm('');
    setIsUserDropdownOpen(false);
  };

  const addDay = () => {
    setPlanData({
      ...planData,
      days: [
        ...planData.days,
        {
          title: `Day ${planData.days.length + 1}`,
          warmup: [],
          exercises: [],
          cooldown: []
        }
      ]
    });
  };

  const removeDay = (index) => {
    setPlanData({
      ...planData,
      days: planData.days.filter((_, i) => i !== index)
    });
  };

  const updateDay = (index, field, value) => {
    const newDays = [...planData.days];
    newDays[index] = { ...newDays[index], [field]: value };
    setPlanData({ ...planData, days: newDays });
  };

  // === NEW: Open exercise picker modal for a specific day ===
  const openExercisePickerForDay = (dayIndex) => {
    setSelectedDayIndex(dayIndex);
    setShowExerciseModal(true);
  };

  // === NEW: Add selected exercise to a day ===
  const handleAddExerciseToDay = (exercise) => {
    if (selectedDayIndex === null) return;

    const newDays = [...planData.days];
    if (!newDays[selectedDayIndex].exercises) {
      newDays[selectedDayIndex].exercises = [];
    }
    newDays[selectedDayIndex].exercises.push(exercise);
    setPlanData({ ...planData, days: newDays });

    showNotification({
      type: 'success',
      message: `Added "${exercise.name}" to ${newDays[selectedDayIndex].title}`
    });
  };

  // === NEW: Remove exercise from a day ===
  const removeExerciseFromDay = (dayIndex, exerciseIndex) => {
    const newDays = [...planData.days];
    newDays[dayIndex].exercises.splice(exerciseIndex, 1);
    setPlanData({ ...planData, days: newDays });
  };

  // === NEW: Update exercise sets/reps in a day ===
  const updateExerciseInDay = (dayIndex, exerciseIndex, field, value) => {
    const newDays = [...planData.days];
    newDays[dayIndex].exercises[exerciseIndex] = {
      ...newDays[dayIndex].exercises[exerciseIndex],
      [field]: parseInt(value) || 1
    };
    setPlanData({ ...planData, days: newDays });
  };

  const handleSavePlan = async () => {
    if (!selectedUser) {
      showNotification({
        type: 'error',
        message: 'Please select a user first'
      });
      return;
    }

    if (!planData.goal || !planData.experience) {
      showNotification({
        type: 'error',
        message: 'Please fill in goal and experience level'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:3000/api/employee/workout-plans/${selectedUser.uid}`,
        planData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification({
          type: 'success',
          message: workoutPlan ? 'Workout plan updated successfully' : 'Workout plan created successfully'
        });
        fetchWorkoutPlan(selectedUser.uid);
      }
    } catch (error) {
      console.error('Error saving workout plan:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to save workout plan'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors ${isDarkMode ? 'bg-[#0a0d1a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <EmployeeSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Gym Plans</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create and assign workout plans to your users
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* === NEW: User Search & Selection Panel === */}
            <div className={`lg:col-span-1 p-6 rounded-2xl h-fit ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiUsers /> Select User
              </h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* === NEW: Searchable User Selector === */}
                  <div ref={userSearchRef} className="relative">
                    <div className="relative">
                      <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <input
                        type="text"
                        placeholder="Search user by name or email..."
                        value={userSearchTerm}
                        onChange={(e) => {
                          setUserSearchTerm(e.target.value);
                          setIsUserDropdownOpen(true);
                        }}
                        onFocus={() => setIsUserDropdownOpen(true)}
                        className={`w-full pl-10 pr-10 py-3 rounded-xl border transition-all ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        }`}
                      />
                      {selectedUser && (
                        <button
                          onClick={handleClearUser}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                            isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                          }`}
                        >
                          <FiX size={16} />
                        </button>
                      )}
                      {!selectedUser && (
                        <FiChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform ${
                          isUserDropdownOpen ? 'rotate-180' : ''
                        } ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      )}
                    </div>

                    {/* === NEW: User Dropdown Results === */}
                    {isUserDropdownOpen && (
                      <div className={`absolute z-20 w-full mt-2 rounded-xl border shadow-xl max-h-[300px] overflow-y-auto ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-white border-gray-200'
                      }`}>
                        {filteredUsers.length === 0 ? (
                          <div className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No users found
                          </div>
                        ) : (
                          filteredUsers.map((user) => (
                            <button
                              key={user.uid}
                              onClick={() => handleSelectUser(user)}
                              className={`w-full p-4 text-left transition-all border-b last:border-b-0 ${
                                selectedUser?.uid === user.uid
                                  ? isDarkMode
                                    ? 'bg-blue-600/20 border-gray-600'
                                    : 'bg-blue-50 border-gray-100'
                                  : isDarkMode
                                    ? 'hover:bg-gray-600 border-gray-600'
                                    : 'hover:bg-gray-50 border-gray-100'
                              }`}
                            >
                              <p className={`font-medium ${
                                selectedUser?.uid === user.uid ? 'text-blue-500' : ''
                              }`}>
                                {user.displayName || 'Unknown'}
                              </p>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {user.loginEmail || user.email}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* === Selected User Display === */}
                  {selectedUser && (
                    <div className={`p-4 rounded-xl border-2 ${
                      isDarkMode 
                        ? 'bg-blue-600/10 border-blue-500/50' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <p className="text-sm font-medium text-blue-500 mb-1">Selected User</p>
                      <p className="font-semibold">{selectedUser.displayName || 'Unknown'}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedUser.loginEmail || selectedUser.email}
                      </p>
                    </div>
                  )}

                  {/* User Count */}
                  <p className={`text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {users.length} users available
                  </p>
                </div>
              )}
            </div>

            {/* Workout Plan Form */}
            <div className={`lg:col-span-2 p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              {!selectedUser ? (
                <div className={`text-center py-20 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FiUsers className="mx-auto text-5xl mb-4 opacity-30" />
                  <p className="text-lg font-medium">Select a user to get started</p>
                  <p className="text-sm mt-2">Search and select a user from the left panel</p>
                </div>
              ) : loadingPlan ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Workout Plan for {selectedUser.displayName}
                    </h2>
                  </div>

                  {/* Goal & Experience */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Goal *</label>
                      <select
                        value={planData.goal}
                        onChange={(e) => setPlanData({ ...planData, goal: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border transition-all ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-300 focus:border-blue-500'
                        }`}
                      >
                        <option value="">Select goal...</option>
                        {goals.map(goal => (
                          <option key={goal} value={goal}>{goal}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Experience *</label>
                      <select
                        value={planData.experience}
                        onChange={(e) => setPlanData({ ...planData, experience: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border transition-all ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-300 focus:border-blue-500'
                        }`}
                      >
                        <option value="">Select level...</option>
                        {experienceLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Days Per Week</label>
                    <input
                      type="number"
                      value={planData.daysPerWeek}
                      onChange={(e) => setPlanData({ ...planData, daysPerWeek: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 focus:border-blue-500'
                      }`}
                      min="1"
                      max="7"
                    />
                  </div>

                  {/* === Workout Days Section === */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Workout Days</h3>
                      <button
                        onClick={addDay}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-sm transition-all"
                      >
                        <FiPlus /> Add Day
                      </button>
                    </div>

                    {planData.days.length === 0 ? (
                      <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
                        isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                      }`}>
                        <p className="font-medium">No days added yet</p>
                        <p className="text-sm mt-1">Click "Add Day" to create your first workout day</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {planData.days.map((day, dayIndex) => (
                          <div
                            key={dayIndex}
                            className={`p-5 rounded-xl border ${
                              isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            {/* Day Header */}
                            <div className="flex items-center justify-between mb-4">
                              <input
                                type="text"
                                value={day.title}
                                onChange={(e) => updateDay(dayIndex, 'title', e.target.value)}
                                className={`flex-1 px-4 py-2 rounded-xl border font-semibold text-lg ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white focus:border-blue-500' 
                                    : 'bg-white border-gray-300 focus:border-blue-500'
                                }`}
                                placeholder="Day title (e.g., Chest & Shoulders)"
                              />
                              <button
                                onClick={() => removeDay(dayIndex)}
                                className={`ml-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                  isDarkMode 
                                    ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400' 
                                    : 'bg-red-100 hover:bg-red-200 text-red-600'
                                }`}
                              >
                                Remove Day
                              </button>
                            </div>

                            {/* === NEW: Exercises List for this Day === */}
                            <div className="space-y-3">
                              {day.exercises && day.exercises.length > 0 ? (
                                <>
                                  {day.exercises.map((exercise, exerciseIndex) => (
                                    <div
                                      key={exerciseIndex}
                                      className={`p-4 rounded-xl flex items-center gap-4 ${
                                        isDarkMode ? 'bg-gray-600' : 'bg-white border border-gray-200'
                                      }`}
                                    >
                                      {/* Exercise GIF Thumbnail */}
                                      <div className="flex-shrink-0">
                                        {exercise.gifMaleUrl ? (
                                          <img
                                            src={exercise.gifMaleUrl}
                                            alt={exercise.name}
                                            className="w-14 h-14 object-cover rounded-lg"
                                            loading="lazy"
                                          />
                                        ) : (
                                          <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                                            isDarkMode ? 'bg-gray-500' : 'bg-gray-100'
                                          }`}>
                                            <FiImage className="text-lg opacity-40" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Exercise Info */}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold truncate">{exercise.name}</h4>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          <span className={`px-2 py-0.5 rounded text-xs ${
                                            isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                                          }`}>
                                            {exercise.muscleGroup}
                                          </span>
                                          <span className={`px-2 py-0.5 rounded text-xs ${
                                            isDarkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                                          }`}>
                                            {exercise.equipment}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Sets & Reps Inputs */}
                                      <div className="flex items-center gap-2">
                                        <div className="text-center">
                                          <label className={`text-xs block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Sets
                                          </label>
                                          <input
                                            type="number"
                                            value={exercise.sets}
                                            onChange={(e) => updateExerciseInDay(dayIndex, exerciseIndex, 'sets', e.target.value)}
                                            min="1"
                                            className={`w-16 px-2 py-1 rounded-lg border text-center ${
                                              isDarkMode 
                                                ? 'bg-gray-500 border-gray-400 text-white' 
                                                : 'bg-gray-50 border-gray-300'
                                            }`}
                                          />
                                        </div>
                                        <span className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>×</span>
                                        <div className="text-center">
                                          <label className={`text-xs block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Reps
                                          </label>
                                          <input
                                            type="number"
                                            value={exercise.reps}
                                            onChange={(e) => updateExerciseInDay(dayIndex, exerciseIndex, 'reps', e.target.value)}
                                            min="1"
                                            className={`w-16 px-2 py-1 rounded-lg border text-center ${
                                              isDarkMode 
                                                ? 'bg-gray-500 border-gray-400 text-white' 
                                                : 'bg-gray-50 border-gray-300'
                                            }`}
                                          />
                                        </div>
                                      </div>

                                      {/* Remove Exercise Button */}
                                      <button
                                        onClick={() => removeExerciseFromDay(dayIndex, exerciseIndex)}
                                        className={`p-2 rounded-lg transition-all ${
                                          isDarkMode 
                                            ? 'hover:bg-red-600/20 text-red-400' 
                                            : 'hover:bg-red-100 text-red-500'
                                        }`}
                                        title="Remove exercise"
                                      >
                                        <FiTrash2 />
                                      </button>
                                    </div>
                                  ))}
                                </>
                              ) : (
                                <div className={`text-center py-6 rounded-xl border border-dashed ${
                                  isDarkMode ? 'border-gray-500 text-gray-400' : 'border-gray-300 text-gray-500'
                                }`}>
                                  <p className="text-sm">No exercises added to this day yet</p>
                                </div>
                              )}

                              {/* === NEW: Add Exercise Button === */}
                              <button
                                onClick={() => openExercisePickerForDay(dayIndex)}
                                className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                                  isDarkMode 
                                    ? 'border-gray-500 text-gray-400 hover:border-blue-500 hover:text-blue-400 hover:bg-blue-600/10' 
                                    : 'border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                              >
                                <FiPlus /> Add Exercise
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <div className={`pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={handleSavePlan}
                      disabled={isSubmitting}
                      className={`w-full px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-lg transition-all ${
                        isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed text-white/60'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40'
                      }`}
                    >
                      <FiSave /> {isSubmitting ? 'Saving...' : workoutPlan ? 'Update Plan' : 'Create Plan'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* === NEW: Exercise Picker Modal === */}
      <ExercisePickerModal
        isOpen={showExerciseModal}
        onClose={() => {
          setShowExerciseModal(false);
          setSelectedDayIndex(null);
        }}
        onSelectExercise={handleAddExerciseToDay}
        exercises={exercises}
        isDarkMode={isDarkMode}
        dayTitle={selectedDayIndex !== null ? planData.days[selectedDayIndex]?.title : ''}
      />
    </div>
  );
};

export default EmployeeGymPlans;
