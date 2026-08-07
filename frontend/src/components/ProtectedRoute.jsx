import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    const fallback =
      roles?.includes('pastor') || roles?.includes('admin')
        ? '/login/pastor'
        : '/login/believer';
    return <Navigate to={fallback} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    const home =
      user.role === 'pastor' || user.role === 'admin'
        ? '/pastor-dashboard'
        : '/member-dashboard';
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
