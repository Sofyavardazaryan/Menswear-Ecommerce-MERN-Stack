import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Loader from '../ui/Loader.jsx';

/**
 * AdminRoute — wraps routes that require admin role.
 * Redirects unauthenticated users to home, non-admins to home.
 */
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader page />;
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
