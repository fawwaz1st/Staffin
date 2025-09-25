import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Auth components (lazy for smaller bundle)
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Layouts
import AdminLayout from './layouts/AdminLayout';
import EmployeeLayout from './layouts/EmployeeLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy loaded pages
const DashboardAdmin = lazy(() => import('./pages/admin/DashboardAdmin'));
const DashboardEmployee = lazy(() => import('./pages/employee/DashboardEmployee'));
const Shifts = lazy(() => import('./pages/admin/Shifts'));
const Attendance = lazy(() => import('./pages/employee/Attendance'));
const UsersPage = lazy(() => import('./pages/admin/Users'));
const AdminAttendance = lazy(() => import('./pages/admin/AttendanceAdmin'));
const AdminLeaves = lazy(() => import('./pages/admin/Leaves'));
const AdminPayrolls = lazy(() => import('./pages/admin/Payrolls'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const EmployeeLeaves = lazy(() => import('./pages/employee/Leaves'));
const EmployeeShifts = lazy(() => import('./pages/employee/Shifts'));

// Helper component for role-based redirection
const RoleRedirect = () => {
  const { user, redirectPathFor } = useAuth();
  return <Navigate to={redirectPathFor(user?.role)} replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Suspense fallback={<div />}> 
              <Login />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Suspense fallback={<div />}> 
              <Register />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <Suspense fallback={<div />}> 
              <ForgotPassword />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <PublicRoute>
            <Suspense fallback={<div />}> 
              <ResetPassword />
            </Suspense>
          </PublicRoute>
        }
      />
      {/* Universal dashboard route yang akan redirect ke dashboard sesuai role */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleRedirect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout>
              <Suspense fallback={<div>Loading...</div>}>
                <DashboardAdmin />
              </Suspense>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/shifts"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout>
              <Suspense fallback={<div>Loading...</div>}>
                <Shifts />
              </Suspense>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/attendance"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <AdminAttendance />
              </Suspense>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/leaves"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <AdminLeaves />
              </Suspense>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/payroll"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <AdminPayrolls />
              </Suspense>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/employee"
        element={
          <ProtectedRoute roles={['employee']}>
            <EmployeeLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <DashboardEmployee />
              </Suspense>
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/employee/attendance"
        element={
          <ProtectedRoute roles={['employee']}>
            <EmployeeLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <Attendance />
              </Suspense>
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/employee/shifts"
        element={
          <ProtectedRoute roles={['employee']}>
            <EmployeeLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <EmployeeShifts />
              </Suspense>
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/employee/leaves"
        element={
          <ProtectedRoute roles={['employee']}>
            <EmployeeLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <EmployeeLeaves />
              </Suspense>
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <SettingsPage />
              </Suspense>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={['admin','employee']}>
            <Suspense fallback={<LoadingSpinner />}>
              <ProfilePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <UsersPage />
              </Suspense>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
