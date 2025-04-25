import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Users, ArrowLeft, Edit, Trash, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { useMeetings } from '../context/MeetingContext';
import { useAuth } from '../context/AuthContext';

const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMeetingById, deleteMeeting, respondToMeeting, loading } = useMeetings();
  const { user } = useAuth();
  
  const [meeting, setMeeting] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const fetchMeetingDetails = useCallback(async () => {
    const fetchedMeeting = await getMeetingById(id);
    if (fetchedMeeting) {
      setMeeting(fetchedMeeting);
    } else {
      navigate('/');
    }
  }, [id, getMeetingById, navigate]);
  
  useEffect(() => {
    fetchMeetingDetails();
  }, [fetchMeetingDetails]);
  
  if (loading || !meeting) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
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
    const success = await deleteMeeting(meeting._id);
    
    if (success) {
      navigate('/');
    }
  };
  
  const handleRespond = async (status) => {
    const updatedMeeting = await respondToMeeting(meeting._id, status);
    
    if (updatedMeeting) {
      setMeeting(updatedMeeting);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-black text-white p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold">{meeting.title}</h1>
            
            {isOrganizer && (
              <div className="flex space-x-3">
                <Link
                  to={`/meetings/${meeting._id}/edit`}
                  className="flex items-center px-3 py-1 text-sm rounded-md bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="flex items-center px-3 py-1 text-sm rounded-md bg-red-600 hover:bg-red-700 transition-colors"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-purple-400">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{format(new Date(meeting.startTime), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            
            <div className="flex items-center text-purple-400">
              <Clock className="h-5 w-5 mr-2" />
              <span>
                {format(new Date(meeting.startTime), 'h:mm a')} - 
                {format(new Date(meeting.endTime), 'h:mm a')}
              </span>
            </div>
            
            {meeting.location && (
              <div className="flex items-center text-purple-400">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{meeting.location}</span>
              </div>
            )}
            
            <div className="flex items-center text-purple-400">
              <User className="h-5 w-5 mr-2" />
              <span>
                {isOrganizer ? 'You are the organizer' : `Organized by ${meeting.organizer.name}`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {meeting.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
              <p className="text-gray-600">{meeting.description}</p>
            </div>
          )}
          
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Attendees ({meeting.attendees.length + 1})
            </h2>
            
            <div className="space-y-3 mt-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-800">{meeting.organizer.name}</p>
                  <p className="text-sm text-gray-500">{meeting.organizer.email}</p>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                    Organizer
                  </span>
                </div>
              </div>
              
              {meeting.attendees.map((attendee) => (
                <div key={attendee.user._id} className="flex items-center p-3 bg-gray-50 rounded-md">
                  <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{attendee.user.name}</p>
                    <p className="text-sm text-gray-500">{attendee.user.email}</p>
                  </div>
                  <div className="ml-auto">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        attendee.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : attendee.status === 'declined'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {attendee.status === 'accepted'
                        ? 'Accepted'
                        : attendee.status === 'declined'
                        ? 'Declined'
                        : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {attendanceStatus === 'pending' && (
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => handleRespond('accepted')}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Check className="h-5 w-5 mr-2" />
                Accept Invitation
              </button>
              <button
                onClick={() => handleRespond('declined')}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                <X className="h-5 w-5 mr-2" />
                Decline
              </button>
            </div>
          )}
          
          {attendanceStatus && attendanceStatus !== 'pending' && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                You have {attendanceStatus === 'accepted' ? 'accepted' : 'declined'} this meeting
              </p>
              <button
                onClick={() => handleRespond(attendanceStatus === 'accepted' ? 'declined' : 'accepted')}
                className={`mt-2 px-4 py-2 text-sm rounded-md ${
                  attendanceStatus === 'accepted'
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                } transition-colors`}
              >
                {attendanceStatus === 'accepted' ? 'Decline Instead' : 'Accept Instead'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-500 mb-4">
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

export default React.memo(MeetingDetails);