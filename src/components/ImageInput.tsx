import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import { MediaShowcase, isMediaVideo } from './MediaShowcase';

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * ImageInput allows users to EITHER upload a local photo/video file (compressed or validated for size)
 * OR paste a direct media URL (supports image links, YouTube, and Facebook videos).
 */
export const ImageInput: React.FC<ImageInputProps> = ({
  label,
  value = '',
  onChange,
  placeholder = 'https://... or YouTube/Facebook video link',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const safeValue = value ?? '';
  const isDataUrl = safeValue.startsWith('data:image/') || safeValue.startsWith('data:video/');
  const [urlError, setUrlError] = useState(false);

  const [mode, setMode] = useState<'upload' | 'url'>(() => {
    return safeValue && isDataUrl ? 'upload' : 'url';
  });

  const [originalUrl, setOriginalUrl] = useState<string>(() => {
    return safeValue && !isDataUrl ? safeValue : '';
  });

  // Track the original URL when it loads from Firestore
  React.useEffect(() => {
    if (safeValue && !isDataUrl && !originalUrl) {
      setOriginalUrl(safeValue);
    }
  }, [safeValue, isDataUrl, originalUrl]);

  const processFile = (file: File) => {
    // 1. Process Video upload
    if (file.type.startsWith('video/')) {
      if (file.size > 20 * 1024 * 1024) { // Increased to 20MB as requested
        alert("This video file is too large (Limit is 20MB). For the best performance and to avoid database size limits, we highly recommend using the 'Media Link' tab above to paste a YouTube, Facebook, or external video URL!");
        return;
      }
      setIsCompressing(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target?.result as string);
        setIsCompressing(false);
      };
      reader.onerror = () => {
        setIsCompressing(false);
        alert('Failed to read video file.');
      };
      reader.readAsDataURL(file);
      return;
    }

    // 2. Process Image upload
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image or video file.');
      return;
    }

    setIsCompressing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compress and resize image to fit in Firestore safely (max 800px width/height)
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800; // Reduced to 800 to prevent 1MB limit errors

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Convert to compressed WebP or JPEG Data URL (aggressive compression)
          const dataUrl = canvas.toDataURL('image/webp', 0.6);
          
          // Double check size of string
          if (dataUrl.length > 300000) {
            // Try even smaller if it's still large
            const smallDataUrl = canvas.toDataURL('image/jpeg', 0.4);
            onChange(smallDataUrl);
          } else {
            onChange(dataUrl);
          }
        } else {
          // Fallback to original data URL if canvas context fails
          onChange(e.target?.result as string);
        }
        setIsCompressing(false);
      };

      img.onerror = () => {
        setIsCompressing(false);
        alert('Could not process image file. Please try another photo.');
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      setIsCompressing(false);
      alert('Failed to read file.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-mono text-zinc-300 font-bold uppercase">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
              mode === 'upload' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" /> Upload File
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('url');
              setUrlError(false);
            }}
            className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
              mode === 'url' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3 h-3" /> Media Link
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        onChange={handleFileChange}
        onClick={(e) => e.stopPropagation()}
        className="hidden"
      />

      {/* Preview Box & Upload Dropzone / URL Input */}
      <div className="space-y-3">
        {mode === 'url' ? (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={isDataUrl ? '' : safeValue}
                onChange={(e) => {
                  setUrlError(false);
                  onChange(e.target.value);
                }}
                placeholder={placeholder}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:border-amber-400 focus:outline-none"
              />
              {safeValue && (
                <button
                  type="button"
                  onClick={() => {
                    setUrlError(false);
                    onChange('');
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {isDataUrl && (
              <p className="text-[11px] font-mono text-amber-400">
                ⚠️ Current media is an uploaded file. Enter an external link above to replace it, or switch back to Upload.
              </p>
            )}
            {originalUrl && originalUrl !== value && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setUrlError(false);
                    onChange(originalUrl);
                    setMode('url');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-[11px] text-amber-400 font-mono transition-colors font-bold"
                >
                  ↩️ Revert to Original Link Media
                </button>
              </div>
            )}
            <p className="text-[11px] font-mono text-zinc-400">
              💡 Tip: Paste image links, YouTube video links, or Facebook watch video links.
            </p>
            {safeValue && !isDataUrl && (
              <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 mt-2">
                {urlError ? (
                  <div className="p-4 text-center bg-zinc-900/80 text-amber-400 text-sm font-mono">
                    ⚠️ Preview could not be loaded from this link. The link will still be saved and render successfully on the landing page!
                  </div>
                ) : (
                  <>
                    <div className="w-full h-32 bg-zinc-900">
                      <MediaShowcase
                        src={safeValue}
                        alt="Media Preview"
                        className="w-full h-full object-cover"
                        onError={() => setUrlError(true)}
                      />
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-zinc-900/90 border border-zinc-700/80 rounded text-[11px] font-mono text-emerald-400 z-10">
                      Preview Active
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : safeValue ? (
          <div className="space-y-2">
            <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 group">
              <div className="w-full h-36 bg-zinc-900">
                <MediaShowcase
                  src={safeValue}
                  alt="Media preview"
                  className="w-full h-full object-cover cursor-pointer"
                  onError={() => {}}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80 pointer-events-none" />
              
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono text-zinc-300 z-10">
                <span className="px-2 py-0.5 bg-zinc-900/90 border border-zinc-700/80 rounded-md backdrop-blur-sm flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  {isDataUrl ? 'Uploaded File (Firestore Ready)' : 'Media Link Connected'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" /> Change
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="Remove media"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            {originalUrl && originalUrl !== value && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setUrlError(false);
                    onChange(originalUrl);
                    setMode('url');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-[11px] text-amber-400 font-mono transition-colors rounded-xl font-bold"
                >
                  ↩️ Undo Upload & Restore Link
                </button>
              </div>
            )}
            {isCompressing && (
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-amber-400 text-sm font-mono">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing media resource...</span>
              </div>
            )}
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              dragActive
                ? 'border-amber-400 bg-amber-500/10'
                : 'border-zinc-800 hover:border-amber-500/50 bg-zinc-950 hover:bg-zinc-900/50'
            }`}
          >
            {isCompressing ? (
              <div className="py-3 flex flex-col items-center gap-2 text-amber-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-mono">Processing media for Firestore...</span>
              </div>
            ) : (
              <>
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-mono text-zinc-200 font-bold">
                    Click to browse or drop file here
                  </p>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    Supports JPG, PNG, WEBP and short MP4/WebM clips (optimized under 20MB)
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
