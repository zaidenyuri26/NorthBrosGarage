import React, { useState, useEffect } from 'react';
import { ImageInput } from './ImageInput';
import { renderBrandBadgeNode } from './BrandBadge';
import { BrandHeader } from './BrandHeader';
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
  Car,
  QrCode,
  Smartphone,
  Copy,
  ExternalLink,
  CreditCard,
  Grid,
  X,
  Menu
} from 'lucide-react';
import {
  Product,
  ServiceCategory,
  ServiceBooking,
  Order,
  UserProfile,
  BookingStatus,
  OrderStatus,
  PaymentStatusType,
  SiteSettings,
  GalleryBuild,
  PRODUCT_CATEGORIES,
  PRODUCT_BRANDS
} from '../types';
import { useToast } from '../context/ToastContext';
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
  updateOrderPaymentStatus,
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'payments' | 'products' | 'services' | 'bookings' | 'orders' | 'users' | 'builds'>('settings');
  const [isGcashDrawerOpen, setIsGcashDrawerOpen] = useState(false);
  
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
  const [prodShippingFee, setProdShippingFee] = useState('100');
  const [prodImage, setProdImage] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [prodFitment, setProdFitment] = useState('Universal JDM');
  const [prodFeatured, setProdFeatured] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  // Form states for Service Add/Edit
  const [servTitle, setServTitle] = useState('');
  const [servDesc, setServDesc] = useState('');
  const [servIcon, setServIcon] = useState('Wrench');
  const [servTime, setServTime] = useState('2-3 Hours');
  const [servPrice, setServPrice] = useState('250');
  const [servImage, setServImage] = useState('');
  const [servFeatures, setServFeatures] = useState('');

  // Payment Verification & Receipt Viewer
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);

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

        // Payment Gateways
        paymentGcashEnabled: sSettings?.paymentGcashEnabled ?? true,
        paymentGcashName: sSettings?.paymentGcashName ?? '',
        paymentGcashNumber: sSettings?.paymentGcashNumber ?? '',
        paymentGcashQr: sSettings?.paymentGcashQr ?? '',
        paymentGcashInstructions: sSettings?.paymentGcashInstructions ?? '',

        paymentPaymayaEnabled: sSettings?.paymentPaymayaEnabled ?? true,
        paymentPaymayaName: sSettings?.paymentPaymayaName ?? '',
        paymentPaymayaNumber: sSettings?.paymentPaymayaNumber ?? '',
        paymentPaymayaQr: sSettings?.paymentPaymayaQr ?? '',
        paymentPaymayaInstructions: sSettings?.paymentPaymayaInstructions ?? '',

        paymentCodEnabled: sSettings?.paymentCodEnabled ?? true,
        paymentBankEnabled: sSettings?.paymentBankEnabled ?? true,
        paymentBankName: sSettings?.paymentBankName ?? '',
        paymentBankAccountName: sSettings?.paymentBankAccountName ?? '',
        paymentBankAccountNumber: sSettings?.paymentBankAccountNumber ?? '',
        paymentBankInstructions: sSettings?.paymentBankInstructions ?? ''
      });
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId: string) => {
    setVerifyingOrderId(orderId);
    try {
      await updateOrderPaymentStatus(orderId, 'verified');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'verified', status: 'accepted' } : o));
      toast.success('Payment Verified & Confirmed!', `Order #${orderId.slice(0, 8).toUpperCase()} has been marked as verified and accepted.`);
      onRefreshData();
    } catch (err: any) {
      console.error('Failed to verify payment:', err);
      toast.error('Payment Verification Failed', err.message || 'Unable to update payment status.');
    } finally {
      setVerifyingOrderId(null);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatusType) => {
    try {
      await updateOrderPaymentStatus(orderId, paymentStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus } : o));
      toast.success('Payment Status Updated', `Order payment status changed to ${paymentStatus.replace('_', ' ')}.`);
      onRefreshData();
    } catch (err: any) {
      console.error('Failed to update payment status:', err);
      toast.error('Failed to update payment status', err.message);
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
    setProdShippingFee('100');
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
    setProdShippingFee(p.shippingFee !== undefined && p.shippingFee !== null ? p.shippingFee.toString() : '0');
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
    const shippingFeeNum = parseFloat(prodShippingFee) || 0;
    const stockNum = parseInt(prodStock) || 0;

    const payload = {
      name: prodName,
      brand: prodBrand,
      category: prodCategory,
      price: priceNum,
      shippingFee: shippingFeeNum,
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
    const itemToDelete = { ...deletingItem };
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
      
      const typeLabels: Record<string, string> = {
        product: 'Product',
        service: 'Workshop Service',
        order: 'Customer Order',
        booking: 'Service Booking',
        user: 'User Profile',
        build: 'JDM Build',
      };
      const label = typeLabels[itemToDelete.type] || 'Item';
      toast.deleted(label, itemToDelete.name);

      setDeleteSuccessMsg(`Successfully deleted ${itemToDelete.name}`);
      setTimeout(() => setDeleteSuccessMsg(null), 3500);
      onRefreshData();
    } catch (err) {
      console.error('Failed to delete item from Firestore:', err);
      toast.error('Deletion Failed', `Could not delete ${itemToDelete.name} from Firestore.`);
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
            onClick={() => setIsGcashDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-extrabold transition shadow-lg shadow-blue-500/20 border border-blue-400/30"
          >
            <Grid className="w-4 h-4 text-amber-400" />
            <span>GCash Drawer Menu</span>
          </button>
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
        
        {/* GCash-Style 3-Column Services & Settings Navigation Grid */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center font-black">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black font-mono text-white tracking-wide uppercase">GCash Admin Service Hub</h2>
                <p className="text-xs text-zinc-400">3-Column Grid Layout (Left to Right)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold capitalize flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Active: {activeTab}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { id: 'settings', label: 'Website CMS', icon: Globe, color: 'from-amber-500 to-amber-600', badge: undefined },
              { id: 'payments', label: 'Payment QR Ph', icon: QrCode, color: 'from-blue-600 to-indigo-600', badge: undefined },
              { id: 'overview', label: 'Overview Stats', icon: TrendingUp, color: 'from-teal-500 to-emerald-600', badge: undefined },
              { id: 'products', label: 'Parts Catalog', icon: Package, color: 'from-emerald-500 to-teal-600', badge: products.length },
              { id: 'services', label: 'Shop Services', icon: Calendar, color: 'from-sky-500 to-blue-600', badge: services.length },
              { id: 'bookings', label: 'Appointments', icon: Calendar, color: 'from-amber-600 to-orange-600', badge: pendingBookingsCount },
              { id: 'orders', label: 'Orders History', icon: ShoppingBag, color: 'from-purple-500 to-indigo-600', badge: orders.filter(o => o.paymentStatus === 'pending_receipt' || o.paymentStatus === 'pending_verification').length },
              { id: 'users', label: 'Users & Roles', icon: Users, color: 'from-violet-500 to-purple-600', badge: users.length },
              { id: 'builds', label: 'Build Chronicles', icon: Camera, color: 'from-red-500 to-rose-600', badge: builds.length }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group relative flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl transition-all duration-200 border ${
                    isActive 
                      ? 'bg-amber-500/15 border-amber-500/80 shadow-lg shadow-amber-500/20 scale-[1.02]' 
                      : 'bg-zinc-950/80 border-zinc-800/80 hover:bg-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${tab.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black shadow-md border-2 border-zinc-900">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`mt-2.5 text-xs sm:text-sm font-bold text-center leading-tight transition-colors ${
                    isActive ? 'text-amber-400 font-extrabold' : 'text-zinc-200 group-hover:text-white'
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* GCash Slide-Out Drawer Overlay */}
        {isGcashDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/85 backdrop-blur-md transition-opacity">
            <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/30">
                      <Grid className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white font-mono">GCash Admin Drawer</h3>
                      <p className="text-xs text-zinc-400">3-Grid Service Shortcut Panel</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsGcashDrawerOpen(false)}
                    className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'settings', label: 'Website CMS', icon: Globe, color: 'from-amber-500 to-amber-600' },
                    { id: 'payments', label: 'Payment QR', icon: QrCode, color: 'from-blue-600 to-indigo-600' },
                    { id: 'overview', label: 'Overview', icon: TrendingUp, color: 'from-teal-500 to-emerald-600' },
                    { id: 'products', label: 'Products', icon: Package, color: 'from-emerald-500 to-teal-600', badge: products.length },
                    { id: 'services', label: 'Services', icon: Calendar, color: 'from-sky-500 to-blue-600', badge: services.length },
                    { id: 'bookings', label: 'Bookings', icon: Calendar, color: 'from-amber-600 to-orange-600', badge: pendingBookingsCount },
                    { id: 'orders', label: 'Orders', icon: ShoppingBag, color: 'from-purple-500 to-indigo-600', badge: orders.length },
                    { id: 'users', label: 'Users', icon: Users, color: 'from-violet-500 to-purple-600', badge: users.length },
                    { id: 'builds', label: 'Builds', icon: Camera, color: 'from-red-500 to-rose-600', badge: builds.length }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          setIsGcashDrawerOpen(false);
                        }}
                        className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all border ${
                          isActive ? 'bg-amber-500/20 border-amber-500/80 shadow-md shadow-amber-500/10' : 'bg-zinc-950 border-zinc-800/80 hover:bg-zinc-800'
                        }`}
                      >
                        <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${tab.color} text-white flex items-center justify-center shadow-md mb-2`}>
                          <Icon className="w-6 h-6" />
                          {tab.badge !== undefined && tab.badge > 0 && (
                            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-black border border-zinc-900">
                              {tab.badge}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-bold text-center ${isActive ? 'text-amber-400 font-extrabold' : 'text-zinc-300'}`}>
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800 text-center">
                <p className="text-xs text-zinc-500 font-mono">NORTHBROS GARAGE — GCASH DRAWER CONSOLE</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PAYMENT GATEWAYS (GCASH & MAYA) */}
        {activeTab === 'payments' && (
          <form onSubmit={handleSaveSiteSettings} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-blue-500/30 p-6 rounded-2xl shadow-xl">
              <div>
                <div className="inline-flex items-center gap-2 text-blue-400 font-mono text-xs uppercase font-bold mb-1">
                  <QrCode className="w-4 h-4" />
                  <span>DIRECT E-WALLET & QR PH PAYMENT GATEWAYS</span>
                </div>
                <h2 className="text-2xl font-mono font-black text-white italic uppercase">
                  GCASH, MAYA & BANK RECEIVING ACCOUNTS
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Set your registered GCash/Maya mobile numbers, account names, and QR Ph code images. Customers will scan or transfer to these details during checkout.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black px-6 py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-xl shadow-blue-900/30 transition-all active:scale-95 shrink-0"
              >
                {savingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Gateways...</span>
                  </>
                ) : settingsSavedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Gateways Saved Live!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Payment Settings</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Interactive Status Bar & Toggles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setSiteSettingsForm({ ...siteSettingsForm, paymentGcashEnabled: !(siteSettingsForm.paymentGcashEnabled ?? true) })}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                  siteSettingsForm.paymentGcashEnabled ?? true ? 'bg-blue-950/40 border-blue-500/60 text-blue-300 shadow-lg shadow-blue-950/30' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">G</div>
                  <span className="font-bold">GCash</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold flex items-center gap-1 ${
                  siteSettingsForm.paymentGcashEnabled ?? true ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  <span>{siteSettingsForm.paymentGcashEnabled ?? true ? 'ON' : 'OFF'}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSiteSettingsForm({ ...siteSettingsForm, paymentPaymayaEnabled: !(siteSettingsForm.paymentPaymayaEnabled ?? true) })}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                  siteSettingsForm.paymentPaymayaEnabled ?? true ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 shadow-lg shadow-emerald-950/30' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">M</div>
                  <span className="font-bold">Maya</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold flex items-center gap-1 ${
                  siteSettingsForm.paymentPaymayaEnabled ?? true ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  <span>{siteSettingsForm.paymentPaymayaEnabled ?? true ? 'ON' : 'OFF'}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSiteSettingsForm({ ...siteSettingsForm, paymentBankEnabled: !(siteSettingsForm.paymentBankEnabled ?? true) })}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                  siteSettingsForm.paymentBankEnabled ?? true ? 'bg-purple-950/40 border-purple-500/60 text-purple-300 shadow-lg shadow-purple-950/30' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span className="font-bold">Bank Transfer</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold flex items-center gap-1 ${
                  siteSettingsForm.paymentBankEnabled ?? true ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  <span>{siteSettingsForm.paymentBankEnabled ?? true ? 'ON' : 'OFF'}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSiteSettingsForm({ ...siteSettingsForm, paymentCodEnabled: !(siteSettingsForm.paymentCodEnabled ?? true) })}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                  siteSettingsForm.paymentCodEnabled ?? true ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 shadow-lg shadow-amber-950/30' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span className="font-bold">COD</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold flex items-center gap-1 ${
                  siteSettingsForm.paymentCodEnabled ?? true ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  <span>{siteSettingsForm.paymentCodEnabled ?? true ? 'ON' : 'OFF'}</span>
                </div>
              </button>
            </div>

            {/* GCash Settings Card */}
            <div className={`bg-zinc-900 border rounded-2xl p-6 space-y-4 shadow-xl transition-all ${
              siteSettingsForm.paymentGcashEnabled ?? true ? 'border-blue-500/40' : 'border-zinc-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-600/30">
                    G
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-white text-base uppercase">GCash Account Gateway</h3>
                    <span className="text-xs text-blue-400 font-mono">0% Merchant Fee Direct Mobile E-Wallet</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-zinc-300 bg-zinc-950 px-4 py-2 rounded-xl border border-blue-500/30 hover:border-blue-500 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={siteSettingsForm.paymentGcashEnabled ?? true}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentGcashEnabled: e.target.checked })}
                    className="w-4 h-4 accent-blue-500 rounded"
                  />
                  <span className="font-bold text-blue-300">
                    {siteSettingsForm.paymentGcashEnabled ?? true ? '✓ GCash Enabled' : 'GCash Disabled'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div>
                  <label className="font-mono text-zinc-400 text-xs block mb-1">GCash Registered Mobile Number</label>
                  <input
                    type="text"
                    value={siteSettingsForm.paymentGcashNumber || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentGcashNumber: e.target.value })}
                    placeholder="e.g. 0917 888 6789"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-amber-400 font-mono font-bold text-base focus:border-blue-500 outline-none"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Displayed with a 1-click COPY button for customers during checkout.</p>
                </div>

                <div>
                  <label className="font-mono text-zinc-400 text-xs block mb-1">GCash Account Holder Name</label>
                  <input
                    type="text"
                    value={siteSettingsForm.paymentGcashName || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentGcashName: e.target.value })}
                    placeholder="e.g. NorthBros Performance Garage / Juan Dela Cruz"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono focus:border-blue-500 outline-none"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Verified name shown inside GCash app upon sending payment.</p>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="font-mono text-zinc-400 text-xs block">GCash QR Ph Code Image (Upload or Paste Link)</label>
                  <ImageInput
                    label="GCash QR Code Image"
                    value={siteSettingsForm.paymentGcashQr || ''}
                    onChange={(val) => setSiteSettingsForm({ ...siteSettingsForm, paymentGcashQr: val })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-mono text-zinc-400 text-xs block mb-1">GCash Checkout Instructions</label>
                  <textarea
                    rows={2}
                    value={siteSettingsForm.paymentGcashInstructions || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentGcashInstructions: e.target.value })}
                    placeholder="Open your GCash app, tap Send Money or Scan QR, send exact amount, then enter the 13-digit Reference Number."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-300 text-xs focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Maya Settings Card */}
            <div className={`bg-zinc-900 border rounded-2xl p-6 space-y-4 shadow-xl transition-all ${
              siteSettingsForm.paymentPaymayaEnabled ?? true ? 'border-emerald-500/40' : 'border-zinc-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-600/30">
                    M
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-white text-base uppercase">Maya (PayMaya) Gateway</h3>
                    <span className="text-xs text-emerald-400 font-mono">Instant QR Ph Merchant Transfer</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-zinc-300 bg-zinc-950 px-4 py-2 rounded-xl border border-emerald-500/30 hover:border-emerald-500 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={siteSettingsForm.paymentPaymayaEnabled ?? true}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentPaymayaEnabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span className="font-bold text-emerald-300">
                    {siteSettingsForm.paymentPaymayaEnabled ?? true ? '✓ Maya Enabled' : 'Maya Disabled'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div>
                  <label className="font-mono text-zinc-400 text-xs block mb-1">Maya Registered Mobile Number</label>
                  <input
                    type="text"
                    value={siteSettingsForm.paymentPaymayaNumber || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentPaymayaNumber: e.target.value })}
                    placeholder="e.g. 0918 888 6789"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-emerald-400 font-mono font-bold text-base focus:border-emerald-500 outline-none"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Displayed with a 1-click COPY button for customers during checkout.</p>
                </div>

                <div>
                  <label className="font-mono text-zinc-400 text-xs block mb-1">Maya Account Holder Name</label>
                  <input
                    type="text"
                    value={siteSettingsForm.paymentPaymayaName || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentPaymayaName: e.target.value })}
                    placeholder="e.g. NorthBros Performance Garage"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="font-mono text-zinc-400 text-xs block">Maya QR Ph Code Image (Upload or Paste Link)</label>
                  <ImageInput
                    label="Maya QR Code Image"
                    value={siteSettingsForm.paymentPaymayaQr || ''}
                    onChange={(val) => setSiteSettingsForm({ ...siteSettingsForm, paymentPaymayaQr: val })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-mono text-zinc-400 text-xs block mb-1">Maya Checkout Instructions</label>
                  <textarea
                    rows={2}
                    value={siteSettingsForm.paymentPaymayaInstructions || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentPaymayaInstructions: e.target.value })}
                    placeholder="Open your Maya app, tap Scan To Pay or Send Money, send exact amount, then enter the Transaction Reference Number."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-300 text-xs focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bank Transfer & COD Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className={`bg-zinc-900 border rounded-2xl p-6 space-y-4 shadow-xl transition-all ${
                siteSettingsForm.paymentBankEnabled ?? true ? 'border-purple-500/40' : 'border-zinc-800 opacity-60'
              }`}>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="font-mono font-bold text-purple-400 text-sm uppercase flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Direct Bank Transfer
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-zinc-300 bg-zinc-950 px-3 py-1.5 rounded-xl border border-purple-500/30 hover:border-purple-500 transition-all select-none">
                    <input
                      type="checkbox"
                      checked={siteSettingsForm.paymentBankEnabled ?? true}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentBankEnabled: e.target.checked })}
                      className="w-4 h-4 accent-purple-500 rounded"
                    />
                    <span className="font-bold text-purple-300">
                      {siteSettingsForm.paymentBankEnabled ?? true ? '✓ Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="text-zinc-400 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={siteSettingsForm.paymentBankName || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentBankName: e.target.value })}
                      placeholder="e.g. BDO / UnionBank / BPI"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={siteSettingsForm.paymentBankAccountName || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentBankAccountName: e.target.value })}
                      placeholder="e.g. NorthBros Performance Garage Inc."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={siteSettingsForm.paymentBankAccountNumber || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentBankAccountNumber: e.target.value })}
                      placeholder="e.g. 0012 3456 7890"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-purple-300 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className={`bg-zinc-900 border rounded-2xl p-6 space-y-4 shadow-xl transition-all ${
                siteSettingsForm.paymentCodEnabled ?? true ? 'border-amber-500/40' : 'border-zinc-800 opacity-60'
              }`}>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="font-mono font-bold text-amber-400 text-sm uppercase flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Cash On Delivery (COD)
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-zinc-300 bg-zinc-950 px-3 py-1.5 rounded-xl border border-amber-500/30 hover:border-amber-500 transition-all select-none">
                    <input
                      type="checkbox"
                      checked={siteSettingsForm.paymentCodEnabled ?? true}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentCodEnabled: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span className="font-bold text-amber-300">
                      {siteSettingsForm.paymentCodEnabled ?? true ? '✓ Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                  Allow customers to pay in cash upon parcel arrival or workshop pickup. Orders placed with COD will mark payment as pending collection.
                </p>
              </div>
            </div>

            {/* Bottom Floating Save Action Bar */}
            <div className="sticky bottom-4 z-30 bg-zinc-900/95 backdrop-blur-md border border-blue-500/40 p-4 rounded-2xl flex items-center justify-between shadow-2xl">
              <span className="font-mono text-xs text-blue-300 font-bold">
                {settingsSavedSuccess ? '✓ Payment Gateways updated live in Firestore!' : 'Save changes to update GCash / Maya checkout details'}
              </span>

              <button
                type="submit"
                disabled={savingSettings}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-900/40 transition-all active:scale-95"
              >
                {savingSettings ? 'Saving...' : 'Save Payment Gateways'}
              </button>
            </div>
          </form>
        )}

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

                {/* Live Brand Header Preview */}
                <div className="md:col-span-2 pt-2 border-t border-zinc-800/80">
                  <label className="font-mono text-zinc-400 block mb-2 text-xs uppercase tracking-wider">Live Header Brand & Badge Preview</label>
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-center justify-around gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Header Navbar Logo</span>
                      <BrandHeader 
                        size="md" 
                        brandName={siteSettingsForm.brandName || 'NorthBros'} 
                        brandSubtitle={siteSettingsForm.brandSubtitle || 'GARAGE'} 
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Angled Showroom Badge</span>
                      <BrandHeader 
                        size="sm" 
                        variant="badge"
                        brandName={siteSettingsForm.brandName || 'NorthBros'} 
                        brandSubtitle={siteSettingsForm.brandSubtitle || 'GARAGE'} 
                      />
                    </div>
                  </div>
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

            {/* SECTION 6: Payment Gateways & E-Wallets (GCash, Maya, Bank Transfer) */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 text-amber-400 font-mono text-xs uppercase font-bold mb-1">
                  <QrCode className="w-4 h-4" />
                  <span>DIRECT QR PH & E-WALLET TRANSFERS</span>
                </div>
                <h3 className="text-xl font-mono font-bold text-white uppercase tracking-tight">
                  6. PAYMENT RECEIVING SETTINGS (GCASH & MAYA)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure the official GCash number, Maya account, and QR Ph images displayed to customers at checkout.
                </p>
              </div>

              {/* GCash Settings Card */}
              <div className="bg-zinc-950 border border-blue-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                      G
                    </div>
                    <div>
                      <h4 className="font-mono font-bold text-white text-sm uppercase">GCash Account Configuration</h4>
                      <span className="text-[11px] text-zinc-400 font-mono">0% Merchant Fee E-Wallet Transfer</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={siteSettingsForm.paymentGcashEnabled ?? true}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentGcashEnabled: e.target.checked })}
                      className="w-4 h-4 accent-blue-500 rounded"
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-mono text-zinc-400 text-xs block mb-1">GCash Account Holder Name *</label>
                    <input
                      type="text"
                      value={siteSettingsForm.paymentGcashName || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentGcashName: e.target.value })}
                      placeholder="e.g. NorthBros Performance Garage / John Doe"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-zinc-400 text-xs block mb-1">GCash Registered Mobile Number *</label>
                    <input
                      type="text"
                      value={siteSettingsForm.paymentGcashNumber || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentGcashNumber: e.target.value })}
                      placeholder="e.g. 0917 888 6789"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-amber-400 font-mono font-bold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-mono text-zinc-400 text-xs block mb-1">GCash QR Ph Code Image URL (or upload below)</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={siteSettingsForm.paymentGcashQr || ''}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentGcashQr: e.target.value })}
                        placeholder="https://... (or use QR uploader)"
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white font-mono text-xs"
                      />
                      {siteSettingsForm.paymentGcashQr && (
                        <img
                          src={siteSettingsForm.paymentGcashQr}
                          alt="GCash QR Preview"
                          className="w-10 h-10 object-contain bg-white rounded-lg p-0.5 border border-zinc-700"
                        />
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-mono text-zinc-400 text-xs block mb-1">GCash Instructions for Customers</label>
                    <textarea
                      rows={2}
                      value={siteSettingsForm.paymentGcashInstructions || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentGcashInstructions: e.target.value })}
                      placeholder="Open GCash, scan QR or send to the number below, then enter the Reference Number."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Maya Settings Card */}
              <div className="bg-zinc-950 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
                      M
                    </div>
                    <div>
                      <h4 className="font-mono font-bold text-white text-sm uppercase">Maya (PayMaya) Account Configuration</h4>
                      <span className="text-[11px] text-zinc-400 font-mono">Instant QR Ph Payment</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={siteSettingsForm.paymentPaymayaEnabled ?? true}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentPaymayaEnabled: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-mono text-zinc-400 text-xs block mb-1">Maya Account Holder Name *</label>
                    <input
                      type="text"
                      value={siteSettingsForm.paymentPaymayaName || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentPaymayaName: e.target.value })}
                      placeholder="e.g. NorthBros Performance Garage"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-zinc-400 text-xs block mb-1">Maya Registered Mobile Number *</label>
                    <input
                      type="text"
                      value={siteSettingsForm.paymentPaymayaNumber || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentPaymayaNumber: e.target.value })}
                      placeholder="e.g. 0918 888 6789"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-emerald-400 font-mono font-bold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-mono text-zinc-400 text-xs block mb-1">Maya QR Ph Code Image URL</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={siteSettingsForm.paymentPaymayaQr || ''}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentPaymayaQr: e.target.value })}
                        placeholder="https://... (or QR url)"
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white font-mono text-xs"
                      />
                      {siteSettingsForm.paymentPaymayaQr && (
                        <img
                          src={siteSettingsForm.paymentPaymayaQr}
                          alt="Maya QR Preview"
                          className="w-10 h-10 object-contain bg-white rounded-lg p-0.5 border border-zinc-700"
                        />
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-mono text-zinc-400 text-xs block mb-1">Maya Instructions for Customers</label>
                    <textarea
                      rows={2}
                      value={siteSettingsForm.paymentPaymayaInstructions || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentPaymayaInstructions: e.target.value })}
                      placeholder="Open Maya, scan QR or send to the number below, then enter the Reference Number."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Transfer & COD Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-950 border border-purple-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h4 className="font-mono font-bold text-purple-400 text-xs uppercase">Bank Transfer (BDO/UnionBank)</h4>
                    <label className="flex items-center gap-1.5 cursor-pointer font-mono text-xs text-zinc-400">
                      <input
                        type="checkbox"
                        checked={siteSettingsForm.paymentBankEnabled ?? true}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentBankEnabled: e.target.checked })}
                        className="w-3.5 h-3.5 accent-purple-500 rounded"
                      />
                      <span>Enabled</span>
                    </label>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-zinc-500 font-mono block">Bank Name</label>
                      <input
                        type="text"
                        value={siteSettingsForm.paymentBankName || ''}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentBankName: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 font-mono block">Account Name</label>
                      <input
                        type="text"
                        value={siteSettingsForm.paymentBankAccountName || ''}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentBankAccountName: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 font-mono block">Account Number</label>
                      <input
                        type="text"
                        value={siteSettingsForm.paymentBankAccountNumber || ''}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentBankAccountNumber: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-purple-300 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h4 className="font-mono font-bold text-amber-400 text-xs uppercase">Cash on Delivery (COD)</h4>
                    <label className="flex items-center gap-1.5 cursor-pointer font-mono text-xs text-zinc-400">
                      <input
                        type="checkbox"
                        checked={siteSettingsForm.paymentCodEnabled ?? true}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, paymentCodEnabled: e.target.checked })}
                        className="w-3.5 h-3.5 accent-amber-500 rounded"
                      />
                      <span>Enabled</span>
                    </label>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                    Allow drivers to pay upon parcel handover. Orders placed via COD will have status <span className="font-mono text-amber-400">Unpaid / Pay on Delivery</span>.
                  </p>
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
                <p className="text-2xl sm:text-3xl font-mono font-black text-amber-400">₱{totalRevenue.toLocaleString()}</p>
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
                        <p className="font-bold text-white">{o.customerName} — <span className="text-amber-400">₱{o.totalAmount.toLocaleString()}</span></p>
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
                          <td className="p-4 font-mono font-bold text-white">₱{p.price.toLocaleString()}</td>
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
                          <td className="p-4 font-mono font-bold text-amber-400">₱{s.priceStartingFrom}</td>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold font-mono text-white uppercase tracking-tight">PARTS ORDERS & PAYMENT AUDIT</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Verify customer GCash/Maya reference numbers, inspect uploaded receipts, and dispatch parts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-500">
                  {orders.filter(o => o.paymentStatus === 'pending_verification').length} Pending Payment Verifications
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="p-8 bg-zinc-900 rounded-2xl text-center text-zinc-500 font-mono text-sm">
                  No orders placed yet.
                </div>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 text-sm">
                    {/* Header: Order ID, Customer, Amount, Order Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 text-sm">ORDER #{o.id.slice(0, 10).toUpperCase()}</span>
                          <span className="text-zinc-600 font-mono text-[11px]">ID: {o.id}</span>
                        </div>
                        <p className="text-zinc-200 font-bold mt-0.5">{o.customerName} ({o.customerEmail})</p>
                        <p className="text-[12px] text-zinc-400 font-mono">
                          📍 {o.shippingAddress?.street}, {o.shippingAddress?.city}, {o.shippingAddress?.state} {o.shippingAddress?.zipCode} | 📞 {o.phone || 'N/A'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 font-mono flex-wrap sm:flex-nowrap">
                        <span className="text-xl font-black text-white">₱{o.totalAmount.toLocaleString()} PHP</span>
                        <select
                          value={o.status || 'pending'}
                          onChange={(e) => handleUpdateOrder(o.id, e.target.value as OrderStatus)}
                          className="bg-zinc-950 border border-zinc-700 text-amber-400 font-bold rounded-lg px-3 py-1.5 text-[12px] uppercase tracking-tighter"
                        >
                          <option value="pending">Pending Review</option>
                          <option value="accepted">Accepted & Processing</option>
                          <option value="preparing">Preparing in Garage</option>
                          <option value="ready_to_ship">Ready for Shipment</option>
                          <option value="shipped">Shipped with Courier</option>
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

                    {/* PAYMENT AUDIT ROW */}
                    <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                      {/* Left: Payment Method & Reference */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Payment Method Badge */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono text-zinc-500 uppercase">Method:</span>
                          <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] uppercase ${
                            o.paymentMethod === 'gcash' ? 'bg-blue-950 border border-blue-600 text-blue-300' :
                            o.paymentMethod === 'paymaya' ? 'bg-emerald-950 border border-emerald-600 text-emerald-300' :
                            o.paymentMethod === 'bank_transfer' ? 'bg-purple-950 border border-purple-600 text-purple-300' :
                            'bg-amber-950 border border-amber-600 text-amber-300'
                          }`}>
                            {o.paymentMethod === 'gcash' ? 'GCash' :
                             o.paymentMethod === 'paymaya' ? 'Maya (PayMaya)' :
                             o.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery (COD)'}
                          </span>
                        </div>

                        {/* Reference Number */}
                        {o.paymentReference && (
                          <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                            <span className="text-zinc-500 font-mono text-[11px] uppercase">Ref:</span>
                            <span className="font-mono font-bold text-white tracking-wider">{o.paymentReference}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(o.paymentReference || '');
                                toast.success('Reference Copied', `Copied: ${o.paymentReference}`);
                              }}
                              className="text-zinc-500 hover:text-amber-400 ml-1"
                              title="Copy Reference"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Receipt Screenshot Button */}
                        {o.paymentReceiptUrl && (
                          <button
                            type="button"
                            onClick={() => setViewingReceiptOrder(o)}
                            className="flex items-center gap-1 text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1 rounded-lg border border-zinc-700 transition-colors"
                          >
                            <ImageIcon className="w-3 h-3 text-amber-400" />
                            <span>View Receipt Screenshot</span>
                          </button>
                        )}
                      </div>

                      {/* Right: Payment Status & Quick Verification Action */}
                      <div className="flex items-center gap-2 self-end md:self-auto font-mono">
                        <span className="text-zinc-500 text-[11px] uppercase">Payment Status:</span>
                        
                        <select
                          value={o.paymentStatus || 'unpaid'}
                          onChange={(e) => handleUpdatePaymentStatus(o.id, e.target.value as PaymentStatusType)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-tight border focus:outline-none ${
                            o.paymentStatus === 'verified' || o.paymentStatus === 'paid'
                              ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                              : o.paymentStatus === 'pending_verification'
                              ? 'bg-amber-950 border-amber-500 text-amber-300 animate-pulse'
                              : o.paymentStatus === 'failed'
                              ? 'bg-red-950 border-red-600 text-red-300'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                          }`}
                        >
                          <option value="pending_verification">Pending Verification</option>
                          <option value="verified">Verified (Approved)</option>
                          <option value="paid">Paid</option>
                          <option value="unpaid">Unpaid / COD</option>
                          <option value="failed">Failed / Invalid Ref</option>
                          <option value="refunded">Refunded</option>
                        </select>

                        {/* 1-Click Verify Button if still pending */}
                        {o.paymentStatus === 'pending_verification' && (
                          <button
                            type="button"
                            disabled={verifyingOrderId === o.id}
                            onClick={() => handleVerifyPayment(o.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black px-3 py-1 rounded-lg text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-emerald-900/30"
                          >
                            {verifyingOrderId === o.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            <span>Verify & Accept</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {o.items?.map((item, idx) => (
                        <div key={idx} className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-2 text-[12px] font-mono">
                          <span className="text-amber-400 font-bold">{item.brand}</span>
                          <span className="text-zinc-300">{item.productName}</span>
                          <span className="text-zinc-500">x{item.quantity}</span>
                          <span className="text-zinc-400">₱{(item.price * item.quantity).toLocaleString()}</span>
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
                              src={b.image || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full space-y-4 text-sm my-8 max-h-[90vh] overflow-y-auto">
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
              <div className="relative">
                <label className="text-zinc-400 font-mono block mb-2">Brand</label>
                <button
                  type="button"
                  onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                  className="w-full bg-zinc-950 border border-zinc-800 hover:border-amber-500/80 rounded-xl p-2.5 text-zinc-100 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2">
                    {renderBrandBadgeNode(prodBrand || PRODUCT_BRANDS[0], 'sm')}
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">▼</span>
                </button>

                {isBrandDropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl max-h-60 overflow-y-auto no-scrollbar p-1.5 space-y-1">
                    {PRODUCT_BRANDS.map((brand) => {
                      const isSelected = prodBrand === brand;
                      return (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => {
                            setProdBrand(brand);
                            setIsBrandDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 border border-amber-500/60'
                              : 'bg-zinc-900/60 border border-transparent hover:bg-zinc-900 hover:border-zinc-700'
                          }`}
                        >
                          {renderBrandBadgeNode(brand, 'sm')}
                          {isSelected && <span className="text-amber-400 text-xs font-mono font-bold">ACTIVE</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
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

              <div className="space-y-1">
                <ImageInput
                  label="Product Photo / Image"
                  value={prodImage}
                  onChange={(url) => setProdImage(url)}
                  placeholder="https://... or upload a photo"
                />
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
                  <label className="text-zinc-400 font-mono">Shipping Fee (₱ PHP)</label>
                  <input
                    type="number"
                    required
                    value={prodShippingFee || ''}
                    onChange={(e) => setProdShippingFee(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="text-zinc-400 font-mono">Fitment Specs</label>
                  <input
                    type="text"
                    value={prodFitment || ''}
                    onChange={(e) => setProdFitment(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100"
                  />
                </div>
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

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prodFeatured"
                  checked={prodFeatured}
                  onChange={(e) => setProdFeatured(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="prodFeatured" className="text-xs font-mono text-zinc-300 cursor-pointer">
                  Feature this product on homepage / top of catalog
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => { setIsCreatingProduct(false); setEditingProduct(null); }}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 text-zinc-950 font-bold rounded-xl hover:bg-amber-400 transition-colors"
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

      {/* RECEIPT SCREENSHOT PREVIEW MODAL */}
      {viewingReceiptOrder && (
        <div className="fixed inset-0 z-[120] bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="font-mono text-xs text-amber-400 font-bold uppercase">Customer Payment Proof</span>
                <h4 className="font-mono font-bold text-white text-base">
                  Order #{viewingReceiptOrder.id.slice(0, 10).toUpperCase()}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceiptOrder(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-500">Sender:</span>
                <span className="text-zinc-200 font-bold">{viewingReceiptOrder.customerName}</span>
              </div>
              <div className="flex justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-500">Method & Ref:</span>
                <span className="text-amber-400 font-bold">
                  {viewingReceiptOrder.paymentMethod?.toUpperCase()} | {viewingReceiptOrder.paymentReference || 'No Ref Entered'}
                </span>
              </div>
            </div>

            {/* Receipt Image Display */}
            {viewingReceiptOrder.paymentReceiptUrl ? (
              <div className="max-h-[60vh] overflow-auto rounded-2xl bg-zinc-950 p-2 border border-zinc-800 flex items-center justify-center">
                <img
                  src={viewingReceiptOrder.paymentReceiptUrl}
                  alt="Customer Payment Receipt"
                  className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-lg"
                />
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 font-mono text-sm bg-zinc-950 rounded-2xl">
                No screenshot image attached for this order.
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewingReceiptOrder(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase font-bold rounded-xl"
              >
                Close
              </button>

              {viewingReceiptOrder.paymentStatus === 'pending_verification' && (
                <button
                  type="button"
                  onClick={() => {
                    handleVerifyPayment(viewingReceiptOrder.id);
                    setViewingReceiptOrder(null);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify Payment Now</span>
                </button>
              )}
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
