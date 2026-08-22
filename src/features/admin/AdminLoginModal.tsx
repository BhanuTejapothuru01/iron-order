import React, { useState } from 'react';
import { ShieldCheck, Mail, KeyRound, AlertCircle, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { MASTER_ADMIN_EMAIL, verifyAdminPassword, adminLoginRateLimiter } from '../../lib/security';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState<string>(MASTER_ADMIN_EMAIL);
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Check Rate Limiter
    const rateCheck = adminLoginRateLimiter.checkAllowed();
    if (!rateCheck.allowed) {
      setErrorMsg(`Too many failed attempts. Account locked for security. Try again in ${rateCheck.remainingSeconds}s.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const isValidEmail = email.trim().toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
      const isValidPass = await verifyAdminPassword(password);

      if (isValidEmail && isValidPass) {
        adminLoginRateLimiter.reset();
        setIsSubmitting(false);
        setPassword('');
        onSuccess();
      } else {
        const lockRes = adminLoginRateLimiter.recordFailedAttempt();
        setIsSubmitting(false);
        if (lockRes.locked) {
          setErrorMsg('5 failed attempts detected. Admin login temporarily locked for 5 minutes for security protection.');
        } else {
          setErrorMsg('Invalid Master Admin Credentials. Access Denied.');
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Authentication error. Access Denied.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="space-y-5 p-1">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-slate-900">Admin Portal Gate</h3>
                <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                  Protected
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Encrypted Master Sign In</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Admin Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tejapothuru94413@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Admin Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200/80 text-[11px] text-purple-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
              <span>SHA-256 Crypto Security & Brute-Force Shield Active</span>
            </div>
            <p>Admin master password is verified using SHA-256 cryptographic hashes. Multi-attempt lockout protection active.</p>
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>AUTHENTICATE & UNLOCK ADMIN CONSOLE</span>
          </Button>
        </form>
      </div>
    </Modal>
  );
};
