import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, Activity, Eye, EyeOff, Monitor, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../api/index.js';
import { Input, Button, Badge } from '../components/ui/FormElements.jsx';
import useAuthStore from '../store/authStore.js';
import EmailVerificationBanner from '../components/ui/EmailVerificationBanner.jsx';

export default function SecurityPage() {
  const user       = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout     = useAuthStore((s) => s.logout);
  const navigate   = useNavigate();

  const [history,  setHistory]  = useState([]);
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showCon,  setShowCon]  = useState(false);
  const [toggling, setToggling] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const newPasswordValue = watch('newPassword');

  useEffect(() => {
    authAPI.getLoginHistory()
      .then((r) => setHistory(r.data.loginActivity ?? []))
      .catch(() => {});
  }, []);

  const onChangePassword = async (data) => {
    try {
      await authAPI.changePassword(data);
      toast.success('Password changed! Logging you out…');
      reset();
      setTimeout(async () => { await logout(); navigate('/login'); }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to change password');
    }
  };

  const toggle2FA = async () => {
    if (!user?.isEmailVerified) { toast.error('Please verify your email before enabling 2FA'); return; }
    setToggling(true);
    try {
      const res = await authAPI.toggle2FA();
      const enabled = res.data.twoFactorEnabled;
      updateUser({ twoFactorEnabled: enabled });
      if (enabled) {
        toast.success('2FA enabled! Logging you out to confirm…');
        setTimeout(async () => { await logout(); navigate('/login'); }, 1500);
      } else {
        toast.success('2FA has been disabled.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>

      {/* Email verification banner — only shows if not verified */}
      <EmailVerificationBanner />

      {/* 2FA */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" /> Two-Factor Authentication
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Adds an email OTP step on every login.
              {user?.twoFactorEnabled && <span className="text-green-600 font-medium"> Currently active.</span>}
            </p>
          </div>
          <Badge variant={user?.twoFactorEnabled ? 'success' : 'default'}>
            {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>

        {!user?.isEmailVerified ? (
          <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg border border-gray-200">
            Verify your email above to unlock 2FA
          </p>
        ) : (
          <>
            <Button variant={user?.twoFactorEnabled ? 'secondary' : 'primary'} onClick={toggle2FA} isLoading={toggling}>
              {user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
            {user?.twoFactorEnabled && (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" /> Disabling 2FA takes effect on your next login.
              </p>
            )}
          </>
        )}
      </section>

      {/* Change Password */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
        <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-600" /> Change Password
        </h2>
        <p className="text-xs text-gray-500 mb-4">You will be logged out automatically after changing your password.</p>
        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
          <div className="relative">
            <Input label="Current Password" type={showCur ? 'text' : 'password'}
              error={errors.currentPassword?.message}
              {...register('currentPassword', { required: 'Required' })} />
            <button type="button" onClick={() => setShowCur(!showCur)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
              {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Input label="New Password" type={showNew ? 'text' : 'password'} placeholder="Min 6 chars, 1 uppercase, 1 number"
              error={errors.newPassword?.message}
              {...register('newPassword', {
                required: 'Required',
                minLength: { value: 6, message: 'Min 6 characters' },
                pattern: { value: /(?=.*[A-Z])(?=.*[0-9])/, message: 'Need 1 uppercase + 1 number' },
              })} />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Input label="Confirm New Password" type={showCon ? 'text' : 'password'} placeholder="Re-enter new password"
              error={errors.confirmNewPassword?.message}
              {...register('confirmNewPassword', {
                required: 'Please confirm your new password',
                validate: (val) => val === newPasswordValue || 'Passwords do not match',
              })} />
            <button type="button" onClick={() => setShowCon(!showCon)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
              {showCon ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button type="submit" isLoading={isSubmitting}>Change Password</Button>
        </form>
      </section>

      {/* Login History */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" /> Login History
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">No login history available</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {history.map((e, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${e.success ? 'bg-green-500' : 'bg-red-500'}`} />
                <Monitor className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{e.userAgent ?? 'Unknown device'}</p>
                  <p className="text-xs text-gray-500">{e.ipAddress ?? 'Unknown IP'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-medium ${e.success ? 'text-green-600' : 'text-red-600'}`}>
                    {e.success ? 'Success' : 'Failed'}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(e.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}