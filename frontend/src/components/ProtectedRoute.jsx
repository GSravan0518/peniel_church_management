import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function loginPathForRoles(roles = []) {
  if (roles.includes('admin')) return '/login/admin';
  if (roles.includes('pastor')) return '/login/pastor';
  return '/login/believer';
}

function homeForRole(role) {
  if (role === 'admin') return '/admin-dashboard';
  if (role === 'pastor') return '/pastor-dashboard';
  return '/member-dashboard';
}

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={loginPathForRoles(roles)} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return <Outlet />;
}
