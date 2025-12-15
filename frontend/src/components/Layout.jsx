import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();

  const menuItems = [
    { path: '/chat', label: 'Ask AI', description: 'Get help with anything' },
    { path: '/checkwork', label: 'Check for AI', description: "See if work looks AI-made" },
    { path: '/upload', label: 'Get Assignment Feedback', description: 'Upload and get feedback' },
    { path: '/mywork', label: 'My Work', description: 'See past submissions' }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">EthicalAI</h1>
              <p className="text-xs text-gray-500">Academic Integrity Platform</p>
            </div>
          </Link>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3 px-3">Main Menu</p>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2.5 rounded-lg transition ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </Link>
            ))}
          </div>
        </nav>

        {/* Commitment Section - Plain */}
        <div className="p-4 border-t border-gray-200">
          <div className="p-4">
            <p className="font-semibold text-sm text-gray-900 mb-2">Academic Honesty First</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              We guide, not complete. Every suggestion is transparent and designed to help you learn.
            </p>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <Link 
            to="/profile"
            className={`flex items-center gap-3 mb-3 p-2 rounded-lg transition ${
              location.pathname === '/profile' ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-semibold">
                {currentUser?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Student</p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
            </div>
          </Link>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full text-sm"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
