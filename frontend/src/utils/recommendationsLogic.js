/**
 * ==========================================
 * RECOMMENDATIONS LOGIC
 * ==========================================
 * 
 * PURPOSE: Generate smart recommendations based on data analysis
 * WHY: Helps admins make proactive decisions
 * LOGIC: Rule-based system analyzing employee and system data
 */

/**
 * Calculate days until expiration
 */
const getDaysUntilExpiration = (expirationDate) => {
  if (!expirationDate) return null;
  const exp = new Date(expirationDate);
  const now = new Date();
  const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  return diff;
};

/**
 * Check if employee is inactive (no login in last 30 days)
 */
const isInactive = (lastLogin) => {
  if (!lastLogin) return true;
  const loginDate = new Date(lastLogin);
  const now = new Date();
  const daysSinceLogin = Math.ceil((now - loginDate) / (1000 * 60 * 60 * 24));
  return daysSinceLogin > 30;
};

/**
 * Check if employee has high activity
 */
const hasHighActivity = (activity) => {
  const usersManaged = activity?.usersManaged || 0;
  const mealPlans = activity?.mealPlansCreated || 0;
  const workoutPlans = activity?.workoutPlansCreated || 0;
  
  // High activity: managing 10+ users OR created 30+ plans
  return usersManaged >= 10 || (mealPlans + workoutPlans) >= 30;
};

/**
 * ==========================================
 * GENERATE RECOMMENDATIONS
 * ==========================================
 * 
 * PURPOSE: Analyze employee data and generate actionable recommendations
 * WHY: Proactive management and issue identification
 * RETURNS: Array of recommendation objects
 */
export const generateRecommendations = (employee, report, statistics) => {
  const recommendations = [];

  // Check subscription expiration
  if (report.subscription?.expirationDate) {
    const daysRemaining = getDaysUntilExpiration(report.subscription.expirationDate);
    
    if (daysRemaining !== null) {
      if (daysRemaining <= 0) {
        recommendations.push({
          type: 'urgent',
          title: 'Subscription Expired',
          message: `Employee subscription expired ${Math.abs(daysRemaining)} day(s) ago. Immediate action required.`,
          action: 'Contact employee to renew subscription or disable account access.'
        });
      } else if (daysRemaining <= 7) {
        recommendations.push({
          type: 'warning',
          title: 'Subscription Expiring Soon',
          message: `Employee subscription will expire in ${daysRemaining} day(s).`,
          action: 'Send renewal reminder email and follow up with employee.'
        });
      } else if (daysRemaining <= 14) {
        recommendations.push({
          type: 'info',
          title: 'Subscription Renewal Reminder',
          message: `Employee subscription expires in ${daysRemaining} days. Consider sending a renewal reminder.`,
          action: 'Schedule renewal reminder email.'
        });
      }
    }
  } else if (!report.subscription) {
    recommendations.push({
      type: 'warning',
      title: 'No Active Subscription',
      message: 'Employee does not have an active subscription plan.',
      action: 'Review employee status and subscription requirements.'
    });
  }

  // Check account status
  if (employee.isActive === false || report.isActive === false) {
    recommendations.push({
      type: 'info',
      title: 'Account Disabled',
      message: 'Employee account is currently disabled.',
      action: 'Review reason for deactivation and consider reactivation if appropriate.'
    });
  }

  // Check activity levels
  const lastLogin = report.activity?.lastLogin;
  if (isInactive(lastLogin)) {
    recommendations.push({
      type: 'warning',
      title: 'Inactive Employee',
      message: 'Employee has not logged in for over 30 days. May require follow-up.',
      action: 'Contact employee to check account status and engagement.'
    });
  }

  // High activity recommendation
  if (hasHighActivity(report.activity)) {
    const usersManaged = report.activity?.usersManaged || 0;
    recommendations.push({
      type: 'success',
      title: 'High Activity Employee',
      message: `Employee is managing ${usersManaged} users and has created ${(report.activity?.mealPlansCreated || 0) + (report.activity?.workoutPlansCreated || 0)} plans.`,
      action: 'Consider offering premium plan upgrade or performance recognition.'
    });
  }

  // Low activity recommendation
  if (report.activity) {
    const usersManaged = report.activity.usersManaged || 0;
    const totalPlans = (report.activity.mealPlansCreated || 0) + (report.activity.workoutPlansCreated || 0);
    
    if (usersManaged === 0 && totalPlans === 0 && !isInactive(lastLogin)) {
      recommendations.push({
        type: 'info',
        title: 'New Employee - Training Recommended',
        message: 'Employee account is active but has no activity yet.',
        action: 'Provide onboarding resources and training materials.'
      });
    }
  }

  // Revenue opportunity
  if (report.subscription?.status === 'active' && hasHighActivity(report.activity)) {
    const currentPlan = report.subscription.planName || '';
    if (!currentPlan.toLowerCase().includes('premium') && !currentPlan.toLowerCase().includes('pro')) {
      recommendations.push({
        type: 'info',
        title: 'Upgrade Opportunity',
        message: 'High-performing employee may benefit from premium plan features.',
        action: 'Consider reaching out with upgrade offer and benefits.'
      });
    }
  }

  // Payment status check
  if (report.subscription?.totalPayments === 0 && report.subscription?.status === 'active') {
    recommendations.push({
      type: 'warning',
      title: 'Payment Verification Needed',
      message: 'Active subscription shows no payment history. Verify payment status.',
      action: 'Review payment records and subscription activation process.'
    });
  }

  return recommendations;
};

