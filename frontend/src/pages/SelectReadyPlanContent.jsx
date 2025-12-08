import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiUsers,
  FiX,
  FiCheck,
  FiCoffee
} from 'react-icons/fi';
import axios from 'axios';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../context/ThemeContext';
import EmployeeSidebar from '../components/EmployeeSidebar';

const SelectReadyPlanContent = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();

  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [assigningTemplate, setAssigningTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Fetch templates and users
  useEffect(() => {
    fetchTemplates();
    fetchUsers();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        'http://localhost:3000/api/mealPlans/templates',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setTemplates(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch meal plan templates';
      showNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

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
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:3000/api/mealPlans/templates/${deletingTemplate.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        showNotification({
          type: 'success',
          message: 'Meal plan template deleted successfully'
        });
        setDeletingTemplate(null);
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete template'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!assigningTemplate || selectedUserIds.length === 0) {
      showNotification({
        type: 'error',
        message: 'Please select at least one user'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/mealPlans/bulkAssign',
        {
          mealPlanTemplate: assigningTemplate.mealPlanTemplate,
          selectedUserIds
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
          message: `Meal plan assigned to ${response.data.results?.success?.length || 0} user(s) successfully`
        });
        setAssigningTemplate(null);
        setSelectedUserIds([]);
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error assigning meal plan:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to assign meal plan'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSave = async (updatedTemplate) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:3000/api/mealPlans/templates/${editingTemplate.id}`,
        {
          name: updatedTemplate.name,
          mealPlanTemplate: updatedTemplate.mealPlanTemplate
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
          message: 'Meal plan template updated successfully'
        });
        setEditingTemplate(null);
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error updating template:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update template'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => u.uid));
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors ${isDarkMode ? 'bg-[#0a0d1a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <EmployeeSidebar />
      <main className={`flex-1 p-8 transition-colors ${
        isDarkMode ? 'bg-[#0a0d1a] text-white' : 'bg-gray-50 text-gray-900'
      }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ready Plans</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create, manage, and assign meal plan templates to users
            </p>
          </div>
          <button
            onClick={() => navigate('/employee/meal-plans/add')}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <FiPlus /> Create New Template
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className={`text-center py-20 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'
          }`}>
            <FiCoffee className="mx-auto text-6xl mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Meal Plan Templates</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create your first meal plan template to get started
            </p>
            <button
              onClick={() => navigate('/employee/meal-plans/add')}
              className={`px-6 py-3 rounded-lg font-medium ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Create Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-6 rounded-lg transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-750'
                    : 'bg-white border border-gray-200 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{template.name}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Created: {formatDate(template.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => setViewingTemplate(template)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all ${
                      isDarkMode
                        ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400'
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                    }`}
                  >
                    <FiEye /> View
                  </button>
                  <button
                    onClick={() => {
                      setAssigningTemplate(template);
                      setSelectedUserIds([]);
                    }}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all ${
                      isDarkMode
                        ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    <FiUsers /> Assign
                  </button>
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all ${
                      isDarkMode
                        ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400'
                        : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                    }`}
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    onClick={() => setDeletingTemplate(template)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all ${
                      isDarkMode
                        ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                        : 'bg-red-100 hover:bg-red-200 text-red-700'
                    }`}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Template Modal */}
        {viewingTemplate && (
          <ViewTemplateModal
            template={viewingTemplate}
            onClose={() => setViewingTemplate(null)}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Assign Template Modal */}
        {assigningTemplate && (
          <AssignTemplateModal
            template={assigningTemplate}
            users={users}
            selectedUserIds={selectedUserIds}
            onToggleUser={toggleUserSelection}
            onToggleSelectAll={toggleSelectAll}
            onAssign={handleAssign}
            onClose={() => {
              setAssigningTemplate(null);
              setSelectedUserIds([]);
            }}
            isDarkMode={isDarkMode}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Edit Template Modal */}
        {editingTemplate && (
          <EditTemplateModal
            template={editingTemplate}
            onSave={handleEditSave}
            onClose={() => setEditingTemplate(null)}
            isDarkMode={isDarkMode}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg p-6 max-w-md w-full ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-xl'
            }`}>
              <h2 className="text-xl font-bold mb-4">Delete Meal Plan Template</h2>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Are you sure you want to delete <strong>{deletingTemplate.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingTemplate(null)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
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
                  {isSubmitting ? 'Deleting...' : 'Delete Template'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
    </div>
  );
};

// View Template Modal Component
const ViewTemplateModal = ({ template, onClose, isDarkMode }) => {
  const renderMealItems = (items) => {
    return items.map((item, i) => {
      const name = typeof item === 'string' ? item : (item.name || '');
      const baseGrams = typeof item === 'object' && item.baseGrams ? item.baseGrams : null;
      if (!name.trim()) return null;
      return (
        <li key={i} className="mb-1">
          {name}
          {baseGrams && <span className={`ml-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>({baseGrams}g base)</span>}
        </li>
      );
    });
  };

  const renderItemsWithCategories = (section, hasCategories) => {
    if (!hasCategories || !section.categories) {
      return (
        <ul className="list-disc list-inside ml-4">
          {renderMealItems(section.items || [])}
        </ul>
      );
    }

    const categoryKeys = ['protein', 'carbs', 'fats', 'meat', 'chicken', 'fish'];
    const categoryLabels = {
      protein: 'Protein',
      carbs: 'Carbs',
      fats: 'Fats',
      meat: 'Meat',
      chicken: 'Chicken',
      fish: 'Fish'
    };

    return (
      <div className="space-y-3 ml-4">
        {categoryKeys.map((catKey) => {
          const items = section.categories[catKey] || [];
          if (items.length === 0) return null;
          return (
            <div key={catKey}>
              <h5 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {categoryLabels[catKey]}
              </h5>
              <ul className="list-disc list-inside ml-4">
                {renderMealItems(items)}
              </ul>
            </div>
          );
        })}
      </div>
    );
  };

  const hasNewFormat = template.mealPlanTemplate.breakfasts || template.mealPlanTemplate.lunches || template.mealPlanTemplate.dinners;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-xl'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{template.name}</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-white/10 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Breakfasts */}
          {hasNewFormat && template.mealPlanTemplate.breakfasts && template.mealPlanTemplate.breakfasts.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-4 mt-2">🍳 Breakfasts</h2>
              {template.mealPlanTemplate.breakfasts.map((breakfast, idx) => (
                <div key={`breakfast-${idx}`} className={`p-4 rounded-lg mb-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <h3 className="text-lg font-semibold mb-2">{breakfast.title || `Breakfast ${idx + 1}`}</h3>
                  {renderItemsWithCategories(breakfast, true)}
                </div>
              ))}
            </>
          ) : template.mealPlanTemplate.breakfast ? (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h3 className="text-lg font-semibold mb-2">🍳 Breakfast: {template.mealPlanTemplate.breakfast.title}</h3>
              {renderItemsWithCategories(template.mealPlanTemplate.breakfast, false)}
            </div>
          ) : null}

          {/* Lunches */}
          {hasNewFormat && template.mealPlanTemplate.lunches && template.mealPlanTemplate.lunches.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-4 mt-6">🍽️ Lunches</h2>
              {template.mealPlanTemplate.lunches.map((lunch, idx) => (
                <div key={`lunch-${idx}`} className={`p-4 rounded-lg mb-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <h3 className="text-lg font-semibold mb-2">{lunch.title || `Lunch ${idx + 1}`}</h3>
                  {renderItemsWithCategories(lunch, true)}
                </div>
              ))}
            </>
          ) : template.mealPlanTemplate.lunch ? (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h3 className="text-lg font-semibold mb-2">🍽️ Lunch: {template.mealPlanTemplate.lunch.title}</h3>
              {renderItemsWithCategories(template.mealPlanTemplate.lunch, false)}
            </div>
          ) : null}

          {/* Dinners */}
          {hasNewFormat && template.mealPlanTemplate.dinners && template.mealPlanTemplate.dinners.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-4 mt-6">🍲 Dinners</h2>
              {template.mealPlanTemplate.dinners.map((dinner, idx) => (
                <div key={`dinner-${idx}`} className={`p-4 rounded-lg mb-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <h3 className="text-lg font-semibold mb-2">{dinner.title || `Dinner ${idx + 1}`}</h3>
                  {renderItemsWithCategories(dinner, true)}
                </div>
              ))}
            </>
          ) : template.mealPlanTemplate.dinner ? (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h3 className="text-lg font-semibold mb-2">🍲 Dinner: {template.mealPlanTemplate.dinner.title}</h3>
              {renderItemsWithCategories(template.mealPlanTemplate.dinner, false)}
            </div>
          ) : null}

          {/* Snacks */}
          {template.mealPlanTemplate.snacks && template.mealPlanTemplate.snacks.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mb-4 mt-6">🍎 Snacks</h2>
              {template.mealPlanTemplate.snacks.map((snack, i) => (
                <div key={i} className={`p-4 rounded-lg mb-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <h3 className="text-lg font-semibold mb-2">{snack.title || `Snack ${i + 1}`}</h3>
                  {renderItemsWithCategories(snack, !!snack.categories)}
                </div>
              ))}
            </>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium ${
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
  );
};

// Assign Template Modal Component
const AssignTemplateModal = ({ 
  template, 
  users, 
  selectedUserIds, 
  onToggleUser, 
  onToggleSelectAll, 
  onAssign, 
  onClose, 
  isDarkMode,
  isSubmitting 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-xl'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Assign: {template.name}</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-white/10 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium">Select Users</label>
            <button
              onClick={onToggleSelectAll}
              className={`text-sm px-3 py-1 rounded ${
                isDarkMode
                  ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {selectedUserIds.length === users.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className={`max-h-96 overflow-y-auto border rounded-lg p-4 ${
            isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
          }`}>
            {users.length === 0 ? (
              <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No users available
              </p>
            ) : (
              users.map((user) => {
                const detectedPlanType = user.mealPlan?.mealPlanType || user.planType || 'No plan assigned';
                return (
                  <label
                    key={user.uid}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      isDarkMode
                        ? selectedUserIds.includes(user.uid)
                          ? 'bg-blue-600/20 border border-blue-500/30'
                          : 'hover:bg-gray-700'
                        : selectedUserIds.includes(user.uid)
                          ? 'bg-blue-100 border border-blue-300'
                          : 'hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.uid)}
                      onChange={() => onToggleUser(user.uid)}
                      className="w-5 h-5 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{user.displayName || 'Unknown'}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.loginEmail || user.email || 'N/A'}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Plan: {detectedPlanType}
                      </p>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onAssign}
            disabled={isSubmitting || selectedUserIds.length === 0}
            className={`px-6 py-2 rounded-lg font-medium ${
              isSubmitting || selectedUserIds.length === 0
                ? 'bg-gray-400 cursor-not-allowed text-white/60'
                : isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? 'Assigning...' : `Assign to ${selectedUserIds.length} User(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Template Modal Component
const EditTemplateModal = ({ template, onSave, onClose, isDarkMode, isSubmitting }) => {
  const [editedName, setEditedName] = useState(template.name);
  const [editedTemplate, setEditedTemplate] = useState(JSON.parse(JSON.stringify(template.mealPlanTemplate)));

  const handleSave = () => {
    if (!editedName.trim()) {
      alert('Template name is required');
      return;
    }
    onSave({
      name: editedName.trim(),
      mealPlanTemplate: editedTemplate
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-xl'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Edit Template</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-white/10 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Template Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Template Name</label>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
            placeholder="Enter template name"
          />
        </div>

        {/* Note about editing */}
        <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
            <strong>Note:</strong> To edit meal plan contents, navigate to "Add Meal Plan" page, load this template, make your changes, and save as a new template or update this one.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium ${
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
                ? 'bg-gray-400 cursor-not-allowed text-white/60'
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

export default SelectReadyPlanContent;

