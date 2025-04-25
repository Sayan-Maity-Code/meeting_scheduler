import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Search users by email or name
// @route   GET /api/users/search
// @access  Private
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }
    
    // Search users by email or name
    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user._id } // Exclude current user
    }).select('name email');
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.log('Route Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;