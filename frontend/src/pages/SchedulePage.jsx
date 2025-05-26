import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Filter } from 'lucide-react';
import { timetablesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SchedulePage = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchSchedules();
  }, [selectedDate, filterStatus]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the day name from selected date
      const dayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
      
      const params = {
        day: dayName,
        ...(user.role === 'faculty' && { facultyId: user._id })
      };
      
      const response = await timetablesAPI.getAll(params);
      if (response.data.success) {
        setSchedules(response.data.data || []);
      } else {
        setError('Failed to fetch timetables');
      }
    } catch (err) {
      console.error('Schedule fetch error:', err);
      if (err.response?.status === 401) {
        setError('Authentication required. Please login again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view schedules.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch schedules');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'substituted':
        return 'bg-yellow-100 text-yellow-800';
      case 'special':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Schedule...</h2>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
            <p className="text-gray-600">View and manage class schedules</p>
          </div>
        </div>

        {/* Filters - Only show for non-student users */}
        {user?.role !== 'student' && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="substituted">Substituted</option>
                <option value="special">Special</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Failed to fetch schedules</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button 
                    onClick={fetchSchedules}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule List */}
      {!error && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Classes for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
          </div>

          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No classes scheduled</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no classes scheduled for the selected date and filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <div key={schedule._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-medium text-gray-900">
                              {schedule.subjectId?.subjectName || 'Subject'}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                              Active
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Class: {schedule.classId?.className || 'Class'}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {schedule.room}
                            </div>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {schedule.facultyId?.name || 'TBA'}
                            </div>
                          </div>
                          {schedule.notes && (
                            <p className="text-sm text-gray-600 mt-2">
                              Note: {schedule.notes}
                            </p>
                          )}
                          {schedule.substituteFacultyId && (
                            <p className="text-sm text-orange-600 mt-2">
                              Substitute: {schedule.substituteFacultyId.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="flex space-x-2">
                        <button className="btn-secondary text-sm">
                          Edit
                        </button>
                        <button className="btn-secondary text-sm text-red-600 hover:text-red-700">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedulePage; 