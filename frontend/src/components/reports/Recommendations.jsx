/**
 * ==========================================
 * RECOMMENDATIONS COMPONENT
 * ==========================================
 * 
 * PURPOSE: Provide actionable insights based on data analysis
 * WHY: Helps admins make proactive decisions and identify issues
 * LOGIC: Rule-based recommendations from employee and system data
 */

import React from 'react';
import { 
  FiAlertCircle, FiCheckCircle, FiInfo, FiTrendingUp,
  FiClock, FiDollarSign, FiUsers, FiActivity
} from 'react-icons/fi';
import { generateRecommendations } from '../../utils/recommendationsLogic';

const Recommendations = ({ employee, report, statistics, isDarkMode }) => {
  if (!employee || !report) return null;

  // Generate recommendations based on data
  const recommendations = generateRecommendations(employee, report, statistics);

  if (recommendations.length === 0) {
    return (
      <div className={`p-6 rounded-2xl border ${
        isDarkMode
          ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : 'bg-green-50 border-green-200 text-green-700'
      }`}>
        <div className="flex items-center gap-3">
          <FiCheckCircle className="text-xl" />
          <p className="font-medium">No action items. Employee account is in good standing.</p>
        </div>
      </div>
    );
  }

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <FiAlertCircle className="text-orange-500" />;
      case 'info':
        return <FiInfo className="text-blue-500" />;
      case 'success':
        return <FiCheckCircle className="text-green-500" />;
      case 'urgent':
        return <FiAlertCircle className="text-red-500" />;
      default:
        return <FiInfo className="text-blue-500" />;
    }
  };

  const getRecommendationStyles = (type) => {
    const baseStyles = 'p-4 rounded-xl border';
    
    switch (type) {
      case 'warning':
        return `${baseStyles} ${
          isDarkMode
            ? 'bg-orange-500/10 border-orange-500/30'
            : 'bg-orange-50 border-orange-200'
        }`;
      case 'info':
        return `${baseStyles} ${
          isDarkMode
            ? 'bg-blue-500/10 border-blue-500/30'
            : 'bg-blue-50 border-blue-200'
        }`;
      case 'success':
        return `${baseStyles} ${
          isDarkMode
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-green-50 border-green-200'
        }`;
      case 'urgent':
        return `${baseStyles} ${
          isDarkMode
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-red-50 border-red-200'
        }`;
      default:
        return `${baseStyles} ${
          isDarkMode
            ? 'bg-white/5 border-white/10'
            : 'bg-gray-50 border-gray-200'
        }`;
    }
  };

  return (
    <div className="space-y-4">
      {recommendations.map((rec, index) => (
        <div
          key={index}
          className={getRecommendationStyles(rec.type)}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {getRecommendationIcon(rec.type)}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {rec.title}
              </h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-white/70' : 'text-gray-600'
              }`}>
                {rec.message}
              </p>
              {rec.action && (
                <p className={`text-xs mt-2 font-medium ${
                  isDarkMode ? 'text-white/50' : 'text-gray-500'
                }`}>
                  Recommended Action: {rec.action}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Recommendations;

