import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

// Inline styles to avoid modifying global CSS
const styles = {
  container: {
    position: 'fixed',
    top: '100px',
    right: '30px',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  botWrapper: {
    position: 'relative',
    width: '80px',
    height: '80px',
    pointerEvents: 'auto',
    cursor: 'pointer',
  },
  glowRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(31, 54, 255, 0.3) 0%, transparent 70%)',
    filter: 'blur(8px)',
  },
  botBody: {
    position: 'relative',
    width: '70px',
    height: '70px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #1f36ff 0%, #15b5ff 100%)',
    boxShadow: '0 10px 30px rgba(31, 54, 255, 0.4), inset 0 2px 10px rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '5px auto',
  },
  faceContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  eyesContainer: {
    display: 'flex',
    gap: '12px',
  },
  eye: {
    width: '12px',
    height: '14px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    position: 'relative',
    overflow: 'hidden',
  },
  pupil: {
    position: 'absolute',
    bottom: '2px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '6px',
    height: '6px',
    backgroundColor: '#1a1a2e',
    borderRadius: '50%',
  },
  eyelid: {
    position: 'absolute',
    top: '-14px',
    left: '-2px',
    width: '16px',
    height: '14px',
    backgroundColor: '#1f36ff',
    borderRadius: '0 0 50% 50%',
  },
  mouth: {
    width: '16px',
    height: '8px',
    borderRadius: '0 0 10px 10px',
    backgroundColor: '#fff',
    opacity: 0.9,
  },
  antenna: {
    position: 'absolute',
    top: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '15px',
    backgroundColor: '#15b5ff',
    borderRadius: '2px',
  },
  antennaBall: {
    position: 'absolute',
    top: '-22px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '10px',
    height: '10px',
    backgroundColor: '#15b5ff',
    borderRadius: '50%',
    boxShadow: '0 0 10px rgba(21, 181, 255, 0.8)',
  },
  ears: {
    position: 'absolute',
    width: '8px',
    height: '20px',
    backgroundColor: '#15b5ff',
    borderRadius: '4px',
  },
  leftEar: {
    left: '-6px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  rightEar: {
    right: '-6px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  // Spark particles
  spark: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)',
    boxShadow: '0 0 6px rgba(255, 215, 0, 0.8)',
    opacity: 0,
  },
  spark1: {
    top: '-5px',
    left: '-10px',
  },
  spark2: {
    top: '-8px',
    right: '-8px',
  },
  spark3: {
    bottom: '5px',
    left: '-12px',
  },
  bubbleContainer: {
    marginTop: '15px',
    opacity: 0,
    pointerEvents: 'auto',
  },
  bubble: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '12px 16px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    maxWidth: '160px',
    textAlign: 'center',
  },
  bubbleDark: {
    backgroundColor: 'rgba(17, 19, 36, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  bubbleArrow: {
    position: 'absolute',
    top: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '0',
    height: '0',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: '8px solid rgba(255, 255, 255, 0.95)',
  },
  bubbleArrowDark: {
    borderBottomColor: 'rgba(17, 19, 36, 0.95)',
  },
  greeting: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a2e',
    margin: 0,
    lineHeight: 1.4,
  },
  greetingDark: {
    color: '#fff',
  },
  subText: {
    fontSize: '11px',
    color: '#666',
    margin: '4px 0 0 0',
  },
  subTextDark: {
    color: 'rgba(255,255,255,0.6)',
  },
  // Tooltip styles
  tooltipContainer: {
    marginTop: '10px',
    opacity: 0,
    pointerEvents: 'auto',
  },
  tooltip: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '14px 16px',
    borderRadius: '14px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    maxWidth: '180px',
    textAlign: 'left',
  },
  tooltipDark: {
    backgroundColor: 'rgba(17, 19, 36, 0.95)',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  tooltipArrow: {
    position: 'absolute',
    top: '-6px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '0',
    height: '0',
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderBottom: '6px solid rgba(255, 255, 255, 0.95)',
  },
  tooltipArrowDark: {
    borderBottomColor: 'rgba(17, 19, 36, 0.95)',
  },
  tooltipItem: {
    fontSize: '11px',
    color: '#444',
    margin: '0 0 6px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  tooltipItemDark: {
    color: 'rgba(255,255,255,0.8)',
  },
  tooltipIcon: {
    fontSize: '12px',
  },
  tooltipValue: {
    fontWeight: '600',
    color: '#1f36ff',
  },
  tooltipValueDark: {
    color: '#15b5ff',
  },
};

