/**
 * ==========================================
 * REVENUE LINE CHART COMPONENT
 * ==========================================
 * 
 * PURPOSE: Display monthly revenue trends
 * WHY: Admins need to visualize revenue growth over time
 * DATA: Monthly revenue data from backend API
 */

import React, { useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { gsap } from 'gsap';

const RevenueLineChart = ({ data, isDarkMode }) => {
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
        delay: 0.2,
        onComplete: () => {
          // Force opacity to 1 after animation
          gsap.set(chartRef.current, { opacity: 1 });
        }
      });
    }
  }, []);

  // Format month labels
  const formattedData = (data || []).map(item => ({
    ...item,
    monthLabel: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }));

  // If no data, show empty state with placeholder
  if (!data || data.length === 0) {
    return (
      <div 
        ref={chartRef}
        className={`p-6 rounded-2xl border-2 ${
          isDarkMode
            ? 'bg-[#020617] border-[#2563EB] shadow-xl shadow-[#2563EB]/30'
            : 'bg-white border-[#2563EB] shadow-xl'
        }`}
        style={{ 
          minHeight: '350px',
          boxShadow: isDarkMode ? '0 20px 50px rgba(37, 99, 235, 0.2), 0 0 30px rgba(37, 99, 235, 0.1)' : undefined
        }}
      >
        <h3 className={`text-2xl font-bold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          📈 Monthly Revenue Trend
        </h3>
        <div className={`h-[300px] flex items-center justify-center ${
          isDarkMode ? 'text-white' : 'text-gray-700'
        }`}>
          <div className="text-center">
            <p className="text-3xl mb-3">📊</p>
            <p className="text-lg font-bold">No revenue data available yet</p>
            <p className="text-sm mt-2 opacity-70">Data will appear here once payments are recorded</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={chartRef}
      className={`p-6 rounded-2xl border-2 ${
        isDarkMode
          ? 'bg-[#020617] border-[#2563EB] shadow-xl shadow-[#2563EB]/30'
          : 'bg-white border-[#2563EB] shadow-xl'
      }`}
      style={{ 
        minHeight: '350px',
        opacity: 1,
        boxShadow: isDarkMode ? '0 20px 50px rgba(37, 99, 235, 0.2), 0 0 30px rgba(37, 99, 235, 0.1)' : undefined
      }}
    >
      <h3 className={`text-2xl font-bold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        📈 Monthly Revenue Trend
      </h3>
      <ResponsiveContainer width="100%" height={350} style={{ opacity: 1 }}>
        <LineChart data={formattedData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#334155" 
            strokeWidth={1.5}
            strokeOpacity={1}
            fillOpacity={1}
            opacity={1}
          />
          <XAxis 
            dataKey="monthLabel" 
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
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#020617',
              border: '2px solid #2563EB',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 700,
              padding: '14px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              opacity: 1
            }}
            formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
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
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#1D4ED8" 
            strokeWidth={6}
            strokeOpacity={1}
            fillOpacity={1}
            dot={{ 
              fill: '#1D4ED8', 
              r: 8, 
              strokeWidth: 3, 
              stroke: '#FFFFFF',
              fillOpacity: 1,
              strokeOpacity: 1
            }}
            activeDot={{ 
              r: 12, 
              stroke: '#1D4ED8', 
              strokeWidth: 4, 
              fill: '#2563EB',
              fillOpacity: 1,
              strokeOpacity: 1
            }}
            strokeDasharray=""
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueLineChart;

