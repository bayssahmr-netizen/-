import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { fetchUserProfile, createOrUpdateUserProfile } from '../services/dbService';
import { UserProfile } from '../types';
import { ShieldCheck, Mail, Lock, LogIn, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface AdminLoginPageProps {
  onSuccess: (user: UserProfile) => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onSuccess,
  onNavigateHome
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCred.user;

      // Fetch user profile from Firestore
      let profile = await fetchUserProfile(firebaseUser.uid);
      if (!profile) {
        profile = await createOrUpdateUserProfile({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'مدير النظام',
          email: firebaseUser.email || email.trim()
        });
      }

      // Check role
      if (['OWNER', 'SUPER_ADMIN', 'ADMIN'].includes(profile.role)) {
        onSuccess(profile);
      } else {
        setError('هذا الحساب لا يملك صلاحية دخول لوحة الإدارة.');
      }
    } catch (err: any) {
      console.error('Admin Login Error:', err);
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (code === 'auth/invalid-email') {
        setError('صيغة البريد الإلكتروني غير صحيحة.');
      } else {
        setError(`حدث خطأ أثناء تسجيل الدخول: ${err.message || 'حاول مرة أخرى.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 dir-rtl text-slate-100">
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-orange-600/20 border border-orange-500/40 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">تسجيل دخول الإدارة - سوق لعوينات</h2>
          <p className="text-xs text-slate-400 font-medium">
            خاص بالمالك ومدراء النظام والمسؤولين التنفيذيين
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-950/80 border border-red-800 text-red-200 rounded-2xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="font-bold leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني للمدير *</label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin@souqelaouinet.dz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 text-white text-xs rounded-2xl p-3 pr-10 focus:border-orange-500 focus:outline-none"
                required
              />
              <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة المرور *</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 text-white text-xs rounded-2xl p-3 pr-10 focus:border-orange-500 focus:outline-none"
                required
              />
              <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>تسجيل الدخول للوحة الإدارة</span>
          </button>
        </form>

        {/* Footer actions */}
        <div className="pt-2 text-center border-t border-slate-700/60">
          <button
            onClick={onNavigateHome}
            className="text-xs text-slate-400 hover:text-white font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة إلى الصفحة الرئيسية للمنصة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
