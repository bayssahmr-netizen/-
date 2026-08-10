import React, { useState } from 'react';
import {
  ShoppingBag,
  PlusCircle,
  User,
  ShieldCheck,
  ExternalLink,
  Menu,
  X,
  Search,
  Download,
  LogOut,
  Sparkles
} from 'lucide-react';
import { PlatformSettings, UserProfile } from '../types';

interface NavbarProps {
  settings: PlatformSettings;
  currentUser: UserProfile | null;
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
  onOpenAdminModal: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  canInstallPwa: boolean;
  onInstallPwa: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentUser,
  onOpenAddModal,
  onOpenAuthModal,
  onOpenAdminModal,
  onLogout,
  searchQuery,
  setSearchQuery,
  canInstallPwa,
  onInstallPwa
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = currentUser && ['OWNER', 'SUPER_ADMIN', 'ADMIN'].includes(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 shrink-0">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.platformName}
                className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-md">
                S
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                {settings.shortName || 'سوق لعوينات العملاق'}
              </h1>
              <span className="text-[11px] text-orange-600 font-bold block -mt-0.5">
                المنصة المحلية الأولى
              </span>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن سيارات، عقارات، هواتف، وظائف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-full pl-4 pr-10 py-2 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Affiliate Marketing Direct Link */}
            <a
              href="https://sawa9ly.app/?r=97834"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold hover:bg-orange-100 transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>التسويق بالعمولة</span>
              <ExternalLink className="w-3 h-3 text-orange-600 ml-0.5" />
            </a>

            {/* PWA Install Button if available */}
            {canInstallPwa && (
              <button
                onClick={onInstallPwa}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-200 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-orange-600" />
                <span>تثبيت التطبيق</span>
              </button>
            )}

            {/* Publish Listing Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>+ نشر إعلان</span>
            </button>

            {/* Admin Dashboard Trigger */}
            {isAdmin && (
              <button
                onClick={onOpenAdminModal}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl text-xs font-bold hover:bg-amber-100 transition-all"
                title="لوحة الإدارة"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden xl:inline">لوحة التحكم</span>
              </button>
            )}

            {/* Auth / Profile Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 border-r border-slate-200 pr-2 sm:pr-3 mr-1">
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-300 text-orange-700 flex items-center justify-center font-extrabold text-xs uppercase overflow-hidden shadow-2xs">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name.charAt(0)
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[80px] truncate hidden sm:inline">
                    {currentUser.name}
                  </span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100 transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold border border-slate-200 transition-all"
              >
                <User className="w-4 h-4 text-orange-600" />
                <span>دخول</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="py-2 pb-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن سيارات، عقارات، وظائف، خدمات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-slate-900 placeholder-slate-400 text-xs rounded-full pl-4 pr-9 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Mobile Expanded Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-2">
            <a
              href="https://sawa9ly.app/?r=97834"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>التسويق بالعمولة (منصة سواقلي)</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
            </a>

            {canInstallPwa && (
              <button
                onClick={onInstallPwa}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
              >
                <Download className="w-4 h-4 text-orange-600" />
                <span>تثبيت التطبيق على الهاتف</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminModal();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>لوحة تحكم الإدارة</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
