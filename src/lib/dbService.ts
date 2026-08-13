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
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
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

// Collection Names in Firestore
const PRODUCTS_COLLECTION = 'products';
const SERVICES_COLLECTION = 'services';
const BOOKINGS_COLLECTION = 'bookings';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const SETTINGS_COLLECTION = 'site_settings';
const BUILDS_COLLECTION = 'builds';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: 'NORTHBROS GARAGE',
  brandSubtitle: 'PERFORMANCE & TUNING',
  announcementText: 'FAST NATIONWIDE SHIPPING ON ALL JDM PERFORMANCE PARTS | JAPANESE DOMESTIC MARKET SPEC',
  announcementEnabled: true,
  logoUrl: '',

  heroBadge: 'OFFICIAL JDM IMPORTER & TUNING WORKSHOP',
  heroTitleLine1: 'BUILT FOR THE TRACK.',
  heroTitleLine2: 'TUNED FOR THE STREET.',
  heroDescription: 'Authorized distributor for premier Japanese performance brands including HKS, TAKATA, Spoon Sports, RAYS, BRIDE, and MOMO.',
  heroBannerImage: '',
  heroBannerImages: [],
  heroPrimaryBtnText: 'EXPLORE CATALOG',
  heroSecondaryBtnText: 'VIEW WORKSHOP SERVICES',
  heroQuickTags: ['HKS Exhausts', 'RAYS Wheels', 'Spoon Brakes', 'BRIDE Seats', 'GReddy Turbos'],

  servicesBadge: 'PROFESSIONAL WORKSHOP',
  servicesTitle: 'GARAGE & PERFORMANCE SERVICES',
  servicesSubtitle: 'From 2000HP dyno calibration to custom forged engine builds and track corner balancing.',

  partsBadge: 'OFFICIAL PERFORMANCE STORE',
  partsTitle: 'PERFORMANCE PARTS & COMPONENTS',
  partsSubtitle: 'Authentic Japanese Domestic Market components direct from Osaka & Tokyo.',

  tunerShowcaseBadge: 'NORTHBROS PROJECT CAR CHRONICLES',
  tunerShowcaseTitle: 'THE TUNER SHOWCASE',
  tunerShowcaseSubtitle: 'From street sleepers to 1000+ HP circuit monsters, explore our curated gallery of legendary JDM builds. Witness the perfect fusion of authentic parts and master calibration.',

  aboutTitle: 'NORTHBROS MOTORSPORT HERITAGE',
  aboutDescription: 'Founded by dedicated circuit racers and master mechanics, NorthBros Garage delivers high-precision tuning, forged engine building, and authentic JDM performance parts to automotive enthusiasts nationwide.',
  aboutImage: '',
  aboutImages: [],

  footerAbout: 'NorthBros Garage is your premier JDM performance specialist, providing high-performance parts, custom engine builds, and chassis tuning for street and circuit machines.',
  contactPhone: '(555) 019-2834',
  contactEmail: 'contact@northbrosgarage.com',
  contactAddress: '742 Race Track Way, Speed City, CA 90210',
  operatingHours: 'Mon - Fri: 8:00 AM - 7:00 PM | Sat: 9:00 AM - 5:00 PM',
  socialInstagram: 'https://instagram.com',
  socialYoutube: 'https://youtube.com',
  socialFacebook: 'https://facebook.com',
  socialTwitter: 'https://twitter.com',
  copyrightText: '© 2026 NorthBros Garage & Tuning Shop. All rights reserved.'
};

/**
 * Site Settings API (Reads/Writes to Firestore 'site_settings/main')
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, 'main');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { ...DEFAULT_SITE_SETTINGS, ...snap.data() } as SiteSettings;
    }
  } catch (err) {
    console.error('Error fetching site settings from Firestore:', err);
  }
  return DEFAULT_SITE_SETTINGS;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const ref = doc(db, SETTINGS_COLLECTION, 'main');
  await setDoc(ref, settings, { merge: true });
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
    console.error('Error fetching products from Firestore:', err);
  }
  return [];
}

export async function addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...productData,
    createdAt: new Date().toISOString()
  });
  return { id: docRef.id, ...productData };
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(ref, productData);
}

export async function deleteProduct(id: string): Promise<void> {
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(ref);
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
    console.error('Error fetching services from Firestore:', err);
  }
  return [];
}

export async function addService(serviceData: Omit<ServiceCategory, 'id'>): Promise<ServiceCategory> {
  const docRef = await addDoc(collection(db, SERVICES_COLLECTION), {
    ...serviceData,
    createdAt: new Date().toISOString()
  });
  return { id: docRef.id, ...serviceData };
}

export async function updateService(id: string, serviceData: Partial<ServiceCategory>): Promise<void> {
  const ref = doc(db, SERVICES_COLLECTION, id);
  await updateDoc(ref, serviceData);
}

export async function deleteService(id: string): Promise<void> {
  const ref = doc(db, SERVICES_COLLECTION, id);
  await deleteDoc(ref);
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
  const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), newBooking);
  return { id: docRef.id, ...newBooking };
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
    console.error('Error fetching bookings:', err);
    return [];
  }
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
  const ref = doc(db, BOOKINGS_COLLECTION, bookingId);
  await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
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
    console.error('Error fetching orders:', err);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const ref = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(ref, { status });
}

export async function deleteBooking(bookingId: string): Promise<void> {
  const ref = doc(db, BOOKINGS_COLLECTION, bookingId);
  await deleteDoc(ref);
}

export async function deleteOrder(orderId: string): Promise<void> {
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
}

/**
 * Ensures initial default collections exist in Firestore
 */
