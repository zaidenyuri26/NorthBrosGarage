import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  Product,
  ServiceCategory,
  ServiceBooking,
  Order,
  UserProfile,
  BookingStatus,
  OrderStatus,
  UserRole,
  SiteSettings,
  GalleryBuild
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));

  // Throw on permission-denied or write mutations so security audits or UI toasts catch it
  if (
    errMsg.includes('Missing or insufficient permissions') ||
    errMsg.includes('permission-denied') ||
    operationType === OperationType.CREATE ||
    operationType === OperationType.UPDATE ||
    operationType === OperationType.DELETE
  ) {
    throw new Error(JSON.stringify(errInfo));
  }
}

/**
 * Validates Firestore connection on boot
 */
export async function validateFirestoreConnection() {
  try {
    // Attempt standard check with timeout or cache fallback
    const docRef = doc(db, '_meta', 'connection_test');
    await getDoc(docRef);
    console.log('Firestore connection checked.');
  } catch (error) {
    // Gracefully handle offline or unavailable mode without disruptive logs
    console.log('Firestore operating in offline/client mode.');
  }
}

// Collection Names in Firestore
const PRODUCTS_COLLECTION = 'products';
const SERVICES_COLLECTION = 'services';
const BOOKINGS_COLLECTION = 'bookings';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const SETTINGS_COLLECTION = 'site_settings';
const BUILDS_COLLECTION = 'builds';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: '',
  brandSubtitle: '',
  announcementText: '',
  announcementEnabled: false,
  logoUrl: '',

  heroBadge: '',
  heroTitleLine1: '',
  heroTitleLine2: '',
  heroDescription: '',
  heroBannerImage: '',
  heroBannerImages: [],
  heroPrimaryBtnText: '',
  heroSecondaryBtnText: '',
  heroQuickTags: [],

  servicesBadge: '',
  servicesTitle: '',
  servicesSubtitle: '',

  partsBadge: '',
  partsTitle: '',
  partsSubtitle: '',

  tunerShowcaseBadge: '',
  tunerShowcaseTitle: '',
  tunerShowcaseSubtitle: '',

  aboutTitle: '',
  aboutDescription: '',
  aboutImage: '',
  aboutImages: [],

  footerAbout: '',
  contactPhone: '',
  contactEmail: '',
  contactAddress: '',
  operatingHours: '',
  socialInstagram: '',
  socialYoutube: '',
  socialFacebook: '',
  socialTwitter: '',
  copyrightText: '',

  // Payment Gateways (GCash & Maya QR Ph)
  paymentGcashEnabled: true,
  paymentGcashName: '',
  paymentGcashNumber: '',
  paymentGcashQr: '',
  paymentGcashInstructions: '',

  paymentPaymayaEnabled: true,
  paymentPaymayaName: '',
  paymentPaymayaNumber: '',
  paymentPaymayaQr: '',
  paymentPaymayaInstructions: '',

  paymentCodEnabled: true,
  paymentBankEnabled: true,
  paymentBankName: '',
  paymentBankAccountName: '',
  paymentBankAccountNumber: '',
  paymentBankInstructions: ''
};

/**
 * Site Settings API (Reads/Writes to Firestore 'site_settings/main')
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  const path = `${SETTINGS_COLLECTION}/main`;
  try {
    const ref = doc(db, SETTINGS_COLLECTION, 'main');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { ...DEFAULT_SITE_SETTINGS, ...snap.data() } as SiteSettings;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
  return DEFAULT_SITE_SETTINGS;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/main`;
  try {
    const ref = doc(db, SETTINGS_COLLECTION, 'main');
    await setDoc(ref, settings, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}


/**
 * Products API (Reads/Writes directly to Firestore 'products' collection)
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (!snap.empty) {
      return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Product[];
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, PRODUCTS_COLLECTION);
  }
  return [];
}

export async function addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...productData };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, PRODUCTS_COLLECTION);
    throw err;
  }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${id}`;
  try {
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(ref, productData);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${id}`;
  try {
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Services API (Reads/Writes directly to Firestore 'services' collection)
 */
export async function fetchServices(): Promise<ServiceCategory[]> {
  try {
    const snap = await getDocs(collection(db, SERVICES_COLLECTION));
    if (!snap.empty) {
      return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as ServiceCategory[];
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, SERVICES_COLLECTION);
  }
  return [];
}

export async function addService(serviceData: Omit<ServiceCategory, 'id'>): Promise<ServiceCategory> {
  try {
    const docRef = await addDoc(collection(db, SERVICES_COLLECTION), {
      ...serviceData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...serviceData };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, SERVICES_COLLECTION);
    throw err;
  }
}

