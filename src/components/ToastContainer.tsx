import React, { useEffect, useState, useRef } from 'react';
import {
  ShoppingBag,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Shield,
  User,
  X,
  ChevronRight
} from 'lucide-react';
import { useToast, ToastItem } from '../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[120] flex flex-col-reverse gap-3 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-auto pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);
  const duration = toast.duration || 4500;
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const handleDismissWithAnimation = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 200);
  };

  useEffect(() => {
    if (isPaused || isExiting) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
      const pct = (currentRemaining / duration) * 100;
      setProgress(pct);

      if (currentRemaining > 0) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);

    timerRef.current = setTimeout(() => {
      handleDismissWithAnimation();
    }, remainingTimeRef.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused, isExiting, duration]);

  const handleMouseEnter = () => {
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Type-specific icon and theme colors
  const renderIconAndHeader = () => {
    switch (toast.type) {
      case 'cart':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
        );
      case 'delete':
        return (
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
            <Trash2 className="w-4.5 h-4.5" />
          </div>
        );
      case 'auth':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            {toast.userRole === 'admin' ? <Shield className="w-4.5 h-4.5 text-amber-400" /> : <User className="w-4.5 h-4.5 text-amber-400" />}
          </div>
        );
      case 'success':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
        );
      case 'error':
        return (
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center shrink-0">
            <Info className="w-4.5 h-4.5" />
          </div>
        );
    }
  };

  const getBorderAndGlow = () => {
    switch (toast.type) {
      case 'cart':
        return 'border-amber-500/40 shadow-[0_8px_30px_-4px_rgba(245,158,11,0.2)]';
      case 'delete':
        return 'border-red-500/40 shadow-[0_8px_30px_-4px_rgba(239,68,68,0.2)]';
      case 'auth':
        return 'border-amber-500/50 shadow-[0_8px_30px_-4px_rgba(245,158,11,0.25)]';
      case 'success':
        return 'border-emerald-500/40 shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)]';
      case 'error':
        return 'border-red-500/40 shadow-[0_8px_30px_-4px_rgba(239,68,68,0.25)]';
      default:
        return 'border-zinc-700 shadow-2xl';
    }
  };

  const getProgressBarColor = () => {
    switch (toast.type) {
      case 'cart':
        return 'bg-gradient-to-r from-amber-500 to-amber-300';
      case 'delete':
        return 'bg-gradient-to-r from-red-600 to-rose-400';
      case 'auth':
        return 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-200';
      case 'success':
        return 'bg-gradient-to-r from-emerald-500 to-teal-300';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-400';
      default:
        return 'bg-gradient-to-r from-sky-500 to-blue-300';
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative overflow-hidden bg-zinc-950/95 backdrop-blur-xl border rounded-2xl p-4 text-zinc-100 ${getBorderAndGlow()} transition-all duration-200 ${
        isExiting ? 'opacity-0 translate-x-12 scale-90' : 'animate-toast-in'
      }`}
    >
      {/* Top light reflection line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Main Toast Content */}
      <div className="flex items-start gap-3">
        {renderIconAndHeader()}

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-black italic font-mono uppercase tracking-tight text-white">
              {toast.title}
            </h4>

            {toast.userRole && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                toast.userRole === 'admin'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}>
                {toast.userRole === 'admin' ? 'Garage Admin' : 'Customer'}
              </span>
            )}
          </div>

          {/* Cart Specific Rich Card */}
          {toast.type === 'cart' && toast.product ? (
            <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center gap-3">
              {toast.product.image && (
                <img
                  src={toast.product.image}
                  alt={toast.product.name}
                  className="w-12 h-12 rounded-xl object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                  {toast.product.brand}
                </span>
                <p className="text-xs font-bold text-zinc-200 truncate leading-snug">
                  {toast.product.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    ₱{toast.product.price.toLocaleString()}
                  </span>
                  {(toast.quantity || 1) > 1 && (
                    <span className="text-[11px] font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded border border-zinc-700">
                      Qty: {toast.quantity}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            toast.message && (
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed break-words font-sans">
                {toast.message}
              </p>
            )
          )}

          {/* Action Button (e.g., View Cart, View Profile) */}
          {toast.action && (
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  handleDismissWithAnimation();
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  toast.action.primary
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                }`}
              >
                <span>{toast.action.label}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismissWithAnimation}
          aria-label="Dismiss notification"
          className="absolute top-3.5 right-3.5 p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-800/50">
        <div
          className={`h-full ${getProgressBarColor()} transition-all duration-75`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
