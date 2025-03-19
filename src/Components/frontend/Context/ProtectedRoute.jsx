// src/Components/frontend/Context/ProtectedRoute.jsx
import { useAuth } from './AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  // Show loading state while fetching user data
  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a role is specified (e.g., 'admin'), check if the user has that role
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // Render child routes
  return <Outlet />;
}

export default ProtectedRoute;