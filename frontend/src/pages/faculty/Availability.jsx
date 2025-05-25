import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { usersAPI, authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Availability = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Debug logging
      // Debug logging removed for production
      
      const userId = user?._id || user?.id;
      if (!userId) {
        throw new Error('User ID is not available');
      }
      
      // Try using auth profile endpoint first, fallback to users endpoint
      let response;
      try {
        response = await authAPI.getProfile();
      } catch (authError) {
        response = await usersAPI.getById(userId);
      }
      
      if (response.data.success) {
        // Handle different response structures
        const userData = response.data.user || response.data.data;
        const userAvailability = userData.availability || {};
        setAvailability(userAvailability);
      } else {
        throw new Error(response.data.message || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      
      // More specific error messages
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You can only view your own availability.');
      } else if (error.response?.status === 404) {
        setError('User not found.');
      } else if (error.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to fetch availability');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvailability = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // Debug logging removed for production
      
      const userId = user?._id || user?.id;
      if (!userId) {
        throw new Error('User ID is not available');
      }
      
      // Try using auth profile update first, fallback to users update
      let response;
      try {
        response = await authAPI.updateProfile({ availability });
      } catch (authError) {
        response = await usersAPI.update(userId, { availability });
      }
      
      if (response.data.success) {
        setSuccess('Availability updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      
      // More specific error messages
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You can only update your own availability.');
      } else if (error.response?.status === 404) {
        setError('User not found.');
      } else if (error.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to update availability');
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleDayAvailability = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day]?.available,
        timeSlots: prev[day]?.timeSlots || []
      }
    }));
  };

  const toggleTimeSlot = (day, timeSlot) => {
    setAvailability(prev => {
      const dayAvailability = prev[day] || { available: true, timeSlots: [] };
      const timeSlots = dayAvailability.timeSlots || [];
      
      const updatedTimeSlots = timeSlots.includes(timeSlot)
        ? timeSlots.filter(slot => slot !== timeSlot)
        : [...timeSlots, timeSlot];

      return {
        ...prev,
        [day]: {
          ...dayAvailability,
          timeSlots: updatedTimeSlots
        }
      };
    });
  };

  const addCustomTimeSlot = (day, startTime, endTime) => {
    if (!startTime || !endTime) return;
    
    const customSlot = `${startTime}-${endTime}`;
    setAvailability(prev => {
      const dayAvailability = prev[day] || { available: true, timeSlots: [] };
      const timeSlots = dayAvailability.timeSlots || [];
      
      return {
        ...prev,
        [day]: {
          ...dayAvailability,
          timeSlots: [...timeSlots, customSlot]
        }
      };
    });
  };

  const removeTimeSlot = (day, timeSlot) => {
    setAvailability(prev => {
      const dayAvailability = prev[day] || { available: true, timeSlots: [] };
      const timeSlots = dayAvailability.timeSlots || [];
      
      return {
        ...prev,
        [day]: {
          ...dayAvailability,
          timeSlots: timeSlots.filter(slot => slot !== timeSlot)
        }
      };
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
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Availability</h1>
            <p className="text-gray-600">Set your teaching availability for substitution requests</p>
          </div>
          <button
            onClick={handleSaveAvailability}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
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

      {/* Availability Grid */}
      <div className="space-y-6">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">{day}</h3>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={availability[day]?.available || false}
                  onChange={() => toggleDayAvailability(day)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Available</span>
              </label>
            </div>

            {availability[day]?.available && (
              <div className="space-y-4">
                {/* Predefined Time Slots */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Available Time Slots</h4>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {timeSlots.map((timeSlot) => (
                      <button
                        key={timeSlot}
                        onClick={() => toggleTimeSlot(day, timeSlot)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          availability[day]?.timeSlots?.includes(timeSlot)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {timeSlot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Time Slots */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Time Ranges</h4>
                  <div className="space-y-2">
                    {availability[day]?.timeSlots?.filter(slot => slot.includes('-')).map((slot, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <span className="text-sm text-gray-700">{slot}</span>
                        <button
                          onClick={() => removeTimeSlot(day, slot)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    <CustomTimeSlotForm 
                      onAdd={(startTime, endTime) => addCustomTimeSlot(day, startTime, endTime)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Instructions</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Check the days you are available for teaching</li>
          <li>• Select specific time slots when you can take substitution classes</li>
          <li>• Add custom time ranges if needed</li>
          <li>• Remember to save your changes</li>
        </ul>
      </div>
    </div>
  );
};

// Custom Time Slot Form Component
const CustomTimeSlotForm = ({ onAdd }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startTime && endTime) {
      onAdd(startTime, endTime);
      setStartTime('');
      setEndTime('');
      setShowForm(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center text-sm text-blue-600 hover:text-blue-700"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Custom Time Range
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="px-2 py-1 text-sm border border-gray-300 rounded"
        required
      />
      <span className="text-sm text-gray-500">to</span>
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="px-2 py-1 text-sm border border-gray-300 rounded"
        required
      />
      <button
        type="submit"
        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => setShowForm(false)}
        className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
      >
        Cancel
      </button>
    </form>
  );
};

export default Availability; 