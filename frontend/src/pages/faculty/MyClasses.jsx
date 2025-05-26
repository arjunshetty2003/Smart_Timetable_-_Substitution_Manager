import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, MapPin, Users, Search, Filter, Calendar, ChevronLeft, ChevronRight, X, AlertTriangle, CheckCircle, Plus, Eye, Edit } from 'lucide-react';
import { classesAPI, timetablesAPI, substitutionsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MyClasses = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'classes'
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  useEffect(() => {
    fetchMyClasses();
    fetchMyTimetables();
  }, []);

  const fetchMyClasses = async () => {
    try {
      setLoading(true);
      const response = await classesAPI.getAll({ facultyId: user._id });
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      setError('Failed to fetch classes');
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTimetables = async () => {
    try {
      const response = await timetablesAPI.getAll({ facultyId: user._id });
      if (response.data.success) {
        setTimetables(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching timetables:', error);
    }
  };

  const handleCancelClass = async () => {
    try {
      const substitutionData = {
        date: new Date().toISOString().split('T')[0],
        originalFacultyId: user._id,
        reason: `Class cancelled: ${cancelReason}`,
        status: 'cancelled',
        subjectId: selectedClass.subjectId?._id,
        timeSlot: `${selectedClass.startTime} - ${selectedClass.endTime}`,
        classroom: selectedClass.room
      };

      await substitutionsAPI.create(substitutionData);
      setSuccess('Class cancellation request submitted successfully');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedClass(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to submit cancellation request');
      console.error('Error cancelling class:', error);
    }
  };

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDaySchedule = (dayName) => {
    return timetables.filter(t => 
      t.day?.toLowerCase() === dayName.toLowerCase()
    );
  };

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = filterSemester === 'all' || classItem.semester.toString() === filterSemester;
    return matchesSearch && matchesSemester;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Classes & Schedule</h1>
            <p className="text-gray-600">View your teaching schedule and manage your classes</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'weekly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Weekly View
            </button>
            <button
              onClick={() => setViewMode('classes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'classes' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-2" />
              Classes View
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {viewMode === 'weekly' ? (
        // Weekly Timetable View
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Week Navigation */}
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium text-gray-700">
                Week of {formatDate(getWeekDates(currentWeek)[0])}
              </span>
              <button
                onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Timetable Grid */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Time
                  </th>
                  {days.map(day => (
                    <th key={day} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.map(time => (
                  <tr key={time} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatTime(time)}
                    </td>
                    {days.map(day => {
                      const dayClasses = getDaySchedule(day).filter(t => 
                        t.startTime === time
                      );
                      return (
                        <td key={`${day}-${time}`} className="px-4 py-4 whitespace-nowrap">
                          {dayClasses.map(classItem => (
                            <div key={classItem._id} className="bg-blue-100 border-l-4 border-blue-500 p-2 rounded text-xs mb-1">
                              <div className="font-medium text-blue-900">
                                {classItem.subjectId?.subjectName || 'Subject'}
                              </div>
                              <div className="text-blue-700">
                                {classItem.classId?.className || 'Class'}
                              </div>
                              <div className="text-blue-600 flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {classItem.room || 'Room TBA'}
                              </div>
                              <div className="flex gap-1 mt-2">
                                <button
                                  onClick={() => {
                                    setSelectedClass({
                                      ...classItem,
                                      date: new Date().toISOString().split('T')[0]
                                    });
                                    setShowCancelModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-800 p-1 rounded"
                                  title="Cancel Class"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Classes List View
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Semesters</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classItem) => (
              <div key={classItem._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{classItem.className}</h3>
                      <p className="text-sm text-gray-500">{classItem.courseCode}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{classItem.department}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Semester {classItem.semester}</span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setViewMode('weekly')}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Schedule
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center justify-center">
                        <Edit className="h-4 w-4 mr-1" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredClasses.length === 0 && !loading && (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Found</h3>
              <p className="text-gray-500">
                {searchTerm || filterSemester !== 'all' 
                  ? 'No classes match your current filters.' 
                  : 'You have no classes assigned yet.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cancel Class Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-1/2 lg:w-1/3 shadow-xl rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Cancel Class</h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedClass(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900">Class Details:</h4>
                <p className="text-sm text-gray-600">
                  {selectedClass?.subjectId?.subjectName} - {selectedClass?.classId?.className}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedClass?.day} {formatTime(selectedClass?.startTime)} - {formatTime(selectedClass?.endTime)}
                </p>
                <p className="text-sm text-gray-600">Room: {selectedClass?.room}</p>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Please provide a reason for cancelling this class..."
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedClass(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelClass}
                disabled={!cancelReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClasses; 