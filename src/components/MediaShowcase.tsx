import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface MediaShowcaseProps {
  src: string;
  alt?: string;
  className?: string;
  onError?: () => void;
  interactive?: boolean;
}

/**
 * Checks if the given URL or base64 resource is a video or embedded video link.
 */
export const isMediaVideo = (url: string): boolean => {
  if (!url) return false;
  
  // Base64 types
  if (url.startsWith('data:video/')) return true;
  if (url.startsWith('data:image/')) return false;

  const lowercase = url.toLowerCase();
  
  // Explicitly check for direct image file extensions or Facebook CDN domains
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', 'fbcdn.net'];
  if (imageExts.some(ext => lowercase.includes(ext))) {
    return false;
  }

  // Facebook video patterns
  if (
    lowercase.includes('facebook.com') || 
    lowercase.includes('fb.watch') || 
    lowercase.includes('fb.gg')
  ) {
    return true;
  }

  // YouTube video patterns
  if (lowercase.includes('youtube.com') || lowercase.includes('youtu.be')) return true;

  // Direct video file extensions
  const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
  return videoExts.some(ext => lowercase.includes(ext));
};

/**
 * Extracts and returns YouTube embed URL if applicable.
 */
export const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const lowercase = url.toLowerCase();
  if (!lowercase.includes('youtube.com') && !lowercase.includes('youtu.be')) {
    return null;
  }

  let videoId: string | null = null;

  try {
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) {
        videoId = parts[1].split(/[?#&]/)[0];
      }
    } else if (url.includes('/shorts/')) {
      const parts = url.split('/shorts/');
      if (parts[1]) {
        videoId = parts[1].split(/[?#&]/)[0];
      }
    } else if (url.includes('/live/')) {
      const parts = url.split('/live/');
      if (parts[1]) {
        videoId = parts[1].split(/[?#&]/)[0];
      }
    } else if (url.includes('/embed/')) {
      const parts = url.split('/embed/');
      if (parts[1]) {
        videoId = parts[1].split(/[?#&]/)[0];
      }
    } else if (url.includes('v=')) {
      const queryStr = url.split('?')[1] || '';
      const params = new URLSearchParams(queryStr);
      videoId = params.get('v');
    }
    
    // Fallback regex
    if (!videoId) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2] && match[2].length === 11) {
        videoId = match[2];
      }
    }
  } catch (e) {
    // Fallback silent
  }

  if (videoId && videoId.trim().length === 11) {
    const cleanId = videoId.trim();
    return `https://www.youtube.com/embed/${cleanId}?autoplay=1&mute=1&loop=1&playlist=${cleanId}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&autohide=1&enablejsapi=1&origin=${window.location.origin}`;
  }
  return null;
};

/**
 * Returns Facebook embed URL if applicable.
 */
export const getFacebookEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const lowercase = url.toLowerCase();
  
  // If it's a static image file or image link from Facebook CDN, it is NOT an embedded video player
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', 'fbcdn.net'];
  if (imageExts.some(ext => lowercase.includes(ext))) {
    return null;
  }

  if (
    lowercase.includes('facebook.com') || 
    lowercase.includes('fb.watch') || 
    lowercase.includes('fb.gg')
  ) {
    let normalizedUrl = url;

    // Normalizing subdomains to ensure maximum video player plugin compatibility
    if (lowercase.includes('m.facebook.com')) {
      normalizedUrl = url.replace(/m\.facebook\.com/i, 'www.facebook.com');
    } else if (lowercase.includes('web.facebook.com')) {
      normalizedUrl = url.replace(/web\.facebook\.com/i, 'www.facebook.com');
    } else if (lowercase.includes('touch.facebook.com')) {
      normalizedUrl = url.replace(/touch\.facebook\.com/i, 'www.facebook.com');
    }

    // Capture and translate Facebook Share format: facebook.com/share/v/<VIDEO_ID> or /share/r/<VIDEO_ID>
    const shareRegex = /facebook\.com\/share\/[vr]\/([^/?#&]+)/i;
    const shareMatch = normalizedUrl.match(shareRegex);
    if (shareMatch) {
      const videoId = shareMatch[1];
      normalizedUrl = `https://www.facebook.com/watch/?v=${videoId}`;
    }

    // Return the compliant Facebook video player plugin URL
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(normalizedUrl)}&show_text=0&autoplay=true&mute=true&muted=true&loop=true&controls=false`;
  }
  return null;
};

export const MediaShowcase: React.FC<MediaShowcaseProps> = ({
  src,
  alt = 'Media showcase',
  className = 'w-full h-full object-cover',
  onError,
  interactive = false,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!src) return null;

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!iframeRef.current) return;
    
    const command = isMuted ? 'unMute' : 'mute';
    iframeRef.current.contentWindow?.postMessage(JSON.stringify({
      event: 'command',
      func: command,
      args: ''
    }), '*');
    
    setIsMuted(!isMuted);
  };

  // 1. Check YouTube Embed
  const ytEmbed = getYouTubeEmbedUrl(src);
  if (ytEmbed) {
    return (
      <div className="relative w-full h-full overflow-hidden group/media">
        <div className={`w-full h-full ${!interactive ? 'pointer-events-none' : ''}`}>
          <iframe
            ref={iframeRef}
            src={ytEmbed}
            title={alt}
            className={`${className} scale-[1.3] transition-transform duration-700`}
            frameBorder="0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        
        {/* Mute/Unmute Toggle Overlay */}
        <button
          onClick={toggleMute}
          className="absolute bottom-6 right-6 z-10 p-3 bg-zinc-950/80 hover:bg-zinc-800 text-white rounded-full border border-zinc-800 backdrop-blur-md transition-all active:scale-95 opacity-0 group-hover/media:opacity-100 pointer-events-auto"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-zinc-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-amber-500 animate-pulse" />
          )}
        </button>

        {/* Subtle vignette to hide edges better */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
      </div>
    );
  }

  // 2. Check Facebook Embed
  const fbEmbed = getFacebookEmbedUrl(src);
  if (fbEmbed) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <iframe
          src={fbEmbed}
          title={alt}
          className={`${className} scale-[1.1]`}
          frameBorder="0"
          scrolling="no"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ border: 'none', overflow: 'hidden' }}
        />
      </div>
    );
  }

  // 3. Check Direct Video Upload/Link
  if (isMediaVideo(src)) {
    return (
      <div className="relative w-full h-full group/media">
        <video
          src={src}
          className={className}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onError={onError}
        />
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-6 right-6 z-10 p-3 bg-zinc-950/80 hover:bg-zinc-800 text-white rounded-full border border-zinc-800 backdrop-blur-md transition-all opacity-0 group-hover/media:opacity-100"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-zinc-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-amber-500 animate-pulse" />
          )}
        </button>
      </div>
    );
  }

  // 4. Default to Image Fallback
  if (!src || src.trim() === '') {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt || "Media"}
      className={className}
      referrerPolicy="no-referrer"
      onError={onError}
    />
  );
};
