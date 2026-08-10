# سوق لعوينات العملاق - Souq El Aouinet Giant

منصة إعلانات مبوبة محلية لمدينة العوينات وولاية تبسة - الجزائر.
أول منصة إعلانات مبوبة محلية مخصصة لسكان العوينات وولاية تبسة.

## التقنيات

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Firebase (Authentication / Firestore / Storage)

## التشغيل محلياً

```bash
npm install
npm run dev       # http://localhost:3000
```

## البناء للإنتاج

```bash
npm run build     # المخرجات في dist/
npm run lint      # فحص TypeScript
```

## النشر على GitHub Pages

عند الدفع إلى فرع `main` يعمل `.github/workflows/deploy-gh-pages.yml` تلقائياً:
`npm ci` ← `npm run build` ← نشر `dist` على GitHub Pages.

## إعداد Firebase المطلوب (خارج الكود)

- نشر `firestore.rules` و `storage.rules` إلى المشروع `light-chicken-wbndl`.
- تفعيل مزودي Authentication (Email/Password إجباري، Google اختياري).
- إضافة نطاقات الإنتاج إلى Authorized Domains في Firebase Console.
- التأكد من وجود قاعدة Firestore المسماة `ai-studio-remixsouqelaouin-0fe7cd01-2dfb-4c4f-9cda-d85ec4a013a9`.

راجع `REPAIR_NOTES.md` للتفاصيل الكاملة عن الإصلاحات.
