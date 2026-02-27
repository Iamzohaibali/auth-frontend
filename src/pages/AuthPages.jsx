import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../api/index.js';
import { Input, Button } from '../components/ui/FormElements.jsx';

/* ══════════════════════════════════════════════════════
   Verify Email
   Fix: useRef guard prevents double-call in React StrictMode.
   StrictMode mounts → unmounts → remounts in dev, which caused
   the token to be consumed on the first call and the second
   call returned 400 "invalid or expired".
══════════════════════════════════════════════════════ */
export function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">

        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4" />
            <p className="text-gray-600">Verifying your email…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">Your account is active. You can now log in.</p>
            <Link to="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Verified?</h2>
            <p className="text-gray-600 mb-2">
              If you just clicked the link, your email is likely already verified.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Try logging in — if it works, you are good to go!
            </p>
            <Link to="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </>
        )}

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Forgot Password
══════════════════════════════════════════════════════ */
export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      await authAPI.forgotPassword(email);
    } catch {
      // Always show success — prevents email enumeration
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Mail className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-6">
            If that email exists, a reset link was sent. Check your inbox (expires in 1 hour).
          </p>
          <Link to="/login" className="text-indigo-600 hover:underline text-sm">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <Lock className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email to get a reset link</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            Send Reset Link
          </Button>
        </form>
        <p className="text-center text-sm mt-4">
          <Link to="/login" className="text-indigo-600 hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Reset Password
══════════════════════════════════════════════════════ */
export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ password }) => {
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — link may have expired.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <Lock className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your new password below</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Input
              label="New Password"
              type={showPw ? 'text' : 'password'}
              icon={Lock}
              placeholder="Min 6 chars, 1 uppercase, 1 number"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' },
                pattern: {
                  value: /(?=.*[A-Z])(?=.*[0-9])/,
                  message: 'Need 1 uppercase and 1 number',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}