import React from 'react';
import { Flame, Disc, Armchair, CircleDot, Cpu, Layers } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../types';

interface CategoryListProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Exhaust & Turbo': <Flame className="w-6 h-6 text-orange-500" />,
  'Suspension & Brakes': <Disc className="w-6 h-6 text-amber-400" />,
  'Interior & Seats': <Armchair className="w-6 h-6 text-red-500" />,
  'Wheels & Tires': <CircleDot className="w-6 h-6 text-sky-400" />,
  'Engine & Tuning': <Cpu className="w-6 h-6 text-emerald-400" />,
};

const CATEGORY_DESC: Record<string, string> = {
  'Exhaust & Turbo': 'High-flow manifolds, turbos & titanium catbacks',
  'Suspension & Brakes': 'Coilovers, big brake kits & dampers',
  'Interior & Seats': 'Racing bucket seats, steering wheels & harnesses',
  'Wheels & Tires': 'Forged mono-block wheels & semi-slicks',
  'Engine & Tuning': 'Forged internals, cams & ECU upgrades',
};

export const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory, selectedCategory }) => {
  return (
    <section className="py-14 bg-zinc-950 text-white border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">Precision Categorization</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight font-mono">BROWSE BY PERFORMANCE CATEGORY</h3>
          </div>
          <p className="text-zinc-400 text-sm max-w-md">
            Select a specialized category to explore championship-grade JDM components engineered for maximum track and street performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <button
            onClick={() => onSelectCategory('All')}
            className={`p-5 rounded-2xl border text-left transition-all duration-300 group flex flex-col justify-between min-h-[140px] ${
              selectedCategory === 'All' || selectedCategory === ''
                ? 'bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-900 border-amber-500 shadow-lg shadow-amber-500/10'
                : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 group-hover:border-amber-500/50 transition-colors">
                <Layers className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 rounded">
                All Parts
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors mt-2">
                Full Catalog
              </h4>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-1">Explore all available JDM inventory</p>
            </div>
          </button>

          {PRODUCT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 group flex flex-col justify-between min-h-[140px] ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-900 border-amber-500 shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 group-hover:border-amber-500/50 transition-colors">
                    {CATEGORY_ICONS[cat] || <Layers className="w-6 h-6 text-amber-400" />}
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors mt-2">
                    {cat}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{CATEGORY_DESC[cat] || 'Performance hardware'}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
