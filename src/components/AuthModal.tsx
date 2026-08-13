import React, { useState } from 'react';
import { X, User, Shield, Mail, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { saveUserProfile, getUserProfile } from '../lib/dbService';
import { UserProfile, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const isTargetAdmin = email.toLowerCase() === 'zaidenyuri26@gmail.com';
      const assignedRole = isTargetAdmin ? 'admin' : 'customer';

      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const profile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: displayName || email.split('@')[0],
          role: assignedRole,
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(profile);
        onLoginSuccess(profile);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        // Ensure we retrieve or create the user profile consistently
        let profile = await getUserProfile(cred.user.uid);
        if (!profile) {
          profile = {
            uid: cred.user.uid,
            email: cred.user.email || email,
            displayName: cred.user.displayName || email.split('@')[0],
            role: assignedRole
          };
        } else {
           // Always ensure role consistency
           if (isTargetAdmin) {
             profile.role = 'admin';
           }
        }
        await saveUserProfile(profile);
        onLoginSuccess(profile);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = 'Authentication failed. Please verify your email and password.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. We have switched you to the Sign In tab.';
        setIsRegister(false); // Automatically switch to login tab
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setError(msg);
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
          <h2 className="text-3xl font-black italic font-mono uppercase text-white">
            {isRegister ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
          </h2>
          <p className="text-sm text-zinc-400">
            Sign in to access your garage profile, view orders, and manage appointments.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800 mb-6 text-sm font-mono font-bold">
          <button
            type="button"
            onClick={() => setRole('customer')}
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
            onClick={() => setRole('admin')}
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

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4 text-sm">
          {isRegister && (
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">Full Name</label>
              <input
                type="text"
                required
                placeholder="Driver Name"
                value={displayName || ''}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:border-amber-400 focus:outline-none mt-1"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">Email Address</label>
            <div className="relative mt-1">
              <input
                type="email"
                required
                placeholder={role === 'admin' ? 'admin@northbrosgarage.com' : 'customer@gmail.com'}
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-zinc-100 focus:border-amber-400 focus:outline-none"
              />
              <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">Password</label>
            <div className="relative mt-1">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password || ''}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-zinc-100 focus:border-amber-400 focus:outline-none"
              />
              <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="auth-submit-btn"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black py-3 rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : `Sign In as ${role.toUpperCase()}`}
          </button>
        </form>

        {/* Switch Register/Login */}
        <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-sm text-zinc-400 hover:text-amber-400 transition-colors"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register now"}
          </button>
        </div>

      </div>
    </div>
  );
};
