/**
 * ==========================================
 * SUBSCRIPTION PIE CHART COMPONENT
 * ==========================================
 * 
 * PURPOSE: Display subscription plan distribution
 * WHY: Shows which plans are most popular
 * DATA: Subscription plans count from backend
 */

import React, { useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { gsap } from 'gsap';

const SubscriptionPieChart = ({ data, isDarkMode }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      // Ensure chart container is always fully visible
      gsap.set(chartRef.current, { opacity: 1 });
      gsap.from(chartRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        ease: 'back.out(1.2)',
        delay: 0.3,
        onComplete: () => {
          // Force opacity to 1 after animation
          gsap.set(chartRef.current, { opacity: 1 });
        }
      });
    }
  }, []);

  // Convert object to array for chart
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name,
    value
  }));

  // SOLID, HIGH-CONTRAST COLORS - NO FADING, NO OPACITY
  const COLORS = [
    '#2563EB', // Bright Blue
    '#1D4ED8', // Darker Blue
    '#16A34A', // Bright Green
    '#DC2626', // Bright Red
    '#7C3AED', // Bright Purple
    '#F97316', // Bright Orange
    '#EAB308', // Bright Yellow
    '#06B6D4'  // Bright Cyan
  ];

  return (
    <div 
      ref={chartRef}
      className={`p-6 rounded-2xl border-2 ${
        isDarkMode
          ? 'bg-[#020617] border-[#7C3AED] shadow-xl shadow-[#7C3AED]/30'
          : 'bg-white border-[#7C3AED] shadow-xl'
      }`}
      style={{ 
        minHeight: '350px',
        opacity: 1,
        boxShadow: isDarkMode ? '0 20px 50px rgba(124, 58, 237, 0.2), 0 0 30px rgba(124, 58, 237, 0.1)' : undefined
      }}
    >
      <h3 className={`text-2xl font-bold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        🥧 Subscription Plans Distribution
      </h3>
      {chartData && chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350} style={{ opacity: 1 }}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={{ 
                stroke: isDarkMode ? '#E5E7EB' : '#1E293B', 
                strokeWidth: 3,
                strokeOpacity: 1
              }}
              label={({ name, percent }) => {
                const percentage = (percent * 100).toFixed(0);
                return `${name}\n${percentage}%`;
              }}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              stroke={isDarkMode ? '#020617' : '#FFFFFF'}
              strokeWidth={4}
              fillOpacity={1}
              strokeOpacity={1}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke={isDarkMode ? '#020617' : '#FFFFFF'}
                  strokeWidth={4}
                  fillOpacity={1}
                  strokeOpacity={1}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#020617',
                border: '2px solid #7C3AED',
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
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className={`h-[300px] flex items-center justify-center ${
          isDarkMode ? 'text-white' : 'text-gray-700'
        }`}>
          <div className="text-center">
            <p className="text-3xl mb-3">📊</p>
            <p className="text-lg font-bold">No subscription data available</p>
            <p className="text-sm mt-2 opacity-70">Data will appear here once subscriptions are created</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPieChart;

