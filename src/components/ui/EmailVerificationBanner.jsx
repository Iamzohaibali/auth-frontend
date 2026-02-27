import { useState, useEffect } from 'react';
import { MailCheck, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/index.js';
import useAuthStore from '../../store/authStore.js';

/**
 * EmailVerificationBanner
 * Shows a warning when email is not verified.
 * Has a "Resend Email" button with a 60-second cooldown.
 * Pass `compact` prop for inline use (e.g. inside a card).
 */
export default function EmailVerificationBanner({ compact = false }) {
  const user       = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [sending,   setSending]   = useState(false);
  const [cooldown,  setCooldown]  = useState(0);   // seconds remaining
  const [justSent,  setJustSent]  = useState(false);

  // Tick the cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Don't render if already verified
  if (user?.isEmailVerified) return null;

  const handleResend = async () => {
    if (cooldown > 0 || sending) return;
    setSending(true);
    try {
      await authAPI.resendVerificationLoggedIn();
      toast.success('Verification email sent! Check your inbox.');
      setJustSent(true);
      setCooldown(60);
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Failed to send email';
      // If server-side cooldown hit, still start the UI cooldown
      if (err.response?.status === 429) {
        setCooldown(60);
        toast.error('Please wait 60 seconds before resending.');
      } else {
        toast.error(msg);
      }
    } finally {
      setSending(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
        <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-yellow-800 font-medium">Email not verified</p>
          {justSent && (
            <p className="text-xs text-green-700 mt-0.5 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Email sent — check your inbox &amp; spam folder
            </p>
          )}
        </div>
        <button
          onClick={handleResend}
          disabled={cooldown > 0 || sending}
          className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
            cooldown > 0 || sending
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700'
          }`}
        >
          {sending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : (
            'Resend Email'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <MailCheck className="w-5 h-5 text-yellow-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-yellow-900">Verify your email address</p>
          <p className="text-xs text-yellow-700 mt-0.5 leading-relaxed">
            Some features (2FA, password change) require a verified email.
            Check <span className="font-medium">{user?.email}</span> for the link.
          </p>
          {justSent && (
            <p className="text-xs text-green-700 mt-1.5 flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              Email sent! Check your inbox and spam folder.
            </p>
          )}
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || sending}
            className={`mt-3 inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border transition-colors ${
              cooldown > 0 || sending
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700 active:bg-yellow-800'
            }`}
          >
            {sending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              <><MailCheck className="w-3.5 h-3.5" /> Resend Verification Email</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}