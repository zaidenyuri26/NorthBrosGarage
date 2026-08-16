import React from 'react';
import { Search, ShoppingBag, User, ShieldCheck, LogOut, Menu, X, Wrench, Megaphone } from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import { UserProfile, SiteSettings } from '../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  siteSettings?: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAuth,
  onOpenDashboard,
  user,
  onLogout,
  searchQuery,
  setSearchQuery,
  activeSection,
  setActiveSection,
  siteSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const brandName = siteSettings?.brandName || 'NORTHBROS GARAGE';
  const announcement = siteSettings?.announcementText;
  const isAnnouncementEnabled = siteSettings?.announcementEnabled !== false;

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/40 border-b border-zinc-800 backdrop-blur-xl text-left w-full max-w-full overflow-hidden">
      {/* Top Announcement Bar */}
      {isAnnouncementEnabled && announcement && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-zinc-950 font-mono text-[12px] font-black py-1.5 px-4 overflow-hidden tracking-wider uppercase border-b border-amber-500/40 flex items-center gap-3 w-full max-w-full">
          <div className="flex items-center gap-1.5 shrink-0 z-10 bg-zinc-950 text-amber-400 px-2 py-0.5 rounded shadow-sm text-[11px] font-bold">
            <Megaphone className="w-3 h-3 shrink-0 animate-bounce text-amber-400" />
            <span>UPDATE:</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap flex-1 min-w-0 relative max-w-full [contain:paint]">
            <div className="animate-marquee inline-flex items-center gap-16">
              <span className="inline-block">{announcement}</span>
              <span className="inline-block">{announcement}</span>
              <span className="inline-block">{announcement}</span>
              <span className="inline-block">{announcement}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Brand Logo */}
          <button 
            onClick={() => { setActiveSection('home'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none group shrink-0 transition-transform active:scale-95"
            id="nav-logo-btn"
          >
            {siteSettings?.logoUrl ? (
              <img src={siteSettings.logoUrl} alt={brandName} className="h-8 sm:h-10 w-auto object-contain rounded-lg shadow-sm" />
            ) : (
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-950 border border-amber-500/40 rounded-xl group-hover:border-amber-400 group-hover:shadow-[0_0_12px_rgba(229,168,35,0.3)] transition-all">
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-[#e5a823] group-hover:rotate-12 transition-transform" />
              </div>
            )}
            <BrandHeader 
              size="sm" 
              brandName={brandName || 'NorthBros'} 
              brandSubtitle={siteSettings?.brandSubtitle || 'GARAGE'} 
              className="origin-left" 
            />
          </button>

          {/* Single Unified Global Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full text-left">
              <input
                type="text"
                placeholder="Search HKS exhaust, RAYS wheels, brake kits..."
                value={searchQuery || ''}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length > 0 && activeSection !== 'parts') {
                    setActiveSection('parts');
                    const el = document.getElementById('performance-parts');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full bg-zinc-900/90 border border-zinc-700 hover:border-zinc-600 focus:border-amber-500 rounded-full py-2 pl-10 pr-8 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all font-mono"
              />
              <Search className="w-4 h-4 text-amber-500/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs bg-zinc-800 hover:bg-zinc-700 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-base font-medium text-zinc-300">
            <button
              onClick={() => {
                setActiveSection('parts');
                const el = document.getElementById('performance-parts');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-amber-500 transition-colors ${activeSection === 'parts' ? 'text-amber-400 font-bold' : ''}`}
            >
              Performance Parts
            </button>
            <button
              onClick={() => {
                setActiveSection('services');
                const el = document.getElementById('services-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-amber-500 transition-colors ${activeSection === 'services' ? 'text-amber-400 font-bold' : ''}`}
            >
              Garage Services
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              id="nav-cart-btn"
              className="relative p-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-zinc-950 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenDashboard}
                  id="nav-dashboard-btn"
                  className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 hover:border-amber-500/60 text-zinc-200 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  {user.role === 'admin' ? (
                    <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <User className="w-4 h-4 text-amber-500" />
                      <span className="hidden sm:inline max-w-[100px] truncate">{user.displayName || user.email.split('@')[0]}</span>
                    </span>
                  )}
                </button>
                <button
                  onClick={onLogout}
                  id="nav-logout-btn"
                  title="Sign Out"
                  className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                id="nav-auth-btn"
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 font-medium px-3.5 py-2 rounded-xl text-sm transition-all"
              >
                <User className="w-4 h-4 text-amber-500" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-400 hover:text-zinc-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Single Unified Global Search Bar - Mobile */}
        <div className="md:hidden pb-3 text-left">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search parts, brands (HKS, Spoon)..."
              value={searchQuery || ''}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim().length > 0 && activeSection !== 'parts') {
                  setActiveSection('parts');
                  const el = document.getElementById('performance-parts');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full bg-zinc-900/90 border border-zinc-700 focus:border-amber-500 rounded-xl py-2 pl-9 pr-8 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none font-mono"
            />
            <Search className="w-4 h-4 text-amber-500/80 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs bg-zinc-800 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-4 space-y-3 text-left">
          <button
            onClick={() => { 
              setActiveSection('parts'); 
              setMobileMenuOpen(false);
              const el = document.getElementById('performance-parts');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="block w-full text-left py-2 text-base text-zinc-300 font-medium hover:text-amber-500"
          >
            Performance Parts Catalog
          </button>
          <button
            onClick={() => { 
              setActiveSection('services'); 
              setMobileMenuOpen(false);
              const el = document.getElementById('services-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="block w-full text-left py-2 text-base text-zinc-300 font-medium hover:text-amber-500"
          >
            Garage Services & Tuning
          </button>
        </div>
      )}
    </header>
  );
};
