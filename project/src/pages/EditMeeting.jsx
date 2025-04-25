import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useMeetings } from '../context/MeetingContext';
import AttendeeSelector from '../components/AttendeeSelector';

const EditMeeting = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMeetingById, updateMeeting, loading } = useMeetings();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
    location: '',
  });
  
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchMeeting = async () => {
      const fetchedMeeting = await getMeetingById(id);
      
      if (fetchedMeeting) {
        // Convert attendees format for AttendeeSelector
        const attendees = fetchedMeeting.attendees.map(attendee => ({
          _id: attendee.user._id,
          name: attendee.user.name,
          email: attendee.user.email
        }));
        
        setFormData({
          title: fetchedMeeting.title,
          description: fetchedMeeting.description || '',
          startTime: new Date(fetchedMeeting.startTime),
          endTime: new Date(fetchedMeeting.endTime),
          location: fetchedMeeting.location || '',
        });
        
        setSelectedAttendees(attendees);
      } else {
        navigate('/');
      }
      
      setIsLoading(false);
    };
    
    fetchMeeting();
  }, [id, getMeetingById, navigate]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };
  
  const handleStartTimeChange = (date) => {
    setFormData({
      ...formData,
      startTime: date,
      // If end time is before new start time, set end time to 1 hour after start time
      endTime: formData.endTime < date ? new Date(date.getTime() + 60 * 60 * 1000) : formData.endTime
    });
    
    if (errors.startTime || errors.endTime) {
      setErrors({
        ...errors,
        startTime: '',
        endTime: ''
      });
    }
  };
  
  const handleEndTimeChange = (date) => {
    setFormData({
      ...formData,
      endTime: date
    });
    
    if (errors.endTime) {
      setErrors({
        ...errors,
        endTime: ''
      });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Format attendees for API
      const attendees = selectedAttendees.map(attendee => attendee.email);
      
      const meetingData = {
        ...formData,
        attendees
      };
      
      const updatedMeeting = await updateMeeting(id, meetingData);
      
      if (updatedMeeting) {
        navigate(`/meetings/${updatedMeeting._id}`);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Link
          to={`/meetings/${id}`}
          className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Meeting Details
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-black text-white p-6">
          <h1 className="text-2xl font-bold">Edit Meeting</h1>
          <p className="text-purple-400 mt-2">Update your meeting details</p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Meeting Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.title
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                }`}
                placeholder="Weekly Team Sync"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Discuss project updates and next steps..."
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <DatePicker
                    selected={formData.startTime}
                    onChange={handleStartTimeChange}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className={`pl-10 block w-full rounded-md shadow-sm ${
                      errors.startTime
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                </div>
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <DatePicker
                    selected={formData.endTime}
                    onChange={handleEndTimeChange}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className={`pl-10 block w-full rounded-md shadow-sm ${
                      errors.endTime
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                </div>
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Conference Room A or Zoom Meeting"
                />
              </div>
            </div>
            
            <AttendeeSelector
              selectedAttendees={selectedAttendees}
              setSelectedAttendees={setSelectedAttendees}
            />
            
            <div className="flex justify-end space-x-3 pt-4">
              <Link
                to={`/meetings/${id}`}
                className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-md border border-transparent bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMeeting;