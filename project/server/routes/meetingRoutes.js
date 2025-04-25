import express from 'express';
import Meeting from '../models/Meeting.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Create a new meeting
// @route   POST /api/meetings
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, description, startTime, endTime, location, attendees } = req.body;
    
    // Validate start and end times
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (end <= start) {
      return res.status(400).json({ 
        success: false, 
        message: 'End time must be after start time' 
      });
    }
    
    // Create new meeting
    const meeting = new Meeting({
      title,
      description,
      startTime: start,
      endTime: end,
      location,
      organizer: req.user._id
    });
    
    // Add attendees if provided
    if (attendees && attendees.length > 0) {
      // Validate that all attendees exist
      const attendeeEmails = attendees.map(email => email.toLowerCase());
      const users = await User.find({ email: { $in: attendeeEmails } });
      
      if (users.length !== attendeeEmails.length) {
        return res.status(400).json({ 
          success: false, 
          message: 'One or more attendees do not exist' 
        });
      }
      
      // Add validated attendees to meeting
      meeting.attendees = users.map(user => ({
        user: user._id,
        status: 'pending'
      }));
    }
    
    // Check for meeting conflicts for organizer
    const hasOrganizerConflict = await meeting.hasConflict(req.user._id);
    
    if (hasOrganizerConflict) {
      return res.status(400).json({ 
        success: false, 
        message: 'Meeting conflicts with your existing schedule' 
      });
    }
    
    // Check for conflicts for each attendee
    if (meeting.attendees && meeting.attendees.length > 0) {
      for (const attendee of meeting.attendees) {
        const hasAttendeeConflict = await meeting.hasConflict(attendee.user);
        
        if (hasAttendeeConflict) {
          const conflictUser = await User.findById(attendee.user);
          return res.status(400).json({ 
            success: false, 
            message: `Meeting conflicts with ${conflictUser.name}'s schedule` 
          });
        }
      }
    }
    
    // Save meeting
    await meeting.save();
    
    // Return response
    res.status(201).json({
      success: true,
      meeting
    });
  } catch (error) {
    console.log('Route Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all meetings for current user
// @route   GET /api/meetings
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Find meetings where user is organizer or attendee
    const meetings = await Meeting.find({
      $or: [
        { organizer: req.user._id },
        { 'attendees.user': req.user._id }
      ]
    })
    .populate('organizer', 'name email')
    .populate('attendees.user', 'name email')
    .sort({ startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: meetings.length,
      meetings
    });
  } catch (error) {
    console.log('Route Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get meeting by ID
// @route   GET /api/meetings/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    // Find meeting by ID
    const meeting = await Meeting.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('attendees.user', 'name email');
    
    // Check if meeting exists
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    
    // Check if user is authorized to view meeting
    const isOrganizer = meeting.organizer._id.toString() === req.user._id.toString();
    const isAttendee = meeting.attendees.some(
      attendee => attendee.user._id.toString() === req.user._id.toString()
    );
    
    if (!isOrganizer && !isAttendee) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this meeting' 
      });
    }
    
    res.status(200).json({
      success: true,
      meeting
    });
  } catch (error) {
    console.log('Route Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update meeting
// @route   PUT /api/meetings/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    // Find meeting by ID
    let meeting = await Meeting.findById(req.params.id);
    
    // Check if meeting exists
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    
    // Check if user is organizer
    if (meeting.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this meeting' 
      });
    }
    
    // Update meeting
    const { title, description, startTime, endTime, location, attendees } = req.body;
    
    if (title) meeting.title = title;
    if (description) meeting.description = description;
    if (startTime) meeting.startTime = new Date(startTime);
    if (endTime) meeting.endTime = new Date(endTime);
    if (location) meeting.location = location;
    
    // Validate start and end times
    if (meeting.endTime <= meeting.startTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'End time must be after start time' 
      });
    }
    
    // Update attendees if provided
    if (attendees && attendees.length > 0) {
      // Validate that all attendees exist
      const attendeeEmails = attendees.map(email => email.toLowerCase());
      const users = await User.find({ email: { $in: attendeeEmails } });
      
      if (users.length !== attendeeEmails.length) {
        return res.status(400).json({ 
          success: false, 
          message: 'One or more attendees do not exist' 
        });
      }
      
      // Create new attendees array
      const newAttendees = users.map(user => {
        // Check if attendee already exists in meeting
        const existingAttendee = meeting.attendees.find(
          att => att.user.toString() === user._id.toString()
        );
        
        // If attendee exists, keep their status, otherwise set to pending
        return {
          user: user._id,
          status: existingAttendee ? existingAttendee.status : 'pending'
        };
      });
      
      meeting.attendees = newAttendees;
    }
    
    // Check for meeting conflicts
    const hasOrganizerConflict = await meeting.hasConflict(req.user._id);
    
    if (hasOrganizerConflict) {
      return res.status(400).json({ 
        success: false, 
        message: 'Meeting conflicts with your existing schedule' 
      });
    }
    
    // Save meeting
    await meeting.save();
    
    // Get updated meeting with populated fields
    meeting = await Meeting.findById(meeting._id)
      .populate('organizer', 'name email')
      .populate('attendees.user', 'name email');
    
    res.status(200).json({
      success: true,
      meeting
    });
  } catch (error) {
    console.log('Route Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    // Find meeting by ID
    const meeting = await Meeting.findById(req.params.id);
    
    // Check if meeting exists
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    
    // Check if user is organizer
    if (meeting.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this meeting' 
      });
    }
    
    // Delete meeting
    await meeting.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    console.log('Route Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update meeting attendance status
// @route   PUT /api/meetings/:id/respond
// @access  Private
router.put('/:id/respond', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status must be either accepted or declined' 
      });
    }
    
    // Find meeting by ID
    let meeting = await Meeting.findById(req.params.id);
    
    // Check if meeting exists
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    
    // Check if user is an attendee
    const attendeeIndex = meeting.attendees.findIndex(
      attendee => attendee.user.toString() === req.user._id.toString()
    );
    
    if (attendeeIndex === -1) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not an attendee of this meeting' 
      });
    }
    
    // Check for conflicts if accepting
    if (status === 'accepted') {
      const hasConflict = await meeting.hasConflict(req.user._id);
      
      if (hasConflict) {
        return res.status(400).json({ 
          success: false, 
          message: 'Meeting conflicts with your existing schedule' 
        });
      }
    }
    
    // Update attendance status
    meeting.attendees[attendeeIndex].status = status;
    
    // Save meeting
    await meeting.save();
    
    // Get updated meeting with populated fields
    meeting = await Meeting.findById(meeting._id)
      .populate('organizer', 'name email')
      .populate('attendees.user', 'name email');
    
    res.status(200).json({
      success: true,
      meeting
    });
  } catch (error) {
    console.log('Route Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;