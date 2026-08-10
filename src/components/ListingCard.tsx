import React from 'react';
import { ListingItem } from '../types';
import { formatPrice, formatDate } from '../utils/formatters';
import { Phone, MessageCircle, Eye, MapPin, Tag, ShieldCheck, Clock } from 'lucide-react';

interface ListingCardProps {
  listing: ListingItem;
  onSelectListing: (listing: ListingItem) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelectListing
}) => {
  const displayImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';

  const formattedPrice = listing.priceFormatted || formatPrice(listing.price);

  const cleanWhatsappNumber = (wa?: string) => {
    if (!wa) return listing.phone ? listing.phone.replace(/\D/g, '') : '';
    let digits = wa.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '213' + digits.substring(1);
    }
    return digits;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 hover:border-orange-500/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
      
      {/* Thumbnail Container */}
      <div
        onClick={() => onSelectListing(listing)}
        className="relative w-full h-48 bg-slate-100 overflow-hidden cursor-pointer"
      >
        <img
          src={displayImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Featured Badge */}
        {listing.isFeatured && (
          <span className="absolute top-3 right-3 px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-xl shadow-xs uppercase tracking-wider">
            مميز ⭐
          </span>
        )}

        {/* Category Badge */}
        <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200 font-extrabold text-[11px] rounded-xl shadow-xs">
          {listing.location || 'العوينات'}
        </span>

        {/* Views Count */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-bold rounded-xl shadow-2xs">
          <Eye className="w-3 h-3 text-orange-600" />
          <span>{listing.views || 1}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            onClick={() => onSelectListing(listing)}
            className="text-sm font-extrabold text-slate-900 line-clamp-2 hover:text-orange-600 cursor-pointer transition-colors leading-snug mb-2"
          >
            {listing.title}
          </h3>

          {/* Description Preview */}
          <p className="text-slate-500 text-xs line-clamp-2 mb-3 leading-relaxed font-medium">
            {listing.description}
          </p>
        </div>

        <div>
          {/* Price */}
          <div className="mb-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">السعر المطلوب</span>
            <span className="text-base font-black text-orange-600">
              {formattedPrice}
            </span>
          </div>

          {/* Contact Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {listing.phone && (
              <a
                href={`tel:${listing.phone}`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-2xl text-xs font-bold transition-all shadow-2xs"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="w-3.5 h-3.5 text-orange-600" />
                <span>اتصال</span>
              </a>
            )}

            <a
              href={`https://wa.me/${cleanWhatsappNumber(listing.whatsapp || listing.phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold transition-all shadow-2xs"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>واتساب</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
