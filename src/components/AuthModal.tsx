import React, { useState } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase';
import { createOrUpdateUserProfile } from '../services/dbService';
import { UserProfile } from '../types';
import { X, LogIn, UserPlus, LogOut, Loader2, AlertCircle, ShieldAlert, CheckCircle2, Check } from 'lucide-react';

interface AuthModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  onUserChanged: (user: UserProfile | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onClose,
  onUserChanged
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unauthorizedDomain, setUnauthorizedDomain] = useState(false);
  const [operationNotAllowed, setOperationNotAllowed] = useState(false);

  // Profile editing state (user can edit only allowed personal fields)
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const startEditingProfile = () => {
    if (!currentUser) return;
    setEditName(currentUser.name || '');
    setEditPhone(currentUser.phone || '');
    setEditWhatsapp(currentUser.whatsapp || '');
    setProfileMsg(null);
    setEditingProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!editName.trim()) {
      setProfileMsg({ type: 'error', text: 'الاسم لا يمكن أن يكون فارغاً' });
      return;
    }
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const updated = await createOrUpdateUserProfile({
        id: currentUser.id,
        name: editName.trim(),
        phone: editPhone.trim() || '',
        whatsapp: editWhatsapp.trim() || ''
      });
      onUserChanged(updated);
      setProfileMsg({ type: 'success', text: 'تم حفظ بياناتك الشخصية بنجاح ✓' });
      setTimeout(() => setEditingProfile(false), 900);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setProfileMsg({ type: 'error', text: 'فشل حفظ البيانات. تأكد من اتصالك وحاول مجدداً.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setUnauthorizedDomain(false);
    setOperationNotAllowed(false);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const profile = await createOrUpdateUserProfile({
        id: user.uid,
        name: user.displayName || 'مستخدم جوجل',
        email: user.email || '',
        avatar: user.photoURL || undefined
      });

      onUserChanged(profile);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const errCode = err?.code || '';
      const errMsg = err?.message || '';

      if (errCode === 'auth/unauthorized-domain' || errMsg.includes('unauthorized-domain')) {
        setUnauthorizedDomain(true);
        setError(
          `نطاق المعاينة الحالي (${window.location.hostname}) غير مضاف في قائمة النطاقات المصرح بها (Authorized Domains) في إعدادات Firebase Console.`
        );
      } else if (errCode === 'auth/operation-not-allowed') {
        setOperationNotAllowed(true);
        setError('تسجيل الدخول عبر Google غير مفعّل في وحدة تحكم Firebase Authentication.');
      } else if (errCode === 'auth/popup-blocked') {
        setError('تم حظر النافذة المنبثقة من قِبل المتصفح. يرجى السماح بالنوافذ المنبثقة والمحاولة مجدداً.');
      } else if (errCode === 'auth/popup-closed-by-user') {
        setError('تم إغلاق نافذة تسجيل الدخول قبل إكمال العملية.');
      } else {
        setError(`فشل تسجيل الدخول بجوجل: ${errMsg || 'حدث خطأ غير متوقع'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUnauthorizedDomain(false);
    setOperationNotAllowed(false);

    try {
      if (mode === 'REGISTER') {
        if (!name.trim()) {
          setError('يرجى إدخال الاسم الكامل');
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const profile = await createOrUpdateUserProfile({
          id: userCred.user.uid,
          name: name.trim(),
          email: userCred.user.email || email,
          phone: phone.trim() || undefined
        });
        onUserChanged(profile);
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await createOrUpdateUserProfile({
          id: userCred.user.uid,
          name: userCred.user.displayName || email.split('@')[0],
          email: userCred.user.email || email
        });
        onUserChanged(profile);
      }
      onClose();
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      const code = err?.code || '';
      const msg = err?.message || '';

      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مستخدم بالفعل. يرجى تسجيل الدخول.');
      } else if (code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة جداً. يرجى إدخال 6 أحرف أو أكثر.');
      } else if (code === 'auth/invalid-email') {
        setError('صيغة البريد الإلكتروني غير صحيحة.');
      } else if (code === 'auth/user-disabled') {
        setError('تم تعطيل هذا الحساب من قِبل إدارة المنصة.');
      } else if (code === 'auth/operation-not-allowed') {
        setOperationNotAllowed(true);
        setError('تسجيل الدخول بالبريد الإلكتروني وكلمة المرور غير مفعّل في وحدة تحكم Firebase (Sign-in method -> Email/Password).');
      } else if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setUnauthorizedDomain(true);
        setError(`نطاق المعاينة الحالي (${window.location.hostname}) غير مصرح به في Firebase Console.`);
      } else {
        setError(`فشل العملية: ${msg || 'تأكد من صحة البيانات والاتصال بالإنترنت'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onUserChanged(null);
      onClose();
    } catch (err: any) {
      setError('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-md p-6 relative shadow-2xl text-slate-900">
        
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-2xl"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          /* Profile View */
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-100 border-2 border-orange-300 text-orange-700 flex items-center justify-center font-black text-2xl mx-auto overflow-hidden shadow-xs">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">{currentUser.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{currentUser.email}</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="px-3.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-full">
                  الرتبة: {currentUser.role}
                </span>
                <span className="px-3.5 py-1 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  <span>نشط</span>
                </span>
              </div>
            </div>

            {!editingProfile ? (
              <button
                onClick={startEditingProfile}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <UserPlus className="w-4 h-4 text-orange-600" />
                <span>تعديل بياناتي الشخصية</span>
              </button>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-3 text-right">
                {profileMsg && (
                  <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${profileMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{profileMsg.text}</span>
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 text-xs p-3 rounded-2xl border border-slate-200 focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0660000000"
                    className="w-full bg-slate-50 text-xs p-3 rounded-2xl border border-slate-200 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم الواتساب</label>
                  <input
                    type="tel"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    placeholder="0660000000"
                    className="w-full bg-slate-50 text-xs p-3 rounded-2xl border border-slate-200 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {profileSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>حفظ التغييرات</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-2xl"
                  >
                    إلغاء
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium text-center">
                  الرتبة والحالة لا يمكن تعديلهما من هنا.
                </p>
              </form>
            )}

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        ) : (
          /* Auth Form */
          <div className="space-y-5">
            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900">
                {mode === 'LOGIN' ? 'تسجيل الدخول إلى سوق لعوينات' : 'إنشاء حساب جديد'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                المنصة الإلكترونية المحلية لأهالي مدينة العوينات
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{error}</span>
                </div>

                {unauthorizedDomain && (
                  <div className="p-2.5 bg-white/80 rounded-xl border border-amber-300 text-[11px] text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                      <span>طريقة حل المشكلة في Firebase Console:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-0.5 text-slate-700">
                      <li>افتح <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-bold text-orange-600">Firebase Console</a></li>
                      <li>انتقل إلى <b>Authentication</b> {'->'} <b>Settings</b> {'->'} <b>Authorized Domains</b></li>
                      <li>اضغط <b>Add Domain</b> وأضف النطاق: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-orange-800">{window.location.hostname}</code></li>
                    </ol>
                  </div>
                )}

                {operationNotAllowed && (
                  <div className="p-2.5 bg-white/80 rounded-xl border border-amber-300 text-[11px] text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                      <span>طريقة التفعيل في Firebase Console:</span>
                    </div>
                    <p className="text-slate-700">
                      انتقل إلى <b>Firebase Console</b> {'->'} <b>Authentication</b> {'->'} <b>Sign-in method</b> وقم بتفعيل <b>Email/Password</b> و<b>Google</b>.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl border border-slate-200 flex items-center justify-center gap-2 transition-all shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>الدخول عبر حساب Google الرسمي</span>
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] text-slate-400 absolute font-bold">أو البريد الإلكتروني</span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === 'REGISTER' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                    <input
                      type="text"
                      placeholder="مثال: عبد الحق غولام مراحي"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 text-xs p-3 rounded-2xl border border-slate-200 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">الهاتف (اختياري)</label>
                    <input
                      type="tel"
                      placeholder="0661234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 text-xs p-3 rounded-2xl border border-slate-200 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 text-xs p-3 rounded-2xl border border-slate-200 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">كلمة المرور *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 text-xs p-3 rounded-2xl border border-slate-200 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'LOGIN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{mode === 'LOGIN' ? 'تسجيل الدخول' : 'إنشاء الحساب الآن'}</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                className="text-xs text-orange-600 font-bold hover:underline"
              >
                {mode === 'LOGIN' ? 'ليس لديك حساب؟ اضغط للإنشاء' : 'لديك حساب بالفعل؟ اضغط للدخول'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
