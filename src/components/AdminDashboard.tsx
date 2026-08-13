import React, { useState, useEffect } from 'react';
import { ImageInput } from './ImageInput';
import {
  Users,
  Package,
  Calendar,
  ShoppingBag,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Search,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Globe,
  Save,
  Check,
  AlertTriangle,
  Image as ImageIcon,
  Camera,
  Video,
  Link,
  Car
} from 'lucide-react';
import {
  Product,
  ServiceCategory,
  ServiceBooking,
  Order,
  UserProfile,
  BookingStatus,
  OrderStatus,
  SiteSettings,
  GalleryBuild,
  PRODUCT_CATEGORIES,
  PRODUCT_BRANDS
} from '../types';
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  fetchServices,
  addService,
  updateService,
  deleteService,
  fetchBookings,
  updateBookingStatus,
  deleteBooking,
  fetchOrders,
  updateOrderStatus,
  deleteOrder,
  fetchAllUsers,
  updateUserRole,
  deleteUserDoc,
  fetchSiteSettings,
  saveSiteSettings,
  DEFAULT_SITE_SETTINGS,
  addBuild,
  updateBuild,
  deleteBuild
} from '../lib/dbService';

interface AdminDashboardProps {
  onClose: () => void;
  products: Product[];
  services: ServiceCategory[];
  builds: GalleryBuild[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  products,
  services,
  builds,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'products' | 'services' | 'orders' | 'users' | 'builds'>('settings');
  
  // State for data
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [siteSettingsForm, setSiteSettingsForm] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Deletion Confirmation State
  const [deletingItem, setDeletingItem] = useState<{ type: 'product' | 'service' | 'order' | 'booking' | 'user' | 'build'; id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // Build State
  const [editingBuild, setEditingBuild] = useState<GalleryBuild | null>(null);
  const [isCreatingBuild, setIsCreatingBuild] = useState<boolean>(false);

  // Form states for Build Add/Edit
  const [buildName, setBuildName] = useState('');
  const [buildModel, setBuildModel] = useState('');
  const [buildEngine, setBuildEngine] = useState('');
  const [buildPower, setBuildPower] = useState('');
  const [buildColor, setBuildColor] = useState('');
  const [buildImage, setBuildImage] = useState('');
  const [buildAdditionalImages, setBuildAdditionalImages] = useState<string[]>([]);
  const [buildVideoUrl, setBuildVideoUrl] = useState('');
  const [buildLinkUrl, setBuildLinkUrl] = useState('');
  const [buildInstagram, setBuildInstagram] = useState('');
  const [buildOwner, setBuildOwner] = useState('');
  const [buildDescription, setBuildDescription] = useState('');
  const [buildPartsKeywords, setBuildPartsKeywords] = useState('');

  // Modal state for editing or creating product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState<boolean>(false);

  // Modal state for editing or creating service
  const [editingService, setEditingService] = useState<ServiceCategory | null>(null);
  const [isCreatingService, setIsCreatingService] = useState<boolean>(false);

  // Form states for Product Add/Edit
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('HKS');
  const [prodCategory, setProdCategory] = useState('Exhaust & Turbo');
  const [prodPrice, setProdPrice] = useState('1200');
  const [prodImage, setProdImage] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [prodFitment, setProdFitment] = useState('Universal JDM');
  const [prodFeatured, setProdFeatured] = useState(false);

  // Form states for Service Add/Edit
  const [servTitle, setServTitle] = useState('');
  const [servDesc, setServDesc] = useState('');
  const [servIcon, setServIcon] = useState('Wrench');
  const [servTime, setServTime] = useState('2-3 Hours');
  const [servPrice, setServPrice] = useState('250');
  const [servImage, setServImage] = useState('');
  const [servFeatures, setServFeatures] = useState('');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [bData, oData, uData, sSettings] = await Promise.all([
        fetchBookings(),
        fetchOrders(),
        fetchAllUsers(),
        fetchSiteSettings()
      ]);
      setBookings(bData);
      setOrders(oData);
      setUsers(uData);
      setSiteSettingsForm({
        ...DEFAULT_SITE_SETTINGS,
        ...(sSettings || {}),
        brandName: sSettings?.brandName || DEFAULT_SITE_SETTINGS.brandName || '',
        brandSubtitle: sSettings?.brandSubtitle || DEFAULT_SITE_SETTINGS.brandSubtitle || '',
        announcementText: sSettings?.announcementText || DEFAULT_SITE_SETTINGS.announcementText || '',
        announcementEnabled: sSettings?.announcementEnabled ?? DEFAULT_SITE_SETTINGS.announcementEnabled ?? true,
        heroBadge: sSettings?.heroBadge || DEFAULT_SITE_SETTINGS.heroBadge || '',
        heroTitleLine1: sSettings?.heroTitleLine1 || DEFAULT_SITE_SETTINGS.heroTitleLine1 || '',
        heroTitleLine2: sSettings?.heroTitleLine2 || DEFAULT_SITE_SETTINGS.heroTitleLine2 || '',
        heroDescription: sSettings?.heroDescription || DEFAULT_SITE_SETTINGS.heroDescription || '',
        heroBannerImage: sSettings?.heroBannerImage || DEFAULT_SITE_SETTINGS.heroBannerImage || '',
        heroBannerImages: sSettings?.heroBannerImages || [],
        heroPrimaryBtnText: sSettings?.heroPrimaryBtnText || DEFAULT_SITE_SETTINGS.heroPrimaryBtnText || '',
        heroSecondaryBtnText: sSettings?.heroSecondaryBtnText || DEFAULT_SITE_SETTINGS.heroSecondaryBtnText || '',
        aboutTitle: sSettings?.aboutTitle || DEFAULT_SITE_SETTINGS.aboutTitle || '',
        aboutDescription: sSettings?.aboutDescription || DEFAULT_SITE_SETTINGS.aboutDescription || '',
        aboutImage: sSettings?.aboutImage || DEFAULT_SITE_SETTINGS.aboutImage || '',
        aboutImages: sSettings?.aboutImages || [],
        servicesBadge: sSettings?.servicesBadge || DEFAULT_SITE_SETTINGS.servicesBadge || '',
        servicesTitle: sSettings?.servicesTitle || DEFAULT_SITE_SETTINGS.servicesTitle || '',
        servicesSubtitle: sSettings?.servicesSubtitle || DEFAULT_SITE_SETTINGS.servicesSubtitle || '',
        partsBadge: sSettings?.partsBadge || DEFAULT_SITE_SETTINGS.partsBadge || '',
        partsTitle: sSettings?.partsTitle || DEFAULT_SITE_SETTINGS.partsTitle || '',
        partsSubtitle: sSettings?.partsSubtitle || DEFAULT_SITE_SETTINGS.partsSubtitle || '',
        tunerShowcaseBadge: sSettings?.tunerShowcaseBadge || DEFAULT_SITE_SETTINGS.tunerShowcaseBadge || '',
        tunerShowcaseTitle: sSettings?.tunerShowcaseTitle || DEFAULT_SITE_SETTINGS.tunerShowcaseTitle || '',
        tunerShowcaseSubtitle: sSettings?.tunerShowcaseSubtitle || DEFAULT_SITE_SETTINGS.tunerShowcaseSubtitle || '',
        footerAbout: sSettings?.footerAbout || DEFAULT_SITE_SETTINGS.footerAbout || '',
        contactPhone: sSettings?.contactPhone || DEFAULT_SITE_SETTINGS.contactPhone || '',
        contactEmail: sSettings?.contactEmail || DEFAULT_SITE_SETTINGS.contactEmail || '',
        contactAddress: sSettings?.contactAddress || DEFAULT_SITE_SETTINGS.contactAddress || '',
        operatingHours: sSettings?.operatingHours || DEFAULT_SITE_SETTINGS.operatingHours || '',
        socialInstagram: sSettings?.socialInstagram || DEFAULT_SITE_SETTINGS.socialInstagram || '',
        socialYoutube: sSettings?.socialYoutube || DEFAULT_SITE_SETTINGS.socialYoutube || '',
        socialFacebook: sSettings?.socialFacebook || DEFAULT_SITE_SETTINGS.socialFacebook || '',
        socialTwitter: sSettings?.socialTwitter || DEFAULT_SITE_SETTINGS.socialTwitter || '',
        copyrightText: sSettings?.copyrightText || DEFAULT_SITE_SETTINGS.copyrightText || '',
      });
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await saveSiteSettings(siteSettingsForm);
      setSettingsSavedSuccess(true);
      onRefreshData();
      setTimeout(() => setSettingsSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save site settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdBrand('HKS');
    setProdCategory('Exhaust & Turbo');
    setProdPrice('1200');
    setProdImage('');
    setProdDesc('High-performance JDM component engineered for maximum flow and thermal durability.');
    setProdStock('10');
    setProdFitment('Universal JDM / Nissan GT-R / Toyota Supra');
    setProdFeatured(true);
    setIsCreatingProduct(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name || '');
    setProdBrand(p.brand || '');
    setProdCategory(p.category || '');
    setProdPrice(p.price !== undefined && p.price !== null ? p.price.toString() : '');
    setProdImage(p.image || '');
    setProdDesc(p.description || '');
    setProdStock(p.stock !== undefined && p.stock !== null ? p.stock.toString() : '');
    setProdFitment(p.fitment || '');
    setProdFeatured(!!p.featured);
    setIsCreatingProduct(false);
  };

  const handleOpenCreateBuild = () => {
    setEditingBuild(null);
    setBuildName('');
    setBuildModel('');
    setBuildEngine('');
    setBuildPower('');
    setBuildColor('');
    setBuildImage('');
    setBuildAdditionalImages([]);
    setBuildVideoUrl('');
    setBuildLinkUrl('');
    setBuildInstagram('');
    setBuildOwner('');
    setBuildDescription('');
    setBuildPartsKeywords('');
    setIsCreatingBuild(true);
  };

  const handleOpenEditBuild = (b: GalleryBuild) => {
    setEditingBuild(b);
    setBuildName(b.name || '');
    setBuildModel(b.model || '');
    setBuildEngine(b.engine || '');
    setBuildPower(b.power || '');
    setBuildColor(b.color || '');
    setBuildImage(b.image || '');
    setBuildAdditionalImages(b.additionalImages || []);
    setBuildVideoUrl(b.videoUrl || '');
    setBuildLinkUrl(b.linkUrl || '');
    setBuildInstagram(b.instagram || '');
    setBuildOwner(b.owner || '');
    setBuildDescription(b.description || '');
    setBuildPartsKeywords(b.partsKeywords ? b.partsKeywords.join(', ') : '');
    setIsCreatingBuild(false);
  };

  const handleSaveBuildForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildName || !buildModel) return;

    const keywordsArray = buildPartsKeywords
      ? buildPartsKeywords.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      name: buildName,
      model: buildModel,
      engine: buildEngine,
      power: buildPower,
      color: buildColor,
      image: buildImage || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1200',
      additionalImages: buildAdditionalImages,
      videoUrl: buildVideoUrl,
      linkUrl: buildLinkUrl,
      instagram: buildInstagram,
      owner: buildOwner,
      description: buildDescription,
      partsKeywords: keywordsArray
    };

