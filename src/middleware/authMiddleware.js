// src/middleware/authMiddleware.js
import { auth, db } from '../firebase.js';

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
 */
async function authenticate(req, res, next) {
  const decoded = await verifyIdToken(req);
  if (!decoded) return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or missing token' });

  try {
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) return res.status(404).json({ success: false, message: 'User profile not found' });

    req.user = { uid: decoded.uid, email: decoded.email, ...userDoc.data() };
    next();
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
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
