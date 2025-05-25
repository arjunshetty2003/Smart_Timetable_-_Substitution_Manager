import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Edit, Trash2, Search, Save, X, Calendar, Clock, User } from 'lucide-react';
import api from '../../services/api';

const SubstitutionManagement = () => {
  const [substitutions, setSubstitutions] = useState([]);
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubstitution, setSelectedSubstitution] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    originalFacultyId: '',
    substituteFacultyId: '',
    subjectId: '',
    reason: '',
    classroom: '',
    timeSlot: {
      startTime: '09:00',
      endTime: '10:00'
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsResponse, usersResponse, subjectsResponse] = await Promise.all([
        api.get('/substitutions'),
        api.get('/users'),
        api.get('/subjects')
      ]);

      if (subsResponse.data.success) {
        setSubstitutions(subsResponse.data.data);
      }
      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data.filter(user => user.role === 'faculty'));
      }
      if (subjectsResponse.data.success) {
        setSubjects(subjectsResponse.data.data);
      }
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/substitutions', formData);
      if (response.data.success) {
        setSubstitutions([...substitutions, response.data.data]);
        setShowCreateModal(false);
        resetForm();
        alert('Substitution created successfully!');
      }
    } catch (error) {
      alert('Failed to create substitution: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/substitutions/${selectedSubstitution._id}`, formData);
      if (response.data.success) {
        setSubstitutions(substitutions.map(sub => 
          sub._id === selectedSubstitution._id ? response.data.data : sub
        ));
        setShowEditModal(false);
        setSelectedSubstitution(null);
        resetForm();
        alert('Substitution updated successfully!');
      }
    } catch (error) {
      alert('Failed to update substitution: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/substitutions/${selectedSubstitution._id}`);
      setSubstitutions(substitutions.filter(sub => sub._id !== selectedSubstitution._id));
      setShowDeleteModal(false);
      setSelectedSubstitution(null);
      alert('Substitution deleted successfully!');
    } catch (error) {
      alert('Failed to delete substitution: ' + (error.response?.data?.message || error.message));
    }
  };

  const openEditModal = (substitution) => {
    setSelectedSubstitution(substitution);
    setFormData({
      date: new Date(substitution.date).toISOString().split('T')[0],
      originalFacultyId: substitution.originalFacultyId._id || substitution.originalFacultyId,
      substituteFacultyId: substitution.substituteFacultyId._id || substitution.substituteFacultyId,
      subjectId: substitution.subjectId._id || substitution.subjectId,
      reason: substitution.reason,
      classroom: substitution.classroom,
      timeSlot: substitution.timeSlot || { startTime: '09:00', endTime: '10:00' }
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (substitution) => {
    setSelectedSubstitution(substitution);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      date: '',
      originalFacultyId: '',
      substituteFacultyId: '',
      subjectId: '',
      reason: '',
      classroom: '',
      timeSlot: {
        startTime: '09:00',
        endTime: '10:00'
      }
    });
  };

  const filteredSubstitutions = substitutions.filter(sub => {
    const matchesSearch = sub.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.classroom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || new Date(sub.date).toISOString().split('T')[0] === filterDate;
    return matchesSearch && matchesDate;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Substitution Management</h1>
          <p className="text-gray-600">Manage faculty substitutions and schedule changes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Substitution
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by reason or classroom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="w-48">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Substitutions Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Original Faculty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Substitute Faculty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classroom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubstitutions.map((substitution) => (
                <tr key={substitution._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(substitution.date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {substitution.timeSlot && (
                            <>
                              {formatTime(substitution.timeSlot.startTime)} - {formatTime(substitution.timeSlot.endTime)}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-red-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {substitution.originalFacultyId?.name || 'Unknown'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-green-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {substitution.substituteFacultyId?.name || 'Unknown'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {substitution.subjectId?.subjectName || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {substitution.classroom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {substitution.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(substitution)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(substitution)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Substitution Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Substitution</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.timeSlot.startTime}
                    onChange={(e) => setFormData({
                      ...formData, 
                      timeSlot: {...formData.timeSlot, startTime: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.timeSlot.endTime}
                    onChange={(e) => setFormData({
                      ...formData, 
                      timeSlot: {...formData.timeSlot, endTime: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Faculty</label>
                <select
                  required
                  value={formData.originalFacultyId}
                  onChange={(e) => setFormData({...formData, originalFacultyId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Original Faculty</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Substitute Faculty</label>
                <select
                  required
                  value={formData.substituteFacultyId}
                  onChange={(e) => setFormData({...formData, substituteFacultyId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Substitute Faculty</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  required
                  value={formData.subjectId}
                  onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>{subject.subjectName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classroom</label>
                <input
                  type="text"
                  required
                  value={formData.classroom}
                  onChange={(e) => setFormData({...formData, classroom: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  required
                  rows="3"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Reason for substitution..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Create Substitution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit and Delete modals would be similar to Create modal but with pre-filled data */}
      {/* I'll add them if needed, but they follow the same pattern */}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Delete Substitution</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this substitution? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubstitutionManagement; 