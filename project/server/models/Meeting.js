import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required']
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  location: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if meeting conflicts with existing meetings
meetingSchema.methods.hasConflict = async function(attendeeId) {
  try {
    const conflictingMeetings = await mongoose.model('Meeting').find({
      $or: [
        { organizer: attendeeId },
        { 'attendees.user': attendeeId, 'attendees.status': 'accepted' }
      ],
      $and: [
        { 
          $or: [
            // Meeting starts during another meeting
            { startTime: { $lt: this.endTime, $gte: this.startTime } },
            // Meeting ends during another meeting
            { endTime: { $gt: this.startTime, $lte: this.endTime } },
            // Meeting encompasses another meeting
            { startTime: { $lte: this.startTime }, endTime: { $gte: this.endTime } }
          ]
        },
        { _id: { $ne: this._id } } // Exclude the current meeting when checking for conflicts
      ]
    });
    
    return conflictingMeetings.length > 0;
  } catch (error) {
    throw new Error(error);
  }
};

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;