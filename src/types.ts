export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN' | 'OWNER';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export type ListingStatus = 'ACTIVE' | 'PENDING' | 'PAUSED' | 'CLOSED' | 'SOLD' | 'REJECTED';

export interface JobDetails {
  companyName?: string;
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE';
  experienceYears?: string;
  salaryPeriod?: 'MONTHLY' | 'DAILY' | 'HOURLY';
}

export interface LostFoundDetails {
  itemType?: 'LOST' | 'FOUND';
  dateEvent?: string;
  exactLocation?: string;
}

export interface ListingItem {
  id: string;
  title: string;
  description: string;
  price?: number | null;
  priceFormatted?: string;
  categoryId: string;
  subcategoryId?: string;
  location: string;
  condition?: 'NEW' | 'USED' | 'EXCELLENT' | 'GOOD' | 'NA';
  phone: string;
  whatsapp?: string;
  ownerId: string;
  ownerName: string;
  ownerPhotoURL?: string;
  images: string[];
  status: ListingStatus;
  isFeatured?: boolean;
  views?: number;
  createdAt: string;
  updatedAt?: string;
  jobDetails?: JobDetails;
  lostFoundDetails?: LostFoundDetails;
  facebookUrl?: string;
  sawa9lyUrl?: string;
}

export interface SubCategoryItem {
  id: string;
  nameAr: string;
  nameEn?: string;
}

export interface ListingCategory {
  id: string;
  nameAr: string;
  nameEn?: string;
  icon: string;
  color?: string;
  subcategories?: SubCategoryItem[];
  allowNoPrice?: boolean;
}

export interface PlatformSettings {
  platformName: string;
  shortName: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  primaryColor: string;
  accentColor: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  facebookUrl: string;
  telegramUrl: string;
  footerText: string;
  allowPublicPosting: boolean;
  maintenanceMode: boolean;
  updatedAt?: string;
}

export interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string;
  active: boolean;
  position: 'HERO' | 'SIDEBAR' | 'FOOTER';
  createdAt: string;
}

export interface SellerProfile {
  id: string;
  storeName: string;
  ownerId: string;
  ownerName: string;
  phone: string;
  whatsapp?: string;
  logoUrl?: string;
  coverUrl?: string;
  bio?: string;
  verified: boolean;
  rating?: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  sellerId: string;
  totalAmount: number;
  deliveryMunicipality: string;
  status: 'NEW' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

export interface ReportItem {
  id: string;
  listingId: string;
  listingTitle?: string;
  reporterId: string;
  reporterName?: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  details?: string;
  timestamp: string;
}

export interface ReferralItem {
  id: string;
  userId: string;
  userName: string;
  refCode: string;
  link: string;
  totalClicks: number;
  conversions: number;
  earnings: number;
  createdAt: string;
}

export interface DeliveryRate {
  id: string;
  municipalityName: string;
  homeDeliveryPrice: number;
  officeDeliveryPrice: number;
  estimatedDays: string;
  active: boolean;
}

export interface PaymentItem {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: 'CCP' | 'BARIDIMOB' | 'HAND_TO_HAND' | 'FLEXY';
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  referenceNumber?: string;
  createdAt: string;
}
