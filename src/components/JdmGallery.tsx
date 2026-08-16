import React, { useState, useEffect, useMemo } from 'react';
import { Camera, ChevronRight, Zap, Cpu, Compass, ShoppingCart, Eye, Sparkles, Video, Link, Maximize2, Play, Image as ImageIcon, Layers } from 'lucide-react';
import { Product, GalleryBuild, SiteSettings } from '../types';
import { MediaShowcase } from './MediaShowcase';
import { MediaLightboxModal, LightboxMediaItem } from './MediaLightboxModal';

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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

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
    ? [activeBuild.image, ...(activeBuild.additionalImages || []).filter(img => img && img.trim() !== '')]
    : [];
  const currentMediaUrl = buildImages[activeImageIndex] || buildImages[0];

  // Auto-carousel for build photos
  useEffect(() => {
    if (buildImages.length > 1 && !isLightboxOpen) {
      const interval = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % buildImages.length);
      }, 4000); // Rotate every 4 seconds
      return () => clearInterval(interval);
    }
  }, [buildImages.length, activeBuildId, isLightboxOpen]);

  // Construct comprehensive media list for lightbox (all photos and videos)
  const lightboxMediaList: LightboxMediaItem[] = useMemo(() => {
    if (!builds || builds.length === 0) return [];
    
    const list: LightboxMediaItem[] = [];

    // First add active build photos and video
    if (activeBuild) {
      const images = [activeBuild.image, ...(activeBuild.additionalImages || []).filter(img => img && img.trim() !== '')];
      images.forEach((img, idx) => {
        list.push({
          id: `${activeBuild.id}-img-${idx}`,
          src: img,
          title: activeBuild.name,
          subtitle: `${activeBuild.model} • Photo #${idx + 1}`,
          description: activeBuild.description,
          category: 'PROJECT MACHINE',
          engine: activeBuild.engine,
          power: activeBuild.power,
          color: activeBuild.color,
          owner: activeBuild.owner,
          instagram: activeBuild.instagram,
          linkUrl: activeBuild.linkUrl,
          videoUrl: activeBuild.videoUrl,
        });
      });

      // If active build has a video, add it as a video item in the gallery
      if (activeBuild.videoUrl) {
        list.push({
          id: `${activeBuild.id}-video`,
          src: activeBuild.videoUrl,
          title: `${activeBuild.name} (Build Video)`,
          subtitle: `${activeBuild.model} • Official Track & Dyno Footage`,
          description: activeBuild.description,
          category: 'TUNER VIDEO',
          engine: activeBuild.engine,
          power: activeBuild.power,
          color: activeBuild.color,
          owner: activeBuild.owner,
          instagram: activeBuild.instagram,
          videoUrl: activeBuild.videoUrl,
        });
      }
    }

    // Then append media from all other builds in sequence
    builds.forEach((b) => {
      if (b.id !== activeBuild?.id) {
        const bImgs = [b.image, ...(b.additionalImages || []).filter(img => img && img.trim() !== '')];
        bImgs.forEach((img, idx) => {
          list.push({
            id: `${b.id}-img-${idx}`,
            src: img,
            title: b.name,
            subtitle: `${b.model} • Photo #${idx + 1}`,
            description: b.description,
            category: 'PROJECT MACHINE',
            engine: b.engine,
            power: b.power,
            color: b.color,
            owner: b.owner,
            instagram: b.instagram,
            linkUrl: b.linkUrl,
            videoUrl: b.videoUrl,
          });
        });

        if (b.videoUrl) {
          list.push({
            id: `${b.id}-video`,
            src: b.videoUrl,
            title: `${b.name} (Build Video)`,
            subtitle: `${b.model} • Official Dyno Footage`,
            description: b.description,
            category: 'TUNER VIDEO',
            engine: b.engine,
            power: b.power,
            color: b.color,
            owner: b.owner,
            instagram: b.instagram,
            videoUrl: b.videoUrl,
          });
        }
      }
    });

    return list;
  }, [builds, activeBuild]);

  const openLightboxAt = (index: number) => {
    setLightboxInitialIndex(index);
    setIsLightboxOpen(true);
  };

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
          
          {/* Interactive Build Photo & Specs */}
          <div className="flex flex-col justify-between bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative group">
            
            {/* Visual Header / Clickable Lightbox Trigger */}
            <div 
              className="relative h-[300px] sm:h-[420px] overflow-hidden cursor-pointer"
              onClick={() => openLightboxAt(activeImageIndex)}
              title="Click to expand high-resolution photos & video in lightbox"
            >
              <MediaShowcase
                src={currentMediaUrl}
                alt={activeBuild.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent pointer-events-none" />

              {/* Floating Social Badge */}
              {activeBuild.instagram && (
                <a
                  href={`https://instagram.com/${activeBuild.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-4 left-4 bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 text-sm font-mono text-zinc-300 hover:text-amber-400 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md transition-colors z-20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                  <span>{activeBuild.instagram}</span>
                </a>
              )}

              {/* Click to Zoom / Expand Hint Overlay */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-zinc-950/80 hover:bg-amber-500 text-zinc-300 hover:text-zinc-950 border border-zinc-700/80 px-3.5 py-1.5 rounded-full font-mono text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all shadow-xl group-hover:border-amber-400">
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">VIEW FULL MEDIA GALLERY</span>
                <span className="sm:hidden">EXPAND</span>
                <span className="text-amber-400 group-hover:text-zinc-950 font-black">({lightboxMediaList.length})</span>
              </div>

              {/* Multiple Images Thumbnail Navigation */}
              {buildImages.length > 1 && (
                <div 
                  className="absolute top-4 right-4 flex flex-col gap-2 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  {buildImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveImageIndex(idx);
                        openLightboxAt(idx);
                      }}
                      className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition-all shadow-lg relative ${
                        activeImageIndex === idx 
                          ? 'border-amber-400 scale-105' 
                          : 'border-zinc-800/60 opacity-60 hover:opacity-100 hover:border-zinc-600'
                      }`}
                      aria-label={`View photo ${idx + 1}`}
                      title={`Click to view photo #${idx + 1}`}
                    >
                      <MediaShowcase 
                        src={imgUrl} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                      />
                      {activeImageIndex === idx && (
                        <div className="absolute inset-0 bg-amber-500/20" />
                      )}
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

              {/* Dynamic Action Buttons for Video, Lightbox, or External links */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* View Full Lightbox Button */}
                <button
                  type="button"
                  onClick={() => openLightboxAt(activeImageIndex)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-sm font-black rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10 active:scale-95"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Open Media Gallery ({lightboxMediaList.length} Items)</span>
                </button>

                {activeBuild.videoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      // Find video index in lightbox list
                      const vidIdx = lightboxMediaList.findIndex(item => item.id?.includes('video'));
                      openLightboxAt(vidIdx !== -1 ? vidIdx : 0);
                    }}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-white border border-zinc-800 rounded-xl flex items-center gap-2 font-mono text-sm font-bold transition-all"
                  >
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>Watch Build Video</span>
                  </button>
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

      {/* FULL-SCREEN MEDIA LIGHTBOX MODAL */}
      <MediaLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        items={lightboxMediaList}
        initialIndex={lightboxInitialIndex}
      />
    </section>
  );
};

