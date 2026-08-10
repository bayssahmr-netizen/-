import React from 'react';
import { PlatformSettings, BannerItem } from '../types';
import { Search, MapPin, Tag, ShieldAlert } from 'lucide-react';

interface HeroBannerProps {
  settings: PlatformSettings;
  banners: BannerItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectCategory: (catId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  settings,
  banners,
  searchQuery,
  setSearchQuery,
  onSelectCategory
}) => {
  const activeBanners = banners.filter(b => b.active);

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-800 text-white overflow-hidden p-6 sm:p-10 shadow-md">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        
        {/* City Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-bold mb-4 shadow-2xs">
          <MapPin className="w-3.5 h-3.5 text-orange-400" />
          <span>مدينة العوينات - ولاية تبسة</span>
        </div>

        {/* Hero Titles */}
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3 leading-snug">
          {settings.heroTitle || 'أهلاً بكم في سوق لعوينات العملاق'}
        </h2>
        <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto mb-6 leading-relaxed font-medium">
          {settings.heroSubtitle || 'وجهتكم المحلية الأولى للبيع والشراء والوظائف والخدمات والمفقودات'}
        </p>

        {/* Quick Categories Shortcuts */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto text-xs font-bold">
          <button
            onClick={() => onSelectCategory('cars')}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-2xs"
          >
            🚗 السيارات
          </button>
          <button
            onClick={() => onSelectCategory('realestate')}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-2xs"
          >
            🏠 العقارات
          </button>
          <button
            onClick={() => onSelectCategory('jobs')}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-2xs"
          >
            💼 الوظائف
          </button>
          <button
            onClick={() => onSelectCategory('services')}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-2xs"
          >
            🛠️ الخدمات
          </button>
          <button
            onClick={() => onSelectCategory('lostfound')}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-2xs"
          >
            🔍 المفقودات
          </button>
          <a
            href="https://sawa9ly.app/?r=97834"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white border border-orange-500 font-extrabold transition-all shadow-sm active:scale-95"
          >
            ⚡ التسويق بالعمولة (سواقلي)
          </a>
        </div>

        {/* Ad Banners carousel / static banner if uploaded */}
        {activeBanners.length > 0 && (
          <div className="mt-8 max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl">
            {activeBanners.map(banner => (
              <a
                key={banner.id}
                href={banner.targetUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative group"
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-36 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                  <span className="text-white text-xs sm:text-sm font-black truncate">
                    {banner.title}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
