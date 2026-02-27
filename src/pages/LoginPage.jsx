import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, Shield, KeyRound, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore.js';
import { authAPI } from '../api/index.js';
import { Input, Button } from '../components/ui/FormElements.jsx';

function maskEmail(email = '') {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local.slice(0, 2)}***@${domain}`;
}

export default function LoginPage() {
  const [showPw,       setShowPw]       = useState(false);
  const [pending2FA,   setPending2FA]   = useState(null);
  const [maskedEmail,  setMaskedEmail]  = useState('');
  // Unverified email state
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendCooldown,  setResendCooldown]  = useState(0);
  const [resendSending,   setResendSending]   = useState(false);
  const [resendSent,      setResendSent]      = useState(false);

  const login     = useAuthStore((s) => s.login);
  const verify2FA = useAuthStore((s) => s.verify2FA);
  const navigate  = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { register: reg2, handleSubmit: submit2, reset: reset2, formState: { errors: errors2, isSubmitting: loading2 } } = useForm({ defaultValues: { otp: '' } });

  // Tick cooldown
  useState(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const onLogin = async (data) => {
    // Clear any previous unverified state
    setUnverifiedEmail('');
    setResendSent(false);
    try {
      const result = await login(data);
      if (result.requires2FA) {
        setMaskedEmail(maskEmail(data.email));
        reset2({ otp: '' });
        setPending2FA(result.pendingToken);
        toast.success('OTP sent to your email');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.status === 403 && msg.toLowerCase().includes('verify')) {
        // Show the inline resend section instead of just a toast
        setUnverifiedEmail(data.email);
      } else {
        toast.error(msg);
      }
    }
  };

  const on2FA = async ({ otp }) => {
    try {
      await verify2FA({ otp, pendingToken: pending2FA });
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      reset2({ otp: '' });
    }
  };

  const backToLogin = () => { setPending2FA(null); setMaskedEmail(''); reset2({ otp: '' }); };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendSending) return;
    setResendSending(true);
    try {
      await authAPI.resendVerification(unverifiedEmail);
      toast.success('Verification email sent!');
      setResendSent(true);
      setResendCooldown(60);
      // Tick the cooldown
      const interval = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) { clearInterval(interval); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
      if (err.response?.status === 429) setResendCooldown(60);
    } finally {
      setResendSending(false);
    }
  };

  /* ── 2FA screen ── */
  if (pending2FA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Verify your identity</h2>
            <p className="text-gray-500 text-sm mt-1">We sent a 6-digit code to</p>
            <p className="text-indigo-600 font-semibold text-sm mt-0.5">{maskedEmail}</p>
          </div>
          <form onSubmit={submit2(on2FA)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Verification Code</label>
              <input
                type="text" inputMode="numeric" maxLength={6} autoFocus autoComplete="one-time-code"
                placeholder="• • • • • •"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center tracking-[0.6em] text-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:tracking-normal placeholder:text-gray-300 placeholder:text-lg"
                {...reg2('otp', {
                  required: 'Enter the 6-digit code',
                  minLength: { value: 6, message: 'Enter all 6 digits' },
                  pattern: { value: /^\d{6}$/, message: 'Digits only (0-9)' },
                })}
              />
              {errors2.otp && <p className="text-red-500 text-xs mt-1.5">{errors2.otp.message}</p>}
            </div>
            <Button type="submit" className="w-full" size="lg" isLoading={loading2}>Verify &amp; Sign In</Button>
          </form>
          <button type="button" onClick={backToLogin} className="w-full text-sm text-gray-500 hover:text-gray-700 mt-4 transition-colors">
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  /* ── Login screen ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* ── Unverified email banner ── */}
        {unverifiedEmail && (
          <div className="mb-5 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-yellow-900">Email not verified</p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  Check <span className="font-medium">{unverifiedEmail}</span> (and spam folder) for the verification link.
                </p>
                {resendSent && (
                  <p className="text-xs text-green-700 mt-1 font-medium">✓ New email sent — check your inbox!</p>
                )}
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resendSending}
                  className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    resendCooldown > 0 || resendSending
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  {resendSending
                    ? <><Loader2 className="w-3 h-3 animate-spin" /> Sending…</>
                    : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend Verification Email'
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
          <Input
            label="Email" type="email" icon={Mail} placeholder="you@example.com"
            autoComplete="email" error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <div className="relative">
            <Input
              label="Password" type={showPw ? 'text' : 'password'} icon={Lock}
              placeholder="Your password" autoComplete="current-password"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">Forgot password?</Link>
          </div>
          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>Sign In</Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account?{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}