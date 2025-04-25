import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in cookies
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    // Check if token exists in authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // If no token exists, return error
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    // If user doesn't exist, return error
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    console.log('Route Error:', error.message);
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};