const AssistantBot = ({ isDarkMode = false }) => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const employeeName = currentUser?.displayName || 'Coach';
  
  const [showTooltip, setShowTooltip] = useState(false);
  const [stats, setStats] = useState({
    usersCount: 0,
    mealPlansCount: 0,
    lastWorkoutPlan: '—',
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Get auth token
  const getAuthToken = useCallback(async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return localStorage.getItem('token');
  }, []);

  // Fetch stats data
  const fetchStats = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      // Fetch users
      const usersResponse = await axios.get(
        `${API_BASE_URL}/employee/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const users = usersResponse.data?.data || [];
      const usersCount = users.length;

      // Count users with meal plans
      const usersWithMealPlans = users.filter(user => user.mealPlan).length;
      const mealPlansCount = usersWithMealPlans;

      // Find last workout plan (most recent user with workout plan)
      let lastWorkoutPlan = '—';
      const usersWithWorkoutPlans = users
        .filter(user => user.workoutPlan || user.gymPlan)
        .sort((a, b) => {
          const dateA = new Date(a.workoutPlan?.createdAt || a.gymPlan?.createdAt || 0);
          const dateB = new Date(b.workoutPlan?.createdAt || b.gymPlan?.createdAt || 0);
          return dateB - dateA;
        });

      if (usersWithWorkoutPlans.length > 0) {
        const lastUser = usersWithWorkoutPlans[0];
        lastWorkoutPlan = lastUser.displayName || lastUser.email?.split('@')[0] || '—';
      }

      setStats({
        usersCount,
        mealPlansCount,
        lastWorkoutPlan,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [API_BASE_URL, getAuthToken]);

  // Fetch stats on mount and listen for changes
  useEffect(() => {
    fetchStats();

    // Listen for user creation/deletion events
    const handleUserChange = () => {
      fetchStats();
    };

    window.addEventListener('userCreated', handleUserChange);
    window.addEventListener('userDeleted', handleUserChange);
    window.addEventListener('mealPlanUpdated', handleUserChange);
    window.addEventListener('workoutPlanUpdated', handleUserChange);

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      window.removeEventListener('userCreated', handleUserChange);
      window.removeEventListener('userDeleted', handleUserChange);
      window.removeEventListener('mealPlanUpdated', handleUserChange);
      window.removeEventListener('workoutPlanUpdated', handleUserChange);
      clearInterval(interval);
    };
  }, [fetchStats]);
  
  const containerRef = useRef(null);
  const botRef = useRef(null);
  const botBodyRef = useRef(null);
  const glowRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const leftEyelidRef = useRef(null);
  const rightEyelidRef = useRef(null);
  const mouthRef = useRef(null);
  const bubbleRef = useRef(null);
  const antennaBallRef = useRef(null);
  const tooltipRef = useRef(null);
  const spark1Ref = useRef(null);
  const spark2Ref = useRef(null);
  const spark3Ref = useRef(null);

  // Handle hover animations
  const handleMouseEnter = () => {
    // Scale up with bounce
    gsap.to(botBodyRef.current, {
      scale: 1.1,
      duration: 0.3,
      ease: 'back.out(1.7)',
    });
    
    // Widen eyes
    gsap.to([leftEyeRef.current, rightEyeRef.current], {
      scaleY: 1.3,
      scaleX: 1.1,
      duration: 0.2,
      ease: 'power2.out',
    });
    
    // Bigger smile
    gsap.to(mouthRef.current, {
      width: '20px',
      height: '10px',
      duration: 0.2,
      ease: 'power2.out',
    });
    
    // Intensify glow
    gsap.to(glowRef.current, {
      scale: 1.4,
      opacity: 0.8,
      duration: 0.3,
    });
  };

  const handleMouseLeave = () => {
    // Scale back
    gsap.to(botBodyRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
    
    // Reset eyes
    gsap.to([leftEyeRef.current, rightEyeRef.current], {
      scaleY: 1,
      scaleX: 1,
      duration: 0.2,
      ease: 'power2.out',
    });
    
    // Reset mouth
    gsap.to(mouthRef.current, {
      width: '16px',
      height: '8px',
      duration: 0.2,
      ease: 'power2.out',
    });
    
    // Reset glow
    gsap.to(glowRef.current, {
      scale: 1.2,
      opacity: 0.6,
      duration: 0.3,
    });
  };

  // Handle click for tooltip
  const handleClick = () => {
    setShowTooltip(prev => !prev);
  };

  // Tooltip animation
  useEffect(() => {
    if (tooltipRef.current) {
      if (showTooltip) {
        gsap.to(tooltipRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(tooltipRef.current, {
          opacity: 0,
          y: 10,
          duration: 0.2,
          ease: 'power2.in',
        });
      }
    }
  }, [showTooltip]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state - hidden
      gsap.set(containerRef.current, { opacity: 0, scale: 0.5 });
      gsap.set(bubbleRef.current, { opacity: 0, y: 10 });
      gsap.set(tooltipRef.current, { opacity: 0, y: 10 });

      // Entrance animation timeline
      const entranceTl = gsap.timeline({ delay: 0.5 });
      
      entranceTl
        .to(containerRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.7)',
        })
        .to(bubbleRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        }, '-=0.2');

      // Floating animation (gentle y oscillation)
      gsap.to(botRef.current, {
        y: -8,
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // Glowing pulse animation
      gsap.to(glowRef.current, {
        scale: 1.2,
        opacity: 0.6,
        duration: 1.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // Antenna ball glow pulse
      gsap.to(antennaBallRef.current, {
        boxShadow: '0 0 20px rgba(21, 181, 255, 1)',
        duration: 1,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // Spark particles animations
      const animateSpark = (sparkRef, delay) => {
        gsap.timeline({ repeat: -1, delay })
          .to(sparkRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
          })
          .to(sparkRef.current, {
            opacity: 0,
            scale: 0.2,
            duration: 0.8,
            ease: 'power2.in',
          })
          .to(sparkRef.current, {
            scale: 0.5,
            duration: 0.1,
          });
      };

      animateSpark(spark1Ref, 0);
      animateSpark(spark2Ref, 0.5);
      animateSpark(spark3Ref, 1);

      // Eye blinking animation
      const blink = () => {
        const blinkTl = gsap.timeline();
        blinkTl
          .to([leftEyelidRef.current, rightEyelidRef.current], {
            y: 14,
            duration: 0.1,
            ease: 'power2.in',
          })
          .to([leftEyelidRef.current, rightEyelidRef.current], {
            y: 0,
            duration: 0.1,
            ease: 'power2.out',
          });
      };

      // Blink every 3-5 seconds randomly
      const scheduleNextBlink = () => {
        const delay = 3000 + Math.random() * 2000;
        setTimeout(() => {
          blink();
          scheduleNextBlink();
        }, delay);
      };
      
      // Start blinking after entrance
      setTimeout(scheduleNextBlink, 1500);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} style={styles.container}>
      {/* Bot Wrapper */}
      <div 
        ref={botRef} 
        style={styles.botWrapper}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Glow Ring */}
        <div ref={glowRef} style={styles.glowRing}></div>
        
        {/* Spark Particles */}
        <div ref={spark1Ref} style={{ ...styles.spark, ...styles.spark1 }}></div>
        <div ref={spark2Ref} style={{ ...styles.spark, ...styles.spark2 }}></div>
        <div ref={spark3Ref} style={{ ...styles.spark, ...styles.spark3 }}></div>
        
        {/* Bot Body */}
        <div ref={botBodyRef} style={styles.botBody}>
          {/* Antenna */}
          <div style={styles.antenna}></div>
          <div ref={antennaBallRef} style={styles.antennaBall}></div>
          
          {/* Ears */}
          <div style={{ ...styles.ears, ...styles.leftEar }}></div>
          <div style={{ ...styles.ears, ...styles.rightEar }}></div>
          
          {/* Face */}
          <div style={styles.faceContainer}>
            {/* Eyes */}
            <div style={styles.eyesContainer}>
              {/* Left Eye */}
              <div ref={leftEyeRef} style={styles.eye}>
                <div ref={leftEyelidRef} style={styles.eyelid}></div>
                <div style={styles.pupil}></div>
              </div>
              {/* Right Eye */}
              <div ref={rightEyeRef} style={styles.eye}>
                <div ref={rightEyelidRef} style={styles.eyelid}></div>
                <div style={styles.pupil}></div>
              </div>
            </div>
            {/* Mouth */}
            <div ref={mouthRef} style={styles.mouth}></div>
          </div>
        </div>
      </div>

      {/* Tooltip on Click */}
      <div ref={tooltipRef} style={styles.tooltipContainer}>
        <div style={{
          ...styles.tooltip,
          ...(isDarkMode ? styles.tooltipDark : {}),
        }}>
          <div style={{
            ...styles.tooltipArrow,
            ...(isDarkMode ? styles.tooltipArrowDark : {}),
          }}></div>
          <p style={{
            ...styles.tooltipItem,
            ...(isDarkMode ? styles.tooltipItemDark : {}),
          }}>
            <span style={styles.tooltipIcon}>👥</span>
            Users you're training: 
            <span style={{
              ...styles.tooltipValue,
              ...(isDarkMode ? styles.tooltipValueDark : {}),
            }}>{stats.usersCount}</span>
          </p>
          <p style={{
            ...styles.tooltipItem,
            ...(isDarkMode ? styles.tooltipItemDark : {}),
          }}>
            <span style={styles.tooltipIcon}>🍽️</span>
            Meal Plans: 
            <span style={{
              ...styles.tooltipValue,
              ...(isDarkMode ? styles.tooltipValueDark : {}),
            }}>{stats.mealPlansCount}</span>
          </p>
          <p style={{
            ...styles.tooltipItem,
            ...(isDarkMode ? styles.tooltipItemDark : {}),
            marginBottom: 0,
          }}>
            <span style={styles.tooltipIcon}>🏋️</span>
            Last Workout Plan: 
            <span style={{
              ...styles.tooltipValue,
              ...(isDarkMode ? styles.tooltipValueDark : {}),
            }}>{stats.lastWorkoutPlan}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssistantBot;
