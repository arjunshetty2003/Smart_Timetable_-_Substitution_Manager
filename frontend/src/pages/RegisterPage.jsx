import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Building, UserCheck, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      availability: [{ day: 'Monday', slots: ['09:00'] }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'availability'
  });

  const watchRole = watch('role');

  const onSubmit = async (data) => {
    try {
      // Clean up availability for non-faculty users
      if (data.role !== 'faculty') {
        data.availability = [];
      }
      
      await registerUser(data);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in the context
    }
  };

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Mathematics',
    'Physics',
    'Chemistry',
    'English',
    'Management Studies'
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join the Smart Timetable Management System</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="name" className="label">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      {...register('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                      })}
                      className={`input pl-10 ${errors.name ? 'border-red-300' : ''}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="error">{errors.name.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="label">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Please enter a valid email address',
                        },
                      })}
                      className={`input pl-10 ${errors.email ? 'border-red-300' : ''}`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="error">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className={`input pl-10 pr-10 ${errors.password ? 'border-red-300' : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="error">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Role & Department */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Role & Department
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="role" className="label">
                    Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCheck className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="role"
                      {...register('role', {
                        required: 'Role is required',
                      })}
                      className={`input pl-10 ${errors.role ? 'border-red-300' : ''}`}
                    >
                      <option value="">Select your role</option>
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  {errors.role && (
                    <p className="error">{errors.role.message}</p>
                  )}
                </div>

                {(watchRole === 'faculty' || watchRole === 'admin') && (
                  <div className="form-group">
                    <label htmlFor="department" className="label">
                      Department
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="department"
                        {...register('department', {
                          required: watchRole === 'faculty' || watchRole === 'admin' ? 'Department is required' : false,
                        })}
                        className={`input pl-10 ${errors.department ? 'border-red-300' : ''}`}
                      >
                        <option value="">Select department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.department && (
                      <p className="error">{errors.department.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Faculty Availability */}
            {watchRole === 'faculty' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex-1">
                    Availability Schedule
                  </h3>
                  <button
                    type="button"
                    onClick={() => append({ day: 'Monday', slots: ['09:00'] })}
                    className="btn-secondary ml-4"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Day
                  </button>
                </div>
                
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="label text-sm">Day</label>
                            <select
                              {...register(`availability.${index}.day`)}
                              className="input"
                            >
                              {daysOfWeek.map((day) => (
                                <option key={day} value={day}>
                                  {day}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="label text-sm">Available Time Slots</label>
                            <select
                              {...register(`availability.${index}.slots`)}
                              multiple
                              className="input h-20"
                            >
                              {timeSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              Hold Ctrl/Cmd to select multiple slots
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="btn-danger p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;