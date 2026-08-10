import React, { useState } from 'react';
import { CATEGORIES_DATA } from '../data/categoriesData';
import { UserProfile, ListingItem } from '../types';
import { uploadFileToStorage } from '../services/storageService';
import { createListingDoc } from '../services/dbService';
import { parsePriceInput } from '../utils/formatters';
import { X, Upload, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface AddListingModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  onOpenAuthModal: () => void;
  onSuccess: (newListing: ListingItem) => void;
}

export const AddListingModal: React.FC<AddListingModalProps> = ({
  currentUser,
  onClose,
  onOpenAuthModal,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('classifieds');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [location, setLocation] = useState('مدينة العوينات');
  const [condition, setCondition] = useState<ListingItem['condition']>('EXCELLENT');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || '');
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Selected Category
  const currentCategory = CATEGORIES_DATA.find(c => c.id === categoryId);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const filesArr: File[] = Array.from(e.target.files);
    const validFiles: File[] = [];

    for (const file of filesArr) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setErrorMessage('نوع الملف غير مدعوم. الصيغ المسموحة: PNG, JPG, JPEG, WEBP, SVG.');
        continue;
      }
      if (file.size > maxSize) {
        setErrorMessage('حجم الصورة كبير جداً (الحد الأقصى 10 ميغابايت لكل صورة).');
        continue;
      }
      validFiles.push(file);
    }

    const remaining = Math.max(0, 5 - selectedFiles.length);
    const toAdd = validFiles.slice(0, remaining);
    if (validFiles.length > remaining) {
      setErrorMessage('يمكن رفع 5 صور كحد أقصى لكل إعلان.');
    }

    setSelectedFiles(prev => [...prev, ...toAdd]);

    const newPreviews = toAdd.map((file: File) => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);

    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentUser) {
      onOpenAuthModal();
      return;
    }

    if (!title.trim() || !description.trim() || !phone.trim()) {
      setErrorMessage('يرجى ملء كافة الحقول الأساسية (العنوان، الوصف، ورقم الهاتف)');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload images to Firebase Storage
      const imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const url = await uploadFileToStorage(file, `listings/${currentUser.id}`);
          imageUrls.push(url);
        }
      }

      // 2. Parse price input strictly
      const parsedPrice = parsePriceInput(priceInput);

      // 3. Build clean Listing Payload
      const listingPayload: Omit<ListingItem, 'id'> = {
        title: title.trim(),
        categoryId,
        subcategoryId: subcategoryId.trim() || '',
        description: description.trim(),
        price: parsedPrice,
        priceFormatted: parsedPrice !== null ? `${new Intl.NumberFormat('ar-DZ').format(parsedPrice)} دج` : 'حسب الاتفاق',
        location: location.trim() || 'العوينات',
        condition: condition || 'EXCELLENT',
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || '',
        ownerId: currentUser.id,
        ownerName: currentUser.name || 'معلن في سوق لعوينات',
        images: imageUrls,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };

      // 4. Save to Firestore
      const newListing = await createListingDoc(listingPayload);

      setSuccessMessage('تم نشر إعلانك بنجاح ✓');
      setTimeout(() => {
        onSuccess(newListing);
        onClose();
      }, 1200);

    } catch (err: any) {
      console.error('Publishing Listing Error:', err);
      setErrorMessage(err.message || 'تعذر الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 w-full max-w-md text-center space-y-4 shadow-2xl">
          <h3 className="text-lg font-black text-slate-900">تسجيل الدخول مطلوب</h3>
          <p className="text-slate-600 text-xs font-medium">
            يلزم تسجيل الدخول بمدينة العوينات لتتمكن من نشر إعلانك في المنصة.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-2xl shadow-sm"
            >
              تسجيل الدخول الآن
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-900">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/95 sticky top-0 z-10">
          <h2 className="text-lg font-black text-slate-900">نشر إعلان جديد - سوق لعوينات</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-2xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              عنوان الإعلان *
            </label>
            <input
              type="text"
              placeholder="مثال: سيارة هيونداي أتوس 2012 حالة ممتازة العوينات"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-xs rounded-2xl p-3 border border-slate-200 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف *</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubcategoryId('');
                }}
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-2xl p-3 border border-slate-200 focus:border-orange-500 focus:outline-none"
              >
                {CATEGORIES_DATA.map(c => (
                  <option key={c.id} value={c.id}>{c.nameAr}</option>
                ))}
              </select>
            </div>

            {currentCategory?.subcategories && currentCategory.subcategories.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف الفرعي</label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-2xl p-3 border border-slate-200 focus:border-orange-500 focus:outline-none"
                >
                  <option value="">اختر الفرع (اختياري)</option>
                  {currentCategory.subcategories.map(s => (
                    <option key={s.id} value={s.id}>{s.nameAr}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Price & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                السعر (دج) (اختياري)
              </label>
              <input
                type="text"
                placeholder="28000 أو 28,000 أو ٢٨٠٠٠"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-2xl p-3 border border-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الموقع / الحي</label>
              <input
                type="text"
                placeholder="حي المجاهدين، وسط العوينات..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-2xl p-3 border border-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل الإعلان *</label>
            <textarea
              rows={4}
              placeholder="اكتب وصفاً شاملاً وحقيقياً عن الغرض، الحالة، المواصفات..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-xs rounded-2xl p-3 border border-slate-200 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          {/* Phone & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف *</label>
              <input
                type="tel"
                placeholder="0660000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-2xl p-3 border border-slate-200 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الواتساب (اختياري)</label>
              <input
                type="tel"
                placeholder="0660000000"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-2xl p-3 border border-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">صور الإعلان (حتى 5 صور)</label>
            <div className="border-2 border-dashed border-slate-200/90 rounded-3xl p-5 text-center hover:border-orange-500/50 transition-colors bg-slate-50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="listing-images-input"
              />
              <label htmlFor="listing-images-input" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-orange-600" />
                <span className="text-xs text-slate-800 font-bold">اضغط لاختيار الصور من جهازك</span>
                <span className="text-[10px] text-slate-400">PNG, JPG, WEBP, SVG</span>
              </label>
            </div>

            {/* Preview Selected Images */}
            {previewUrls.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>جارٍ الحفظ والنشر...</span>
                </>
              ) : (
                <span>نشر الإعلان الآن</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
