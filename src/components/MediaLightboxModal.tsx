import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize, 
  Download, 
  Share2, 
  ExternalLink, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Info, 
  Layers, 
  Zap, 
  Cpu, 
  Compass, 
  Video as VideoIcon, 
  Image as ImageIcon 
} from 'lucide-react';
import { isMediaVideo, getYouTubeEmbedUrl } from './MediaShowcase';

export interface LightboxMediaItem {
  id?: string;
  src: string;
  title?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  owner?: string;
  engine?: string;
  power?: string;
  color?: string;
  instagram?: string;
  videoUrl?: string;
  linkUrl?: string;
  specs?: Record<string, string>;
}

interface MediaLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LightboxMediaItem[];
  initialIndex?: number;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
  isOpen,
  onClose,
  items,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInfo, setShowInfo] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, items.length - 1)));
      setZoomLevel(1);
      setShowInfo(true);
    }
  }, [isOpen, initialIndex, items.length]);

  const currentItem: LightboxMediaItem | undefined = items[currentIndex];

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel((prev) => Math.min(prev + 0.25, 3));
      } else if (e.key === '-' || e.key === '_') {
        setZoomLevel((prev) => Math.max(prev - 0.25, 1));
      } else if (e.key === '0') {
        setZoomLevel(1);
      } else if (e.key === 'i' || e.key === 'I') {
        setShowInfo((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock background scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && currentItem?.src) {
      navigator.clipboard.writeText(currentItem.src);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!isOpen || items.length === 0 || !currentItem) return null;

  const isVideo = isMediaVideo(currentItem.src) || !!currentItem.videoUrl;
  const youtubeEmbed = getYouTubeEmbedUrl(currentItem.videoUrl || currentItem.src);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 select-none animate-in fade-in duration-200"
      onClick={(e) => {
        // Close if clicking directly on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Top Controls Toolbar */}
      <div className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-transparent border-b border-zinc-800/60">
        
        {/* Left: Media Counter & Type Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700/80 rounded-full font-mono text-xs font-bold text-zinc-300">
            {isVideo ? (
              <>
                <VideoIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>VIDEO</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>PHOTO</span>
              </>
            )}
            <span className="text-zinc-500 font-normal">|</span>
            <span className="text-amber-400 font-extrabold">{currentIndex + 1}</span>
            <span className="text-zinc-500">/</span>
            <span>{items.length}</span>
          </div>

          {currentItem.title && (
            <div className="hidden sm:block">
              <h3 className="font-mono font-bold text-sm text-white truncate max-w-xs md:max-w-md">
                {currentItem.title}
              </h3>
            </div>
          )}
        </div>

        {/* Right: Actions (Zoom, Info, Fullscreen, Close) */}
        <div className="flex items-center gap-2">
          {/* Zoom controls for photos */}
          {!isVideo && (
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1">
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 1))}
                disabled={zoomLevel <= 1}
                className="p-1.5 hover:bg-zinc-800 disabled:opacity-40 rounded-lg text-zinc-400 hover:text-white transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-1.5 text-[11px] font-mono font-bold text-zinc-300 min-w-[3rem] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                disabled={zoomLevel >= 3}
                className="p-1.5 hover:bg-zinc-800 disabled:opacity-40 rounded-lg text-zinc-400 hover:text-white transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Toggle Info Overlay */}
          <button
            onClick={() => setShowInfo((prev) => !prev)}
            className={`p-2 rounded-xl border transition-colors ${
              showInfo 
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold' 
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
            }`}
            title="Toggle Specs & Details (I)"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Share / Copy Link */}
          <button
            onClick={handleShare}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 rounded-xl transition-colors relative"
            title="Copy Media Link"
          >
            <Share2 className="w-4 h-4" />
            {isCopied && (
              <span className="absolute -bottom-8 right-0 bg-amber-500 text-zinc-950 font-mono text-[10px] font-black px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                COPIED!
              </span>
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-colors hidden sm:block"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 bg-red-950/40 hover:bg-red-600 border border-red-800/60 hover:border-red-500 text-red-400 hover:text-white rounded-xl transition-all shadow-lg ml-1"
            title="Close Viewer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Center Stage */}
      <div 
        className="relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Previous Button */}
        {items.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-2xl bg-zinc-950/80 hover:bg-amber-500 border border-zinc-800 hover:border-amber-400 text-white hover:text-zinc-950 shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 group"
            aria-label="Previous media"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 transition-transform group-hover:-translate-x-0.5" />
          </button>
        )}

        {/* Media Content Display */}
        <div 
          className="relative max-w-full max-h-full flex items-center justify-center transition-all duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {youtubeEmbed ? (
            <div className="w-[90vw] max-w-4xl aspect-video rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-black">
              <iframe
                src={youtubeEmbed}
                title={currentItem.title || 'Video Player'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : isVideo ? (
            <video
              ref={videoRef}
              src={currentItem.src}
              controls
              autoPlay
              playsInline
              className="max-w-[92vw] max-h-[75vh] rounded-2xl object-contain shadow-2xl border border-zinc-800 bg-black"
            />
          ) : (
            <img
              src={currentItem.src}
              alt={currentItem.title || 'NorthBros Media Showcase'}
              referrerPolicy="no-referrer"
              className="max-w-[94vw] max-h-[76vh] object-contain rounded-2xl shadow-2xl border border-zinc-800/80 bg-zinc-950/60 select-none cursor-grab active:cursor-grabbing"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200';
              }}
            />
          )}

          {/* Details / Specs Floating Card */}
          {showInfo && (currentItem.title || currentItem.description || currentItem.engine || currentItem.power) && (
            <div 
              className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl text-left pointer-events-auto space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  {currentItem.category && (
                    <span className="text-[10px] font-mono font-black uppercase bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-sm">
                      {currentItem.category}
                    </span>
                  )}
                  <h4 className="text-lg sm:text-xl font-mono font-black text-white italic uppercase mt-1">
                    {currentItem.title}
                  </h4>
                  {currentItem.subtitle && (
                    <p className="text-xs font-mono text-amber-400">{currentItem.subtitle}</p>
                  )}
                </div>
                
                {currentItem.instagram && (
                  <a
                    href={`https://instagram.com/${currentItem.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-zinc-400 hover:text-pink-400 flex items-center gap-1 shrink-0"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                    <span>{currentItem.instagram}</span>
                  </a>
                )}
              </div>

              {currentItem.description && (
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans line-clamp-3">
                  {currentItem.description}
                </p>
              )}

              {/* Build Specs Badges */}
              {(currentItem.engine || currentItem.power || currentItem.owner) && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-[11px] font-mono">
                  {currentItem.engine && (
                    <div>
                      <span className="text-zinc-300 block">ENGINE</span>
                      <span className="font-bold text-white truncate block">{currentItem.engine}</span>
                    </div>
                  )}
                  {currentItem.power && (
                    <div>
                      <span className="text-zinc-300 block">OUTPUT</span>
                      <span className="font-black text-amber-400 block">{currentItem.power}</span>
                    </div>
                  )}
                  {currentItem.owner && (
                    <div>
                      <span className="text-zinc-300 block">BUILDER</span>
                      <span className="font-bold text-white truncate block">{currentItem.owner}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Direct links if available */}
              {(currentItem.videoUrl || currentItem.linkUrl) && (
                <div className="flex items-center gap-2 pt-1">
                  {currentItem.videoUrl && (
                    <a
                      href={currentItem.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-lg flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Watch Full Video</span>
                    </a>
                  )}
                  {currentItem.linkUrl && (
                    <a
                      href={currentItem.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs font-bold rounded-lg flex items-center gap-1 border border-zinc-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Build Specs</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Next Button */}
        {items.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-2xl bg-zinc-950/80 hover:bg-amber-500 border border-zinc-800 hover:border-amber-400 text-white hover:text-zinc-950 shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 group"
            aria-label="Next media"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {items.length > 1 && (
        <div className="relative z-30 px-4 py-3 bg-zinc-950/90 border-t border-zinc-800/80 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-center gap-2 min-w-max mx-auto">
            {items.map((item, idx) => {
              const isItemVideo = isMediaVideo(item.src) || !!item.videoUrl;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setZoomLevel(1);
                    setCurrentIndex(idx);
                  }}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    currentIndex === idx
                      ? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/20'
                      : 'border-zinc-800 opacity-50 hover:opacity-100 hover:border-zinc-600'
                  }`}
                  aria-label={`Jump to media ${idx + 1}`}
                >
                  <img
                    src={item.src}
                    alt={item.title || `Thumbnail #${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                  {isItemVideo && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                  )}
                  {currentIndex === idx && (
                    <div className="absolute inset-0 ring-2 ring-amber-400 ring-inset" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
