import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiUsers, FiList, FiActivity, FiMessageCircle, FiArrowLeft, FiZap, FiSun, FiRefreshCw, FiCpu, FiBell, FiHeart, FiTrendingUp, FiTarget } from 'react-icons/fi';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const AboutUs = () => {
  const navigate = useNavigate();

  // Section refs
  const mainWrapperRef = useRef(null);
  const heroRef = useRef(null);
  const heroSectionRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroIllustrationRef = useRef(null);
  const heroFloatingElementsRef = useRef([]);
  const whoWeAreRef = useRef(null);
  const whoWeAreTextRef = useRef(null);
  const cardsRef = useRef(null);
  const cardRefs = useRef([]);
  const featuresRef = useRef(null);
  const featureItemRefs = useRef([]);
  const missionRef = useRef(null);
  const missionTextRef = useRef(null);
  const ctaRef = useRef(null);
  const ctaButtonRef = useRef(null);
  const floatingIconRefs = useRef([]);

  // Card data
  const cards = [
    {
      icon: <FiUsers />,
      title: 'Manage Users',
      description: 'Create, edit, assign meal plans, view workout plans, and track client progress.'
    },
    {
      icon: <FiList />,
      title: 'Build Meal Plans',
      description: 'Add custom meals, select ready-made templates, generate AI-based plans.'
    },
    {
      icon: <FiActivity />,
      title: 'Create Workout Programs',
      description: 'Full exercise library with GIFs, picker modal, custom weekly programs.'
    },
    {
      icon: <FiMessageCircle />,
      title: 'Chat System',
      description: 'Real-time communication with clients and admin, typing indicators, read receipts.'
    }
  ];

  // Features data
  const features = [
    { icon: <FiHeart />, name: 'Fitness Tips Engine' },
    { icon: <FiZap />, name: 'Coach Energy Meter' },
    { icon: <FiTrendingUp />, name: 'Animated Dashboard' },
    { icon: <FiSun />, name: 'Dark/Light Mode' },
    { icon: <FiRefreshCw />, name: 'Subscription Renewal' },
    { icon: <FiCpu />, name: 'AI Meal Plans (Gemini)' },
    { icon: <FiTarget />, name: 'AssistantBot Helper' },
    { icon: <FiBell />, name: 'Notifications & Events' },
    { icon: <FiActivity />, name: 'GSAP Animations' }
  ];

  // Floating icons data
  const floatingIcons = ['🏋️', '💪', '🔥', '⚡', '🥗', '🎯', '💧', '⭐'];

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // ==========================================
      // SMOOTH SCROLL DEFAULTS
      // ==========================================
      ScrollTrigger.defaults({
        toggleActions: 'play none none reverse',
      });

      // ==========================================
      // HERO SECTION - ENTRANCE ANIMATIONS
      // ==========================================
      const heroTl = gsap.timeline();
      
      // Set initial states
      gsap.set(heroTextRef.current?.children, { opacity: 0, y: 50 });
      gsap.set(heroIllustrationRef.current, { opacity: 0, scale: 0.8, x: 50 });

      // Hero title text reveal mask animation
      if (heroTitleRef.current) {
        const titleChars = heroTitleRef.current.querySelectorAll('.hero-char');
        gsap.set(titleChars, { yPercent: 120, opacity: 0 });
        
        heroTl.to(titleChars, {
          yPercent: 0,
          opacity: 1,
          stagger: 0.03,
          duration: 0.8,
          ease: 'power4.out',
          delay: 0.2
        });
      }

      // Other hero elements
      heroTl
        .to(heroTextRef.current?.children, {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.7,
          ease: 'power3.out',
        }, '-=0.5')
        .to(heroIllustrationRef.current, {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.8,
          ease: 'back.out(1.5)'
        }, '-=0.5');

      // ==========================================
      // PARALLAX SCROLL - HERO ILLUSTRATION
      // ==========================================
      gsap.to(heroIllustrationRef.current, {
        scrollTrigger: {
          trigger: heroSectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
        y: 150,
        scale: 0.9,
        ease: 'none'
      });

      // Parallax for hero floating elements (different speeds)
      heroFloatingElementsRef.current.forEach((el, index) => {
        if (el) {
          gsap.to(el, {
            scrollTrigger: {
              trigger: heroSectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.3 + (index * 0.2),
            },
            y: 80 + (index * 40),
            x: (index % 2 === 0 ? 1 : -1) * 30,
            rotation: (index % 2 === 0 ? 15 : -15),
            ease: 'none'
          });
        }
      });

      // ==========================================
      // PARALLAX SCROLL - FLOATING BACKGROUND ICONS
      // ==========================================
      floatingIconRefs.current.forEach((icon, index) => {
        if (icon) {
          // Base floating animation
          gsap.to(icon, {
            y: `${(Math.random() - 0.5) * 60}`,
            x: `${(Math.random() - 0.5) * 40}`,
            rotation: (Math.random() - 0.5) * 20,
            duration: 6 + Math.random() * 4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.5
          });

          // Parallax on scroll - different directions
          const direction = index % 4;
          const yMove = direction === 0 ? 200 : direction === 1 ? -150 : direction === 2 ? 100 : -200;
          const xMove = direction === 0 ? 50 : direction === 1 ? -80 : direction === 2 ? -40 : 60;
          
          gsap.to(icon, {
            scrollTrigger: {
              trigger: mainWrapperRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.8 + (index * 0.1),
            },
            y: yMove,
            x: xMove,
            rotation: (Math.random() - 0.5) * 45,
            ease: 'none'
          });
        }
      });

      // ==========================================
      // COLOR TRANSITION ON SCROLL - BACKGROUND DARKENING
      // ==========================================
      gsap.to(mainWrapperRef.current, {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 0.5,
        },
        backgroundColor: '#000000',
        ease: 'none'
      });

      // Additional overlay darkness for features section
      gsap.to('.features-overlay', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
          end: 'center center',
          scrub: 0.5,
        },
        opacity: 0.3,
        ease: 'none'
      });

      // ==========================================
      // WHO WE ARE SECTION - SMOOTH REVEAL
      // ==========================================
      gsap.from(whoWeAreTextRef.current, {
        scrollTrigger: {
          trigger: whoWeAreRef.current,
          start: 'top 80%',
          end: 'top 40%',
          scrub: 0.5,
        },
        opacity: 0,
        y: 80,
        ease: 'none'
      });

      // ==========================================
      // 3D CARD TILT ON SCROLL
      // ==========================================
      cardRefs.current.forEach((card, index) => {
        if (card) {
          // Initial entrance animation
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              end: 'top 60%',
              scrub: 0.5,
            },
            opacity: 0,
            scale: 0.85,
            y: 60,
            ease: 'none'
          });

          // 3D tilt effect while scrolling through cards section
          const rotateX = index < 2 ? 8 : -8;
          const rotateY = index % 2 === 0 ? -6 : 6;
          
          gsap.to(card, {
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 60%',
              end: 'bottom 40%',
              scrub: 0.5,
            },
            rotateX: rotateX,
            rotateY: rotateY,
            transformPerspective: 1000,
            ease: 'none'
          });

          // Reset tilt after section
          gsap.to(card, {
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'bottom 50%',
              end: 'bottom 20%',
              scrub: 0.5,
            },
            rotateX: 0,
            rotateY: 0,
            ease: 'none'
          });
        }
      });

      // ==========================================
      // FEATURES SECTION - STAGGER WITH SCRUB
      // ==========================================
      featureItemRefs.current.forEach((item, index) => {
        if (item) {
          gsap.from(item, {
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              end: 'top 70%',
              scrub: 0.3,
            },
            opacity: 0,
            x: index % 2 === 0 ? -50 : 50,
            y: 30,
            scale: 0.9,
            ease: 'none'
          });
        }
      });

      // ==========================================
      // MISSION STATEMENT - ENHANCED SPLIT TEXT
      // ==========================================
      if (missionTextRef.current) {
        const words = missionTextRef.current.querySelectorAll('.mission-word');
        
        gsap.from(words, {
          scrollTrigger: {
            trigger: missionRef.current,
            start: 'top 75%',
            end: 'top 35%',
            scrub: 0.3,
          },
          opacity: 0,
          y: 40,
          rotateX: -120,
          stagger: 0.02,
          ease: 'none'
        });

        // Additional glow effect on words
        gsap.to(words, {
          scrollTrigger: {
            trigger: missionRef.current,
            start: 'top 50%',
            end: 'bottom 50%',
            scrub: 0.5,
          },
          color: '#ffffff',
          textShadow: '0 0 30px rgba(31, 54, 255, 0.3)',
          stagger: 0.01,
          ease: 'none'
        });
      }

      // ==========================================
      // CTA SECTION - SMOOTH ENTRANCE
      // ==========================================
      gsap.from(ctaRef.current, {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 85%',
          end: 'top 55%',
          scrub: 0.5,
        },
        opacity: 0,
        y: 80,
        scale: 0.9,
        ease: 'none'
      });

      // CTA glow pulse when in view
      gsap.to('.cta-glow', {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 60%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0.8,
        scale: 1.1,
        duration: 1,
        ease: 'power2.out',
        repeat: -1,
        yoyo: true
      });

    }, mainWrapperRef);

    return () => ctx.revert();
  }, []);

  // Button hover animations
  const handleButtonHover = (isEntering) => {
    if (ctaButtonRef.current) {
      gsap.to(ctaButtonRef.current, {
        scale: isEntering ? 1.08 : 1,
        y: isEntering ? -5 : 0,
        boxShadow: isEntering 
          ? '0 25px 50px rgba(31, 54, 255, 0.5)' 
          : '0 10px 30px rgba(31, 54, 255, 0.4)',
        duration: 0.4,
        ease: 'power2.out'
      });
    }
  };

  // Split mission text into words
  const missionText = "Our mission is to empower coaches with the tools they need to help clients transform their lives through structured nutrition, powerful training programs, and seamless communication.";
  const missionWords = missionText.split(' ');

  // Split hero title into characters
  const heroTitle = "About FitFix";

  return (
    <div 
      ref={mainWrapperRef} 
      className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white overflow-x-hidden"
      style={{ backgroundColor: '#0f172a' }}
    >
      {/* Floating Background Icons with Parallax */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingIcons.map((icon, index) => (
          <div
            key={index}
            ref={(el) => (floatingIconRefs.current[index] = el)}
            className="absolute select-none will-change-transform"
            style={{
              fontSize: `${40 + Math.random() * 40}px`,
              opacity: 0.05,
              left: `${10 + (index * 12) % 80}%`,
              top: `${10 + (index * 15) % 80}%`,
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Dark overlay for color transition */}
      <div className="features-overlay fixed inset-0 bg-black opacity-0 pointer-events-none" />

      {/* ==========================================
          SECTION 1 — HERO SECTION
          ========================================== */}
      <section ref={heroSectionRef} className="min-h-screen flex items-center justify-center px-6 py-20 relative">
        {/* Background gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1f36ff]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#15b5ff]/15 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Text Content */}
          <div ref={heroTextRef} className="space-y-6">
            <span className="inline-block px-4 py-2 bg-[#1f36ff]/20 border border-[#1f36ff]/30 rounded-full text-sm font-semibold text-[#15b5ff] tracking-wider uppercase">
              Welcome to FitFix
            </span>
            
            {/* Hero Title with Character Reveal */}
            <div ref={heroTitleRef} className="overflow-hidden">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                {heroTitle.split('').map((char, index) => (
                  <span 
                    key={index} 
                    className={`hero-char inline-block ${char === ' ' ? 'mr-4' : ''} ${
                      index >= 6 ? 'bg-gradient-to-r from-[#1f36ff] to-[#15b5ff] bg-clip-text text-transparent' : ''
                    }`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-slate-400 font-medium">
              Your all-in-one coaching system
            </p>
            <p className="text-slate-500 text-lg max-w-lg">
              Empowering fitness professionals with powerful tools to transform lives.
            </p>
          </div>

          {/* Illustration Placeholder with Parallax */}
          <div ref={heroIllustrationRef} className="flex justify-center lg:justify-end will-change-transform">
            <div className="relative w-80 h-80 lg:w-96 lg:h-96" style={{ transformStyle: 'preserve-3d' }}>
              {/* Main circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1f36ff] to-[#15b5ff] rounded-full opacity-20 blur-2xl" />
              <div className="absolute inset-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">💪</div>
                  <p className="text-xl font-bold text-white">FitFix</p>
                  <p className="text-sm text-slate-400">Coaching Platform</p>
                </div>
              </div>
              {/* Floating elements with individual parallax */}
              <div 
                ref={(el) => (heroFloatingElementsRef.current[0] = el)}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30 will-change-transform"
              >
                🥗
              </div>
              <div 
                ref={(el) => (heroFloatingElementsRef.current[1] = el)}
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30 will-change-transform"
              >
                🏋️
              </div>
              <div 
                ref={(el) => (heroFloatingElementsRef.current[2] = el)}
                className="absolute top-1/2 -right-8 w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-amber-500/30 will-change-transform"
              >
                ⚡
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500">
          <span className="text-sm tracking-wider">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-slate-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 2 — WHO WE ARE
          ========================================== */}
      <section ref={whoWeAreRef} className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div ref={whoWeAreTextRef} className="space-y-8">
            <span className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold text-slate-400 tracking-[0.3em] uppercase">
              Who We Are
            </span>
            <h2 className="text-4xl md:text-5xl font-black">
              The Platform Built for{' '}
              <span className="bg-gradient-to-r from-[#1f36ff] to-[#15b5ff] bg-clip-text text-transparent">
                Fitness Pros
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
              FitFix is an advanced coaching platform built for fitness trainers, nutritionists, and gyms. 
              It helps professionals manage users, create meal plans, build gym programs, chat with members, 
              and track subscription plans — all in one powerful dashboard.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <div className="w-2 h-2 bg-[#1f36ff] rounded-full" />
              <div className="w-2 h-2 bg-[#15b5ff] rounded-full" />
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 3 — WHAT EMPLOYEES CAN DO (3D TILT CARDS)
          ========================================== */}
      <section ref={cardsRef} className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm font-semibold text-emerald-400 tracking-[0.3em] uppercase mb-6">
              Capabilities
            </span>
            <h2 className="text-4xl md:text-5xl font-black">
              What Employees Can Do
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8" style={{ perspective: '1500px' }}>
            {cards.map((card, index) => (
              <div
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                className="group relative p-8 rounded-[32px] bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5 backdrop-blur-sm hover:border-[#1f36ff]/30 transition-all duration-500 will-change-transform"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#1f36ff]/0 to-[#15b5ff]/0 group-hover:from-[#1f36ff]/10 group-hover:to-[#15b5ff]/5 transition-all duration-500" />
                
                <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1f36ff] to-[#15b5ff] flex items-center justify-center text-2xl text-white mb-6 shadow-lg shadow-[#1f36ff]/30 group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-[#15b5ff] transition-colors duration-300">
                    {card.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 4 — FEATURES OVERVIEW
          ========================================== */}
      <section ref={featuresRef} className="py-32 px-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1f36ff]/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm font-semibold text-purple-400 tracking-[0.3em] uppercase mb-6">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-black">
              Powerful Features Overview
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                ref={(el) => (featureItemRefs.current[index] = el)}
                className="group p-6 rounded-2xl bg-slate-800/30 border border-white/5 hover:border-purple-500/30 hover:bg-slate-800/50 transition-all duration-300 will-change-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-xl text-purple-400 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <span className="font-semibold text-sm md:text-base group-hover:text-purple-300 transition-colors duration-300">
                    {feature.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 5 — MISSION STATEMENT
          ========================================== */}
      <section ref={missionRef} className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm font-semibold text-amber-400 tracking-[0.3em] uppercase mb-8">
            Our Mission
          </span>
          
          <div 
            ref={missionTextRef}
            className="text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed text-slate-300"
            style={{ perspective: '1200px' }}
          >
            {missionWords.map((word, index) => (
              <span
                key={index}
                className="mission-word inline-block mr-2 md:mr-3 will-change-transform"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {word}
              </span>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-[#1f36ff] to-[#15b5ff] rounded-full" />
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 6 — CONTACT CTA
          ========================================== */}
      <section className="py-32 px-6">
        <div 
          ref={ctaRef}
          className="max-w-4xl mx-auto relative will-change-transform"
        >
          {/* Card with gradient border */}
          <div className="relative rounded-[40px] p-[2px] bg-gradient-to-r from-[#1f36ff] to-[#15b5ff]">
            <div className="rounded-[38px] bg-gradient-to-br from-slate-900 to-slate-950 p-12 md:p-16 text-center">
              {/* Glow effect */}
              <div className="cta-glow absolute inset-0 rounded-[38px] bg-gradient-to-r from-[#1f36ff]/10 to-[#15b5ff]/10 blur-xl opacity-50" />
              
              <div className="relative z-10">
                <div className="text-6xl mb-6">🚀</div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
                  Join FitFix today and transform the way you coach your clients.
                </p>
                
                <button
                  ref={ctaButtonRef}
                  onClick={() => navigate('/login')}
                  onMouseEnter={() => handleButtonHover(true)}
                  onMouseLeave={() => handleButtonHover(false)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#1f36ff] to-[#15b5ff] rounded-2xl font-bold text-lg text-white shadow-lg shadow-[#1f36ff]/40 transition-shadow duration-300 will-change-transform"
                >
                  <FiArrowLeft className="rotate-180" />
                  Return to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1f36ff] to-[#15b5ff] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-white">FitFix</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} FitFix. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="text-sm">Built with ❤️ for fitness pros</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
