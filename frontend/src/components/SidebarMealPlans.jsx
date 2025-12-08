import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiPlus, 
  FiList, 
  FiEye,
  FiChevronRight
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import EmployeeSidebar from './EmployeeSidebar';
import AddMealPlanContent from '../pages/AddMealPlanContent';
import SelectReadyPlanContent from '../pages/SelectReadyPlanContent';
import ViewUsersPlanContent from '../pages/ViewUsersPlanContent';

const SidebarMealPlans = () => {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active page from URL or default to 'add'
  const getActivePage = () => {
    const path = location.pathname;
    if (path.includes('/add-meal-plan') || path === '/employee/meal-plans/add' || path === '/employee/add-meal-plan') {
      return 'add';
    } else if (path.includes('/select-ready-plan') || path === '/employee/meal-plans/select' || path === '/employee/meal-plans') {
      return 'select';
    } else if (path.includes('/view-users-plan') || path === '/employee/meal-plans/view' || path === '/meal-plans') {
      return 'view';
    }
    return 'add'; // Default
  };

  const [activePage, setActivePage] = useState(getActivePage());

  // Update active page when route changes
  useEffect(() => {
    setActivePage(getActivePage());
  }, [location.pathname]);

  const menuItems = [
    {
      id: 'add',
      label: 'Add Meal Plan',
      icon: <FiPlus />,
      path: '/employee/meal-plans/add'
    },
    {
      id: 'select',
      label: 'Select Ready Plan',
      icon: <FiList />,
      path: '/employee/meal-plans/select'
    },
    {
      id: 'view',
      label: 'View Users Plan',
      icon: <FiEye />,
      path: '/employee/meal-plans/view'
    }
  ];

  const handleMenuClick = (item) => {
    setActivePage(item.id);
    navigate(item.path);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'add':
        return <AddMealPlanContent />;
      case 'select':
        return <SelectReadyPlanContent />;
      case 'view':
        return <ViewUsersPlanContent />;
      default:
        return <AddMealPlanContent />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Employee Sidebar */}
      <EmployeeSidebar />
      
      {/* Meal Plans Sidebar */}
      <aside className={`w-64 flex-shrink-0 border-r transition-colors ${
        isDarkMode 
          ? 'bg-[#0f111f] border-gray-800' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="p-6">
          <h2 className={`text-xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Meal Plans
          </h2>
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? isDarkMode
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-blue-600 text-white shadow-lg'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isActive && (
                    <FiChevronRight className="text-sm" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
        isDarkMode ? 'bg-[#0a0d1a]' : 'bg-gray-50'
      }`}>
        <div className="h-full animate-fadeIn">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default SidebarMealPlans;

