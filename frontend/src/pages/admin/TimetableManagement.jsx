import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, Clock, Book, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { timetablesAPI, classesAPI, subjectsAPI, usersAPI } from '../../services/api';

const TimetableManagement = () => {
  const [timetables, setTimetables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState('');

  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    facultyId: '',
    day: '',
    startTime: '',
    endTime: '',
    room: '',
    semester: '',
    academicYear: new Date().getFullYear(),
    isActive: true
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchTimetables();
  }, [selectedClass]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [timetablesRes, classesRes, subjectsRes, usersRes] = await Promise.all([
        timetablesAPI.getAll(),
        classesAPI.getAll(),
        subjectsAPI.getAll(),
        usersAPI.getAll()
      ]);

      console.log('Initial fetch responses:', {
        timetables: timetablesRes.data,
        classes: classesRes.data,
        subjects: subjectsRes.data,
        users: usersRes.data
      });

      const timetablesData = timetablesRes.data.data || timetablesRes.data.timetables || [];
      const classesData = classesRes.data.data || classesRes.data.classes || [];
      const subjectsData = subjectsRes.data.data || subjectsRes.data.subjects || [];
      const facultyData = usersRes.data.data?.filter(user => user.role === 'faculty') || usersRes.data.users?.filter(user => user.role === 'faculty') || [];
      
      console.log('Parsed data:', {
        timetablesCount: timetablesData.length,
        classesCount: classesData.length,
        subjectsCount: subjectsData.length,
        facultyCount: facultyData.length
      });

      setTimetables(timetablesData);
      setClasses(classesData);
      setSubjects(subjectsData);
      setFaculty(facultyData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showErrorMessage('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetables = async () => {
    try {
      console.log('=== FETCHING TIMETABLES ===');
      const params = {};
      if (selectedClass) params.classId = selectedClass;
      console.log('Fetch params:', params);
      
      const response = await timetablesAPI.getAll(params);
      console.log('Fetch timetables response:', response.data);
      // Backend returns data in response.data.data, not response.data.timetables
      const timetableData = response.data.data || response.data.timetables || [];
      console.log('Setting timetables to:', timetableData);
      console.log('Timetable count:', timetableData.length);
      setTimetables(timetableData);
    } catch (error) {
      console.error('Error fetching timetables:', error);
      showErrorMessage('Failed to fetch timetables');
    }
  };

  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');

      if (editingTimetable) {
        await timetablesAPI.update(editingTimetable._id, formData);
        showSuccessMessage('Timetable entry updated successfully!');
      } else {
        await timetablesAPI.create(formData);
        showSuccessMessage('New timetable entry added successfully!');
      }

      setShowModal(false);
      setEditingTimetable(null);
      resetForm();
      fetchTimetables();
    } catch (error) {
      showErrorMessage(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleEdit = (timetable) => {
    setEditingTimetable(timetable);
    setFormData({
      classId: timetable.classId?._id || '',
      subjectId: timetable.subjectId?._id || '',
      facultyId: timetable.facultyId?._id || '',
      day: timetable.day || '',
      startTime: timetable.startTime || '',
      endTime: timetable.endTime || '',
      room: timetable.room || '',
      semester: timetable.semester || '',
      academicYear: timetable.academicYear || new Date().getFullYear(),
      isActive: timetable.isActive !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id, timetableName) => {
    if (window.confirm(`Are you sure you want to delete "${timetableName}"? This action cannot be undone.`)) {
      try {
        console.log('=== FRONTEND DELETE REQUEST ===');
        console.log('Deleting timetable ID:', id);
        console.log('Timetable name:', timetableName);
        
        setDeleteLoading(id);
        const response = await timetablesAPI.delete(id);
        console.log('Delete response:', response);
        
        showSuccessMessage('Timetable entry deleted successfully!');
        
        // Immediately remove from local state for instant feedback
        setTimetables(prevTimetables => prevTimetables.filter(t => t._id !== id));
        
        // Also fetch fresh data from server
        fetchTimetables();
      } catch (error) {
        console.error('Delete error:', error);
        showErrorMessage(error.response?.data?.message || 'Failed to delete timetable');
      } finally {
        setDeleteLoading('');
      }
    }
  };

  const handleQuickAdd = () => {
    resetForm();
    setEditingTimetable(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      classId: '',
      subjectId: '',
      facultyId: '',
      day: '',
      startTime: '',
      endTime: '',
      room: '',
      semester: '',
      academicYear: new Date().getFullYear(),
      isActive: true
    });
  };

  const filteredTimetables = timetables.filter(timetable => {
    const matchesSearch = 
      (timetable.subjectId?.subjectName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (timetable.facultyId?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (timetable.room?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (timetable.day?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatTime = (time) => {
    if (!time) return '';
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Timetables...</h2>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Individual Timetable Management</h2>
            <p className="text-gray-600">Add, edit, and delete individual timetable entries</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleQuickAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Individual Entry</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by subject, faculty, room, or day..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-field"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>
                  {cls.className} - {cls.department}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600">Total Entries</div>
            <div className="text-xl font-semibold text-blue-900">{timetables.length}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600">Active Entries</div>
            <div className="text-xl font-semibold text-green-900">
              {timetables.filter(t => t.isActive).length}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Filtered Results</div>
            <div className="text-xl font-semibold text-gray-900">{filteredTimetables.length}</div>
          </div>
        </div>
      </div>

      {/* Timetables Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Individual Timetable Entries</h3>
          <p className="text-sm text-gray-600">Each row represents a single class session that can be individually managed</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject & Faculty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class & Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Individual Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTimetables.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No timetable entries found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start by adding individual class sessions to build your timetable.
                    </p>
                    <button
                      onClick={handleQuickAdd}
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Entry
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTimetables.map((timetable) => (
                  <tr key={timetable._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Book className="h-5 w-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {timetable.subjectId?.subjectName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {timetable.facultyId?.name || 'No faculty assigned'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {timetable.day}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(timetable.startTime)} - {formatTime(timetable.endTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {timetable.classId?.className || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Room: {timetable.room || 'TBA'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Semester {timetable.semester}
                      </div>
                      <div className="text-sm text-gray-500">
                        AY {timetable.academicYear}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        timetable.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {timetable.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(timetable)}
                          className="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-indigo-700 text-xs font-medium rounded-md hover:bg-indigo-50 transition-colors"
                          title="Edit this entry"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(
                            timetable._id, 
                            `${timetable.subjectId?.subjectName || 'N/A'} - ${timetable.day} ${formatTime(timetable.startTime)}`
                          )}
                          disabled={deleteLoading === timetable._id}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 text-red-700 text-xs font-medium rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete this entry"
                        >
                          {deleteLoading === timetable._id ? (
                            <>
                              <div className="animate-spin h-3 w-3 mr-1 border border-red-700 border-t-transparent rounded-full"></div>
                              Deleting
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-2/3 shadow-xl rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingTimetable ? 'Edit Individual Timetable Entry' : 'Add Individual Timetable Entry'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {editingTimetable 
                    ? 'Modify the details of this individual class session' 
                    : 'Create a new individual class session for the timetable'
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTimetable(null);
                  resetForm();
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({...formData, classId: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>
                        {cls.className} - {cls.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject._id} value={subject._id}>
                        {subject.subjectName} ({subject.subjectCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faculty *
                  </label>
                  <select
                    value={formData.facultyId}
                    onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select Faculty</option>
                    {faculty.map(fac => (
                      <option key={fac._id} value={fac._id}>
                        {fac.name} - {fac.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day *
                  </label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({...formData, day: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select Day</option>
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <select
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select Start Time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{formatTime(time)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <select
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select End Time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{formatTime(time)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room *
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    className="input-field"
                    placeholder="e.g., A101, Lab-01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester *
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year *
                  </label>
                  <input
                    type="number"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({...formData, academicYear: parseInt(e.target.value)})}
                    className="input-field"
                    min="2020"
                    max="2030"
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mt-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {editingTimetable 
                      ? 'Update this individual class session in the timetable' 
                      : 'Add this as a new individual class session to the timetable'
                    }
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingTimetable(null);
                        resetForm();
                        setError('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                    >
                      {editingTimetable ? (
                        <>
                          <Edit className="h-4 w-4" />
                          <span>Update Individual Entry</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span>Add Individual Entry</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableManagement; 