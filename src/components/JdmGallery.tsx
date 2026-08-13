import React, { useState, useEffect } from 'react';
import { Camera, ChevronRight, Zap, Cpu, Compass, ShoppingCart, Eye, Sparkles, Video, Link } from 'lucide-react';
import { Product, GalleryBuild, SiteSettings } from '../types';
import { MediaShowcase } from './MediaShowcase';

interface JdmGalleryProps {
  products: Product[];
  builds?: GalleryBuild[];
  siteSettings?: SiteSettings;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
}

export const JdmGallery: React.FC<JdmGalleryProps> = ({
  products,
  builds = [],
  siteSettings,
  onAddToCart,
  onViewProduct,
  setSearchQuery,
  setSelectedCategory,
}) => {
  const [activeBuildId, setActiveBuildId] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Automatically select the first build if activeBuildId is not set
  useEffect(() => {
    if (builds.length > 0) {
      const exists = builds.some(b => b.id === activeBuildId);
      if (!activeBuildId || !exists) {
        setActiveBuildId(builds[0].id);
        setActiveImageIndex(0);
      }
    }
  }, [builds, activeBuildId]);
  
  useEffect(() => {
    setActiveImageIndex(0); // Reset index when build changes
  }, [activeBuildId]);

  const activeBuild = builds.find((b) => b.id === activeBuildId) || builds[0];

  const buildImages = activeBuild 
    ? [activeBuild.image, ...(activeBuild.additionalImages || []).filter(img => img.trim() !== '')]
    : [];
  const currentMediaUrl = buildImages[activeImageIndex] || buildImages[0];

  // Auto-carousel for build photos
  useEffect(() => {
    if (buildImages.length > 1) {
      const interval = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % buildImages.length);
      }, 3500); // Rotate every 3.5 seconds
      return () => clearInterval(interval);
    }
  }, [buildImages.length, activeBuildId]);

  // Find products matching current active build's parts keywords
  const matchedProducts = products.filter((prod) =>
    activeBuild?.partsKeywords?.some(
      (kw) =>
        prod.name.toLowerCase().includes(kw.toLowerCase()) ||
        prod.brand.toLowerCase().includes(kw.toLowerCase())
    )
  );

  const handleShopBuild = () => {
    if (activeBuild && activeBuild.partsKeywords && activeBuild.partsKeywords.length > 0) {
      setSearchQuery(activeBuild.partsKeywords[0]);
      setSelectedCategory('All');
      const el = document.getElementById('parts-catalog');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const title = siteSettings?.tunerShowcaseTitle || 'THE TUNER SHOWCASE';
  const subtitle = siteSettings?.tunerShowcaseSubtitle || 'From street sleepers to 1000+ HP circuit monsters, explore our curated gallery of legendary JDM builds. Witness the perfect fusion of authentic parts and master calibration.';

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

  if (!activeBuild) {
    return (
      <section id="jdm-gallery" className="py-16 bg-transparent border-t border-b border-zinc-900 relative overflow-hidden text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center py-20">
          <Camera className="w-12 h-12 text-amber-500 mx-auto mb-4 opacity-50" />
          <h2 className="text-3xl font-black text-zinc-600 italic font-mono uppercase">
            TUNER SHOWCASE EMPTY
          </h2>
          <p className="text-zinc-500 max-w-md mx-auto mt-3">
            No showcase builds have been added to the database yet. Admin users can upload and manage project cars directly from the Admin Dashboard.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="jdm-gallery" className="py-16 bg-transparent border-t border-b border-zinc-900 relative overflow-hidden text-left">
      {/* Background Neon Glow Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 text-left">
          <div>
            <div className="inline-flex items-center gap-2 text-amber-400 font-mono text-sm uppercase tracking-widest mb-2 font-bold">
              <Camera className="w-3.5 h-3.5" />
              <span>{siteSettings?.tunerShowcaseBadge || 'NORTHBROS PROJECT CAR CHRONICLES'}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black italic font-mono uppercase tracking-tight">
              {renderSplitTitle(title)}
            </h2>
            <p className="text-sm sm:text-base text-zinc-200 max-w-xl mt-1 leading-relaxed font-normal">
              {subtitle}
            </p>
          </div>

          {/* Quick build switches */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {builds.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBuildId(b.id)}
                className={`px-4 py-2 rounded-xl text-sm font-mono font-bold uppercase transition-all whitespace-nowrap border ${
                  activeBuildId === b.id
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-lg shadow-amber-500/10 font-extrabold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-850 hover:bg-zinc-800/60'
                }`}
              >
                {b.name.replace('Nissan ', '').replace('Honda ', '').replace('Toyota ', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Build Card Block */}
        <div className="max-w-5xl mx-auto items-stretch">
          
          {/* Left: Interactive Build Photo & Specs */}
          <div className="flex flex-col justify-between bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative group">
            
            {/* Visual Header */}
            <div className="relative h-[280px] sm:h-[380px] overflow-hidden">
              <MediaShowcase
                src={currentMediaUrl}
                alt={activeBuild.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />

              {/* Floating Social Badge */}
              <a
                href={`https://instagram.com/${activeBuild.instagram?.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="absolute top-4 left-4 bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 text-sm font-mono text-zinc-300 hover:text-amber-400 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                <span>{activeBuild.instagram}</span>
              </a>

              {/* Multiple Images Thumbnail Navigation */}
              {buildImages.length > 1 && (
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                  {buildImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition-all shadow-lg ${
                        activeImageIndex === idx 
                          ? 'border-amber-400 scale-105' 
                          : 'border-zinc-800/60 opacity-60 hover:opacity-100 hover:border-zinc-600'
                      }`}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <MediaShowcase 
                        src={imgUrl} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Title Overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <span className="text-[11px] font-mono uppercase bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-xs font-black">
                  PROJECT MACHINE
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white italic font-mono uppercase mt-1">
                  {activeBuild.name}
                </h3>
                <p className="text-sm sm:text-base text-amber-400 font-mono">{activeBuild.model}</p>
              </div>
            </div>

            {/* Spec Details Grid */}
            <div className="p-5 sm:p-6 bg-zinc-950 border-t border-zinc-800 space-y-4">
              <p className="text-sm sm:text-base text-zinc-100 text-left leading-relaxed italic font-medium">
                "{activeBuild.description}"
              </p>

              {/* Dynamic Action Buttons for Video or External links */}
              {(activeBuild.videoUrl || activeBuild.linkUrl) && (
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {activeBuild.videoUrl && (
                    <a
                      href={activeBuild.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-white border border-zinc-800 rounded-xl flex items-center gap-2 font-mono text-sm font-bold transition-all"
                    >
                      <Video className="w-4 h-4 text-amber-400" />
                      <span>Watch Build Video</span>
                    </a>
                  )}
                  {activeBuild.linkUrl && (
                    <a
                      href={activeBuild.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-white border border-zinc-800 rounded-xl flex items-center gap-2 font-mono text-sm font-bold transition-all"
                    >
                      <Link className="w-4 h-4 text-amber-400" />
                      <span>Build specs & log</span>
                    </a>
                  )}
                </div>
              )}

              {/* Detailed Performance Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-800/80 text-left">
                <div className="space-y-1">
                  <span className="text-[11px] text-zinc-300 font-mono uppercase block font-semibold">Engine block</span>
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-sm font-bold text-zinc-100 font-mono truncate">{activeBuild.engine}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-zinc-300 font-mono uppercase block font-semibold">Dyno power</span>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="text-sm font-black text-white font-mono">{activeBuild.power}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-zinc-300 font-mono uppercase block font-semibold">Finish</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 border border-zinc-600 block" style={{
                      backgroundColor: activeBuild.color?.toLowerCase().includes('purple') ? '#632b85' : activeBuild.color?.toLowerCase().includes('white') ? '#f3f4f6' : activeBuild.color?.toLowerCase().includes('yellow') ? '#facc15' : '#dc2626'
                    }} />
                    <span className="text-sm font-bold text-zinc-100 font-mono">{activeBuild.color}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-zinc-300 font-mono uppercase block font-semibold">Driver / Owner</span>
                  <div className="flex items-start gap-1.5 mt-0.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-bold text-zinc-100 font-mono break-words">{activeBuild.owner}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
