/**
 * ==========================================
 * SUBSCRIPTION BAR CHART COMPONENT
 * ==========================================
 * 
 * PURPOSE: Display active vs expired subscriptions
 * WHY: Quick visual comparison of subscription status
 * DATA: Active and expired subscription counts
 */

import React, { useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { gsap } from 'gsap';

const SubscriptionBarChart = ({ activeCount, expiredCount, isDarkMode }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      // Ensure chart container is always fully visible
      gsap.set(chartRef.current, { opacity: 1 });
      gsap.from(chartRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.4,
        onComplete: () => {
          // Force opacity to 1 after animation
          gsap.set(chartRef.current, { opacity: 1 });
        }
      });
    }
  }, []);

  const data = [
    {
      name: 'Subscriptions',
      Active: activeCount || 0,
      Expired: expiredCount || 0
    }
  ];

  return (
    <div 
      ref={chartRef}
      className={`p-6 rounded-2xl border-2 ${
        isDarkMode
          ? 'bg-[#020617] border-[#16A34A] shadow-xl shadow-[#16A34A]/30'
          : 'bg-white border-[#16A34A] shadow-xl'
      }`}
      style={{ 
        minHeight: '350px',
        opacity: 1,
        boxShadow: isDarkMode ? '0 20px 50px rgba(22, 163, 74, 0.2), 0 0 30px rgba(22, 163, 74, 0.1)' : undefined
      }}
    >
      <h3 className={`text-2xl font-bold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        📊 Active vs Expired Subscriptions
      </h3>
      <ResponsiveContainer width="100%" height={350} style={{ opacity: 1 }}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#334155" 
            strokeWidth={1.5}
            strokeOpacity={1}
            fillOpacity={1}
            opacity={1}
          />
          <XAxis 
            dataKey="name" 
            stroke={isDarkMode ? '#E5E7EB' : '#1E293B'}
            strokeOpacity={1}
            tick={{ 
              fill: isDarkMode ? '#FFFFFF' : '#0F172A',
              fontSize: 18,
              fontWeight: 700,
              opacity: 1
            }}
            strokeWidth={2}
            tickLine={{ stroke: isDarkMode ? '#E5E7EB' : '#1E293B', strokeWidth: 2, strokeOpacity: 1 }}
          />
          <YAxis 
            stroke={isDarkMode ? '#E5E7EB' : '#1E293B'}
            strokeOpacity={1}
            tick={{ 
              fill: isDarkMode ? '#FFFFFF' : '#0F172A',
              fontSize: 16,
              fontWeight: 700,
              opacity: 1
            }}
            strokeWidth={2}
            tickLine={{ stroke: isDarkMode ? '#E5E7EB' : '#1E293B', strokeWidth: 2, strokeOpacity: 1 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#020617',
              border: '2px solid #16A34A',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 700,
              padding: '14px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              opacity: 1
            }}
            labelStyle={{ 
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '18px',
              marginBottom: '8px',
              opacity: 1
            }}
            itemStyle={{ color: '#FFFFFF', opacity: 1 }}
          />
          <Legend 
            wrapperStyle={{ 
              color: isDarkMode ? '#FFFFFF' : '#0F172A',
              fontSize: '16px',
              fontWeight: 700,
              paddingTop: '20px',
              opacity: 1
            }}
            iconType="square"
          />
          <Bar 
            dataKey="Active" 
            fill="#16A34A" 
            radius={[10, 10, 0, 0]}
            stroke="#FFFFFF"
            strokeWidth={3}
            fillOpacity={1}
            strokeOpacity={1}
          />
          <Bar 
            dataKey="Expired" 
            fill="#DC2626" 
            radius={[10, 10, 0, 0]}
            stroke="#FFFFFF"
            strokeWidth={3}
            fillOpacity={1}
            strokeOpacity={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubscriptionBarChart;

