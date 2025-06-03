import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Filter, AlertCircle } from 'lucide-react';
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
      
      // Check if the response has data, even if success is false
      if (response.data && (response.data.success || response.data.data)) {
        setSchedules(response.data.data || []);
      } else {
        // Fallback to empty array if no data
        setSchedules([]);
        setError('No schedule data available for the selected date');
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
      // Set empty schedules array on error
      setSchedules([]);
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
      <div className="p-6 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule</h2>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Daily Schedule</h2>
        <p className="text-gray-600 mb-6">View today's classes and any special events or substitutions</p>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="substituted">Substituted</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Failed to fetch schedules</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button 
                  onClick={fetchSchedules}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800">No Schedules Found</h3>
            <p className="text-gray-600 mt-2">There are no schedules for the selected date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  schedule.status === 'cancelled' ? 'bg-red-50 border-red-200' : 
                  schedule.status === 'substituted' ? 'bg-yellow-50 border-yellow-200' : 
                  'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex flex-wrap gap-4 justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {schedule.subject?.subjectName || schedule.subjectId?.subjectName || 'Unknown Subject'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {(schedule.subject?.subjectCode && `${schedule.subject.subjectCode} - `) || 
                       (schedule.subjectId?.subjectCode && `${schedule.subjectId.subjectCode} - `)}
                      {schedule.class?.name || schedule.classId?.name || schedule.classId?.className || 'Unknown Class'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {schedule.startTime} - {schedule.endTime}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {schedule.faculty?.name || schedule.facultyId?.name || 'No Faculty Assigned'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {schedule.room || schedule.classroom || 'No Room Assigned'}
                    </span>
                  </div>
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      schedule.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      schedule.status === 'substituted' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {schedule.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage; 