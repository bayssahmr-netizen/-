import { PlatformSettings, ListingItem } from '../types';

export const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'سوق لعوينات العملاق - Souq El Aouinet Giant',
  shortName: 'سوق لعوينات',
  description: 'أول منصة إعلانات مبوبة محلية مخصصة لسكان العوينات وولاية تبسة.',
  heroTitle: 'أهلاً بكم في سوق لعوينات العملاق',
  heroSubtitle: 'وجهتكم الأولى للبيع والشراء والوظائف والخدمات في مدينة العوينات وولاية تبسة',
  logoUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=300&q=80',
  faviconUrl: './favicon.svg',
  ogImageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
  primaryColor: '#4f46e5',
  accentColor: '#f59e0b',
  contactPhone: '0661234567',
  contactWhatsapp: '213661234567',
  contactEmail: 'contact@souqelaouinet.dz',
  facebookUrl: 'https://facebook.com',
  telegramUrl: 'https://t.me',
  footerText: 'جميع الحقوق محفوظة © سوق لعوينات العملاق - إشراف وإدارة المؤسس عبد الحق غولام مراحي',
  allowPublicPosting: true,
  maintenanceMode: false
};

export const INITIAL_SEED_LISTINGS: ListingItem[] = [
  {
    id: 'seed-1',
    title: 'سيارة هيونداي أتوس حالة ممتازة العوينات',
    description: 'سيارة هيونداي أتوس ماشية 180 ألف، محرك نظيف 10/10، لا يوجد أي حادث أو صباغة، صالون نظيف، العجلة الاحتياطية جديدة، متواجدة بوسط مدينة العوينات.',
    price: 1250000,
    priceFormatted: '1,250,000 دج',
    categoryId: 'cars',
    subcategoryId: 'cars-sell',
    location: 'وسط مدينة العوينات',
    condition: 'EXCELLENT',
    phone: '0661234567',
    whatsapp: '213661234567',
    ownerId: 'system-owner',
    ownerName: 'عبد الحق غولام مراحي',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'ACTIVE',
    isFeatured: true,
    views: 142,
    createdAt: new Date().toISOString()
  },
  {
    id: 'seed-2',
    title: 'منزل مستقل للكراء حي المجاهدين العوينات',
    description: 'منزل مستقل يتكون من 3 غرف وصالون ومطبخ مجهز مع حوش واسع والغاز والماء متوفر 24/24. قريب من المدرسة الابتدائية والمسجد.',
    price: 25000,
    priceFormatted: '25,000 دج / شهرياً',
    categoryId: 'realestate',
    subcategoryId: 'houses-rent',
    location: 'حي المجاهدين - العوينات',
    condition: 'EXCELLENT',
    phone: '0671888999',
    whatsapp: '213671888999',
    ownerId: 'system-owner',
    ownerName: 'مكتب عقارات العوينات',
    images: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'ACTIVE',
    isFeatured: true,
    views: 98,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'seed-3',
    title: 'مطلوب بائع في محل مواد غذائية بالعوينات',
    description: 'مطلوب شاب جاد ومسؤول للعمل ببقالة ومحل تجاري بوسط مدينة العوينات. الدوام كامل، الراتب ممتاذ حسب الكفاءة.',
    price: null,
    priceFormatted: 'حسب الاتفاق',
    categoryId: 'jobs',
    subcategoryId: 'job-vacancies',
    location: 'وسط مدينة العوينات',
    condition: 'NA',
    phone: '0655112233',
    whatsapp: '213655112233',
    ownerId: 'system-owner',
    ownerName: 'سوبرماركت البركة',
    images: [
      'https://images.unsplash.com/photo-1556742049-0a6747976da2?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'ACTIVE',
    isFeatured: false,
    views: 75,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'seed-4',
    title: 'وثائق سيارة مفقودة باسم غولام بمدينة العوينات',
    description: 'تم فقدان محفظة تحتوي على رخصة سياقة وبطاقة رمادية بمدينة العوينات بالقرب من مقر البلدية. يرجى من يعثر عليها الاتصال مشكوراً.',
    price: null,
    priceFormatted: 'مفقودات',
    categoryId: 'lostfound',
    subcategoryId: 'lost-docs',
    location: 'محيط بلدية العوينات',
    condition: 'NA',
    phone: '0661234567',
    whatsapp: '213661234567',
    ownerId: 'system-owner',
    ownerName: 'عبد الحق غولام',
    images: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'ACTIVE',
    isFeatured: false,
    views: 210,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];
