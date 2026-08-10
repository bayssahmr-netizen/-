import React from 'react';
import { PlatformSettings } from '../types';
import { MapPin, Phone, Mail, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  settings: PlatformSettings;
  onSelectCategory: (catId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onSelectCategory }) => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Brand info */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="" className="w-8 h-8 rounded-xl object-cover border border-slate-200" />
            ) : (
              <div className="w-8 h-8 bg-orange-600 text-white font-black rounded-xl flex items-center justify-center text-sm">
                S
              </div>
            )}
            <h3 className="text-sm font-black text-slate-900">{settings.platformName}</h3>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
            {settings.description}
          </p>
          <div className="flex items-center gap-1.5 text-orange-600 font-bold">
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            <span>العوينات - ولاية تبسة - الجزائر</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <h4 className="text-slate-900 font-black text-xs border-b border-slate-100 pb-2">الأقسام الرئيسية</h4>
          <ul className="space-y-2 text-slate-600 font-medium">
            <li>
              <button onClick={() => onSelectCategory('cars')} className="hover:text-orange-600 transition-colors">
                السيارات والمركبات
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('realestate')} className="hover:text-orange-600 transition-colors">
                العقارات والأراضي
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('jobs')} className="hover:text-orange-600 transition-colors">
                الوظائف والفرص
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('services')} className="hover:text-orange-600 transition-colors">
                الخدمات والحرف
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('lostfound')} className="hover:text-orange-600 transition-colors">
                المفقودات والموجودات
              </button>
            </li>
          </ul>
        </div>

        {/* Affiliate Marketing & Special links */}
        <div className="space-y-2">
          <h4 className="text-slate-900 font-black text-xs border-b border-slate-100 pb-2">الخدمات والشراكات</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="https://sawa9ly.app/?r=97834"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 font-black flex items-center gap-1 hover:underline transition-all"
              >
                <span>التسويق بالعمولة (منصة سواقلي)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li className="text-slate-500 text-[11px] font-medium">
              إشراف وتطوير إدارة المنصة المحلية
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <h4 className="text-slate-900 font-black text-xs border-b border-slate-100 pb-2">التواصل والإدارة</h4>
          <div className="space-y-2 text-slate-600 text-[11px] font-medium">
            {settings.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-orange-600" />
                <span>{settings.contactPhone}</span>
              </div>
            )}
            {settings.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-orange-600" />
                <span>{settings.contactEmail}</span>
              </div>
            )}
            <div className="pt-2 text-orange-700 font-bold">
              المؤسس والمدير العام: عبد الحق غولام مراحي
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
        <p>{settings.footerText || 'جميع الحقوق محفوظة © سوق لعوينات العملاق'}</p>
      </div>
    </footer>
  );
};
