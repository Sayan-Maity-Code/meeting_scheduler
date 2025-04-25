import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Plus, User, Settings, Home } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="flex flex-col w-64 h-full bg-black">
      <div className="flex items-center justify-center h-16 border-b border-purple-800">
        <div className="flex items-center">
          <Calendar className="h-8 w-8 text-purple-500" />
          <span className="ml-2 text-xl font-semibold text-purple-400">MeetSync</span>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="mt-5 px-2 space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-purple-900 text-white'
                  : 'text-purple-400 hover:bg-purple-800 hover:text-white'
              }`
            }
          >
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>
          
          <NavLink
            to="/meetings/create"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-purple-900 text-white'
                  : 'text-purple-400 hover:bg-purple-800 hover:text-white'
              }`
            }
          >
            <Plus className="mr-3 h-5 w-5" />
            Create Meeting
          </NavLink>
          
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-purple-900 text-white'
                  : 'text-purple-400 hover:bg-purple-800 hover:text-white'
              }`
            }
          >
            <User className="mr-3 h-5 w-5" />
            Profile
          </NavLink>
        </nav>
      </div>
      
      <div className="p-4 border-t border-purple-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">App Settings</p>
            <p className="text-xs text-purple-400">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;