export async function ensureInitialFirestoreCollectionsExist(): Promise<void> {
  try {
    // 1. Ensure Admin User Record
    await ensureAdminUserExists('zaidenyuri26@gmail.com');

    // 1b. Ensure Site Settings Document in Firestore
    const settingsRef = doc(db, SETTINGS_COLLECTION, 'main');
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, DEFAULT_SITE_SETTINGS);
      console.log('Populated default site settings in Firestore...');
    }

    // 2. Check if database has already been seeded once
    const seedMetaRef = doc(db, '_meta', 'seeded');
    const seedMetaSnap = await getDoc(seedMetaRef);

    if (!seedMetaSnap.exists()) {
      // 2a. Ensure Products Collection in Firestore
      const productsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
      if (productsSnap.empty) {
        console.log('Populating default products collection in Firestore...');
        const defaultProducts = [
        {
          name: 'HKS Hi-Power Spec-L II Exhaust System',
          brand: 'HKS',
          category: 'Performance',
          price: 1450,
          description: 'Lightweight stainless steel cat-back exhaust with titanium burned tips for high flow and refined exhaust note.',
          fitment: 'Nissan GT-R R35 / Civic Type R FK8',
          stock: 6,
          image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800',
          featured: true,
          specs: { Material: 'SUS304 Stainless / Titanium Tip', Weight: '11.8 kg', MainPipe: '75mm - 60mm x 2' }
        },
        {
          name: 'TAKATA Race 4 4-Point Racing Harness',
          brand: 'TAKATA',
          category: 'Interior',
          price: 385,
          description: 'FIA compliant 4-point professional racing harness with patented camlock buckle and 3-inch shoulder straps.',
          fitment: 'Universal Racing Seats',
          stock: 12,
          image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
          featured: true,
          specs: { Homologation: 'FIA 8853-2016', BeltWidth: '3 Inch', Buckle: 'Rotary Camlock' }
        },
        {
          name: 'Spoon Sports Monobloc 4-Piston Caliper Set',
          brand: 'Spoon Sports',
          category: 'Brakes',
          price: 1890,
          description: 'Ultra-lightweight forged aluminum 4-piston calipers for superior thermal dissipation and firm pedal feel.',
          fitment: 'Honda Civic EG/EK/S2000',
          stock: 4,
          image: 'https://images.unsplash.com/photo-1600706432502-7788f533a52e?auto=format&fit=crop&q=80&w=800',
          featured: true,
          specs: { Material: 'Forged Aluminum', PistonCount: '4 Monobloc', Finish: 'Spoon Signature Blue' }
        },
        {
          name: 'RAYS Volk Racing TE37 SL (18x9.5 +22 5x114.3)',
          brand: 'RAYS',
          category: 'Wheels & Tires',
          price: 3400,
          description: 'Iconic 1-piece forged wheel engineered for maximum strength and extreme track performance lightness.',
          fitment: 'JDM 5x114.3 Fitment (Supra, GT-R, STI, EVO)',
          stock: 8,
          image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800',
          featured: true,
          specs: { Size: '18 x 9.5J', Offset: '+22', BoltPattern: '5x114.3', Finish: 'Pressed Graphite' }
        },
        {
          name: 'BRIDE ZETA IV Full Bucket Racing Seat',
          brand: 'BRIDE',
          category: 'Interior',
          price: 1150,
          description: 'FIA approved FRP silver shell bucket seat designed for ergonomic hold during high-G cornering.',
          fitment: 'Universal with Vehicle Seat Rails',
          stock: 5,
          image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
          featured: false,
          specs: { Shell: 'FRP Silver Shell', Weight: '7.4 kg', Fabric: 'Flame Retardant BRIDE Logo' }
        },
        {
          name: 'MOMO Prototipo Black Leather Steering Wheel',
          brand: 'MOMO',
          category: 'Interior',
          price: 320,
          description: 'Classic 350mm sport steering wheel crafted with premium black leather and cutout spokes.',
          fitment: 'Universal 6-Bolt Hub Adapter',
          stock: 15,
          image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800',
          featured: false,
          specs: { Diameter: '350mm', Dish: '37mm', Material: 'Premium Black Leather / Anodized Black Spoke' }
        },
        {
          name: 'GReddy T620Z Turbocharger Tuner Kit',
          brand: 'GReddy',
          category: 'Engine & Turbo',
          price: 3850,
          description: 'Complete bolt-on turbocharger kit with front mount intercooler and mandrel bent piping.',
          fitment: 'Toyota GR86 / Subaru BRZ / FRS',
          stock: 3,
          image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800',
          featured: true,
          specs: { Turbo: 'T620Z 10cm2', PowerGain: '+120 HP', Intercooler: 'Type 28 Front Mount' }
        },
        {
          name: 'Tein Flex Z Fully Adjustable Coilovers',
          brand: 'Tein',
          category: 'Suspension',
          price: 980,
          description: '16-stage damping force adjustable twin-tube coilover system with full-length ride height adjustment.',
          fitment: 'Subaru WRX STI / Mazda MX-5 Miata',
          stock: 10,
          image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800',
          featured: false,
          specs: { Adjustment: '16-Way Damping', Structure: 'Twin-Tube Full Length', TopMounts: 'Pillowball Upper Mounts' }
        }
      ];

      for (const prod of defaultProducts) {
        await addDoc(collection(db, PRODUCTS_COLLECTION), {
          ...prod,
          createdAt: new Date().toISOString()
        });
      }
    }

    // 3. Ensure Services Collection in Firestore
    const servicesSnap = await getDocs(collection(db, SERVICES_COLLECTION));
    if (servicesSnap.empty) {
      console.log('Populating default services collection in Firestore...');
      const defaultServices = [
        {
          title: '2000HP All-Wheel Drive Dyno Tuning',
          description: 'Precision ECU recalibration and custom map development on our Mainline AWD chassis dynamometer.',
          iconName: 'Activity',
          estimatedTime: '2 - 3 Hours',
          priceStartingFrom: 350,
          image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800',
          features: ['AWD Chassis Dyno Runs', 'Air-Fuel & Boost Pressure Logging', 'Custom Multi-Map Calibration', 'Before & After Dyno Graph Printout']
        },
        {
          title: 'Custom Forged Engine Build',
          description: 'Full teardown, precision machining, blueprinting, and assembly using forged internals for extreme boost applications.',
          iconName: 'Cpu',
          estimatedTime: '3 - 5 Days',
          priceStartingFrom: 2500,
          image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800',
          features: ['Cylinder Boring & Honing', 'Forged Pistons & H-Beam Rods', 'ACL Race Bearings & ARP Head Studs', 'Pressure Testing & Break-in Run']
        },
        {
          title: 'Track Corner Balancing & Laser Alignment',
          description: 'Individual wheel weight distribution and race-grade chassis alignment tailored for street or circuit driving.',
          iconName: 'Gauge',
          estimatedTime: '2 - 4 Hours',
          priceStartingFrom: 280,
          image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800',
          features: ['4-Wheel Digital Corner Weighting', 'Precision Camber, Caster & Toe Setup', 'Driver Weight Simulation', 'Custom Track Sheet Report']
        },
        {
          title: 'Custom Stainless / Titanium Exhaust Fabrication',
          description: 'Hand-crafted TIG welded exhaust manifolds, downpipes, and cat-back systems built to exact chassis dimensions.',
          iconName: 'Flame',
          estimatedTime: '1 - 2 Days',
          priceStartingFrom: 850,
          image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800',
          features: ['304 Stainless / Grade 5 Titanium Piping', 'Mandrel Bend Construction', 'Valved Exhaust Flange Options', 'Leak-Free V-Band Clamps']
        },
        {
          title: 'Big Brake Kit Installation & Fluid Flush',
          description: 'Complete brake system upgrade with multi-piston calipers, oversized two-piece rotors, and high-temp racing fluid.',
          iconName: 'ShieldAlert',
          estimatedTime: '3 - 4 Hours',
          priceStartingFrom: 320,
          image: 'https://images.unsplash.com/photo-1600706432502-7788f533a52e?auto=format&fit=crop&q=80&w=800',
          features: ['Multi-Piston Caliper Mounting', 'Stainless Steel Braided Lines', 'MOTUL RBF660 Fluid Pressure Flush', 'Pad Bedding Procedure']
        },
        {
          title: 'Complete Vehicle Track Prep & Safety Inspection',
          description: 'Comprehensive 50-point technical inspection to meet sanctioning body guidelines for track days and competitive events.',
          iconName: 'Wrench',
          estimatedTime: '2 Hours',
          priceStartingFrom: 220,
          image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
          features: ['Suspension & Torque Bolt Check', 'Fluid Quality & Leak Analysis', 'Brake Pad & Rotor Thickness Check', 'Official Tech Inspection Form']
        }
      ];

      for (const serv of defaultServices) {
        await addDoc(collection(db, SERVICES_COLLECTION), {
          ...serv,
          createdAt: new Date().toISOString()
        });
      }
    }

    // 4. Ensure Builds Collection in Firestore
    const buildsSnap = await getDocs(collection(db, BUILDS_COLLECTION));
    if (buildsSnap.empty) {
      console.log('Populating default builds collection in Firestore...');
      const defaultBuilds = [
        {
          name: 'Nissan Skyline GT-R R34',
          model: 'Midnight Shadow Spec',
          engine: 'RB26DETT Twin-Turbo',
          power: '650 WHP',
          color: 'Midnight Purple III',
          image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1200',
          instagram: '@shadow_r34',
          owner: 'Kenji S.',
          description: 'Built for high-speed loops and circuit hot laps. Featuring twin HKS GTIII turbos, Volk Racing TE37 SL forged wheels, and a full stainless catback system that delivers an unmistakable GT-R exhaust signature.',
          partsKeywords: ['TE37', 'HKS', 'TAKATA'],
          videoUrl: '',
          linkUrl: ''
        },
        {
          name: 'Honda Civic Type R FK8',
          model: 'Championship Track Spec',
          engine: 'K20C1 VTEC Turbo',
          power: '420 WHP',
          color: 'Championship White',
          image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200',
          instagram: '@vtec_FK8',
          owner: 'Hiroshi T.',
          description: 'A pure cornering machine optimized for Suzuka Circuit. Stripped interior equipped with custom Bride bucket seats, Takata harnesses, and Spoon 4-piston monobloc brakes for maximum thermal endurance.',
          partsKeywords: ['Spoon', 'BRIDE', 'TAKATA'],
          videoUrl: '',
          linkUrl: ''
        },
        {
          name: 'Toyota GR86',
          model: 'Hachiroku Drift Spec',
          engine: 'FA24 Boxer (Forced Induction)',
          power: '380 WHP',
          color: 'Ignition Red',
          image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=1200',
          instagram: '@gr86_drift',
          owner: 'Yuki M.',
          description: 'The ultimate modern lightweight sportscar with a direct GReddy tuner turbo kit, full Tein Flex Z adjustable coilovers, and retro-modern MOMO Prototipo leather steering wheel for precise drift angle response.',
          partsKeywords: ['GReddy', 'Tein', 'MOMO'],
          videoUrl: '',
          linkUrl: ''
        }
      ];

      for (const bld of defaultBuilds) {
        await addDoc(collection(db, BUILDS_COLLECTION), {
          ...bld,
          createdAt: new Date().toISOString()
        });
      }
    }

      // Mark database as initialized so future deletes stay permanent
      await setDoc(seedMetaRef, {
        seeded: true,
        seededAt: new Date().toISOString()
      });
      console.log('Seeded initial Firestore collections and set _meta/seeded flag.');
    }
  } catch (err) {
    console.error('Error initializing default Firestore collections:', err);
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
  // Strictly enforce that ONLY zaidenyuri26@gmail.com can hold the admin role
  if (user.email && user.email.toLowerCase() === 'zaidenyuri26@gmail.com') {
    user.role = 'admin';
  } else {
    user.role = 'customer';
  }
  const ref = doc(db, USERS_COLLECTION, user.uid);
  await setDoc(ref, user, { merge: true });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const ref = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.error('Error fetching user profile:', err);
  }
  return null;
}

