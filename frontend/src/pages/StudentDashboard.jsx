import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Today\'s Classes',
      value: '4',
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      name: 'This Week',
      value: '18',
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      name: 'Special Classes',
      value: '2',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      name: 'Next Class',
      value: '2:00 PM',
      icon: Clock,
      color: 'bg-orange-500',
    },
  ];

  const todayClasses = [
    {
      time: '09:00 - 10:00',
      subject: 'Data Structures',
      faculty: 'Dr. Smith',
      room: 'B201',
      status: 'active'
    },
    {
      time: '11:00 - 12:00',
      subject: 'Database Management',
      faculty: 'Dr. Johnson',
      room: 'B203',
      status: 'active'
    },
    {
      time: '14:00 - 15:00',
      subject: 'Web Development',
      faculty: 'Dr. Brown',
      room: 'Lab1',
      status: 'active'
    },
    {
      time: '15:00 - 16:00',
      subject: 'Software Engineering',
      faculty: 'Dr. Wilson',
      room: 'B205',
      status: 'cancelled'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-600">
          Here's your academic overview for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Today's Schedule</h3>
          <p className="text-sm text-gray-500">Your classes for today</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {todayClasses.map((classItem, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  classItem.status === 'cancelled' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-900">
                    {classItem.time}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {classItem.subject}
                    </p>
                    <p className="text-sm text-gray-500">
                      {classItem.faculty} • {classItem.room}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      classItem.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {classItem.status === 'active' ? 'Active' : 'Cancelled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            to="/schedule"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Calendar className="h-4 w-4 mr-2" />
            View Full Timetable
          </Link>
          <Link 
            to="/student/special-classes"
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <Users className="h-4 w-4 mr-2" />
            Browse Special Classes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 