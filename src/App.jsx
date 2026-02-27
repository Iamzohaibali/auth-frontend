import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore.js';
import Layout from './components/layout/Layout.jsx';
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute.jsx';
import LoginPage     from './pages/LoginPage.jsx';
import RegisterPage  from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProfilePage   from './pages/ProfilePage.jsx';
import SecurityPage  from './pages/SecurityPage.jsx';
import AdminPage     from './pages/AdminPage.jsx';
import {
  VerifyEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from './pages/AuthPages.jsx';

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  // Run once on mount — intentionally no deps
  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line

  return (
    <Routes>
      {/* ── Public only (redirect if logged in) ── */}
      <Route element={<PublicRoute />}>
        <Route path="/login"                 element={<LoginPage />} />
        <Route path="/register"              element={<RegisterPage />} />
        <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* ── Always public ── */}
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      {/* ── Requires login ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile"   element={<ProfilePage />} />
          <Route path="/security"  element={<SecurityPage />} />

          <Route element={<ProtectedRoute allowedRoles={['admin', 'moderator']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>

      {/* ── Fallback ── */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}