export async function updateService(id: string, serviceData: Partial<ServiceCategory>): Promise<void> {
  const path = `${SERVICES_COLLECTION}/${id}`;
  try {
    const ref = doc(db, SERVICES_COLLECTION, id);
    await updateDoc(ref, serviceData);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteService(id: string): Promise<void> {
  const path = `${SERVICES_COLLECTION}/${id}`;
  try {
    const ref = doc(db, SERVICES_COLLECTION, id);
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Service Bookings API (Reads/Writes directly to Firestore 'bookings' collection)
 */
export async function createBooking(bookingData: Omit<ServiceBooking, 'id' | 'createdAt' | 'status'>): Promise<ServiceBooking> {
  const newBooking = {
    ...bookingData,
    status: 'pending' as BookingStatus,
    createdAt: new Date().toISOString()
  };
  try {
    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), newBooking);
    return { id: docRef.id, ...newBooking };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, BOOKINGS_COLLECTION);
    throw err;
  }
}

export async function fetchBookings(userId?: string): Promise<ServiceBooking[]> {
  try {
    let snap;
    if (userId) {
      const q = query(collection(db, BOOKINGS_COLLECTION), where('userId', '==', userId));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(collection(db, BOOKINGS_COLLECTION));
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as ServiceBooking[];
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, BOOKINGS_COLLECTION);
    return [];
  }
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${bookingId}`;
  try {
    const ref = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Orders API (Reads/Writes directly to Firestore 'orders' collection)
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
  const orderId = doc(collection(db, ORDERS_COLLECTION)).id;
  const newOrder = {
    ...orderData,
    status: 'pending' as OrderStatus,
    createdAt: new Date().toISOString()
  };

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Check and collect all product docs
      const productRefs = orderData.items.map(item => doc(db, PRODUCTS_COLLECTION, item.productId));
      const productSnaps = await Promise.all(productRefs.map(ref => transaction.get(ref)));

      // 2. Validate stock for each item
      for (let i = 0; i < productSnaps.length; i++) {
        const snap = productSnaps[i];
        const item = orderData.items[i];
        
        if (!snap.exists()) {
          throw new Error(`Product ${item.productId} not found.`);
        }

        const product = snap.data() as Product;
        const currentStock = product.stock || 0;

        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Requested: ${item.quantity}, Available: ${currentStock}`);
        }

        // 3. Queue the decrement
        transaction.update(productRefs[i], {
          stock: currentStock - item.quantity,
          updatedAt: new Date().toISOString()
        });
      }

      // 4. Create the order record
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      transaction.set(orderRef, newOrder);
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, ORDERS_COLLECTION);
    throw err;
  }

  return { id: orderId, ...newOrder };
}

