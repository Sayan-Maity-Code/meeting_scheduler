import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { useMeetings } from '../context/MeetingContext';
import { useAuth } from '../context/AuthContext';

const MeetingCard = ({ meeting }) => {
  const { deleteMeeting, respondToMeeting } = useMeetings();
  const { user } = useAuth();
  
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);
  
  const isOrganizer = meeting.organizer._id === user?._id;
  
  const getUserAttendanceStatus = () => {
    if (isOrganizer) return null;
    
    const attendee = meeting.attendees.find(
      attendee => attendee.user._id === user?._id
    );
    
    return attendee ? attendee.status : null;
  };
  
  const attendanceStatus = getUserAttendanceStatus();
  
  const handleDelete = async () => {
    await deleteMeeting(meeting._id);
    setShowConfirmDelete(false);
  };
  
  const handleRespond = async (status) => {
    await respondToMeeting(meeting._id, status);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-purple-500 hover:shadow-lg transition-shadow animate-slide-up">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-800">{meeting.title}</h3>
        
        {isOrganizer && (
          <div className="flex space-x-2">
            <Link
              to={`/meetings/${meeting._id}/edit`}
              className="text-gray-500 hover:text-purple-600 transition-colors"
            >
              <Edit size={18} />
            </Link>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="text-gray-500 hover:text-red-600 transition-colors"
            >
              <Trash size={18} />
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="flex items-center text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{format(new Date(meeting.startTime), 'EEEE, MMMM d, yyyy')}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>
            {format(new Date(meeting.startTime), 'h:mm a')} - 
            {format(new Date(meeting.endTime), 'h:mm a')}
          </span>
        </div>
        
        {meeting.location && (
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{meeting.location}</span>
          </div>
        )}
        
        <div className="flex items-center text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          <span>
            {isOrganizer ? 'You are the organizer' : `Organized by ${meeting.organizer.name}`}
          </span>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <Link
          to={`/meetings/${meeting._id}`}
          className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
        >
          View Details
        </Link>
        
        {attendanceStatus && (
          <div className="flex space-x-2">
            {attendanceStatus === 'pending' ? (
              <>
                <button
                  onClick={() => handleRespond('accepted')}
                  className="px-3 py-1 text-xs font-medium rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRespond('declined')}
                  className="px-3 py-1 text-xs font-medium rounded bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
                >
                  Decline
                </button>
              </>
            ) : (
              <span
                className={`px-3 py-1 text-xs font-medium rounded ${
                  attendanceStatus === 'accepted'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {attendanceStatus === 'accepted' ? 'Accepted' : 'Declined'}
              </span>
            )}
          </div>
        )}
      </div>
      
      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this meeting? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-sm font-medium rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingCard;