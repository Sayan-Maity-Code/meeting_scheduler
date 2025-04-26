import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-black text-white p-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start">
            <div className="h-24 w-24 rounded-full bg-purple-600 flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <div className="flex items-center justify-center sm:justify-start mt-2 text-purple-400">
                <Mail className="h-4 w-4 mr-2" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <div className="mt-1 flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-800">{user?.name}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Email Address</label>
                <div className="mt-1 flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-800">{user?.email}</p>
                </div>
              </div>
              
              {/* <div>
                <label className="block text-sm font-medium text-gray-500">Account Created</label>
                <div className="mt-1 flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-800">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div> */}
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h3>
            
            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;