import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import context providers
import { AuthProvider } from './context/AuthContext';
import { MeetingProvider } from './context/MeetingContext';

// Import pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MeetingDetails from './pages/MeetingDetails';
import CreateMeeting from './pages/CreateMeeting';
import EditMeeting from './pages/EditMeeting';
import Profile from './pages/Profile';

// Import components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <MeetingProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
                border: '1px solid #8b5cf6',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#a855f7',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="meetings/create" element={<CreateMeeting />} />
              <Route path="meetings/:id" element={<MeetingDetails />} />
              <Route path="meetings/:id/edit" element={<EditMeeting />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </MeetingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;