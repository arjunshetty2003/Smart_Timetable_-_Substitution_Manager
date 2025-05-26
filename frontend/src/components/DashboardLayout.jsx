import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home,
  Clock,
  BookOpen,
  UserCheck,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Schedule', href: '/schedule', icon: Calendar },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'User Management', href: '/admin/users', icon: Users },
          { name: 'Subject Management', href: '/admin/subjects', icon: BookOpen },
          { name: 'Class Management', href: '/admin/classes', icon: UserCheck },
          { name: 'Substitutions', href: '/admin/substitutions', icon: Clock },
          { name: 'Timetable Management', href: '/admin/timetables', icon: Calendar },
        ];
      case 'faculty':
        return [
          ...baseItems,
        ];
      case 'student':
        return [
          ...baseItems,
          { name: 'My Timetable', href: '/schedule', icon: BookOpen },
          { name: 'Special Classes', href: '/student/special-classes', icon: UserCheck },
        ];
      default:
        return baseItems;
    }
  };

  const navigation = getNavigationItems();

  const handleLogout = async () => {
    await logout();
  };

  const Sidebar = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-700">
        <Calendar className="h-8 w-8 text-white" />
        <span className="ml-2 text-white font-semibold text-lg">Smart Timetable</span>
      </div>
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-800 text-white'
                    : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="flex-shrink-0 border-t border-primary-800 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-primary-200 capitalize">{user?.role}</p>
            </div>
          </div>
          
          <div className="mt-3 space-y-1">
            <button className="group flex items-center w-full px-2 py-2 text-sm font-medium text-primary-100 rounded-md hover:bg-primary-600 hover:text-white transition-colors">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </button>
            <button 
              onClick={handleLogout}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium text-primary-100 rounded-md hover:bg-primary-600 hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary-700">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <Sidebar mobile />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-full bg-primary-700">
            <Sidebar />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                {user?.role === 'admin' && 'Admin Dashboard'}
                {user?.role === 'faculty' && 'Faculty Dashboard'}
                {user?.role === 'student' && 'Student Dashboard'}
              </h1>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <Bell className="h-6 w-6" />
              </button>
              
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-base font-medium text-gray-800">{user?.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{user?.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 