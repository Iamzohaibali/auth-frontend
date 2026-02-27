import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
        <p className="mt-3 text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ allowedRoles }) {
  const isLoading       = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user            = useAuthStore((s) => s.user);

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export function PublicRoute() {
  const isLoading       = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isLoading) return <Spinner />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}