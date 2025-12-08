// frontend/src/components/ExercisePickerModal.jsx
// === NEW: Exercise Picker Modal for Gym Plans ===
import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiFilter, FiPlus, FiImage } from 'react-icons/fi';

const ExercisePickerModal = ({ 
  isOpen, 
  onClose, 
  onSelectExercise, 
  exercises = [], 
  isDarkMode,
  dayTitle = 'Workout Day'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [filteredExercises, setFilteredExercises] = useState([]);

  const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];

  // === Filter exercises based on search and muscle group ===
  useEffect(() => {
    let filtered = exercises;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchLower) ||
        ex.equipment?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedMuscleGroup) {
      filtered = filtered.filter(ex => ex.muscleGroup === selectedMuscleGroup);
    }

    setFilteredExercises(filtered);
  }, [exercises, searchTerm, selectedMuscleGroup]);

  // === Reset filters when modal opens ===
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedMuscleGroup('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectExercise = (exercise) => {
    // Create exercise object for the workout day
    const exerciseForDay = {
      exerciseId: exercise.id,
      name: exercise.name,
      sets: exercise.defaultSets || 3,
      reps: exercise.defaultReps || 10,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      gifMaleUrl: exercise.gifMaleUrl || null,
      gifFemaleUrl: exercise.gifFemaleUrl || null
    };
    
    onSelectExercise(exerciseForDay);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-2xl'
      }`}>
        {/* === Header === */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Add Exercise</h2>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Adding to: <span className="font-medium">{dayTitle}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all ${
                isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <FiX size={24} />
            </button>
          </div>

          {/* === Search & Filter === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Search Input */}
            <div className="relative">
              <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Muscle Group Filter */}
            <div className="relative">
              <FiFilter className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <select
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border appearance-none transition-all ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 focus:border-blue-500'
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

        {/* === Exercises List === */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredExercises.length === 0 ? (
            <div className={`text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <FiSearch className="mx-auto text-4xl mb-3 opacity-50" />
              <p className="text-lg font-medium">No exercises found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => handleSelectExercise(exercise)}
                  className={`p-4 rounded-xl text-left transition-all flex items-start gap-4 group ${
                    isDarkMode 
                      ? 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-blue-500' 
                      : 'bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md'
                  }`}
                >
                  {/* Exercise GIF Preview */}
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
                        isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                        <FiImage className="text-xl opacity-40" />
                      </div>
                    )}
                  </div>

                  {/* Exercise Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate group-hover:text-blue-500 transition-colors">
                      {exercise.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
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
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Default: {exercise.defaultSets || 3} sets × {exercise.defaultReps || 10} reps
                    </p>
                  </div>

                  {/* Add Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                    isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                  }`}>
                    <FiPlus className="text-white" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* === Footer with count === */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
          <p className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredExercises.length} of {exercises.length} exercises
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExercisePickerModal;

