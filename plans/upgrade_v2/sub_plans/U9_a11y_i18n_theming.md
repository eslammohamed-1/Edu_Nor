# U9 — Accessibility, i18n & Theming V2 | الوصولية والتدويل والثيم

## 🎯 الهدف

تحقيق **WCAG 2.1 AA** لكل صفحات المنصة، بناء **i18n infrastructure** حقيقي بدون hard-coded strings، توحيد **dark mode** عبر كل الـ views، ودعم **RTL/LTR** ديناميكياً.

---

## 🧱 المهام

### 9.1 — i18n Infrastructure
- dependency: `vue-i18n@9` (Composition API).
- structure:
  ```
  app/src/i18n/
  ├── index.ts
  ├── ar.json
  └── en.json
  ```
- نقل كل النصوص العربية الموجودة في templates إلى `ar.json`.
- مفاتيح هرمية: `nav.home`, `auth.login.title`, إلخ.
- composable `useT()` غلاف لـ `useI18n`.
- toggle لغة في AdminTopbar + Settings للطالب.
- HTML lang attribute يتحدّث ديناميكياً + `dir`.

### 9.2 — RTL/LTR Dynamic
- CSS logical properties (موجود جزئياً) يكتمل لكل المكوّنات.
- اختبار automated يقلّب `dir="ltr"` ويتأكد لا breakage.
- icons بتنعكس حيث منطقي (chevrons، أسهم تنقل).

### 9.3 — Dark Mode V2
- audit كل الـ views:
  - استبدال أي `color: white` صريح بـ `var(--color-on-surface)`.
  - شاشات تجمع بين الفاتح والغامق (مثل modals) لازم تحترم theme.
- toggle أوتوماتيكي يتبع `prefers-color-scheme` بالافتراضي.
- persist preference في localStorage + sync to backend (لو مسجل دخول).

### 9.4 — A11y Foundations
- semantic HTML: `<button>` بدل `<div>` للنقرات، `<nav>` للقوائم، `<main>` لكل صفحة.
- ARIA labels حيث الأيقونات بدون نص.
- focus management:
  - focus trap في modals (`<dialog>` element).
  - skip-to-content link في كل صفحة.
  - visible focus ring متّسق (لون brand).
- color contrast ratio ≥ 4.5:1 لكل النصوص.

### 9.5 — Keyboard Navigation
- كل interactive element يدعم Enter / Space.
- DataTable: arrow keys للتنقل بين rows + sort بـ Enter على الـ headers.
- Modal: Esc يغلق + Tab loop داخل المحتوى.
- forms: Submit بـ Enter + Tab order منطقي.

### 9.6 — Screen Reader Testing
- اختبار يدوي بـ NVDA / VoiceOver.
- live regions للـ toasts (`aria-live="polite"`).
- error messages مرتبطة بـ inputs (`aria-describedby`).
- progress bar `role="progressbar"` + `aria-valuenow`.

### 9.7 — Reduced Motion
- احترام `prefers-reduced-motion` في كل animations (موجود جزئياً).
- alternative للـ shimmer skeleton (fade فقط).
- carousels مع pause control.

### 9.8 — Automated A11y Checks
- `axe-core` integrated في Playwright tests.
- script `npm run a11y` يفحص كل الـ routes الأساسية.
- CI يفشل لو فيه violation حرج.

### 9.9 — Theme Customization (للأدمن)
- صفحة `AdminBranding.vue`:
  - color picker للـ primary/gold/teal (مع contrast warning).
  - logo upload (يعتمد على U4).
  - favicon upload.
  - preview live.
- يحفظ في `Setting('branding')` ويُطبَّق ديناميكياً عبر CSS variables runtime.

### 9.10 — Print Styles
- styles خاصة للطباعة على Certificates و Reports و Quiz Results.
- إخفاء nav/sidebar.
- أبيض/أسود واضح.

---

## ✅ Acceptance Criteria
- [ ] axe لا يرجع violations حرجة على ٥ صفحات أساسية.
- [ ] تبديل اللغة EN ↔ AR يعمل بدون reload + dir يتحدّث.
- [ ] dark mode متّسق على ٣٠ صفحة.
- [ ] keyboard فقط بيقدر يكمل تجربة كاملة (login → quiz → submit).
- [ ] color contrast فحص يدوي على ١٠ مكوّنات نجح.
- [ ] reduced-motion يعطّل كل animations اللي مش ضرورية.
- [ ] AdminBranding يطبّق ألوان جديدة على الموقع كله live.

---

## 🔗 ملفات

```
app/src/i18n/index.ts                           # جديد
app/src/i18n/ar.json                            # جديد
app/src/i18n/en.json                            # جديد
app/src/composables/useT.ts                     # جديد
app/src/composables/useTheme.ts                 # ترقية
app/src/composables/useDirection.ts             # جديد
app/src/views/admin/AdminBranding.vue           # جديد
app/src/components/common/SkipLink.vue          # جديد
app/src/components/common/LangToggle.vue        # جديد
app/src/assets/css/print.css                    # جديد
app/src/components/admin/shared/DataTable.vue   # keyboard nav
app/src/components/common/AppModal.vue          # focus trap
e2e/a11y.spec.ts                                # axe tests
```
