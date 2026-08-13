import React from 'react';
import { renderBrandBadgeNode } from './BrandBadge';
import { PRODUCT_BRANDS } from '../types';

interface BrandHeaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  brandName?: string;
  brandSubtitle?: string;
  variant?: 'standard' | 'badge' | 'inverted';
}

/**
 * NorthBros Garage Official Brand Typography and Emblem
 * Precisely matched to the signature racing slant:
 * "North" in bold italic + "BROS" in high-contrast motorsport gold + "— GARAGE —" with dual gold bars
 */
export const BrandHeader: React.FC<BrandHeaderProps> = ({
  size = 'md',
  className = '',
  brandName = 'NorthBros',
  brandSubtitle = 'GARAGE',
  variant = 'standard'
}) => {
  const sizeConfig = {
    xs: {
      text: 'text-lg sm:text-xl',
      sub: 'text-[9px] tracking-[0.25em]',
      line: 'h-[1.5px]',
      gap: 'gap-1.5'
    },
    sm: {
      text: 'text-xl sm:text-2xl',
      sub: 'text-[10px] sm:text-[11px] tracking-[0.3em]',
      line: 'h-[1.5px]',
      gap: 'gap-2'
    },
    md: {
      text: 'text-2xl sm:text-3xl md:text-4xl',
      sub: 'text-xs sm:text-sm tracking-[0.35em]',
      line: 'h-[2px]',
      gap: 'gap-2.5'
    },
    lg: {
      text: 'text-4xl sm:text-5xl md:text-6xl',
      sub: 'text-sm sm:text-base md:text-lg tracking-[0.4em]',
      line: 'h-[2.5px]',
      gap: 'gap-3'
    },
    xl: {
      text: 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl',
      sub: 'text-base sm:text-xl tracking-[0.45em]',
      line: 'h-[3px]',
      gap: 'gap-4'
    }
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  const renderStyledBrandName = (name: string) => {
    const raw = (name || 'NorthBros').trim();
    const lower = raw.toLowerCase();

    if (lower.includes('north') && lower.includes('bros')) {
      return (
        <span className="inline-flex items-baseline font-black italic tracking-[-0.04em] uppercase font-sans">
          <span className="brand-line1-text">North</span>
          <span className="brand-line2-text ml-0.5">Bros</span>
        </span>
      );
    } else if (lower.includes('north')) {
      const parts = raw.split(/north/i);
      return (
        <span className="inline-flex items-baseline font-black italic tracking-[-0.04em] uppercase font-sans">
          {parts[0] && <span className="brand-line1-text">{parts[0]}</span>}
          <span className="brand-line1-text">North</span>
          {parts[1] && <span className="brand-line2-text">{parts[1]}</span>}
        </span>
      );
    } else if (lower.includes('bros')) {
      const parts = raw.split(/bros/i);
      return (
        <span className="inline-flex items-baseline font-black italic tracking-[-0.04em] uppercase font-sans">
          <span className="brand-line1-text">{parts[0]}</span>
          <span className="brand-line2-text ml-0.5">Bros</span>
          {parts[1] && <span className="brand-line1-text">{parts[1]}</span>}
        </span>
      );
    }

    return (
      <span className="inline-flex items-baseline font-black italic tracking-[-0.04em] uppercase font-sans brand-line1-text">
        {raw}
      </span>
    );
  };

  return (
    <div className={`inline-flex flex-col items-center select-none bg-transparent ${className}`}>
      {/* Brand Name Text with Racing Slant & Gold Accent directly on main background */}
      <div className={`font-black italic uppercase leading-none ${currentSize.text}`}>
        {renderStyledBrandName(brandName)}
      </div>
      
      {/* Subtitle with High-Precision Horizontal Gold Lines: — GARAGE — */}
      <div className={`w-full flex items-center justify-center ${currentSize.gap} mt-1.5`}>
        <div className={`${currentSize.line} flex-1 bg-gradient-to-r from-transparent via-[#e5a823] to-[#e5a823] rounded-full`} />
        <span className={`font-extrabold font-sans text-zinc-300 tracking-[0.3em] uppercase ${currentSize.sub} shrink-0`}>
          {brandSubtitle || 'GARAGE'}
        </span>
        <div className={`${currentSize.line} flex-1 bg-gradient-to-r from-[#e5a823] via-[#e5a823] to-transparent rounded-full`} />
      </div>
    </div>
  );
};

/**
 * NorthBros Angular Garage Emblem Banner (Direct homage to the reference image)
 */
export const NorthBrosAngledEmblem: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'h-10 px-2',
    md: 'h-14 px-3',
    lg: 'h-20 px-4'
  };

  return (
    <div className={`inline-block relative select-none bg-transparent ${className}`}>
      <div className={`flex items-center justify-center ${sizeMap[size]}`}>
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-baseline font-black italic tracking-tighter uppercase leading-none">
            <span className="brand-line1-text text-base sm:text-xl md:text-2xl">NORTH</span>
            <span className="brand-line2-text text-base sm:text-xl md:text-2xl ml-0.5">BROS</span>
          </div>
          <div className="flex items-center gap-1.5 w-full mt-1">
            <div className="h-[1.5px] flex-1 bg-[#e5a823]" />
            <span className="text-[8px] sm:text-[10px] font-black text-zinc-300 tracking-[0.25em]">GARAGE</span>
            <div className="h-[1.5px] flex-1 bg-[#e5a823]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const BrandBadgesBar: React.FC = () => {
  const brands = PRODUCT_BRANDS.map((brandName) => ({
    name: brandName,
    node: renderBrandBadgeNode(brandName, 'md')
  }));

  return (
    <div className="relative w-full border-y border-zinc-800/80 py-10 px-4 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 filter contrast-125"
        style={{ backgroundImage: `url('/assets/global_bg_1786622019879-BZZu64fC.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/20 to-zinc-950/50 backdrop-blur-[0.5px]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {brands.map((brand, idx) => (
            <div 
              key={idx} 
              className="group bg-zinc-950/40 hover:bg-zinc-900/70 border border-zinc-700/60 hover:border-amber-500/70 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-amber-500/10 backdrop-blur-sm min-h-[80px]"
            >
              {brand.node}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

