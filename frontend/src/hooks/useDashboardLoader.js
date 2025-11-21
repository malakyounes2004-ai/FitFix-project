import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseClient';
import axios from 'axios';

/**
 * Unified Dashboard Loader Hook
 * 
 * Provides instant loading with:
 * 1. localStorage cache for immediate display
 * 2. Firestore realtime listeners for live updates
 * 3. API fallback if Firestore unavailable
 * 
 * @param {string} type - 'admin' or 'employee'
 * @param {string} userId - Optional user ID for employee dashboard
 */
export const useDashboardLoader = (type = 'admin', userId = null) => {
  const [data, setData] = useState(() => {
    // Load cached data immediately from localStorage
    const cacheKey = type === 'admin' ? 'adminDashboardCache' : `employeeDashboardCache_${userId || ''}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          loading: false, // Never show loading for cached data
          fromCache: true
        };
      } catch (e) {
        console.warn('Failed to parse cached dashboard data:', e);
      }
    }
    
    // Return empty state with default values
    if (type === 'admin') {
      return {
        stats: {
          totalEmployees: 0,
          totalPayments: 0,
          totalPaymentAmount: 0,
          loading: false
        },
        weeklyStats: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
        employeeActivity: { active: 0, inactive: 0 },
        pendingNotifications: 0,
        pendingRequests: [],
        employees: [],
        users: [],
        userPayments: [],
        employeePayments: [],
        loading: false,
        fromCache: false
      };
    } else {
      return {
        assignedUsers: [],
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          totalProgressEntries: 0,
          loading: false
        },
        weeklyStats: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
        userActivity: { active: 0, inactive: 0 },
        loading: false,
        fromCache: false
      };
    }
  });

  const unsubscribesRef = useRef([]);
  const isMountedRef = useRef(true);

  // Save to cache helper
  const saveToCache = (newData) => {
    const cacheKey = type === 'admin' ? 'adminDashboardCache' : `employeeDashboardCache_${userId || ''}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        ...newData,
        fromCache: undefined,
        loading: undefined,
        cachedAt: Date.now()
      }));
    } catch (e) {
      console.warn('Failed to save to cache:', e);
    }
  };

  // Calculate stats helper
  const calculateStats = (rawData, type) => {
    if (type === 'admin') {
      const { employees = [], userPayments = [], employeePayments = [], users = [], employeeRequests = [] } = rawData;
      
      const totalEmployees = employees.length;
      const activeEmployees = employees.filter(emp => emp.isActive === true).length;
      const inactiveEmployees = employees.filter(emp => emp.isActive === false).length;
      
      const totalPayments = userPayments.length + employeePayments.length;
      const userPaymentAmount = userPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const employeePaymentAmount = employeePayments
        .filter(p => p.paid === true)
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalPaymentAmount = userPaymentAmount + employeePaymentAmount;
      
      const pendingEmployeeRequests = employeeRequests.filter(r => r.status === 'pending');
      const oldPendingRegistrations = employeePayments.filter(p => !p.accountCreated).length;
      const newPendingRequests = pendingEmployeeRequests.length;
      const totalPending = oldPendingRegistrations + newPendingRequests;
      
      // Calculate weekly stats
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekData = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      users.forEach(user => {
        if (user.createdAt) {
          const createdDate = user.createdAt.seconds 
            ? new Date(user.createdAt.seconds * 1000) 
            : new Date(user.createdAt);
          if (createdDate >= weekStart && createdDate <= today) {
            const dayIndex = createdDate.getDay();
            const dayName = dayNames[dayIndex];
            weekData[dayName]++;
          }
        }
      });
      
      return {
        stats: {
          totalEmployees,
          totalPayments,
          totalPaymentAmount,
          loading: false
        },
        weeklyStats: weekData,
        employeeActivity: {
          active: activeEmployees,
          inactive: inactiveEmployees
        },
        pendingNotifications: totalPending,
        pendingRequests: pendingEmployeeRequests.slice(0, 5),
        employees,
        users,
        userPayments,
        employeePayments,
        employeeRequests
      };
    } else {
      const { assignedUsers = [] } = rawData;
      
      const activeUsers = assignedUsers.filter(u => u.isActive !== false).length;
      const inactiveUsers = assignedUsers.filter(u => u.isActive === false).length;
      
      // Calculate weekly stats
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekData = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      assignedUsers.forEach(user => {
        if (user.createdAt) {
          const createdDate = user.createdAt.seconds 
            ? new Date(user.createdAt.seconds * 1000) 
            : new Date(user.createdAt);
          if (createdDate >= weekStart && createdDate <= today) {
            const dayIndex = createdDate.getDay();
            const dayName = dayNames[dayIndex];
            weekData[dayName]++;
          }
        }
      });
      
      // Count progress entries (simplified - can be enhanced with realtime listener)
      const totalProgressEntries = assignedUsers.reduce((sum, user) => {
        return sum + (user.progressEntriesCount || 0);
      }, 0);
      
      return {
        assignedUsers,
        stats: {
          totalUsers: assignedUsers.length,
          activeUsers,
          totalProgressEntries,
          loading: false
        },
        weeklyStats: weekData,
        userActivity: {
          active: activeUsers,
          inactive: inactiveUsers
        }
      };
    }
  };

  // Load data via API (fallback)
  const loadViaAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (type === 'admin') {
        const [employeesRes, paymentsRes, employeePaymentsRes, employeeRequestsRes, usersRes] = await Promise.all([
          axios.get('http://localhost:3000/api/admin/employees', config),
          axios.get('http://localhost:3000/api/payments/all', config),
          axios.get('http://localhost:3000/api/employee-payments/all', config),
          axios.get('http://localhost:3000/api/employee-requests', config),
          axios.get('http://localhost:3000/api/admin/users', config)
        ]);

        const rawData = {
          employees: employeesRes.data.data || [],
          userPayments: paymentsRes.data.data || [],
          employeePayments: employeePaymentsRes.data.data || [],
          employeeRequests: employeeRequestsRes.data.data || [],
          users: usersRes.data.data || []
        };

        const calculated = calculateStats(rawData, 'admin');
        if (isMountedRef.current) {
          setData({ ...calculated, loading: false, fromCache: false });
          saveToCache(calculated);
        }
      } else {
        const usersRes = await axios.get('http://localhost:3000/api/employee/users', config);
        if (usersRes.data.success) {
          const assignedUsers = usersRes.data.data || [];
          
          // Fetch progress counts for each user
          const usersWithProgress = await Promise.all(
            assignedUsers.map(async (user) => {
              try {
                const progressRes = await axios.get(
                  `http://localhost:3000/api/employee/users/${user.uid}/progress`,
                  config
                );
                return {
                  ...user,
                  progressEntriesCount: progressRes.data.success ? (progressRes.data.data?.length || 0) : 0
                };
              } catch {
                return { ...user, progressEntriesCount: 0 };
              }
            })
          );

          const rawData = { assignedUsers: usersWithProgress };
          const calculated = calculateStats(rawData, 'employee');
          if (isMountedRef.current) {
            setData({ ...calculated, loading: false, fromCache: false });
            saveToCache(calculated);
          }
        }
      }
    } catch (error) {
      console.error('API fallback error:', error);
      // Don't update state on error, keep cached data
    }
  };

  // Setup Firestore realtime listeners
  const setupFirestoreListeners = () => {
    if (!db) {
      // Fallback to API if Firestore not available
      loadViaAPI();
      return;
    }

    try {
      // Clear previous listeners
      unsubscribesRef.current.forEach(unsub => unsub());
      unsubscribesRef.current = [];

      if (type === 'admin') {
        // Listen to employees
        const employeesQuery = query(collection(db, 'users'), where('role', '==', 'employee'));
        const unsubEmployees = onSnapshot(employeesQuery, (snapshot) => {
          const employees = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
          
          // Get other data via API (payments, etc.)
          loadViaAPI().then(() => {
            // Update employees in the result
            setData(prev => {
              const updated = {
                ...prev,
                employees,
                loading: false,
                fromCache: false
              };
              const calculated = calculateStats({
                ...updated,
                userPayments: prev.userPayments || [],
                employeePayments: prev.employeePayments || [],
                employeeRequests: prev.employeeRequests || [],
                users: prev.users || []
              }, 'admin');
              saveToCache(calculated);
              return calculated;
            });
          });
        });
        unsubscribesRef.current.push(unsubEmployees);

        // Listen to users
        const usersQuery = query(collection(db, 'users'), where('role', '==', 'user'));
        const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
          const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
          setData(prev => {
            const updated = { ...prev, users };
            const calculated = calculateStats({
              ...updated,
              employees: prev.employees || [],
              userPayments: prev.userPayments || [],
              employeePayments: prev.employeePayments || [],
              employeeRequests: prev.employeeRequests || []
            }, 'admin');
            saveToCache(calculated);
            return calculated;
          });
        });
        unsubscribesRef.current.push(unsubUsers);

        // Load payments via API (they might not be in Firestore)
        loadViaAPI();
      } else {
        // Employee dashboard - listen to assigned users
        if (userId) {
          const usersQuery = query(
            collection(db, 'users'),
            where('role', '==', 'user'),
            where('assignedEmployeeId', '==', userId)
          );
          const unsubUsers = onSnapshot(usersQuery, async (snapshot) => {
            const assignedUsers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
            
            // Fetch progress counts via API
            const token = localStorage.getItem('token');
            if (token) {
              const config = { headers: { Authorization: `Bearer ${token}` } };
              const usersWithProgress = await Promise.all(
                assignedUsers.map(async (user) => {
                  try {
                    const progressRes = await axios.get(
                      `http://localhost:3000/api/employee/users/${user.uid}/progress`,
                      config
                    );
                    return {
                      ...user,
                      progressEntriesCount: progressRes.data.success ? (progressRes.data.data?.length || 0) : 0
                    };
                  } catch {
                    return { ...user, progressEntriesCount: 0 };
                  }
                })
              );

              const rawData = { assignedUsers: usersWithProgress };
              const calculated = calculateStats(rawData, 'employee');
              if (isMountedRef.current) {
                setData({ ...calculated, loading: false, fromCache: false });
                saveToCache(calculated);
              }
            }
          });
          unsubscribesRef.current.push(unsubUsers);
        }
      }
    } catch (error) {
      console.error('Firestore listener error:', error);
      // Fallback to API
      loadViaAPI();
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    // Setup listeners immediately
    setupFirestoreListeners();

    return () => {
      isMountedRef.current = false;
      // Cleanup all listeners
      unsubscribesRef.current.forEach(unsub => unsub());
      unsubscribesRef.current = [];
    };
  }, [type, userId]);

  return {
    ...data,
    refresh: () => {
      // Force refresh by clearing cache and reloading
      const cacheKey = type === 'admin' ? 'adminDashboardCache' : `employeeDashboardCache_${userId || ''}`;
      localStorage.removeItem(cacheKey);
      setupFirestoreListeners();
    }
  };
};

