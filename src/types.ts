export type UserRole = 'customer' | 'admin';

export const PRODUCT_CATEGORIES = [
  'Exhaust & Turbo',
  'Suspension & Brakes',
  'Interior & Seats',
  'Wheels & Tires',
  'Engine & Tuning'
];

export const PRODUCT_BRANDS = [
  'TAKATA',
  'HKS',
  'Spoon Sports',
  'RAYS',
  'BRIDE',
  'GReddy',
  'TOMEI',
  'ENDLESS',
  'MOMO',
  "APEX'i",
  'TRUST',
  'WORK',
  'RECARO',
  'Project Mu',
  'NISMO'
];

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  vehicleInfo?: {
    make: string;
    model: string;
    year: string;
  };
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string; // e.g. HKS, Spoon Sports, TAKATA, RAYS, BRIDE, MOMO, Tomei
  category: string; // e.g. Exhaust & Turbo, Suspension, Engine, Interior, Wheels, Brakes
  price: number;
  shippingFee?: number;
  image: string;
  description: string;
  stock: number;
  featured: boolean;
  specs: Record<string, string>;
  fitment: string; // e.g. Universal, Nissan Skyline GT-R R34, Honda Civic Type R FK8, Toyota Supra A90
}

export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
  estimatedTime: string;
  priceStartingFrom: number;
  image: string;
  features: string[];
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceBooking {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  serviceId: string;
  serviceName: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethodType = 'gcash' | 'paymaya' | 'cod' | 'bank_transfer';
export type PaymentStatusType = 'pending_verification' | 'verified' | 'paid' | 'unpaid' | 'failed';

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: OrderStatus;
  createdAt: string;
  paymentMethod: PaymentMethodType | string;
  paymentStatus?: PaymentStatusType;
  paymentReference?: string;
  paymentReceiptUrl?: string;
  paymentNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SiteSettings {
  // Brand & Header
  brandName: string;
  brandSubtitle: string;
  announcementText: string;
  announcementEnabled: boolean;
  logoUrl?: string;

  // Hero Section
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  heroBannerImage: string;
  heroBannerImages?: string[];
  heroPrimaryBtnText: string;
  heroSecondaryBtnText: string;
  heroQuickTags: string[];

  // Services Showcase Section
  servicesBadge: string;
  servicesTitle: string;
  servicesSubtitle: string;
  servicesSubtitle_unused?: string;

  // Parts Catalog Section
  partsBadge: string;
  partsTitle: string;
  partsSubtitle: string;

  // Tuner Showcase Section
  tunerShowcaseBadge?: string;
  tunerShowcaseTitle?: string;
  tunerShowcaseSubtitle?: string;

  // About / Garage Banner
  aboutTitle: string;
  aboutDescription: string;
  aboutImage: string;
  aboutImages?: string[];

  // Footer & Contact Info
  footerAbout: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  operatingHours: string;
  socialInstagram: string;
  socialYoutube: string;
  socialFacebook: string;
  socialTwitter: string;
  copyrightText: string;

  // Payment Gateways & E-Wallets (GCash & Maya QR Ph)
  paymentGcashEnabled?: boolean;
  paymentGcashName?: string;
  paymentGcashNumber?: string;
  paymentGcashQr?: string;
  paymentGcashInstructions?: string;

  paymentPaymayaEnabled?: boolean;
  paymentPaymayaName?: string;
  paymentPaymayaNumber?: string;
  paymentPaymayaQr?: string;
  paymentPaymayaInstructions?: string;

  paymentCodEnabled?: boolean;
  paymentBankEnabled?: boolean;
  paymentBankName?: string;
  paymentBankAccountName?: string;
  paymentBankAccountNumber?: string;
  paymentBankInstructions?: string;
}

export interface GalleryBuild {
  id: string;
  name: string;
  model: string;
  engine: string;
  power: string;
  color: string;
  image: string;
  additionalImages?: string[]; // Multiple photos for the build
  videoUrl?: string; // Optional YouTube / Video link or embed url
  linkUrl?: string;  // Optional external web link
  instagram: string;
  owner: string;
  description: string;
  partsKeywords: string[]; // Keywords to filter parts catalog
}

