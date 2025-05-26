import React, { useState, useEffect } from 'react';
import { Clock, Calendar, User, Plus, Search, Filter, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { substitutionsAPI, usersAPI, subjectsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const SubstitutionRequests = () => {
  const { user } = useAuth();
  const [substitutions, setSubstitutions] = useState([]);
  const [availableFaculty, setAvailableFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
    substituteFacultyId: '',
    subjectId: '',
    classroom: ''
  });

  useEffect(() => {
    fetchSubstitutions();
    fetchAvailableFaculty();
    fetchSubjects();
  }, []);

  const fetchSubstitutions = async () => {
    try {
      setLoading(true);
      const response = await substitutionsAPI.getAll({ originalFacultyId: user._id });
      if (response.data.success) {
        setSubstitutions(response.data.data);
      }
    } catch (error) {
      setError('Failed to fetch substitution requests');
      console.error('Error fetching substitutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableFaculty = async () => {
    try {
      const response = await usersAPI.getAll();
      if (response.data.success) {
        // Handle both possible response structures
        const users = response.data.users || response.data.data || [];
        const faculty = users.filter(u => u.role === 'faculty' && u._id !== user._id);
        setAvailableFaculty(faculty);
        console.log('Available faculty loaded:', faculty.length, 'members');
      } else {
        console.error('Failed to fetch available faculty: response not successful');
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleCreateSubstitution = async (e) => {
    e.preventDefault();
    try {
      const response = await substitutionsAPI.create({
        ...formData,
        originalFacultyId: user._id,
        timeSlot: `${formData.startTime} - ${formData.endTime}`,
        status: 'pending'
      });
      
      if (response.data.success) {
        setShowCreateModal(false);
        setFormData({
          date: '',
          startTime: '',
          endTime: '',
          reason: '',
          substituteFacultyId: '',
          subjectId: '',
          classroom: ''
        });
        fetchSubstitutions();
      }
    } catch (error) {
      setError('Failed to create substitution request');
      console.error('Error creating substitution:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredSubstitutions = substitutions.filter(sub => 
    filterStatus === 'all' || sub.status === filterStatus
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="bg-white rounded-lg shadow-sm border p-6 flex-1 mr-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Substitution Requests</h1>
          <p className="text-gray-600">Manage your substitution requests and view status</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          New Request
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-4">
        <div className="w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Substitutions List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Substitute Faculty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                          {substitution.timeSlot || 'Time not specified'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {substitution.subjectId?.subjectName || 'Subject not specified'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {substitution.subjectId?.subjectCode || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {substitution.substituteFacultyId?.name || 'Not assigned'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {substitution.reason || 'No reason provided'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(substitution.status)}`}>
                      {getStatusIcon(substitution.status)}
                      <span className="ml-1 capitalize">{substitution.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredSubstitutions.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Substitution Requests</h3>
          <p className="text-gray-500">
            {filterStatus !== 'all' 
              ? `No ${filterStatus} substitution requests found.` 
              : 'You haven\'t made any substitution requests yet.'}
          </p>
        </div>
      )}

      {/* Create Substitution Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Request Substitution</h3>
              <form onSubmit={handleCreateSubstitution} className="space-y-4">
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
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    required
                    value={formData.subjectId}
                    onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.subjectName} ({subject.subjectCode})
                      </option>
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
                    placeholder="Enter classroom (e.g., Room 101, Lab 1)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Substitute Faculty</label>
                  <select
                    value={formData.substituteFacultyId}
                    onChange={(e) => setFormData({...formData, substituteFacultyId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select faculty (optional)</option>
                    {availableFaculty.map((faculty) => (
                      <option key={faculty._id} value={faculty._id}>
                        {faculty.name} - {faculty.department}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Reason for substitution request"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubstitutionRequests; 