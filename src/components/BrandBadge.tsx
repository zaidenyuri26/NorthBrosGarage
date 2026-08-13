import React from 'react';

export interface BrandBadgeProps {
  brandName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const renderBrandBadgeNode = (brandName: string, size: 'sm' | 'md' | 'lg' = 'md') => {
  const normalized = brandName.trim().toUpperCase();

  if (normalized.includes('NORTH')) {
    return (
      <div className={`text-zinc-200 px-2 py-1 flex items-baseline font-sans font-black italic bg-transparent ${size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-base px-4 py-2' : 'text-xs'}`}>
        <span className="brand-line1-text-sm">NORTH</span>
        <span className="text-[#e5a823] ml-0.5">BROS</span>
      </div>
    );
  }

  if (normalized.includes('TAKATA')) {
    return (
      <div className={`bg-emerald-600 text-white px-2.5 py-1 rounded-sm tracking-widest font-sans border border-emerald-400/80 shadow-md shadow-emerald-900/40 text-center font-black ${size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-base px-4 py-2' : 'text-xs'}`}>
        TAKATA
      </div>
    );
  }
  if (normalized.includes('HKS')) {
    return (
      <div className={`flex items-center justify-center gap-1 text-emerald-400 italic font-black tracking-tight ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-base'}`}>
        <span className="text-emerald-300">HKS</span>
        <span className="text-[9px] not-italic font-mono text-zinc-400">HI-POWER</span>
      </div>
    );
  }
  if (normalized.includes('SPOON')) {
    return (
      <div className={`text-sky-400 italic font-black tracking-tighter flex items-center justify-center gap-1 ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-base'}`}>
        <span className="text-sky-300">Spoon</span>
        <span className="text-[9px] uppercase tracking-normal text-sky-500 font-sans">Sports</span>
      </div>
    );
  }
  if (normalized.includes('RAYS')) {
    return (
      <div className="text-zinc-100 font-extrabold tracking-widest italic flex flex-col items-center">
        <span className={size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}>RAYS</span>
        <span className="text-[7px] text-zinc-400 not-italic font-sans -mt-0.5 uppercase tracking-wider">VOLK RACING</span>
      </div>
    );
  }
  if (normalized.includes('BRIDE')) {
    return (
      <div className={`text-red-500 font-black tracking-widest drop-shadow-[0_0_8px_rgba(239,68,68,0.4)] text-center ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-base'}`}>
        BRIDE
      </div>
    );
  }
  if (normalized.includes('GREDDY')) {
    return (
      <div className={`text-amber-400 italic font-black tracking-tighter text-center ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-base'}`}>
        GReddy
      </div>
    );
  }
  if (normalized.includes('TOMEI')) {
    return (
      <div className={`text-zinc-200 font-black tracking-wider border-b-2 border-red-500 pb-0.5 text-center inline-block ${size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-base' : 'text-xs'}`}>
        TOMEI POWERED
      </div>
    );
  }
  if (normalized.includes('ENDLESS')) {
    return (
      <div className={`text-blue-400 font-extrabold italic tracking-wider text-center ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}`}>
        ENDLESS
      </div>
    );
  }
  if (normalized.includes('MOMO')) {
    return (
      <div className={`bg-amber-400 text-zinc-950 font-black tracking-widest rounded-xs text-center inline-block shadow-sm px-2.5 py-0.5 ${size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-base px-4 py-1' : 'text-xs'}`}>
        MOMO
      </div>
    );
  }
  if (normalized.includes("APEX")) {
    return (
      <div className={`text-purple-400 font-black italic tracking-wider text-center ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}`}>
        APEX'i
      </div>
    );
  }
  if (normalized.includes('TRUST')) {
    return (
      <div className={`text-orange-400 font-black tracking-widest uppercase text-center ${size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-base' : 'text-xs'}`}>
        TRUST GPP
      </div>
    );
  }
  if (normalized.includes('WORK')) {
    return (
      <div className={`text-yellow-400 font-extrabold tracking-widest italic text-center ${size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-base' : 'text-xs'}`}>
        WORK WHEELS
      </div>
    );
  }
  if (normalized.includes('RECARO')) {
    return (
      <div className={`text-zinc-100 font-black tracking-wider border border-zinc-600 px-2 py-0.5 rounded text-center bg-zinc-900/80 ${size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-base px-3 py-1' : 'text-xs'}`}>
        RECARO
      </div>
    );
  }
  if (normalized.includes('PROJECT')) {
    return (
      <div className={`text-teal-400 font-extrabold italic tracking-tight text-center ${size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-base' : 'text-xs'}`}>
        PROJECT µ
      </div>
    );
  }
  if (normalized.includes('NISMO')) {
    return (
      <div className={`text-red-600 font-black italic tracking-widest text-center flex items-center justify-center ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-sm'}`}>
        <span>NISMO</span>
      </div>
    );
  }

  return (
    <span className={`font-black uppercase tracking-wider text-amber-400 ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}`}>
      {brandName}
    </span>
  );
};

export const BrandBadge: React.FC<BrandBadgeProps> = ({ brandName, className = '', size }: BrandBadgeProps) => {
  const badgeSize = (size === 'sm' || size === 'lg' || size === 'md') ? size : 'md';
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {renderBrandBadgeNode(brandName, badgeSize)}
    </div>
  );
};
