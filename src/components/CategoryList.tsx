import React from 'react';
import { Filter } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../types';

interface CategoryListProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory, selectedCategory }) => {
  return (
    <section className="py-12 bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Filter className="w-6 h-6 text-amber-500" />
          Browse by Category
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-amber-500 hover:bg-zinc-800 transition-all text-left group"
            >
              <span className="text-lg font-semibold text-zinc-100 group-hover:text-white">
                {cat}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
