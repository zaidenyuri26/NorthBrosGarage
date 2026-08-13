import React from 'react';

interface BrandHeaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  brandName?: string;
  brandSubtitle?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  size = 'md',
  className = '',
  brandName = 'NORTHBROS',
  brandSubtitle = 'GARAGE'
}) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl md:text-4xl',
    lg: 'text-5xl md:text-7xl',
  };

  const garageSize = {
    sm: 'text-[11px] tracking-[0.3em]',
    md: 'text-sm md:text-base tracking-[0.4em]',
    lg: 'text-base md:text-2xl tracking-[0.5em]',
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Brand Name Text */}
      <div className={`font-black italic tracking-tighter uppercase font-mono ${sizeClasses[size]}`}>
        <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">{brandName}</span>
      </div>
      
      {/* Subtitle with Framing Accent Bars */}
      <div className="w-full flex items-center justify-center gap-2 mt-0.5">
        <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-red-500 to-red-600 rounded-full" />
        <span className={`font-bold font-mono text-red-500 uppercase ${garageSize[size]}`}>
          {brandSubtitle}
        </span>
        <div className="h-[2px] flex-1 bg-gradient-to-r from-red-600 via-red-500 to-transparent rounded-full" />
      </div>
    </div>
  );
};


export const BrandBadgesBar: React.FC = () => {
  return (
    <div className="w-full bg-zinc-950/95 border-y border-zinc-800/80 py-3.5 px-4 overflow-x-auto no-scrollbar backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[900px] gap-6 text-sm font-mono font-bold tracking-wider">
        
        {/* TAKATA */}
        <div className="bg-emerald-600 text-white px-2.5 py-1 rounded-sm tracking-widest font-sans border border-emerald-400/80 shadow-md shadow-emerald-900/40 shrink-0">
          TAKATA
        </div>

        {/* HKS */}
        <div className="flex items-center gap-1 text-emerald-400 italic font-black tracking-tight text-base shrink-0">
          <span className="text-emerald-300">HKS</span>
          <span className="text-[10px] not-italic font-mono text-zinc-400">HI-POWER</span>
        </div>

        {/* Spoon Sports */}
        <div className="text-sky-400 italic font-black tracking-tighter text-base flex items-center gap-1 shrink-0">
          <span className="text-sky-300">Spoon</span>
          <span className="text-[10px] uppercase tracking-normal text-sky-500 font-sans">Sports</span>
        </div>

        {/* RAYS */}
        <div className="text-zinc-100 font-extrabold tracking-widest italic flex flex-col items-center shrink-0">
          <span className="text-base">RAYS</span>
          <span className="text-[8px] text-zinc-500 not-italic font-sans -mt-1 uppercase">VOLK RACING</span>
        </div>

        {/* BRIDE */}
        <div className="text-red-500 font-black tracking-widest text-base drop-shadow-[0_0_8px_rgba(239,68,68,0.4)] shrink-0">
          BRIDE
        </div>

        {/* GReddy */}
        <div className="text-amber-400 italic font-black text-base tracking-tighter shrink-0">
          GReddy
        </div>

        {/* Tomei */}
        <div className="text-zinc-200 font-black tracking-wider text-sm border-b border-red-500 shrink-0">
          TOMEI POWERED
        </div>

        {/* Endless */}
        <div className="text-blue-400 font-extrabold italic text-sm tracking-wider shrink-0">
          ENDLESS
        </div>

        {/* ADVAN */}
        <div className="bg-red-600 text-white px-2 py-0.5 font-black text-[12px] tracking-widest rounded-xs italic shrink-0">
          ADVAN
        </div>

        {/* MOMO */}
        <div className="bg-amber-400 text-zinc-950 px-2.5 py-0.5 font-black text-sm tracking-widest rounded-xs shrink-0">
          MOMO
        </div>

        {/* Cusco */}
        <div className="text-cyan-400 font-bold text-sm uppercase tracking-widest shrink-0">
          CUSCO
        </div>

      </div>
    </div>
  );
};
