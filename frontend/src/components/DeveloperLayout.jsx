import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store,
  UserPlus,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Code,
  FileText,
  CreditCard
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { useLogoutMutation } from '../store/services/authApi';
import { DeveloperProtectedRoute } from './DeveloperProtectedRoute';
import toast from 'react-hot-toast';
import MobileNavigation from './MobileNavigation';

const developerNavigation = [
  { name: 'Dashboard', href: '/developer/dashboard', icon: LayoutDashboard },
  { type: 'divider' },
  { type: 'heading', name: 'Shop Management', color: 'bg-blue-500' },
  { name: 'Shops', href: '/developer/shops', icon: Store },
  { name: 'Create Shop', href: '/developer/shops/create', icon: Store },
  { type: 'divider' },
  { type: 'heading', name: 'Admin Management', color: 'bg-green-500' },
  { name: 'Create Admin', href: '/developer/admins/create', icon: UserPlus },
  { name: 'All Admins', href: '/developer/admins', icon: Users },
  { type: 'divider' },
  { type: 'heading', name: 'Subscription Management', color: 'bg-purple-500' },
  { name: 'Plans', href: '/developer/plans', icon: Shield },
  { name: 'Subscriptions', href: '/developer/subscriptions', icon: CreditCard },
  { type: 'divider' },
  { name: 'Settings', href: '/developer/settings', icon: Settings },
];

export const DeveloperLayout = ({ children }) => {
  return (
    <DeveloperProtectedRoute>
      <DeveloperLayoutContent>{children}</DeveloperLayoutContent>
    </DeveloperProtectedRoute>
  );
};

const DeveloperLayoutContent = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      // Continue with logout even if API call fails
    }
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/developer/login');
  };

  const handleNavigationClick = (item) => {
    if (item.href) {
      navigate(item.href);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileNavigation user={user} onLogout={handleLogout} />
      
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Code className="h-6 w-6 text-gray-800" />
              <h1 className="text-xl font-bold text-gray-900">Developer Portal</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {developerNavigation.map((item, index) => {
              if (item.type === 'divider') {
                return <div key={`divider-${index}`} className="my-2 border-t border-gray-200"></div>;
              }
              
              if (item.type === 'heading') {
                return (
                  <div key={`heading-${index}`} className={`${item.color} text-white px-3 py-2 mt-3 mb-1 rounded-md text-xs font-bold uppercase tracking-wider`}>
                    {item.name}
                  </div>
                );
              }
              
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    handleNavigationClick(item);
                    setSidebarOpen(false);
                  }}
                  className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Code className="h-6 w-6 text-gray-800" />
              <h1 className="text-xl font-bold text-gray-900">Developer Portal</h1>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {developerNavigation.map((item, index) => {
              if (item.type === 'divider') {
                return <div key={`divider-${index}`} className="my-2 border-t border-gray-200"></div>;
              }
              
              if (item.type === 'heading') {
                return (
                  <div key={`heading-${index}`} className={`${item.color} text-white px-3 py-2 mt-3 mb-1 rounded-md text-xs font-bold uppercase tracking-wider`}>
                    {item.name}
                  </div>
                );
              }
              
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigationClick(item)}
                  className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>
          
          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {developerNavigation.find(item => item.href === location.pathname)?.name || 'Developer Portal'}
            </h2>
          </div>
        </div>
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
