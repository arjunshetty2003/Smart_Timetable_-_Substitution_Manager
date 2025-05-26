import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Calendar, Clock, MapPin, Users, BookOpen, AlertCircle } from 'lucide-react';
import { specialClassesAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateSpecialClass = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [formData, setFormData] = useState({
    classCode: '',
    subject: '',
    facultyId: user?.role === 'faculty' ? (user._id || user.id) : '',
    date: '',
    startTime: '',
    endTime: '',
    room: '',
    description: '',
    type: 'extra_class',
    maxStudents: '',
    materials: '',
    prerequisites: ''
  });

  const classTypes = [
    { value: 'extra_class', label: 'Extra Class' },
    { value: 'makeup_class', label: 'Makeup Class' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'exam', label: 'Exam' },
    { value: 'project_presentation', label: 'Project Presentation' }
  ];

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await usersAPI.getAll();
      if (response.data.success) {
        // Handle both possible response structures
        const users = response.data.users || response.data.data || [];
        const faculty = users.filter(u => u.role === 'faculty') || [];
        setFacultyList(faculty);
        console.log('Faculty loaded:', faculty.length, 'members');
      } else {
        console.error('Failed to fetch faculty: response not successful');
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
      setError('Failed to load faculty list');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.classCode.trim()) errors.push('Class code is required');
    if (!formData.subject.trim()) errors.push('Subject is required');
    if (!formData.facultyId) errors.push('Faculty assignment is required');
    if (!formData.date) errors.push('Date is required');
    if (!formData.startTime) errors.push('Start time is required');
    if (!formData.endTime) errors.push('End time is required');
    if (!formData.room.trim()) errors.push('Room is required');
    if (!formData.description.trim()) errors.push('Description is required');
    
    // Validate date is not in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.push('Date cannot be in the past');
    }
    
    // Validate time
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (end <= start) {
        errors.push('End time must be after start time');
      }
    }
    
    // Validate max students
    if (formData.maxStudents && (isNaN(formData.maxStudents) || formData.maxStudents < 1 || formData.maxStudents > 200)) {
      errors.push('Maximum students must be between 1 and 200');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Prepare data for submission
      const submitData = {
        ...formData,
        classCode: formData.classCode.toUpperCase(),
        maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : undefined
      };
      
      // Remove empty optional fields
      if (!submitData.maxStudents) delete submitData.maxStudents;
      if (!submitData.materials.trim()) delete submitData.materials;
      if (!submitData.prerequisites.trim()) delete submitData.prerequisites;
      
      const response = await specialClassesAPI.create(submitData);
      
      if (response.data.success) {
        setSuccess('Special class created successfully!');
        setTimeout(() => {
          navigate('/faculty/special-classes');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating special class:', error);
      setError(error.response?.data?.message || 'Failed to create special class');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Special Class</h1>
              <p className="text-gray-600">Schedule a special class session</p>
            </div>
          </div>
        </div>
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
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Code *
                </label>
                <input
                  type="text"
                  name="classCode"
                  value={formData.classCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., CS101-EXTRA"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Data Structures"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty *
                </label>
                <select
                  name="facultyId"
                  value={formData.facultyId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map(faculty => (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.name} ({faculty.department})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {classTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Schedule Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location and Capacity */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-500" />
              Location and Capacity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room *
                </label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Room 101, Lab A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Students
                </label>
                <input
                  type="number"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  min="1"
                  max="200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Description and Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              Description and Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the purpose and content of this special class..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Materials Required
                </label>
                <textarea
                  name="materials"
                  value={formData.materials}
                  onChange={handleInputChange}
                  rows={2}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="List any materials students should bring..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.materials.length}/1000 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prerequisites
                </label>
                <textarea
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleInputChange}
                  rows={2}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any prerequisites or prior knowledge required..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.prerequisites.length}/500 characters
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Creating...' : 'Create Special Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSpecialClass; 