export async function fetchAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    return snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
}

export async function updateUserRole(uid: string, role: UserRole, email?: string): Promise<void> {
  // Prevent assigning admin role to any user other than zaidenyuri26@gmail.com
  const targetRole = (email && email.toLowerCase() === 'zaidenyuri26@gmail.com') ? 'admin' : (role === 'admin' ? 'customer' : role);
  const ref = doc(db, USERS_COLLECTION, uid);
  await updateDoc(ref, { role: targetRole });
}

export async function deleteUserDoc(uid: string): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  await deleteDoc(ref);
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
    console.error('Error fetching gallery builds from Firestore:', err);
  }
  return [];
}

export async function addBuild(buildData: Omit<GalleryBuild, 'id'>): Promise<GalleryBuild> {
  const docRef = await addDoc(collection(db, BUILDS_COLLECTION), {
    ...buildData,
    createdAt: new Date().toISOString()
  });
  return { id: docRef.id, ...buildData };
}

export async function updateBuild(id: string, buildData: Partial<GalleryBuild>): Promise<void> {
  const ref = doc(db, BUILDS_COLLECTION, id);
  await updateDoc(ref, buildData);
}

export async function deleteBuild(id: string): Promise<void> {
  const ref = doc(db, BUILDS_COLLECTION, id);
  await deleteDoc(ref);
}
