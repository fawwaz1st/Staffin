import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PublicRoute = ({ children }) => {
  const { user, loading, redirectPathFor } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    const from = location.state?.from?.pathname || redirectPathFor(user.role);
    return <Navigate to={from} replace />;
  }

  return children;
};

export default PublicRoute;
