import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, 
  FiTrash2,
  FiCheck,
  FiX,
  FiUsers,
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiClipboard,
  FiMenu
} from 'react-icons/fi';
import axios from 'axios';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../context/ThemeContext';
import EmployeeSidebar from '../components/EmployeeSidebar';

const AddMealPlanContent = () => {
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
  const [mealPlanType, setMealPlanType] = useState('Maintain Weight');

  // AI Generator state
  const [aiGenerating, setAiGenerating] = useState(false);

  // Fixed meal categories
  const CATEGORY_KEYS = ['protein', 'carbs', 'fats', 'meat', 'chicken', 'fish'];

  const createEmptyCategories = () => ({
    protein: [{ name: '', baseGrams: '' }],
    carbs: [{ name: '', baseGrams: '' }],
    fats: [{ name: '', baseGrams: '' }],
    meat: [{ name: '', baseGrams: '' }],
    chicken: [{ name: '', baseGrams: '' }],
    fish: [{ name: '', baseGrams: '' }]
  });

  const buildItemsFromCategories = (categories) => {
    if (!categories) return [];
    return CATEGORY_KEYS.flatMap((key) => categories[key] || []);
  };

  // Accordion state - first Breakfast, Lunch, Dinner expanded by default, Snacks collapsed
  const [expandedSections, setExpandedSections] = useState({
    'breakfasts-0': true,
    'lunches-0': true,
    'dinners-0': true,
    'snacks-0': false
  });

  // Autocomplete state
  const [autocompleteState, setAutocompleteState] = useState({
    activeInput: null, // Format: 'breakfast-0' or 'snack-0-1'
    suggestions: [],
    showSuggestions: false
  });

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedSnack, setDraggedSnack] = useState(null);

  // Copy/paste clipboard state
  const [mealClipboard, setMealClipboard] = useState(null);

  // Food item suggestions
  const foodSuggestions = [
    { name: 'Chicken Breast', grams: 100 },
    { name: 'Rice (white)', grams: 130 },
    { name: 'Oats', grams: 40 },
    { name: 'Egg', grams: 60 },
    { name: 'Cheese', grams: 30 },
    { name: 'Chickpeas', grams: 50 },
    { name: 'Salmon', grams: 120 },
    { name: 'Broccoli', grams: 100 },
    { name: 'Sweet Potato', grams: 150 },
    { name: 'Greek Yogurt', grams: 200 },
    { name: 'Banana', grams: 120 },
    { name: 'Almonds', grams: 30 },
    { name: 'Quinoa', grams: 100 },
    { name: 'Spinach', grams: 50 },
    { name: 'Tuna', grams: 100 },
    { name: 'Avocado', grams: 100 },
    { name: 'Brown Rice', grams: 130 },
    { name: 'Turkey Breast', grams: 100 },
    { name: 'Cottage Cheese', grams: 150 },
    { name: 'Apple', grams: 150 }
  ];

  // Meal Plan Template State
  const [mealPlanTemplate, setMealPlanTemplate] = useState({
    breakfasts: [
      {
        title: '',
        categories: createEmptyCategories(),
        items: buildItemsFromCategories(createEmptyCategories())
      }
    ],
    lunches: [
      {
        title: '',
        categories: createEmptyCategories(),
        items: buildItemsFromCategories(createEmptyCategories())
      }
    ],
    dinners: [
      {
        title: '',
        categories: createEmptyCategories(),
        items: buildItemsFromCategories(createEmptyCategories())
      }
    ],
    snacks: [
      {
        title: '',
        categories: createEmptyCategories(),
        items: buildItemsFromCategories(createEmptyCategories())
      }
    ]
  });

  // Fetch users and templates
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch users and templates in parallel for better performance
        const [usersResponse, templatesResponse] = await Promise.all([
          axios.get('http://localhost:3000/api/employee/users', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3000/api/mealPlans/templates', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (usersResponse.data.success) {
          setUsers(usersResponse.data.data || []);
        }

        if (templatesResponse.data.success) {
          setTemplates(templatesResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showNotification({
          type: 'error',
          message: 'Failed to fetch data'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, showNotification]);

  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);
    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      if (template && template.mealPlanTemplate) {
        const tpl = template.mealPlanTemplate || {};

        // Normalize old/new template structures into array-based structure
        const normalizeSectionArray = (singleKey, arrayKey) => {
          if (Array.isArray(tpl[arrayKey]) && tpl[arrayKey].length > 0) {
            return tpl[arrayKey];
          }
          if (tpl[singleKey]) {
            return [tpl[singleKey]];
          }
          return [
            {
              title: '',
              items: [{ name: '', baseGrams: '' }]
            }
          ];
        };

        const normalizeSectionWithCategories = (section) => {
          const base = section || { title: '' };
          let categories = base.categories;

          // If categories not present, derive them from flat items (put all into protein)
          if (!categories) {
            const fromItems = base.items || [];
            const empty = createEmptyCategories();
            empty.protein = fromItems.length > 0 ? fromItems : empty.protein;
            categories = empty;
          }

          // Ensure all category keys exist and are arrays
          const normalizedCategories = {};
          CATEGORY_KEYS.forEach((key) => {
            const arr = categories[key];
            if (Array.isArray(arr) && arr.length > 0) {
              normalizedCategories[key] = arr.map((item) => ({
                name: item.name || '',
                baseGrams: item.baseGrams || ''
              }));
            } else {
              normalizedCategories[key] = [{ name: '', baseGrams: '' }];
            }
          });

          return {
            title: base.title || '',
            categories: normalizedCategories,
            items: buildItemsFromCategories(normalizedCategories)
          };
        };

        const normalizedTemplate = {
          breakfasts: normalizeSectionArray('breakfast', 'breakfasts').map(normalizeSectionWithCategories),
          lunches: normalizeSectionArray('lunch', 'lunches').map(normalizeSectionWithCategories),
          dinners: normalizeSectionArray('dinner', 'dinners').map(normalizeSectionWithCategories),
          snacks: (Array.isArray(tpl.snacks) && tpl.snacks.length > 0
            ? tpl.snacks
            : [
                {
                  title: '',
                  items: [{ name: '', baseGrams: '' }]
                }
              ]).map(normalizeSectionWithCategories)
        };

        setMealPlanTemplate(JSON.parse(JSON.stringify(normalizedTemplate)));

        // Reset accordion state for loaded template
        setExpandedSections((prev) => {
          const next = {};
          normalizedTemplate.breakfasts.forEach((_, i) => {
            next[`breakfasts-${i}`] = i === 0;
          });
          normalizedTemplate.lunches.forEach((_, i) => {
            next[`lunches-${i}`] = i === 0;
          });
          normalizedTemplate.dinners.forEach((_, i) => {
            next[`dinners-${i}`] = i === 0;
          });
          normalizedTemplate.snacks.forEach((_, i) => {
            next[`snacks-${i}`] = false;
          });
          return next;
        });

        // Load mealPlanType if it exists in template
        if (template.mealPlanType) {
          setMealPlanType(template.mealPlanType);
        }
        showNotification({
          type: 'success',
          message: 'Template loaded successfully'
        });
      }
    } else {
      // Reset form if "Create New" is selected
      const emptyCategories = createEmptyCategories();
      setMealPlanTemplate({
        breakfasts: [
          {
            title: '',
            categories: emptyCategories,
            items: buildItemsFromCategories(emptyCategories)
          }
        ],
        lunches: [
          {
            title: '',
            categories: emptyCategories,
            items: buildItemsFromCategories(emptyCategories)
          }
        ],
        dinners: [
          {
            title: '',
            categories: emptyCategories,
            items: buildItemsFromCategories(emptyCategories)
          }
        ],
        snacks: [
          {
            title: '',
            categories: emptyCategories,
            items: buildItemsFromCategories(emptyCategories)
          }
        ]
      });
      setExpandedSections({
        'breakfasts-0': true,
        'lunches-0': true,
        'dinners-0': true,
        'snacks-0': false
      });
      setMealPlanType('Maintain Weight');
    }
  };

  // Helpers to work with array-based sections (breakfasts, lunches, dinners, snacks)
  const parseMealType = (mealType) => {
    // mealType format: "<sectionKey>-<index>", e.g. "breakfasts-0", "snacks-1"
    const [sectionKey, indexStr] = mealType.split('-');
    const sectionIndex = indexStr !== undefined ? parseInt(indexStr, 10) : 0;
    return { sectionKey, sectionIndex };
  };

  // Handle meal plan template changes (title for a single section)
  const handleMealChange = (mealType, field, value) => {
    const { sectionKey, sectionIndex } = parseMealType(mealType);
    setMealPlanTemplate((prev) => {
      const sections = [...prev[sectionKey]];
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        [field]: value
      };
      return {
        ...prev,
        [sectionKey]: sections
      };
    });
  };

  // Handle item name change per category
  const handleItemNameChange = (mealType, categoryKey, itemIndex, value) => {
    const { sectionKey, sectionIndex } = parseMealType(mealType);
    setMealPlanTemplate((prev) => {
      const newTemplate = { ...prev };
      const sections = [...newTemplate[sectionKey]];
      const section = { ...sections[sectionIndex] };
      const categories = { ...section.categories };
      const categoryItems = [...(categories[categoryKey] || [])];
      categoryItems[itemIndex] = { ...categoryItems[itemIndex], name: value };
      categories[categoryKey] = categoryItems;
      section.categories = categories;
      section.items = buildItemsFromCategories(categories);
      sections[sectionIndex] = section;
      newTemplate[sectionKey] = sections;
      return newTemplate;
    });
  };

  // Handle item baseGrams change per category
  const handleItemBaseGramsChange = (mealType, categoryKey, itemIndex, value) => {
    const { sectionKey, sectionIndex } = parseMealType(mealType);
    setMealPlanTemplate((prev) => {
      const newTemplate = { ...prev };
      const baseGrams = value === '' ? '' : parseFloat(value) || 0;
      const sections = [...newTemplate[sectionKey]];
      const section = { ...sections[sectionIndex] };
      const categories = { ...section.categories };
      const categoryItems = [...(categories[categoryKey] || [])];
      categoryItems[itemIndex] = { ...categoryItems[itemIndex], baseGrams };
      categories[categoryKey] = categoryItems;
      section.categories = categories;
      section.items = buildItemsFromCategories(categories);
      sections[sectionIndex] = section;
      newTemplate[sectionKey] = sections;
      return newTemplate;
    });
  };

  // Add item to a specific category in a section
  const addItem = (mealType, categoryKey) => {
    const { sectionKey, sectionIndex } = parseMealType(mealType);
    setMealPlanTemplate((prev) => {
      const newTemplate = { ...prev };
      const sections = [...newTemplate[sectionKey]];
      const section = { ...sections[sectionIndex] };
      const categories = { ...section.categories };
      const categoryItems = [...(categories[categoryKey] || [])];
      categoryItems.push({ name: '', baseGrams: '' });
      categories[categoryKey] = categoryItems;
      section.categories = categories;
      section.items = buildItemsFromCategories(categories);
      sections[sectionIndex] = section;
      newTemplate[sectionKey] = sections;
      return newTemplate;
    });
  };

  // Remove item from a specific category in a section
  const removeItem = (mealType, categoryKey, itemIndex) => {
    const { sectionKey, sectionIndex } = parseMealType(mealType);
    setMealPlanTemplate((prev) => {
      const newTemplate = { ...prev };
      const sections = [...newTemplate[sectionKey]];
      const section = { ...sections[sectionIndex] };
      const categories = { ...section.categories };
      const categoryItems = [...(categories[categoryKey] || [])].filter((_, i) => i !== itemIndex);
      categories[categoryKey] = categoryItems.length > 0 ? categoryItems : [{ name: '', baseGrams: '' }];
      section.categories = categories;
      section.items = buildItemsFromCategories(categories);
      sections[sectionIndex] = section;
      newTemplate[sectionKey] = sections;
      return newTemplate;
    });
  };

  // Add snack
  const addSnack = () => {
    const maxSnacks = 3;
    if (mealPlanTemplate.snacks.length >= maxSnacks) return;

    const newSnackIndex = mealPlanTemplate.snacks.length;
    setMealPlanTemplate((prev) => ({
      ...prev,
      snacks: [
        ...prev.snacks,
        { title: '', items: [{ name: '', baseGrams: '' }] }
      ]
    }));
    // Add accordion state for new snack (collapsed by default)
    setExpandedSections((prev) => ({
      ...prev,
      [`snacks-${newSnackIndex}`]: false
    }));
  };

  // Remove snack
  const removeSnack = (snackIndex) => {
    if (mealPlanTemplate.snacks.length > 1) {
      setMealPlanTemplate((prev) => ({
        ...prev,
        snacks: prev.snacks.filter((_, i) => i !== snackIndex)
      }));
      // Clean up accordion state - reindex remaining snacks
      setExpandedSections((prev) => {
        const newState = { ...prev };
        // Remove the deleted snack's state
        delete newState[`snacks-${snackIndex}`];
        // Reindex remaining snacks
        const remainingSnacks = mealPlanTemplate.snacks.filter((_, i) => i !== snackIndex);
        remainingSnacks.forEach((_, newIndex) => {
          const oldIndex = newIndex >= snackIndex ? newIndex + 1 : newIndex;
          if (newState[`snacks-${oldIndex}`] !== undefined) {
            newState[`snacks-${newIndex}`] = newState[`snacks-${oldIndex}`];
            if (newIndex !== oldIndex) {
              delete newState[`snacks-${oldIndex}`];
            }
          }
        });
        return newState;
      });
    }
  };

  // Validate template
  const validateTemplate = () => {
    const sectionsConfig = [
      { key: 'breakfasts', label: 'Breakfast' },
      { key: 'lunches', label: 'Lunch' },
      { key: 'dinners', label: 'Dinner' }
    ];

    for (const { key, label } of sectionsConfig) {
      if (!mealPlanTemplate[key] || mealPlanTemplate[key].length === 0) {
        return `${label} section is required`;
      }
      for (let i = 0; i < mealPlanTemplate[key].length; i++) {
        const section = mealPlanTemplate[key][i];
        if (!section.title.trim()) {
          return `${label} ${i + 1} title is required`;
        }
        if (
          !section.items.some((item) => {
            const name = typeof item === 'string' ? item : item.name || '';
            return name.trim() !== '';
          })
        ) {
          return `${label} ${i + 1} must have at least one item`;
        }
      }
    }

    for (let i = 0; i < mealPlanTemplate.snacks.length; i++) {
      const snack = mealPlanTemplate.snacks[i];
      if (!snack.title.trim()) {
        return `Snack ${i + 1} title is required`;
      }
      // Check across all categories for at least one non-empty item
      const hasItem = CATEGORY_KEYS.some((key) =>
        (snack.categories?.[key] || []).some((item) => {
          const name = typeof item === 'string' ? item : item.name || '';
          return name.trim() !== '';
        })
      );
      if (!hasItem) {
        return `Snack ${i + 1} must have at least one item`;
      }
    }
    return null;
  };

  // Handle bulk assign
  const handleBulkAssign = async () => {
    const validationError = validateTemplate();
    if (validationError) {
      showNotification({
        type: 'error',
        message: validationError
      });
      return;
    }

    if (selectedUserIds.length === 0) {
      showNotification({
        type: 'error',
        message: 'Please select at least one user'
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
            breakfasts: mealPlanTemplate.breakfasts.map((section) => ({
              title: section.title,
              items: formatItems(section.items)
            })),
            lunches: mealPlanTemplate.lunches.map((section) => ({
              title: section.title,
              items: formatItems(section.items)
            })),
            dinners: mealPlanTemplate.dinners.map((section) => ({
              title: section.title,
              items: formatItems(section.items)
            })),
            snacks: mealPlanTemplate.snacks.map((snack) => ({
              title: snack.title,
              items: formatItems(snack.items)
            }))
          },
          mealPlanType,
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
                  mealPlanType,
                  mealPlanTemplate: {
                    breakfasts: mealPlanTemplate.breakfasts.map((section) => ({
                      title: section.title,
                      categories: section.categories || {},
                      items: formatItems(section.items)
                    })),
                    lunches: mealPlanTemplate.lunches.map((section) => ({
                      title: section.title,
                      categories: section.categories || {},
                      items: formatItems(section.items)
                    })),
                    dinners: mealPlanTemplate.dinners.map((section) => ({
                      title: section.title,
                      categories: section.categories || {},
                      items: formatItems(section.items)
                    })),
                    snacks: mealPlanTemplate.snacks.map((snack) => ({
                      title: snack.title,
                      categories: snack.categories || {},
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
          breakfasts: [{ title: '', items: [{ name: '', baseGrams: '' }] }],
          lunches: [{ title: '', items: [{ name: '', baseGrams: '' }] }],
          dinners: [{ title: '', items: [{ name: '', baseGrams: '' }] }],
          snacks: [{ title: '', items: [{ name: '', baseGrams: '' }] }]
        });
        setExpandedSections({
          'breakfasts-0': true,
          'lunches-0': true,
          'dinners-0': true,
          'snacks-0': false
        });
        setMealPlanType('Maintain Weight');
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

  // Toggle accordion section
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Handle autocomplete input
  const handleAutocompleteInput = (mealType, categoryKey, itemIndex, value) => {
    // Update the input value
    handleItemNameChange(mealType, categoryKey, itemIndex, value);

    // Show suggestions if there's text
    if (value.trim().length > 0) {
      const filtered = foodSuggestions.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setAutocompleteState({
        activeInput: `${mealType}-${categoryKey}-${itemIndex}`,
        suggestions: filtered,
        showSuggestions: filtered.length > 0
      });
    } else {
      setAutocompleteState({
        activeInput: null,
        suggestions: [],
        showSuggestions: false
      });
    }
  };

  // Select autocomplete suggestion
  const selectSuggestion = (mealType, categoryKey, itemIndex, suggestion) => {
    handleItemNameChange(mealType, categoryKey, itemIndex, suggestion.name);
    handleItemBaseGramsChange(mealType, categoryKey, itemIndex, suggestion.grams.toString());
    setAutocompleteState({
      activeInput: null,
      suggestions: [],
      showSuggestions: false
    });
  };

  // Drag and drop handlers for items
  const handleDragStart = (e, mealType, categoryKey, itemIndex) => {
    setDraggedItem({ mealType, categoryKey, itemIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, mealType, categoryKey, targetIndex) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { mealType: sourceMealType, categoryKey: sourceCategoryKey, itemIndex: sourceIndex } = draggedItem;

    if (sourceMealType === mealType && sourceCategoryKey === categoryKey && sourceIndex !== targetIndex) {
      const { sectionKey, sectionIndex } = parseMealType(mealType);
      setMealPlanTemplate((prev) => {
        const newTemplate = { ...prev };
        const sections = [...newTemplate[sectionKey]];
        const section = { ...sections[sectionIndex] };
        const categories = { ...section.categories };
        const categoryItems = [...(categories[categoryKey] || [])];
        const [removed] = categoryItems.splice(sourceIndex, 1);
        categoryItems.splice(targetIndex, 0, removed);
        categories[categoryKey] = categoryItems;
        section.categories = categories;
        section.items = buildItemsFromCategories(categories);
        sections[sectionIndex] = section;
        newTemplate[sectionKey] = sections;
        return newTemplate;
      });
    }

    setDraggedItem(null);
  };

  // Drag and drop handlers for snacks
  const handleSnackDragStart = (e, snackIndex) => {
    setDraggedSnack(snackIndex);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSnackDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedSnack === null || draggedSnack === targetIndex) return;

    setMealPlanTemplate(prev => {
      const snacks = [...prev.snacks];
      const [removed] = snacks.splice(draggedSnack, 1);
      snacks.splice(targetIndex, 0, removed);
      return { ...prev, snacks };
    });

    setDraggedSnack(null);
  };

  // Copy meal function
  const copyMeal = (mealType) => {
    const { sectionKey, sectionIndex } = parseMealType(mealType);
    const isSnackSection = sectionKey === 'snacks';

    const copiedMeal = isSnackSection
      ? mealPlanTemplate.snacks[sectionIndex]
      : mealPlanTemplate[sectionKey][sectionIndex];

    setMealClipboard({
      type: isSnackSection ? 'snack' : sectionKey,
      meal: JSON.parse(JSON.stringify(copiedMeal))
    });

    const labelBase =
      sectionKey === 'breakfasts'
        ? 'Breakfast'
        : sectionKey === 'lunches'
          ? 'Lunch'
          : sectionKey === 'dinners'
            ? 'Dinner'
            : 'Snack';

    const sectionNumber = sectionIndex + 1;

    showNotification({
      type: 'success',
      message: `${labelBase} ${sectionNumber} copied to clipboard`
    });
  };

  // AI Meal Plan Generator - Call Gemini API
  // AI Meal Plan Generator - Call Gemini API
  const generateAIMealPlan = async (formData) => {
    try {
      setAiGenerating(true);
      
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API Key is missing in .env file');
      }

      // 1. Define the Goal
      const goal = formData.goal || 'Maintain Weight';

      // 2. Define System Instructions (The "Persona")
      // Based on your docs: "You can guide the behavior of Gemini models with system instructions."
      const systemInstruction = {
        parts: [{
          text: `You are a professional dietitian.
Generate a healthy and realistic one-day meal plan according to the user goal: ${goal}.

Return ONLY valid JSON (no markdown).
Use this exact structure:

{
  "breakfasts": [
    {
      "title": "Breakfast 1",
      "protein":   [ { "name":"string", "baseGrams":number } ],
      "carbs":     [ { "name":"string", "baseGrams":number } ],
      "fats":      [ { "name":"string", "baseGrams":number } ],
      "meat":      [ { "name":"string", "baseGrams":number } ],
      "chicken":   [ { "name":"string", "baseGrams":number } ],
      "fish":      [ { "name":"string", "baseGrams":number } ]
    }
    // exactly 10 breakfast objects total
  ],
  "lunches": [
    {
      "title": "Lunch 1",
      "protein":   [ { "name":"string", "baseGrams":number } ],
      "carbs":     [ { "name":"string", "baseGrams":number } ],
      "fats":      [ { "name":"string", "baseGrams":number } ],
      "meat":      [ { "name":"string", "baseGrams":number } ],
      "chicken":   [ { "name":"string", "baseGrams":number } ],
      "fish":      [ { "name":"string", "baseGrams":number } ]
    }
    // exactly 10 lunch objects total
  ],
  "dinners": [
    {
      "title": "Dinner 1",
      "protein":   [ { "name":"string", "baseGrams":number } ],
      "carbs":     [ { "name":"string", "baseGrams":number } ],
      "fats":      [ { "name":"string", "baseGrams":number } ],
      "meat":      [ { "name":"string", "baseGrams":number } ],
      "chicken":   [ { "name":"string", "baseGrams":number } ],
      "fish":      [ { "name":"string", "baseGrams":number } ]
    }
    // exactly 10 dinner objects total
  ],
  "snacks": [
    {
      "title": "Snack 1",
      "protein":   [ { "name":"string", "baseGrams":number } ],
      "carbs":     [ { "name":"string", "baseGrams":number } ],
      "fats":      [ { "name":"string", "baseGrams":number } ],
      "meat":      [ { "name":"string", "baseGrams":number } ],
      "chicken":   [ { "name":"string", "baseGrams":number } ],
      "fish":      [ { "name":"string", "baseGrams":number } ]
    }
    // exactly 10 snack objects total
  ]
}

Rules:
- Generate 10 UNIQUE breakfasts, 10 UNIQUE lunches, 10 UNIQUE dinners, and 10 UNIQUE snacks.
- Do NOT repeat the same combination of foods between meals.
- Each category (protein, carbs, fats, meat, chicken, fish) should contain 0–3 items.
- baseGrams MUST be an integer (no decimals).
- Foods must be realistic, healthy, and commonly available.
- For weight loss → prioritize lower carbs, moderate protein, controlled fats.
- For weight gain → prioritize higher carbs and higher protein, with moderate fats.
- For maintenance → balanced carbs, protein, and fats.
- Total items per meal (sum of all categories) should be around 5–15 items.
- Respond with JSON only – no explanations, no markdown.`
        }]
      };

      // 3. Define the User Prompt
      const userPrompt = {
        parts: [{
          text: `Create a plan for a user with the goal: "${goal}".`
        }]
      };

      // 4. Make the Request using gemini-2.5-flash
      // Using the REST endpoint from your docs
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: systemInstruction,
          contents: [userPrompt],
          generationConfig: {
            responseMimeType: "application/json", // Forces JSON output
            temperature: 0.7 // Balanced creativity
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // 5. Extract Data
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Unexpected response format from AI');
      }

      const responseText = data.candidates[0].content.parts[0].text;
      const mealPlanData = JSON.parse(responseText);

      // 6. Populate State (normalize into array-based structure)
      const normalizeItems = (items) =>
        (items || []).map((item) => ({
          name: item.name || '',
          baseGrams: Number.isFinite(parseInt(item.baseGrams, 10))
            ? parseInt(item.baseGrams, 10)
            : 100
        }));

      const buildCategoriesFromAISection = (section) => {
        const base = section || {};
        const categories = {};
        CATEGORY_KEYS.forEach((key) => {
          const rawItems = base[key] || [];
          categories[key] = normalizeItems(rawItems);
        });
        return categories;
      };

      const buildSectionsFromArray = (arr, baseLabel) => {
        if (!Array.isArray(arr)) return [];
        return arr.map((meal, index) => {
          const categories = buildCategoriesFromAISection(meal);
          return {
            title: meal.title || `${baseLabel} ${index + 1}`,
            categories,
            items: buildItemsFromCategories(categories)
          };
        });
      };

      const aiTemplate = {
        breakfasts: buildSectionsFromArray(mealPlanData.breakfasts, 'Breakfast'),
        lunches: buildSectionsFromArray(mealPlanData.lunches, 'Lunch'),
        dinners: buildSectionsFromArray(mealPlanData.dinners, 'Dinner'),
        snacks: buildSectionsFromArray(mealPlanData.snacks, 'Snack')
      };

      setMealPlanTemplate(aiTemplate);

      setMealPlanType(goal);

      showNotification({
        type: 'success',
        message: 'AI Meal Plan generated with Gemini 2.5!'
      });

    } catch (error) {
      console.error('AI generation error:', error);
      showNotification({
        type: 'error',
        message: error.message || 'Failed to generate AI meal plan'
      });
    } finally {
      setAiGenerating(false);
    }
  };


  // Paste meal function
  const pasteMeal = (mealType) => {
    const { sectionKey, sectionIndex } = parseMealType(mealType);

    if (!mealClipboard) {
      showNotification({
        type: 'error',
        message: 'No meal in clipboard'
      });
      return;
    }

    const isSnackSection = sectionKey === 'snacks';

    if (!isSnackSection && mealClipboard.type === 'snack') {
      showNotification({
        type: 'error',
        message: 'Cannot paste snack into a meal section'
      });
      return;
    }

    if (isSnackSection && mealClipboard.type !== 'snack') {
      showNotification({
        type: 'error',
        message: 'Cannot paste meal into snack section'
      });
      return;
    }

    setMealPlanTemplate((prev) => {
      const sections = [...prev[sectionKey]];
      sections[sectionIndex] = JSON.parse(JSON.stringify(mealClipboard.meal));
      return {
        ...prev,
        [sectionKey]: sections
      };
    });

    const labelBase =
      sectionKey === 'breakfasts'
        ? 'Breakfast'
        : sectionKey === 'lunches'
          ? 'Lunch'
          : sectionKey === 'dinners'
            ? 'Dinner'
            : 'Snack';

    const sectionNumber = sectionIndex + 1;

    showNotification({
      type: 'success',
      message: `${labelBase} ${sectionNumber} pasted successfully`
    });
  };

  // Render meal section (one instance) with accordion, autocomplete, drag-drop, and copy/paste
  const renderMealSection = (sectionKey, sectionIndex, label) => {
    const mealType = `${sectionKey}-${sectionIndex}`;
    const meal = mealPlanTemplate[sectionKey][sectionIndex];
    const isExpanded = expandedSections[mealType];

    return (
      <div className={`mb-6 rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => toggleSection(mealType)}
          className={`w-full flex items-center justify-between p-4 hover:bg-opacity-80 transition-colors ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            {isExpanded ? <FiChevronDown /> : <FiChevronUp />}
            <h3 className="text-lg font-semibold">{label}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                copyMeal(mealType);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Copy meal"
            >
              <FiCopy />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                pasteMeal(mealType);
              }}
              className={`p-2 rounded-lg transition-colors ${
                mealClipboard
                  ? isDarkMode
                    ? 'hover:bg-gray-700 text-blue-400'
                    : 'hover:bg-gray-100 text-blue-600'
                  : isDarkMode
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
              }`}
              title="Paste meal"
              disabled={!mealClipboard}
            >
              <FiClipboard />
            </button>
          </div>
        </button>

        {/* Accordion Content */}
        {isExpanded && (
          <div className="p-6 pt-0">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{label} Title</label>
              <input
                type="text"
                value={meal.title}
                onChange={(e) => handleMealChange(mealType, 'title', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Food Items by Category (Grams will be calculated automatically based on each user's body data)
              </label>
              {CATEGORY_KEYS.map((categoryKey) => {
                const categoryItems = meal.categories?.[categoryKey] || [];
                const categoryLabel =
                  categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
                return (
                  <div key={categoryKey} className="mb-4 border-t border-gray-600/20 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold">{categoryLabel}</h4>
                    </div>
                    {categoryItems.map((item, itemIndex) => {
                      const itemName = typeof item === 'string' ? item : (item.name || '');
                      const itemBaseGrams = typeof item === 'string' ? '' : (item.baseGrams || '');
                      const currentInputKey = `${mealType}-${categoryKey}-${itemIndex}`;
                      const showAutocomplete =
                        autocompleteState.activeInput === currentInputKey &&
                        autocompleteState.showSuggestions;
                      const isDragging =
                        draggedItem?.mealType === mealType &&
                        draggedItem?.categoryKey === categoryKey &&
                        draggedItem?.itemIndex === itemIndex;

                      return (
                        <div
                          key={itemIndex}
                          className={`flex gap-2 mb-2 items-center transition-opacity ${
                            isDragging ? 'opacity-50' : 'opacity-100'
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, mealType, categoryKey, itemIndex)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, mealType, categoryKey, itemIndex)}
                        >
                          <div
                            className={`cursor-move p-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            title="Drag to reorder"
                          >
                            <FiMenu />
                          </div>
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={itemName}
                              onChange={(e) =>
                                handleAutocompleteInput(mealType, categoryKey, itemIndex, e.target.value)
                              }
                              onFocus={() => {
                                if (itemName.trim().length > 0) {
                                  const filtered = foodSuggestions.filter((food) =>
                                    food.name.toLowerCase().includes(itemName.toLowerCase())
                                  );
                                  setAutocompleteState({
                                    activeInput: currentInputKey,
                                    suggestions: filtered,
                                    showSuggestions: filtered.length > 0
                                  });
                                }
                              }}
                              onBlur={() => {
                                // Delay to allow click on suggestion
                                setTimeout(() => {
                                  setAutocompleteState((prev) => ({
                                    ...prev,
                                    showSuggestions: false
                                  }));
                                }, 200);
                              }}
                              placeholder={`Item ${itemIndex + 1} name`}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            {showAutocomplete && autocompleteState.suggestions.length > 0 && (
                              <div
                                className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg border ${
                                  isDarkMode
                                    ? 'bg-gray-700 border-gray-600'
                                    : 'bg-white border-gray-300'
                                } max-h-48 overflow-y-auto`}
                              >
                                {autocompleteState.suggestions.map((suggestion, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() =>
                                      selectSuggestion(mealType, categoryKey, itemIndex, suggestion)
                                    }
                                    className={`w-full text-left px-4 py-2 hover:bg-opacity-50 transition-colors ${
                                      isDarkMode
                                        ? 'hover:bg-gray-600 text-white'
                                        : 'hover:bg-gray-100 text-gray-900'
                                    }`}
                                  >
                                    <div className="font-medium">{suggestion.name}</div>
                                    <div
                                      className={`text-xs ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                      }`}
                                    >
                                      {suggestion.grams}g
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            type="number"
                            value={itemBaseGrams}
                            onChange={(e) =>
                              handleItemBaseGramsChange(mealType, categoryKey, itemIndex, e.target.value)
                            }
                            placeholder="Base grams"
                            min="0"
                            step="1"
                            className={`w-36 px-4 py-2 rounded-lg border ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {categoryItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(mealType, categoryKey, itemIndex)}
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
                      onClick={() => addItem(mealType, categoryKey)}
                      className={`mt-1 px-4 py-2 rounded-lg flex items-center gap-2 ${
                        isDarkMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      } transition-colors`}
                    >
                      <FiPlus /> Add Item in {categoryLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render snack section with accordion, autocomplete, drag-drop, and copy/paste
  const renderSnackSection = (snackIndex) => {
    const snack = mealPlanTemplate.snacks[snackIndex];
    const snackKey = `snacks-${snackIndex}`;
    const isExpanded = expandedSections[snackKey];
    const mealType = `snacks-${snackIndex}`;
    const isDraggingSnack = draggedSnack === snackIndex;

    return (
      <div
        key={snackIndex}
        className={`mb-6 rounded-lg overflow-hidden transition-all ${
          isDraggingSnack ? 'opacity-50' : 'opacity-100'
        } ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
        draggable={mealPlanTemplate.snacks.length > 1}
        onDragStart={(e) => handleSnackDragStart(e, snackIndex)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleSnackDrop(e, snackIndex)}
      >
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => toggleSection(snackKey)}
          className={`w-full flex items-center justify-between p-4 hover:bg-opacity-80 transition-colors ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            {mealPlanTemplate.snacks.length > 1 && (
              <div
                className={`cursor-move p-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                title="Drag to reorder snacks"
                onClick={(e) => e.stopPropagation()}
              >
                <FiMenu />
              </div>
            )}
            {isExpanded ? <FiChevronDown /> : <FiChevronUp />}
            <h3 className="text-lg font-semibold">Snack {snackIndex + 1}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                copyMeal(mealType);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Copy snack"
            >
              <FiCopy />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                pasteMeal(mealType);
              }}
              className={`p-2 rounded-lg transition-colors ${
                mealClipboard && mealClipboard.type === 'snack'
                  ? isDarkMode
                    ? 'hover:bg-gray-700 text-blue-400'
                    : 'hover:bg-gray-100 text-blue-600'
                  : isDarkMode
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
              }`}
              title="Paste snack"
              disabled={!mealClipboard || mealClipboard.type !== 'snack'}
            >
              <FiClipboard />
            </button>
            {mealPlanTemplate.snacks.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSnack(snackIndex);
                }}
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
        </button>

        {/* Accordion Content */}
        {isExpanded && (
          <div className="p-6 pt-0">
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
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Food Items by Category (Grams will be calculated automatically based on each user's body data)
              </label>
              {CATEGORY_KEYS.map((categoryKey) => {
                const categoryItems = snack.categories?.[categoryKey] || [];
                const categoryLabel =
                  categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
                return (
                  <div key={categoryKey} className="mb-4 border-t border-gray-600/20 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold">{categoryLabel}</h4>
                    </div>
                    {categoryItems.map((item, itemIndex) => {
                      const itemName = typeof item === 'string' ? item : (item.name || '');
                      const itemBaseGrams = typeof item === 'string' ? '' : (item.baseGrams || '');
                      const currentInputKey = `${mealType}-${categoryKey}-${itemIndex}`;
                      const showAutocomplete =
                        autocompleteState.activeInput === currentInputKey &&
                        autocompleteState.showSuggestions;
                      const isDragging =
                        draggedItem?.mealType === mealType &&
                        draggedItem?.categoryKey === categoryKey &&
                        draggedItem?.itemIndex === itemIndex;

                      return (
                        <div
                          key={itemIndex}
                          className={`flex gap-2 mb-2 items-center transition-opacity ${
                            isDragging ? 'opacity-50' : 'opacity-100'
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, mealType, categoryKey, itemIndex)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, mealType, categoryKey, itemIndex)}
                        >
                          <div
                            className={`cursor-move p-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            title="Drag to reorder"
                          >
                            <FiMenu />
                          </div>
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={itemName}
                              onChange={(e) =>
                                handleAutocompleteInput(mealType, categoryKey, itemIndex, e.target.value)
                              }
                              onFocus={() => {
                                if (itemName.trim().length > 0) {
                                  const filtered = foodSuggestions.filter((food) =>
                                    food.name.toLowerCase().includes(itemName.toLowerCase())
                                  );
                                  setAutocompleteState({
                                    activeInput: currentInputKey,
                                    suggestions: filtered,
                                    showSuggestions: filtered.length > 0
                                  });
                                }
                              }}
                              onBlur={() => {
                                // Delay to allow click on suggestion
                                setTimeout(() => {
                                  setAutocompleteState((prev) => ({
                                    ...prev,
                                    showSuggestions: false
                                  }));
                                }, 200);
                              }}
                              placeholder={`Item ${itemIndex + 1} name`}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            {showAutocomplete && autocompleteState.suggestions.length > 0 && (
                              <div
                                className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg border ${
                                  isDarkMode
                                    ? 'bg-gray-700 border-gray-600'
                                    : 'bg-white border-gray-300'
                                } max-h-48 overflow-y-auto`}
                              >
                                {autocompleteState.suggestions.map((suggestion, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() =>
                                      selectSuggestion(mealType, categoryKey, itemIndex, suggestion)
                                    }
                                    className={`w-full text-left px-4 py-2 hover:bg-opacity-50 transition-colors ${
                                      isDarkMode
                                        ? 'hover:bg-gray-600 text-white'
                                        : 'hover:bg-gray-100 text-gray-900'
                                    }`}
                                  >
                                    <div className="font-medium">{suggestion.name}</div>
                                    <div
                                      className={`text-xs ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                      }`}
                                    >
                                      {suggestion.grams}g
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            type="number"
                            value={itemBaseGrams}
                            onChange={(e) =>
                              handleItemBaseGramsChange(mealType, categoryKey, itemIndex, e.target.value)
                            }
                            placeholder="Base grams"
                            min="0"
                            step="1"
                            className={`w-36 px-4 py-2 rounded-lg border ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {categoryItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(mealType, categoryKey, itemIndex)}
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
                      onClick={() => addItem(mealType, categoryKey)}
                      className={`mt-1 px-4 py-2 rounded-lg flex items-center gap-2 ${
                        isDarkMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      } transition-colors`}
                    >
                      <FiPlus /> Add Item in {categoryLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex transition-colors ${isDarkMode ? 'bg-[#0a0d1a] text-white' : 'bg-gray-50 text-gray-900'}`}>
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
    <div className={`min-h-screen flex transition-colors ${isDarkMode ? 'bg-[#0a0d1a] text-white' : 'bg-gray-50 text-gray-900'}`}>
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

        {/* Meal Plan Type Selector */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <label className="block text-sm font-medium mb-2">
            Meal Plan Type <span className="text-red-500">*</span>
          </label>
          <select
            value={mealPlanType}
            onChange={(e) => setMealPlanType(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="Weight Loss">Weight Loss</option>
            <option value="Weight Gain">Weight Gain</option>
            <option value="Maintain Weight">Maintain Weight</option>
          </select>
        </div>

        {/* AI Generate Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => {
              // Generate directly using selected mealPlanType
              generateAIMealPlan({ goal: mealPlanType });
            }}
            disabled={aiGenerating}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              aiGenerating
                ? 'bg-gray-400 cursor-not-allowed text-white/60'
                : isDarkMode
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {aiGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Generate
              </>
            )}
          </button>
        </div>

        {/* Meal Plan Form */}
        <div className="mb-6">
          {/* Breakfasts Section */}
          <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Breakfast</h2>
              <button
                type="button"
                onClick={() => {
                  setMealPlanTemplate((prev) => {
                    const max = 3;
                    if (prev.breakfasts.length >= max) return prev;
                    return {
                      ...prev,
                      breakfasts: [
                        ...prev.breakfasts,
                        { title: '', items: [{ name: '', baseGrams: '' }] }
                      ]
                    };
                  });
                  setExpandedSections((prev) => {
                    const nextIndex = mealPlanTemplate.breakfasts.length;
                    return {
                      ...prev,
                      [`breakfasts-${nextIndex}`]: true
                    };
                  });
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                } transition-colors`}
              >
                <FiPlus /> Add Breakfast
              </button>
            </div>
            {mealPlanTemplate.breakfasts.map((_, index) =>
              renderMealSection('breakfasts', index, `Breakfast ${index + 1}`)
            )}
          </div>

          {/* Lunches Section */}
          <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Lunch</h2>
              <button
                type="button"
                onClick={() => {
                  setMealPlanTemplate((prev) => {
                    const max = 3;
                    if (prev.lunches.length >= max) return prev;
                    return {
                      ...prev,
                      lunches: [
                        ...prev.lunches,
                        { title: '', items: [{ name: '', baseGrams: '' }] }
                      ]
                    };
                  });
                  setExpandedSections((prev) => {
                    const nextIndex = mealPlanTemplate.lunches.length;
                    return {
                      ...prev,
                      [`lunches-${nextIndex}`]: true
                    };
                  });
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                } transition-colors`}
              >
                <FiPlus /> Add Lunch
              </button>
            </div>
            {mealPlanTemplate.lunches.map((_, index) =>
              renderMealSection('lunches', index, `Lunch ${index + 1}`)
            )}
          </div>

          {/* Dinners Section */}
          <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Dinner</h2>
              <button
                type="button"
                onClick={() => {
                  setMealPlanTemplate((prev) => {
                    const max = 3;
                    if (prev.dinners.length >= max) return prev;
                    return {
                      ...prev,
                      dinners: [
                        ...prev.dinners,
                        { title: '', items: [{ name: '', baseGrams: '' }] }
                      ]
                    };
                  });
                  setExpandedSections((prev) => {
                    const nextIndex = mealPlanTemplate.dinners.length;
                    return {
                      ...prev,
                      [`dinners-${nextIndex}`]: true
                    };
                  });
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                } transition-colors`}
              >
                <FiPlus /> Add Dinner
              </button>
            </div>
            {mealPlanTemplate.dinners.map((_, index) =>
              renderMealSection('dinners', index, `Dinner ${index + 1}`)
            )}
          </div>

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
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  } transition-colors`}
                >
                  <FiPlus /> Add Snack
                </button>
              )}
            </div>
            {mealPlanTemplate.snacks.map((snack, index) => renderSnackSection(index))}
          </div>
        </div>

  

        {/* Preview Card */}
        {showPreview && (
          <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h2 className="text-2xl font-semibold mb-4">Meal Plan Preview</h2>
            
            <div className="space-y-4">
              {/* Breakfasts Preview */}
              <div>
                <h3 className="font-semibold text-lg mb-2">🍳 Breakfast</h3>
                {mealPlanTemplate.breakfasts.map((section, idx) => (
                  <div key={idx} className="ml-4 mb-2">
                    <h4 className="font-medium">{section.title || `Breakfast ${idx + 1}`}</h4>
                    <ul className="list-disc list-inside ml-4">
                      {section.items
                        .filter((item) => {
                          const name = typeof item === 'string' ? item : item.name || '';
                          return name.trim() !== '';
                        })
                        .map((item, i) => {
                          const name = typeof item === 'string' ? item : item.name || '';
                          return <li key={i}>{name}</li>;
                        })}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Lunches Preview */}
              <div>
                <h3 className="font-semibold text-lg mb-2">🍽️ Lunch</h3>
                {mealPlanTemplate.lunches.map((section, idx) => (
                  <div key={idx} className="ml-4 mb-2">
                    <h4 className="font-medium">{section.title || `Lunch ${idx + 1}`}</h4>
                    <ul className="list-disc list-inside ml-4">
                      {section.items
                        .filter((item) => {
                          const name = typeof item === 'string' ? item : item.name || '';
                          return name.trim() !== '';
                        })
                        .map((item, i) => {
                          const name = typeof item === 'string' ? item : item.name || '';
                          return <li key={i}>{name}</li>;
                        })}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Dinners Preview */}
              <div>
                <h3 className="font-semibold text-lg mb-2">🍲 Dinner</h3>
                {mealPlanTemplate.dinners.map((section, idx) => (
                  <div key={idx} className="ml-4 mb-2">
                    <h4 className="font-medium">{section.title || `Dinner ${idx + 1}`}</h4>
                    <ul className="list-disc list-inside ml-4">
                      {section.items
                        .filter((item) => {
                          const name = typeof item === 'string' ? item : item.name || '';
                          return name.trim() !== '';
                        })
                        .map((item, i) => {
                          const name = typeof item === 'string' ? item : item.name || '';
                          return <li key={i}>{name}</li>;
                        })}
                    </ul>
                  </div>
                ))}
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
        <div className="mb-6">
          <button
            type="button"
            onClick={() => {
              const validationError = validateTemplate();
              if (validationError) {
                showNotification({
                  type: 'error',
                  message: validationError
                });
                return;
              }
              setShowBulkAssignModal(true);
            }}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
              isDarkMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            } transition-colors`}
          >
            <FiUsers /> Assign Meal Plan
          </button>
        </div>
      </div>

      {/* Bulk Assign Modal */}
      {showBulkAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-xl'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Assign Meal Plan to Users</h2>
              <button
                onClick={() => setShowBulkAssignModal(false)}
                className={`p-2 rounded-lg hover:bg-white/10 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Select Users</label>
                <button
                  onClick={selectAllUsers}
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
                          onChange={() => toggleUserSelection(user.uid)}
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
                onClick={() => setShowBulkAssignModal(false)}
                className={`px-6 py-2 rounded-lg font-medium ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAssign}
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
      )}
    </div>
  </div>
  );
};

export default AddMealPlanContent;

