import React from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface PWAInstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  onInstall,
  onDismiss
}) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-40 max-w-sm bg-white/95 border border-slate-200/80 backdrop-blur-md rounded-3xl p-4 shadow-2xl text-slate-900 flex items-center justify-between gap-3 animate-bounce-short">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-900">تثبيت تطبيق سوق لعوينات</h4>
          <p className="text-[10px] text-slate-500 font-medium">
            أضف المنصة إلى الشاشة الرئيسية لفتحها بسرعة ودون انقطاع
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onInstall}
          className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-xs transition-all"
        >
          تثبيت
        </button>
        <button
          onClick={onDismiss}
          className="p-1 text-slate-400 hover:text-slate-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
