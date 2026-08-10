import { ListingCategory } from '../types';

export const CATEGORIES_DATA: ListingCategory[] = [
  {
    id: 'classifieds',
    nameAr: 'إعلانات مبوبة',
    nameEn: 'Classifieds',
    icon: 'ShoppingBag',
    color: 'bg-indigo-500',
    subcategories: [
      { id: 'general', nameAr: 'عام / أدوات منزلية' },
      { id: 'clothes', nameAr: 'ملابس وأزياء' },
      { id: 'sports', nameAr: 'مستلزمات رياضية' },
      { id: 'tools', nameAr: 'أدوات ومعدات' }
    ]
  },
  {
    id: 'cars',
    nameAr: 'السيارات والمركبات',
    nameEn: 'Cars & Vehicles',
    icon: 'Car',
    color: 'bg-blue-600',
    subcategories: [
      { id: 'cars-sell', nameAr: 'سيارات للبيع' },
      { id: 'motorcycles', nameAr: 'دراجات نارية' },
      { id: 'trucks', nameAr: 'شاحنات وآليات ثقيلة' },
      { id: 'auto-parts', nameAr: 'قطع غيار ولوازم' }
    ]
  },
  {
    id: 'realestate',
    nameAr: 'العقارات والأراضي',
    nameEn: 'Real Estate',
    icon: 'Home',
    color: 'bg-emerald-600',
    subcategories: [
      { id: 'houses-sale', nameAr: 'شقق ومنازل للبيع' },
      { id: 'houses-rent', nameAr: 'منازل وشقق للكراء' },
      { id: 'commercial', nameAr: 'محلات ومستودعات' },
      { id: 'lands', nameAr: 'أراضي فلاحية وبناء' }
    ]
  },
  {
    id: 'jobs',
    nameAr: 'وظائف وأعمال',
    nameEn: 'Jobs',
    icon: 'Briefcase',
    color: 'bg-amber-600',
    allowNoPrice: true,
    subcategories: [
      { id: 'job-vacancies', nameAr: 'عرض عمل / توظيف' },
      { id: 'job-requests', nameAr: 'طلب عمل / سيرة ذاتية' },
      { id: 'freelance', nameAr: 'أعمال حرة ومياومة' }
    ]
  },
  {
    id: 'services',
    nameAr: 'خدمات وحرف',
    nameEn: 'Services',
    icon: 'Wrench',
    color: 'bg-purple-600',
    allowNoPrice: true,
    subcategories: [
      { id: 'building', nameAr: 'بناء ودهان ورصاصة' },
      { id: 'transport', nameAr: 'نقل وتوصيل' },
      { id: 'electric', nameAr: 'كهرباء وتصليح أجهزة' },
      { id: 'teaching', nameAr: 'دروس دعم وتدريب' }
    ]
  },
  {
    id: 'electronics',
    nameAr: 'الهواتف والإلكترونيات',
    nameEn: 'Electronics',
    icon: 'Smartphone',
    color: 'bg-cyan-600',
    subcategories: [
      { id: 'phones', nameAr: 'هواتف وأجهزة لوحية' },
      { id: 'computers', nameAr: 'حواسيب ومستلزماتها' },
      { id: 'tv-audio', nameAr: 'تلفزيونات وأجهزة صوت' }
    ]
  },
  {
    id: 'furniture',
    nameAr: 'الأثاث والمنزل',
    nameEn: 'Furniture',
    icon: 'Armchair',
    color: 'bg-rose-600',
    subcategories: [
      { id: 'salons', nameAr: 'صالونات وأطقم قعدة' },
      { id: 'bedrooms', nameAr: 'غرف نوم وخزائن' },
      { id: 'kitchen', nameAr: 'تجهيزات مطبخ' }
    ]
  },
  {
    id: 'lostfound',
    nameAr: 'المفقودات والموجودات',
    nameEn: 'Lost & Found',
    icon: 'HelpCircle',
    color: 'bg-orange-600',
    allowNoPrice: true,
    subcategories: [
      { id: 'lost-docs', nameAr: 'وثائق وبطاقات مفقودة' },
      { id: 'lost-items', nameAr: 'أغراض شخصية مفقودة' },
      { id: 'found-items', nameAr: 'معثور عليها' }
    ]
  },
  {
    id: 'livestock',
    nameAr: 'المنتجات الفلاحية والمواشي',
    nameEn: 'Livestock & Agriculture',
    icon: 'Wheat',
    color: 'bg-green-700',
    subcategories: [
      { id: 'livestock-sale', nameAr: 'أغنام وأبقار وطيور' },
      { id: 'agri-products', nameAr: 'عسل ومحاصيل وزيتون' },
      { id: 'feed', nameAr: 'أعلاف وأسمدة' }
    ]
  },
  {
    id: 'affiliate',
    nameAr: 'التسويق بالعمولة',
    nameEn: 'Affiliate Marketing',
    icon: 'ExternalLink',
    color: 'bg-teal-600',
    allowNoPrice: true,
    subcategories: [
      { id: 'sawa9ly', nameAr: 'التسويق بعمولة' }
    ]
  }
];
