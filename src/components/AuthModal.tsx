import React, { useState } from 'react';
import { X, User, Shield, Mail, Lock, Sparkles, CheckCircle2, Eye, EyeOff, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { saveUserProfile, getUserProfile } from '../lib/dbService';
import { UserProfile, UserRole } from '../types';
import { useToast } from '../context/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { toast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<{ message: string; isNewUserHint?: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError({ message: 'Please enter a valid email address.' });
      toast.warning('Invalid Email', 'Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (cleanPassword.length < 6) {
      setError({ message: 'Password must be at least 6 characters long.' });
      toast.warning('Short Password', 'Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const isTargetAdmin = cleanEmail.toLowerCase() === 'zaidenyuri26@gmail.com';
      const assignedRole = isTargetAdmin ? 'admin' : 'customer';

      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        const profile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || cleanEmail,
          displayName: displayName.trim() || cleanEmail.split('@')[0],
          role: assignedRole,
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(profile);
        toast.authSuccess({ displayName: profile.displayName, role: profile.role, isRegister: true });
        onLoginSuccess(profile);
      } else {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        // Retrieve or create the user profile consistently
        let profile = await getUserProfile(cred.user.uid);
        if (!profile) {
          profile = {
            uid: cred.user.uid,
            email: cred.user.email || cleanEmail,
            displayName: cred.user.displayName || cleanEmail.split('@')[0],
            role: assignedRole
          };
        } else {
          // Always ensure role consistency
          if (isTargetAdmin) {
            profile.role = 'admin';
          }
        }
        await saveUserProfile(profile);
        toast.authSuccess({ displayName: profile.displayName, role: profile.role, isRegister: false });
        onLoginSuccess(profile);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = 'Authentication failed. Please verify your email and password.';
      let isNewUserHint = false;

      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        if (!isRegister) {
          msg = 'Invalid credentials or account does not exist yet. If you haven’t created an account with this password, please register first.';
          isNewUserHint = true;
        } else {
          msg = 'Invalid credentials provided. Please check your details.';
        }
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Switched to Sign In mode.';
        setIsRegister(false);
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Access temporarily disabled due to many failed attempts. You can reset your password or try again in a few moments.';
      } else if (err.message) {
        msg = err.message;
      }

      setError({ message: msg, isNewUserHint });
      toast.error('Authentication Notice', msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError({ message: 'Please enter your email address above to receive a password reset link.' });
      toast.warning('Email Required', 'Enter your email address first.');
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetSent(true);
      toast.success('Reset Email Sent', `Password reset instructions sent to ${cleanEmail}`);
    } catch (err: any) {
      console.error('Reset error:', err);
      setError({ message: err.message || 'Failed to send password reset email.' });
      toast.error('Reset Error', 'Could not send reset link. Please verify the email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await signInWithPopup(auth, googleProvider);
      const isTargetAdmin = res.user.email?.toLowerCase() === 'zaidenyuri26@gmail.com';
      const assignedRole = isTargetAdmin ? 'admin' : 'customer';

      let profile = await getUserProfile(res.user.uid);
      if (!profile) {
        profile = {
          uid: res.user.uid,
          email: res.user.email || '',
          displayName: res.user.displayName || res.user.email?.split('@')[0] || 'User',
          role: assignedRole,
          createdAt: new Date().toISOString()
        };
      } else if (isTargetAdmin) {
        profile.role = 'admin';
      }
      await saveUserProfile(profile);
      toast.authSuccess({ displayName: profile.displayName, role: profile.role, isRegister: false });
      onLoginSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError({ message: 'Google Sign-In encountered an error. Please try email sign in.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in duration-200 text-zinc-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-amber-400 mb-1">
            {role === 'admin' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>
          <h2 className="text-3xl font-black italic font-mono uppercase text-white tracking-wide">
            {isRegister ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
          </h2>
          <p className="text-sm text-zinc-400">
            {isRegister 
              ? 'Register to track service builds, orders, and dyno logs.' 
              : 'Sign in to access your garage profile, orders, and appointments.'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800 mb-5 text-sm font-mono font-bold">
          <button
            type="button"
            onClick={() => {
              setRole('customer');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              role === 'customer'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Customer Access
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setError(null);
              if (!email) {
                setEmail('zaidenyuri26@gmail.com');
              }
            }}
            id="auth-select-admin-role"
            className={`py-2 rounded-lg transition-all ${
              role === 'admin'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Garage Admin
          </button>
        </div>

        {/* Dynamic Error & Resolution Notice */}
        {error && (
          <div className="p-3.5 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-xs space-y-2 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error.message}</span>
            </div>
            {error.isNewUserHint && (
              <div className="pt-2 border-t border-red-800/60 flex items-center justify-between">
                <span className="text-red-300 font-semibold">New to NorthBros?</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError(null);
                  }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 transition shadow-sm"
                >
                  <span>Register with this Email</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {resetSent && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Password reset instructions have been sent to your email.</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-sm">
          {isRegister && (
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">Full Name / Driver Handle</label>
              <input
                type="text"
                required
                placeholder="e.g. Takumi Fujiwara"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:border-amber-400 focus:outline-none mt-1 text-sm font-mono"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">Email Address</label>
              {role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setEmail('zaidenyuri26@gmail.com')}
                  className="text-[10px] font-mono text-amber-400 hover:underline"
                >
                  Use Admin Email
                </button>
              )}
            </div>
            <div className="relative mt-1">
              <input
                type="email"
                required
                placeholder={role === 'admin' ? 'zaidenyuri26@gmail.com' : 'driver@domain.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-100 focus:border-amber-400 focus:outline-none text-sm font-mono"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">Password</label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-[10px] font-mono text-zinc-400 hover:text-amber-400 transition"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-10 py-2 text-zinc-100 focus:border-amber-400 focus:outline-none text-sm font-mono"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="auth-submit-btn"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black py-3 rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block animate-pulse">Authenticating...</span>
            ) : isRegister ? (
              <span>Create Account</span>
            ) : (
              <span>Sign In as {role.toUpperCase()}</span>
            )}
          </button>
        </form>

        {/* Quick Demo Helper Hint */}
        <div className="mt-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            <span>Admin Email:</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setEmail('zaidenyuri26@gmail.com');
              setError(null);
            }}
            className="text-amber-400 hover:underline font-bold"
          >
            zaidenyuri26@gmail.com
          </button>
        </div>

        {/* Switch Register/Login */}
        <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
          <button
            type="button"
            onClick={() => { 
              setIsRegister(!isRegister); 
              setError(null); 
              setResetSent(false);
            }}
            className="text-sm text-zinc-400 hover:text-amber-400 font-medium transition-colors"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register now"}
          </button>
        </div>

      </div>
    </div>
  );
};
