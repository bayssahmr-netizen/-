import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
  ListingItem,
  PlatformSettings,
  UserProfile,
  BannerItem,
  ReportItem,
  AdminLog,
  SellerProfile,
  ReferralItem,
  OrderItem,
  DeliveryRate,
  PaymentItem
} from '../types';
import { cleanForFirestore } from '../utils/formatters';
import { DEFAULT_SETTINGS } from '../data/initialData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified
    }
  };
  console.error('Firestore Database Operation Error:', JSON.stringify(errInfo));
  throw new Error(`تعذر الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى. (${errMessage})`);
}

// ==========================================
// Platform Settings Service
// ==========================================

export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  const path = 'settings/platform';
  try {
    const docRef = doc(db, 'settings', 'platform');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...snap.data() } as PlatformSettings;
    } else {
      // Seed default settings if doc doesn't exist yet
      const cleaned = cleanForFirestore(DEFAULT_SETTINGS);
      await setDoc(docRef, cleaned);
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    console.warn('Failed to fetch live settings, using fallback settings', error);
    return DEFAULT_SETTINGS;
  }
}

export async function updatePlatformSettings(settingsData: Partial<PlatformSettings>): Promise<void> {
  const path = 'settings/platform';
  try {
    const docRef = doc(db, 'settings', 'platform');
    const cleaned = cleanForFirestore({
      ...settingsData,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==========================================
// User Profile & Roles Service
// ==========================================

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createOrUpdateUserProfile(profile: Partial<UserProfile> & { id: string }): Promise<UserProfile> {
  const path = `users/${profile.id}`;
  const docRef = doc(db, 'users', profile.id);

  // Load the existing profile first (if any) so that a login never overwrites
  // the user's stored name/phone/whatsapp with defaults.
  let existing: UserProfile | null = null;
  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      existing = existingSnap.data() as UserProfile;
    }
  } catch (error) {
    console.warn(`Could not read existing profile (${path}):`, error);
  }

  const isOwnerEmail = profile.email === 'bayssahmr@gmail.com';

  const mergedData: UserProfile = {
    id: profile.id,
    name: profile.name || existing?.name || 'مستخدم جديد',
    email: profile.email || existing?.email || '',
    phone: profile.phone ?? existing?.phone ?? '',
    whatsapp: profile.whatsapp ?? existing?.whatsapp ?? '',
    role: isOwnerEmail ? 'OWNER' : (existing?.role || profile.role || 'USER'),
    status: existing?.status || 'ACTIVE',
    avatar: profile.avatar ?? existing?.avatar ?? '',
    createdAt: existing?.createdAt || new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  try {
    const cleaned = cleanForFirestore(mergedData);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    console.warn(`Could not sync profile to Firestore (${path}), using local profile:`, error);
  }

  return mergedData;
}

export async function fetchAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const colRef = collection(db, 'users');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateUserRoleAndStatus(uid: string, role: UserProfile['role'], status: UserProfile['status']): Promise<void> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const cleaned = cleanForFirestore({ role, status, updatedAt: new Date().toISOString() });
    await updateDoc(docRef, cleaned);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==========================================
// Listings Service
// ==========================================

export async function fetchListings(
  categoryFilter?: string,
  searchQuery?: string,
  statusFilter: string = 'ACTIVE'
): Promise<ListingItem[]> {
  const path = 'listings';
  try {
    const colRef = collection(db, 'listings');
    const snap = await getDocs(colRef);
    
    let items: ListingItem[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as ListingItem));

    // Sort by createdAt desc
    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    // Filter by status if requested
    if (statusFilter !== 'ALL') {
      items = items.filter(i => i.status === statusFilter || (!i.status && statusFilter === 'ACTIVE'));
    }

    // Filter by category
    if (categoryFilter && categoryFilter !== 'all') {
      items = items.filter(i => i.categoryId === categoryFilter);
    }

    // Filter by search query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          (i.ownerName && i.ownerName.toLowerCase().includes(q))
      );
    }

    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchListingById(id: string): Promise<ListingItem | null> {
  const path = `listings/${id}`;
  try {
    const docRef = doc(db, 'listings', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      // Increment view counter asynchronously
      try {
        updateDoc(docRef, { views: increment(1) });
      } catch {
        // silent counter increment error
      }
      return { id: snap.id, ...snap.data() } as ListingItem;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createListingDoc(listingData: Omit<ListingItem, 'id'>): Promise<ListingItem> {
  const path = 'listings';
  try {
    const colRef = collection(db, 'listings');
    const newDocRef = doc(colRef);
    
    const fullListing: ListingItem = {
      ...listingData,
      id: newDocRef.id,
      views: 0,
      createdAt: new Date().toISOString(),
      status: listingData.status || 'ACTIVE'
    };

    // CRITICAL: Clean for Firestore to prevent any undefined keys
    const cleanedPayload = cleanForFirestore(fullListing);
    await setDoc(newDocRef, cleanedPayload);

    return fullListing;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateListingDoc(id: string, updateData: Partial<ListingItem>): Promise<void> {
  const path = `listings/${id}`;
  try {
    const docRef = doc(db, 'listings', id);
    const cleaned = cleanForFirestore({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    await updateDoc(docRef, cleaned);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteListingDoc(id: string): Promise<void> {
  const path = `listings/${id}`;
  try {
    const docRef = doc(db, 'listings', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// Banners & Ads
// ==========================================

export async function fetchBanners(): Promise<BannerItem[]> {
  const path = 'banners';
  try {
    const colRef = collection(db, 'banners');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BannerItem));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createBannerDoc(banner: Omit<BannerItem, 'id'>): Promise<BannerItem> {
  const path = 'banners';
  try {
    const colRef = collection(db, 'banners');
    const newDocRef = doc(colRef);
    const fullBanner: BannerItem = {
      ...banner,
      id: newDocRef.id,
      createdAt: new Date().toISOString()
    };
    await setDoc(newDocRef, cleanForFirestore(fullBanner));
    return fullBanner;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteBannerDoc(id: string): Promise<void> {
  const path = `banners/${id}`;
  try {
    await deleteDoc(doc(db, 'banners', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// Reports & Audit Logs
// ==========================================

export async function fetchReports(): Promise<ReportItem[]> {
  const path = 'reports';
  try {
    const colRef = collection(db, 'reports');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReportItem));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createReportDoc(report: Omit<ReportItem, 'id'>): Promise<void> {
  const path = 'reports';
  try {
    const colRef = collection(db, 'reports');
    const newDoc = doc(colRef);
    await setDoc(newDoc, cleanForFirestore({ ...report, id: newDoc.id, createdAt: new Date().toISOString() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function logAdminAction(adminName: string, action: string, target: string, details?: string): Promise<void> {
  const path = 'adminLogs';
  try {
    const colRef = collection(db, 'adminLogs');
    const newDoc = doc(colRef);
    const log: AdminLog = {
      id: newDoc.id,
      adminId: auth.currentUser?.uid || 'system',
      adminName,
      action,
      target,
      details,
      timestamp: new Date().toISOString()
    };
    await setDoc(newDoc, cleanForFirestore(log));
  } catch (error) {
    console.warn('Failed to record admin log:', error);
  }
}

export async function fetchAdminLogs(): Promise<AdminLog[]> {
  const path = 'adminLogs';
  try {
    const colRef = collection(db, 'adminLogs');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminLog));
  } catch (error) {
    console.warn('Error fetching admin logs:', error);
    return [];
  }
}

// ==========================================
// Sellers & Stores Service
// ==========================================

export async function fetchSellers(): Promise<SellerProfile[]> {
  const path = 'sellers';
  try {
    const colRef = collection(db, 'sellers');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SellerProfile));
  } catch (error) {
    console.warn('Error fetching sellers:', error);
    return [];
  }
}

export async function createSellerDoc(seller: Omit<SellerProfile, 'id'>): Promise<SellerProfile> {
  const path = 'sellers';
  try {
    const colRef = collection(db, 'sellers');
    const newDoc = doc(colRef);
    const fullSeller: SellerProfile = {
      ...seller,
      id: newDoc.id,
      createdAt: new Date().toISOString()
    };
    await setDoc(newDoc, cleanForFirestore(fullSeller));
    return fullSeller;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteSellerDoc(id: string): Promise<void> {
  const path = `sellers/${id}`;
  try {
    await deleteDoc(doc(db, 'sellers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// Orders & Sales Service
// ==========================================

export async function fetchOrders(): Promise<OrderItem[]> {
  const path = 'orders';
  try {
    const colRef = collection(db, 'orders');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as OrderItem));
  } catch (error) {
    console.warn('Error fetching orders:', error);
    return [];
  }
}

export async function updateOrderStatusDoc(id: string, status: OrderItem['status']): Promise<void> {
  const path = `orders/${id}`;
  try {
    await updateDoc(doc(db, 'orders', id), cleanForFirestore({ status, updatedAt: new Date().toISOString() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==========================================
// Delivery Rates Service
// ==========================================

export async function fetchDeliveryRates(): Promise<any[]> {
  const path = 'deliveryRates';
  try {
    const colRef = collection(db, 'deliveryRates');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn('Error fetching delivery rates:', error);
    return [];
  }
}

export async function createDeliveryRateDoc(rateData: any): Promise<any> {
  const path = 'deliveryRates';
  try {
    const colRef = collection(db, 'deliveryRates');
    const newDoc = doc(colRef);
    const fullRate = { ...rateData, id: newDoc.id, active: true };
    await setDoc(newDoc, cleanForFirestore(fullRate));
    return fullRate;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteDeliveryRateDoc(id: string): Promise<void> {
  const path = `deliveryRates/${id}`;
  try {
    await deleteDoc(doc(db, 'deliveryRates', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// Payments & Transactions Service
// ==========================================

export async function fetchPayments(): Promise<any[]> {
  const path = 'payments';
  try {
    const colRef = collection(db, 'payments');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn('Error fetching payments:', error);
    return [];
  }
}

// ==========================================
// Referrals & Affiliate Service
// ==========================================

export async function fetchReferrals(): Promise<ReferralItem[]> {
  const path = 'referrals';
  try {
    const colRef = collection(db, 'referrals');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReferralItem));
  } catch (error) {
    console.warn('Error fetching referrals:', error);
    return [];
  }
}
