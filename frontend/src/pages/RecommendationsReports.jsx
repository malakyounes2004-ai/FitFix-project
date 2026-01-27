/**
 * ==========================================
 * ADMIN DASHBOARD: RECOMMENDATIONS & REPORTS
 * ==========================================
 * 
 * PURPOSE:
 * This page provides administrators with comprehensive analytics and reporting
 * capabilities to make data-driven decisions about the FitFix platform.
 * 
 * WHY THIS PAGE EXISTS:
 * - Enables admins to monitor system health through global statistics
 * - Allows quick employee lookup and detailed reporting
 * - Generates actionable recommendations based on data patterns
 * - Supports decision-making through exportable reports
 * 
 * ARCHITECTURE:
 * - Modular component structure for maintainability
 * - API-based data fetching for real-time updates
 * - GSAP animations for professional presentation
 * - Print/PDF export functionality for documentation
 * 
 * UNIVERSITY PRESENTATION NOTES:
 * This page demonstrates:
 * 1. Advanced React patterns (hooks, context, composition)
 * 2. Real-time data integration with backend APIs
 * 3. Professional UI/UX with animations
 * 4. Business intelligence and analytics implementation
 * 5. Export functionality for administrative workflows
 */

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import AdminSidebar from '../components/AdminSidebar';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import StatisticCard from '../components/reports/StatisticCard';
import EmployeeSearch from '../components/reports/EmployeeSearch';
import EmployeeReport from '../components/reports/EmployeeReport';
import Recommendations from '../components/reports/Recommendations';
import RevenueLineChart from '../components/reports/RevenueLineChart';
import SubscriptionPieChart from '../components/reports/SubscriptionPieChart';
import SubscriptionBarChart from '../components/reports/SubscriptionBarChart';
import { fetchGlobalStatistics, fetchEmployeeReport, fetchReportsOverview, sendEmployeeReportEmail } from '../services/reportsService';
import { FiBarChart2, FiFileText, FiPrinter, FiDownload, FiMail } from 'react-icons/fi';

