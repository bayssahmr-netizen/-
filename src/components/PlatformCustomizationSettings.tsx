import React, { useEffect, useState } from 'react';
import { PlatformSettings } from '../types';
import { uploadFileToStorage, deleteFileFromStorageUrl } from '../services/storageService';
import { updatePlatformSettings } from '../services/dbService';
import { Save, Loader2, CheckCircle2, AlertCircle, Trash2, RefreshCw, Upload } from 'lucide-react';

interface Props { settings: PlatformSettings; onSettingsUpdated: (newSettings: PlatformSettings) => void; }

type ImageKind = 'logo' | 'favicon' | 'og';

export const PlatformCustomizationSettings: React.FC<Props> = ({ settings, onSettingsUpdated }) => {
  const [formData, setFormData] = useState<PlatformSettings>({ ...settings });
  const [files, setFiles] = useState<Record<ImageKind, File | null>>({ logo: null, favicon: null, og: null });
  const [remove, setRemove] = useState<Record<ImageKind, boolean>>({ logo: false, favicon: false, og: false });
  const [previews, setPreviews] = useState<Record<ImageKind, string>>({ logo: '', favicon: '', og: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type:'success'|'error';text:string}|null>(null);

  useEffect(() => { setFormData({ ...settings }); }, [settings]);

  const setField = (field: keyof PlatformSettings, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const imageUrl = (kind: ImageKind) => kind === 'logo' ? formData.logoUrl : kind === 'favicon' ? formData.faviconUrl : formData.ogImageUrl;
  const setImageFile = (kind: ImageKind, file: File | null) => {
    setFiles(prev => ({ ...prev, [kind]: file }));
    setRemove(prev => ({ ...prev, [kind]: false }));
    if (previews[kind]) URL.revokeObjectURL(previews[kind]);
    setPreviews(prev => ({ ...prev, [kind]: file ? URL.createObjectURL(file) : '' }));
  };

  const chooseFile = (kind: ImageKind, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    const allowed = ['image/png','image/jpeg','image/jpg','image/webp','image/svg+xml'];
    if (!allowed.includes(file.type.toLowerCase())) { setStatusMessage({type:'error', text:'نوع الصورة غير مدعوم. استخدم PNG أو JPG أو JPEG أو WEBP أو SVG.'}); return; }
    if (file.size > 10 * 1024 * 1024) { setStatusMessage({type:'error', text:'حجم الصورة يجب ألا يتجاوز 10 ميغابايت.'}); return; }
    setImageFile(kind, file);
  };

  const removeImage = (kind: ImageKind) => {
    setRemove(prev => ({ ...prev, [kind]: true }));
    setFiles(prev => ({ ...prev, [kind]: null }));
    if (previews[kind]) URL.revokeObjectURL(previews[kind]);
    setPreviews(prev => ({ ...prev, [kind]: '' }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true); setStatusMessage(null);
    const old = { logo: formData.logoUrl, favicon: formData.faviconUrl, og: formData.ogImageUrl };
    try {
      const next = { ...formData };
      // 1) Upload the NEW images first (each with a sane timeout).
      //    If any upload fails, NOTHING is saved and old images stay intact.
      if (files.logo) next.logoUrl = await withTimeout(uploadFileToStorage(files.logo, 'platform/logo'), 30000, 'انتهت مهلة رفع الشعار.');
      if (files.favicon) next.faviconUrl = await withTimeout(uploadFileToStorage(files.favicon, 'platform/favicon'), 30000, 'انتهت مهلة رفع الأيقونة.');
      if (files.og) next.ogImageUrl = await withTimeout(uploadFileToStorage(files.og, 'platform/og'), 30000, 'انتهت مهلة رفع صورة المشاركة.');
      if (remove.logo && !files.logo) next.logoUrl = '';
      if (remove.favicon && !files.favicon) next.faviconUrl = '';
      if (remove.og && !files.og) next.ogImageUrl = '';

      // 2) Save the new URLs to Firestore (with timeout).
      await withTimeout(
        updatePlatformSettings(next),
        15000,
        'انتهت مهلة الحفظ. تحقق من اتصال Firebase وقواعد Firestore/Storage.'
      );

      // Only after the database confirms the new URL/state, old files may be removed.
      if (old.logo && old.logo !== next.logoUrl) await deleteFileFromStorageUrl(old.logo);
      if (old.favicon && old.favicon !== next.faviconUrl) await deleteFileFromStorageUrl(old.favicon);
      if (old.og && old.og !== next.ogImageUrl) await deleteFileFromStorageUrl(old.og);

      setFormData(next); setFiles({logo:null,favicon:null,og:null}); setRemove({logo:false,favicon:false,og:false});
      onSettingsUpdated(next);
      setStatusMessage({type:'success', text:'تم حفظ التغييرات بنجاح ✓'});
    } catch (err: any) {
      console.error('Platform settings save error:', err);
      setStatusMessage({type:'error', text:`فشل الحفظ: ${err?.message || 'تعذر حفظ الإعدادات'}`});
    } finally { setIsSaving(false); }
  };

  const ImageManager = ({kind,label}: {kind:ImageKind;label:string}) => {
    const current = imageUrl(kind); const preview = previews[kind];
    return <div className="space-y-2 p-3 bg-white rounded-2xl border border-slate-200">
      <div className="text-xs font-black text-slate-700">{label}</div>
      <div className="h-28 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
        {(preview || (current && !remove[kind])) ? <img src={preview || current} alt={label} className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-slate-400">لا توجد صورة</span>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="cursor-pointer text-center text-[11px] font-bold bg-slate-100 hover:bg-slate-200 rounded-xl py-2">
          <Upload className="w-4 h-4 inline ml-1" />رفع/استبدال
          <input hidden type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={e => chooseFile(kind,e)} />
        </label>
        <button type="button" onClick={() => removeImage(kind)} className="text-[11px] font-bold bg-red-50 hover:bg-red-100 text-red-700 rounded-xl py-2"><Trash2 className="w-4 h-4 inline ml-1" />حذف</button>
      </div>
      {files[kind] && <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1"><RefreshCw className="w-3 h-3"/>معاينة جاهزة، اضغط حفظ لتثبيتها</div>}
    </div>;
  };

  return <form onSubmit={handleSave} className="space-y-6 text-slate-900">
    {statusMessage && <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${statusMessage.type==='success'?'bg-emerald-50 border-emerald-200 text-emerald-800':'bg-red-50 border-red-200 text-red-700'}`}>
      {statusMessage.type==='success'?<CheckCircle2 className="w-5 h-5"/>:<AlertCircle className="w-5 h-5"/>}{statusMessage.text}
    </div>}

    <section className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
      <h3 className="text-sm font-black text-orange-700 border-b border-slate-200 pb-2">مركز التحكم الشامل - هوية ومظهر المنصة</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="اسم المنصة" value={formData.platformName} onChange={v=>setField('platformName',v)} />
        <Field label="الاسم المختصر" value={formData.shortName} onChange={v=>setField('shortName',v)} />
      </div>
      <Field label="الوصف العام" value={formData.description} onChange={v=>setField('description',v)} textarea />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="عنوان الترحيب" value={formData.heroTitle} onChange={v=>setField('heroTitle',v)} />
        <Field label="العنوان الفرعي" value={formData.heroSubtitle} onChange={v=>setField('heroSubtitle',v)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ColorField label="اللون الأساسي" value={formData.primaryColor} onChange={v=>setField('primaryColor',v)} />
        <ColorField label="اللون المساعد" value={formData.accentColor} onChange={v=>setField('accentColor',v)} />
      </div>
    </section>

    <section className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
      <h3 className="text-sm font-black text-orange-700 border-b border-slate-200 pb-2">إدارة الشعار والأيقونات وصورة المشاركة</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><ImageManager kind="logo" label="الشعار Logo"/><ImageManager kind="favicon" label="أيقونة الموقع Favicon"/><ImageManager kind="og" label="صورة المشاركة الاجتماعية OpenGraph"/></div>
      <p className="text-[11px] text-slate-500">الصيغ المسموحة: PNG, JPG, JPEG, WEBP, SVG. الصورة القديمة لا تُحذف إلا بعد نجاح رفع الصورة الجديدة وحفظ رابطها.</p>
    </section>

    <section className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
      <h3 className="text-sm font-black text-orange-700 border-b border-slate-200 pb-2">الاتصال والتذييل</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><Field label="الهاتف" value={formData.contactPhone} onChange={v=>setField('contactPhone',v)}/><Field label="واتساب" value={formData.contactWhatsapp} onChange={v=>setField('contactWhatsapp',v)}/><Field label="البريد الإلكتروني" value={formData.contactEmail} onChange={v=>setField('contactEmail',v)}/></div>
      <Field label="نص التذييل" value={formData.footerText} onChange={v=>setField('footerText',v)}/>
    </section>

    <button type="submit" disabled={isSaving} className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-black text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2">
      {isSaving ? <><Loader2 className="w-5 h-5 animate-spin"/>جارٍ حفظ التغييرات...</> : <><Save className="w-5 h-5"/>حفظ التغييرات</>}
    </button>
  </form>;
};

function Field({label,value,onChange,textarea=false}:{label:string;value:string;onChange:(v:string)=>void;textarea?:boolean}) {
  return <label className="block text-xs font-bold text-slate-700">{label}{textarea?<textarea rows={3} value={value||''} onChange={e=>onChange(e.target.value)} className="mt-1 w-full bg-white text-xs text-slate-900 p-3 rounded-2xl border border-slate-200 focus:border-orange-500 focus:outline-none"/>:<input value={value||''} onChange={e=>onChange(e.target.value)} className="mt-1 w-full bg-white text-xs text-slate-900 p-3 rounded-2xl border border-slate-200 focus:border-orange-500 focus:outline-none"/>}</label>;
}
function ColorField({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) {
  return <label className="block text-xs font-bold text-slate-700">{label}<div className="mt-1 flex gap-2"><input type="color" value={value||'#ea580c'} onChange={e=>onChange(e.target.value)} className="h-11 w-16 rounded-xl"/><input value={value||''} onChange={e=>onChange(e.target.value)} className="flex-1 bg-white text-xs p-3 rounded-2xl border border-slate-200"/></div></label>;
}

/** Rejects with a friendly message if the promise does not settle in time. */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms))
  ]);
}
