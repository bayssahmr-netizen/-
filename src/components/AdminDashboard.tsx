import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  ListingItem,
  PlatformSettings,
  BannerItem,
  ReportItem,
  SellerProfile,
  OrderItem,
  DeliveryRate,
  PaymentItem,
  ReferralItem,
  AdminLog
} from '../types';
import {
  fetchAllUsers,
  updateUserRoleAndStatus,
  fetchListings,
  deleteListingDoc,
  updateListingDoc,
  fetchBanners,
  createBannerDoc,
  deleteBannerDoc,
  fetchReports,
  fetchSellers,
  createSellerDoc,
  deleteSellerDoc,
  fetchOrders,
  updateOrderStatusDoc,
  fetchDeliveryRates,
  createDeliveryRateDoc,
  deleteDeliveryRateDoc,
  fetchPayments,
  fetchReferrals,
  fetchAdminLogs,
  logAdminAction
} from '../services/dbService';
import { uploadFileToStorage } from '../services/storageService';
import { PlatformCustomizationSettings } from './PlatformCustomizationSettings';
import { CATEGORIES_DATA as CATEGORIES } from '../data/categoriesData';
import {
  X,
  ShieldCheck,
  Users,
  ShoppingBag,
  Settings,
  Image as ImageIcon,
  AlertTriangle,
  Trash2,
  Check,
  Plus,
  Loader2,
  LayoutDashboard,
  Store,
  Receipt,
  FolderTree,
  Truck,
  CreditCard,
  Share2,
  Palette,
  FileText,
  HardDrive
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: UserProfile;
  settings: PlatformSettings;
  onClose: () => void;
  onSettingsUpdated: (newSettings: PlatformSettings) => void;
}

