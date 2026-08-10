import React, { useState } from 'react';
import { ListingItem, UserProfile } from '../types';
import { formatPrice, formatDate } from '../utils/formatters';
import {
  X,
  Phone,
  MessageCircle,
  MapPin,
  Tag,
  Eye,
  Calendar,
  User,
  Trash2,
  AlertTriangle,
  Share2,
  CheckCircle2
} from 'lucide-react';

interface ListingDetailModalProps {
  listing: ListingItem | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  onDeleteListing: (id: string) => Promise<void>;
  onReportListing: (listingId: string, reason: string) => Promise<void>;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  currentUser,
  onClose,
  onDeleteListing,
  onReportListing
}) => {
  if (!listing) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reportReason, setReportReason] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'];

  const isOwnerOrAdmin = currentUser && (
    currentUser.id === listing.ownerId ||
    ['OWNER', 'SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)
  );

  const cleanWhatsappNumber = (wa?: string) => {
    if (!wa) return listing.phone ? listing.phone.replace(/\D/g, '') : '';
    let digits = wa.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '213' + digits.substring(1);
    }
    return digits;
  };

  const handleDelete = async () => {
    if (window.confirm('هل أنت أور بالتأكيد من إرادتك لحذف هذا الإعلان نهائياً من قاعدة البيانات؟')) {
      setIsDeleting(true);
      try {
        await onDeleteListing(listing.id);
        onClose();
      } catch (err) {
        alert('حدث خطأ أثناء حذف الإعلان');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    try {
      await onReportListing(listing.id, reportReason);
      alert('تم إرسال بلاغك بنجاح للوفد الإداري');
      setShowReportForm(false);
      setReportReason('');
    } catch {
      alert('فشل إرسال البلاغ');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative text-slate-900">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/95 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl text-xs font-bold">
              {listing.location || 'مدينة العوينات'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              تاريخ النشر: {formatDate(listing.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              title="مشاركة"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copied && <span className="text-xs text-emerald-600 font-bold">تم نسخ الرابط</span>}

            {isOwnerOrAdmin && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all"
                title="حذف الإعلان"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Main Image & Gallery */}
          <div className="space-y-3">
            <div className="w-full h-64 sm:h-96 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative">
              <img
                src={images[activeImageIndex]}
                alt={listing.title}
                className="w-full h-full object-contain"
              />
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-orange-600 scale-105 shadow-2xs' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title and Price */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mb-2">
                {listing.title}
              </h1>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  {listing.location}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-orange-600" />
                  {listing.views || 1} مشاهدة
                </span>
              </div>
            </div>

            <div className="text-right sm:text-left shrink-0">
              <span className="text-xs text-slate-400 font-medium block mb-0.5">السعر المطلوب</span>
              <span className="text-2xl font-black text-orange-600">
                {listing.priceFormatted || formatPrice(listing.price)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-sm font-black text-slate-900">تفاصيل الإعلان:</h2>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
              {listing.description}
            </div>
          </div>

          {/* Seller Info & Contact Actions */}
          <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-200/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 border border-orange-300 text-orange-700 flex items-center justify-center font-black text-lg">
                {listing.ownerName ? listing.ownerName.charAt(0) : <User className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">{listing.ownerName || 'معلن في سوق لعوينات'}</h3>
                <span className="text-xs text-slate-500 font-medium">معلن موثوق من مدينة العوينات</span>
              </div>
            </div>

            {/* Direct Call & Direct WhatsApp Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {listing.phone && (
                <a
                  href={`tel:${listing.phone}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl text-sm shadow-sm transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصل الآن ({listing.phone})</span>
                </a>
              )}

              <a
                href={`https://wa.me/${cleanWhatsappNumber(listing.whatsapp || listing.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>مراسلة عبر واتساب</span>
              </a>
            </div>
          </div>

          {/* Report Button */}
          <div className="pt-2 flex justify-end">
            {!showReportForm ? (
              <button
                onClick={() => setShowReportForm(true)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 font-bold transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>الإبلاغ عن محتوى غير مناسب</span>
              </button>
            ) : (
              <form onSubmit={handleReportSubmit} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <input
                  type="text"
                  placeholder="سبب البلاغ (محتوى مخالف، سعر وهمي...)"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-white text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="px-3.5 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-xs"
                  >
                    إرسال البلاغ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
