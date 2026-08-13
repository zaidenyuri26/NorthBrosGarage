import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, UserRole } from '../types';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'cart' | 'delete' | 'auth';

export interface ToastAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  createdAt: number;
  product?: {
    id: string;
    name: string;
    brand: string;
    price: number;
    image?: string;
  };
  quantity?: number;
  action?: ToastAction;
  userRole?: UserRole;
  meta?: string;
}

export interface ToastInput {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  product?: {
    id: string;
    name: string;
    brand: string;
    price: number;
    image?: string;
  };
  quantity?: number;
  action?: ToastAction;
  userRole?: UserRole;
  meta?: string;
}

export interface ToastContextType {
  toasts: ToastItem[];
  showToast: (input: ToastInput) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  toast: {
    success: (title: string, message?: string, action?: ToastAction) => string;
    error: (title: string, message?: string, action?: ToastAction) => string;
    info: (title: string, message?: string, action?: ToastAction) => string;
    warning: (title: string, message?: string, action?: ToastAction) => string;
    cartAdded: (product: Product | { id: string; name: string; brand: string; price: number; image?: string }, quantity?: number, onViewCart?: () => void) => string;
    cartRemoved: (productName: string, brand?: string) => string;
    cartCleared: () => string;
    deleted: (itemType: string, itemName: string) => string;
    authSuccess: (opts: { displayName: string; role: UserRole; isRegister?: boolean }) => string;
    authLogout: () => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback((input: ToastInput): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = {
      id,
      type: input.type || 'info',
      title: input.title,
      message: input.message,
      duration: input.duration ?? 4500,
      createdAt: Date.now(),
      product: input.product,
      quantity: input.quantity,
      action: input.action,
      userRole: input.userRole,
      meta: input.meta,
    };

    setToasts((prev) => {
      // Keep up to 4 toasts simultaneously to avoid clutter
      const filtered = prev.slice(-3);
      return [...filtered, newToast];
    });

    return id;
  }, []);

  const toastHelpers = {
    success: (title: string, message?: string, action?: ToastAction) =>
      showToast({ type: 'success', title, message, action }),

    error: (title: string, message?: string, action?: ToastAction) =>
      showToast({ type: 'error', title, message, action }),

    info: (title: string, message?: string, action?: ToastAction) =>
      showToast({ type: 'info', title, message, action }),

    warning: (title: string, message?: string, action?: ToastAction) =>
      showToast({ type: 'warning', title, message, action }),

    cartAdded: (
      product: Product | { id: string; name: string; brand: string; price: number; image?: string },
      quantity = 1,
      onViewCart?: () => void
    ) =>
      showToast({
        type: 'cart',
        title: 'Added to Cart',
        message: quantity > 1 ? `${quantity}x ${product.name}` : product.name,
        product: {
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image: product.image
        },
        quantity,
        duration: 5000,
        action: onViewCart
          ? {
              label: 'View Cart',
              onClick: onViewCart,
              primary: true,
            }
          : undefined,
      }),

    cartRemoved: (productName: string, brand?: string) =>
      showToast({
        type: 'delete',
        title: 'Removed from Cart',
        message: brand ? `${brand} — ${productName}` : productName,
        duration: 3500,
      }),

    cartCleared: () =>
      showToast({
        type: 'delete',
        title: 'Cart Cleared',
        message: 'All items have been removed from your shopping cart.',
        duration: 3500,
      }),

    deleted: (itemType: string, itemName: string) =>
      showToast({
        type: 'delete',
        title: `${itemType} Deleted`,
        message: `"${itemName}" was removed successfully.`,
        duration: 4000,
      }),

    authSuccess: ({ displayName, role, isRegister }: { displayName: string; role: UserRole; isRegister?: boolean }) =>
      showToast({
        type: 'auth',
        title: isRegister ? 'Account Created' : 'Welcome Back',
        message: isRegister
          ? `Welcome to NorthBros Garage, ${displayName}!`
          : `Signed in as ${displayName}`,
        userRole: role,
        duration: 5000,
      }),

    authLogout: () =>
      showToast({
        type: 'info',
        title: 'Signed Out',
        message: 'You have been signed out of NorthBros Garage.',
        duration: 3500,
      }),
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        clearAllToasts,
        toast: toastHelpers,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
