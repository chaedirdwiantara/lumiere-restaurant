import React from 'react';
import { useLocation } from 'react-router-dom';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { admin } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin/dashboard') return 'Dashboard';
    if (path.startsWith('/admin/gallery')) return 'Gallery Management';
    if (path.startsWith('/admin/home-content')) return 'Home Content';
    if (path.startsWith('/admin/settings')) return 'Settings';
    return 'Admin Panel';
  };

  const getPageDescription = () => {
    const path = location.pathname;
    if (path === '/admin/dashboard') return 'Overview of your cinema management system';
    if (path.startsWith('/admin/gallery')) return 'Manage your image gallery and media files';
    if (path.startsWith('/admin/home-content')) return 'Edit homepage content and sections';
    if (path.startsWith('/admin/settings')) return 'Configure system settings and preferences';
    return 'Manage your cinema website';
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-white">{getPageTitle()}</h1>
          <p className="text-sm text-gray-400 mt-1">{getPageDescription()}</p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-64 pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {admin?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">
                {admin?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-400">
                {admin?.role || 'Administrator'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;