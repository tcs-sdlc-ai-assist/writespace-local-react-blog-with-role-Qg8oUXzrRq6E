import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.role !== 'admin') {
    return <Navigate to="/blogs" replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (session) {
    if (session.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/blogs" replace />;
  }

  return children;
}