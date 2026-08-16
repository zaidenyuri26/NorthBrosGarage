import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Maximize2 } from 'lucide-react';
import { BrandBadgesBar, NorthBrosAngledEmblem, BrandHeader } from './BrandHeader';
import { Product, SiteSettings } from '../types';
import { MediaShowcase } from './MediaShowcase';
import { MediaLightboxModal, LightboxMediaItem } from './MediaLightboxModal';

interface HeroProps {
  onExploreParts: () => void;
  onExploreServices: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  siteSettings?: SiteSettings;
  products?: Product[];
}

export const Hero: React.FC<HeroProps> = ({
  onExploreParts,
  onExploreServices,
  searchQuery,
  setSearchQuery,
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
  const allHeroImages = useMemo(() => {
    const list: string[] = [];
    if (image) list.push(image);
    if (siteSettings?.heroBannerImages && siteSettings.heroBannerImages.length > 0) {
      siteSettings.heroBannerImages.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [image, siteSettings?.heroBannerImages]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const lightboxItems: LightboxMediaItem[] = useMemo(() => {
    return allHeroImages.map((src, idx) => ({
      id: `hero-${idx}`,
      src,
      title: `${siteSettings?.brandName || 'NorthBros Garage'} • Banner Showcase #${idx + 1}`,
      subtitle: `${title1} ${title2}`,
      description: description,
      category: 'SHOWROOM SHOWCASE',
    }));
  }, [allHeroImages, siteSettings?.brandName, title1, title2, description]);

  useEffect(() => {
    if (allHeroImages.length <= 1 || isLightboxOpen) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % allHeroImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [allHeroImages, isLightboxOpen]);

  const inStockCount = products.filter(p => p.stock > 0).length;

  return (
    <div className="relative overflow-hidden bg-transparent text-left">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-zinc-950 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[linear-gradient(135deg,_transparent_40%,_rgba(245,158,11,0.02)_100%)] pointer-events-none" />

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Text & Search Block */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4 text-left">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-2.5 py-1 rounded-full text-xs font-mono font-medium text-zinc-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="tracking-wide uppercase text-[10px] sm:text-[11px] text-zinc-200 font-bold">{badge}</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight uppercase italic font-mono leading-[1.15]">
              <span className="brand-line1-text">
                {title1}
              </span>
              <br />
              <span className="brand-line2-text">
                {title2}
              </span>
            </h1>

            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-xl font-sans font-normal line-clamp-3">
              {description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-row items-center gap-2.5 sm:gap-3 pt-0.5">
              <button
                onClick={onExploreParts}
                id="hero-explore-parts-btn"
                className="bg-white hover:bg-zinc-100 text-zinc-950 font-black px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 group shrink-0"
              >
                <span>{primaryBtn}</span>
                <ChevronRight className="w-4 h-4 text-zinc-950 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onExploreServices}
                id="hero-explore-services-btn"
                className="bg-zinc-900/90 border border-zinc-700 hover:border-amber-500/80 text-zinc-100 font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all hover:bg-zinc-800 text-center"
              >
                {secondaryBtn}
              </button>
            </div>

            {/* Quick Tags / Pills */}
            {quickTags.length > 0 && (
              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Trending:</span>
                {quickTags.slice(0, 4).map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearchQuery(tag);
                      onExploreParts();
                    }}
                    className="text-[11px] font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-amber-400 px-2 py-0.5 rounded-md border border-zinc-700/80 transition-colors font-medium cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="pt-2 sm:pt-3 grid grid-cols-2 gap-3 border-t border-zinc-800/80 max-w-lg text-left">
              <div>
                <p className="text-xl sm:text-2xl font-mono font-black text-amber-500">{inStockCount}</p>
                <p className="text-[11px] text-zinc-300 uppercase font-mono font-semibold">In Stock Parts</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-mono font-black text-white">DIRECT</p>
                <p className="text-[11px] text-zinc-300 uppercase font-mono font-semibold">JDM Importers</p>
              </div>
            </div>

          </div>

          {/* Right Visual Image Banner */}
          <div className="lg:col-span-7 relative">
            <div 
              className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-xl bg-zinc-900 group cursor-pointer"
              onClick={() => {
                if (allHeroImages.length > 0) {
                  setIsLightboxOpen(true);
                }
              }}
              title="Click to expand high-res banner showcase"
            >
              
              {/* Image or Clean Garage Showcase */}
              {allHeroImages.length > 0 ? (
                <div className="relative w-full h-[200px] sm:h-[280px] lg:h-[340px] xl:h-[360px] overflow-hidden">
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

                  {/* Expand Hint */}
                  <div className="absolute top-4 right-4 z-20 bg-zinc-950/80 hover:bg-amber-500 text-zinc-300 hover:text-zinc-950 border border-zinc-700/80 px-3 py-1.5 rounded-full font-mono text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all shadow-xl">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>VIEW BANNER PHOTOS ({allHeroImages.length})</span>
                  </div>

                  {/* Manual Arrow Controls */}
                  {allHeroImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
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
                          e.stopPropagation();
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
                <div className="w-full h-[200px] sm:h-[280px] lg:h-[340px] xl:h-[360px] bg-zinc-950 relative flex flex-col items-center justify-center p-6 text-center border border-zinc-800/80 overflow-hidden">
                  {/* Dynamic Angled Split Background Lines */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 opacity-90" />
                  
                  {/* Slanted Graphic Accents */}
                  <div className="absolute -left-20 -top-20 w-80 h-full bg-gradient-to-r from-amber-500/10 to-transparent transform -skew-x-[20deg] pointer-events-none" />
                  <div className="absolute -right-20 -bottom-20 w-80 h-full bg-gradient-to-l from-amber-500/10 to-transparent transform -skew-x-[20deg] pointer-events-none" />
                  
                  {/* Center Angled White Emblem from Reference Photo */}
                  <div className="relative z-10 space-y-6 max-w-md mx-auto">
                    <BrandHeader 
                      size="lg" 
                      variant="badge" 
                      brandName={siteSettings?.brandName || 'NorthBros'} 
                      brandSubtitle={siteSettings?.brandSubtitle || 'GARAGE'} 
                    />

                    <div className="space-y-2 pt-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-amber-500/30 text-amber-400 text-xs font-mono">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span>OFFICIAL JDM WORKSHOP & SHOWROOM</span>
                      </div>
                      <p className="font-mono text-xs text-zinc-400 max-w-sm mx-auto">
                        Precision Tuning • JDM Performance Imports • Track Build Engineering
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Minimal Slider dots (floating over image) */}
              {allHeroImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800/60 px-3 py-1.5 rounded-full z-20 backdrop-blur-sm">
                  {allHeroImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlide(idx);
                      }}
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

      </div>

      {/* JDM Brands Strip */}
      <BrandBadgesBar />

      {/* FULLSCREEN HERO LIGHTBOX MODAL */}
      <MediaLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        items={lightboxItems}
        initialIndex={activeSlide}
      />
    </div>
  );
};
