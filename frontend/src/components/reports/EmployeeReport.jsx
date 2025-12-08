/**
 * ==========================================
 * EMPLOYEE REPORT COMPONENT
 * ==========================================
 * 
 * PURPOSE: Display comprehensive employee information
 * WHY: Admins need detailed data for decision-making
 * SECTIONS: Account info, subscription, activity metrics
 */

import React from 'react';
import { 
  FiUser, FiMail, FiBriefcase, FiCheckCircle, FiXCircle, 
  FiCalendar, FiClock, FiDollarSign, FiActivity, FiUsers, 
  FiFileText, FiMessageCircle, FiTrendingUp, FiHash
} from 'react-icons/fi';

const EmployeeReport = ({ employee, report, isLoading, isDarkMode }) => {
  if (isLoading) {
    return (
      <div className={`p-8 rounded-2xl border ${
        isDarkMode
          ? 'bg-white/5 border-white/10'
          : 'bg-white border-gray-200'
      }`}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-300/20 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={`p-8 rounded-2xl border text-center ${
        isDarkMode
          ? 'bg-white/5 border-white/10 text-white/60'
          : 'bg-white border-gray-200 text-gray-500'
      }`}>
        No report data available for this employee.
      </div>
    );
  }

  // Calculate days remaining for subscription
  const getDaysRemaining = (expirationDate) => {
    if (!expirationDate) return null;
    const exp = new Date(expirationDate);
    const now = new Date();
    const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = report.subscription?.expirationDate 
    ? getDaysRemaining(report.subscription.expirationDate)
    : null;

  const InfoSection = ({ title, icon, children }) => (
    <div className={`p-6 rounded-xl border ${
      isDarkMode
        ? 'bg-white/5 border-white/10'
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className={`font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  const InfoRow = ({ label, value, icon }) => (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        {icon && <span className={isDarkMode ? 'text-white/40' : 'text-gray-400'}>{icon}</span>}
        <span className={`text-sm ${
          isDarkMode ? 'text-white/60' : 'text-gray-600'
        }`}>
          {label}
        </span>
      </div>
      <span className={`font-medium ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        {value}
      </span>
    </div>
  );

  return (
    <div className={`p-8 rounded-2xl border ${
      isDarkMode
        ? 'bg-white/5 border-white/10'
        : 'bg-white border-gray-200'
    }`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Information */}
        <InfoSection
          title="Employee Information"
          icon={<FiUser className={isDarkMode ? 'text-white/60' : 'text-gray-600'} />}
        >
          <InfoRow
            label="Full Name"
            value={employee.displayName || report.displayName || 'N/A'}
            icon={<FiUser />}
          />
          <InfoRow
            label="Email"
            value={employee.email || report.email || 'N/A'}
            icon={<FiMail />}
          />
          <InfoRow
            label="Role"
            value={employee.role || report.role || 'Employee'}
            icon={<FiBriefcase />}
          />
          <InfoRow
            label="Account Status"
            value={
              <span className={`flex items-center gap-2 ${
                (employee.isActive !== false && report.isActive !== false)
                  ? 'text-green-500' : 'text-red-500'
              }`}>
                {(employee.isActive !== false && report.isActive !== false) ? (
                  <>
                    <FiCheckCircle />
                    Active
                  </>
                ) : (
                  <>
                    <FiXCircle />
                    Disabled
                  </>
                )}
              </span>
            }
          />
          <InfoRow
            label="Account Created"
            value={
              (() => {
                try {
                  if (report.createdAt) {
                    const date = new Date(report.createdAt);
                    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                  }
                  if (employee.createdAt) {
                    let date;
                    if (employee.createdAt?.toDate) {
                      date = employee.createdAt.toDate();
                    } else if (employee.createdAt?.seconds) {
                      date = new Date(employee.createdAt.seconds * 1000);
                    } else {
                      date = new Date(employee.createdAt);
                    }
                    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                  }
                  return 'N/A';
                } catch {
                  return 'N/A';
                }
              })()
            }
            icon={<FiCalendar />}
          />
        </InfoSection>

        {/* Subscription Information */}
        <InfoSection
          title="Subscription Information"
          icon={<FiDollarSign className={isDarkMode ? 'text-white/60' : 'text-gray-600'} />}
        >
          <InfoRow
            label="Plan Name"
            value={report.subscription?.planName || 'No Subscription'}
          />
          <InfoRow
            label="Plan Duration"
            value={
              report.subscription?.duration
                ? `${report.subscription.duration} days`
                : 'N/A'
            }
          />
          <InfoRow
            label="Start Date"
            value={
              report.subscription?.startDate
                ? (() => {
                    try {
                      const date = new Date(report.subscription.startDate);
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                    } catch {
                      return 'N/A';
                    }
                  })()
                : 'N/A'
            }
            icon={<FiCalendar />}
          />
          <InfoRow
            label="Expiration Date"
            value={
              report.subscription?.expirationDate
                ? (() => {
                    try {
                      const date = new Date(report.subscription.expirationDate);
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                    } catch {
                      return 'N/A';
                    }
                  })()
                : 'N/A'
            }
            icon={<FiClock />}
          />
          <InfoRow
            label="Days Remaining"
            value={
              daysRemaining !== null
                ? daysRemaining > 0
                  ? `${daysRemaining} days`
                  : 'Expired'
                : 'N/A'
            }
          />
          <InfoRow
            label="Subscription Status"
            value={
              <span className={`flex items-center gap-2 ${
                report.subscription?.status === 'active'
                  ? 'text-green-500' : 'text-red-500'
              }`}>
                {report.subscription?.status === 'active' ? (
                  <>
                    <FiCheckCircle />
                    Active
                  </>
                ) : (
                  <>
                    <FiXCircle />
                    {report.subscription?.status || 'Expired'}
                  </>
                )}
              </span>
            }
          />
          <InfoRow
            label="Total Payments"
            value={
              report.subscription?.totalPayments
                ? `$${report.subscription.totalPayments.toLocaleString()}`
                : '$0'
            }
            icon={<FiDollarSign />}
          />
        </InfoSection>

        {/* Usage / Activity */}
        <InfoSection
          title="Usage & Activity"
          icon={<FiActivity className={isDarkMode ? 'text-white/60' : 'text-gray-600'} />}
        >
          <InfoRow
            label="Users Managed"
            value={report.activity?.usersManaged || 0}
            icon={<FiUsers />}
          />
          <InfoRow
            label="Meal Plans Created"
            value={report.activity?.mealPlansCreated || 0}
            icon={<FiFileText />}
          />
          <InfoRow
            label="Workout Plans Created"
            value={report.activity?.workoutPlansCreated || 0}
            icon={<FiTrendingUp />}
          />
          <InfoRow
            label="Last Login Date"
            value={
              report.activity?.lastLogin
                ? (() => {
                    try {
                      const date = new Date(report.activity.lastLogin);
                      return isNaN(date.getTime()) ? 'Never' : date.toLocaleDateString();
                    } catch {
                      return 'Never';
                    }
                  })()
                : 'Never'
            }
            icon={<FiClock />}
          />
          <InfoRow
            label="Chat Activity Count"
            value={report.activity?.chatMessages || 0}
            icon={<FiMessageCircle />}
          />
        </InfoSection>

        {/* Payment History */}
        <InfoSection
          title="Payment History"
          icon={<FiDollarSign className={isDarkMode ? 'text-white/60' : 'text-gray-600'} />}
        >
          {report.paymentHistory && report.paymentHistory.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {report.paymentHistory.map((payment, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      {payment.type || 'Payment'}
                    </span>
                    <span className={`text-lg font-bold ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      ${(payment.amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${
                      isDarkMode ? 'text-white/60' : 'text-gray-500'
                    }`}>
                      {payment.date
                        ? (() => {
                            try {
                              const date = new Date(payment.date);
                              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                            } catch {
                              return 'N/A';
                            }
                          })()
                        : 'N/A'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      payment.status === 'completed'
                        ? isDarkMode
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-green-100 text-green-700'
                        : isDarkMode
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payment.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
              {report.totalAmountPaid !== undefined && (
                <div className={`mt-4 pt-4 border-t ${
                  isDarkMode ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Total Amount Paid:
                    </span>
                    <span className={`text-xl font-bold ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      ${(report.totalAmountPaid || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className={`text-sm ${
              isDarkMode ? 'text-white/60' : 'text-gray-500'
            }`}>
              No payment history available
            </p>
          )}
        </InfoSection>

        {/* Additional Metrics */}
        <InfoSection
          title="Additional Metrics"
          icon={<FiTrendingUp className={isDarkMode ? 'text-white/60' : 'text-gray-600'} />}
        >
          <InfoRow
            label="Employee ID"
            value={employee.employeeId || employee.uid || 'N/A'}
            icon={<FiHash />}
          />
          <InfoRow
            label="Phone Number"
            value={employee.phoneNumber || report.phoneNumber || 'N/A'}
          />
          <InfoRow
            label="Total Sessions"
            value={report.activity?.totalSessions || 0}
          />
        </InfoSection>
      </div>
    </div>
  );
};

export default EmployeeReport;

