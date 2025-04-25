import express from 'express';
import User from '../models/User.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });
    
    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.log('Route Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    
    // Find user by email and include password
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.log('Route Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', (req, res) => {
  try {
    // Clear cookie
    res.cookie('jwt', '', {
      expires: new Date(0),
      httpOnly: true
    });
    
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.log('Route Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    // Get user from request object
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.log('Route Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;