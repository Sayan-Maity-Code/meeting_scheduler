import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { useMeetings } from '../context/MeetingContext';
import { useAuth } from '../context/AuthContext';
import MeetingCard from '../components/MeetingCard';

const Dashboard = () => {
  const { meetings, loading, fetchMeetings } = useMeetings();
  const { user } = useAuth();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  
  // Fetch meetings on component mount
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);
  
  // Filter meetings for selected date
  useEffect(() => {
    if (meetings.length) {
      const filtered = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.startTime);
        return isSameDay(meetingDate, selectedDate);
      });
      
      setFilteredMeetings(filtered);
    }
  }, [meetings, selectedDate]);
  
  // Calendar navigation
  const nextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };
  
  const prevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };
  
  // Get all days in the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  // Check if a day has meetings
  const dayHasMeetings = (day) => {
    return meetings.some(meeting => {
      const meetingDate = new Date(meeting.startTime);
      return isSameDay(meetingDate, day);
    });
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <Link
          to="/meetings/create"
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Meeting
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Calendar</h2>
            <div className="flex items-center">
              <button
                onClick={prevMonth}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="mx-2 text-gray-700">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button
                onClick={nextMonth}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div
                key={index}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days of the week before the first day of the month */}
            {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="h-10 rounded-md"></div>
            ))}
            
            {/* Actual days of the month */}
            {daysInMonth.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const hasMeetings = dayHasMeetings(day);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`h-10 rounded-md flex items-center justify-center relative ${
                    isSelected
                      ? 'bg-purple-600 text-white'
                      : hasMeetings
                      ? 'hover:bg-purple-100 text-gray-800'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {format(day, 'd')}
                  {hasMeetings && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 bg-purple-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-2">Upcoming meetings</h3>
            {loading ? (
              <div className="text-center py-6">
                <div className="inline-block animate-spin h-5 w-5 border-2 border-gray-300 border-t-purple-600 rounded-full"></div>
                <p className="mt-2 text-sm text-gray-500">Loading meetings...</p>
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No upcoming meetings</p>
                <Link
                  to="/meetings/create"
                  className="mt-2 inline-block text-sm text-purple-600 hover:text-purple-700"
                >
                  Schedule a meeting
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {meetings
                  .filter(meeting => new Date(meeting.startTime) >= new Date())
                  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                  .slice(0, 3)
                  .map(meeting => (
                    <Link
                      key={meeting._id}
                      to={`/meetings/${meeting._id}`}
                      className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium text-gray-800 truncate">{meeting.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(meeting.startTime), 'MMM d, h:mm a')}
                      </p>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Meetings for selected date */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="font-semibold text-gray-700 mb-4">
              Meetings for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin h-6 w-6 border-2 border-gray-300 border-t-purple-600 rounded-full"></div>
                <p className="mt-2 text-gray-500">Loading meetings...</p>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="text-center py-10">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No meetings scheduled for this date</p>
                <Link
                  to="/meetings/create"
                  className="mt-3 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMeetings
                  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                  .map(meeting => (
                    <MeetingCard key={meeting._id} meeting={meeting} />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;