const RecommendationsReports = () => {
  const { isDarkMode } = useTheme();
  const { showNotification } = useNotification();
  
  // State management for global statistics
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    totalRevenue: 0,
    expiringSoon: 0,
    mostPopularPlan: 'N/A'
  });
  
  // State for reports overview (charts data)
  const [reportsOverview, setReportsOverview] = useState({
    monthlyRevenue: [],
    subscriptionPlans: {},
    mostPopularPlan: 'N/A'
  });
  
  // State for employee search and report
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeReport, setEmployeeReport] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Refs for GSAP animations
  const pageRef = useRef(null);
  const statsSectionRef = useRef(null);
  const searchSectionRef = useRef(null);
  const reportSectionRef = useRef(null);
  const recommendationsRef = useRef(null);

  /**
   * ==========================================
   * DATA FETCHING: GLOBAL STATISTICS
   * ==========================================
   * 
   * WHY: Admins need real-time system metrics to understand
   * platform health, subscription status, and revenue trends.
   * 
   * HOW: Fetches aggregated data from backend API endpoints
   * and updates automatically when data changes.
   */
  useEffect(() => {
    loadGlobalStatistics();
    loadReportsOverview();
    
    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadGlobalStatistics();
      loadReportsOverview();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadGlobalStatistics = async () => {
    try {
      setIsLoadingStats(true);
      const data = await fetchGlobalStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to load global statistics:', error);
      showNotification({
        type: 'error',
        message: 'Failed to load statistics. Please try again.'
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  /**
   * ==========================================
   * LOAD REPORTS OVERVIEW (CHARTS DATA)
   * ==========================================
   * 
   * WHY: Provides data for visualization charts
   * HOW: Fetches monthly revenue and subscription distribution
   */
  const loadReportsOverview = async () => {
    try {
      setIsLoadingOverview(true);
      const data = await fetchReportsOverview();
      console.log('Reports overview data:', data);
      setReportsOverview({
        monthlyRevenue: data?.monthlyRevenue || [],
        subscriptionPlans: data?.subscriptionPlans || {},
        mostPopularPlan: data?.mostPopularPlan || 'N/A'
      });
      // Update statistics with most popular plan
      setStatistics(prev => ({
        ...prev,
        mostPopularPlan: data?.mostPopularPlan || 'N/A'
      }));
    } catch (error) {
      console.error('Failed to load reports overview:', error);
      // Set empty data on error
      setReportsOverview({
        monthlyRevenue: [],
        subscriptionPlans: {},
        mostPopularPlan: 'N/A'
      });
    } finally {
      setIsLoadingOverview(false);
    }
  };

  /**
   * ==========================================
   * GSAP ANIMATIONS: PAGE ENTRANCE
   * ==========================================
   * 
   * WHY: Professional animations enhance user experience
   * and make the dashboard feel responsive and modern.
   * 
   * HOW: GSAP timeline animates sections sequentially
   * with fade and scale effects for visual appeal.
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Page entrance animation
      gsap.from(pageRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      });

      // Statistics cards stagger animation
      gsap.from(statsSectionRef.current?.children || [], {
        opacity: 0,
        y: 30,
        scale: 0.9,
        stagger: 0.1,
        duration: 0.6,
        ease: 'back.out(1.2)',
        delay: 0.2
      });

      // Search section fade in
      gsap.from(searchSectionRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.4
      });

    }, pageRef);

    return () => ctx.revert();
  }, []);

  /**
   * ==========================================
   * EMPLOYEE SELECTION HANDLER
   * ==========================================
   * 
   * WHY: When admin selects an employee, we need to fetch
   * their complete report data for detailed analysis.
   * 
   * HOW: Triggers API call to get comprehensive employee
   * information including subscription, activity, and usage data.
   */
  const handleEmployeeSelect = async (employee) => {
    if (!employee) {
      setSelectedEmployee(null);
      setEmployeeReport(null);
      return;
    }

    setSelectedEmployee(employee);
    setIsLoadingReport(true);

    try {
      const report = await fetchEmployeeReport(employee.id || employee.uid);
      setEmployeeReport(report);
      
      // Animate report section entrance
      gsap.from(reportSectionRef.current, {
        opacity: 0,
        y: 30,
        scale: 0.95,
        duration: 0.6,
        ease: 'back.out(1.2)'
      });
    } catch (error) {
      console.error('Failed to load employee report:', error);
      showNotification({
        type: 'error',
        message: 'Failed to load employee report. Please try again.'
      });
    } finally {
      setIsLoadingReport(false);
    }
  };

  /**
   * ==========================================
   * PRINT FUNCTIONALITY
   * ==========================================
   * 
   * WHY: Admins need to print reports for meetings,
   * documentation, or offline review.
   * 
   * HOW: Uses browser's native print dialog with
   * print-specific CSS to hide non-essential elements.
   */
  const handlePrint = () => {
    // Hide sidebar and non-essential elements for print
    const sidebar = document.querySelector('aside');
    const printButton = document.getElementById('print-button');
    const exportButton = document.getElementById('export-button');
    const emailButton = document.getElementById('email-button');
    
    if (sidebar) sidebar.style.display = 'none';
    if (printButton) printButton.style.display = 'none';
    if (exportButton) exportButton.style.display = 'none';
    if (emailButton) emailButton.style.display = 'none';
    
    window.print();
    
    // Restore elements after printing
    setTimeout(() => {
      if (sidebar) sidebar.style.display = '';
      if (printButton) printButton.style.display = '';
      if (exportButton) exportButton.style.display = '';
      if (emailButton) emailButton.style.display = '';
    }, 1000);
  };

  /**
   * ==========================================
   * PDF EXPORT FUNCTIONALITY
   * ==========================================
   * 
   * WHY: PDF export allows admins to save reports
   * for records, email distribution, or archival.
   * 
   * HOW: Uses browser's print-to-PDF functionality
   * as a simple export mechanism (can be enhanced
   * with libraries like jsPDF for more control).
   */
  const handleExportPDF = () => {
    // For now, use print-to-PDF
    // In production, could use jsPDF or html2pdf libraries
    handlePrint();
    showNotification({
      type: 'success',
      message: 'Use "Save as PDF" in the print dialog to export.'
    });
  };

  /**
   * ==========================================
   * SEND REPORT VIA EMAIL
   * ==========================================
   * 
   * WHY: Allows admins to send comprehensive reports
   * directly to employees via email for transparency.
   * 
   * HOW: Calls backend API which uses Nodemailer to
   * send formatted HTML email with full report data.
   */
  const handleSendEmail = async () => {
    if (!selectedEmployee || !employeeReport) {
      showNotification({
        type: 'error',
        message: 'Please select an employee first.'
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      const employeeId = selectedEmployee.uid || selectedEmployee.id || selectedEmployee.employeeId;
      const result = await sendEmployeeReportEmail(employeeId);
      
      if (result.success) {
        showNotification({
          type: 'success',
          message: `Report sent successfully to ${selectedEmployee.email || employeeReport.email}`
        });
      } else {
        throw new Error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to send report email. Please try again.'
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div 
      ref={pageRef}
      className={`min-h-screen flex transition-colors ${
        isDarkMode 
          ? 'bg-[#05050c] text-white' 
          : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FiBarChart2 className="text-[#1f36ff]" />
                Recommendations & Reports
              </h1>
              <p className={`text-sm ${
                isDarkMode ? 'text-white/60' : 'text-gray-600'
              }`}>
                Comprehensive analytics and reporting dashboard for administrative decision-making
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
            SECTION 1: GLOBAL STATISTICS
            ==========================================
            
            PURPOSE: Display key system metrics at a glance
            WHY: Admins need immediate visibility into platform health
            DATA SOURCE: Backend API aggregates data from multiple collections
        */}
        <section ref={statsSectionRef} className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Global Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatisticCard
              title="Total Employees"
              value={statistics.totalEmployees}
              icon="👥"
              color="blue"
              isLoading={isLoadingStats}
            />
            <StatisticCard
              title="Active Subscriptions"
              value={statistics.activeSubscriptions}
              icon="✅"
              color="green"
              isLoading={isLoadingStats}
            />
            <StatisticCard
              title="Total Payments"
              value={`$${Number(statistics.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              icon="💰"
              color="purple"
              isLoading={isLoadingStats}
            />
            <StatisticCard
              title="Expired Subscriptions"
              value={statistics.expiredSubscriptions}
              icon="❌"
              color="red"
              isLoading={isLoadingStats}
            />
            <StatisticCard
              title="Expiring Soon (≤7 days)"
              value={statistics.expiringSoon}
              icon="⚠️"
              color="orange"
              isLoading={isLoadingStats}
            />
            <StatisticCard
              title="Most Popular Plan"
              value={statistics.mostPopularPlan}
              icon="⭐"
              color="purple"
              isLoading={isLoadingStats}
            />
          </div>
        </section>

        {/* ==========================================
            CHARTS SECTION
            ==========================================
            
            PURPOSE: Visualize data trends and distributions
            WHY: Charts help admins understand patterns at a glance
            DATA SOURCE: Reports overview API endpoint
        */}
        <section className="mb-8" style={{ minHeight: '400px' }}>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Analytics & Visualizations
          </h2>
          {isLoadingOverview ? (
            <div className={`p-8 rounded-2xl border ${
              isDarkMode
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f36ff] mx-auto mb-3"></div>
                  <span className={`block ${
                    isDarkMode ? 'text-white/60' : 'text-gray-600'
                  }`}>
                    Loading charts data...
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <RevenueLineChart 
                  data={reportsOverview?.monthlyRevenue || []} 
                  isDarkMode={isDarkMode}
                />
                <SubscriptionPieChart 
                  data={reportsOverview?.subscriptionPlans || {}} 
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="mt-6">
                <SubscriptionBarChart 
                  activeCount={statistics.activeSubscriptions || 0}
                  expiredCount={statistics.expiredSubscriptions || 0}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          )}
        </section>

        {/* ==========================================
            SECTION 2: EMPLOYEE SEARCH
            ==========================================
            
            PURPOSE: Enable admins to find specific employees quickly
            WHY: Large employee bases require efficient search functionality
            FEATURES: Debounced search, autocomplete, multiple search criteria
        */}
        <section ref={searchSectionRef} className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Employee Search
          </h2>
          <EmployeeSearch
            onEmployeeSelect={handleEmployeeSelect}
            isDarkMode={isDarkMode}
          />
          
          {/* Action Buttons - Print, Export PDF, Send Email */}
          {selectedEmployee && (
            <div className="flex justify-start gap-4 mt-6 print:hidden">
              <button
                id="print-button"
                onClick={handlePrint}
                disabled={!employeeReport || isLoadingReport}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  !employeeReport || isLoadingReport
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                } ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                }`}
              >
                <FiPrinter />
                {isLoadingReport ? 'Loading...' : 'Print'}
              </button>
              <button
                id="export-button"
                onClick={handleExportPDF}
                disabled={!employeeReport || isLoadingReport}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  !employeeReport || isLoadingReport
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                } ${
                  isDarkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                }`}
              >
                <FiDownload />
                {isLoadingReport ? 'Loading...' : 'Export PDF'}
              </button>
              <button
                id="email-button"
                onClick={handleSendEmail}
                disabled={!employeeReport || isLoadingReport || isSendingEmail}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  !employeeReport || isLoadingReport || isSendingEmail
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                } ${
                  isDarkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                }`}
              >
                <FiMail />
                {isSendingEmail ? 'Sending...' : isLoadingReport ? 'Loading...' : 'Send Email'}
              </button>
            </div>
          )}
        </section>

        {/* ==========================================
            SECTION 3: EMPLOYEE FULL REPORT
            ==========================================
            
            PURPOSE: Display comprehensive employee information
            WHY: Admins need detailed data for decision-making and support
            DATA INCLUDES: Account info, subscription details, activity metrics
        */}
        {selectedEmployee && (
          <section ref={reportSectionRef} className="mb-8">
            <h2 className={`text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Employee Report
            </h2>
            <EmployeeReport
              employee={selectedEmployee}
              report={employeeReport}
              isLoading={isLoadingReport}
              isDarkMode={isDarkMode}
            />
          </section>
        )}

        {/* ==========================================
            SECTION 4: RECOMMENDATIONS
            ==========================================
            
            PURPOSE: Provide actionable insights based on data analysis
            WHY: Helps admins make proactive decisions and identify issues
            LOGIC: Rule-based recommendations from employee and system data
        */}
        {employeeReport && (
          <section ref={recommendationsRef} className="mb-8">
            <h2 className={`text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Recommendations
            </h2>
            <Recommendations
              employee={selectedEmployee}
              report={employeeReport}
              statistics={statistics}
              isDarkMode={isDarkMode}
            />
          </section>
        )}
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          aside, button, .no-print, #print-button, #export-button, #email-button {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationsReports;

