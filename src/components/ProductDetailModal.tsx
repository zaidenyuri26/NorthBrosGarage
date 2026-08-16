import React from 'react';
import { X, ShoppingBag, ShieldCheck, Check, Truck, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [added, setAdded] = React.useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Image & Badges */}
          <div className="relative bg-zinc-950 h-72 md:h-full min-h-[300px]">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800'}
              alt={product.name}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800';
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />
            
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-amber-500 text-zinc-950 font-mono font-black text-sm px-3 py-1 rounded-md">
                {product.brand}
              </span>
              <span className="bg-zinc-900/90 text-zinc-300 border border-zinc-700 font-mono text-[11px] px-2.5 py-0.5 rounded-md backdrop-blur-md">
                {product.category}
              </span>
            </div>
          </div>

          {/* Details Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white italic font-sans uppercase tracking-tight">{product.name}</h2>
                <div className="mt-3 p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Current Price</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-mono font-black text-[#e5a823]">
                        ₱{product.price.toLocaleString()}
                      </span>
                      <span className="text-sm font-mono text-zinc-400 font-bold">PHP</span>
                    </div>
                  </div>
                  {product.stock > 0 && (
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                      Ready to Ship
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                {product.description}
              </p>

              {/* Fitment Box */}
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">COMPATIBLE VEHICLES / FITMENT</span>
                <p className="text-sm font-mono font-bold text-amber-300">{product.fitment}</p>
              </div>

              {/* Specifications Table */}
              <div className="space-y-2">
                <span className="text-sm font-mono text-zinc-400 font-bold uppercase tracking-wider block">Technical Specifications</span>
                <div className="bg-zinc-950 rounded-xl border border-zinc-800 divide-y divide-zinc-800/80 text-sm font-mono">
                  {Object.entries(product.specs || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between p-2.5 px-3">
                      <span className="text-zinc-500">{key}</span>
                      <span className="text-zinc-200 font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-sm">
                {product.stock > 0 ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                    <Check className="w-4 h-4" /> In Stock ({product.stock} units ready to dispatch)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-400 font-mono">
                    <AlertCircle className="w-4 h-4" /> Currently Out of Stock (Special import on request)
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-800">
              <button
                onClick={handleAdd}
                disabled={product.stock <= 0}
                className={`w-full font-bold py-3 px-4 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Shopping Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Shopping Cart
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
