import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { FiHome, FiUsers, FiMessageCircle, FiSettings, FiCoffee, FiActivity, FiRefreshCw, FiChevronDown, FiBarChart2 } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <FiHome />, path: '/employee-dashboard' },
  { key: 'users', label: 'My Users', icon: <FiUsers />, path: '/employee/my-users' },
  { 
    key: 'mealPlans', 
    label: 'Meal Plans', 
    icon: <FiCoffee />, 
    path: '#',
    submenu: [
      { key: 'addMealPlan', label: 'Add Meal Plan', path: '/employee/meal-plans/add' },
      { key: 'selectReadyPlan', label: 'Select Ready Plan', path: '/employee/meal-plans/select' },
      { key: 'viewUsersPlan', label: 'View Users Plan', path: '/employee/meal-plans/view' }
    ]
  },
  { 
    key: 'gym', 
    label: 'Gym', 
    icon: <FiActivity />, 
    path: '#',
    submenu: [
      { key: 'exercises', label: 'Exercises Library', path: '/employee/exercises' },
      { key: 'gymPlans', label: 'Gym Plans', path: '/employee/gym-plans' },
      { key: 'usersWorkoutPlans', label: 'Users Workout Plans', path: '/employee/workout-plans-overview' }
    ]
  },
  { key: 'renewSubscription', label: 'Renew Subscription', icon: <FiRefreshCw />, path: '/employee/renew-subscription' },
  { key: 'reports', label: 'Reports and Analytics', icon: <FiBarChart2 />, path: '/employee/reports-and-analytics' },
  { key: 'chat', label: 'Chat', icon: <FiMessageCircle />, path: '/employee/chat' },
  { key: 'settings', label: 'Settings', icon: <FiSettings />, path: '/employee/settings' }
];

const EmployeeSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [expandedMenu, setExpandedMenu] = useState(null);

  // GSAP Refs
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);
  const avatarRef = useRef(null);
  const navRef = useRef(null);
  const themeToggleRef = useRef(null);
  const logoutRef = useRef(null);
  const navButtonRefs = useRef([]);
  const submenuRefs = useRef({});
  const chevronRefs = useRef({});

  // Listen for profile updates
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(updatedUser);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, []);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline for entrance animations
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Sidebar slide in
      tl.from(sidebarRef.current, {
        x: -100,
        opacity: 0,
        duration: 0.6,
      });

      // Profile section fade in
      tl.from(profileRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
      }, '-=0.3');

      // Avatar pop effect
      tl.from(avatarRef.current, {
        scale: 0,
        rotation: -180,
        duration: 0.5,
        ease: 'back.out(1.7)',
      }, '-=0.2');

      // Nav buttons stagger
      tl.from(navButtonRefs.current.filter(Boolean), {
        x: -30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.4,
      }, '-=0.3');

      // Theme toggle
      tl.from(themeToggleRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
      }, '-=0.2');

      // Logout button
      tl.from(logoutRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
      }, '-=0.2');

      // Subtle floating animation for avatar
      gsap.to(avatarRef.current, {
        y: -3,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5,
      });

    }, sidebarRef);

    return () => ctx.revert();
  }, []);

  // GSAP Submenu Animation
  useEffect(() => {
    Object.keys(submenuRefs.current).forEach(key => {
      const submenuEl = submenuRefs.current[key];
      const chevronEl = chevronRefs.current[key];
      
      if (!submenuEl) return;

      if (expandedMenu === key) {
        // Open animation
        if (chevronEl) {
          gsap.to(chevronEl, {
            rotation: 180,
            duration: 0.3,
            ease: 'power2.out',
          });
        }

        gsap.to(submenuEl, {
          height: 'auto',
          opacity: 1,
          duration: 0.4,
          ease: 'power3.out',
        });

        // Stagger children
        const children = submenuEl.querySelectorAll('button');
        gsap.from(children, {
          x: -20,
          opacity: 0,
          stagger: 0.08,
          duration: 0.3,
          ease: 'power2.out',
          delay: 0.1,
        });
      } else {
        // Close animation
        if (chevronEl) {
          gsap.to(chevronEl, {
            rotation: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
        }

        gsap.to(submenuEl, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power3.in',
        });
      }
    });
  }, [expandedMenu]);

  // Auto-expand submenus based on current route
  useEffect(() => {
    if (location.pathname.startsWith('/employee/meal-plans')) {
      setExpandedMenu('mealPlans');
    }
    if (location.pathname.startsWith('/employee/gym-plans') || 
        location.pathname.startsWith('/employee/exercises') || 
        location.pathname.startsWith('/employee/workout-plans-overview')) {
      setExpandedMenu('gym');
    }
  }, [location.pathname]);

  const handleLogout = () => {
    // Logout animation
    gsap.to(sidebarRef.current, {
      x: -100,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    });
  };

  const handleNavClick = (path) => {
    if (path && path !== '#') {
      navigate(path);
    }
  };

  // Determine active nav based on current path
  const getActiveNav = () => {
    const path = location.pathname;
    if (path === '/employee-dashboard' || (path.startsWith('/employee/') && path.match(/\/employee\/[^/]+$/) && path !== '/employee/chat' && path !== '/employee/settings' && path !== '/employee/my-users' && !path.startsWith('/employee/meal-plans') && !path.startsWith('/employee/exercises') && !path.startsWith('/employee/gym-plans') && !path.startsWith('/employee/renew-subscription'))) return 'dashboard';
    if (path === '/employee/my-users') return 'users';
    if (path === '/employee/meal-plans/add') return 'addMealPlan';
    if (path === '/employee/meal-plans/select') return 'selectReadyPlan';
    if (path === '/employee/meal-plans/view') return 'viewUsersPlan';
    if (path.startsWith('/employee/meal-plans') || path === '/meal-plans') return 'mealPlans';
    if (path.startsWith('/employee/exercises')) return 'exercises';
    if (path.startsWith('/employee/gym-plans')) return 'gymPlans';
    if (path.startsWith('/employee/workout-plans-overview')) return 'usersWorkoutPlans';
    if (path.startsWith('/employee/renew-subscription')) return 'renewSubscription';
    if (path === '/employee/reports-and-analytics') return 'reports';
    if (path === '/employee/chat') return 'chat';
    if (path === '/employee/settings') return 'settings';
    return 'dashboard';
  };

  const activeNav = getActiveNav();

  const toggleSubmenu = (key) => {
    setExpandedMenu(expandedMenu === key ? null : key);
  };

  // Hover animations for nav buttons
  const handleNavHover = (e, isEntering) => {
    const button = e.currentTarget;
    const icon = button.querySelector('.nav-icon');
    
    if (isEntering) {
      gsap.to(button, {
        x: 5,
        duration: 0.2,
        ease: 'power2.out',
      });
      if (icon) {
        gsap.to(icon, {
          scale: 1.2,
          rotation: 5,
          duration: 0.2,
          ease: 'power2.out',
        });
      }
    } else {
      gsap.to(button, {
        x: 0,
        duration: 0.2,
        ease: 'power2.out',
      });
      if (icon) {
        gsap.to(icon, {
          scale: 1,
          rotation: 0,
          duration: 0.2,
          ease: 'power2.out',
        });
      }
    }
  };

  // Click animation
  const handleNavClickAnimation = (e) => {
    const button = e.currentTarget;
    gsap.to(button, {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    });
  };

  // Theme toggle animation
  const handleThemeToggle = () => {
    gsap.to(themeToggleRef.current, {
      rotationY: 180,
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: () => {
        toggleTheme();
        gsap.to(themeToggleRef.current, {
          rotationY: 0,
          duration: 0.3,
          ease: 'power2.inOut',
        });
      }
    });
  };

  // Add button ref
  const addNavButtonRef = (el, index) => {
    navButtonRefs.current[index] = el;
  };

  return (
    <aside 
      ref={sidebarRef}
      className={`w-64 rounded-r-[32px] p-6 flex flex-col gap-8 transition-colors overflow-y-auto ${
        isDarkMode 
          ? 'bg-[#0f111f]' 
          : 'bg-white border-r border-gray-200'
      }`}
    >
      {/* User Profile */}
      <div ref={profileRef} className="flex items-center gap-3">
        <div ref={avatarRef}>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              className={`w-14 h-14 rounded-2xl object-cover border ${
                isDarkMode ? 'border-white/10' : 'border-gray-200'
              }`}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1f36ff] to-[#15b5ff] flex items-center justify-center text-white font-bold text-lg border ${
              isDarkMode ? 'border-white/10' : 'border-gray-200'
            } ${user.photoURL ? 'hidden' : ''}`}
          >
            {(user.displayName || user.email || 'E')[0].toUpperCase()}
          </div>
        </div>
        <div>
          <p className={`font-semibold text-lg ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {user.displayName || 'Employee'}
          </p>
          <span className={`text-xs ${
            isDarkMode ? 'text-white/60' : 'text-gray-500'
          }`}>
            Coach
          </span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav ref={navRef} className="flex flex-col gap-2 flex-1">
        {navItems.map(({ key, label, icon, path, submenu }, index) => (
          <div key={key}>
            <button
              ref={(el) => addNavButtonRef(el, index)}
              onClick={(e) => {
                handleNavClickAnimation(e);
                submenu ? toggleSubmenu(key) : handleNavClick(path);
              }}
              onMouseEnter={(e) => handleNavHover(e, true)}
              onMouseLeave={(e) => handleNavHover(e, false)}
              className={`w-full flex items-center gap-3 text-sm font-semibold px-4 py-3 rounded-2xl transition-colors ${
                activeNav === key || (submenu && submenu.some(item => activeNav === item.key))
                  ? 'bg-[#1f36ff] text-white shadow-lg shadow-blue-900/40'
                  : isDarkMode 
                    ? 'text-white/70 hover:bg-white/5'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="nav-icon text-lg">{icon}</span>
              {label}
              {submenu && (
                <span 
                  ref={(el) => { chevronRefs.current[key] = el; }}
                  className="ml-auto text-sm"
                >
                  <FiChevronDown />
                </span>
              )}
            </button>
            
            {/* Submenu */}
            {submenu && (
              <div 
                ref={(el) => { submenuRefs.current[key] = el; }}
                className="overflow-hidden"
                style={{ height: 0, opacity: 0 }}
              >
                <div className={`mt-2 ml-4 pl-4 border-l-2 flex flex-col gap-1 ${
                  isDarkMode ? 'border-white/10' : 'border-gray-200'
                }`}>
                  {submenu.map((item) => (
                    <button
                      key={item.key}
                      onClick={(e) => {
                        handleNavClickAnimation(e);
                        handleNavClick(item.path);
                      }}
                      onMouseEnter={(e) => handleNavHover(e, true)}
                      onMouseLeave={(e) => handleNavHover(e, false)}
                      className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-colors ${
                        activeNav === item.key
                          ? 'bg-[#1f36ff] text-white shadow-md shadow-blue-900/30 font-semibold'
                          : isDarkMode 
                            ? 'text-white/60 hover:bg-white/5 hover:text-white/90'
                            : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
      
      {/* Theme Toggle */}
      <div className="mt-auto">
        <button
          ref={themeToggleRef}
          onClick={handleThemeToggle}
          className={`w-full flex items-center justify-between text-xs p-3 rounded-2xl transition-colors ${
            isDarkMode 
              ? 'bg-white/5 hover:bg-white/10' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <span className={isDarkMode ? 'text-white/60' : 'text-gray-600'}>Light</span>
          <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs transition-all ${
            isDarkMode 
              ? 'bg-[#1f36ff] text-white' 
              : 'bg-gray-300 text-gray-700'
          }`}>
            <span>Dark</span>
          </div>
        </button>
      </div>
      
      {/* Logout Button */}
      <button
        ref={logoutRef}
        onClick={handleLogout}
        onMouseEnter={(e) => {
          gsap.to(e.currentTarget, {
            scale: 1.03,
            duration: 0.2,
            ease: 'power2.out',
          });
        }}
        onMouseLeave={(e) => {
          gsap.to(e.currentTarget, {
            scale: 1,
            duration: 0.2,
            ease: 'power2.out',
          });
        }}
        className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-2xl transition-colors font-medium text-sm"
      >
        Logout
      </button>
    </aside>
  );
};

export default EmployeeSidebar;
