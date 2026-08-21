import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Sparkles, AlertCircle, Shirt, Store } from 'lucide-react';
import { useAuth } from './AuthContext';
import type { UserRole } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'owner',
}) => {
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        if (!fullName.trim()) {
          setErrorMsg('Full name is required');
          setIsSubmitting(false);
          return;
        }
        await signup(email.trim(), password, fullName.trim(), role, phoneNumber.trim());
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoRole: UserRole) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const demoEmail = demoRole === 'owner' ? 'owner@ironing.com' : 'customer@ironing.com';
      await login(demoEmail, 'demo123');
      onClose();
    } catch (err: any) {
      console.error('Demo auth error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-5">
        {/* Header Branding */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
            <Shirt className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black tracking-tight text-slate-900">
            {mode === 'login' ? 'Partner & User Login' : 'Create an Account'}
          </h3>
          <p className="text-xs text-slate-500">
            {mode === 'login'
              ? 'Access your shop dashboard or customer account'
              : 'Join Iron to register your shop or discover steam press care near you'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(null); }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Account Role Selector (Sign Up only) */}
        {mode === 'signup' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  role === 'owner'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-950 font-bold ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <Store className={`w-4 h-4 mt-0.5 ${role === 'owner' ? 'text-brand-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold">Shop Owner</div>
                  <div className="text-[10px] text-slate-500 font-normal">List & manage ironing shop</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  role === 'customer'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-950 font-bold ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <User className={`w-4 h-4 mt-0.5 ${role === 'customer' ? 'text-brand-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold">Customer</div>
                  <div className="text-[10px] text-slate-500 font-normal">Find & review local shops</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <Input
              label="Full Name"
              placeholder="e.g. Rajesh Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              leftIcon={<User className="w-4 h-4" />}
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail className="w-4 h-4" />}
          />

          {mode === 'signup' && (
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />
          )}

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            {mode === 'login' ? 'Sign In to Account' : 'Create Partner Account'}
          </Button>
        </form>

        {/* Quick Demo Credentials Footer */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Quick Demo One-Click Sign In</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('owner')}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-brand-600" />
              <span>Demo Partner</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('customer')}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Demo Customer</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
