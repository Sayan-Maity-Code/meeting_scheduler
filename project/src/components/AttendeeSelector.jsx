import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, User, Search } from 'lucide-react';
import { useMeetings } from '../context/MeetingContext';
import { debounce } from 'lodash';

const AttendeeSelector = ({ selectedAttendees, setSelectedAttendees }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { searchUsers } = useMeetings();
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        try {
          const results = await searchUsers(query);
          setSearchResults(results);
        } catch (error) {
          console.error('Error searching users:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500),
    [searchUsers]
  );
  
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setIsDropdownOpen(true);
      debouncedSearch(searchQuery);
    } else {
      setIsDropdownOpen(false);
      setSearchResults([]);
    }
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleAddAttendee = (user) => {
    // Check if attendee already selected
    const isAlreadySelected = selectedAttendees.some(
      (attendee) => attendee.email === user.email
    );
    
    if (!isAlreadySelected) {
      setSelectedAttendees([...selectedAttendees, user]);
    }
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
    setIsDropdownOpen(false);
  };
  
  const handleRemoveAttendee = (email) => {
    setSelectedAttendees(selectedAttendees.filter((attendee) => attendee.email !== email));
  };
  
  return (
    <div className="relative space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Attendees
      </label>
      
      {/* Selected attendees */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedAttendees.map((attendee) => (
          <div 
            key={attendee.email}
            className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-md"
          >
            <User className="h-3 w-3 mr-1" />
            <span className="text-xs">{attendee.name || attendee.email}</span>
            <button
              type="button"
              onClick={() => handleRemoveAttendee(attendee.email)}
              className="ml-1 text-purple-600 hover:text-purple-800"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Search input */}
      <div className="relative" ref={dropdownRef}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim().length > 1 && setIsDropdownOpen(true)}
          placeholder="Search for users by name or email"
          className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
        
        {/* Search results dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
            {isLoading && (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-block animate-spin h-4 w-4 border-2 border-gray-300 border-t-purple-600 rounded-full mr-2"></div>
                Searching...
              </div>
            )}
            
            {!isLoading && searchResults.length === 0 && searchQuery.trim().length > 1 && (
              <div className="p-4 text-center text-gray-500">
                No users found
              </div>
            )}
            
            {searchResults.map((user) => (
              <button
                key={user._id}
                type="button"
                onClick={() => handleAddAttendee(user)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        Search for users to add as attendees. Press Enter after each email.
      </p>
    </div>
  );
};

export default React.memo(AttendeeSelector);