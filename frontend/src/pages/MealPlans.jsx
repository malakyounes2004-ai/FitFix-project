import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCoffee, FiX, FiUser, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import axios from 'axios';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../context/ThemeContext';
import EmployeeSidebar from '../components/EmployeeSidebar';

const MealPlans = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  
  const [users, setUsers] = useState([]);
  const [usersWithMealPlans, setUsersWithMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingMealPlan, setEditingMealPlan] = useState(null);
  const [deletingMealPlan, setDeletingMealPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
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
          const allUsers = response.data.data || [];
          setUsers(allUsers);
          
          // Filter only users who have a mealPlan field
          const withMealPlans = allUsers.filter(user => user.mealPlan && user.mealPlan.breakfast);
          setUsersWithMealPlans(withMealPlans);
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

    fetchUsers();
  }, [navigate, showNotification]);

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Get assigned by name (would need to fetch employee name, for now show ID)
  const getAssignedByName = (assignedBy) => {
    // In a real scenario, you'd fetch the employee name
    // For now, just return a placeholder
    return assignedBy ? 'Employee' : 'N/A';
  };

  // Handle edit meal plan
  const handleEditMealPlan = (user) => {
    if (!user.mealPlan) return;
    setEditingMealPlan({
      ...user,
      mealPlan: JSON.parse(JSON.stringify(user.mealPlan)) // Deep copy
    });
    setSelectedUser(null);
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
        // Refresh users
        const allUsers = users.filter(u => u.uid !== deletingMealPlan.uid || !u.mealPlan);
        setUsers(allUsers);
        const withMealPlans = allUsers.filter(user => user.mealPlan && user.mealPlan.breakfast);
        setUsersWithMealPlans(withMealPlans);
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
        // Refresh users
        const refreshResponse = await axios.get(
          'http://localhost:3000/api/employee/users',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (refreshResponse.data.success) {
          const allUsers = refreshResponse.data.data || [];
          setUsers(allUsers);
          const withMealPlans = allUsers.filter(user => user.mealPlan && user.mealPlan.breakfast);
          setUsersWithMealPlans(withMealPlans);
        }
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

  if (loading) {
    return (
      <div className="flex h-screen">
        <EmployeeSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading meal plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <EmployeeSidebar />
      
      <div className={`flex-1 overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FiCoffee className="text-blue-600" />
              View Users Plan
            </h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {usersWithMealPlans.length} user(s) with assigned meal plans
            </p>
          </div>

          {/* Users Grid */}
          {usersWithMealPlans.length === 0 ? (
            <div className={`text-center py-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <FiCoffee className="mx-auto text-6xl text-gray-400 mb-4" />
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No meal plans assigned yet
              </p>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Use "Add Meal Plan" to create and assign meal plans to users
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usersWithMealPlans.map((user) => (
                <div
                  key={user.uid}
                  onClick={() => setSelectedUser(user)}
                  className={`p-6 rounded-lg cursor-pointer transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                      : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'
                    }`}>
                      <FiUser className={`text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{user.displayName || 'Unknown'}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.loginEmail || user.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Click to view meal plan
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meal Plan Modal */}
      {selectedUser && selectedUser.mealPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-xl'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold">
                  Meal Plan - {selectedUser.displayName || 'Unknown User'}
                </h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedUser.loginEmail || selectedUser.email || 'N/A'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditMealPlan(selectedUser)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  <FiEdit2 /> Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setDeletingMealPlan(selectedUser);
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isDarkMode
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-100 hover:bg-red-200 text-red-700'
                  }`}
                >
                  <FiTrash2 /> Delete
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Goal Badge */}
            {(() => {
              // Determine goal from mealPlan.goal or user.planType
              let goal = selectedUser.mealPlan?.goal;
              if (!goal && selectedUser.planType) {
                const planType = selectedUser.planType;
                // Match exact planType values
                if (planType === 'Weight Loss') {
                  goal = 'Lose Weight';
                } else if (planType === 'Muscle Gain / Weight Gain') {
                  goal = 'Gain Weight';
                } else if (planType === 'Maintenance / Fitness / Healthy Lifestyle') {
                  goal = 'Maintain Weight';
                } else {
                  // Fallback to keyword matching
                  const planTypeLower = planType.toLowerCase();
                  if (planTypeLower.includes('loss') || planTypeLower.includes('weight loss')) {
                    goal = 'Lose Weight';
                  } else if (planTypeLower.includes('gain') || planTypeLower.includes('muscle')) {
                    goal = 'Gain Weight';
                  } else if (planTypeLower.includes('maintain') || planTypeLower.includes('maintenance') || planTypeLower.includes('fitness') || planTypeLower.includes('healthy')) {
                    goal = 'Maintain Weight';
                  }
                }
              }
              
              if (!goal) goal = 'Maintain Weight'; // Default

              // Determine badge colors based on goal
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
                <div className="mb-6">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full border font-semibold text-sm ${getBadgeStyles(goal)}`}>
                    Goal: {goal}
                  </div>
                </div>
              );
            })()}

            {/* Stats Grid */}
            <div className={`grid grid-cols-5 gap-4 mb-6 p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              <div>
                <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Calories</div>
                <div className="text-xl font-bold">{selectedUser.mealPlan.totalCalories || selectedUser.mealPlan.calories || 'N/A'}</div>
              </div>
              <div>
                <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>BMI</div>
                <div className="text-xl font-bold">{selectedUser.mealPlan.bmi || 'N/A'}</div>
              </div>
              <div>
                <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>BMR</div>
                <div className="text-xl font-bold">{selectedUser.mealPlan.bmr || 'N/A'}</div>
              </div>
              <div>
                <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>TDEE</div>
                <div className="text-xl font-bold">{selectedUser.mealPlan.tdee || 'N/A'}</div>
              </div>
              <div>
                <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Portion Scale</div>
                <div className="text-xl font-bold">{selectedUser.mealPlan.portionScale || 'N/A'}x</div>
              </div>
            </div>

            {/* Meal Plan Details */}
            <div className="space-y-4">
              {/* Breakfast */}
              {selectedUser.mealPlan.breakfast && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <h3 className="text-lg font-semibold mb-3">🍳 Breakfast: {selectedUser.mealPlan.breakfast.title}</h3>
                  <ul className="space-y-2">
                    {selectedUser.mealPlan.breakfast.items && selectedUser.mealPlan.breakfast.items.map((item, i) => {
                      const itemName = typeof item === 'string' ? item : (item.name || '');
                      const itemGrams = typeof item === 'object' && item.grams ? item.grams : null;
                      const itemBaseGrams = typeof item === 'object' && item.baseGrams ? item.baseGrams : null;
                      return (
                        <li key={i} className="flex justify-between items-center">
                          <span>
                            {itemName}
                            {itemGrams && `: ${itemGrams}g`}
                            {itemBaseGrams && (
                              <span className={`text-xs ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                (base: {itemBaseGrams}g)
                              </span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Lunch */}
              {selectedUser.mealPlan.lunch && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <h3 className="text-lg font-semibold mb-3">🍽️ Lunch: {selectedUser.mealPlan.lunch.title}</h3>
                  <ul className="space-y-2">
                    {selectedUser.mealPlan.lunch.items && selectedUser.mealPlan.lunch.items.map((item, i) => {
                      const itemName = typeof item === 'string' ? item : (item.name || '');
                      const itemGrams = typeof item === 'object' && item.grams ? item.grams : null;
                      const itemBaseGrams = typeof item === 'object' && item.baseGrams ? item.baseGrams : null;
                      return (
                        <li key={i} className="flex justify-between items-center">
                          <span>
                            {itemName}
                            {itemGrams && `: ${itemGrams}g`}
                            {itemBaseGrams && (
                              <span className={`text-xs ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                (base: {itemBaseGrams}g)
                              </span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Dinner */}
              {selectedUser.mealPlan.dinner && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <h3 className="text-lg font-semibold mb-3">🍲 Dinner: {selectedUser.mealPlan.dinner.title}</h3>
                  <ul className="space-y-2">
                    {selectedUser.mealPlan.dinner.items && selectedUser.mealPlan.dinner.items.map((item, i) => {
                      const itemName = typeof item === 'string' ? item : (item.name || '');
                      const itemGrams = typeof item === 'object' && item.grams ? item.grams : null;
                      const itemBaseGrams = typeof item === 'object' && item.baseGrams ? item.baseGrams : null;
                      return (
                        <li key={i} className="flex justify-between items-center">
                          <span>
                            {itemName}
                            {itemGrams && `: ${itemGrams}g`}
                            {itemBaseGrams && (
                              <span className={`text-xs ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                (base: {itemBaseGrams}g)
                              </span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Snacks */}
              {selectedUser.mealPlan.snacks && selectedUser.mealPlan.snacks.length > 0 && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <h3 className="text-lg font-semibold mb-3">🍎 Snacks</h3>
                  {selectedUser.mealPlan.snacks.map((snack, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <h4 className="font-medium mb-2">{snack.title}</h4>
                      <ul className="space-y-2">
                        {snack.items && snack.items.map((item, j) => {
                          const itemName = typeof item === 'string' ? item : (item.name || '');
                          const itemGrams = typeof item === 'object' && item.grams ? item.grams : null;
                          const itemBaseGrams = typeof item === 'object' && item.baseGrams ? item.baseGrams : null;
                          return (
                            <li key={j} className="flex justify-between items-center">
                              <span>
                                {itemName}
                                {itemGrams && `: ${itemGrams}g`}
                                {itemBaseGrams && (
                                  <span className={`text-xs ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    (base: {itemBaseGrams}g)
                                  </span>
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Metadata */}
              <div className={`mt-6 pt-4 border-t border-gray-700 text-sm space-y-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div className="flex justify-between">
                  <span>Assigned By:</span>
                  <span className="font-medium">{getAssignedByName(selectedUser.mealPlan.assignedBy)}</span>
                </div>
                {selectedUser.mealPlan.createdAt && (
                  <div className="flex justify-between">
                    <span>Created At:</span>
                    <span className="font-medium">{formatDate(selectedUser.mealPlan.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Meal Plan Confirmation Modal */}
      {deletingMealPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-6 max-w-md w-full ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-xl'
          }`}>
            <h2 className="text-xl font-bold mb-4">Delete Meal Plan</h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to delete the meal plan for <strong>{deletingMealPlan.displayName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingMealPlan(null)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
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
    </div>
  );
};

// Edit Meal Plan Modal Component (shared between pages)
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

export default MealPlans;

