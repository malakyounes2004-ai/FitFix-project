import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import axios from 'axios';
import { useNotification } from '../hooks/useNotification';

const LoginTwoColumn = () => {
  console.log('LoginTwoColumn component rendering...');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // GSAP Refs
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const logoRef = useRef(null);
  const headlineRef = useRef(null);
  const formRef = useRef(null);
  const emailFieldRef = useRef(null);
  const passwordFieldRef = useRef(null);
  const submitBtnRef = useRef(null);
  const footerRef = useRef(null);

  // GSAP Entrance Animations
  useEffect(() => {
    // Ensure form starts empty every time
    setFormData({
      email: '',
      password: ''
    });
    setErrors({});
    setApiError('');
    
    // Show hero image with existing CSS transition
    setTimeout(() => setIsHeroVisible(true), 100);

    const ctx = gsap.context(() => {
      // Main timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Initial states
      gsap.set(cardRef.current, { opacity: 0, scale: 0.95, y: 30 });
      gsap.set(logoRef.current, { opacity: 0, x: -20 });
      gsap.set(headlineRef.current, { opacity: 0, y: 20 });
      gsap.set(formRef.current, { opacity: 0 });
      gsap.set([emailFieldRef.current, passwordFieldRef.current], { opacity: 0, x: 20 });
      gsap.set(submitBtnRef.current, { opacity: 0, y: 15 });
      gsap.set(footerRef.current, { opacity: 0, y: 15 });

      // Card entrance
      tl.to(cardRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.7,
        ease: 'back.out(1.2)',
      });

      // Logo slide in
      tl.to(logoRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.5,
      }, '-=0.4');

      // Headline reveal
      tl.to(headlineRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
      }, '-=0.3');

      // Form fade in
      tl.to(formRef.current, {
        opacity: 1,
        duration: 0.4,
      }, '-=0.3');

      // Form fields stagger
      tl.to([emailFieldRef.current, passwordFieldRef.current], {
        opacity: 1,
        x: 0,
        stagger: 0.12,
        duration: 0.4,
      }, '-=0.2');

      // Submit button
      tl.to(submitBtnRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.4,
      }, '-=0.2');

      // Footer
      tl.to(footerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.4,
      }, '-=0.2');

      // Logo icon subtle pulse
      gsap.to(logoRef.current?.querySelector('.logo-icon'), {
        scale: 1.05,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5,
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.role) {
          const role = user.role;
          
          if (role === 'admin') {
            navigate('/admin', { replace: true });
          } else if (role === 'employee') {
            const userId = user.uid || '';
            navigate(`/employee/${userId}`, { replace: true });
          } else if (role === 'user') {
            navigate('/dashboard', { replace: true });
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  // Input focus animation
  const handleInputFocus = (e) => {
    const field = e.target.closest('.input-field');
    if (field) {
      gsap.to(field, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out',
      });
      gsap.to(field.querySelector('.input-icon'), {
        color: '#10b981',
        scale: 1.1,
        duration: 0.2,
      });
    }
  };

  // Input blur animation
  const handleInputBlur = (e) => {
    const field = e.target.closest('.input-field');
    if (field) {
      gsap.to(field, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      });
      gsap.to(field.querySelector('.input-icon'), {
        color: '#6b7280',
        scale: 1,
        duration: 0.2,
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Button hover animation
  const handleButtonHover = (isEntering) => {
    if (isLoading) return;
    
    if (isEntering) {
      gsap.to(submitBtnRef.current, {
        scale: 1.03,
        y: -2,
        duration: 0.2,
        ease: 'power2.out',
      });
    } else {
      gsap.to(submitBtnRef.current, {
        scale: 1,
        y: 0,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      // Shake animation for invalid form
      gsap.to(formRef.current, {
        x: [-10, 10, -10, 10, 0],
        duration: 0.4,
        ease: 'power2.out',
      });
      
      if (!formData.email || !formData.password) {
        const msg = 'Please fill in all required fields';
        setApiError(msg);
        showNotification({
          type: 'error',
          message: msg
        });
      }
      return;
    }

    // Button click animation
    gsap.to(submitBtnRef.current, {
      scale: 0.98,
      duration: 0.1,
    });

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email: formData.email,
        password: formData.password
      }, {
        timeout: 10000
      });

      if (response.data.success) {
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }

        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        // Success animation
        gsap.to(submitBtnRef.current, {
          scale: 1.05,
          backgroundColor: '#059669',
          duration: 0.3,
        });

        showNotification({
          type: 'success',
          message: 'Login successful!'
        });

        const userRole = response.data.data?.user?.role || 'user';
        const userId = response.data.data?.user?.uid || '';
        
        // Exit animation
        gsap.to(cardRef.current, {
          scale: 0.95,
          opacity: 0,
          y: -20,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => {
            if (userRole === 'admin') {
              navigate('/admin', { replace: true });
            } else if (userRole === 'employee') {
              navigate(`/employee/${userId}`, { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          }
        });
      } else {
        const errorMsg = response.data.message || 'Login failed. Please check your credentials.';
        setApiError(errorMsg);
        showNotification({
          type: 'error',
          message: errorMsg
        });
        
        // Error shake
        gsap.to(formRef.current, {
          x: [-8, 8, -8, 8, 0],
          duration: 0.4,
        });
      }
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (data?.message) {
          errorMessage = data.message;
        } else if (status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (status === 404) {
          errorMessage = 'User not found. Please check your email.';
        } else {
          errorMessage = `Login failed (${status}). Please try again.`;
        }
      } else if (error.request) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please check your connection.';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Cannot connect to server. Make sure the backend is running.';
        }
      }
      
      setApiError(errorMessage);
      showNotification({
        type: 'error',
        message: errorMessage
      });

      // Error shake
      gsap.to(formRef.current, {
        x: [-8, 8, -8, 8, 0],
        duration: 0.4,
      });
    } finally {
      setIsLoading(false);
      gsap.to(submitBtnRef.current, {
        scale: 1,
        duration: 0.2,
      });
    }
  };

  // Navigate to contact admin with animation
  const handleContactAdmin = () => {
    gsap.to(cardRef.current, {
      x: -30,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => navigate('/contact-admin')
    });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6 lg:p-8 text-white overflow-hidden">
      {/* Two-Column Card Container */}
      <div 
        ref={cardRef}
        className="w-full max-w-6xl bg-black border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
      >
        
        {/* Left Column - Brand Section */}
        <div className="relative w-full lg:w-1/2 bg-gradient-to-br from-black via-gray-900 to-black p-8 lg:p-12 flex flex-col justify-between min-h-[500px] lg:min-h-auto">
          {/* Logo */}
          <div ref={logoRef} className="mb-8">
            <div className="inline-flex items-center space-x-2">
              <div className="logo-icon w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-white text-xl font-bold">FitFix</span>
            </div>
          </div>

          {/* Headline */}
          <div ref={headlineRef} className="flex-1 flex items-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Software which fits your need perfectly
            </h1>
          </div>

          {/* Hero Image - Static (no GSAP movement) */}
          <div 
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 lg:translate-x-1/3 transition-all duration-1000 ease-out ${
              isHeroVisible ? 'opacity-100 translate-x-1/4 lg:translate-x-1/3' : 'opacity-0 translate-x-0'
            }`}
          >
            <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 ring-4 ring-white/20">
              <img 
                src="/hero-image.png" 
                alt="Fitness hero illustration" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              {/* Fallback gradient if image not found */}
              <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md flex items-center justify-center hidden">
                <svg className="w-32 h-32 lg:w-40 lg:h-40 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 bg-black p-8 lg:p-12 flex items-center border-t lg:border-t-0 lg:border-l border-gray-800">
          <div ref={formRef} className="w-full max-w-md mx-auto">
            {/* Error Message */}
            {apiError && (
              <div className="mb-6 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-sm text-red-200 font-medium">{apiError}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate autoComplete="off">
              {/* Email Field */}
              <div ref={emailFieldRef}>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="input-field relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="input-icon h-5 w-5 text-gray-500 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
                      errors.email
                        ? 'border-red-500/70 focus:ring-2 focus:ring-red-400 focus:border-red-400'
                        : 'border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                    } focus:outline-none bg-gray-900 text-white placeholder:text-gray-500`}
                    placeholder="Enter your email"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    aria-label="Email address"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-2 text-sm text-red-400 flex items-center" role="alert">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div ref={passwordFieldRef}>
                <div className="mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-200">
                    Password
                  </label>
                </div>
                <div className="input-field relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="input-icon h-5 w-5 text-gray-500 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
                      errors.password
                        ? 'border-red-500/70 focus:ring-2 focus:ring-red-400 focus:border-red-400'
                        : 'border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                    } focus:outline-none bg-gray-900 text-white placeholder:text-gray-500`}
                    placeholder="Enter your password"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    aria-label="Password"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-2 text-sm text-red-400 flex items-center" role="alert">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <button
                ref={submitBtnRef}
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => handleButtonHover(true)}
                onMouseLeave={() => handleButtonHover(false)}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-base transition-colors duration-300 ${
                  isLoading
                    ? 'bg-emerald-700/60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-emerald-500/30'
                } focus:outline-none focus:ring-4 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black`}
                aria-label="Sign in to your account"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'LOGIN'
                )}
              </button>

              {/* Contact Admin Text */}
              <div ref={footerRef} className="mt-6 pt-6 border-t border-gray-800/70 space-y-3">
                <p className="text-center text-sm text-gray-300">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={handleContactAdmin}
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, {
                        scale: 1.05,
                        duration: 0.2,
                      });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, {
                        scale: 1,
                        duration: 0.2,
                      });
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1"
                    aria-label="Contact admin to create an account"
                  >
                    Get Account
                  </button>
                </p>
                <p className="text-center text-sm text-gray-400">
                  <button
                    type="button"
                    onClick={() => navigate('/about')}
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, {
                        scale: 1.05,
                        duration: 0.2,
                      });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, {
                        scale: 1,
                        duration: 0.2,
                      });
                    }}
                    className="text-[#15b5ff] hover:text-[#1f36ff] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                    aria-label="Learn more about FitFix"
                  >
                    About FitFix
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginTwoColumn;
