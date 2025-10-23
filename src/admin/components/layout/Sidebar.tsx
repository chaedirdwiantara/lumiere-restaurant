import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  PhotoIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon, exact: true },
  { name: 'Gallery', href: '/admin/gallery', icon: PhotoIcon },
  { name: 'Home Content', href: '/admin/home-content', icon: DocumentTextIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

const Sidebar: React.FC = () => {
  const { logout, admin } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col w-64 bg-gray-900 border-r border-gray-700">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-white font-semibold text-lg">Cycent Cinema</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.href
            : location.pathname.startsWith(item.href);

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {admin?.name || 'Admin'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {admin?.email || 'admin@example.com'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:text-white hover:bg-gray-800 transition-all duration-200"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;