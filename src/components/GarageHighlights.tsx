import React from 'react';
import { ShieldCheck, Award, Wrench, ChevronRight, ChevronLeft } from 'lucide-react';
import { SiteSettings } from '../types';
import { MediaShowcase } from './MediaShowcase';

interface GarageHighlightsProps {
  siteSettings?: SiteSettings;
  onExploreServices?: () => void;
}

export const GarageHighlights: React.FC<GarageHighlightsProps> = ({ siteSettings, onExploreServices }) => {
  const title = siteSettings?.aboutTitle || 'NORTHBROS MOTORSPORT HERITAGE';
  const description = siteSettings?.aboutDescription || 'Founded by dedicated circuit racers and master mechanics, NorthBros Garage delivers high-precision tuning, forged engine building, and authentic JDM performance parts to automotive enthusiasts nationwide.';
  const image = siteSettings?.aboutImage || '';

  const renderSplitTitle = (text: string) => {
    const words = text.trim().split(' ');
    if (words.length <= 1) {
      return <span className="brand-line1-text">{text}</span>;
    }
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    return (
      <>
        <span className="brand-line1-text">{line1}</span>{' '}
        <span className="brand-line2-text">{line2}</span>
      </>
    );
  };

  // Multi-image Highlights Carousel logic
  const allAboutImages = React.useMemo(() => {
    const list: string[] = [];
    if (image) list.push(image);
    if (siteSettings?.aboutImages && siteSettings.aboutImages.length > 0) {
      siteSettings.aboutImages.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [image, siteSettings?.aboutImages]);

  const [activeSlide, setActiveSlide] = React.useState(0);

  React.useEffect(() => {
    if (allAboutImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % allAboutImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [allAboutImages]);

  return (
    <section className="py-16 bg-transparent border-t border-zinc-800/80 relative overflow-hidden text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Configurable Garage Picture Container */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950 group">
              {allAboutImages.length > 0 ? (
                <div className="relative w-full h-[320px] sm:h-[500px] lg:h-[650px] overflow-hidden">
                  {allAboutImages.map((src, idx) => (
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
                        alt={`NorthBros Garage Build Highlights #${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}

                  {/* Manual Arrow Controls */}
                  {allAboutImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSlide((prev) => (prev - 1 + allAboutImages.length) % allAboutImages.length);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-zinc-950/80 hover:bg-zinc-900 hover:text-amber-400 text-white flex items-center justify-center border border-zinc-800/80 transition-colors shadow-xl"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSlide((prev) => (prev + 1) % allAboutImages.length);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-zinc-950/80 hover:bg-zinc-900 hover:text-amber-400 text-white flex items-center justify-center border border-zinc-800/80 transition-colors shadow-xl"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-[320px] sm:h-[500px] lg:h-[650px] bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex flex-col items-center justify-center p-8 text-center border border-zinc-800">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 mb-3">
                    <Wrench className="w-8 h-8" />
                  </div>
                  <h4 className="font-mono text-sm font-bold text-amber-500 uppercase tracking-widest">WORKSHOP FACILITY BAY</h4>
                  <p className="font-mono text-[12px] text-zinc-500 mt-1 max-w-xs">Add your workshop photo link in Admin Dashboard &rarr; Site Settings</p>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />

              {/* Minimal Slide Indicators */}
              {allAboutImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-zinc-950/60 backdrop-blur-md px-3 py-2 rounded-full border border-zinc-800/80">
                  {allAboutImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === activeSlide ? 'bg-amber-500 w-6' : 'bg-zinc-600 hover:bg-zinc-400'
                      }`}
                      aria-label={`Go to build slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Highlights Content */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-sm font-mono font-bold text-amber-500 uppercase tracking-widest">
              <Wrench className="w-3.5 h-3.5" />
              <span>NORTHBROS GARAGE HIGHLIGHTS</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-black italic font-mono uppercase leading-tight tracking-tight">
              {renderSplitTitle(title)}
            </h2>

            <p className="text-zinc-100 text-base sm:text-xl leading-relaxed font-normal">
              {description}
            </p>

            {onExploreServices && (
              <div className="pt-4">
                <button
                  onClick={onExploreServices}
                  className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-mono text-sm font-bold uppercase rounded-xl transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-95"
                >
                  <span>Explore Garage Services</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
