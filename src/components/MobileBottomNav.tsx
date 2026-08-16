import React from 'react';
import { ShoppingBag, Wrench, Package, Car, Shield, User } from 'lucide-react';
import { UserRole } from '../types';

interface MobileBottomNavProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  userRole?: UserRole;
  isAuthenticated: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount,
  onOpenCart,
  onOpenDashboard,
  onOpenAdmin,
  onOpenAuth,
  userRole,
  isAuthenticated
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 pb-safe select-none shadow-2xl shadow-black"
    >
      <div className="grid grid-cols-5 items-center justify-around text-center">
        {/* Parts Catalog */}
        <button
          onClick={() => scrollToSection('performance-parts')}
          className="flex flex-col items-center justify-center py-1 text-zinc-400 hover:text-amber-400 active:scale-95 transition-all"
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono font-medium tracking-tight">Catalog</span>
        </button>

        {/* Services */}
        <button
          onClick={() => scrollToSection('services-section')}
          className="flex flex-col items-center justify-center py-1 text-zinc-400 hover:text-amber-400 active:scale-95 transition-all"
        >
          <Wrench className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono font-medium tracking-tight">Services</span>
        </button>

        {/* Cart Trigger with Floating Badge */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center py-1 relative text-zinc-400 hover:text-amber-400 active:scale-95 transition-all"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 text-amber-400" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-zinc-950 font-mono text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-zinc-950 animate-pulse">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-400 tracking-tight">Cart</span>
        </button>

        {/* Fitment Selector */}
        <button
          onClick={() => scrollToSection('fitment-selector')}
          className="flex flex-col items-center justify-center py-1 text-zinc-400 hover:text-amber-400 active:scale-95 transition-all"
        >
          <Car className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono font-medium tracking-tight">Fitment</span>
        </button>

        {/* Account / Admin / Garage */}
        {userRole === 'admin' ? (
          <button
            onClick={onOpenAdmin}
            className="flex flex-col items-center justify-center py-1 text-amber-400 hover:text-amber-300 active:scale-95 transition-all"
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono font-bold tracking-tight">Admin</span>
          </button>
        ) : isAuthenticated ? (
          <button
            onClick={onOpenDashboard}
            className="flex flex-col items-center justify-center py-1 text-zinc-400 hover:text-amber-400 active:scale-95 transition-all"
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono font-medium tracking-tight">Garage</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex flex-col items-center justify-center py-1 text-zinc-400 hover:text-amber-400 active:scale-95 transition-all"
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono font-medium tracking-tight">Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
};
