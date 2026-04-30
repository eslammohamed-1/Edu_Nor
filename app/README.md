# EduNor Web App

واجهة Vue 3 + TypeScript + Vite لمنصة إديو نور.

## التشغيل

```bash
npm install
npm run dev
```

لربط الواجهة بالـ API أنشئ `app/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3001
```

بدون `VITE_API_BASE_URL` تعمل مصادقة Mock في وضع التطوير فقط. في production يجب تشغيل API حقيقي.

## المحتوى

الكتالوج يتولد من CSV:

```bash
cd ..
npm run build:catalog
```

السكربت يولد ملفات مقسمة داخل `app/src/fixtures/demo-catalog/generated/` حتى لا يتم تحميل كل الكتالوج في أول chunk.

## البناء

```bash
npm run build
```
