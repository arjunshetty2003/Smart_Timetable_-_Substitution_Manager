import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, BookOpen, AlertCircle, CheckCircle, UserPlus, UserMinus } from 'lucide-react';
import { specialClassesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const SpecialClasses = () => {
  const { user } = useAuth();
  const [specialClasses, setSpecialClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSpecialClasses();
  }, []);

  const fetchSpecialClasses = async () => {
    try {
      setLoading(true);
      const response = await specialClassesAPI.getAll();
      if (response.data.success) {
        setSpecialClasses(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching special classes:', error);
      setError('Failed to load special classes');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (classId) => {
    try {
      setError('');
      setSuccess('');
      const response = await specialClassesAPI.register(classId);
      if (response.data.success) {
        setSuccess('Successfully registered for the special class!');
        fetchSpecialClasses(); // Refresh the list
      }
    } catch (error) {
      console.error('Error registering for special class:', error);
      setError(error.response?.data?.message || 'Failed to register for special class');
    }
  };

  const handleUnregister = async (classId) => {
    try {
      setError('');
      setSuccess('');
      const response = await specialClassesAPI.unregister(classId);
      if (response.data.success) {
        setSuccess('Successfully unregistered from the special class!');
        fetchSpecialClasses(); // Refresh the list
      }
    } catch (error) {
      console.error('Error unregistering from special class:', error);
      setError(error.response?.data?.message || 'Failed to unregister from special class');
    }
  };

  const isRegistered = (specialClass) => {
    return specialClass.registeredStudents?.some(student => 
      student._id === user._id || student._id === user.id
    );
  };

  const canRegister = (specialClass) => {
    const classDate = new Date(specialClass.date);
    const now = new Date();
    return classDate > now && specialClass.status === 'scheduled';
  };

  const filteredClasses = specialClasses.filter(specialClass => {
    const matchesSearch = specialClass.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         specialClass.classCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         specialClass.facultyId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'registered') return matchesSearch && isRegistered(specialClass);
    if (filter === 'available') return matchesSearch && canRegister(specialClass) && !isRegistered(specialClass);
    
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Special Classes</h1>
        <p className="text-gray-600">Browse and register for special classes, workshops, and seminars</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by subject, class code, or faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Classes</option>
              <option value="available">Available</option>
              <option value="registered">My Registrations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Special Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClasses.length > 0 ? (
          filteredClasses.map((specialClass) => (
            <div key={specialClass._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{specialClass.subject}</h3>
                  <p className="text-sm text-gray-500">{specialClass.classCode}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  specialClass.type === 'workshop' ? 'bg-purple-100 text-purple-800' :
                  specialClass.type === 'seminar' ? 'bg-blue-100 text-blue-800' :
                  specialClass.type === 'exam' ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {specialClass.type?.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(specialClass.date)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatTime(specialClass.startTime)} - {formatTime(specialClass.endTime)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {specialClass.room}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {specialClass.facultyId?.name || 'TBA'}
                </div>
                {specialClass.maxStudents && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {specialClass.registeredStudents?.length || 0} / {specialClass.maxStudents} students
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-700 mb-4">{specialClass.description}</p>

              {specialClass.prerequisites && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Prerequisites:</p>
                  <p className="text-sm text-gray-600">{specialClass.prerequisites}</p>
                </div>
              )}

              {specialClass.materials && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Materials Required:</p>
                  <p className="text-sm text-gray-600">{specialClass.materials}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  specialClass.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                  specialClass.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {specialClass.status?.toUpperCase()}
                </span>

                {canRegister(specialClass) && (
                  <div>
                    {isRegistered(specialClass) ? (
                      <button
                        onClick={() => handleUnregister(specialClass._id)}
                        className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Unregister
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(specialClass._id)}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={specialClass.maxStudents && specialClass.registeredStudents?.length >= specialClass.maxStudents}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Register
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No special classes found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialClasses; 