export async function fetchOrders(userId?: string): Promise<Order[]> {
  try {
    let snap;
    if (userId) {
      const q = query(collection(db, ORDERS_COLLECTION), where('userId', '==', userId));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(collection(db, ORDERS_COLLECTION));
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, ORDERS_COLLECTION);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const ref = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(ref, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: 'pending_verification' | 'verified' | 'paid' | 'unpaid' | 'failed',
  notes?: string
): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const ref = doc(db, ORDERS_COLLECTION, orderId);
    const updatePayload: Record<string, any> = {
      paymentStatus,
      verifiedAt: new Date().toISOString(),
      verifiedBy: auth.currentUser?.email || 'Garage Admin'
    };
    if (notes) {
      updatePayload.paymentNotes = notes;
    }
    // Also update order status to 'accepted' if payment is verified
    if (paymentStatus === 'verified' || paymentStatus === 'paid') {
      updatePayload.status = 'accepted';
    }
    await updateDoc(ref, updatePayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteBooking(bookingId: string): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${bookingId}`;
  try {
    const ref = doc(db, BOOKINGS_COLLECTION, bookingId);
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists()) {
        throw new Error(`Order ${orderId} not found.`);
      }

      const orderData = orderSnap.data() as Order;

      // 1. Restore stock for each item in the order
      if (orderData.items && orderData.items.length > 0) {
        for (const item of orderData.items) {
          const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
          const productSnap = await transaction.get(productRef);

          if (productSnap.exists()) {
            const productData = productSnap.data() as Product;
            const currentStock = productData.stock || 0;
            
            transaction.update(productRef, {
              stock: currentStock + item.quantity,
              updatedAt: new Date().toISOString()
            });
          }
        }
      }

      // 2. Delete the order doc
      transaction.delete(orderRef);
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Ensures admin user exists in Firestore
 */
export async function ensureInitialFirestoreCollectionsExist(): Promise<void> {
  try {
    // Ensure Admin User Record
    await ensureAdminUserExists('zaidenyuri26@gmail.com');
    
    console.log('Firestore initialized (empty state). No mock data generated.');
  } catch (err) {
    console.error('Error during Firestore initialization:', err);
  }
}

/**
 * User Profiles API (Reads/Writes directly to Firestore 'users' collection)
 */
export async function ensureAdminUserExists(adminEmail: string = 'zaidenyuri26@gmail.com'): Promise<void> {
  try {
    const emailLower = adminEmail.toLowerCase();
    
    // 1. Audit all user records in Firestore - guarantee only zaidenyuri26@gmail.com is admin
    const allUsersSnap = await getDocs(collection(db, USERS_COLLECTION));
    for (const uDoc of allUsersSnap.docs) {
      const data = uDoc.data() as UserProfile;
      if (data.email && data.email.toLowerCase() === emailLower) {
        if (data.role !== 'admin') {
          await updateDoc(doc(db, USERS_COLLECTION, uDoc.id), { role: 'admin' });
        }
      } else if (data.role === 'admin') {
        // Demote any non-primary admin to customer
        await updateDoc(doc(db, USERS_COLLECTION, uDoc.id), { role: 'customer' });
      }
    }

    // 2. Ensure at least one admin record for zaidenyuri26@gmail.com exists
    const q = query(collection(db, USERS_COLLECTION), where('email', '==', emailLower));
    const snap = await getDocs(q);

    if (snap.empty) {
      const adminDocId = `admin_${emailLower.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const adminProfile: UserProfile = {
        uid: adminDocId,
        email: emailLower,
        displayName: 'Zaiden Yuri (Admin)',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, USERS_COLLECTION, adminDocId), adminProfile);
      console.log(`Initialized Firestore admin user doc for ${adminEmail}`);
    }
  } catch (err) {
    console.error('Error ensuring admin user document in Firestore:', err);
  }
}

export async function saveUserProfile(user: UserProfile): Promise<void> {
  const path = `${USERS_COLLECTION}/${user.uid}`;
  try {
    // Strictly enforce that ONLY zaidenyuri26@gmail.com can hold the admin role
    if (user.email && user.email.toLowerCase() === 'zaidenyuri26@gmail.com') {
      user.role = 'admin';
    } else {
      user.role = 'customer';
    }
    const ref = doc(db, USERS_COLLECTION, user.uid);
    await setDoc(ref, user, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `${USERS_COLLECTION}/${uid}`;
  try {
    const ref = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
  return null;
}

export async function fetchAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    return snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, USERS_COLLECTION);
    return [];
  }
}

export async function updateUserRole(uid: string, role: UserRole, email?: string): Promise<void> {
  const path = `${USERS_COLLECTION}/${uid}`;
  try {
    // Prevent assigning admin role to any user other than zaidenyuri26@gmail.com
    const targetRole = (email && email.toLowerCase() === 'zaidenyuri26@gmail.com') ? 'admin' : (role === 'admin' ? 'customer' : role);
    const ref = doc(db, USERS_COLLECTION, uid);
    await updateDoc(ref, { role: targetRole });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteUserDoc(uid: string): Promise<void> {
  const path = `${USERS_COLLECTION}/${uid}`;
  try {
    const ref = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Gallery Builds API (Reads/Writes directly to Firestore 'builds' collection)
 */
export async function fetchBuilds(): Promise<GalleryBuild[]> {
  try {
    const snap = await getDocs(collection(db, BUILDS_COLLECTION));
    if (!snap.empty) {
      return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as GalleryBuild[];
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, BUILDS_COLLECTION);
  }
  return [];
}

export async function addBuild(buildData: Omit<GalleryBuild, 'id'>): Promise<GalleryBuild> {
  try {
    const docRef = await addDoc(collection(db, BUILDS_COLLECTION), {
      ...buildData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...buildData };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, BUILDS_COLLECTION);
    throw err;
  }
}

export async function updateBuild(id: string, buildData: Partial<GalleryBuild>): Promise<void> {
  const path = `${BUILDS_COLLECTION}/${id}`;
  try {
    const ref = doc(db, BUILDS_COLLECTION, id);
    await updateDoc(ref, buildData);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteBuild(id: string): Promise<void> {
  const path = `${BUILDS_COLLECTION}/${id}`;
  try {
    const ref = doc(db, BUILDS_COLLECTION, id);
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
