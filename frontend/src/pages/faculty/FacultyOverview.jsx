import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CalendarX, Plus, X, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { 
  timetablesAPI, substitutionsAPI, specialClassesAPI, subjectsAPI 
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const FacultyOverview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Data states
  const [timetables, setTimetables] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [defaultSubject, setDefaultSubject] = useState(null);
  
  // Modal states
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Form states
  const [unavailableForm, setUnavailableForm] = useState({
    date: '',
    time: '',
    reason: ''
  });
  
  const [addClassForm, setAddClassForm] = useState({
    date: '',
    time: '',
    reason: ''
  });
  
  const [cancelForm, setCancelForm] = useState({
    date: '',
    reason: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    fetchTimetables();
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      console.log('Fetching subjects...');
      const response = await subjectsAPI.getAll();
      console.log('Subjects response:', response.data);
      
      if (response.data.success) {
        setSubjects(response.data.data || []);
        
        // If we have subjects, set the default subject
        if (response.data.data && response.data.data.length > 0) {
          setDefaultSubject(response.data.data[0]);
          console.log('Default subject set:', response.data.data[0]);
        } else {
          // Create a fallback default subject for operations that require one
          const fallbackSubject = {
            _id: 'default',
            subjectName: 'Default Subject',
            subjectCode: 'DEFAULT',
            credits: 0,
            department: user?.department || 'General'
          };
          setDefaultSubject(fallbackSubject);
          console.log('No subjects found, using fallback subject');
        }
      } else {
        console.warn('No subjects found or response failed');
        // Create a fallback default subject
        const fallbackSubject = {
          _id: 'default',
          subjectName: 'Default Subject',
          subjectCode: 'DEFAULT',
          credits: 0,
          department: user?.department || 'General'
        };
        setDefaultSubject(fallbackSubject);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Instead of showing an error, create a fallback subject
      const fallbackSubject = {
        _id: 'default',
        subjectName: 'Default Subject',
        subjectCode: 'DEFAULT',
        credits: 0,
        department: user?.department || 'General'
      };
      setDefaultSubject(fallbackSubject);
      console.log('Error fetching subjects, using fallback subject');
    }
  };

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const response = await timetablesAPI.getAll({ facultyId: user._id });
      if (response.data.success) {
        setTimetables(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching timetables:', error);
      setError('Failed to load timetables');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message, isError = false) => {
    if (isError) {
      setError(message);
      setTimeout(() => setError(''), 5000);
    } else {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  // 1. Mark Unavailability
  const handleMarkUnavailable = async (e) => {
    e.preventDefault();
    try {
      if (!defaultSubject) {
        showMessage('No subjects available. Please contact admin.', true);
        return;
      }

      // Create a substitution request
      await substitutionsAPI.create({
        date: unavailableForm.date,
        originalFacultyId: user._id,
        reason: `Unavailable: ${unavailableForm.reason}`,
        timeSlot: unavailableForm.time,
        status: 'pending',
        // Required fields with default values for unavailability
        subjectId: defaultSubject._id,
        classroom: 'TBA' // To Be Announced
      });
      
      showMessage('Unavailability marked successfully!');
      setShowUnavailableModal(false);
      setUnavailableForm({ date: '', time: '', reason: '' });
    } catch (error) {
      console.error('Mark unavailable error:', error);
      showMessage('Failed to mark unavailability. Please try again.', true);
    }
  };

  // 2. Add Class
  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      if (!defaultSubject) {
        showMessage('No subjects available. Please contact admin.', true);
        return;
      }

      // Calculate end time (1 hour after start time)
      const startTimeParts = addClassForm.time.split(':').map(Number);
      let endHour = startTimeParts[0] + 1;
      const endMinute = startTimeParts[1];
      
      // Handle hour overflow
      if (endHour >= 24) {
        endHour = 23;
      }
      
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      // Create special class with required fields
      const specialClassData = {
        classCode: `SPECIAL-${Date.now().toString().slice(-6)}`,
        subject: defaultSubject.subjectName || 'Special Class',
        subjectId: defaultSubject._id,
        facultyId: user._id,
        date: addClassForm.date,
        startTime: addClassForm.time,
        endTime: endTime,
        room: 'TBA',
        description: addClassForm.reason,
        type: 'extra_class',
        maxStudents: 50,
        status: 'scheduled',
        createdBy: user._id
      };
      
      console.log('Creating special class with data:', specialClassData);
      
      const response = await specialClassesAPI.create(specialClassData);
      
      if (response.data.success) {
        showMessage('Special class added successfully!');
        setShowAddClassModal(false);
        setAddClassForm({ date: '', time: '', reason: '' });
        // Refresh timetables to show the new class
        fetchTimetables();
      } else {
        throw new Error(response.data.message || 'Failed to add class');
      }
    } catch (error) {
      console.error('Add class error:', error);
      showMessage(`Failed to add class: ${error.response?.data?.message || error.message}`, true);
    }
  };

  // 3. Cancel Class
  const handleCancelClass = async (e) => {
    e.preventDefault();
    try {
      if (!defaultSubject) {
        showMessage('No subjects available. Please contact admin.', true);
        return;
      }

      // Create a cancellation request
      await substitutionsAPI.create({
        date: cancelForm.date,
        originalFacultyId: user._id,
        reason: `Class cancelled: ${cancelForm.reason}`,
        status: 'pending', // Use 'pending' status for cancellation requests
        // Required fields with default values for cancellation
        timeSlot: '00:00', // Default time slot
        subjectId: defaultSubject._id,
        classroom: 'TBA' // To Be Announced
      });
      
      showMessage('Class cancellation submitted successfully!');
      setShowCancelModal(false);
      setCancelForm({ date: '', reason: '' });
    } catch (error) {
      console.error('Cancel class error:', error);
      showMessage('Failed to cancel class. Please try again.', true);
    }
  };

  const getTodayClasses = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return timetables.filter(t => t.day === today);
  };

  const getDaySchedule = (dayName) => {
    return timetables.filter(t => t.day?.toLowerCase() === dayName.toLowerCase());
  };

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
      {/* Header with 3 Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Faculty Dashboard</h1>
        
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            <strong>Debug:</strong> Subjects: {subjects.length}, 
            Default Subject: {defaultSubject ? defaultSubject.subjectName : 'None'}
            {defaultSubject && defaultSubject._id === 'default' && ' (Fallback)'}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Mark Unavailable */}
          <button
            onClick={() => setShowUnavailableModal(true)}
            className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left"
          >
            <CalendarX className="h-8 w-8 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Mark Unavailable</h3>
            <p className="text-sm text-gray-600">Set date/time when you're not available</p>
          </button>

          {/* 2. Add Class */}
          <button
            onClick={() => setShowAddClassModal(true)}
            className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <Plus className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Add Class</h3>
            <p className="text-sm text-gray-600">Schedule a special/rescheduled class</p>
          </button>

          {/* 3. Cancel Class */}
          <button
            onClick={() => setShowCancelModal(true)}
            className="p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left"
          >
            <X className="h-8 w-8 text-red-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Cancel Class</h3>
            <p className="text-sm text-gray-600">Cancel a scheduled class</p>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <div>
            <p className="text-red-700 font-medium">{error}</p>
            <p className="text-red-600 text-sm mt-1">Please try again or contact support if the issue persists.</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* 1. View Assigned Timetable - Simple Weekly Grid */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Your Weekly Schedule</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                {days.map(day => (
                  <th key={day} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map(time => (
                <tr key={time}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {time}
                  </td>
                  {days.map(day => {
                    const dayClasses = getDaySchedule(day).filter(t => t.startTime === time);
                    return (
                      <td key={`${day}-${time}`} className="px-4 py-4 whitespace-nowrap">
                        {dayClasses.map(classItem => (
                          <div key={classItem._id} className="bg-blue-100 border-l-4 border-blue-500 p-2 rounded text-xs">
                            <div className="font-medium text-blue-900">
                              {classItem.subjectId?.subjectName || 'Subject'}
                            </div>
                            <div className="text-blue-700">
                              {classItem.classId?.className || 'Class'}
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

      {/* Mark Unavailable Modal */}
      {showUnavailableModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-1/2 lg:w-1/3 shadow-xl rounded-lg bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Mark as Unavailable</h3>
            <form onSubmit={handleMarkUnavailable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={unavailableForm.date}
                  onChange={(e) => setUnavailableForm({...unavailableForm, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                <input
                  type="time"
                  value={unavailableForm.time}
                  onChange={(e) => setUnavailableForm({...unavailableForm, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea
                  value={unavailableForm.reason}
                  onChange={(e) => setUnavailableForm({...unavailableForm, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows="3"
                  placeholder="Why are you unavailable?"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUnavailableModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Mark Unavailable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-1/2 lg:w-1/3 shadow-xl rounded-lg bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Special Class</h3>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={addClassForm.date}
                  onChange={(e) => setAddClassForm({...addClassForm, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                <input
                  type="time"
                  value={addClassForm.time}
                  onChange={(e) => setAddClassForm({...addClassForm, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea
                  value={addClassForm.reason}
                  onChange={(e) => setAddClassForm({...addClassForm, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  placeholder="What is this class for?"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Class Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-1/2 lg:w-1/3 shadow-xl rounded-lg bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cancel Class</h3>
            <form onSubmit={handleCancelClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={cancelForm.date}
                  onChange={(e) => setCancelForm({...cancelForm, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea
                  value={cancelForm.reason}
                  onChange={(e) => setCancelForm({...cancelForm, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="3"
                  placeholder="Why are you cancelling this class?"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancel Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyOverview; 