    try {
      if (editingBuild) {
        await updateBuild(editingBuild.id, payload);
      } else {
        await addBuild(payload);
      }
      onRefreshData();
      setIsCreatingBuild(false);
      setEditingBuild(null);
    } catch (err) {
      console.error('Error saving build:', err);
    }
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return;

    const priceNum = parseFloat(prodPrice) || 0;
    const stockNum = parseInt(prodStock) || 0;

    const payload = {
      name: prodName,
      brand: prodBrand,
      category: prodCategory,
      price: priceNum,
      image: prodImage || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800',
      description: prodDesc,
      stock: stockNum,
      featured: prodFeatured,
      fitment: prodFitment,
      specs: { 'Material': 'Alloy / Stainless Steel', 'Origin': 'Japan Import' }
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
    } else {
      await addProduct(payload);
    }

    setEditingProduct(null);
    setIsCreatingProduct(false);
    onRefreshData();
  };

  const handleDeleteProd = (p: Product) => {
    setDeletingItem({ type: 'product', id: p.id, name: p.name });
  };

  const handleDeleteService = (s: ServiceCategory) => {
    setDeletingItem({ type: 'service', id: s.id, name: s.title });
  };

  const handleDeleteOrder = (o: Order) => {
    setDeletingItem({ type: 'order', id: o.id, name: `Order ${o.id}` });
  };

  const handleDeleteBooking = (b: ServiceBooking) => {
    setDeletingItem({ type: 'booking', id: b.id, name: `Appointment for ${b.customerName}` });
  };

  const handleDeleteUser = (u: UserProfile) => {
    setDeletingItem({ type: 'user', id: u.uid, name: `User ${u.displayName || u.email}` });
  };

  const handleDeleteBuild = (b: GalleryBuild) => {
    setDeletingItem({ type: 'build', id: b.id, name: b.name });
  };

  const confirmDeleteAction = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      if (deletingItem.type === 'product') {
        await deleteProduct(deletingItem.id);
      } else if (deletingItem.type === 'service') {
        await deleteService(deletingItem.id);
      } else if (deletingItem.type === 'order') {
        await deleteOrder(deletingItem.id);
        setOrders(prev => prev.filter(o => o.id !== deletingItem.id));
      } else if (deletingItem.type === 'booking') {
        await deleteBooking(deletingItem.id);
        setBookings(prev => prev.filter(b => b.id !== deletingItem.id));
      } else if (deletingItem.type === 'user') {
        await deleteUserDoc(deletingItem.id);
        setUsers(prev => prev.filter(u => u.uid !== deletingItem.id));
      } else if (deletingItem.type === 'build') {
        await deleteBuild(deletingItem.id);
      }
      setDeleteSuccessMsg(`Successfully deleted ${deletingItem.name}`);
      setTimeout(() => setDeleteSuccessMsg(null), 3500);
      onRefreshData();
    } catch (err) {
      console.error('Failed to delete item from Firestore:', err);
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  const handleOpenCreateService = () => {
    setEditingService(null);
    setServTitle('');
    setServDesc('');
    setServIcon('Wrench');
    setServTime('2-3 Hours');
    setServPrice('300');
    setServImage('');
    setServFeatures('Complete System Inspection\nPrecision Tuning & Calibration\nSafety Check & Test Drive');
    setIsCreatingService(true);
  };

  const handleOpenEditService = (s: ServiceCategory) => {
    setEditingService(s);
    setServTitle(s.title || '');
    setServDesc(s.description || '');
    setServIcon(s.iconName || 'Wrench');
    setServTime(s.estimatedTime || '');
    setServPrice(s.priceStartingFrom !== undefined && s.priceStartingFrom !== null ? s.priceStartingFrom.toString() : '');
    setServImage(s.image || '');
    setServFeatures(s.features ? s.features.join('\n') : '');
    setIsCreatingService(false);
  };

  const handleSaveServiceForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servTitle || !servPrice) return;

    const priceNum = parseFloat(servPrice) || 0;
    const featuresArr = servFeatures.split('\n').map(f => f.trim()).filter(Boolean);

    const payload = {
      title: servTitle,
      description: servDesc,
      iconName: servIcon,
      estimatedTime: servTime,
      priceStartingFrom: priceNum,
      image: servImage || 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800',
      features: featuresArr
    };

    if (editingService) {
      await updateService(editingService.id, payload);
    } else {
      await addService(payload);
    }

    setEditingService(null);
    setIsCreatingService(false);
    onRefreshData();
  };

  const handleUpdateBooking = async (bId: string, status: BookingStatus) => {
    await updateBookingStatus(bId, status);
    setBookings(prev => prev.map(b => b.id === bId ? { ...b, status } : b));
  };

  const handleUpdateOrder = async (oId: string, status: OrderStatus) => {
    await updateOrderStatus(oId, status);
    setOrders(prev => prev.map(o => o.id === oId ? { ...o, status } : o));
  };

  const handleRoleChange = async (uid: string, role: 'admin' | 'customer') => {
    await updateUserRole(uid, role);
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role } : u));
  };

  // Aggregated Stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const activeOrdersCount = orders.filter(o => ['pending', 'accepted', 'preparing', 'ready_to_ship'].includes(o.status)).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950 text-zinc-100 flex flex-col">
      
      {/* Admin Top Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black font-mono uppercase italic text-white">NORTHBROS GARAGE — ADMIN PORTAL</h1>
            <p className="text-[12px] text-zinc-400">Master Control Center for Products, Bookings, Orders & Users</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllAdminData}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm uppercase tracking-wider rounded-xl transition-all"
          >
            Exit Admin Portal
          </button>
        </div>
      </header>

      {/* Admin Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto no-scrollbar font-mono text-sm font-bold">
          <button
            onClick={() => setActiveTab('settings')}
            id="admin-tab-settings"
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'settings' ? 'bg-amber-500 text-zinc-950 font-extrabold' : 'text-amber-400 hover:text-white bg-zinc-900 border border-amber-500/30'
            }`}
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Website Customization (CMS)</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'overview' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            id="admin-tab-products"
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'products' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            id="admin-tab-services"
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'services' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Services ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            id="admin-tab-bookings"
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all relative ${
              activeTab === 'bookings' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Service Appointments ({bookings.length})</span>
            {pendingBookingsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            id="admin-tab-orders"
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'orders' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            id="admin-tab-users"
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'users' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Access ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('builds')}
            id="admin-tab-builds"
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'builds' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Build Chronicles ({builds.length})</span>
          </button>
        </div>

        {/* TAB: WEBSITE CUSTOMIZATION (CMS) */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSiteSettings} className="space-y-8">
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <div>
                <div className="inline-flex items-center gap-2 text-amber-400 font-mono text-sm uppercase font-bold mb-1">
                  <Globe className="w-4 h-4" />
                  <span>FULL WEBSITE CMS CUSTOMIZATION</span>
                </div>
                <h2 className="text-2xl font-mono font-black text-white italic uppercase">
                  CUSTOMIZE ENTIRE WEBSITE FROM HEADER TO FOOTER
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  All text, titles, subtitles, contact numbers, and banners are saved directly to the Firestore default database (<code className="text-amber-400 font-mono">site_settings/main</code>).
                </p>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black px-6 py-3 rounded-xl text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all active:scale-95 shrink-0"
              >
                {savingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to Firestore...</span>
                  </>
                ) : settingsSavedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-zinc-950" />
                    <span>Settings Live on Website!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save All Website Settings</span>
                  </>
                )}
              </button>
            </div>

            {/* SECTION 1: Header & Branding */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Shield className="w-4 h-4" /> 1. Header & Brand Identity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Garage Brand Name</label>
                  <input
                    type="text"
                    required
                    value={siteSettingsForm.brandName || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, brandName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                    placeholder="NORTHBROS GARAGE"
                  />
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Brand Subtitle / Tagline</label>
                  <input
                    type="text"
                    required
                    value={siteSettingsForm.brandSubtitle || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, brandSubtitle: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                    placeholder="PERFORMANCE & TUNING"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-mono text-zinc-400 block mb-1">Top Announcement Bar Text</label>
                  <input
                    type="text"
                    value={siteSettingsForm.announcementText || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, announcementText: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                    placeholder="NEW ARRIVALS: JDM Spec Parts in Stock"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="announcementActive"
                    checked={siteSettingsForm.announcementEnabled ?? true}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, announcementEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-amber-500"
                  />
                  <label htmlFor="announcementActive" className="text-zinc-300 font-mono text-sm cursor-pointer">
                    Display Top Announcement Bar
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 2: Hero Section */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Globe className="w-4 h-4" /> 2. Hero Section (Main Landing Visuals)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Hero Badge Text</label>
                  <input
                    type="text"
                    value={siteSettingsForm.heroBadge || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, heroBadge: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Hero Title Line 1</label>
                  <input
                    type="text"
                    value={siteSettingsForm.heroTitleLine1 || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, heroTitleLine1: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Hero Title Line 2 (Gradient)</label>
                  <input
                    type="text"
                    value={siteSettingsForm.heroTitleLine2 || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, heroTitleLine2: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Primary Button Label</label>
                  <input
                    type="text"
                    value={siteSettingsForm.heroPrimaryBtnText || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, heroPrimaryBtnText: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-mono text-zinc-400 block mb-1">Hero Description</label>
                  <textarea
                    rows={2}
                    value={siteSettingsForm.heroDescription || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, heroDescription: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <ImageInput
                    label="Hero Main Banner Picture"
                    value={siteSettingsForm.heroBannerImage || ''}
                    onChange={(val) => setSiteSettingsForm({ ...siteSettingsForm, heroBannerImage: val })}
                  />
                </div>

                <div className="md:col-span-2 space-y-4 border-t border-zinc-800/80 pt-4 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-mono text-white text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                        🖼️ Additional Hero Photos (Rotating Carousel)
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-mono">Add multiple photos to display an elegant automatic/manual slides showcase on your main homepage.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const current = siteSettingsForm.heroBannerImages || [];
                        setSiteSettingsForm({
                          ...siteSettingsForm,
                          heroBannerImages: [...current, '']
                        });
                      }}
                      className="self-start sm:self-auto px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-[12px] rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Hero Photo Slot
                    </button>
                  </div>

                  {(siteSettingsForm.heroBannerImages || []).length === 0 ? (
                    <div className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl text-center text-zinc-500 text-sm font-mono">
                      No additional hero banner photos configured. Displays single main banner.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(siteSettingsForm.heroBannerImages || []).map((imgUrl, idx) => (
                        <div key={idx} className="relative p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] text-amber-500 font-bold">📸 Hero Carousel Photo Slot #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const current = [...(siteSettingsForm.heroBannerImages || [])];
                                current.splice(idx, 1);
                                setSiteSettingsForm({
                                  ...siteSettingsForm,
                                  heroBannerImages: current
                                });
                              }}
                              className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                              title="Delete photo slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <ImageInput
                            label={`Slot #${idx + 1} Picture`}
                            value={imgUrl || ''}
                            onChange={(val) => {
                              const current = [...(siteSettingsForm.heroBannerImages || [])];
                              current[idx] = val;
                              setSiteSettingsForm({
                                ...siteSettingsForm,
                                heroBannerImages: current
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: NorthBros Garage Highlights & Heritage Picture Section */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
                <ImageIcon className="w-4 h-4" /> 3. NorthBros Garage Highlights Picture & Showcase
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="md:col-span-2">
                  <label className="font-mono text-zinc-400 block mb-1">Highlights Headline Title</label>
                  <input
                    type="text"
                    value={siteSettingsForm.aboutTitle || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, aboutTitle: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono font-bold"
                    placeholder="NORTHBROS MOTORSPORT HERITAGE"
                  />
                </div>

                <div className="md:col-span-2">
                  <ImageInput
                    label="Configurable Garage Highlights Picture"
                    value={siteSettingsForm.aboutImage || ''}
                    onChange={(val) => setSiteSettingsForm({ ...siteSettingsForm, aboutImage: val })}
                  />
                </div>

                <div className="md:col-span-2 space-y-4 border-t border-zinc-800/80 pt-4 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-mono text-white text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                        🏁 Additional Garage Highlight Photos (Interactive Slideshow Gallery)
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-mono">Add multiple photos to display an interactive workshop and builds gallery in the heritage highlight section.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const current = siteSettingsForm.aboutImages || [];
                        setSiteSettingsForm({
                          ...siteSettingsForm,
                          aboutImages: [...current, '']
                        });
                      }}
                      className="self-start sm:self-auto px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-[12px] rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Highlight Photo Slot
                    </button>
                  </div>

                  {(siteSettingsForm.aboutImages || []).length === 0 ? (
                    <div className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl text-center text-zinc-500 text-sm font-mono">
                      No additional garage highlight photos configured. Displays single master build picture.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(siteSettingsForm.aboutImages || []).map((imgUrl, idx) => (
                        <div key={idx} className="relative p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] text-amber-500 font-bold">🔧 Build Photo Slot #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const current = [...(siteSettingsForm.aboutImages || [])];
                                current.splice(idx, 1);
                                setSiteSettingsForm({
                                  ...siteSettingsForm,
                                  aboutImages: current
                                });
                              }}
                              className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                              title="Delete photo slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <ImageInput
                            label={`Slot #${idx + 1} Highlight Picture`}
                            value={imgUrl || ''}
                            onChange={(val) => {
                              const current = [...(siteSettingsForm.aboutImages || [])];
                              current[idx] = val;
                              setSiteSettingsForm({
                                ...siteSettingsForm,
                                aboutImages: current
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="font-mono text-zinc-400 block mb-1">Highlights Paragraph / Description</label>
                  <textarea
                    rows={3}
                    value={siteSettingsForm.aboutDescription || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, aboutDescription: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
                    placeholder="Founded by dedicated circuit racers..."
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Services & Parts Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Garage Services Titles */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <Calendar className="w-4 h-4" /> 3. Garage Services Section
                </h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="font-mono text-zinc-400 block mb-1">Services Badge Text</label>
                    <input
                      type="text"
                      value={siteSettingsForm.servicesBadge || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, servicesBadge: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-zinc-400 block mb-1">Services Title</label>
                    <input
                      type="text"
                      value={siteSettingsForm.servicesTitle || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, servicesTitle: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-zinc-400 block mb-1">Services Subtitle</label>
                    <textarea
                      rows={2}
                      value={siteSettingsForm.servicesSubtitle || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, servicesSubtitle: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Parts Store Titles */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <Package className="w-4 h-4" /> 4. Parts Store Section
                </h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="font-mono text-zinc-400 block mb-1">Parts Badge Text</label>
                    <input
                      type="text"
                      value={siteSettingsForm.partsBadge || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, partsBadge: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-zinc-400 block mb-1">Parts Store Title</label>
                    <input
                      type="text"
                      value={siteSettingsForm.partsTitle || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, partsTitle: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono font-bold"
                    />
                  </div>
                  
                  <div>
                    <label className="font-mono text-zinc-400 block mb-1">Parts Store Subtitle</label>
                    <textarea
                      rows={2}
                      value={siteSettingsForm.partsSubtitle || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, partsSubtitle: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Tuner Showcase Section */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <Camera className="w-4 h-4" /> 4b. Tuner Showcase Section
                </h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="font-mono text-zinc-400 block mb-1">Showcase Badge Text</label>
                    <input
                      type="text"
                      value={siteSettingsForm.tunerShowcaseBadge || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, tunerShowcaseBadge: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-zinc-400 block mb-1">Showcase Title</label>
                    <input
                      type="text"
                      value={siteSettingsForm.tunerShowcaseTitle || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, tunerShowcaseTitle: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono font-bold"
                    />
                  </div>
                  
                  <div>
                    <label className="font-mono text-zinc-400 block mb-1">Showcase Subtitle</label>
                    <textarea
                      rows={2}
                      value={siteSettingsForm.tunerShowcaseSubtitle || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, tunerShowcaseSubtitle: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* SECTION 4: Footer & Contact Info */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Clock className="w-4 h-4" /> 5. Footer & Contact Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="md:col-span-2">
                  <label className="font-mono text-zinc-400 block mb-1">Footer About Paragraph</label>
                  <textarea
                    rows={2}
                    value={siteSettingsForm.footerAbout || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, footerAbout: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
                  />
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    value={siteSettingsForm.contactPhone || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, contactPhone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Contact Email Address</label>
                  <input
                    type="text"
                    value={siteSettingsForm.contactEmail || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, contactEmail: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Physical Garage Address</label>
                  <input
                    type="text"
                    value={siteSettingsForm.contactAddress || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, contactAddress: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={siteSettingsForm.operatingHours || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, operatingHours: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-mono text-zinc-400 block mb-1">Copyright Footer Line</label>
                  <input
                    type="text"
                    value={siteSettingsForm.copyrightText || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, copyrightText: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={siteSettingsForm.socialInstagram || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, socialInstagram: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">YouTube URL</label>
                  <input
                    type="text"
                    value={siteSettingsForm.socialYoutube || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, socialYoutube: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Facebook URL</label>
                  <input
                    type="text"
                    value={siteSettingsForm.socialFacebook || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, socialFacebook: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Twitter / X URL</label>
                  <input
                    type="text"
                    value={siteSettingsForm.socialTwitter || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, socialTwitter: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="sticky bottom-4 z-30 bg-zinc-900/95 backdrop-blur-md border border-amber-500/40 p-4 rounded-2xl flex items-center justify-between shadow-2xl">
              <span className="font-mono text-sm text-amber-400 font-bold">
                {settingsSavedSuccess ? '✓ Website changes saved successfully to Firestore!' : 'Ready to publish changes live to the website?'}
              </span>

              <button
                type="submit"
                disabled={savingSettings}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-6 py-2.5 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                {savingSettings ? 'Saving...' : 'Save Settings Now'}
              </button>
            </div>

          </form>
        )}

        {/* TAB 1: OVERVIEW STATS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-zinc-900 p-3.5 sm:p-5 rounded-2xl border border-zinc-800 space-y-1">
                <p className="text-[11px] sm:text-sm font-mono text-zinc-400 uppercase">Parts Sales Revenue</p>
                <p className="text-2xl sm:text-3xl font-mono font-black text-amber-400">${totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] sm:text-[12px] text-zinc-500">{orders.length} Total orders</p>
              </div>

              <div className="bg-zinc-900 p-3.5 sm:p-5 rounded-2xl border border-zinc-800 space-y-1">
                <p className="text-[11px] sm:text-sm font-mono text-zinc-400 uppercase">Service Requests</p>
                <p className="text-2xl sm:text-3xl font-mono font-black text-amber-400">{bookings.length}</p>
                <p className="text-[11px] sm:text-[12px] text-pink-400 font-bold">{pendingBookingsCount} Pending review</p>
              </div>

              <div className="bg-zinc-900 p-3.5 sm:p-5 rounded-2xl border border-zinc-800 space-y-1">
                <p className="text-[11px] sm:text-sm font-mono text-zinc-400 uppercase">Parts Catalog Stock</p>
                <p className="text-2xl sm:text-3xl font-mono font-black text-amber-400">{products.length} Items</p>
                <p className="text-[11px] sm:text-[12px] text-zinc-500">HKS, Spoon, RAYS</p>
              </div>

              <div className="bg-zinc-900 p-3.5 sm:p-5 rounded-2xl border border-zinc-800 space-y-1">
                <p className="text-[11px] sm:text-sm font-mono text-zinc-400 uppercase">Registered Customers</p>
                <p className="text-2xl sm:text-3xl font-mono font-black text-amber-400">{users.length}</p>
                <p className="text-[11px] sm:text-[12px] text-zinc-500">Authenticated accounts</p>
              </div>
            </div>

            {/* Quick Recent Activity Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Bookings */}
              <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono font-bold text-base uppercase text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" /> Recent Service Requests
                  </h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-sm text-amber-400 hover:underline">View All</button>
                </div>

                <div className="space-y-2">
                  {bookings.slice(0, 4).map((b) => (
                    <div key={b.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-bold text-white">{b.customerName} — <span className="text-amber-400">{b.serviceName}</span></p>
                        <p className="text-zinc-500 font-mono text-[12px]">{b.vehicleYear} {b.vehicleMake} {b.vehicleModel} | {b.preferredDate}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-amber-500/20 text-amber-300">
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono font-bold text-base uppercase text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" /> Recent Customer Orders
                  </h3>
                  <button onClick={() => setActiveTab('orders')} className="text-sm text-amber-400 hover:underline">View All</button>
                </div>

                <div className="space-y-2">
                  {orders.slice(0, 4).map((o) => (
                    <div key={o.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-bold text-white">{o.customerName} — <span className="text-amber-400">${o.totalAmount.toLocaleString()}</span></p>
                        <p className="text-zinc-500 font-mono text-[12px]">{o.items.length} Parts items | {o.shippingAddress?.city}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-emerald-500/20 text-emerald-300">
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold font-mono text-white">MANAGE PRODUCTS CATALOG</h3>
              <button
                onClick={handleOpenCreateProduct}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded-xl text-sm uppercase"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950 font-mono text-zinc-400 uppercase text-[12px] border-b border-zinc-800">
                    <tr>
                      <th className="p-4">Item</th>
                      <th className="p-4">Brand</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono">
                          No products found in Firestore catalog. Click "Add Product" above to create real items.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-800/40">
                          <td className="p-4 flex items-center gap-3">
                            <img 
                              src={p.image || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800'} 
                              alt={p.name} 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800';
                              }}
                              className="w-10 h-10 object-cover rounded-lg bg-zinc-950" 
                            />
                            <span className="font-bold text-white max-w-xs truncate">{p.name}</span>
                          </td>
                          <td className="p-4 font-mono font-bold text-amber-400">{p.brand}</td>
                          <td className="p-4">{p.category}</td>
                          <td className="p-4 font-mono font-bold text-white">${p.price.toLocaleString()}</td>
                          <td className="p-4 font-mono">{p.stock} units</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-lg"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProd(p)}
                              className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-400 rounded-lg border border-red-800/50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SERVICES MANAGEMENT */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold font-mono text-white">MANAGE GARAGE SERVICES</h3>
              <button
                onClick={handleOpenCreateService}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded-xl text-sm uppercase"
              >
                <Plus className="w-4 h-4" /> Add Garage Service
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950 font-mono text-zinc-400 uppercase text-[12px] border-b border-zinc-800">
                    <tr>
                      <th className="p-4">Service</th>
                      <th className="p-4">Est. Time</th>
                      <th className="p-4">Starting Price</th>
                      <th className="p-4">Features Count</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {services.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono">
                          No workshop services found in Firestore database. Click "Add Garage Service" to list services.
                        </td>
                      </tr>
                    ) : (
                      services.map((s) => (
                        <tr key={s.id} className="hover:bg-zinc-800/40">
                          <td className="p-4 flex items-center gap-3">
                            <img 
                              src={s.image || 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800'} 
                              alt={s.title} 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800';
                              }}
                              className="w-10 h-10 object-cover rounded-lg bg-zinc-950" 
                            />
                            <div>
                              <span className="font-bold text-white block">{s.title}</span>
                              <span className="text-[12px] text-zinc-400 line-clamp-1">{s.description}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono">{s.estimatedTime}</td>
                          <td className="p-4 font-mono font-bold text-amber-400">${s.priceStartingFrom}</td>
                          <td className="p-4 font-mono">{s.features?.length || 0} items</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditService(s)}
                              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-lg"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteService(s)}
                              className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-400 rounded-lg border border-red-800/50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold font-mono text-white">SERVICE APPOINTMENT REQUESTS</h3>

            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="p-8 bg-zinc-900 rounded-2xl text-center text-zinc-500 font-mono text-sm">
                  No service appointments currently booked in Firestore.
                </div>
              ) : (
                bookings.map((b) => (
                  <div key={b.id} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{b.customerName}</span>
                        <span className="text-amber-400 font-mono font-bold">({b.serviceName})</span>
                      </div>
                      <p className="text-zinc-400 font-mono">
                        Vehicle: <strong className="text-zinc-200">{b.vehicleYear} {b.vehicleMake} {b.vehicleModel}</strong> | Phone: {b.phone}
                      </p>
                      <p className="text-zinc-500 font-mono text-[12px]">
                        Slot: {b.preferredDate} at {b.preferredTime} | Notes: "{b.notes || 'None'}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto font-mono">
                      <span className="text-[11px] text-zinc-500 uppercase">Status:</span>
                      <select
                        value={b.status || 'pending'}
                        onChange={(e) => handleUpdateBooking(b.id, e.target.value as BookingStatus)}
                        className="bg-zinc-950 border border-zinc-700 text-amber-400 font-bold rounded-lg px-3 py-1.5 focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed / Approved</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleDeleteBooking(b)}
                        className="px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-400 rounded-lg border border-red-800/50 flex items-center gap-1 font-mono text-[12px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold font-mono text-white">PARTS ORDERS HISTORY</h3>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="p-8 bg-zinc-900 rounded-2xl text-center text-zinc-500 font-mono text-sm">
                  No orders placed yet.
                </div>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                      <div>
                        <span className="font-mono font-bold text-amber-400">ORDER ID: {o.id}</span>
                        <p className="text-zinc-300 font-bold mt-0.5">{o.customerName} ({o.customerEmail})</p>
                        <p className="text-[12px] text-zinc-500 font-mono">{o.shippingAddress?.street}, {o.shippingAddress?.city}, {o.shippingAddress?.state}</p>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-xl font-black text-white">₱{o.totalAmount.toLocaleString()} PHP</span>
                        <select
                          value={o.status || 'pending'}
                          onChange={(e) => handleUpdateOrder(o.id, e.target.value as OrderStatus)}
                          className="bg-zinc-950 border border-zinc-700 text-amber-400 font-bold rounded-lg px-3 py-1.5 text-[12px] uppercase tracking-tighter"
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready_to_ship">Ready for Shipment</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrder(o)}
                          className="px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-400 rounded-lg border border-red-800/50 flex items-center gap-1 font-mono text-[12px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {o.items?.map((item, idx) => (
                        <div key={idx} className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-2 text-[12px] font-mono">
                          <span className="text-amber-400 font-bold">{item.brand}</span>
                          <span className="text-zinc-300">{item.productName}</span>
                          <span className="text-zinc-500">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: USERS & ACCESS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <div>
                <div className="inline-flex items-center gap-2 text-amber-400 font-mono text-sm uppercase font-bold mb-1">
                  <Shield className="w-4 h-4" />
                  <span>PRIMARY ADMIN GOVERNANCE</span>
                </div>
                <h3 className="text-2xl font-bold font-mono text-white">USER ACCOUNTS & ACCESS CONTROL</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Single Admin Enforced: <code className="text-amber-400 font-mono font-bold">zaidenyuri26@gmail.com</code> is the only authorized administrator.
                </p>
              </div>

              {users.filter(u => u.email?.toLowerCase() !== 'zaidenyuri26@gmail.com').length > 0 && (
                <button
                  onClick={async () => {
                    const nonAdmins = users.filter(u => u.email?.toLowerCase() !== 'zaidenyuri26@gmail.com');
                    for (const u of nonAdmins) {
                      await deleteUserDoc(u.uid);
                    }
                    setUsers(prev => prev.filter(u => u.email?.toLowerCase() === 'zaidenyuri26@gmail.com'));
                    setDeleteSuccessMsg('Purged non-admin/duplicate user records.');
                    setTimeout(() => setDeleteSuccessMsg(null), 3500);
                  }}
                  className="px-4 py-2 bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-800/80 rounded-xl text-sm font-mono font-bold flex items-center gap-2 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Purge All Non-Admin / Mock Users
                </button>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950 font-mono text-zinc-400 uppercase text-[12px] border-b border-zinc-800">
                    <tr>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Contact & Location</th>
                      <th className="p-4">Vehicle Profile</th>
                      <th className="p-4">Access Role</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono">
                          No user records found in Firestore database.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => {
                        const isPrimaryAdmin = u.email?.toLowerCase() === 'zaidenyuri26@gmail.com';
                        const userOrders = orders.filter(o => o.userId === u.uid);
                        return (
                          <tr key={u.uid} className="hover:bg-zinc-800/40 align-top">
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-white flex items-center gap-2">
                                  {u.displayName || 'Unnamed Driver'}
                                  {isPrimaryAdmin && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black">
                                      Sole Admin
                                    </span>
                                  )}
                                </span>
                                <span className="text-[11px] font-mono text-zinc-500">{u.email}</span>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                                    {userOrders.length} Orders
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-zinc-300 font-mono text-[12px]">{u.phone || 'No Phone'}</span>
                                {u.shippingAddress ? (
                                  <span className="text-zinc-500 text-[11px] leading-relaxed max-w-[200px]">
                                    {u.shippingAddress.street}, {u.shippingAddress.city}, {u.shippingAddress.state} {u.shippingAddress.zipCode}
                                  </span>
                                ) : (
                                  <span className="text-zinc-600 text-[11px] italic">No address saved</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              {u.vehicleInfo ? (
                                <div className="flex items-center gap-2 text-zinc-300">
                                  <Car className="w-3.5 h-3.5 text-amber-500" />
                                  <span className="font-mono text-[12px]">
                                    {u.vehicleInfo.year} {u.vehicleInfo.make} {u.vehicleInfo.model}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-zinc-600 text-[11px] italic">No vehicle profile</span>
                              )}
                            </td>
                            <td className="p-4 font-mono">
                              <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                                isPrimaryAdmin ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {isPrimaryAdmin ? 'ADMIN' : 'CUSTOMER'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-y-2">
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => {
                                    // I will implement a detailed user view later if needed, 
                                    // but for now showing history in the main orders tab 
                                    // is good enough if we add filtering.
                                    setActiveTab('orders');
                                  }}
                                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] font-mono rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <ShoppingBag className="w-3 h-3" /> View History
                                </button>
                                {!isPrimaryAdmin && (
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    className="px-3 py-1 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800/50 text-[11px] font-mono rounded-lg transition-colors"
                                  >
                                    Delete User
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BUILD CHRONICLES */}
        {activeTab === 'builds' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-mono font-black text-white italic uppercase flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" />
                  <span>NorthBros Project Car Chronicles</span>
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Fully customizable tuner showplace. Replace and edit hardcoded images, videos, descriptions, and build specs.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateBuild}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-sm uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Build</span>
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono border-b border-zinc-800 text-[11px]">
                    <tr>
                      <th className="p-4">Car Build / Showcase</th>
                      <th className="p-4">Engine / Specs</th>
                      <th className="p-4">Owner & Instagram</th>
                      <th className="p-4">Video / Link Customization</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {builds.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono">
                          No builds found in Firestore. Click 'Add Custom Build' to create one!
                        </td>
                      </tr>
                    ) : (
                      builds.map((b) => (
                        <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={b.image}
                              alt={b.name}
                              className="w-16 h-10 object-cover rounded-lg border border-zinc-700 bg-zinc-950"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-bold text-white text-base">{b.name}</p>
                              <p className="text-[12px] text-zinc-400">{b.model}</p>
                              <p className="text-[11px] text-amber-400/80 font-mono mt-0.5">{b.color}</p>
                            </div>
                          </td>
                          <td className="p-4 font-mono">
                            <p className="text-zinc-200">{b.engine}</p>
                            <p className="text-zinc-400 text-[12px]">{b.power}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {b.partsKeywords?.map((kw, i) => (
                                <span key={i} className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 font-mono">
                            <p className="text-zinc-300">{b.owner}</p>
                            <a
                              href={`https://instagram.com/${b.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-400 hover:underline text-[12px]"
                            >
                              {b.instagram}
                            </a>
                          </td>
                          <td className="p-4 text-zinc-300 space-y-1 font-mono text-[12px]">
                            <div className="flex items-center gap-1.5">
                              <Video className={`w-3.5 h-3.5 ${b.videoUrl ? 'text-green-400' : 'text-zinc-600'}`} />
                              <span>Video: {b.videoUrl ? <span className="text-green-400 truncate max-w-[120px] inline-block">{b.videoUrl}</span> : <span className="text-zinc-500">None</span>}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Link className={`w-3.5 h-3.5 ${b.linkUrl ? 'text-green-400' : 'text-zinc-600'}`} />
                              <span>Link: {b.linkUrl ? <span className="text-green-400 truncate max-w-[120px] inline-block">{b.linkUrl}</span> : <span className="text-zinc-500">None</span>}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditBuild(b)}
                              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-lg hover:text-white transition-colors border border-zinc-700"
                              title="Edit Build"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBuild(b)}
                              className="p-2 bg-red-950 hover:bg-red-900 text-red-400 rounded-lg transition-colors border border-red-800/50"
                              title="Delete Build"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Product Edit/Create Modal Overlay */}
      {(isCreatingProduct || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full space-y-4 text-sm">
            <h3 className="text-xl font-mono font-bold text-white uppercase">
              {editingProduct ? 'Edit Product Item' : 'Add New Product to Store'}
            </h3>

            <form onSubmit={handleSaveProductForm} className="space-y-3">
              <div>
                <label className="text-zinc-400 font-mono">Product Name</label>
                <input
                  type="text"
                  required
                  value={prodName || ''}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-mono">Brand</label>
                  <select
                    required
                    value={prodBrand || ''}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                  >
                    {PRODUCT_BRANDS.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 font-mono">Category</label>
                  <select
                    required
                    value={prodCategory || ''}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-mono">Price (₱ PHP)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice || ''}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-mono">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={prodStock || ''}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <ImageInput
                  label="Product Photo / Image"
                  value={prodImage || ''}
                  onChange={(val) => setProdImage(val)}
                />
              </div>

              <div>
                <label className="text-zinc-400 font-mono">Fitment Specs</label>
                <input
                  type="text"
                  value={prodFitment || ''}
                  onChange={(e) => setProdFitment(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-mono">Description</label>
                <textarea
                  rows={2}
                  value={prodDesc || ''}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => { setIsCreatingProduct(false); setEditingProduct(null); }}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 text-zinc-950 font-bold rounded-xl"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Build Edit/Create Modal Overlay */}
      {(isCreatingBuild || editingBuild) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full space-y-4 text-sm my-8">
            <h3 className="text-xl font-mono font-bold text-white uppercase flex items-center gap-2">
              <Camera className="text-amber-400 w-5 h-5" />
              <span>{editingBuild ? 'Edit Car Chronicles Showcase' : 'Add Custom Car Build'}</span>
            </h3>

            <form onSubmit={handleSaveBuildForm} className="space-y-3">
              <div>
                <label className="text-zinc-400 font-mono">Car Name / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nissan Skyline GT-R R34"
                  value={buildName || ''}
                  onChange={(e) => setBuildName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 font-mono bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-mono">Model Spec</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midnight Shadow Spec"
                    value={buildModel || ''}
                    onChange={(e) => setBuildModel(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-mono">Chassis Color / Paint</label>
                  <input
                    type="text"
                    placeholder="e.g. Midnight Purple III"
                    value={buildColor || ''}
                    onChange={(e) => setBuildColor(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-mono">Engine Code</label>
                  <input
                    type="text"
                    placeholder="e.g. RB26DETT Twin-Turbo"
                    value={buildEngine || ''}
                    onChange={(e) => setBuildEngine(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-mono">Measured Power Output</label>
                  <input
                    type="text"
                    placeholder="e.g. 650 WHP"
                    value={buildPower || ''}
                    onChange={(e) => setBuildPower(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-mono">Owner Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kenji S."
                    value={buildOwner || ''}
                    onChange={(e) => setBuildOwner(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-mono">Instagram Username</label>
                  <input
                    type="text"
                    placeholder="e.g. @shadow_r34"
                    value={buildInstagram || ''}
                    onChange={(e) => setBuildInstagram(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-mono">Main Showcase Picture</label>
                <ImageInput
                  value={buildImage}
                  onChange={(url) => setBuildImage(url)}
                />
              </div>

              <div className="space-y-4 border-t border-zinc-800/80 pt-4 mt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-mono text-zinc-300 text-sm font-bold uppercase flex items-center gap-1.5">
                      🖼️ Additional Angles & Details
                    </h4>
                    <p className="text-[11px] text-zinc-500 font-mono">Add multiple photos of the interior, engine bay, sides, etc.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBuildAdditionalImages([...buildAdditionalImages, ''])}
                    className="self-start sm:self-auto px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold font-mono text-[11px] rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Extra Photo
                  </button>
                </div>

                {buildAdditionalImages.length === 0 ? (
                  <div className="p-3 bg-zinc-950/40 border border-zinc-800 rounded-xl text-center text-zinc-500 text-[11px] font-mono">
                    No extra photos added.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {buildAdditionalImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-zinc-400">Extra Photo #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const current = [...buildAdditionalImages];
                              current.splice(idx, 1);
                              setBuildAdditionalImages(current);
                            }}
                            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <ImageInput
                          label={`Extra Photo #${idx + 1}`}
                          value={imgUrl || ''}
                          onChange={(val) => {
                            const current = [...buildAdditionalImages];
                            current[idx] = val;
                            setBuildAdditionalImages(current);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-mono flex items-center gap-1">
                    <Video className="w-3 h-3 text-amber-400" />
                    <span>YouTube / Video URL</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://youtube.com/watch?v=..."
                    value={buildVideoUrl || ''}
                    onChange={(e) => setBuildVideoUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-mono flex items-center gap-1">
                    <Link className="w-3 h-3 text-amber-400" />
                    <span>Custom Web Link URL</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://build-journal.com/r34"
                    value={buildLinkUrl || ''}
                    onChange={(e) => setBuildLinkUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-mono">Filter Parts Keywords (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. TE37, HKS, TAKATA"
                  value={buildPartsKeywords || ''}
                  onChange={(e) => setBuildPartsKeywords(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 bg-transparent"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-mono">Build Description & Custom Story</label>
                <textarea
                  rows={3}
                  placeholder="Describe modification history, turbo upgrades, suspension tweaks, and race track times..."
                  value={buildDescription || ''}
                  onChange={(e) => setBuildDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 text-sm bg-transparent"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => { setIsCreatingBuild(false); setEditingBuild(null); }}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl font-bold font-mono uppercase text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 text-zinc-950 font-extrabold rounded-xl font-mono uppercase text-[11px]"
                >
                  Save Car Showcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Edit/Create Modal Overlay */}
      {(isCreatingService || editingService) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full space-y-4 text-sm">
            <h3 className="text-xl font-mono font-bold text-white uppercase">
              {editingService ? 'Edit Garage Service' : 'Add New Garage Service'}
            </h3>

            <form onSubmit={handleSaveServiceForm} className="space-y-3">
              <div>
                <label className="text-zinc-400 font-mono">Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Custom Dyno Tuning"
                  value={servTitle || ''}
                  onChange={(e) => setServTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-mono">Starting Price (₱ PHP)</label>
                  <input
                    type="number"
                    required
                    value={servPrice || ''}
                    onChange={(e) => setServPrice(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-mono">Estimated Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2 - 4 Hours"
                    value={servTime || ''}
                    onChange={(e) => setServTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <ImageInput
                  label="Service Photo / Image"
                  value={servImage || ''}
                  onChange={(val) => setServImage(val)}
                />
              </div>

              <div>
                <label className="text-zinc-400 font-mono">Description</label>
                <textarea
                  rows={2}
                  value={servDesc || ''}
                  onChange={(e) => setServDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-mono">Key Features (One feature per line)</label>
                <textarea
                  rows={3}
                  placeholder="2000HP Chassis Dyno Run&#10;Custom ECU Remap&#10;Air-Fuel Ratio Logging"
                  value={servFeatures || ''}
                  onChange={(e) => setServFeatures(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => { setIsCreatingService(false); setEditingService(null); }}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 text-zinc-950 font-bold rounded-xl"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-full bg-red-950 border border-red-800/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-xl text-white">Confirm Permanent Delete</h3>
                <p className="text-sm text-red-400 font-mono">Action cannot be undone</p>
              </div>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1">
              <p className="text-sm text-zinc-400">Target Item:</p>
              <p className="text-base font-bold text-amber-400 font-mono break-all">{deletingItem.name}</p>
              <p className="text-[12px] text-zinc-500 font-mono">ID: {deletingItem.id}</p>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Are you sure you want to delete this record? This item will be permanently purged from the default Firestore database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteAction}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center gap-2"
              >
                {isDeleting ? (
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

      {/* SUCCESS TOAST FOR DELETION */}
      {deleteSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-[110] bg-zinc-900 border border-amber-500 text-amber-400 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-sm animate-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-amber-400" />
          <span>{deleteSuccessMsg}</span>
        </div>
      )}

    </div>
  );
};
