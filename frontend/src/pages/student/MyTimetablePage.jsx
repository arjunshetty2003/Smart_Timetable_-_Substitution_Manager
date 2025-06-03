import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, BookOpen, AlertCircle } from 'lucide-react';
import { timetablesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MyTimetablePage = () => {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTimetables();
  }, [selectedDay]);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For students, we want to fetch their specific class timetable
      const params = {
        day: selectedDay,
        studentId: user._id,
        classId: user.classId // Assuming user object has classId
      };
      
      const response = await timetablesAPI.getAll(params);
      
      if (response.data && (response.data.success || response.data.data)) {
        setTimetables(response.data.data || []);
      } else {
        setTimetables([]);
        setError('No timetable data available for the selected day');
      }
    } catch (err) {
      console.error('Timetable fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch timetable');
      setTimetables([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Timetable</h2>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Weekly Timetable</h2>
        <p className="text-gray-600 mb-6">View your weekly class schedule</p>
        
        {/* Day selection tabs */}
        <div className="flex overflow-x-auto mb-6 border-b">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 font-medium text-sm focus:outline-none whitespace-nowrap ${
                selectedDay === day
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Failed to fetch timetable</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button 
                  onClick={fetchTimetables}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : timetables.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800">No Classes Found</h3>
            <p className="text-gray-600 mt-2">There are no classes scheduled for {selectedDay}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timetables.map((timetable, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <div className="flex flex-wrap gap-4 justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {timetable.subject?.subjectName || timetable.subjectId?.subjectName || 'Unknown Subject'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {(timetable.subject?.subjectCode && `${timetable.subject.subjectCode} - `) || 
                         (timetable.subjectId?.subjectCode && `${timetable.subjectId.subjectCode} - `)}
                        {timetable.class?.name || timetable.classId?.name || timetable.classId?.className || 'Unknown Class'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4 text-blue-700 mr-1" />
                    <span className="text-sm font-medium text-blue-700">
                      {timetable.startTime} - {timetable.endTime}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {timetable.faculty?.name || timetable.facultyId?.name || 'No Faculty Assigned'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {timetable.room || timetable.classroom || 'No Room Assigned'}
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

export default MyTimetablePage; 