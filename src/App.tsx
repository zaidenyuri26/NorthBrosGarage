import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { auth } from './lib/firebase';
import {
  fetchProducts,
  fetchServices,
  fetchSiteSettings,
  getUserProfile,
  saveUserProfile,
  deleteProduct,
  ensureInitialFirestoreCollectionsExist,
  DEFAULT_SITE_SETTINGS,
  fetchBuilds,
  validateFirestoreConnection
} from './lib/dbService';
import { Product, ServiceCategory, CartItem, UserProfile, SiteSettings, GalleryBuild } from './types';
import { useToast } from './context/ToastContext';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';

import { JdmGallery } from './components/JdmGallery';
import { GarageHighlights } from './components/GarageHighlights';
import { FitmentSelector, SelectedVehicle } from './components/FitmentSelector';
import { useVehicleFitment } from './hooks/useVehicleFitment';
import { ServicesSection } from './components/ServicesSection';
import { PartsCatalog } from './components/PartsCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerDashboard } from './components/CustomerDashboard';
import { Footer } from './components/Footer';

export default function App() {
  const { toast } = useToast();

  // Authentication & Profile State
  const [user, setUser] = useState<UserProfile | null>(null);

  // Products, Services & Site Settings Data
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [builds, setBuilds] = useState<GalleryBuild[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Shopping Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Navigation & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeSection, setActiveSection] = useState('home');

  // Vehicle Fitment Hook (Listens & Auto-saves vehicle choice to Firestore profile)
  const {
    selectedVehicle,
    updateVehicleFitment,
    isSaving: isSavingFitment,
    saveSuccess: saveFitmentSuccess,
  } = useVehicleFitment(user, (vehicle) => {
    if (vehicle?.model) {
      setSearchQuery(vehicle.model);
    }
  });

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isCustomerDashboardOpen, setIsCustomerDashboardOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeletingProd, setIsDeletingProd] = useState<boolean>(false);

  // Initialize Firebase Data and Auth Listener
  useEffect(() => {
    async function initApp() {
      setLoading(true);
      
      // 1. Validate connection first
      await validateFirestoreConnection();
      
      try {
        // 2. Ensure collections exist (and seed if needed)
        await ensureInitialFirestoreCollectionsExist();
        
        // 3. Fetch data
        const [prods, servs, sSettings, blds] = await Promise.all([
          fetchProducts(),
          fetchServices(),
          fetchSiteSettings(),
          fetchBuilds()
        ]);
        setProducts(prods);
        setServices(servs);
        setSiteSettings(sSettings);
        setBuilds(blds);
      } catch (err) {
        console.error('Initial app initialization failed:', err);
      } finally {
        setLoading(false);
      }
    }

    initApp();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userEmail = firebaseUser.email?.toLowerCase() || '';
        const isAdminEmail = userEmail === 'zaidenyuri26@gmail.com';
        
        let profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          profile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
            role: isAdminEmail ? 'admin' : 'customer'
          };
        } else if (isAdminEmail && profile.role !== 'admin') {
          profile.role = 'admin';
        }
        await saveUserProfile(profile);
        setUser(profile);
      } else {
        // Keep profile null or default guest
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRefreshData = async () => {
    const [updatedProds, updatedServs, updatedSettings, updatedBuilds] = await Promise.all([
      fetchProducts(),
      fetchServices(),
      fetchSiteSettings(),
      fetchBuilds()
    ]);
    setProducts(updatedProds);
    setServices(updatedServs);
    setSiteSettings(updatedSettings);
    setBuilds(updatedBuilds);
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
      toast.authLogout();
    } catch (err) {
      console.error('Sign out error:', err);
      toast.error('Sign Out Failed', 'An error occurred while signing out.');
    }
    setUser(null);
    setIsAdminDashboardOpen(false);
    setIsCustomerDashboardOpen(false);
  };

  // Cart Functions
  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast.info('Sign In Required', 'Please sign in to add performance parts to your garage cart.');
      setIsAuthOpen(true);
      return;
    }
    const existing = cart.find((item) => item.product.id === product.id);
    const newQuantity = existing ? existing.quantity + 1 : 1;
    toast.cartAdded(product, newQuantity, () => setIsCartOpen(true));

    setCart((prevCart) => {
      const exists = prevCart.find((item) => item.product.id === product.id);
      if (exists) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    const target = cart.find((item) => item.product.id === productId);
    if (target) {
      toast.cartRemoved(target.product.name, target.product.brand);
    }
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    if (cart.length > 0) {
      toast.cartCleared();
    }
    setCart([]);
  };

  // Section Selector
  const handleSelectCategoryPill = (category: string) => {
    setSelectedCategory(category);
    setActiveSection('parts');
    const catalogEl = document.getElementById('parts-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenDashboard = () => {
    if (user?.role === 'admin') {
      setIsAdminDashboardOpen(true);
    } else {
      setIsCustomerDashboardOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950/20 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950">
      
      {/* Header & Sticky Navbar */}
      <Navbar
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDashboard={handleOpenDashboard}
        user={user}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        siteSettings={siteSettings}
      />

      {/* Main Page Layout */}
      <main>
        {/* Hero Section */}
        <Hero
          onExploreParts={() => {
            setActiveSection('parts');
            const el = document.getElementById('performance-parts');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onExploreServices={() => {
            setActiveSection('services');
            const el = document.getElementById('services-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          siteSettings={siteSettings}
          products={products}
        />




        {/* Vehicle Fitment Guarantee Selector */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2" id="fitment-selector">
          <FitmentSelector
            selectedVehicle={selectedVehicle}
            onSelectVehicle={(vehicle) => updateVehicleFitment(vehicle)}
            onFilterFitment={(modelKeyword) => setSearchQuery(modelKeyword)}
            user={user}
            isSaving={isSavingFitment}
            saveSuccess={saveFitmentSuccess}
          />
        </div>

        {/* Parts Store & Catalog */}
        <PartsCatalog
          products={products}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onAddToCart={handleAddToCart}
          onViewProduct={(p) => setViewingProduct(p)}
          userRole={user?.role}
          onAddNewProduct={() => setIsAdminDashboardOpen(true)}
          onEditProduct={() => setIsAdminDashboardOpen(true)}
          onDeleteProduct={(productId) => {
            const target = products.find(p => p.id === productId);
            if (target) setDeletingProduct(target);
          }}
          siteSettings={siteSettings}
        />

        {/* Section Divider */}
        <div className="w-full h-px bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-950" />

        {/* Services & Workshop Section */}
        <ServicesSection
          services={services}
          siteSettings={siteSettings}
        />

        {/* Section Divider */}
        <div className="w-full h-px bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-950" />

        {/* Interactive JDM Build Gallery & Performance Parts Showcase */}
        <JdmGallery
          products={products}
          builds={builds}
          siteSettings={siteSettings}
          onAddToCart={handleAddToCart}
          onViewProduct={(p) => setViewingProduct(p)}
          setSearchQuery={setSearchQuery}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Section Divider */}
        <div className="w-full h-px bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-950" />

        {/* NorthBros Garage Highlights & Heritage */}
        <GarageHighlights
          siteSettings={siteSettings}
          onExploreServices={() => {
            const el = document.getElementById('services-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

      </main>

      {/* Footer */}
      <Footer
        onOpenAuth={() => setIsAuthOpen(true)}
        onSelectCategory={handleSelectCategoryPill}
        siteSettings={siteSettings}
      />

      {/* OVERLAY MODALS & DRAWERS */}

      {/* DELETE PRODUCT CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-full bg-red-950 border border-red-800/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-xl text-white">Confirm Product Deletion</h3>
                <p className="text-sm text-red-400 font-mono">Firestore Database Deletion</p>
              </div>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1">
              <p className="text-sm text-zinc-400">Target Product:</p>
              <p className="text-base font-bold text-amber-400 font-mono break-all">{deletingProduct.name}</p>
              <p className="text-[12px] text-zinc-500 font-mono">
                Brand: {deletingProduct.brand} | Price: ₱{deletingProduct.price.toLocaleString()}
              </p>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Are you sure you want to delete this product? This will permanently purge the item from the default Firestore database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingProd}
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingProd}
                onClick={async () => {
                  if (!deletingProduct) return;
                  const prodName = deletingProduct.name;
                  setIsDeletingProd(true);
                  try {
                    await deleteProduct(deletingProduct.id);
                    toast.deleted('Performance Part', prodName);
                    await handleRefreshData();
                  } catch (err) {
                    console.error('Error deleting product from Firestore:', err);
                    toast.error('Deletion Failed', 'Unable to delete product from database.');
                  } finally {
                    setIsDeletingProd(false);
                    setDeletingProduct(null);
                  }
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center gap-2"
              >
                {isDeletingProd ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        user={user}
        siteSettings={siteSettings}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          if (loggedInUser.role === 'admin') {
            setIsAdminDashboardOpen(true);
          }
        }}
      />

      {/* Admin Dashboard */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          onClose={() => setIsAdminDashboardOpen(false)}
          products={products}
          services={services}
          builds={builds}
          onRefreshData={handleRefreshData}
        />
      )}

      {/* Customer Dashboard */}
      {isCustomerDashboardOpen && user && (
        <CustomerDashboard
          onClose={() => setIsCustomerDashboardOpen(false)}
          user={user}
          onAddToCart={handleAddToCart}
          products={products}
        />
      )}

    </div>
  );
}

