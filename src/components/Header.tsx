import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import inkwireLogo from '../assets/inkwire_squiggle_dark.png';

export default function Header() {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('Header must be used within an AuthProvider');
  }

  const { user, logout } = context;

  const onLogout = (): void => {
    logout();
    sessionStorage.removeItem('inkwire_resources');
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Title */}
          <div className="flex items-center space-x-2">
            <img
              src={inkwireLogo}
              alt="Inkwire Logo"
              className="h-12 w-auto"
            />
            <h1 className="text-lg font-bold text-gray-900 leading-none">
              Vector CMS
            </h1>
          </div>

          {/* User Info and Logout (conditionally shown) */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">{user.email}</div>
              <Button
                variant="outline"
                onClick={onLogout}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
