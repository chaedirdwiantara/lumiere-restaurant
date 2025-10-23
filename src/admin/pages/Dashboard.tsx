import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  PhotoIcon, 
  DocumentTextIcon, 
  EyeIcon, 
  ArrowTrendingUpIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { admin } = useAuth();

  // Simple mock data - no API calls for now
  const stats = [
    {
      name: 'Total Images',
      value: 156,
      icon: PhotoIcon,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Views',
      value: 12450,
      icon: EyeIcon,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'Content Sections',
      value: 8,
      icon: DocumentTextIcon,
      change: '+2',
      changeType: 'positive' as const,
    },
    {
      name: 'Active Users',
      value: 234,
      icon: UserGroupIcon,
      change: '+15%',
      changeType: 'positive' as const,
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'upload',
      description: 'New image uploaded to gallery',
      timestamp: new Date().toISOString(),
      user: 'Admin'
    },
    {
      id: '2',
      type: 'edit',
      description: 'Home content updated',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Admin'
    },
    {
      id: '3',
      type: 'view',
      description: 'Gallery viewed by visitor',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: 'Visitor'
    }
  ];

  const quickActions = [
    { id: '1', title: 'Upload Images', description: 'Add new images to gallery', href: '/admin/gallery' },
    { id: '2', title: 'Edit Home Content', description: 'Update homepage sections', href: '/admin/home-content' },
    { id: '3', title: 'View Analytics', description: 'Check website statistics', href: '/admin/analytics' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return PhotoIcon;
      case 'edit':
        return DocumentTextIcon;
      case 'view':
        return EyeIcon;
      default:
        return ClockIcon;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {admin?.email || 'Admin'}!</h1>
        <p className="text-amber-100">
          Here's what's happening with your cinema website today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-white">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Activities</h2>
            <span className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded-full">
              {recentActivities.length} activities
            </span>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'upload' ? 'bg-green-900' :
                    activity.type === 'edit' ? 'bg-yellow-900' : 'bg-blue-900'
                  }`}>
                    <ActivityIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{activity.description}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-400">
                      <span>{activity.user}</span>
                      <span className="mx-1">•</span>
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Quick Actions</h2>
          <div className="space-y-4">
            {quickActions.map((action) => (
              <a
                key={action.id}
                href={action.href}
                className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {action.description}
                    </p>
                  </div>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;