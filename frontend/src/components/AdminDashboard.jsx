/**
 * ==========================================
 * ADMIN WELCOME DASHBOARD
 * ==========================================
 * 
 * PURPOSE: Main admin dashboard with 3D MacBook hero visual
 * WHY: Provides comprehensive admin overview with engaging visuals
 * ARCHITECTURE: Modular sections with GSAP animations
 * 
 * STRUCTURE:
 * 1. Hero Section - 3D Animated MacBook Air component
 * 2. Welcome Admin Section - Admin info, last login, system status
 * 3. KPI Cards - Key performance indicators (6 cards)
 * 4. Quick Admin Actions - Action buttons for common tasks
 * 5. System Activity Timeline - Recent system events feed
 * 6. Smart Admin Insight Card - AI-style recommendations
 * 
 * TECHNOLOGIES:
 * - React with GSAP animations
 * - Tailwind CSS for styling
 * - shadcn/ui Card components
 * - Lucide React icons
 * - Responsive design
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import AdminSidebar from './AdminSidebar';
import { useTheme } from '../context/ThemeContext';
import { Macbook } from './ui/animated-3d-mac-book-air';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  CheckCircle2,
  Clock,
  Shield,
  Zap
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [adminData, setAdminData] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);
  
  // Refs for GSAP animations
  const welcomeRef = useRef(null);
  const welcomeTextRef = useRef(null);
  const welcomeQuoteRef = useRef(null);

  // Handle authentication and load admin data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Load admin data from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setAdminData(user);
    
    // Get last login from user data
    if (user.lastLogin) {
      try {
        const loginDate = user.lastLogin?.toDate ? user.lastLogin.toDate() : new Date(user.lastLogin);
        setLastLogin(loginDate);
      } catch {
        setLastLogin(new Date(user.lastLogin));
      }
    }
  }, [navigate]);

  // GSAP animations on mount
  useEffect(() => {
    if (welcomeTextRef.current && welcomeQuoteRef.current) {
      // Set initial state
      gsap.set([welcomeTextRef.current, welcomeQuoteRef.current], {
        opacity: 0,
        y: 20
      });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      // Welcome text animation
      tl.to(welcomeTextRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8
      }, 0.2);
      
      // Quote animation with delay
      tl.to(welcomeQuoteRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, 0.5);
    }
  }, [adminData]);


  return (
    <div className={`min-h-screen flex transition-colors ${
      isDarkMode 
        ? 'bg-[#05050c] text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* ==========================================
            HERO SECTION - 3D MacBook Animation
            ========================================== */}
        <section className="relative h-[300px] mb-12 rounded-2xl overflow-hidden">
          <div className={`absolute inset-0 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]' 
              : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
          }`}>
            {/* MacBook component - centered */}
            <div className="relative w-full h-full">
              <Macbook />
            </div>
          </div>
        </section>

        {/* ==========================================
            WELCOME SECTION
            ========================================== */}
        <section ref={welcomeRef} className="mb-8 px-4">
          <div className="text-center md:text-left">
            <h1
              ref={welcomeTextRef}
              className={`text-4xl md:text-5xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
              style={{ opacity: 0 }}
            >
              Welcome back, {adminData?.displayName || adminData?.email || 'Administrator'}
            </h1>
            <p
              ref={welcomeQuoteRef}
              className={`text-lg md:text-xl ${
                isDarkMode ? 'text-white/70' : 'text-gray-600'
              }`}
              style={{ opacity: 0 }}
            >
              Manage employees, monitor growth, and control your entire platform from one place.
            </p>
          </div>
        </section>

        
      </main>
    </div>
  );
};


export default AdminDashboard;
