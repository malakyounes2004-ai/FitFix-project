// src/middleware/authMiddleware.js
import { auth, db } from '../firebase.js';

/**
 * List of public routes that do not require authentication
 * Format: { method: 'POST', path: '/auth/login' }
 * Note: Paths should match the route path (relative to router mount point)
 */
const PUBLIC_ROUTES = [
  { method: 'POST', path: '/login' },
  { method: 'POST', path: '/register' },
  { method: 'POST', path: '/forgot-password' },
  { method: 'POST', path: '/verify-reset-code' },
  { method: 'POST', path: '/reset-password' }
];

/**
 * Check if a route is public (does not require authentication)
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} path - Route path
 * @returns {boolean} True if route is public
 */
function isPublicRoute(method, path) {
  return PUBLIC_ROUTES.some(
    route => route.method === method && route.path === path
  );
}

/**
 * Extract and verify Firebase ID token from request headers
 * @param {Object} req - Express request object
 * @returns {Object|null} - Decoded token or null
 */
async function verifyIdToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  const idToken = parts[1];
  try {
    const decoded = await auth.verifyIdToken(idToken);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Middleware to verify authentication (any authenticated user)
 * 
 * This middleware automatically detects public routes and bypasses authentication for them.
 * For protected routes, it requires a valid Firebase ID token in the Authorization header.
 * 
 * PUBLIC ROUTES (bypass authentication):
 * - POST /auth/login
 * - POST /auth/register
 * - POST /auth/forgot-password
 * - POST /auth/verify-reset-code
 * - POST /auth/reset-password
 * 
 * PROTECTED ROUTES (require authentication):
 * - All other routes require a valid Bearer token
 * 
 * Usage:
 *   router.get('/profile', authenticate, getProfile);
 *   router.post('/login', login); // No middleware needed - automatically public
 */
async function authenticate(req, res, next) {
  const method = req.method;
  const path = req.path; // Path relative to router mount point (e.g., '/login' not '/api/auth/login')

  // Check if this is a public route
  if (isPublicRoute(method, path)) {
    console.log(`🔓 Public route accessed: ${method} ${path} - Authentication bypassed`);
    return next(); // Skip authentication for public routes
  }

  // Protected route - require authentication
  console.log(`🔒 Protected route accessed: ${method} ${path} - Authentication required`);

  const decoded = await verifyIdToken(req);
  if (!decoded) {
    console.log(`❌ Authentication failed: ${method} ${path} - Missing or invalid token`);
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Invalid or missing token' 
    });
  }

  try {
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) {
      console.log(`❌ User profile not found: ${decoded.uid}`);
      return res.status(404).json({ 
        success: false, 
        message: 'User profile not found' 
      });
    }

    req.user = { uid: decoded.uid, email: decoded.email, ...userDoc.data() };
    console.log(`✅ Authentication successful: ${method} ${path} - User: ${decoded.email}`);
    next();
  } catch (error) {
    console.error(`❌ Error fetching user data for ${decoded.uid}:`, error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

/**
 * Middleware to verify Admin role
 */
async function verifyAdmin(req, res, next) {
  const decoded = await verifyIdToken(req);
  if (!decoded) return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or missing token' });

  try {
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) return res.status(404).json({ success: false, message: 'User profile not found' });

    const userData = userDoc.data();
    if (userData.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });

    req.user = { uid: decoded.uid, email: decoded.email, ...userData };
    next();
  } catch (error) {
    console.error('Error in verifyAdmin:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * Middleware to verify Employee role
 */
async function verifyEmployee(req, res, next) {
  const decoded = await verifyIdToken(req);
  if (!decoded) return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or missing token' });

  try {
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) return res.status(404).json({ success: false, message: 'User profile not found' });

    const userData = userDoc.data();
    if (userData.role !== 'employee' && userData.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Employee or Admin access required' });
    }

    req.user = { uid: decoded.uid, email: decoded.email, ...userData };
    next();
  } catch (error) {
    console.error('Error in verifyEmployee:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * Middleware to verify User role
 */
async function verifyUser(req, res, next) {
  const decoded = await verifyIdToken(req);
  if (!decoded) return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or missing token' });

  try {
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) return res.status(404).json({ success: false, message: 'User profile not found' });

    const userData = userDoc.data();
    if (userData.role !== 'user') return res.status(403).json({ success: false, message: 'Forbidden: User access required' });

    req.user = { uid: decoded.uid, email: decoded.email, ...userData };
    next();
  } catch (error) {
    console.error('Error in verifyUser:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Export all middlewares
export { authenticate, verifyAdmin, verifyEmployee, verifyUser };
