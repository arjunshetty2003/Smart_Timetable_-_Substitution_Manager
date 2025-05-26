import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Import components
import LoadingSpinner from './components/LoadingSpinner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/DashboardLayout';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SubjectManagement from './pages/admin/SubjectManagement';
import ClassManagement from './pages/admin/ClassManagement';
import SubstitutionManagement from './pages/admin/SubstitutionManagement';
import TimetableManagement from './pages/admin/TimetableManagement';
import SchedulePage from './pages/SchedulePage';

// Faculty pages
import FacultyOverview from './pages/faculty/FacultyOverview';

// Student pages
import SpecialClasses from './pages/student/SpecialClasses';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Public Route Component (redirect if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Dashboard Router Component
function DashboardRouter() {
  const { user } = useAuth();

  const getDashboardComponent = () => {
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />;
      case 'faculty':
        return <FacultyDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <DashboardLayout>
      {getDashboardComponent()}
    </DashboardLayout>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/schedule" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SchedulePage />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Role-specific Routes */}
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <UserManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/subjects" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <SubjectManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/classes" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <ClassManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/substitutions" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <SubstitutionManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/timetables" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <TimetableManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Faculty Routes - Single Overview Page */}
        <Route 
          path="/faculty/*" 
          element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <DashboardLayout>
                <FacultyOverview />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Student Routes */}
        <Route 
          path="/student/special-classes" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <SpecialClasses />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/student/*" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Unauthorized Route */}
        <Route 
          path="/unauthorized" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
                <p className="text-xl text-gray-600 mb-8">Access Denied</p>
                <p className="text-gray-500 mb-8">You don't have permission to access this page.</p>
                <button onClick={() => window.location.href = '/dashboard'} className="btn-primary">
                  Go to Dashboard
                </button>
              </div>
            </div>
          } 
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 Route */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
                <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
                <button onClick={() => window.location.href = '/dashboard'} className="btn-primary">
                  Go to Dashboard
                </button>
              </div>
            </div>
          } 
        />
      </Routes>
    </div>
  );
}

export default App; 