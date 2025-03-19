import jwt from 'jsonwebtoken';

// Middleware to authenticate requests using JWT
export const authMiddleware = (req, res, next) => {
  // Get token from the 'x-auth-token' header
  const token = req.header('x-auth-token');

  // Check if token exists
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the token using the JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure the decoded payload has the expected structure
    if (!decoded.user || !decoded.user.id) {
      return res.status(401).json({ msg: 'Invalid token structure' });
    }

    // Attach the user object to the request
    req.user = decoded.user; // Should include { id, role }
    console.log('Authenticated user:', req.user); // Debug log
    next();
  } catch (err) {
    console.error('Token verification error:', err.message); // Debug log
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to check if the user is an admin
export const isAdmin = (req, res, next) => {
  // Ensure req.user exists and has a role
  if (!req.user || !req.user.role) {
    return res.status(403).json({ msg: 'User role not found, access denied' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin access required' });
  }

  console.log('Admin access granted for user:', req.user.id); // Debug log
  next();
};