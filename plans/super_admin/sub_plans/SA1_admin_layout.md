# SA1: Admin Layout & Navigation | هيكل لوحة الإدارة والتنقل

## 🎯 الهدف
بناء Shell كامل للوحة الإدارة بحيث تكون جميع صفحات `/admin/*` داخل layout مخصّص مع sidebar + topbar + breadcrumbs، ومحمية بـ route guard للسوبر أدمن.

---

## 📦 المهام

### 1.1 — AdminLayout Component
**File:** `src/components/admin/layout/AdminLayout.vue`
- Grid 3 أعمدة: Sidebar (يسار في LTR / يمين في RTL) + Main content
- Topbar ثابت في الأعلى (sticky)
- `<RouterView />` للمحتوى
- Responsive: sidebar drawer في mobile
- Slot للـ Breadcrumbs بين Topbar والمحتوى

### 1.2 — AdminSidebar Component
**File:** `src/components/admin/layout/AdminSidebar.vue`
- Logo + اسم المنصة + badge "سوبر أدمن"
- أقسام Sidebar:
  - Overview: Dashboard
  - Users: Users management, Roles
  - Content: Subjects, Courses, Lessons
  - Assessment: Quizzes, Question Bank
  - Analytics: Dashboard, Reports
  - System: Settings, Branding, Audit Log
- كل رابط مع Lucide icon وactive state
- Collapsible (اختياري) — نفس `TheSidebar.vue` الموجود
- زر "الرجوع للموقع" في الأسفل

### 1.3 — AdminTopbar Component
**File:** `src/components/admin/layout/AdminTopbar.vue`
- Global search (mock لحد الآن)
- Theme toggle
- Notifications dropdown (placeholder بدون منطق حقيقي)
- User menu: عرض بيانات السوبر أدمن + زر logout
- Banner أصفر في حالة impersonation: "أنت تتصفح كـ X — عُد لوضع السوبر أدمن"

### 1.4 — AdminBreadcrumbs Component
**File:** `src/components/admin/layout/AdminBreadcrumbs.vue`
- يبني مسار التنقل من `route.matched` + `route.meta.title`
- Separator `/` أو chevron
- آخر segment غير قابل للنقر
- RTL-aware

### 1.5 — Router Nested Routes
**File:** `src/router/index.ts`
- تحويل `/admin` إلى parent route يستخدم `AdminLayout`
- Children routes:
  - `` (index) → `AdminDashboard`
  - `users`, `users/:id` → User mgmt
  - `subjects`, `courses`, `lessons` → Content
  - `quizzes`, `quizzes/:id/edit` → Quiz mgmt
  - `analytics` → Reports
  - `settings` → Settings
  - `audit` → Audit log
- كل route تحمل `meta.title` و`meta.requiresSuperAdmin: true`

### 1.6 — Route Guard Enhancement
- التأكد أن `beforeEach` يعيد التوجيه لـ `/` عند محاولة مستخدم عادي دخول `/admin/*`
- حفظ `redirect` query param عند الرفض من عدم المصادقة

### 1.7 — Admin Navigation Config
**File:** `src/config/adminNav.ts`
- تصدير مصفوفة أقسام Sidebar كـ data (title, links, icons, permissions)
- تسهيل إضافة/إخفاء روابط لاحقاً حسب الصلاحية

### 1.8 — Admin Styles
**File:** `src/assets/css/admin.css` (أو scoped داخل المكونات)
- Tokens خاصة بـ admin (سعة الـ sidebar، ألوان البانر)
- Utility classes: `.admin-panel`, `.admin-section`
- Dark mode friendly

---

## ✅ Acceptance Criteria
- [ ] `/admin` يعرض `AdminLayout` كامل (Sidebar + Topbar + Content)
- [ ] كل روابط الـ sidebar تعمل وتُظهر active state
- [ ] Breadcrumbs تتحدّث مع كل صفحة
- [ ] غير السوبر أدمن يُعاد توجيهه للرئيسية
- [ ] Responsive يعمل على الموبايل (drawer sidebar)
- [ ] Dark mode يعمل
- [ ] Build نظيف (لا أخطاء TS)
