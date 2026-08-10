import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, testFirestoreConnection } from './firebase';
import {
  fetchPlatformSettings,
  fetchUserProfile,
  createOrUpdateUserProfile,
  fetchListings,
  fetchBanners,
  deleteListingDoc,
  createReportDoc
} from './services/dbService';
import { PlatformSettings, UserProfile, ListingItem, BannerItem } from './types';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryBar } from './components/CategoryBar';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { AddListingModal } from './components/AddListingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Footer } from './components/Footer';
import { DEFAULT_SETTINGS } from './data/initialData';
import { ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';

import { AdminLoginPage } from './components/AdminLoginPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [loadingListings, setLoadingListings] = useState<boolean>(true);
  const [dbConnected, setDbConnected] = useState<boolean>(true);

  // Modals
  const [selectedListingDetail, setSelectedListingDetail] = useState<ListingItem | null>(null);
  const [addListingModalOpen, setAddListingModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState<boolean>(false);

  // Sync route
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (path === '/admin') {
        setAdminDashboardOpen(true);
      } else {
        setAdminDashboardOpen(false);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    if (window.location.pathname === '/admin') {
      setAdminDashboardOpen(true);
    }

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    if (path === '/admin') {
      setAdminDashboardOpen(true);
    } else {
      setAdminDashboardOpen(false);
    }
  };

  // PWA Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaBanner, setShowPwaBanner] = useState<boolean>(false);

  // Initialize PWA Service Worker & Install Listener
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Relative path so it resolves correctly under any hosting sub-path (/hako/, ...)
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.warn('SW Registration Error:', err);
      });
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPwaBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        try {
          let profile = await fetchUserProfile(firebaseUser.uid);
          if (!profile) {
            profile = await createOrUpdateUserProfile({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'مستخدم جديد',
              email: firebaseUser.email || ''
            });
          }
          setCurrentUser(profile);
        } catch (err) {
          console.warn('Profile fetch error:', err);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load Initial Settings & Banners
  useEffect(() => {
    loadSettingsAndBanners();
  }, []);

  // Sync DOM Head tags with live settings
  useEffect(() => {
    if (!settings) return;
    
    // Page Title
    if (settings.platformName) {
      document.title = settings.platformName;
    }

    // Favicon
    if (settings.faviconUrl) {
      let iconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(iconLink);
      }
      iconLink.href = settings.faviconUrl;
    }

    // Meta Description
    if (settings.description) {
      let metaDesc = document.querySelector("meta[name='description']") as HTMLMetaElement;
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.getElementsByTagName('head')[0].appendChild(metaDesc);
      }
      metaDesc.content = settings.description;
    }

    // Theme Color
    if (settings.primaryColor) {
      let metaTheme = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
      if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        document.getElementsByTagName('head')[0].appendChild(metaTheme);
      }
      metaTheme.content = settings.primaryColor;
    }

    // Helper for OpenGraph tags
    const setOgMeta = (property: string, content: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[property='${property}']`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.getElementsByTagName('head')[0].appendChild(el);
      }
      el.content = content;
    };

    setOgMeta('og:title', settings.platformName || 'سوق لعوينات العملاق');
    setOgMeta('og:description', settings.description || '');
    setOgMeta('og:image', settings.ogImageUrl || '');
    setOgMeta('og:url', window.location.href);
    setOgMeta('og:type', 'website');
  }, [settings]);

  const loadSettingsAndBanners = async () => {
    try {
      const liveSettings = await fetchPlatformSettings();
      setSettings(liveSettings);

      const liveBanners = await fetchBanners();
      setBanners(liveBanners || []);
    } catch (err) {
      console.warn('Failed to load settings:', err);
    }
  };

  // Load Listings when Category or Search Changes
  useEffect(() => {
    loadListingsData();
  }, [selectedCategory, searchQuery]);

  const loadListingsData = async () => {
    setLoadingListings(true);
    try {
      const items = await fetchListings(selectedCategory, searchQuery);
      setListings(items);
      setDbConnected(true);
    } catch (err) {
      console.error('Listings Load Error:', err);
      setDbConnected(false);
    } finally {
      setLoadingListings(false);
    }
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowPwaBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDeleteListing = async (id: string) => {
    await deleteListingDoc(id);
    setListings(prev => prev.filter(l => l.id !== id));
    if (selectedListingDetail?.id === id) {
      setSelectedListingDetail(null);
    }
  };

  const handleLogout = async () => {
    try {
      // Real Firebase sign-out (not just clearing local state)
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setCurrentUser(null);
    }
  };

  const handleReportListing = async (listingId: string, reason: string) => {
    await createReportDoc({
      listingId,
      reporterId: currentUser?.id || 'anonymous',
      reporterName: currentUser?.name || 'زائر',
      reason,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans dir-rtl select-none">
      
      {/* Navbar */}
      <Navbar
        settings={settings}
        currentUser={currentUser}
        onOpenAddModal={() => setAddListingModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenAdminModal={() => navigateTo('/admin')}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        canInstallPwa={!!deferredPrompt}
        onInstallPwa={handleInstallPwa}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Hero Section */}
        <HeroBanner
          settings={settings}
          banners={banners}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectCategory={(catId) => setSelectedCategory(catId)}
        />

        {/* Category Navigation Bar */}
        <CategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => setSelectedCategory(catId)}
        />

        {/* Listings Section in Bento Container */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {selectedCategory === 'all'
                  ? 'أحدث الإعلانات في العوينات'
                  : `إعلانات قسم ${selectedCategory}`}
              </h2>
              <span className="text-xs text-slate-500 font-medium block mt-1">
                تصفح بيع وشراء المركبات، العقارات، الوظائف، والخدمات
              </span>
            </div>

            <button
              onClick={loadListingsData}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200/60 text-xs font-bold flex items-center gap-2 transition-all shadow-2xs"
              title="تحديث القائمة"
            >
              <RefreshCw className="w-4 h-4 text-orange-600" />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>

          {/* Database Disconnection Alert if any */}
          {!dbConnected && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>تعذر الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى.</span>
              </div>
              <button
                onClick={loadListingsData}
                className="px-3 py-1 bg-red-600 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                إعادة الاتصال
              </button>
            </div>
          )}

          {/* Listings Grid */}
          {loadingListings ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-slate-100 rounded-3xl h-80 animate-pulse border border-slate-200/60" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-slate-50/80 rounded-3xl border border-dashed border-slate-200">
              <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-800">لا توجد إعلانات مطابقة حالياً</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                جرّب تغيير كلمات البحث أو اختر تصنيفاً آخر، أو كن أول من ينشر إعلاناً هنا!
              </p>
              <button
                onClick={() => setAddListingModalOpen(true)}
                className="mt-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-2xl shadow-md transition-all"
              >
                انشر إعلانك الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {listings.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  onSelectListing={(listing) => setSelectedListingDetail(listing)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer settings={settings} onSelectCategory={(catId) => setSelectedCategory(catId)} />

      {/* MODALS */}
      {selectedListingDetail && (
        <ListingDetailModal
          listing={selectedListingDetail}
          currentUser={currentUser}
          onClose={() => setSelectedListingDetail(null)}
          onDeleteListing={handleDeleteListing}
          onReportListing={handleReportListing}
        />
      )}

      {addListingModalOpen && (
        <AddListingModal
          currentUser={currentUser}
          onClose={() => setAddListingModalOpen(false)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          onSuccess={() => loadListingsData()}
        />
      )}

      {authModalOpen && (
        <AuthModal
          currentUser={currentUser}
          onClose={() => setAuthModalOpen(false)}
          onUserChanged={(user) => {
            setCurrentUser(user);
          }}
        />
      )}

      {/* Admin Login Route (/admin/login) */}
      {currentPath === '/admin/login' && (
        <AdminLoginPage
          onSuccess={(user) => {
            setCurrentUser(user);
            navigateTo('/admin');
          }}
          onNavigateHome={() => navigateTo('/')}
        />
      )}

      {/* Protected Admin Route (/admin) */}
      {currentPath !== '/admin/login' && (currentPath === '/admin' || adminDashboardOpen) && (
        <>
          {authLoading ? (
            <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-3xl text-center space-y-3">
                <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-800">جاري التحقق من صلاحيات لوحة الإدارة والاتصال بـ Firebase...</p>
              </div>
            </div>
          ) : !currentUser ? (
            <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto text-xl font-black">
                  🔐
                </div>
                <h3 className="text-base font-black text-slate-900">تسجيل الدخول مطلوب</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  الوصول إلى المسار <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-orange-600 font-bold">/admin</code> مخصص فقط لمالك المنصة ومدراء النظام. يرجى تسجيل الدخول أولاً.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => navigateTo('/admin/login')}
                    className="flex-1 py-2.5 bg-orange-600 text-white font-bold text-xs rounded-2xl shadow-xs"
                  >
                    تسجيل الدخول كمدير
                  </button>
                  <button
                    onClick={() => navigateTo('/')}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-2xl"
                  >
                    العودة للرئيسية
                  </button>
                </div>
              </div>
            </div>
          ) : !['OWNER', 'SUPER_ADMIN', 'ADMIN'].includes(currentUser.role) ? (
            <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
                <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-200 rounded-2xl flex items-center justify-center mx-auto text-xl font-black">
                  ⛔
                </div>
                <h3 className="text-base font-black text-slate-900">غير مصرح لك بالدخول</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  حسابك الحساب الحالي (<b className="text-slate-900">{currentUser.email}</b>) مسجل برتبة <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">{currentUser.role}</span> وليس لديه صلاحية الوصول للوحة التحكم التنفيذية.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => navigateTo('/admin/login')}
                    className="flex-1 py-2.5 bg-orange-600 text-white font-bold text-xs rounded-2xl"
                  >
                    دخول بحساب آخر
                  </button>
                  <button
                    onClick={() => navigateTo('/')}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-2xl"
                  >
                    العودة للرئيسية
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <AdminDashboard
              currentUser={currentUser}
              settings={settings}
              onClose={() => navigateTo('/')}
              onSettingsUpdated={(newSettings) => setSettings(newSettings)}
            />
          )}
        </>
      )}

      {/* PWA Prompt Banner */}
      {showPwaBanner && (
        <PWAInstallBanner
          onInstall={handleInstallPwa}
          onDismiss={() => setShowPwaBanner(false)}
        />
      )}
    </div>
  );
}
