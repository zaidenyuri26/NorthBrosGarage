import React, { useState, useMemo } from 'react';
import { Search, Filter, ShoppingBag, Eye, Edit3, Trash2, Plus, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Product, UserRole, SiteSettings, PRODUCT_BRANDS } from '../types';
import { renderBrandBadgeNode } from './BrandBadge';

interface PartsCatalogProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  userRole?: UserRole;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onAddNewProduct?: () => void;
  siteSettings?: SiteSettings;
}

export const PartsCatalog: React.FC<PartsCatalogProps> = ({
  products,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onAddToCart,
  onViewProduct,
  userRole,
  onEditProduct,
  onDeleteProduct,
  onAddNewProduct,
  siteSettings,
}) => {
  const badge = siteSettings?.partsBadge || 'AUTHENTIC JDM & PERFORMANCE CATALOG';
  const title = siteSettings?.partsTitle || 'AUTOMOTIVE PARTS STORE';

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

  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Exhaust & Turbo', 'Suspension & Brakes', 'Interior & Seats', 'Wheels & Tires', 'Engine & Tuning'];
  const brands = ['All', ...PRODUCT_BRANDS];

  const { directMatches, suggestions } = useMemo(() => {
    const matches: Product[] = [];
    const alternates: Product[] = [];

    products.forEach((prod) => {
      // Precise category matching with legacy support
      const matchesCategory =
        selectedCategory === 'All' ||
        selectedCategory === '' ||
        prod.category === selectedCategory ||
        (selectedCategory === 'Interior & Seats' && prod.category === 'Interior') ||
        (selectedCategory === 'Suspension & Brakes' && (prod.category === 'Suspension' || prod.category === 'Brakes')) ||
        (selectedCategory === 'Exhaust & Turbo' && (prod.category === 'Performance' || prod.category === 'Exhaust'));

      const matchesBrand =
        selectedBrand === 'All' ||
        prod.brand.toLowerCase() === selectedBrand.toLowerCase();

      const matchesStock = !onlyInStock || prod.stock > 0;

      if (!matchesCategory || !matchesBrand || !matchesStock) return;

      const isUniversal = prod.fitment.toLowerCase().includes('universal');
      const matchesText =
        !searchQuery ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.fitment.toLowerCase().includes(searchQuery.toLowerCase());

      // If matches text OR is a universal part when a search is active
      if (matchesText || (searchQuery && isUniversal)) {
        matches.push(prod);
      } else if (searchQuery) {
        // If searching but not a match, it's a suggestion
        alternates.push(prod);
      } else {
        // If no search, everything is a match (filtered by cat/brand already)
        matches.push(prod);
      }
    });

    const sortFn = (a: Product, b: Product) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    };

    return {
      directMatches: matches.sort(sortFn),
      suggestions: alternates.sort(sortFn)
    };
  }, [products, searchQuery, selectedCategory, selectedBrand, onlyInStock, sortBy]);

  const handleAddCart = (p: Product) => {
    onAddToCart(p);
    setAddedIds((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [p.id]: false }));
    }, 1500);
  };

  const renderProductGrid = (items: Product[], title?: string, subtitle?: string) => (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">{title}</h3>
            {subtitle && <p className="text-sm text-zinc-500 font-mono">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {items.map((product) => {
          const isAdded = addedIds[product.id];
          const isUniversal = product.fitment.toLowerCase().includes('universal');
          
          return (
            <div
              key={product.id}
              className="optimize-card-render bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 group hover:shadow-xl"
            >
              <div>
                {/* Image Area */}
                <div className="relative h-48 sm:h-56 bg-zinc-950 overflow-hidden cursor-pointer" onClick={() => onViewProduct(product)}>
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800'}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 will-change-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />

                  {/* Brand Badge */}
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-zinc-950/90 border border-zinc-800 text-amber-500 font-mono font-bold text-[11px] sm:text-[12px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md backdrop-blur-md">
                    {product.brand}
                  </span>

                  {/* Universal / Fitment Badge */}
                  {isUniversal && (
                    <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-emerald-500 text-zinc-950 font-mono font-extrabold text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-xs uppercase tracking-wider backdrop-blur-md shadow-lg">
                      UNIVERSAL
                    </span>
                  )}

                  {/* Featured Badge */}
                  {product.featured && !isUniversal && (
                    <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-pink-600/90 text-white font-mono font-extrabold text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-xs uppercase tracking-wider backdrop-blur-md">
                      HOT
                    </span>
                  )}

                  {/* Stock Status Tag */}
                  <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center gap-1 sm:gap-1.5 bg-zinc-950/80 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-mono backdrop-blur-md">
                    <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-amber-500'}`} />
                    <span className={product.stock > 0 ? 'text-zinc-300' : 'text-amber-400 font-bold'}>
                      {product.stock > 0 ? `${product.stock} in stock` : '0 in stock (Out of Stock)'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div>
                    <p className="text-[11px] font-mono uppercase text-amber-500 tracking-wider">
                      {product.category}
                    </p>
                    <h3
                      onClick={() => onViewProduct(product)}
                      className="text-lg font-bold text-white hover:text-amber-500 cursor-pointer transition-colors line-clamp-1 mt-0.5"
                    >
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-[12px] sm:text-sm text-zinc-200 line-clamp-2 leading-tight sm:leading-relaxed font-normal">
                    {product.description}
                  </p>

                  {/* Fitment info */}
                  <div className={`text-[11px] sm:text-[12px] font-mono px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border line-clamp-1 ${
                    isUniversal 
                      ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30 font-bold' 
                      : 'text-zinc-200 bg-zinc-950/80 border-zinc-700/80 font-medium'
                  }`}>
                    <span className={isUniversal ? 'text-emerald-400 font-bold' : 'text-zinc-400 font-bold'}>FITMENT:</span> {product.fitment}
                  </div>

                  {/* High Visibility Price Tag */}
                  <div className="pt-2 pb-1 flex items-baseline justify-between bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Item Price</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-mono font-black text-[#e5a823]">
                          ₱{product.price.toLocaleString()}
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-400">PHP</span>
                      </div>
                    </div>
                    {product.stock > 0 && (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        IN STOCK
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-3 sm:p-5 pt-0 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddCart(product)}
                    disabled={product.stock <= 0}
                    id={`add-cart-${product.id}`}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 font-bold py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-[11px] sm:text-sm uppercase tracking-wider transition-all active:scale-95 ${
                      product.stock <= 0
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : isAdded
                        ? 'bg-emerald-500 text-zinc-950 font-black'
                        : 'bg-white hover:bg-zinc-100 text-zinc-950 shadow-md shadow-white/5'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onViewProduct(product)}
                    className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
                    title="View Full Specs"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Admin Specific Actions */}
                {userRole === 'admin' && (
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-sm">
                    <span className="text-[11px] font-mono text-amber-500 font-bold">ADMIN CONTROLS</span>
                    <div className="flex items-center gap-2">
                      {onEditProduct && (
                        <button
                          onClick={() => onEditProduct(product)}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded flex items-center gap-1 font-mono text-[12px]"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      )}
                      {onDeleteProduct && (
                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="px-2 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-400 rounded flex items-center gap-1 font-mono text-[12px] border border-red-800/50"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section id="performance-parts" className="py-16 bg-transparent text-zinc-100 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-amber-400 font-mono text-sm uppercase tracking-widest mb-2 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black italic font-mono uppercase tracking-tight">
              {renderSplitTitle(title)}
            </h2>
          </div>

          {/* Admin Add New Product Button */}
          {userRole === 'admin' && onAddNewProduct && (
            <button
              onClick={onAddNewProduct}
              id="admin-add-product-btn"
              className="flex items-center gap-2 bg-white hover:bg-zinc-100 text-zinc-950 font-extrabold px-4 py-2.5 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-white/5 transition-all self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product (Admin)</span>
            </button>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 mb-8 space-y-4">
          
          {/* Categories Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-sm font-mono text-zinc-500 uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedCategory === cat || (cat === 'All' && selectedCategory === '')
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] font-mono px-1.5 rounded-md border ${
                  selectedCategory === cat || (cat === 'All' && selectedCategory === '')
                    ? 'bg-zinc-950/20 border-zinc-950/30 text-zinc-950 font-black'
                    : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                }`}>
                  {products.filter(p => {
                    if (cat === 'All') return true;
                    return p.category === cat || 
                           (cat === 'Interior & Seats' && p.category === 'Interior') ||
                           (cat === 'Suspension & Brakes' && (p.category === 'Suspension' || p.category === 'Brakes')) ||
                           (cat === 'Exhaust & Turbo' && (p.category === 'Performance' || p.category === 'Exhaust'));
                  }).length}
                </span>
              </button>
            ))}
          </div>

          {/* Brand Filter, Sort & Stock Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-800/80 text-sm">
            
            {/* Brands Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="font-mono text-zinc-500 uppercase tracking-wider shrink-0 mr-1">Brand:</span>
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center justify-center shrink-0 ${
                    selectedBrand === b
                      ? 'bg-amber-500/20 border border-amber-500 text-white shadow-md shadow-amber-500/10'
                      : 'bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                >
                  {b === 'All' ? (
                    <span className="font-mono font-bold text-xs uppercase tracking-wider">All Brands</span>
                  ) : (
                    renderBrandBadgeNode(b, 'sm')
                  )}
                </button>
              ))}
            </div>

            {/* Right Side Controls: Sort & Stock & Count */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Part Count Indicator */}
              <div className="text-[12px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                {searchQuery ? (
                  <>
                    <span className="font-bold text-white">{directMatches.length}</span> MATCHES + <span className="font-bold">{suggestions.length}</span> SUGGESTED
                  </>
                ) : (
                  <>
                    <span className="font-bold">{directMatches.length}</span> {selectedCategory === 'All' ? 'TOTAL PRODUCTS' : 'CATEGORY PRODUCTS'}
                  </>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 font-mono text-zinc-400">
                <span className="text-zinc-500">SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg py-1 px-2.5 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name A - Z</option>
                </select>
              </div>

              {/* In Stock Only Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-200 select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/50"
                />
                <span>In Stock</span>
              </label>
            </div>
          </div>

        </div>

        {/* Product Grid */}
        {directMatches.length === 0 && suggestions.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center my-8">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3 opacity-80" />
            <h3 className="text-lg sm:text-xl font-bold text-white">No parts found matching criteria</h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, clearing filters or searching for alternative JDM performance brands.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedBrand('All'); setOnlyInStock(false); }}
              className="mt-4 px-4 py-2 bg-amber-500 text-zinc-950 font-bold text-sm rounded-xl hover:bg-amber-400"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Direct Matches Section */}
            {directMatches.length > 0 && renderProductGrid(
              directMatches, 
              searchQuery ? `Guaranteed Fitment for "${searchQuery}"` : "All Performance Parts",
              searchQuery ? "Direct matches and universal performance components" : "Browse our full curated catalog"
            )}

            {/* Suggestions Section */}
            {suggestions.length > 0 && renderProductGrid(
              suggestions,
              "Other Available Parts",
              "Alternative performance components you might be interested in"
            )}
          </div>
        )}

      </div>
    </section>
  );
};