export type AdminTab =
  | 'overview'
  | 'users'
  | 'sellers'
  | 'listings'
  | 'orders'
  | 'categories'
  | 'delivery'
  | 'banners'
  | 'payments'
  | 'referrals'
  | 'theme'
  | 'logs'
  | 'reports'
  | 'media'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  settings,
  onClose,
  onSettingsUpdated
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [listingsList, setListingsList] = useState<ListingItem[]>([]);
  const [bannersList, setBannersList] = useState<BannerItem[]>([]);
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);
  const [sellersList, setSellersList] = useState<SellerProfile[]>([]);
  const [ordersList, setOrdersList] = useState<OrderItem[]>([]);
  const [deliveryRatesList, setDeliveryRatesList] = useState<DeliveryRate[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentItem[]>([]);
  const [referralsList, setReferralsList] = useState<ReferralItem[]>([]);
  const [adminLogsList, setAdminLogsList] = useState<AdminLog[]>([]);

  const [loading, setLoading] = useState(true);

  // New Banner state
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [isCreatingBanner, setIsCreatingBanner] = useState(false);

  // New Seller state
  const [newStoreName, setNewStoreName] = useState('');
  const [newStorePhone, setNewStorePhone] = useState('');

  // New Delivery Rate state
  const [newMunName, setNewMunName] = useState('');
  const [newHomePrice, setNewHomePrice] = useState('');
  const [newOfficePrice, setNewOfficePrice] = useState('');

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users' || activeTab === 'overview') {
        const users = await fetchAllUsers();
        setUsersList(users);
      }
      if (activeTab === 'listings' || activeTab === 'overview' || activeTab === 'media') {
        const listings = await fetchListings('all', '', 'ALL');
        setListingsList(listings);
      }
      if (activeTab === 'banners' || activeTab === 'media') {
        const banners = await fetchBanners();
        setBannersList(banners);
      }
      if (activeTab === 'reports' || activeTab === 'overview') {
        const reports = await fetchReports();
        setReportsList(reports);
      }
      if (activeTab === 'sellers' || activeTab === 'overview') {
        const sellers = await fetchSellers();
        setSellersList(sellers);
      }
      if (activeTab === 'orders' || activeTab === 'overview') {
        const orders = await fetchOrders();
        setOrdersList(orders);
      }
      if (activeTab === 'delivery') {
        const rates = await fetchDeliveryRates();
        setDeliveryRatesList(rates);
      }
      if (activeTab === 'payments' || activeTab === 'overview') {
        const payments = await fetchPayments();
        setPaymentsList(payments);
      }
      if (activeTab === 'referrals') {
        const refs = await fetchReferrals();
        setReferralsList(refs);
      }
      if (activeTab === 'logs') {
        const logs = await fetchAdminLogs();
        setAdminLogsList(logs);
      }
    } catch (err) {
      console.error('Error loading admin tab data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, role: UserProfile['role'], status: UserProfile['status']) => {
    try {
      await updateUserRoleAndStatus(uid, role, status);
      setUsersList(prev => prev.map(u => u.id === uid ? { ...u, role, status } : u));
      await logAdminAction(currentUser.name, 'تعديل صلاحية مستخدم', uid, `Role: ${role}, Status: ${status}`);
    } catch {
      alert('حدث خطأ أثناء تعديل صلاحيات المستخدم');
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (window.confirm('هل أنت تأكيد حذف هذا الإعلان من قاعدة البيانات؟')) {
      try {
        await deleteListingDoc(id);
        setListingsList(prev => prev.filter(l => l.id !== id));
        await logAdminAction(currentUser.name, 'حذف إعلان', id);
      } catch {
        alert('حدث خطأ أثناء حذف الإعلان');
      }
    }
  };

  const handleToggleFeatureListing = async (id: string, currentFeatured?: boolean) => {
    try {
      await updateListingDoc(id, { isFeatured: !currentFeatured });
      setListingsList(prev => prev.map(l => l.id === id ? { ...l, isFeatured: !currentFeatured } : l));
      await logAdminAction(currentUser.name, 'تغيير تمييز إعلان', id, `Featured: ${!currentFeatured}`);
    } catch {
      alert('حدث خطأ أثناء التحديث');
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerTitle.trim() || (!newBannerFile && !newBannerUrl)) return;
    
    setIsCreatingBanner(true);
    try {
      let finalImgUrl = newBannerUrl;
      if (newBannerFile) {
        finalImgUrl = await uploadFileToStorage(newBannerFile, 'banners');
      }

      const created = await createBannerDoc({
        title: newBannerTitle.trim(),
        imageUrl: finalImgUrl,
        active: true,
        position: 'HERO',
        createdAt: new Date().toISOString()
      });

      setBannersList(prev => [created, ...prev]);
      setNewBannerTitle('');
      setNewBannerUrl('');
      setNewBannerFile(null);
      await logAdminAction(currentUser.name, 'إنشاء بانر', created.id, created.title);
    } catch (err) {
      alert('حدث خطأ أثناء إضافة البانر الإعلاني');
    } finally {
      setIsCreatingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await deleteBannerDoc(id);
      setBannersList(prev => prev.filter(b => b.id !== id));
      await logAdminAction(currentUser.name, 'حذف بانر', id);
    } catch {
      alert('حدث خطأ أثناء حذف البانر');
    }
  };

  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newStorePhone.trim()) return;

    try {
      const created = await createSellerDoc({
        storeName: newStoreName.trim(),
        phone: newStorePhone.trim(),
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        verified: true,
        createdAt: new Date().toISOString()
      });
      setSellersList(prev => [created, ...prev]);
      setNewStoreName('');
      setNewStorePhone('');
      await logAdminAction(currentUser.name, 'إضافة تاجر/متجر', created.id, created.storeName);
    } catch {
      alert('حدث خطأ أثناء إضافة المتجر');
    }
  };

  const handleDeleteSeller = async (id: string) => {
    try {
      await deleteSellerDoc(id);
      setSellersList(prev => prev.filter(s => s.id !== id));
      await logAdminAction(currentUser.name, 'حذف تاجر/متجر', id);
    } catch {
      alert('حدث خطأ أثناء حذف المتجر');
    }
  };

  const handleCreateDeliveryRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMunName.trim()) return;

    try {
      const created = await createDeliveryRateDoc({
        municipalityName: newMunName.trim(),
        homeDeliveryPrice: Number(newHomePrice) || 600,
        officeDeliveryPrice: Number(newOfficePrice) || 400,
        estimatedDays: '24-48 ساعة'
      });
      setDeliveryRatesList(prev => [created, ...prev]);
      setNewMunName('');
      setNewHomePrice('');
      setNewOfficePrice('');
      await logAdminAction(currentUser.name, 'إضافة تسعيرة توصيل', created.id, newMunName);
    } catch {
      alert('حدث خطأ أثناء إضافة التسعيرة');
    }
  };

  const tabsConfig: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'overview', label: '1. الرئيسية والإحصائيات', icon: LayoutDashboard },
    { id: 'users', label: '2. إدارة المستخدمين', icon: Users },
    { id: 'sellers', label: '3. التجار والمتاجر', icon: Store },
    { id: 'listings', label: '4. المنتجات والإعلانات', icon: ShoppingBag },
    { id: 'orders', label: '5. الطلبات والمبيعات', icon: Receipt },
    { id: 'categories', label: '6. التصنيفات والأقسام', icon: FolderTree },
    { id: 'delivery', label: '7. أسعار التوصيل', icon: Truck },
    { id: 'banners', label: '8. الإعلانات والبنرات', icon: ImageIcon },
    { id: 'payments', label: '9. المدفوعات والمعاملات', icon: CreditCard },
    { id: 'referrals', label: '10. الإحالات والعمولات', icon: Share2 },
    { id: 'theme', label: '11. الهوية والمظهر', icon: Palette },
    { id: 'logs', label: '12. سجل النشاطات', icon: FileText },
    { id: 'reports', label: '13. البلاغات والشكاوى', icon: AlertTriangle },
    { id: 'media', label: '14. الصور والملفات', icon: HardDrive },
    { id: 'settings', label: '15. إعدادات المنصة', icon: Settings }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-900">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">لوحة الإدارة التنفيذية - سوق لعوينات العملاق</h2>
              <span className="text-[10px] text-slate-500 font-medium block">
                مرحباً بالمالك/المدير: <b className="text-orange-600">{currentUser.name}</b> ({currentUser.role})
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-2xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Body */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Tabs */}
          <aside className="w-64 bg-slate-50/90 border-l border-slate-200/80 p-2 overflow-y-auto shrink-0 space-y-1">
            {tabsConfig.map((t) => {
              const IconComp = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all text-right ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-orange-600'}`} />
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white">
            
            {loading && activeTab !== 'settings' && activeTab !== 'theme' && activeTab !== 'categories' ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                <span className="text-xs font-medium">جلب البيانات الحية من Firestore...</span>
              </div>
            ) : (
              <>
                {/* 1. OVERVIEW & STATS */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-black text-slate-900">نظرة عامة وإحصائيات النظام الحية:</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-orange-50/60 border border-orange-200/80 rounded-2xl">
                        <span className="text-xs font-bold text-orange-800 block">إجمالي المستخدمين</span>
                        <span className="text-2xl font-black text-orange-700 block mt-1">{usersList.length}</span>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <span className="text-xs font-bold text-slate-600 block">إجمالي الإعلانات</span>
                        <span className="text-2xl font-black text-slate-900 block mt-1">{listingsList.length}</span>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <span className="text-xs font-bold text-slate-600 block">التجار والمتاجر</span>
                        <span className="text-2xl font-black text-slate-900 block mt-1">{sellersList.length}</span>
                      </div>
                      <div className="p-4 bg-red-50/60 border border-red-200/80 rounded-2xl">
                        <span className="text-xs font-bold text-red-800 block">البلاغات المعلقة</span>
                        <span className="text-2xl font-black text-red-700 block mt-1">{reportsList.length}</span>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <h4 className="text-xs font-black text-slate-900">حالة الخوادم والاتصال بـ Firebase:</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        مشروع Firebase النشط: <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-orange-700">light-chicken-wbndl</code><br />
                        قاعدة البيانات Firestore: <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">ai-studio-remixsouqelaouin...</code><br />
                        ملاحظة: يجب نشر <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-red-700 font-bold">firestore.rules</code> و<code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-red-700 font-bold">storage.rules</code> إلى Firebase Console، وتفعيل مزودي Authentication، وإضافة نطاق الإنتاج إلى Authorized Domains.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. USERS MANAGEMENT */}
                {activeTab === 'users' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900">إدارة المستخدمين والأدوار:</h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                          <tr>
                            <th className="p-3">الاسم</th>
                            <th className="p-3">البريد الإلكتروني</th>
                            <th className="p-3">الصلاحية / الرتبة</th>
                            <th className="p-3">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {usersList.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/80">
                              <td className="p-3 font-bold text-slate-900">{u.name}</td>
                              <td className="p-3 text-slate-500 font-medium">{u.email}</td>
                              <td className="p-3">
                                <select
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u.id, e.target.value as any, u.status)}
                                  className="bg-slate-50 border border-slate-200 text-xs p-1.5 rounded-xl text-orange-700 font-bold"
                                >
                                  <option value="USER">مستخدم (USER)</option>
                                  <option value="MODERATOR">مشرف (MODERATOR)</option>
                                  <option value="ADMIN">مدير (ADMIN)</option>
                                  <option value="SUPER_ADMIN">مدير عام (SUPER_ADMIN)</option>
                                  <option value="OWNER">المالك (OWNER)</option>
                                </select>
                              </td>
                              <td className="p-3">
                                <select
                                  value={u.status}
                                  onChange={(e) => handleRoleChange(u.id, u.role, e.target.value as any)}
                                  className="bg-slate-50 border border-slate-200 text-xs p-1.5 rounded-xl text-slate-700 font-medium"
                                >
                                  <option value="ACTIVE">نشط</option>
                                  <option value="SUSPENDED">معلق</option>
                                  <option value="BANNED">محظور</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. SELLERS & STORES */}
                {activeTab === 'sellers' && (
                  <div className="space-y-6">
                    <form onSubmit={handleCreateSeller} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black text-orange-700">إضافة متجر/تاجر جديد في العوينات</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="اسم المتجر"
                          value={newStoreName}
                          onChange={(e) => setNewStoreName(e.target.value)}
                          className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs"
                          required
                        />
                        <input
                          type="tel"
                          placeholder="رقم الهاتف"
                          value={newStorePhone}
                          onChange={(e) => setNewStorePhone(e.target.value)}
                          className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl"
                      >
                        إضافة المتجر
                      </button>
                    </form>

                    <div className="space-y-2">
                      {sellersList.map(s => (
                        <div key={s.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{s.storeName}</span>
                            <span className="text-[10px] text-slate-500 block">هاتف: {s.phone} | المالك: {s.ownerName}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteSeller(s.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. LISTINGS */}
                {activeTab === 'listings' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900">إدارة المنتجات والإعلانات:</h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                          <tr>
                            <th className="p-3">الإعلان</th>
                            <th className="p-3">المعلن</th>
                            <th className="p-3">السعر</th>
                            <th className="p-3">مميز</th>
                            <th className="p-3">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {listingsList.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/80">
                              <td className="p-3 font-bold max-w-[200px] truncate text-slate-900">{item.title}</td>
                              <td className="p-3 text-slate-600">{item.ownerName}</td>
                              <td className="p-3 text-orange-600 font-black">{item.priceFormatted || item.price}</td>
                              <td className="p-3">
                                <button
                                  onClick={() => handleToggleFeatureListing(item.id, item.isFeatured)}
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                                    item.isFeatured ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {item.isFeatured ? 'مميز' : 'عادي'}
                                </button>
                              </td>
                              <td className="p-3">
                                <button
                                  onClick={() => handleDeleteListing(item.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. ORDERS & SALES */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900">سجل الطلبات والمبيعات:</h3>
                    {ordersList.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                        لا توجد طلبات شراية مسجلة حالياً.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ordersList.map(o => (
                          <div key={o.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-slate-900">{o.listingTitle}</span>
                              <span className="text-[10px] text-slate-500 block">المشتري: {o.buyerName} ({o.buyerPhone})</span>
                            </div>
                            <span className="text-xs font-black text-orange-600">{o.totalAmount} دج</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. CATEGORIES */}
                {activeTab === 'categories' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900">أقسام وتصنيفات سوق لعوينات:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CATEGORIES.map(cat => (
                        <div key={cat.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                          <span className="text-xl">{cat.icon}</span>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{cat.nameAr}</span>
                            <span className="text-[10px] text-slate-500 block">{cat.subcategories?.length || 0} تصنيفات فرعية</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. DELIVERY RATES */}
                {activeTab === 'delivery' && (
                  <div className="space-y-6">
                    <form onSubmit={handleCreateDeliveryRate} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black text-orange-700">إضافة/تعديل سعر توصيل لبلدية بتبسة</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="اسم البلدية"
                          value={newMunName}
                          onChange={(e) => setNewMunName(e.target.value)}
                          className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs"
                          required
                        />
                        <input
                          type="number"
                          placeholder="سعر التوصيل للمنزل (دج)"
                          value={newHomePrice}
                          onChange={(e) => setNewHomePrice(e.target.value)}
                          className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs"
                        />
                        <input
                          type="number"
                          placeholder="سعر التوصيل للمكتب (دج)"
                          value={newOfficePrice}
                          onChange={(e) => setNewOfficePrice(e.target.value)}
                          className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs"
                        />
                      </div>
                      <button type="submit" className="px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl">
                        حفظ التسعيرة
                      </button>
                    </form>

                    <div className="space-y-2">
                      {deliveryRatesList.map(r => (
                        <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-900">{r.municipalityName}</span>
                            <span className="text-[10px] text-slate-500 block">منزل: {r.homeDeliveryPrice} دج | مكتب: {r.officeDeliveryPrice} دج</span>
                          </div>
                          <button onClick={() => deleteDeliveryRateDoc(r.id)} className="p-1 text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. BANNERS */}
                {activeTab === 'banners' && (
                  <div className="space-y-6">
                    <form onSubmit={handleCreateBanner} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black text-orange-700">إضافة بانر إعلاني جديد</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="عنوان البانر"
                          value={newBannerTitle}
                          onChange={(e) => setNewBannerTitle(e.target.value)}
                          className="bg-white border border-slate-200 p-3 rounded-2xl text-xs"
                          required
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewBannerFile(e.target.files?.[0] || null)}
                          className="bg-white border border-slate-200 p-2.5 rounded-2xl text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isCreatingBanner}
                        className="px-5 py-2.5 bg-orange-600 text-white font-black text-xs rounded-2xl flex items-center gap-2"
                      >
                        {isCreatingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        <span>حفظ البانر</span>
                      </button>
                    </form>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {bannersList.map((b) => (
                        <div key={b.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                          <img src={b.imageUrl} alt={b.title} className="w-full h-28 object-cover rounded-xl" />
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{b.title}</span>
                            <button onClick={() => handleDeleteBanner(b.id)} className="p-1.5 text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. PAYMENTS */}
                {activeTab === 'payments' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900">سجل المدفوعات والمعاملات:</h3>
                    <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                      نظام الدفع عبر البريد الذهبي و CCP واليد باليد معتمد وجاهز للربط.
                    </div>
                  </div>
                )}

                {/* 10. REFERRALS */}
                {activeTab === 'referrals' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900">نظام التسويق بالعمولة والإحالات:</h3>
                    <div className="p-4 bg-orange-50 border border-orange-200 text-orange-900 rounded-2xl text-xs font-medium">
                      المنصة مرتبطة مع رابط التسويق بالعمولة المباشر: <a href="https://sawa9ly.app/?r=97834" target="_blank" rel="noreferrer" className="underline font-bold">sawa9ly.app/?r=97834</a>
                    </div>
                  </div>
                )}

                {/* 11. THEME */}
                {activeTab === 'theme' && (
                  <PlatformCustomizationSettings settings={settings} onSettingsUpdated={onSettingsUpdated} />
                )}

                {/* 12. AUDIT LOGS */}
                {activeTab === 'logs' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900">سجل نشاطات الإدارة (Admin Audit Logs):</h3>
                    <div className="space-y-2">
                      {adminLogsList.map(l => (
                        <div key={l.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-orange-700">{l.adminName}</span>: {l.action}
                            <span className="text-slate-500 block text-[10px]">{l.details}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(l.timestamp).toLocaleString('ar-DZ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 13. REPORTS */}
                {activeTab === 'reports' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900">البلاغات والشكاوى:</h3>
                    {reportsList.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                        لا توجد بلاغات حالياً.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {reportsList.map(r => (
                          <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-orange-700 block mb-0.5">سبب البلاغ: {r.reason}</span>
                              <span className="text-[10px] text-slate-500 font-medium block">معرف الإعلان: {r.listingId}</span>
                            </div>
                            <span className="text-[10px] px-2.5 py-1 bg-slate-200 text-slate-700 font-bold rounded-xl">{r.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 14. MEDIA */}
                {activeTab === 'media' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900">إدارة الصور والملفات المرفوعة:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {listingsList.flatMap(l => l.images).slice(0, 16).map((img, i) => (
                        <img key={i} src={img} alt="" className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 15. SETTINGS */}
                {activeTab === 'settings' && (
                  <PlatformCustomizationSettings settings={settings} onSettingsUpdated={onSettingsUpdated} />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
