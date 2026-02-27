import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Clock, Activity,
  CheckCircle, AlertCircle, Lock,
  MapPin, Phone, Globe, User, Mail,
} from 'lucide-react';
import useAuthStore from '../store/authStore.js';
import { authAPI } from '../api/index.js';
import { Badge } from '../components/ui/FormElements.jsx';

function buildStats(user) {
  return [
    {
      label: 'Account',
      value: user?.isActive ? 'Active' : 'Inactive',
      Comp:  Activity,
      color: user?.isActive ? 'text-green-600' : 'text-red-600',
      bg:    user?.isActive ? 'bg-green-50'    : 'bg-red-50',
    },
    {
      label: 'Email',
      value: user?.isEmailVerified ? 'Verified' : 'Unverified',
      Comp:  user?.isEmailVerified ? CheckCircle : AlertCircle,
      color: user?.isEmailVerified ? 'text-green-600' : 'text-yellow-600',
      bg:    user?.isEmailVerified ? 'bg-green-50'    : 'bg-yellow-50',
    },
    {
      label: '2FA',
      value: user?.twoFactorEnabled ? 'Enabled' : 'Disabled',
      Comp:  Lock,
      color: user?.twoFactorEnabled ? 'text-green-600' : 'text-gray-500',
      bg:    user?.twoFactorEnabled ? 'bg-green-50'    : 'bg-gray-50',
    },
    {
      label: 'Role',
      value: user?.role ?? 'user',
      Comp:  Shield,
      color: 'text-indigo-600',
      bg:    'bg-indigo-50',
    },
  ];
}

export default function DashboardPage() {
  const user    = useAuthStore((s) => s.user);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    authAPI.getLoginHistory()
      .then((r) => setHistory(r.data.loginActivity?.slice(0, 5) ?? []))
      .catch(() => {});
  }, []);

  const stats = buildStats(user);

  return (
    <div className="space-y-6">

      {/* ── Welcome banner ── */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              alt="avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-white/30 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-indigo-200 text-sm mt-0.5 truncate">{user?.email}</p>
            {user?.lastLogin && (
              <p className="text-indigo-300 text-xs mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                Last login: {new Date(user.lastLogin).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, Comp, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Comp className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-sm font-semibold capitalize mt-0.5 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Personal Information card ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" /> Personal Information
          </h2>
          <Link
            to="/profile"
            className="text-xs text-indigo-600 hover:underline font-medium"
          >
            Edit →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">First Name</p>
            <p className="text-sm text-gray-900 font-medium">
              {user?.firstName || <span className="text-gray-400 italic">Not set</span>}
            </p>
          </div>

          {/* Last Name */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Name</p>
            <p className="text-sm text-gray-900 font-medium">
              {user?.lastName || <span className="text-gray-400 italic">Not set</span>}
            </p>
          </div>

          {/* Email */}
          <div className="space-y-1 sm:col-span-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email
            </p>
            <p className="text-sm text-gray-900 font-medium break-all">{user?.email}</p>
          </div>

          {/* Bio */}
          {user?.bio && (
            <div className="sm:col-span-2 space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bio</p>
              <p className="text-sm text-gray-700">{user.bio}</p>
            </div>
          )}

          {/* Phone */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Phone className="w-3 h-3" /> Phone
            </p>
            <p className="text-sm text-gray-900">
              {user?.phone || <span className="text-gray-400 italic">Not set</span>}
            </p>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </p>
            <p className="text-sm text-gray-900">
              {user?.location || <span className="text-gray-400 italic">Not set</span>}
            </p>
          </div>

          {/* Website */}
          <div className="sm:col-span-2 space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Globe className="w-3 h-3" /> Website
            </p>
            {user?.website ? (
              <a
                href={user.website}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-indigo-600 hover:underline break-all"
              >
                {user.website}
              </a>
            ) : (
              <p className="text-sm text-gray-400 italic">Not set</p>
            )}
          </div>
        </div>

        {/* Prompt to fill in if empty */}
        {!user?.bio && !user?.phone && !user?.location && !user?.website && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-xs text-indigo-700">
              Your profile is incomplete.{' '}
              <Link to="/profile" className="font-medium underline">
                Fill in your details
              </Link>{' '}
              to complete it.
            </p>
          </div>
        )}
      </div>

      {/* ── Quick actions + login history ── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" /> Quick Actions
          </h3>
          <div className="space-y-1">
            {[
              { to: '/profile',  label: 'Edit Profile' },
              { to: '/security', label: 'Security Settings' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="text-sm text-gray-700 group-hover:text-indigo-600">{label}</span>
                <span className="text-gray-400 text-xs">→</span>
              </Link>
            ))}
            {!user?.isEmailVerified && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 mt-2">
                <p className="text-xs text-yellow-800 font-medium">
                  ⚠️ Verify your email to unlock all features
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" /> Recent Logins
          </h3>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">No history yet</p>
          ) : (
            <div className="space-y-2">
              {history.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        e.success ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-gray-600 truncate">
                      {e.userAgent?.split(' ')[0] ?? 'Unknown'}
                    </span>
                  </div>
                  <span className="text-gray-400 shrink-0 ml-2">
                    {new Date(e.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
              <Link to="/security" className="text-xs text-indigo-600 hover:underline block mt-1">
                View all →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Role row ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 flex-wrap">
        <Shield className="w-5 h-5 text-indigo-600 shrink-0" />
        <span className="text-sm text-gray-600">Your role:</span>
        <Badge
          variant={
            user?.role === 'admin'
              ? 'danger'
              : user?.role === 'moderator'
              ? 'moderator'
              : 'primary'
          }
        >
          {user?.role}
        </Badge>
        {(user?.role === 'admin' || user?.role === 'moderator') && (
          <Link to="/admin" className="ml-auto text-sm text-indigo-600 hover:underline">
            Open {user?.role === 'admin' ? 'Admin' : 'Moderator'} Panel →
          </Link>
        )}
      </div>

    </div>
  );
}