import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Users, AlertCircle, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { schedulesAPI } from '../services/api';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await schedulesAPI.getFacultyDashboard();
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to fetch faculty dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = dashboardData ? [
    {
      name: 'Today\'s Classes',
      value: dashboardData.stats.todayClasses?.toString() || '0',
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      name: 'This Week',
      value: dashboardData.stats.weekClasses?.toString() || '0',
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      name: 'Pending Substitutions',
      value: dashboardData.stats.pendingSubstitutions?.toString() || '0',
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
    {
      name: 'Next Class',
      value: dashboardData.stats.nextClass || 'None today',
      icon: Clock,
      color: 'bg-purple-500',
    },
  ] : [];

  const formatTime = (startTime, endTime) => {
    if (startTime && endTime) {
      return `${startTime} - ${endTime}`;
    }
    return 'N/A';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-600">
          Manage your classes and substitutions from here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Today's Classes</h3>
            <p className="text-sm text-gray-500">Your teaching schedule for today</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData?.todayClasses?.length > 0 ? (
                dashboardData.todayClasses.map((classItem, index) => (
                  <div
                    key={classItem._id || index}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      classItem.status === 'substituted' 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatTime(classItem.startTime, classItem.endTime)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {classItem.subject}
                        </p>
                        <p className="text-sm text-gray-500">
                          {classItem.classCode} • {classItem.room}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          classItem.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {classItem.status === 'active' ? 'Active' : 'Substituted'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">No classes scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Substitution Requests */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Substitution Requests</h3>
            <p className="text-sm text-gray-500">Pending and recent requests</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData?.substitutionRequests?.length > 0 ? (
                dashboardData.substitutionRequests.map((request, index) => (
                  <div
                    key={request._id || index}
                    className="flex items-center justify-between p-4 rounded-lg border bg-orange-50 border-orange-200"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {request.subject}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(request.date)} • {formatTime(request.startTime, request.endTime)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Substitute: {request.facultyId?.name || 'TBD'}
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {request.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">No pending substitution requests</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="btn-primary">
            <Calendar className="h-4 w-4 mr-2" />
            View Full Schedule
          </button>
          <button className="btn-secondary">
            <Clock className="h-4 w-4 mr-2" />
            Request Substitution
          </button>
          <button className="btn-secondary">
            <Users className="h-4 w-4 mr-2" />
            Manage Availability
          </button>
          <button className="btn-secondary">
            <BookOpen className="h-4 w-4 mr-2" />
            Create Special Class
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard; 