import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, 
  FiTrash2,
  FiCheck,
  FiX,
  FiUsers,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import axios from 'axios';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../context/ThemeContext';
import EmployeeSidebar from '../components/EmployeeSidebar';

const AddMealPlan = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Meal Plan Template State
  const [mealPlanTemplate, setMealPlanTemplate] = useState({
    breakfast: {
      title: '',
      items: [{ name: '', baseGrams: '' }]
    },
    lunch: {
      title: '',
      items: [{ name: '', baseGrams: '' }]
    },
    dinner: {
      title: '',
      items: [{ name: '', baseGrams: '' }]
    },
    snacks: [
      {
        title: '',
        items: [{ name: '', baseGrams: '' }]
      }
    ]
  });

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
          setUsers(response.data.data || []);
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

  // Handle meal plan template changes
  const handleMealChange = (mealType, field, value) => {
    setMealPlanTemplate(prev => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        [field]: value
      }
    }));
  };

  // Handle item name change
  const handleItemNameChange = (mealType, itemIndex, value) => {
    setMealPlanTemplate(prev => {
      const newTemplate = { ...prev };
      if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') {
        const items = [...newTemplate[mealType].items];
        items[itemIndex] = { ...items[itemIndex], name: value };
        newTemplate[mealType] = {
          ...newTemplate[mealType],
          items
        };
      } else if (mealType.startsWith('snack-')) {
        const snackIndex = parseInt(mealType.split('-')[1]);
        const snacks = [...newTemplate.snacks];
        const items = [...snacks[snackIndex].items];
        items[itemIndex] = { ...items[itemIndex], name: value };
        snacks[snackIndex] = {
          ...snacks[snackIndex],
          items
        };
        newTemplate.snacks = snacks;
      }
      return newTemplate;
    });
  };

  // Handle item baseGrams change
  const handleItemBaseGramsChange = (mealType, itemIndex, value) => {
    setMealPlanTemplate(prev => {
      const newTemplate = { ...prev };
      const baseGrams = value === '' ? '' : parseFloat(value) || 0;
      if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') {
        const items = [...newTemplate[mealType].items];
        items[itemIndex] = { ...items[itemIndex], baseGrams };
        newTemplate[mealType] = {
          ...newTemplate[mealType],
          items
        };
      } else if (mealType.startsWith('snack-')) {
        const snackIndex = parseInt(mealType.split('-')[1]);
        const snacks = [...newTemplate.snacks];
        const items = [...snacks[snackIndex].items];
        items[itemIndex] = { ...items[itemIndex], baseGrams };
        snacks[snackIndex] = {
          ...snacks[snackIndex],
          items
        };
        newTemplate.snacks = snacks;
      }
      return newTemplate;
    });
  };

  // Add item to meal
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

  // Remove item from meal
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

  // Add snack (max 3)
  const addSnack = () => {
    if (mealPlanTemplate.snacks.length < 3) {
      setMealPlanTemplate(prev => ({
        ...prev,
        snacks: [
          ...prev.snacks,
          {
            title: '',
            items: [{ name: '', baseGrams: '' }]
          }
        ]
      }));
    } else {
      showNotification({
        type: 'warning',
        message: 'Maximum 3 snacks allowed'
      });
    }
  };

  // Remove snack
  const removeSnack = (snackIndex) => {
    if (mealPlanTemplate.snacks.length > 1) {
      setMealPlanTemplate(prev => ({
        ...prev,
        snacks: prev.snacks.filter((_, i) => i !== snackIndex)
      }));
    }
  };

  // Validate template
  const validateTemplate = () => {
    // Helper to check if item is valid
    const isValidItem = (item) => {
      if (typeof item === 'string') {
        return item.trim() !== '';
      }
      return item.name && item.name.trim() !== '' && item.baseGrams && parseFloat(item.baseGrams) > 0;
    };

    if (!mealPlanTemplate.breakfast.title || mealPlanTemplate.breakfast.items.filter(isValidItem).length === 0) {
      return 'Breakfast title and at least one valid item (with name and base grams) are required';
    }
    if (!mealPlanTemplate.lunch.title || mealPlanTemplate.lunch.items.filter(isValidItem).length === 0) {
      return 'Lunch title and at least one valid item (with name and base grams) are required';
    }
    if (!mealPlanTemplate.dinner.title || mealPlanTemplate.dinner.items.filter(isValidItem).length === 0) {
      return 'Dinner title and at least one valid item (with name and base grams) are required';
    }
    for (let i = 0; i < mealPlanTemplate.snacks.length; i++) {
      const snack = mealPlanTemplate.snacks[i];
      if (!snack.title || snack.items.filter(isValidItem).length === 0) {
        return `Snack ${i + 1} title and at least one valid item (with name and base grams) are required`;
      }
    }
    return null;
  };

  // Handle bulk assign
  const handleBulkAssign = async () => {
    if (selectedUserIds.length === 0) {
      showNotification({
        type: 'error',
        message: 'Please select at least one user'
      });
      return;
    }

    const validationError = validateTemplate();
    if (validationError) {
      showNotification({
        type: 'error',
        message: validationError
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Helper to filter and format items
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
              // Legacy format - convert to object with default baseGrams
              return { name: item.trim(), baseGrams: 100 };
            }
            return {
              name: item.name.trim(),
              baseGrams: parseFloat(item.baseGrams) || 0
            };
          });
      };

      const response = await axios.post(
        'http://localhost:3000/api/mealPlans/bulkAssign',
        {
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
          },
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
          message: `Meal plan assigned to ${selectedUserIds.length} user(s) successfully`
        });
        setShowBulkAssignModal(false);
        setSelectedUserIds([]);
        // Ask if user wants to save as template
        const saveAsTemplate = window.confirm('Would you like to save this meal plan as a template for future use?');
        if (saveAsTemplate) {
          const templateName = window.prompt('Enter a name for this meal plan template:');
          if (templateName && templateName.trim()) {
            try {
              const templateResponse = await axios.post(
                'http://localhost:3000/api/mealPlans/templates',
                {
                  name: templateName.trim(),
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
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );
              if (templateResponse.data.success) {
                showNotification({
                  type: 'success',
                  message: 'Meal plan template saved successfully'
                });
              }
            } catch (error) {
              console.error('Error saving template:', error);
            }
          }
        }
        // Reset form
        setMealPlanTemplate({
          breakfast: { title: '', items: [{ name: '', baseGrams: '' }] },
          lunch: { title: '', items: [{ name: '', baseGrams: '' }] },
          dinner: { title: '', items: [{ name: '', baseGrams: '' }] },
          snacks: [{ title: '', items: [{ name: '', baseGrams: '' }] }]
        });
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

  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template && template.mealPlanTemplate) {
        // Load template data into form
        setMealPlanTemplate(JSON.parse(JSON.stringify(template.mealPlanTemplate)));
        showNotification({
          type: 'success',
          message: 'Template loaded successfully'
        });
      }
    } else {
      // Reset form if "Create New" is selected
      setMealPlanTemplate({
        breakfast: { title: '', items: [{ name: '', baseGrams: '' }] },
        lunch: { title: '', items: [{ name: '', baseGrams: '' }] },
        dinner: { title: '', items: [{ name: '', baseGrams: '' }] },
        snacks: [{ title: '', items: [{ name: '', baseGrams: '' }] }]
      });
    }
  };

  // Toggle user selection
  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Select all users
  const selectAllUsers = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => u.uid));
    }
  };

  // Render meal section
  const renderMealSection = (mealType, label) => {
    const meal = mealPlanTemplate[mealType];
    return (
      <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {label}
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {label} Title
          </label>
          <input
            type="text"
            value={meal.title}
            onChange={(e) => handleMealChange(mealType, 'title', e.target.value)}
            placeholder={`e.g., ${label} Meal`}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <input
                  type="number"
                  value={itemBaseGrams}
                  onChange={(e) => handleItemBaseGramsChange(mealType, itemIndex, e.target.value)}
                  placeholder="Base grams"
                  min="0"
                  step="1"
                  className={`w-36 px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {meal.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(mealType, itemIndex)}
                    className={`px-3 py-2 rounded-lg ${
                      isDarkMode
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-100 hover:bg-red-200 text-red-700'
                    } transition-colors`}
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
            className={`mt-2 px-4 py-2 rounded-lg flex items-center gap-2 ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
            } transition-colors`}
          >
            <FiPlus /> Add Item
          </button>
        </div>
      </div>
    );
  };

  // Render snack section
  const renderSnackSection = (snackIndex) => {
    const snack = mealPlanTemplate.snacks[snackIndex];
    return (
      <div key={snackIndex} className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            Snack {snackIndex + 1}
          </h3>
          {mealPlanTemplate.snacks.length > 1 && (
            <button
              type="button"
              onClick={() => removeSnack(snackIndex)}
              className={`px-3 py-2 rounded-lg ${
                isDarkMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              } transition-colors`}
            >
              <FiTrash2 />
            </button>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Snack Title
          </label>
          <input
            type="text"
            value={snack.title}
            onChange={(e) => {
              const snacks = [...mealPlanTemplate.snacks];
              snacks[snackIndex] = { ...snacks[snackIndex], title: e.target.value };
              setMealPlanTemplate(prev => ({ ...prev, snacks }));
            }}
            placeholder="e.g., Morning Snack"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

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
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <input
                  type="number"
                  value={itemBaseGrams}
                  onChange={(e) => handleItemBaseGramsChange(`snack-${snackIndex}`, itemIndex, e.target.value)}
                  placeholder="Base grams"
                  min="0"
                  step="1"
                  className={`w-36 px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {snack.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(`snack-${snackIndex}`, itemIndex)}
                    className={`px-3 py-2 rounded-lg ${
                      isDarkMode
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-100 hover:bg-red-200 text-red-700'
                    } transition-colors`}
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
            className={`mt-2 px-4 py-2 rounded-lg flex items-center gap-2 ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
            } transition-colors`}
          >
            <FiPlus /> Add Item
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <EmployeeSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <EmployeeSidebar />
      
      <div className={`flex-1 overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Create Meal Plan Template</h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Create a meal plan template and assign it to multiple users. Portions will be automatically adjusted based on each user's body data.
            </p>
          </div>

          {/* Template Selector */}
          {templates.length > 0 && (
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <label className="block text-sm font-medium mb-2">
                Select Existing Template (Optional)
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Create New Meal Plan</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {selectedTemplateId && (
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Template loaded. You can edit it below or use it as-is.
                </p>
              )}
            </div>
          )}

          {/* Meal Plan Form */}
          <div className="mb-6">
            {renderMealSection('breakfast', 'Breakfast')}
            {renderMealSection('lunch', 'Lunch')}
            {renderMealSection('dinner', 'Dinner')}
            
            {/* Snacks Section */}
            <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Snacks</h2>
                {mealPlanTemplate.snacks.length < 3 && (
                  <button
                    type="button"
                    onClick={addSnack}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      isDarkMode
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    } transition-colors`}
                  >
                    <FiPlus /> Add Snack
                  </button>
                )}
              </div>
              {mealPlanTemplate.snacks.map((_, index) => renderSnackSection(index))}
            </div>
          </div>

          {/* Preview Button */}
          <div className="mb-6 flex gap-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } transition-colors`}
            >
              {showPreview ? <FiChevronUp /> : <FiChevronDown />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          {/* Preview Card */}
          {showPreview && (
            <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h2 className="text-2xl font-semibold mb-4">Meal Plan Preview</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">🍳 Breakfast: {mealPlanTemplate.breakfast.title || 'Untitled'}</h3>
                  <ul className="list-disc list-inside ml-4">
                    {mealPlanTemplate.breakfast.items
                      .filter(item => {
                        const name = typeof item === 'string' ? item : (item.name || '');
                        return name.trim() !== '';
                      })
                      .map((item, i) => {
                        const name = typeof item === 'string' ? item : (item.name || '');
                        return <li key={i}>{name}</li>;
                      })}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">🍽️ Lunch: {mealPlanTemplate.lunch.title || 'Untitled'}</h3>
                  <ul className="list-disc list-inside ml-4">
                    {mealPlanTemplate.lunch.items
                      .filter(item => {
                        const name = typeof item === 'string' ? item : (item.name || '');
                        return name.trim() !== '';
                      })
                      .map((item, i) => {
                        const name = typeof item === 'string' ? item : (item.name || '');
                        return <li key={i}>{name}</li>;
                      })}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">🍲 Dinner: {mealPlanTemplate.dinner.title || 'Untitled'}</h3>
                  <ul className="list-disc list-inside ml-4">
                    {mealPlanTemplate.dinner.items
                      .filter(item => {
                        const name = typeof item === 'string' ? item : (item.name || '');
                        return name.trim() !== '';
                      })
                      .map((item, i) => {
                        const name = typeof item === 'string' ? item : (item.name || '');
                        return <li key={i}>{name}</li>;
                      })}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">🍎 Snacks</h3>
                  {mealPlanTemplate.snacks.map((snack, i) => (
                    <div key={i} className="ml-4 mb-2">
                      <h4 className="font-medium">{snack.title || `Snack ${i + 1}`}</h4>
                      <ul className="list-disc list-inside ml-4">
                        {snack.items
                          .filter(item => {
                            const name = typeof item === 'string' ? item : (item.name || '');
                            return name.trim() !== '';
                          })
                          .map((item, j) => {
                            const name = typeof item === 'string' ? item : (item.name || '');
                            return <li key={j}>{name}</li>;
                          })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bulk Assign Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowBulkAssignModal(true)}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
              } transition-colors`}
            >
              <FiUsers /> Bulk Assign Meal Plan
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Assign Modal */}
      {showBulkAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Select Users to Assign Meal Plan</h2>
              <button
                onClick={() => {
                  setShowBulkAssignModal(false);
                  setSelectedUserIds([]);
                }}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={selectAllUsers}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                } transition-colors`}
              >
                {selectedUserIds.length === users.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="ml-4">
                {selectedUserIds.length} user(s) selected
              </span>
            </div>

            <div className="mb-6 max-h-96 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-center py-8">No users available</p>
              ) : (
                <div className="space-y-2">
                  {users.map(user => (
                    <label
                      key={user.uid}
                      className={`flex items-center p-4 rounded-lg cursor-pointer ${
                        isDarkMode
                          ? selectedUserIds.includes(user.uid)
                            ? 'bg-blue-900'
                            : 'bg-gray-700 hover:bg-gray-600'
                          : selectedUserIds.includes(user.uid)
                            ? 'bg-blue-50'
                            : 'bg-gray-50 hover:bg-gray-100'
                      } transition-colors`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.uid)}
                        onChange={() => toggleUserSelection(user.uid)}
                        className="mr-3 w-5 h-5"
                      />
                      <div>
                        <div className="font-medium">{user.displayName || 'Unknown'}</div>
                        <div className="text-sm opacity-75">{user.loginEmail || user.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setShowBulkAssignModal(false);
                  setSelectedUserIds([]);
                }}
                className={`px-6 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAssign}
                disabled={isSubmitting || selectedUserIds.length === 0}
                className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  isSubmitting || selectedUserIds.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } transition-colors`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <FiCheck /> Confirm Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMealPlan;
