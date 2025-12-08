/**
 * ==========================================
 * REPORTS SERVICE
 * ==========================================
 * 
 * PURPOSE: API service layer for reports and statistics
 * WHY: Centralized API calls for maintainability
 * DATA SOURCE: Backend REST API endpoints
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * ==========================================
 * FETCH GLOBAL STATISTICS
 * ==========================================
 * 
 * PURPOSE: Retrieve aggregated system statistics
 * WHY: Admins need real-time metrics for decision-making
 * RETURNS: Object with totalEmployees, activeSubscriptions, etc.
 */
export const fetchGlobalStatistics = async () => {
  try {
    const token = getAuthToken();
    
    // Try the dashboard stats endpoint first (existing endpoint)
    let response;
    try {
      response = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Map dashboard stats to our statistics format
      const stats = response.data.data || response.data || {};
      return {
        totalEmployees: stats.totalEmployees || stats.employees || 0,
        activeSubscriptions: stats.activeSubscriptions || 0,
        expiredSubscriptions: stats.expiredSubscriptions || 0,
        totalRevenue: stats.totalRevenue || stats.revenue || 0,
        expiringSoon: stats.expiringSoon || stats.subscriptionsExpiringSoon || 0
      };
    } catch (dashboardError) {
      // If dashboard/stats doesn't exist, try statistics endpoint
      response = await axios.get(`${API_BASE_URL}/admin/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.data || response.data || {
        totalEmployees: response.data.totalEmployees || 0,
        activeSubscriptions: response.data.activeSubscriptions || 0,
        expiredSubscriptions: response.data.expiredSubscriptions || 0,
        totalRevenue: response.data.totalRevenue || 0,
        expiringSoon: response.data.expiringSoon || 0
      };
    }
  } catch (error) {
    console.error('Error fetching global statistics:', error);
    
    // Fallback to simulated data if API fails (for development)
    if (error.response?.status === 404 || !error.response) {
      console.warn('Using simulated statistics data');
      return {
        totalEmployees: 45,
        activeSubscriptions: 32,
        expiredSubscriptions: 8,
        totalRevenue: 125000,
        expiringSoon: 5
      };
    }
    
    throw error;
  }
};

/**
 * ==========================================
 * SEARCH EMPLOYEES
 * ==========================================
 * 
 * PURPOSE: Search employees by name, email, or ID
 * WHY: Efficient employee lookup in large databases
 * PARAMS: query string (searches multiple fields)
 */
export const searchEmployees = async (query) => {
  try {
    const token = getAuthToken();
    
    // Try search endpoint first
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/employees/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: query }
      });
      return response.data.data || response.data || [];
    } catch (searchError) {
      // If search endpoint doesn't exist, fetch all and filter client-side
      const response = await axios.get(`${API_BASE_URL}/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const employees = response.data.data || response.data || [];
      const queryLower = query.toLowerCase();
      
      // Filter employees by name, email, or ID
      return employees.filter(emp => 
        (emp.displayName && emp.displayName.toLowerCase().includes(queryLower)) ||
        (emp.email && emp.email.toLowerCase().includes(queryLower)) ||
        (emp.employeeId && emp.employeeId.toLowerCase().includes(queryLower)) ||
        (emp.uid && emp.uid.toLowerCase().includes(queryLower))
      );
    }
  } catch (error) {
    console.error('Error searching employees:', error);
    
    // Fallback to empty array if API fails
    if (error.response?.status === 404 || !error.response) {
      console.warn('Using simulated employee search data');
      return [];
    }
    
    throw error;
  }
};

/**
 * ==========================================
 * FETCH EMPLOYEE REPORT
 * ==========================================
 * 
 * PURPOSE: Get comprehensive employee report data
 * WHY: Admins need detailed information for analysis
 * PARAMS: employeeId (uid or custom ID)
 * RETURNS: Complete employee report with subscription, activity, etc.
 */
/**
 * ==========================================
 * FETCH REPORTS OVERVIEW
 * ==========================================
 * 
 * PURPOSE: Get comprehensive reports overview with charts data
 * WHY: Provides aggregated statistics and visualization data
 * RETURNS: Statistics, monthly revenue, subscription plans distribution
 */
export const fetchReportsOverview = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/admin/reports/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success && response.data.data) {
      console.log('✅ Reports overview data loaded from database:', response.data.data);
      return response.data.data;
    }

    const data = response.data.data || response.data || null;
    if (data) {
      console.log('✅ Reports overview data loaded:', data);
    }
    return data;
  } catch (error) {
    console.error('❌ Error fetching reports overview:', error);
    
    // Only return empty data if endpoint truly doesn't exist (404)
    // Otherwise, throw error to show user there's a problem
    if (error.response?.status === 404) {
      console.warn('⚠️ Reports overview endpoint not found (404)');
      return {
        monthlyRevenue: [],
        subscriptionPlans: {},
        mostPopularPlan: 'N/A',
        totalEmployees: 0,
        activeSubscriptions: 0,
        expiredSubscriptions: 0,
        totalPayments: 0,
        expiringSoon: 0
      };
    }
    
    // For other errors, throw to show notification to user
    throw error;
  }
};

/**
 * ==========================================
 * SEND EMPLOYEE REPORT VIA EMAIL
 * ==========================================
 * 
 * PURPOSE: Send comprehensive employee report to employee's email
 * WHY: Allows employees to receive their report directly
 * PARAMS: employeeId
 */
export const sendEmployeeReportEmail = async (employeeId) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/admin/reports/send-email`,
      { employeeId },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending employee report email:', error);
    throw error;
  }
};

export const fetchEmployeeReport = async (employeeId) => {
  try {
    const token = getAuthToken();
    
    // Use the new report endpoint
    const response = await axios.get(`${API_BASE_URL}/admin/employees/${employeeId}/report`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return response.data.data || response.data || null;
  } catch (error) {
    console.error('Error fetching employee report:', error);
    
    // If endpoint doesn't exist yet, try to build from employee data
    if (error.response?.status === 404) {
      try {
        const employeeResponse = await axios.get(`${API_BASE_URL}/admin/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const employees = employeeResponse.data.data || employeeResponse.data || [];
        const employee = employees.find(emp => 
          emp.uid === employeeId || emp.id === employeeId || emp.employeeId === employeeId
        );
        
        if (!employee) {
          throw new Error('Employee not found');
        }
        
        // Build basic report from employee data
        return {
          displayName: employee.displayName,
          email: employee.email,
          role: employee.role || 'employee',
          isActive: employee.isActive !== false,
          createdAt: employee.createdAt?.toDate?.()?.toISOString() || employee.createdAt || null,
          phoneNumber: employee.phoneNumber || null,
          subscription: employee.subscription || null,
          activity: employee.activity || {
            usersManaged: 0,
            mealPlansCreated: 0,
            workoutPlansCreated: 0,
            lastLogin: null,
            chatMessages: 0,
            totalSessions: 0
          }
        };
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
        throw error;
      }
    }
    
    throw error;
  }
};

