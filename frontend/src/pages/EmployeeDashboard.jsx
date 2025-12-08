import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiMessageCircle } from 'react-icons/fi';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../context/ThemeContext';
import EmployeeSidebar from '../components/EmployeeSidebar';
import { useDashboardLoader } from '../hooks/useDashboardLoader';
import AssistantBot from '../components/AssistantBot';
import AnimatedWelcomeIllustration from '../components/AnimatedWelcomeIllustration';
import { gsap } from 'gsap';

// Fitness tips data organized by category
const FITNESS_TIPS = [
  // Workout Tips
  { category: 'Workout', icon: '🏋️', tip: 'Progressive overload is the key to muscle growth — increase weight gradually.' },
  { category: 'Workout', icon: '🏋️', tip: 'A 10-minute warm-up improves performance and reduces injury risk.' },
  { category: 'Workout', icon: '🏋️', tip: 'Compound exercises like squats and deadlifts burn more calories than isolation moves.' },
  // Weight Loss Tips
  { category: 'Weight Loss', icon: '🔥', tip: 'Creating a 500-calorie deficit daily leads to about 1 pound of fat loss per week.' },
  { category: 'Weight Loss', icon: '🔥', tip: 'High-intensity interval training (HIIT) burns fat faster than steady cardio.' },
  { category: 'Weight Loss', icon: '🔥', tip: 'Walking 10,000 steps daily can burn an extra 300-500 calories.' },
  // Muscle Gain Tips
  { category: 'Muscle Gain', icon: '💪', tip: 'Aim for 0.7-1g of protein per pound of body weight for optimal muscle growth.' },
  { category: 'Muscle Gain', icon: '💪', tip: 'Muscles grow during rest, not during workouts — recovery is essential.' },
  { category: 'Muscle Gain', icon: '💪', tip: 'Train each muscle group 2x per week for maximum hypertrophy.' },
  // Nutrition Tips
  { category: 'Nutrition', icon: '🥗', tip: 'Eating protein within 45 minutes after your workout boosts recovery.' },
  { category: 'Nutrition', icon: '🥗', tip: 'Colorful plates mean more nutrients — eat the rainbow!' },
  { category: 'Nutrition', icon: '🥗', tip: 'Complex carbs provide sustained energy for longer workouts.' },
  // Hydration Tips
  { category: 'Hydration', icon: '💧', tip: 'Drink water 30 minutes before your workout to maximize performance.' },
  { category: 'Hydration', icon: '💧', tip: 'Dehydration of just 2% can decrease workout performance by 25%.' },
  { category: 'Hydration', icon: '💧', tip: 'Aim for half your body weight in ounces of water daily.' },
  // Recovery Tips
  { category: 'Recovery', icon: '😴', tip: 'Sleep 7-9 hours to optimize fat loss and muscle building.' },
  { category: 'Recovery', icon: '😴', tip: "Don't skip rest days — recovery is when your body grows stronger." },
  { category: 'Recovery', icon: '😴', tip: 'Foam rolling can reduce muscle soreness by up to 50%.' },
  // General Tips
  { category: 'Consistency', icon: '⭐', tip: 'Consistency beats intensity — small workouts daily > long workouts weekly.' },
  { category: 'Mindset', icon: '🧠', tip: 'Track your progress — what gets measured gets improved.' },
];

const EmployeeDashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState(null);

  // Refs for GSAP animations
  const fitnessTipCardRef = useRef(null);
  const iconRef = useRef(null);
  const underlineRef = useRef(null);
  const energyBarRef = useRef(null);
  const energyGlowRef = useRef(null);
  
  // Refs for floating background icons
  const floatingIcon1Ref = useRef(null);
  const floatingIcon2Ref = useRef(null);
  const floatingIcon3Ref = useRef(null);
  const floatingIcon4Ref = useRef(null);

  // Calculate energy level based on time of day (morning = high, evening = lower)
  const energyLevel = useMemo(() => {
    const hour = new Date().getHours();
    // Energy peaks at 10am, lowest at 3pm, recovers in evening
    if (hour >= 6 && hour < 10) return 70 + Math.random() * 20; // 70-90%
    if (hour >= 10 && hour < 12) return 85 + Math.random() * 15; // 85-100%
    if (hour >= 12 && hour < 15) return 50 + Math.random() * 20; // 50-70%
    if (hour >= 15 && hour < 18) return 40 + Math.random() * 25; // 40-65%
    if (hour >= 18 && hour < 21) return 55 + Math.random() * 20; // 55-75%
    return 30 + Math.random() * 20; // 30-50% (night)
  }, []);

  const getEnergyStatus = (level) => {
    if (level >= 80) return { text: 'Fully Charged! 🔥', color: 'emerald' };
    if (level >= 60) return { text: 'High Energy 💪', color: 'blue' };
    if (level >= 40) return { text: 'Moderate ⚡', color: 'yellow' };
    return { text: 'Recharge Needed 😴', color: 'orange' };
  };

  const energyStatus = getEnergyStatus(energyLevel);

  // Select a random tip on mount
  const randomTip = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * FITNESS_TIPS.length);
    return FITNESS_TIPS[randomIndex];
  }, []);

  // Use the unified dashboard loader hook - loads instantly from cache
  const {
    refresh
  } = useDashboardLoader('employee', userId);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Set employee from localStorage immediately
    setEmployee(currentUser);
    
    // Check if we're on a valid dashboard route (not other employee routes)
    const path = window.location.pathname;
    const validEmployeeRoutes = ['/employee-dashboard', '/employee/my-users', '/employee/add-user', '/employee/add-meal-plan', '/employee/chat', '/employee/settings'];
    const isOtherEmployeeRoute = validEmployeeRoutes.some(route => path === route || path.startsWith(route + '/'));
    
    // If we're on another employee route, don't process dashboard logic
    if (isOtherEmployeeRoute && !path.includes(`/employee/${currentUser.uid}`) && path !== '/employee-dashboard') {
      return;
    }
    
    // If userId is not provided in URL, use current user's ID and redirect
    if (!userId && currentUser.uid) {
      navigate(`/employee/${currentUser.uid}`, { replace: true });
      return;
    }
    
    // Verify the userId matches the logged-in employee (only if userId is a valid UID format)
    // Check if userId looks like a UID (alphanumeric, typically 28 chars) vs a route name
    const isValidUID = userId && /^[a-zA-Z0-9]{20,}$/.test(userId);
    if (userId && isValidUID && currentUser.uid !== userId) {
      showNotification({
        type: 'error',
        message: 'Access denied. You can only view your own dashboard.'
      });
      navigate(`/employee/${currentUser.uid}`, { replace: true });
      return;
    }
    
    if (currentUser.role !== 'employee') {
      showNotification({
        type: 'error',
        message: 'Access denied. Employee access required.'
      });
      navigate('/login', { replace: true });
      return;
    }
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }
  }, [userId, navigate, showNotification]);

  // Listen for user creation events from sidebar
  useEffect(() => {
    const handleUserCreated = () => {
      // Refresh dashboard data when a new user is created
      setTimeout(() => {
        refresh();
      }, 500);
    };

    window.addEventListener('userCreated', handleUserCreated);
    return () => {
      window.removeEventListener('userCreated', handleUserCreated);
    };
  }, [refresh]);

  // GSAP Animations for Fitness Tip Card
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation - fade in + slide from bottom
      gsap.from(fitnessTipCardRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.3,
      });

      // Floating effect
      gsap.to(fitnessTipCardRef.current, {
        y: -6,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.1,
      });

      // Icon pulse animation
      gsap.to(iconRef.current, {
        scale: 1.1,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Underline animation
      gsap.from(underlineRef.current, {
        scaleX: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.8,
      });

      gsap.to(underlineRef.current, {
        opacity: 0.6,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.4,
      });
    }, fitnessTipCardRef);

    return () => ctx.revert();
  }, []);

  // GSAP Animation for Energy Bar
  useEffect(() => {
    if (!energyBarRef.current) return;

    const ctx = gsap.context(() => {
      // Animate width from 0 to energy level
      gsap.fromTo(energyBarRef.current, 
        { width: '0%' },
        { 
          width: `${energyLevel}%`, 
          duration: 1.5, 
          ease: 'power3.out',
          delay: 0.5,
        }
      );

      // If energy is high (>= 70%), add glow pulse
      if (energyLevel >= 70 && energyGlowRef.current) {
        gsap.to(energyGlowRef.current, {
          opacity: 0.8,
          scale: 1.02,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 2,
        });
      }

      // Subtle shimmer effect on the bar
      gsap.to(energyBarRef.current, {
        backgroundPosition: '200% center',
        duration: 2,
        repeat: -1,
        ease: 'linear',
        delay: 2,
      });
    });

    return () => ctx.revert();
  }, [energyLevel]);

  // GSAP Animation for Floating Background Icons
  useEffect(() => {
    const floatingIcons = [
      floatingIcon1Ref.current,
      floatingIcon2Ref.current,
      floatingIcon3Ref.current,
      floatingIcon4Ref.current,
    ];

    const ctx = gsap.context(() => {
      floatingIcons.forEach((icon, index) => {
        if (!icon) return;

        // Random starting position offset
        const randomX = (Math.random() - 0.5) * 30;
        const randomY = (Math.random() - 0.5) * 30;
        const randomRotation = Math.random() * 360;
        const duration = 8 + Math.random() * 6; // 8-14 seconds

        // Set initial random rotation
        gsap.set(icon, { rotation: randomRotation });

        // Slow floating animation - X axis
        gsap.to(icon, {
          x: randomX,
          duration: duration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.5,
        });

        // Slow floating animation - Y axis (different duration for organic feel)
        gsap.to(icon, {
          y: randomY + (Math.random() - 0.5) * 20,
          duration: duration * 1.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.3,
        });

        // Very slow rotation
        gsap.to(icon, {
          rotation: randomRotation + (Math.random() > 0.5 ? 15 : -15),
          duration: duration * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        // Subtle scale breathing
        gsap.to(icon, {
          scale: 1 + Math.random() * 0.1,
          duration: duration * 0.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.7,
        });
      });
    });

    return () => ctx.revert();
  }, []);

  // Hover handlers for the card
  const handleCardMouseEnter = () => {
    gsap.to(fitnessTipCardRef.current, {
      scale: 1.03,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleCardMouseLeave = () => {
    gsap.to(fitnessTipCardRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <div className={`min-h-screen flex transition-colors ${
      isDarkMode 
        ? 'bg-[#05050c] text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Assistant Bot */}
      <AssistantBot isDarkMode={isDarkMode} />
      
      {/* Sidebar */}
      <EmployeeSidebar />

      {/* Main content */}
      <main className="flex-1 px-10 py-8 relative overflow-hidden">
        {/* Floating Background Icons */}
        <div 
          ref={floatingIcon1Ref}
          className="absolute pointer-events-none select-none"
          style={{
            top: '10%',
            left: '5%',
            fontSize: '80px',
            opacity: 0.08,
            zIndex: 0,
          }}
        >
          🏋️
        </div>
        <div 
          ref={floatingIcon2Ref}
          className="absolute pointer-events-none select-none"
          style={{
            top: '60%',
            right: '8%',
            fontSize: '70px',
            opacity: 0.08,
            zIndex: 0,
          }}
        >
          💪
        </div>
        <div 
          ref={floatingIcon3Ref}
          className="absolute pointer-events-none select-none"
          style={{
            bottom: '15%',
            left: '15%',
            fontSize: '65px',
            opacity: 0.08,
            zIndex: 0,
          }}
        >
          🔥
        </div>
        <div 
          ref={floatingIcon4Ref}
          className="absolute pointer-events-none select-none"
          style={{
            top: '35%',
            right: '20%',
            fontSize: '75px',
            opacity: 0.08,
            zIndex: 0,
          }}
        >
          ⚡
        </div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {error && (
              <div className="mt-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all duration-200 flex items-center justify-center hover:shadow-lg hover:shadow-white/10">
              <FiMessageCircle className="text-lg transition-transform duration-200 hover:scale-110" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Welcome Section with Animated Illustration */}
          <section className={`relative overflow-hidden rounded-[32px] transition-all duration-300 ${
            isDarkMode
              ? 'bg-gradient-to-br from-[#111324] via-[#161929] to-[#1a1d2e] border border-white/5'
              : 'bg-gradient-to-br from-white via-gray-50 to-slate-100 border border-gray-100'
          }`}
          style={{
            boxShadow: isDarkMode
              ? '0 20px 50px rgba(0, 0, 0, 0.4), 0 8px 20px rgba(31, 54, 255, 0.1)'
              : '0 20px 50px rgba(0, 0, 0, 0.05), 0 8px 20px rgba(0, 0, 0, 0.03)',
          }}
          >
            {/* Background decorative elements */}
            <div 
              className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
                isDarkMode ? 'bg-[#1f36ff]/10' : 'bg-[#6366f1]/5'
              }`}
              style={{ transform: 'translate(40%, -40%)' }}
            />
            <div 
              className={`absolute bottom-0 left-0 w-60 h-60 rounded-full blur-3xl pointer-events-none ${
                isDarkMode ? 'bg-[#10b981]/10' : 'bg-[#10b981]/5'
              }`}
              style={{ transform: 'translate(-30%, 30%)' }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
              {/* Illustration */}
              <div className="w-full md:w-1/2 max-w-[320px] md:max-w-none">
                <AnimatedWelcomeIllustration isDarkMode={isDarkMode} />
              </div>

              {/* Welcome Text */}
              <div className="flex-1 text-center md:text-left">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
                  isDarkMode
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <span className="text-sm">👋</span>
                  Welcome Back
                </div>
                
                <h2 className={`text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Hey, {employee?.displayName?.split(' ')[0] || 'Coach'}!
                </h2>
                
                <p className={`text-base md:text-lg leading-relaxed mb-6 max-w-md ${
                  isDarkMode ? 'text-white/60' : 'text-gray-600'
                }`}>
                  Ready to empower your clients on their fitness journey today? 
                  Your guidance makes all the difference.
                </p>

                <div className={`flex flex-wrap justify-center md:justify-start gap-4 ${
                  isDarkMode ? 'text-white/40' : 'text-gray-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                    }`} />
                    <span className="text-sm">Track Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                    }`} />
                    <span className="text-sm">Create Plans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isDarkMode ? 'bg-purple-400' : 'bg-purple-500'
                    }`} />
                    <span className="text-sm">Inspire Change</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Daily Fitness Insight Card */}
          <section
            ref={fitnessTipCardRef}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className={`relative overflow-hidden rounded-[32px] p-8 cursor-pointer transition-shadow duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#1f36ff] via-[#1a2ed9] to-[#15b5ff]'
                : 'bg-gradient-to-br from-[#f8eedf] via-[#fbe8d8] to-[#fbe3d3]'
            }`}
            style={{
              boxShadow: isDarkMode
                ? '0 20px 60px rgba(31, 54, 255, 0.3), 0 8px 20px rgba(21, 181, 255, 0.2)'
                : '0 20px 60px rgba(248, 238, 223, 0.5), 0 8px 20px rgba(251, 227, 211, 0.3)',
            }}
          >
            {/* Background decorative elements */}
            <div 
              className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl ${
                isDarkMode ? 'bg-[#15b5ff]/20' : 'bg-[#ffd700]/10'
              }`}
              style={{ transform: 'translate(30%, -30%)' }}
            />
            <div 
              className={`absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl ${
                isDarkMode ? 'bg-[#1f36ff]/30' : 'bg-[#ff9f43]/10'
              }`}
              style={{ transform: 'translate(-30%, 30%)' }}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Category Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${
                isDarkMode
                  ? 'bg-white/10 text-white/90 backdrop-blur-sm'
                  : 'bg-black/5 text-[#111324]/80'
              }`}>
                <span 
                  ref={iconRef}
                  className="text-lg"
                  style={{ display: 'inline-block' }}
                >
                  {randomTip.icon}
                </span>
                {randomTip.category}
              </div>

              {/* Title */}
              <div className="mb-4">
                <h2 className={`text-2xl md:text-3xl font-black tracking-tight mb-2 ${
                  isDarkMode ? 'text-white' : 'text-[#111324]'
                }`}>
                  Daily Fitness Insight
                </h2>
                {/* Animated underline */}
                <div 
                  ref={underlineRef}
                  className={`h-1 w-24 rounded-full ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-[#15b5ff] to-[#ffd700]'
                      : 'bg-gradient-to-r from-[#1f36ff] to-[#15b5ff]'
                  }`}
                  style={{ transformOrigin: 'left' }}
                />
              </div>

              {/* Tip Text */}
              <p className={`text-lg md:text-xl leading-relaxed font-medium max-w-2xl ${
                isDarkMode ? 'text-white/90' : 'text-[#111324]/80'
              }`}>
                "{randomTip.tip}"
              </p>

              {/* Footer */}
              <div className={`mt-8 flex items-center gap-4 ${
                isDarkMode ? 'text-white/50' : 'text-[#111324]/50'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">💡</span>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Tip refreshes on page load
                  </span>
                </div>
                <div className={`flex-1 h-px ${
                  isDarkMode ? 'bg-white/10' : 'bg-black/10'
                }`} />
                <div className="flex items-center gap-1">
                  {['🏋️', '🔥', '💪', '🥗', '💧'].map((emoji, i) => (
                    <span 
                      key={i} 
                      className="text-sm opacity-60 hover:opacity-100 transition-opacity cursor-default"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative corner accent */}
            <div 
              className={`absolute bottom-0 right-0 w-32 h-32 ${
                isDarkMode ? 'opacity-10' : 'opacity-5'
              }`}
              style={{
                background: isDarkMode
                  ? 'radial-gradient(circle at bottom right, #fff, transparent 70%)'
                  : 'radial-gradient(circle at bottom right, #1f36ff, transparent 70%)',
              }}
            />
          </section>

          {/* Coach Energy Level Card */}
          <section className={`relative rounded-[32px] p-6 transition-all duration-300 hover:shadow-2xl overflow-hidden ${
            isDarkMode
              ? 'bg-[#111324] border border-white/5 hover:border-white/10'
              : 'bg-white border border-gray-100 hover:shadow-gray-200/50'
          }`}>
            {/* Glow effect for high energy */}
            {energyLevel >= 70 && (
              <div 
                ref={energyGlowRef}
                className="absolute inset-0 rounded-[32px] pointer-events-none"
                style={{
                  background: energyLevel >= 80
                    ? 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)'
                    : 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                  opacity: 0.5,
                }}
              />
            )}

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                    energyStatus.color === 'emerald'
                      ? isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                      : energyStatus.color === 'blue'
                        ? isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                        : energyStatus.color === 'yellow'
                          ? isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'
                          : isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'
                  }`}>
                    ⚡
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Coach Energy Level
                    </h3>
                    <p className={`text-sm ${
                      energyStatus.color === 'emerald'
                        ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        : energyStatus.color === 'blue'
                          ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          : energyStatus.color === 'yellow'
                            ? isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                            : isDarkMode ? 'text-orange-400' : 'text-orange-600'
                    }`}>
                      {energyStatus.text}
                    </p>
                  </div>
                </div>
                <div className={`text-3xl font-black ${
                  energyStatus.color === 'emerald'
                    ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    : energyStatus.color === 'blue'
                      ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      : energyStatus.color === 'yellow'
                        ? isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                        : isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  {Math.round(energyLevel)}%
                </div>
              </div>

              {/* Energy Bar */}
              <div className={`relative h-6 rounded-full overflow-hidden ${
                isDarkMode ? 'bg-white/5' : 'bg-gray-100'
              }`}>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 10px,
                      ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 10px,
                      ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 20px
                    )`,
                  }}
                />
                
                {/* Animated Energy Bar */}
                <div 
                  ref={energyBarRef}
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: '0%',
                    background: energyStatus.color === 'emerald'
                      ? 'linear-gradient(90deg, #059669, #10b981, #34d399)'
                      : energyStatus.color === 'blue'
                        ? 'linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)'
                        : energyStatus.color === 'yellow'
                          ? 'linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #ea580c, #f97316, #fb923c)',
                    backgroundSize: '200% 100%',
                    boxShadow: energyLevel >= 70
                      ? energyStatus.color === 'emerald'
                        ? '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3)'
                        : '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)'
                      : 'none',
                  }}
                >
                  {/* Shimmer effect */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      backgroundSize: '200% 100%',
                    }}
                  />
                </div>

                {/* Tick marks */}
                <div className="absolute inset-0 flex justify-between px-1">
                  {[25, 50, 75].map((mark) => (
                    <div 
                      key={mark}
                      className={`w-px h-full ${
                        isDarkMode ? 'bg-white/10' : 'bg-black/5'
                      }`}
                      style={{ marginLeft: `${mark}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Footer hints */}
              <div className={`mt-3 flex items-center justify-between text-xs ${
                isDarkMode ? 'text-white/40' : 'text-gray-400'
              }`}>
                <span>Low</span>
                <span className={isDarkMode ? 'text-white/60' : 'text-gray-500'}>
                  {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} — Based on typical coach energy patterns
                </span>
                <span>High</span>
              </div>
            </div>
          </section>

          
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
