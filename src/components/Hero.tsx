import React from 'react';
import { Search, ChevronRight, Zap, Flame, ChevronLeft } from 'lucide-react';
import { BrandBadgesBar } from './BrandHeader';
import { FitmentSelector, SelectedVehicle } from './FitmentSelector';
import { Product, SiteSettings } from '../types';
import { MediaShowcase } from './MediaShowcase';

interface HeroProps {
  onExploreParts: () => void;
  onExploreServices: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectCategory: (category: string) => void;
  selectedVehicle: SelectedVehicle | null;
  onSelectVehicle: (vehicle: SelectedVehicle | null) => void;
  onFilterFitment: (modelKeyword: string) => void;
  siteSettings?: SiteSettings;
  products?: Product[];
}

export const Hero: React.FC<HeroProps> = ({
  onExploreParts,
  onExploreServices,
  searchQuery,
  setSearchQuery,
  onSelectCategory,
  selectedVehicle,
  onSelectVehicle,
  onFilterFitment,
  siteSettings,
  products = [],
}) => {
  const badge = siteSettings?.heroBadge || 'OFFICIAL JDM IMPORTER & TUNING WORKSHOP';
  const title1 = siteSettings?.heroTitleLine1 || 'BUILT FOR THE TRACK.';
  const title2 = siteSettings?.heroTitleLine2 || 'TUNED FOR THE STREET.';
  const description = siteSettings?.heroDescription || 'Authorized distributor for premier Japanese performance brands including HKS, TAKATA, Spoon Sports, RAYS, BRIDE, and MOMO.';
  const image = siteSettings?.heroBannerImage || '';
  const primaryBtn = siteSettings?.heroPrimaryBtnText || 'EXPLORE CATALOG';
  const secondaryBtn = siteSettings?.heroSecondaryBtnText || 'VIEW WORKSHOP SERVICES';
  const quickTags = siteSettings?.heroQuickTags || ['HKS Exhausts', 'RAYS Wheels', 'Spoon Brakes', 'BRIDE Seats', 'GReddy Turbos'];

  // Multi-image Hero Carousel logic
  const allHeroImages = React.useMemo(() => {
    const list: string[] = [];
    if (image) list.push(image);
    if (siteSettings?.heroBannerImages && siteSettings.heroBannerImages.length > 0) {
      siteSettings.heroBannerImages.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [image, siteSettings?.heroBannerImages]);

  const [activeSlide, setActiveSlide] = React.useState(0);

  React.useEffect(() => {
    if (allHeroImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % allHeroImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [allHeroImages]);

  const getCategoryCount = (categoryKey: string) => {
    return products.filter(p => p.category?.toLowerCase().includes(categoryKey.toLowerCase())).length;
  };

  const inStockCount = products.filter(p => p.stock > 0).length;

  const quickCategories = [
    { name: 'Exhaust & Turbo', count: `${getCategoryCount('Exhaust')} Parts`, icon: '🔥' },
    { name: 'Suspension & Brakes', count: `${getCategoryCount('Suspension') + getCategoryCount('Brake')} Parts`, icon: '⚡' },
    { name: 'Interior & Seats', count: `${getCategoryCount('Interior') + getCategoryCount('Seat')} Parts`, icon: '🏎️' },
    { name: 'Wheels & Tires', count: `${getCategoryCount('Wheel') + getCategoryCount('Tire')} Specs`, icon: '🏁' },
  ];

  return (
    <div className="relative overflow-hidden bg-transparent text-left">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-zinc-950 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[linear-gradient(135deg,_transparent_40%,_rgba(245,158,11,0.02)_100%)] pointer-events-none" />

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text & Search Block */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full text-sm font-mono font-medium text-zinc-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="tracking-wide uppercase text-[11px] text-zinc-400 font-bold">{badge}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase italic font-mono leading-tight">
              {title1} <br />
              <span className="text-amber-400">
                {title2}
              </span>
            </h1>

            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-xl font-sans">
              {description}
            </p>

            {/* Quick Hero Search Bar */}
            <div className="bg-zinc-900/90 p-2 rounded-2xl border border-zinc-800 focus-within:border-amber-500/80 shadow-2xl transition-all max-w-xl">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-500 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search specific parts, part numbers or car model (e.g. GT-R, Civic FK8)..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-base text-zinc-100 placeholder-zinc-500 focus:outline-none py-2 font-mono"
                />
                <button
                  onClick={onExploreParts}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-sm uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreParts}
                id="hero-explore-parts-btn"
                className="bg-white hover:bg-zinc-100 text-zinc-950 font-black px-7 py-3.5 rounded-xl text-base uppercase tracking-wider shadow-lg shadow-white/5 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>{primaryBtn}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreServices}
                id="hero-explore-services-btn"
                className="bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 font-bold px-6 py-3.5 rounded-xl text-base uppercase tracking-wider transition-all hover:bg-zinc-800"
              >
                {secondaryBtn}
              </button>
            </div>

            {/* Quick Tags / Pills */}
            {quickTags.length > 0 && (
              <div className="pt-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-500 uppercase font-bold">Trending:</span>
                {quickTags.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchQuery(tag)}
                    className="text-[12px] font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 px-2.5 py-1 rounded-lg border border-zinc-800/80 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="pt-4 grid grid-cols-2 gap-4 border-t border-zinc-800/80 max-w-lg text-left">
              <div>
                <p className="text-2xl font-mono font-black text-amber-500">{inStockCount}</p>
                <p className="text-[12px] text-zinc-400 uppercase font-mono">In Stock Parts</p>
              </div>
              <div>
                <p className="text-2xl font-mono font-black text-white">DIRECT</p>
                <p className="text-[12px] text-zinc-400 uppercase font-mono">JDM Importers</p>
              </div>
            </div>

          </div>

          {/* Right Visual Image Banner */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900 group">
              
              {/* Image or Clean Garage Showcase */}
              {allHeroImages.length > 0 ? (
                <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden">
                  {allHeroImages.map((src, idx) => (
                    <div
                      key={src + '-' + idx}
                      className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                        idx === activeSlide 
                          ? 'opacity-90 scale-100 translate-x-0 z-10' 
                          : 'opacity-0 scale-95 pointer-events-none'
                      }`}
                    >
                      <MediaShowcase
                        src={src}
                        alt={`Garage Banner Showcase #${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}

                  {/* Manual Arrow Controls */}
                  {allHeroImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSlide((prev) => (prev - 1 + allHeroImages.length) % allHeroImages.length);
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-zinc-950/80 hover:bg-zinc-900 hover:text-amber-400 text-white flex items-center justify-center border border-zinc-800/80 transition-colors"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSlide((prev) => (prev + 1) % allHeroImages.length);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-zinc-950/80 hover:bg-zinc-900 hover:text-amber-400 text-white flex items-center justify-center border border-zinc-800/80 transition-colors"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex flex-col items-center justify-center p-8 text-center border border-zinc-800">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 mb-3 animate-pulse">
                    <Zap className="w-8 h-8" />
                  </div>
                  <h4 className="font-mono text-sm font-bold text-amber-400 uppercase tracking-widest">NORTHBROS MOTORSPORT</h4>
                  <p className="font-mono text-[12px] text-zinc-500 mt-1 max-w-xs">Add your banner image link or upload photo in Admin Dashboard &rarr; Site Settings</p>
                </div>
              )}

              {/* Minimal Slider dots (floating over image) */}
              {allHeroImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800/60 px-3 py-1.5 rounded-full z-20 backdrop-blur-sm">
                  {allHeroImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        idx === activeSlide ? 'bg-amber-500 w-4' : 'bg-zinc-500 hover:bg-zinc-300'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Quick Category Selector Chips */}
        <div className="mt-10 pt-8 border-t border-zinc-800/80 space-y-6">
          <div>
            <p className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-3 text-left">Top Automotive Categories</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {quickCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => onSelectCategory(cat.name)}
                  className="flex items-center justify-between p-3.5 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-amber-500/50 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{cat.icon}</span>
                    <div className="text-left">
                      <p className="text-sm font-bold text-zinc-200 group-hover:text-amber-400 transition-colors">{cat.name}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">{cat.count}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Vehicle Fitment Finder */}
          <FitmentSelector
            selectedVehicle={selectedVehicle}
            onSelectVehicle={onSelectVehicle}
            onFilterFitment={onFilterFitment}
          />
        </div>

      </div>

      {/* JDM Brands Strip */}
      <BrandBadgesBar />
    </div>
  );
};
