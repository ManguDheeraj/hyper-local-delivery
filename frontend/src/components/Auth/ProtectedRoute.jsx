import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen" id="protected-route-loader">
        <div className="spinner spinner-lg" />
        <p>Loading your workspace…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'rider' && !location.pathname.startsWith('/orders')) {
    return <Navigate to="/orders" replace />;
  }

  return <Outlet />;
}
