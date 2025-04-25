import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, User, Calendar, LogOut, Menu as MenuIcon } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <nav className="bg-black shadow-md">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="text-purple-400 hover:text-purple-300 focus:outline-none md:hidden"
              onClick={toggleSidebar}
            >
              <MenuIcon size={24} />
            </button>
            <Link to="/" className="ml-2 md:ml-0">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500" />
                <span className="ml-2 text-xl font-semibold text-purple-400">MeetSync</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-1 rounded-full text-purple-400 hover:text-purple-300 focus:outline-none">
              <Bell size={20} />
            </button>
            
            <div className="relative">
              <button
                className="flex items-center text-purple-400 hover:text-purple-300 focus:outline-none"
                onClick={toggleDropdown}
              >
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 hidden md:inline">{user?.name}</span>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50 animate-fade-in">
                  <div className="px-4 py-3">
                    <p className="text-sm">Signed in as</p>
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;