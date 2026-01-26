import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, UserPlus, Users, Settings, Code, Shield } from 'lucide-react';
import { useGetShopsQuery } from '../store/services/shopsApi';

export const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetShopsQuery();
  
  const shops = data?.shops || [];
  const totalShops = shops.length;
  const activeShops = shops.filter(shop => shop.status === 'active').length;

  const stats = [
    {
      name: 'Total Shops',
      value: totalShops.toString(),
      icon: Store,
      color: 'bg-blue-500',
      href: '/developer/shops',
    },
    {
      name: 'Active Shops',
      value: activeShops.toString(),
      icon: Store,
      color: 'bg-green-500',
      href: '/developer/shops',
    },
    {
      name: 'Total Admins',
      value: '0', // TODO: Fetch from API when admin management is implemented
      icon: Users,
      color: 'bg-purple-500',
      href: '/developer/admins',
    },
  ];

  const quickActions = [
    {
      name: 'Create New Shop',
      description: 'Add a new shop to the system',
      icon: Store,
      href: '/developer/shops/create',
      color: 'bg-blue-500',
    },
    {
      name: 'Create Admin Account',
      description: 'Create admin account for a shop',
      icon: UserPlus,
      href: '/developer/admins/create',
      color: 'bg-green-500',
    },
    {
      name: 'Manage Shops',
      description: 'View and manage all shops',
      icon: Settings,
      href: '/developer/shops',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Code className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Developer Portal</h1>
            <p className="text-gray-600 mt-1">Manage shops and admin accounts</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            onClick={() => navigate(stat.href)}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <div
              key={action.name}
              onClick={() => navigate(action.href)}
              className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className={`${action.color} rounded-lg p-2`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">{action.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Developer Access</h3>
            <p className="text-sm text-blue-700 mt-2">
              As a developer, you can create shops, manage admin accounts, and control shop statuses.
              You do not have access to shop POS data for security and isolation purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
