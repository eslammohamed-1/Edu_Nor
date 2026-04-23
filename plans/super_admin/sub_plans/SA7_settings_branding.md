# SA7: Settings & Branding | الإعدادات والهوية البصرية

## 🎯 الهدف
تمكين السوبر أدمن من التحكّم بإعدادات المنصة العامة، الهوية البصرية، SEO، والتكاملات الخارجية (بشكل mock حالياً).

---

## 📦 المهام

### 7.1 — Settings Store
**File:** `src/stores/admin/adminSettings.ts`
- State:
  - `general`: platformName, contactEmail, phone, address, timezone, defaultLocale
  - `branding`: logoUrl, faviconUrl, primaryColor, goldColor, navyColor
  - `seo`: defaultTitle, defaultDescription, ogImageUrl, robots
  - `integrations`: gaId, metaPixelId, smtpHost, smtpUser
  - `features`: maintenanceMode, registrationOpen, publicCatalog
- Actions: `update(section, payload)`, `reset(section)`
- Persist في localStorage + emit events للتطبيق بعد الحفظ

### 7.2 — Settings Page (Tabs)
**File:** `src/views/admin/AdminSettings.vue`
- Tabs أفقية: عام | الهوية | SEO | التكاملات | الميزات
- زر حفظ موحّد (sticky) لكل tab
- Validation قبل الحفظ + toast success

### 7.3 — General Settings Form
- اسم المنصة / الإيميل / الهاتف / العنوان / المنطقة الزمنية / اللغة الافتراضية

### 7.4 — Branding Form
- Logo URL + preview
- Favicon URL + preview
- Color pickers للـ primary / gold / navy
- Live preview: مكوّن AppCard + AppButton يتحدّث فوراً
- زر "استعادة الافتراضي"

### 7.5 — Dynamic Branding Application
- بعد الحفظ: يُحدّث CSS variables في `:root` مباشرة
- Logo/favicon يحدّثان في الـ Navbar و`<link rel=icon>`

### 7.6 — SEO Form
- Default title / description / OG image / robots
- Live preview لصيغة نتائج Google (بطاقة محاكاة)
- تحديث `document.title` و`meta` tags بعد الحفظ

### 7.7 — Integrations Form
- GA ID, Meta Pixel, SMTP (host/port/user/password — password يُعرض مخفياً)
- زر "اختبار الاتصال" (mock، يعرض toast)

### 7.8 — Features / Flags
- Toggles لـ: maintenanceMode، registrationOpen، publicCatalog، darkModeDefault
- عند تفعيل maintenanceMode: overlay عام للطلاب "المنصة قيد الصيانة" (ما عدا السوبر أدمن)

### 7.9 — Backup/Restore Settings
- زر "تصدير الإعدادات" → JSON
- زر "استيراد" يقبل ملفاً ويعيد تطبيقه (مع confirm dialog)

### 7.10 — Audit Integration
- أي تغيير إعداد يُسجّل في audit log مع diff

---

## ✅ Acceptance Criteria
- [ ] كل الـ settings تُحفظ في localStorage وتُحمَّل عند بدء التطبيق
- [ ] Branding colors تنعكس فوراً على كل المكونات
- [ ] Logo/favicon يتحدّثان
- [ ] Maintenance mode يُخفي المحتوى عن الطلاب فقط
- [ ] Backup/Restore يعمل بدون فقد بيانات
- [ ] Audit log يسجّل كل تغيير
