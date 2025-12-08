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

const MealPlanManagement = () => {
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
    <div className="flex min-h-screen">
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
              onClick={() => navigate('/employee/add-meal-plan')}
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
                onClick={() => navigate('/employee/add-meal-plan')}
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
              onSave={async (updatedTemplate) => {
                try {
                  setIsSubmitting(true);
                  const token = localStorage.getItem('token');
                  const response = await axios.put(
                    `http://localhost:3000/api/mealPlans/templates/${editingTemplate.id}`,
                    updatedTemplate,
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
              }}
              onClose={() => setEditingTemplate(null)}
              isDarkMode={isDarkMode}
              isSubmitting={isSubmitting}
              showNotification={showNotification}
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
      return (
        <li key={i} className="mb-1">
          {name}
          {baseGrams && <span className={`ml-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>({baseGrams}g base)</span>}
        </li>
      );
    });
  };

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
          {/* Breakfast */}
          {template.mealPlanTemplate.breakfast && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h3 className="text-lg font-semibold mb-2">🍳 Breakfast: {template.mealPlanTemplate.breakfast.title}</h3>
              <ul className="list-disc list-inside ml-4">
                {renderMealItems(template.mealPlanTemplate.breakfast.items)}
              </ul>
            </div>
          )}

          {/* Lunch */}
          {template.mealPlanTemplate.lunch && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h3 className="text-lg font-semibold mb-2">🍽️ Lunch: {template.mealPlanTemplate.lunch.title}</h3>
              <ul className="list-disc list-inside ml-4">
                {renderMealItems(template.mealPlanTemplate.lunch.items)}
              </ul>
            </div>
          )}

          {/* Dinner */}
          {template.mealPlanTemplate.dinner && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h3 className="text-lg font-semibold mb-2">🍲 Dinner: {template.mealPlanTemplate.dinner.title}</h3>
              <ul className="list-disc list-inside ml-4">
                {renderMealItems(template.mealPlanTemplate.dinner.items)}
              </ul>
            </div>
          )}

          {/* Snacks */}
          {template.mealPlanTemplate.snacks && template.mealPlanTemplate.snacks.length > 0 && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h3 className="text-lg font-semibold mb-2">🍎 Snacks</h3>
              {template.mealPlanTemplate.snacks.map((snack, i) => (
                <div key={i} className="mb-3">
                  <h4 className="font-medium mb-1">{snack.title || `Snack ${i + 1}`}</h4>
                  <ul className="list-disc list-inside ml-4">
                    {renderMealItems(snack.items)}
                  </ul>
                </div>
              ))}
            </div>
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
              users.map((user) => (
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
                  </div>
                </label>
              ))
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

// Edit Template Modal Component (reuses AddMealPlan form structure)
const EditTemplateModal = ({ template, onSave, onClose, isDarkMode, isSubmitting, showNotification }) => {
  const [name, setName] = useState(template.name);
  const [mealPlanTemplate, setMealPlanTemplate] = useState(JSON.parse(JSON.stringify(template.mealPlanTemplate)));

  // Reuse handlers from AddMealPlan.jsx structure
  const handleItemNameChange = (mealType, itemIndex, value) => {
    setMealPlanTemplate(prev => {
      const newTemplate = { ...prev };
      if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') {
        const items = [...newTemplate[mealType].items];
        items[itemIndex] = { ...items[itemIndex], name: value };
        newTemplate[mealType] = { ...newTemplate[mealType], items };
      } else if (mealType.startsWith('snack-')) {
        const snackIndex = parseInt(mealType.split('-')[1]);
        const snacks = [...newTemplate.snacks];
        const items = [...snacks[snackIndex].items];
        items[itemIndex] = { ...items[itemIndex], name: value };
        snacks[snackIndex] = { ...snacks[snackIndex], items };
        newTemplate.snacks = snacks;
      }
      return newTemplate;
    });
  };

  const handleItemBaseGramsChange = (mealType, itemIndex, value) => {
    setMealPlanTemplate(prev => {
      const newTemplate = { ...prev };
      const baseGrams = value === '' ? '' : parseFloat(value) || 0;
      if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') {
        const items = [...newTemplate[mealType].items];
        items[itemIndex] = { ...items[itemIndex], baseGrams };
        newTemplate[mealType] = { ...newTemplate[mealType], items };
      } else if (mealType.startsWith('snack-')) {
        const snackIndex = parseInt(mealType.split('-')[1]);
        const snacks = [...newTemplate.snacks];
        const items = [...snacks[snackIndex].items];
        items[itemIndex] = { ...items[itemIndex], baseGrams };
        snacks[snackIndex] = { ...snacks[snackIndex], items };
        newTemplate.snacks = snacks;
      }
      return newTemplate;
    });
  };

  const handleMealTitleChange = (mealType, value) => {
    setMealPlanTemplate(prev => {
      const newTemplate = { ...prev };
      if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') {
        newTemplate[mealType] = { ...newTemplate[mealType], title: value };
      } else if (mealType.startsWith('snack-')) {
        const snackIndex = parseInt(mealType.split('-')[1]);
        const snacks = [...newTemplate.snacks];
        snacks[snackIndex] = { ...snacks[snackIndex], title: value };
        newTemplate.snacks = snacks;
      }
      return newTemplate;
    });
  };

  const addItem = (mealType) => {
    setMealPlanTemplate(prev => {
      const newTemplate = { ...prev };
      if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') {
        newTemplate[mealType] = {
          ...newTemplate[mealType],
          items: [...newTemplate[mealType].items, { name: '', baseGrams: '' }]
        };
      } else if (mealType.startsWith('snack-')) {
        const snackIndex = parseInt(mealType.split('-')[1]);
        const snacks = [...newTemplate.snacks];
        snacks[snackIndex] = {
          ...snacks[snackIndex],
          items: [...snacks[snackIndex].items, { name: '', baseGrams: '' }]
        };
        newTemplate.snacks = snacks;
      }
      return newTemplate;
    });
  };

  const removeItem = (mealType, itemIndex) => {
    setMealPlanTemplate(prev => {
      const newTemplate = { ...prev };
      if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') {
        newTemplate[mealType] = {
          ...newTemplate[mealType],
          items: newTemplate[mealType].items.filter((_, i) => i !== itemIndex)
        };
      } else if (mealType.startsWith('snack-')) {
        const snackIndex = parseInt(mealType.split('-')[1]);
        const snacks = [...newTemplate.snacks];
        snacks[snackIndex] = {
          ...snacks[snackIndex],
          items: snacks[snackIndex].items.filter((_, i) => i !== itemIndex)
        };
        newTemplate.snacks = snacks;
      }
      return newTemplate;
    });
  };

  const addSnack = () => {
    if (mealPlanTemplate.snacks.length < 3) {
      setMealPlanTemplate(prev => ({
        ...prev,
        snacks: [...prev.snacks, { title: '', items: [{ name: '', baseGrams: '' }] }]
      }));
    }
  };

  const removeSnack = (snackIndex) => {
    if (mealPlanTemplate.snacks.length > 1) {
      setMealPlanTemplate(prev => ({
        ...prev,
        snacks: prev.snacks.filter((_, i) => i !== snackIndex)
      }));
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      showNotification({
        type: 'error',
        message: 'Meal plan name is required'
      });
      return;
    }

    // Format items for backend
    const formatItems = (items) => {
      return items
        .filter(item => {
          if (typeof item === 'string') {
            return item.trim() !== '';
          }
          return item.name && item.name.trim() !== '' && item.baseGrams && parseFloat(item.baseGrams) > 0;
        })
        .map(item => {
          if (typeof item === 'string') {
            return { name: item.trim(), baseGrams: 100 };
          }
          return {
            name: item.name.trim(),
            baseGrams: parseFloat(item.baseGrams) || 0
          };
        });
    };

    onSave({
      name,
      mealPlanTemplate: {
        breakfast: {
          title: mealPlanTemplate.breakfast.title,
          items: formatItems(mealPlanTemplate.breakfast.items)
        },
        lunch: {
          title: mealPlanTemplate.lunch.title,
          items: formatItems(mealPlanTemplate.lunch.items)
        },
        dinner: {
          title: mealPlanTemplate.dinner.title,
          items: formatItems(mealPlanTemplate.dinner.items)
        },
        snacks: mealPlanTemplate.snacks.map(snack => ({
          title: snack.title,
          items: formatItems(snack.items)
        }))
      }
    });
  };

  const renderMealSection = (mealType, label) => {
    const meal = mealPlanTemplate[mealType];
    return (
      <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">{label} Title</label>
          <input
            type="text"
            value={meal.title}
            onChange={(e) => handleMealTitleChange(mealType, e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Food Items (Grams will be calculated automatically based on each user's body data)
          </label>
          {meal.items.map((item, itemIndex) => {
            const itemName = typeof item === 'string' ? item : (item.name || '');
            const itemBaseGrams = typeof item === 'string' ? '' : (item.baseGrams || '');
            return (
              <div key={itemIndex} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => handleItemNameChange(mealType, itemIndex, e.target.value)}
                  placeholder={`Item ${itemIndex + 1} name`}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <input
                  type="number"
                  value={itemBaseGrams}
                  onChange={(e) => handleItemBaseGramsChange(mealType, itemIndex, e.target.value)}
                  placeholder="Base grams"
                  min="0"
                  step="1"
                  className={`w-36 px-4 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
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
            );
          })}
          <button
            type="button"
            onClick={() => addItem(mealType)}
            className={`mt-2 px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
            }`}
          >
            <FiPlus /> Add Item
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
          <h2 className="text-2xl font-bold">Edit Meal Plan Template</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-white/10 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Meal Plan Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
            placeholder="Enter meal plan name"
          />
        </div>

        <div className="space-y-4">
          {renderMealSection('breakfast', 'Breakfast')}
          {renderMealSection('lunch', 'Lunch')}
          {renderMealSection('dinner', 'Dinner')}

          {/* Snacks */}
          <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Snacks</h3>
              {mealPlanTemplate.snacks.length < 3 && (
                <button
                  type="button"
                  onClick={addSnack}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  <FiPlus /> Add Snack
                </button>
              )}
            </div>
            {mealPlanTemplate.snacks.map((snack, snackIndex) => (
              <div key={snackIndex} className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium">Snack {snackIndex + 1} Title</label>
                  {mealPlanTemplate.snacks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSnack(snackIndex)}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        isDarkMode
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-red-100 hover:bg-red-200 text-red-700'
                      }`}
                    >
                      <FiTrash2 /> Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={snack.title}
                  onChange={(e) => handleMealTitleChange(`snack-${snackIndex}`, e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border mb-3 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Food Items (Grams will be calculated automatically based on each user's body data)
                  </label>
                  {snack.items.map((item, itemIndex) => {
                    const itemName = typeof item === 'string' ? item : (item.name || '');
                    const itemBaseGrams = typeof item === 'string' ? '' : (item.baseGrams || '');
                    return (
                      <div key={itemIndex} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={itemName}
                          onChange={(e) => handleItemNameChange(`snack-${snackIndex}`, itemIndex, e.target.value)}
                          placeholder={`Item ${itemIndex + 1} name`}
                          className={`flex-1 px-4 py-2 rounded-lg border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                        />
                        <input
                          type="number"
                          value={itemBaseGrams}
                          onChange={(e) => handleItemBaseGramsChange(`snack-${snackIndex}`, itemIndex, e.target.value)}
                          placeholder="Base grams"
                          min="0"
                          step="1"
                          className={`w-36 px-4 py-2 rounded-lg border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                        />
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
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => addItem(`snack-${snackIndex}`)}
                    className={`mt-2 px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                    }`}
                  >
                    <FiPlus /> Add Item
                  </button>
                </div>
              </div>
            ))}
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

export default MealPlanManagement;

