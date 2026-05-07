# U10 — Mobile, PWA & Offline | الموبايل والـ PWA والوضع غير المتصل

## 🎯 الهدف

تحويل المنصة لـ **Progressive Web App** قابلة للتثبيت على الموبايل، مع **offline support** للدروس والاختبارات السبق تنزيلها، **push notifications**، وتحسينات شاملة لـ **mobile-first UX**.

---

## 🧱 المهام

### 10.1 — PWA Foundation
- dependency: `vite-plugin-pwa`.
- `manifest.webmanifest`:
  - name, short_name, theme_color, background_color
  - icons (192, 512, maskable)
  - display: standalone, dir: rtl
  - shortcuts: quick links لـ /subjects و /quiz
- service worker via Workbox:
  - precache static assets (offline app shell).
  - runtime cache: API GETs بـ stale-while-revalidate.
- "Install app" button في الواجهة (يستخدم `beforeinstallprompt`).

### 10.2 — Offline Lessons Cache
- composable `useOfflineLesson()`:
  - download lesson content + thumbnail + first quiz preview.
  - store in IndexedDB (via `idb-keyval`).
  - badge "متاح بدون إنترنت" على lesson card.
- offline detection (`navigator.onLine` + ping).
- UI: "أنت غير متصل — هذه دروس متاحة" mode.

### 10.3 — Push Notifications
- Web Push API + VAPID keys.
- backend endpoint `POST /api/v1/me/push/subscribe`.
- types:
  - lesson published in subscribed subjects.
  - certificate issued.
  - streak warning (day late).
- in-app permission prompt UX (مش aggressive — بعد ٣ زيارات).

### 10.4 — Mobile-First Polish
- audit شامل لكل breakpoint < 768px:
  - admin tables → cards stack.
  - long forms → step accordion.
  - quiz sidebar → bottom drawer.
  - footer compressed.
- touch targets ≥ 44px.
- swipe gestures في quiz (next/prev question).
- bottom sheet لـ filters في AdminUsers/Lessons.

### 10.5 — Image Optimization for Mobile
- `<picture>` بـ srcset متعدد resolutions.
- lazy loading native + `loading="lazy"`.
- LQIP (low-quality image placeholder) مع blur-up.

### 10.6 — Network-aware UX
- استخدام `navigator.connection.effectiveType`:
  - على 2G/slow-3G: low-quality video by default + warning.
  - prefetch روابط فقط على 4G+.

### 10.7 — Battery & Data Saver
- option في settings الطالب:
  - disable autoplay video.
  - reduce animations.
  - download videos at lower res.

### 10.8 — App Update Flow
- service worker يكتشف نسخة جديدة → toast "تحديث متاح، اضغط للتحديث الآن".
- skip waiting + reload عند الموافقة.
- changelog modal بعد التحديث.

### 10.9 — Mobile Admin (light)
- AdminLayout يصبح drawer على الموبايل.
- صفحات أدمن الأساسية (Users/Lessons) responsive كامل.
- features ثقيلة (QuizBuilder) تظهر تنبيه "الأفضل من جهاز أكبر".

### 10.10 — App Store Wrappers (اختياري)
- تجهيز Capacitor إذا قرّرنا نشر على Play Store.
- أو PWABuilder لتسهيل النشر بدون كود native.
- documentation فقط في هذه المرحلة، التنفيذ خارج الـ V2.

---

## ✅ Acceptance Criteria
- [ ] Lighthouse PWA category ≥ 95.
- [ ] التطبيق يثبّت على iOS Safari + Android Chrome.
- [ ] قطع الإنترنت → الواجهة تعرض app shell + الدروس المخزّنة.
- [ ] push notification تجريبية تصل لـ Android.
- [ ] اختبار يدوي على Moto G4 emulator: TTI < 5s.
- [ ] swipe في quiz يعمل بدون lag.

---

## 🔗 ملفات

```
app/vite.config.ts                              # vite-plugin-pwa
app/public/manifest.webmanifest                 # generated
app/public/icons/*.png                          # PWA icons
app/src/composables/useOfflineLesson.ts         # جديد
app/src/composables/useOnlineStatus.ts          # جديد
app/src/composables/usePushNotifications.ts     # جديد
app/src/components/common/InstallPrompt.vue     # جديد
app/src/components/common/UpdateAvailableBanner.vue # جديد
server/src/routes/me/push.ts                    # جديد
server/src/lib/webpush.ts                       # جديد
app/src/views/SettingsPage.vue                  # data saver section
app/src/components/quiz/QuizQuestion.vue        # swipe support
docs/pwa-deployment.md                          # جديد
```
