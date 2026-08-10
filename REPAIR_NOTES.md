# إصلاحات سوق لعوينات العملاق (نسخة الإنتاج)

هذه النسخة تمت مراجعتها وإصلاحها بالكامل للعمل في **Production** وليس فقط داخل Preview.

## الملفات التي تم تعديلها

| الملف | التعديل |
| --- | --- |
| `vite.config.ts` | إضافة `base: './'` حتى تعمل الأصول تحت أي مسار استضافة فرعي (`/hako/` في GitHub Pages، Cloud Run، Firebase Hosting). |
| `index.html` | تصحيح OpenGraph كقيم افتراضية (title / description / url / image)، تغيير المسارات المطلقة `/...` إلى نسبية `./...`. |
| `public/manifest.webmanifest` | `start_url` و `scope` والمسارات أصبحت نسبية `./` لتعمل تحت مسار فرعي. |
| `public/sw.js` | استراتيجية Network-First مع تخزين كل استجابة ناجحة في الكاش، فلا تظهر نسخة HTML قديمة بلا نهاية، مع fallback لـ `index.html`. |
| `public/404.html` | (جديد) إعادة توجيه المسارات العميقة مثل `/admin` إلى جذر التطبيق عند التحديث على GitHub Pages. |
| `src/App.tsx` | تسجيل خروج حقيقي من Firebase (`signOut`) بدل مسح الحالة فقط، وتسجيل Service Worker بمسار نسبي. |
| `src/services/dbService.ts` | إصلاح خطأ كان يكتب اسم البريد/الافتراضي فوق اسم المستخدم عند كل تسجيل دخول؛ الآن تُحفظ بيانات المستخدم الموجودة ما لم تُمرَّر قيمة جديدة صراحة. |
| `src/components/AuthModal.tsx` | إضافة تعديل البيانات الشخصية (الاسم، الهاتف، الواتساب) — بدون صلاحية تغيير الرتبة أو الحالة. |
| `src/components/AddListingModal.tsx` | التحقق من نوع الصورة (PNG/JPG/JPEG/WEBP/SVG) وحجمها (10MB) عند الاختيار برسالة واضحة؛ السعر اختياري دائماً. |
| `src/components/PlatformCustomizationSettings.tsx` | إضافة مهلة زمنية (timeout) لعمليات رفع الصور أيضاً (30 ثانية) وللحفظ (15 ثانية) مع `loading / success / error / finally`. |
| `src/components/AdminDashboard.tsx` | تصحيح أرقام الإحصائيات الوهمية، ونص صادق لحالة الاتصال بدل «Production Ready» غير المؤكدة. |
| `src/data/initialData.ts` | الوصف الافتراضي أصبح: «أول منصة إعلانات مبوبة محلية مخصصة لسكان العوينات وولاية تبسة.» ومسار favicon نسبي. |
| `firestore.rules` | منع المستخدم العادي من تغيير `role` **و** `status` لنفسه (إضافة شرط ثابت للحالة). |
| `storage.rules` | تصحيح اسم قاعدة بيانات Firestore المستخدمة في فحص صلاحية المدير (كان `(default)` والمنصة تستخدم قاعدة بيانات مسماة). |
| `.github/workflows/deploy-gh-pages.yml` | (جديد بدل Jekyll) بناء التطبيق بـ `npm ci && npm run build` ونشر `dist` على GitHub Pages. |

## أخطاء تم إصلاحها

1. **`Function setDoc() called with invalid data... undefined`** — تم التحقق من أن كل عمليات الكتابة تمر عبر `cleanForFirestore()` المركزية (listings، users، settings، banners، reports، sellers، orders، deliveryRates، adminLogs)، وبناء نموذج الإعلان يرسل `''` بدل `undefined` لكل الحقول الاختيارية.
2. **زر «حفظ وجار النشر الآن...» بلا نهاية** — كل عملية حفظ الآن لها مهلة زمنية و`finally` يعيد تفعيل الزر مع رسالة نجاح/فشل.
3. **رفع الصور:** الترتيب الصحيح: رفع الجديدة ← نجاح الرفع ← الحصول على URL ← الحفظ في Firestore ← تحديث الواجهة ← حذف القديمة. عند فشل الرفع لا تُحذف القديمة.
4. **تسجيل الخروج:** كان يمسح الحالة محلياً فقط ويبقى المستخدم مسجلاً في Firebase — أصبح `signOut()` فعلياً.
5. **الاسم يُستبدل عند كل دخول** — أصبح يُحفظ.
6. **الأصول لا تعمل تحت مسار فرعي** — أصبح `base: './'` والمسارات كلها نسبية.
7. **PWA** — manifest و start_url و icons صحيحة ونسبية، وSW لا يعرض نسخة قديمة للأبد.
8. **قواعد Firestore/Storage** — منع المستخدم من تغيير role/status لنفسه، وفحص دور المدير في Storage يستخدم قاعدة البيانات الصحيحة.

## الأمور التي لا يمكن إصلاحها من داخل الكود (إعداد Firebase خارجي مطلوب)

1. **نشر القواعد فعلياً** إلى مشروع Firebase `light-chicken-wbndl`:
   - `firebase deploy --only firestore:rules` (ملف `firestore.rules`)
   - `firebase deploy --only storage:rules` (ملف `storage.rules`)
2. **تفعيل مزودي Authentication:** Email/Password (إجباري)، وGoogle (اختياري) من Firebase Console ← Authentication ← Sign-in method.
3. **إضافة نطاقات الإنتاج إلى Authorized Domains** في إعدادات Authentication:
   - `bayssahmr-netizen.github.io` (نطاق GitHub Pages)
   - أي نطاق استضافة آخر يُستخدم.
4. **التأكد من وجود قاعدة بيانات Firestore المسماة** `ai-studio-remixsouqelaouin-0fe7cd01-2dfb-4c4f-9cda-d85ec4a013a9` في المشروع (لأن `firebase.ts` يستخدمها صراحة)، أو تعديل `firebase-applet-config.json` و`storage.rules` حسب القاعدة الفعلية.
5. **رفع أول إعلان** أو السماح للمدير بتغيير إعدادات المنصة حتى يُنشأ مستند `settings/platform` (كتابة الإعدادات للمدير فقط حسب القواعد).
6. **حساب المدير الأساسي:** `bayssahmr@gmail.com` — عند أول تسجيل دخول به يُمنح دور `OWNER` تلقائياً (كوداً وقواعداً).
7. **ملاحظة عن بيانات الاختبار:** لا تُنشأ أي بيانات وهمية تلقائياً في قاعدة البيانات الفارغة؛ الإعلانات التجريبية موجودة فقط كمرجع في `src/data/initialData.ts` ولا تُستخدم في الإنتاج.
