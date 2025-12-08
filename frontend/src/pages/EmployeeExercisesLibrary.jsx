import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiX, FiImage, FiUpload } from 'react-icons/fi';
import axios from 'axios';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../context/ThemeContext';
import EmployeeSidebar from '../components/EmployeeSidebar';
import { uploadExerciseGifs, validateGifFile } from '../utils/firebaseStorage';

const EmployeeExercisesLibrary = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
  const equipmentTypes = ['Dumbbells', 'Barbell', 'Machine', 'Bodyweight', 'Cable', 'Resistance Band', 'Kettlebell'];

  const [formData, setFormData] = useState({
    name: '',
    muscleGroup: '',
    equipment: '',
    defaultSets: 3,
    defaultReps: 10,
    notes: ''
  });

  // GIF files state
  const [maleGifFile, setMaleGifFile] = useState(null);
  const [femaleGifFile, setFemaleGifFile] = useState(null);
  const [maleGifPreview, setMaleGifPreview] = useState(null);
  const [femaleGifPreview, setFemaleGifPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm, selectedMuscleGroup]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/employee/exercises', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setExercises(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      showNotification({
        type: 'error',
        message: 'Failed to load exercises'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (searchTerm) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMuscleGroup) {
      filtered = filtered.filter(ex => ex.muscleGroup === selectedMuscleGroup);
    }

    setFilteredExercises(filtered);
  };

  /**
   * Handle male GIF file selection
   */
  const handleMaleGifChange = (file) => {
    if (!file) return;

    // Validate file
    const validation = validateGifFile(file);
    if (!validation.valid) {
      showNotification({
        type: 'error',
        message: validation.error
      });
      return;
    }

    setMaleGifFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setMaleGifPreview(reader.result);
    };
    reader.readAsDataURL(file);

    console.log('✅ Male GIF selected:', {
      name: file.name,
      size: (file.size / 1024).toFixed(0) + ' KB'
    });
  };

  /**
   * Handle female GIF file selection
   */
  const handleFemaleGifChange = (file) => {
    if (!file) return;

    // Validate file
    const validation = validateGifFile(file);
    if (!validation.valid) {
      showNotification({
        type: 'error',
        message: validation.error
      });
      return;
    }

    setFemaleGifFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setFemaleGifPreview(reader.result);
    };
    reader.readAsDataURL(file);

    console.log('✅ Female GIF selected:', {
      name: file.name,
      size: (file.size / 1024).toFixed(0) + ' KB'
    });
  };

  /**
   * Remove male GIF
   */
  const removeMaleGif = () => {
    setMaleGifFile(null);
    setMaleGifPreview(null);
  };

  /**
   * Remove female GIF
   */
  const removeFemaleGif = () => {
    setFemaleGifFile(null);
    setFemaleGifPreview(null);
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.muscleGroup || !formData.equipment) {
      showNotification({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showNotification({
          type: 'error',
          message: 'Authentication required. Please login again.'
        });
        setIsSubmitting(false);
        return;
      }

      let gifMaleUrl = null;
      let gifFemaleUrl = null;

      // Upload GIF files if provided
      if (maleGifFile || femaleGifFile) {
        setIsUploading(true);
        setUploadProgress(0);
        
        try {
          console.log('📤 Uploading GIF files...');
          const exerciseId = `ex_${Date.now()}`;
          
          const uploadResult = await uploadExerciseGifs(
            maleGifFile,
            femaleGifFile,
            exerciseId,
            (progress) => {
              setUploadProgress(progress);
              console.log(`📊 Upload progress: ${Math.round(progress)}%`);
            }
          );

          gifMaleUrl = uploadResult.gifMaleUrl;
          gifFemaleUrl = uploadResult.gifFemaleUrl;

          console.log('✅ GIF files uploaded successfully:', {
            gifMaleUrl,
            gifFemaleUrl
          });
        } catch (uploadError) {
          console.error('⚠️ GIF upload failed:', uploadError);
          showNotification({
            type: 'error',
            message: 'GIF upload failed: ' + uploadError.message
          });
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      }

      // Prepare exercise data
      const exerciseData = {
        ...formData,
        gifMaleUrl,
        gifFemaleUrl
      };

      console.log('💾 Saving exercise to database...', exerciseData);

      const response = await axios.post(
        'http://localhost:3000/api/employee/exercises',
        exerciseData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        console.log('✅ Exercise added successfully!');
        showNotification({
          type: 'success',
          message: 'Exercise added successfully'
        });
        setShowAddModal(false);
        resetForm();
        fetchExercises();
      } else {
        throw new Error(response.data.message || 'Failed to add exercise');
      }
    } catch (error) {
      console.error('❌ Error adding exercise:', error);
      
      let errorMessage = 'Failed to add exercise';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!formData.name || !formData.muscleGroup || !formData.equipment) {
      showNotification({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      let gifMaleUrl = selectedExercise.gifMaleUrl || null;
      let gifFemaleUrl = selectedExercise.gifFemaleUrl || null;

      // Upload new GIF files if provided
      if (maleGifFile || femaleGifFile) {
        setIsUploading(true);
        setUploadProgress(0);
        
        try {
          console.log('📤 Uploading new GIF files...');
          
          const uploadResult = await uploadExerciseGifs(
            maleGifFile,
            femaleGifFile,
            selectedExercise.id,
            (progress) => setUploadProgress(progress)
          );

          if (uploadResult.gifMaleUrl) {
            gifMaleUrl = uploadResult.gifMaleUrl;
          }
          if (uploadResult.gifFemaleUrl) {
            gifFemaleUrl = uploadResult.gifFemaleUrl;
          }

          console.log('✅ New GIF files uploaded:', {
            gifMaleUrl,
            gifFemaleUrl
          });
        } catch (uploadError) {
          console.error('⚠️ GIF upload failed, keeping old GIFs:', uploadError);
          showNotification({
            type: 'warning',
            message: 'GIF upload failed. Keeping existing GIFs.'
          });
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      }

      // Prepare exercise data
      const exerciseData = {
        ...formData,
        gifMaleUrl,
        gifFemaleUrl
      };

      const response = await axios.put(
        `http://localhost:3000/api/employee/exercises/${selectedExercise.id}`,
        exerciseData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification({
          type: 'success',
          message: 'Exercise updated successfully'
        });
        setShowEditModal(false);
        resetForm();
        fetchExercises();
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update exercise'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:3000/api/employee/exercises/${selectedExercise.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification({
          type: 'success',
          message: 'Exercise deleted successfully'
        });
        setShowDeleteModal(false);
        setSelectedExercise(null);
        fetchExercises();
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete exercise'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (exercise) => {
    setSelectedExercise(exercise);
    setFormData({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      defaultSets: exercise.defaultSets,
      defaultReps: exercise.defaultReps,
      notes: exercise.notes || ''
    });
    
    // Set existing GIF previews if available
    if (exercise.gifMaleUrl) {
      setMaleGifPreview(exercise.gifMaleUrl);
    }
    if (exercise.gifFemaleUrl) {
      setFemaleGifPreview(exercise.gifFemaleUrl);
    }
    
    setShowEditModal(true);
  };

  const openDeleteModal = (exercise) => {
    setSelectedExercise(exercise);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      muscleGroup: '',
      equipment: '',
      defaultSets: 3,
      defaultReps: 10,
      notes: ''
    });
    setMaleGifFile(null);
    setFemaleGifFile(null);
    setMaleGifPreview(null);
    setFemaleGifPreview(null);
    setIsUploading(false);
    setUploadProgress(0);
    setSelectedExercise(null);
  };

  return (
    <div className={`min-h-screen flex transition-colors ${isDarkMode ? 'bg-[#0a0d1a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <EmployeeSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Exercises Library</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your global exercises library
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <FiPlus /> Add Exercise
            </button>
          </div>

          {/* Filters */}
          <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              {/* Muscle Group Filter */}
              <div className="relative">
                <FiFilter className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <select
                  value={selectedMuscleGroup}
                  onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">All Muscle Groups</option>
                  {muscleGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Exercises Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className={`text-center py-20 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No exercises found. Add your first exercise to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className={`p-6 rounded-lg transition-all ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700 hover:bg-gray-750' : 'bg-white border border-gray-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Exercise GIFs - Male and Female */}
                    <div className="flex gap-2 flex-shrink-0">
                      {/* Male GIF */}
                      {exercise.gifMaleUrl ? (
                        <div className="text-center">
                          <img
                            src={exercise.gifMaleUrl}
                            alt={`${exercise.name} - Male`}
                            className="w-20 h-20 object-cover rounded-lg"
                            loading="lazy"
                          />
                          <span className="text-xs opacity-60 mt-1 block">Male</span>
                        </div>
                      ) : (
                        <div className={`w-20 h-20 rounded-lg flex items-center justify-center ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <FiImage className="text-2xl opacity-30" />
                        </div>
                      )}
                      
                      {/* Female GIF */}
                      {exercise.gifFemaleUrl ? (
                        <div className="text-center">
                          <img
                            src={exercise.gifFemaleUrl}
                            alt={`${exercise.name} - Female`}
                            className="w-20 h-20 object-cover rounded-lg"
                            loading="lazy"
                          />
                          <span className="text-xs opacity-60 mt-1 block">Female</span>
                        </div>
                      ) : (
                        <div className={`w-20 h-20 rounded-lg flex items-center justify-center ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <FiImage className="text-2xl opacity-30" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{exercise.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                          {exercise.muscleGroup}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                          {exercise.equipment}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p><strong>Default:</strong> {exercise.defaultSets} sets × {exercise.defaultReps} reps</p>
                    {exercise.notes && <p className="mt-2">{exercise.notes}</p>}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(exercise)}
                      className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${
                        isDarkMode ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400' : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                      }`}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(exercise)}
                      className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${
                        isDarkMode ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-700'
                      }`}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-xl'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{showAddModal ? 'Add' : 'Edit'} Exercise</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className={`p-2 rounded-lg hover:bg-white/10 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Exercise Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="e.g., Bench Press"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Muscle Group *</label>
                    <select
                      value={formData.muscleGroup}
                      onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="">Select...</option>
                      {muscleGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Equipment *</label>
                    <select
                      value={formData.equipment}
                      onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="">Select...</option>
                      {equipmentTypes.map(equipment => (
                        <option key={equipment} value={equipment}>{equipment}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Sets</label>
                    <input
                      type="number"
                      value={formData.defaultSets}
                      onChange={(e) => setFormData({ ...formData, defaultSets: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Default Reps</label>
                    <input
                      type="number"
                      value={formData.defaultReps}
                      onChange={(e) => setFormData({ ...formData, defaultReps: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      min="1"
                    />
                  </div>
                </div>

                {/* Male GIF Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Male GIF (optional)</label>
                  <p className="text-xs opacity-60 mb-3">Upload animated GIF for male users (max 10MB)</p>
                  
                  {maleGifPreview ? (
                    <div className="relative inline-block">
                      <img 
                        src={maleGifPreview} 
                        alt="Male GIF Preview" 
                        className="w-32 h-32 object-cover rounded-lg border-2 border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={removeMaleGif}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className={`inline-flex flex-col items-center justify-center w-32 h-32 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                      isDarkMode 
                        ? 'border-gray-600 hover:border-blue-500 bg-gray-800 hover:bg-gray-750' 
                        : 'border-gray-300 hover:border-blue-400 bg-white hover:bg-gray-50'
                    }`}>
                      <FiUpload className="text-xl mb-1" />
                      <span className="text-xs">Upload Male</span>
                      <input
                        type="file"
                        accept="image/gif"
                        onChange={(e) => handleMaleGifChange(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Female GIF Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Female GIF (optional)</label>
                  <p className="text-xs opacity-60 mb-3">Upload animated GIF for female users (max 10MB)</p>
                  
                  {femaleGifPreview ? (
                    <div className="relative inline-block">
                      <img 
                        src={femaleGifPreview} 
                        alt="Female GIF Preview" 
                        className="w-32 h-32 object-cover rounded-lg border-2 border-pink-500"
                      />
                      <button
                        type="button"
                        onClick={removeFemaleGif}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className={`inline-flex flex-col items-center justify-center w-32 h-32 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                      isDarkMode 
                        ? 'border-gray-600 hover:border-pink-500 bg-gray-800 hover:bg-gray-750' 
                        : 'border-gray-300 hover:border-pink-400 bg-white hover:bg-gray-50'
                    }`}>
                      <FiUpload className="text-xl mb-1" />
                      <span className="text-xs">Upload Female</span>
                      <input
                        type="file"
                        accept="image/gif"
                        onChange={(e) => handleFemaleGifChange(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="col-span-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Uploading GIF files...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    rows="3"
                    placeholder="Tips, form cues, etc..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={showAddModal ? handleAdd : handleEdit}
                  disabled={isSubmitting || isUploading}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    isSubmitting || isUploading
                      ? 'bg-gray-400 cursor-not-allowed text-white/60'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : isSubmitting ? 'Saving...' : showAddModal ? 'Add Exercise' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg p-6 max-w-md w-full ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-xl'
            }`}>
              <h2 className="text-xl font-bold mb-4">Delete Exercise</h2>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Are you sure you want to delete <strong>{selectedExercise?.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedExercise(null);
                  }}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    isSubmitting
                      ? 'bg-red-500/60 cursor-not-allowed text-white/60'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Exercise'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeExercisesLibrary;

