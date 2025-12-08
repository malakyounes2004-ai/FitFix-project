/**
 * ==========================================
 * EMPLOYEE SEARCH COMPONENT
 * ==========================================
 * 
 * PURPOSE: Search and select employees for reporting
 * WHY: Efficient employee lookup in large databases
 * FEATURES: Debounced search, autocomplete, multiple criteria
 */

import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiUser, FiMail, FiHash, FiLoader } from 'react-icons/fi';
import { searchEmployees } from '../../services/reportsService';
import { useDebounce } from '../../hooks/useDebounce';

const EmployeeSearch = ({ onEmployeeSelect, isDarkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const debouncedQuery = useDebounce(searchQuery, 300);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search employees when debounced query changes
  useEffect(() => {
    // Don't search if an employee is already selected
    if (selectedEmployee) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    performSearch(debouncedQuery);
  }, [debouncedQuery, selectedEmployee]);

  const performSearch = async (query) => {
    setIsSearching(true);
    try {
      const results = await searchEmployees(query);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setSearchQuery(`${employee.displayName || employee.email} (${employee.email})`);
    setShowSuggestions(false);
    onEmployeeSelect(employee);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedEmployee(null);
    setSuggestions([]);
    setShowSuggestions(false);
    onEmployeeSelect(null);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className={`relative rounded-2xl border ${
        isDarkMode
          ? 'bg-white/5 border-white/10'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 px-4 py-3">
          <FiSearch className={`text-lg ${
            isDarkMode ? 'text-white/40' : 'text-gray-400'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              // Only show suggestions if no employee is selected and we have suggestions
              if (!selectedEmployee && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Search by name, email, or employee ID..."
            className={`flex-1 bg-transparent outline-none ${
              isDarkMode ? 'text-white placeholder-white/40' : 'text-gray-900 placeholder-gray-400'
            }`}
          />
          {isSearching && (
            <FiLoader className="animate-spin text-[#1f36ff]" />
          )}
          {selectedEmployee && (
            <button
              onClick={handleClear}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className={`absolute z-50 w-full mt-2 rounded-2xl border shadow-xl max-h-96 overflow-y-auto ${
            isDarkMode
              ? 'bg-[#0f111f] border-white/10'
              : 'bg-white border-gray-200'
          }`}
        >
          {suggestions.map((employee) => (
            <button
              key={employee.uid || employee.id}
              onClick={() => handleSelectEmployee(employee)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                isDarkMode
                  ? 'hover:bg-white/5 text-white'
                  : 'hover:bg-gray-50 text-gray-900'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-white/10' : 'bg-gray-100'
              }`}>
                <FiUser className={isDarkMode ? 'text-white/60' : 'text-gray-600'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {employee.displayName || 'No Name'}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className={`text-sm flex items-center gap-1 ${
                    isDarkMode ? 'text-white/60' : 'text-gray-500'
                  }`}>
                    <FiMail className="text-xs" />
                    {employee.email}
                  </span>
                  {employee.employeeId && (
                    <span className={`text-sm flex items-center gap-1 ${
                      isDarkMode ? 'text-white/60' : 'text-gray-500'
                    }`}>
                      <FiHash className="text-xs" />
                      {employee.employeeId}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && !isSearching && debouncedQuery.trim().length >= 2 && !selectedEmployee && (
        <div
          className={`absolute z-50 w-full mt-2 rounded-2xl border p-8 text-center ${
            isDarkMode
              ? 'bg-[#0f111f] border-white/10 text-white/60'
              : 'bg-white border-gray-200 text-gray-500'
          }`}
        >
          No employees found matching "{debouncedQuery}"
        </div>
      )}
    </div>
  );
};

export default EmployeeSearch;

