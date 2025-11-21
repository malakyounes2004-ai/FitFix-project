import { getAllSubscriptions, checkSubscriptionExpirations } from '../services/subscriptionService.js';

/**
 * Get all subscriptions (Admin only)
 * GET /api/subscriptions
 */
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await getAllSubscriptions();
    
    res.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions'
    });
  }
};

/**
 * Check and process subscription expirations (Admin only)
 * POST /api/subscriptions/check-expirations
 */
export const checkExpirations = async (req, res) => {
  try {
    const results = await checkSubscriptionExpirations();
    
    res.json({
      success: true,
      message: 'Subscription expirations checked',
      data: results
    });
  } catch (error) {
    console.error('Check expirations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check subscription expirations'
    });
  }
};

