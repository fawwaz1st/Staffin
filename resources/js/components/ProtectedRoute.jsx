import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, redirectPathFor } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jika roles ditentukan dan role user tidak termasuk, redirect ke dashboard sesuai role
  if (roles && Array.isArray(roles) && !roles.includes(user.role)) {
    return <Navigate to={redirectPathFor(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
