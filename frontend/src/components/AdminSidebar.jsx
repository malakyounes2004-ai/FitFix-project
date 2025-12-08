import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { FiHome, FiUsers, FiDollarSign, FiMessageCircle, FiSettings, FiClipboard, FiChevronDown, FiCalendar, FiRepeat, FiCreditCard, FiBarChart2 } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

// Main nav items (without payments - that's now a group)
const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <FiHome />, path: '/admin-dashboard' },
  { key: 'employees', label: 'Employees', icon: <FiUsers />, path: '/admin/employees' },
  { key: 'employeeRequests', label: 'Employee Requests', icon: <FiClipboard />, path: '/admin/employee-requests' },
  { key: 'reports', label: 'Reports & Analytics', icon: <FiBarChart2 />, path: '/admin/reports' },
  { key: 'chat', label: 'Chat', icon: <FiMessageCircle />, path: '/admin/chat' },
  { key: 'settings', label: 'Settings', icon: <FiSettings />, path: '/settings' }
];

// Payments sub-menu items
const paymentsChildren = [
  { key: 'subscriptions', label: 'Subscriptions', icon: <FiCalendar />, path: '/admin/subscriptions' },
  { key: 'subPayments', label: 'Sub. Payments', icon: <FiRepeat />, path: '/admin/payments' },
  { key: 'empPayments', label: 'Emp Payments', icon: <FiCreditCard />, path: '/payments/admin' },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [paymentsOpen, setPaymentsOpen] = useState(false);

  // GSAP Refs
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);
  const avatarRef = useRef(null);
  const navRef = useRef(null);
  const paymentsGroupRef = useRef(null);
  const paymentsChildrenRef = useRef(null);
  const chevronRef = useRef(null);
  const themeToggleRef = useRef(null);
  const logoutRef = useRef(null);
  const navButtonRefs = useRef([]);

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

      // Profile section fade in + scale
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

      // Payments group
      tl.from(paymentsGroupRef.current, {
        x: -30,
        opacity: 0,
        duration: 0.4,
      }, '-=0.2');

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

  // GSAP Payments Dropdown Animation
  useEffect(() => {
    if (!paymentsChildrenRef.current || !chevronRef.current) return;

    if (paymentsOpen) {
      // Open animation
      gsap.to(chevronRef.current, {
        rotation: 180,
        duration: 0.3,
        ease: 'power2.out',
      });

      gsap.to(paymentsChildrenRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out',
      });

      // Stagger children
      const children = paymentsChildrenRef.current.querySelectorAll('button');
      gsap.from(children, {
        x: -20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.3,
        ease: 'power2.out',
        delay: 0.1,
      });
    } else {
      // Close animation
      gsap.to(chevronRef.current, {
        rotation: 0,
        duration: 0.3,
        ease: 'power2.out',
      });

      gsap.to(paymentsChildrenRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power3.in',
      });
    }
  }, [paymentsOpen]);

  // Auto-open payments menu if current path is a payments child
  useEffect(() => {
    const path = location.pathname;
    const isPaymentsChild = paymentsChildren.some(child => child.path === path);
    if (isPaymentsChild) {
      setPaymentsOpen(true);
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

  const togglePayments = () => {
    setPaymentsOpen(!paymentsOpen);
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

  // Determine active nav based on current path
  const getActiveNav = () => {
    const path = location.pathname;
    if (path === '/admin-dashboard') return 'dashboard';
    if (path === '/admin/employees') return 'employees';
    if (path === '/admin/employee-requests') return 'employeeRequests';
    if (path === '/admin/reports') return 'reports';
    if (path === '/admin/subscriptions') return 'subscriptions';
    if (path === '/admin/payments') return 'subPayments';
    if (path === '/payments/admin') return 'empPayments';
    if (path === '/admin/chat') return 'chat';
    if (path === '/settings') return 'settings';
    return 'dashboard';
  };

  const activeNav = getActiveNav();

  // Check if any payments child is active
  const isPaymentsActive = paymentsChildren.some(child => child.key === activeNav);

  // Add button ref
  const addNavButtonRef = (el, index) => {
    navButtonRefs.current[index] = el;
  };

  return (
    <aside 
      ref={sidebarRef}
      className={`w-64 rounded-r-[32px] p-6 flex flex-col gap-8 transition-colors ${
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
            {(user.displayName || user.email || 'A')[0].toUpperCase()}
          </div>
        </div>
        <div>
          <p className={`font-semibold text-lg ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {user.displayName || 'Admin'}
          </p>
          <span className={`text-xs ${
            isDarkMode ? 'text-white/60' : 'text-gray-500'
          }`}>
            Administrator
          </span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav ref={navRef} className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {/* Dashboard, Employees, Employee Requests */}
        {navItems.slice(0, 3).map(({ key, label, icon, path }, index) => (
          <button
            key={key}
            ref={(el) => addNavButtonRef(el, index)}
            onClick={(e) => {
              handleNavClickAnimation(e);
              handleNavClick(path);
            }}
            onMouseEnter={(e) => handleNavHover(e, true)}
            onMouseLeave={(e) => handleNavHover(e, false)}
            className={`flex items-center gap-3 text-sm font-semibold px-4 py-3 rounded-2xl transition-colors ${
              activeNav === key
                ? 'bg-[#1f36ff] text-white shadow-lg shadow-blue-900/40'
                : isDarkMode 
                  ? 'text-white/70 hover:bg-white/5'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="nav-icon text-lg">{icon}</span>
            {label}
          </button>
        ))}

        {/* Payments Group */}
        <div ref={paymentsGroupRef} className="mt-1">
          {/* Payments Parent Button */}
          <button
            onClick={(e) => {
              handleNavClickAnimation(e);
              togglePayments();
            }}
            onMouseEnter={(e) => handleNavHover(e, true)}
            onMouseLeave={(e) => handleNavHover(e, false)}
            className={`w-full flex items-center justify-between text-sm font-semibold px-4 py-3 rounded-2xl transition-colors ${
              isPaymentsActive
                ? 'bg-[#1f36ff]/20 text-white'
                : isDarkMode 
                  ? 'text-white/70 hover:bg-white/5'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="nav-icon text-lg"><FiDollarSign /></span>
              Payments
            </div>
            <span ref={chevronRef} className="text-sm">
              <FiChevronDown />
            </span>
          </button>

          {/* Payments Children */}
          <div 
            ref={paymentsChildrenRef}
            className="overflow-hidden"
            style={{ height: 0, opacity: 0 }}
          >
            <div className={`mt-1 ml-4 pl-4 border-l-2 ${
              isDarkMode ? 'border-white/10' : 'border-gray-200'
            }`}>
              {paymentsChildren.map(({ key, label, icon, path }) => (
                <button
                  key={key}
                  onClick={(e) => {
                    handleNavClickAnimation(e);
                    handleNavClick(path);
                  }}
                  onMouseEnter={(e) => handleNavHover(e, true)}
                  onMouseLeave={(e) => handleNavHover(e, false)}
                  className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-xl transition-colors mb-1 ${
                    activeNav === key
                      ? 'bg-[#1f36ff] text-white shadow-md shadow-blue-900/30'
                      : isDarkMode 
                        ? 'text-white/60 hover:bg-white/5 hover:text-white/90'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  <span className="nav-icon text-base">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat & Settings */}
        {navItems.slice(3).map(({ key, label, icon, path }, index) => (
          <button
            key={key}
            ref={(el) => addNavButtonRef(el, index + 3)}
            onClick={(e) => {
              handleNavClickAnimation(e);
              handleNavClick(path);
            }}
            onMouseEnter={(e) => handleNavHover(e, true)}
            onMouseLeave={(e) => handleNavHover(e, false)}
            className={`flex items-center gap-3 text-sm font-semibold px-4 py-3 rounded-2xl transition-colors ${
              activeNav === key
                ? 'bg-[#1f36ff] text-white shadow-lg shadow-blue-900/40'
                : isDarkMode 
                  ? 'text-white/70 hover:bg-white/5'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="nav-icon text-lg">{icon}</span>
            {label}
          </button>
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

export default AdminSidebar;
