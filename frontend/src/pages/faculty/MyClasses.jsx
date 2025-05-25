import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, MapPin, Users, Search, Filter } from 'lucide-react';
import { classesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MyClasses = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');

  useEffect(() => {
    fetchMyClasses();
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Classes</h1>
        <p className="text-gray-600">Manage your assigned classes and view schedules</p>
      </div>

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
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

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
                  <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    View Schedule
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    Class Details
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
  );
};

export default MyClasses; 