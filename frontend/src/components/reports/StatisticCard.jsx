/**
 * ==========================================
 * STATISTIC CARD COMPONENT
 * ==========================================
 * 
 * PURPOSE: Reusable card component for displaying statistics
 * WHY: Consistent UI across all metric displays
 * ANIMATIONS: GSAP fade and scale on load
 */

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useTheme } from '../../context/ThemeContext';

const StatisticCard = ({ title, value, icon, color = 'blue', isLoading = false }) => {
  const { isDarkMode } = useTheme();
  const cardRef = useRef(null);
  const valueRef = useRef(null);

  // Color schemes for different metric types
  const colorSchemes = {
    blue: {
      bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      border: isDarkMode ? 'border-blue-500/30' : 'border-blue-200',
      text: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      iconBg: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
    },
    green: {
      bg: isDarkMode ? 'bg-green-500/10' : 'bg-green-50',
      border: isDarkMode ? 'border-green-500/30' : 'border-green-200',
      text: isDarkMode ? 'text-green-400' : 'text-green-600',
      iconBg: isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
    },
    red: {
      bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
      border: isDarkMode ? 'border-red-500/30' : 'border-red-200',
      text: isDarkMode ? 'text-red-400' : 'text-red-600',
      iconBg: isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
    },
    purple: {
      bg: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50',
      border: isDarkMode ? 'border-purple-500/30' : 'border-purple-200',
      text: isDarkMode ? 'text-purple-400' : 'text-purple-600',
      iconBg: isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
    },
    orange: {
      bg: isDarkMode ? 'bg-orange-500/10' : 'bg-orange-50',
      border: isDarkMode ? 'border-orange-500/30' : 'border-orange-200',
      text: isDarkMode ? 'text-orange-400' : 'text-orange-600',
      iconBg: isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  // GSAP animation on mount and value change
  useEffect(() => {
    if (!cardRef.current) return;

    const ctx = gsap.context(() => {
      // Card entrance animation
      gsap.from(cardRef.current, {
        opacity: 0,
        scale: 0.9,
        y: 20,
        duration: 0.5,
        ease: 'back.out(1.2)'
      });

      // Value count-up animation when value changes
      if (valueRef.current && !isLoading && value !== undefined && value !== null) {
        gsap.from(valueRef.current, {
          opacity: 0,
          scale: 0.8,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    }, cardRef);

    return () => ctx.revert();
  }, [value, isLoading]);

  return (
    <div
      ref={cardRef}
      className={`p-6 rounded-2xl border transition-all hover:scale-105 hover:shadow-lg ${
        scheme.bg
      } ${scheme.border} ${
        isDarkMode ? 'border-white/10' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${scheme.iconBg} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      
      <div className="space-y-2">
        <p className={`text-sm font-medium ${
          isDarkMode ? 'text-white/60' : 'text-gray-600'
        }`}>
          {title}
        </p>
        {isLoading ? (
          <div className="h-8 w-24 bg-gray-300/20 rounded animate-pulse" />
        ) : (
          <p
            ref={valueRef}
            className={`text-2xl font-bold ${scheme.text}`}
          >
            {value !== undefined && value !== null ? value : '0'}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatisticCard;

