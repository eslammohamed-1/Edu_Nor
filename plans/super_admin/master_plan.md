# EduNor — Super Admin Master Plan | الخطة الرئيسية لحساب السوبر أدمن

## 🎯 Overview

خطة شاملة لبناء **لوحة تحكم السوبر أدمن** (Super Admin Console) في منصة EduNor.
السوبر أدمن هو المستخدم الأعلى صلاحيةً — له **تحكّم كامل** في المستخدمين، المحتوى، الاختبارات، الإعدادات، المالية، وسجل التدقيق.

## 👤 الدور والصلاحيات

| الحقل | القيمة |
|--------|---------|
| **الدور (Role)** | `super_admin` |
| **المسار** | `/admin/*` |
| **الحماية** | `meta.requiresSuperAdmin` + route guard |
| **الصلاحيات** | كل شيء (bypasses `permissions[]`) |
| **الدخول** | بيانات محدّدة من `config/superAdmin.ts` + `.env` |

> [!IMPORTANT]
> حالياً التنفيذ **Mock فقط** (localStorage). عند وجود backend حقيقي لازم تتحول كل العمليات إلى API calls مع JWT/refresh tokens وHTTPS.

---

## 🧱 ما تم إنجازه مسبقاً (Baseline)

| العنصر | الملف | الحالة |
|---------|--------|--------|
| نوع الدور `UserRole` | `src/types/auth.ts` | ✅ |
| Super admin credentials config | `src/config/superAdmin.ts` | ✅ |
| Auth store + `isSuperAdmin` | `src/stores/auth.ts` | ✅ |
| Permissions helpers (`can`, `PERMISSIONS`) | `src/lib/permissions.ts` | ✅ |
| Route guard `requiresSuperAdmin` | `src/router/index.ts` | ✅ |
| صفحة `/admin` بسيطة | `src/views/AdminPage.vue` | ✅ (مبدئية) |
| روابط Navbar للسوبر أدمن | `src/components/layout/TheNavbar.vue` | ✅ |

الخطة الحالية **تبني فوق** هذا الأساس وتحوّل `/admin` إلى لوحة تحكم كاملة.

---

## 🏗️ Phases Overview

| Phase | الاسم | الوصف | الأولوية | التقدير |
|-------|-------|-------|---------|---------|
| **SA1** | Admin Layout & Navigation | Shell، Sidebar، Breadcrumbs، Guards | 🔴 Critical | 1-2 days |
| **SA2** | Admin Dashboard | نظرة عامة + KPIs + charts + widgets | 🔴 Critical | 2 days |
| **SA3** | User Management | CRUD للمستخدمين + أدوار + حظر + impersonate | 🔴 Critical | 3 days |
| **SA4** | Content Management | إدارة المواد/الكورسات/الفصول/الدروس | 🔴 Critical | 3-4 days |
| **SA5** | Quiz Management | CRUD للاختبارات والأسئلة + import/export | 🟡 High | 2-3 days |
| **SA6** | Analytics & Reports | إحصائيات + تقارير + تصدير CSV/PDF | 🟡 High | 2 days |
| **SA7** | Settings & Branding | إعدادات المنصة + theme + SEO + integrations | 🟢 Medium | 1-2 days |
| **SA8** | Audit & Security | سجل تدقيق + جلسات + 2FA (mock) + backup | 🟢 Medium | 1-2 days |

**Total Estimate: ~16-22 days**

---

## 📋 Phase Summaries

### SA1: Admin Layout & Navigation
- `AdminLayout.vue` — shell للإدارة (Sidebar + Topbar + Content + Breadcrumbs)
- `AdminSidebar.vue` — تنقل شجري مع أيقونات Lucide
- `AdminTopbar.vue` — بحث عام + إشعارات + زر impersonate/exit
- `AdminBreadcrumbs.vue` — مسار تنقل ديناميكي من `route.meta`
- توسيع Router بـ children routes تحت `/admin/*`
- Route guard: كل `/admin/*` تتطلب `super_admin`

### SA2: Admin Dashboard
- KPIs: إجمالي المستخدمين / الكورسات / الاختبارات / الإيرادات
- Chart: تسجيلات يومية (line) + إكمال الدروس (bar)
- قائمة أحدث المستخدمين + أحدث الاختبارات
- Quick actions: إنشاء مستخدم / مادة / اختبار
- Empty + loading states (skeletons)

### SA3: User Management
- جدول مستخدمين مع pagination + search + filters (role/status/grade)
- Create / Edit / Delete user modals مع validation
- تغيير الدور: student ↔ admin ↔ super_admin
- Permissions editor (للـ admin فقط — chips/checkboxes)
- حظر/إلغاء حظر + reset password
- Impersonate (دخول كمستخدم آخر مع banner تحذيري وزر عودة)
- CSV import/export للمستخدمين

### SA4: Content Management
- إدارة المواد (Subjects): CRUD + تحديد Stages + Icon picker
- إدارة الكورسات: CRUD + ربط بمادة وصف/Grade/Instructor/Thumbnail
- إدارة الفصول (Chapters): drag reorder + CRUD
- إدارة الدروس: CRUD + محرر WYSIWYG مبسّط (textarea + preview) + videoUrl + keyPoints + duration
- Bulk actions + publish/unpublish

### SA5: Quiz Management
- جدول اختبارات + CRUD
- Question Builder: دعم كل الأنواع الـ 13 من `skill/question_structures.md` (على الأقل MCQ/MRQ/Input/String في هذه المرحلة)
- Bulk import من JSON (باستعمال عينات `skill/question_samples/`)
- Preview mode (كما يراها الطالب)
- Duplicate quiz + archive

### SA6: Analytics & Reports
- لوحات إحصائية بمقاييس زمنية (آخر 7/30/90 يوم)
- تقارير: أفضل المواد، أفضل الطلاب، معدل الإكمال، متوسط الدرجات
- تصدير PDF/CSV
- Funnel: تسجيل → إكمال أول درس → إنجاز اختبار

### SA7: Settings & Branding
- إعدادات عامة (اسم المنصة، الإيميل، الهاتف، العنوان)
- Branding: logo, favicon, primary/gold colors (live preview)
- SEO: default title/description/OG image
- Integrations: Google Analytics, Meta Pixel, SMTP (mock)
- Maintenance mode toggle
- تسجيل خدمة Pinia `settings` + persist

### SA8: Audit & Security
- Audit log: جدول للإجراءات الحساسة (who/what/when/ip)
- Sessions: عرض الجلسات النشطة للسوبر أدمن + إلغاء جلسة
- 2FA toggle (mock QR)
- Password policy (طول، تعقيد، مدة صلاحية)
- Backup/Restore (تصدير/استيراد localStorage كـ JSON لاستبداله لاحقاً بـ API)

---

## 🔗 Sub Plans & Tickets

| Phase | Sub Plan | Tickets |
|-------|----------|---------|
| SA1 | [sub_plans/SA1_admin_layout.md](./sub_plans/SA1_admin_layout.md) | [tickets/SA1_tickets.csv](./tickets/SA1_tickets.csv) |
| SA2 | [sub_plans/SA2_admin_dashboard.md](./sub_plans/SA2_admin_dashboard.md) | [tickets/SA2_tickets.csv](./tickets/SA2_tickets.csv) |
| SA3 | [sub_plans/SA3_user_management.md](./sub_plans/SA3_user_management.md) | [tickets/SA3_tickets.csv](./tickets/SA3_tickets.csv) |
| SA4 | [sub_plans/SA4_content_management.md](./sub_plans/SA4_content_management.md) | [tickets/SA4_tickets.csv](./tickets/SA4_tickets.csv) |
| SA5 | [sub_plans/SA5_quiz_management.md](./sub_plans/SA5_quiz_management.md) | [tickets/SA5_tickets.csv](./tickets/SA5_tickets.csv) |
| SA6 | [sub_plans/SA6_analytics_reports.md](./sub_plans/SA6_analytics_reports.md) | [tickets/SA6_tickets.csv](./tickets/SA6_tickets.csv) |
| SA7 | [sub_plans/SA7_settings_branding.md](./sub_plans/SA7_settings_branding.md) | [tickets/SA7_tickets.csv](./tickets/SA7_tickets.csv) |
| SA8 | [sub_plans/SA8_audit_security.md](./sub_plans/SA8_audit_security.md) | [tickets/SA8_tickets.csv](./tickets/SA8_tickets.csv) |

---

## 🔐 Permissions Reference

تعريف الصلاحيات موجود في `src/lib/permissions.ts`. السوبر أدمن يملكها **كلها** تلقائياً عبر `can()`.

| Permission | الوصف |
|------------|-------|
| `users:read` | عرض المستخدمين |
| `users:write` | إنشاء/تعديل |
| `users:delete` | حذف/حظر |
| `content:read` | عرض محتوى الإدارة |
| `content:write` | إنشاء/تعديل مواد وكورسات ودروس |
| `content:delete` | حذف محتوى |
| `analytics:read` | عرض التقارير |
| `settings:write` | تعديل إعدادات المنصة |
| `billing:read` | عرض المالية |
| `audit:read` | قراءة سجل التدقيق |

---

## 📁 Folder Target Structure

```
app/src/
├── views/admin/
│   ├── AdminDashboard.vue         # SA2
│   ├── AdminUsers.vue             # SA3
│   ├── AdminUserDetail.vue        # SA3
│   ├── AdminSubjects.vue          # SA4
│   ├── AdminCourses.vue           # SA4
│   ├── AdminLessons.vue           # SA4
│   ├── AdminQuizzes.vue           # SA5
│   ├── AdminQuizBuilder.vue       # SA5
│   ├── AdminAnalytics.vue         # SA6
│   ├── AdminSettings.vue          # SA7
│   └── AdminAudit.vue             # SA8
├── components/admin/
│   ├── layout/
│   │   ├── AdminLayout.vue        # SA1
│   │   ├── AdminSidebar.vue       # SA1
│   │   ├── AdminTopbar.vue        # SA1
│   │   └── AdminBreadcrumbs.vue   # SA1
│   ├── shared/
│   │   ├── DataTable.vue          # Reusable
│   │   ├── StatCard.vue
│   │   ├── FilterBar.vue
│   │   └── ConfirmDialog.vue
│   ├── users/
│   │   ├── UserForm.vue           # SA3
│   │   └── RoleBadge.vue
│   ├── content/
│   │   ├── SubjectForm.vue        # SA4
│   │   ├── CourseForm.vue
│   │   └── LessonEditor.vue
│   ├── quiz/
│   │   └── QuestionBuilder.vue    # SA5
│   └── analytics/
│       └── KpiChart.vue           # SA6
├── stores/admin/
│   ├── adminUsers.ts              # SA3
│   ├── adminContent.ts            # SA4
│   ├── adminQuizzes.ts            # SA5
│   ├── adminSettings.ts           # SA7
│   └── adminAudit.ts              # SA8
└── composables/
    └── useImpersonate.ts          # SA3
```

---

## ⚙️ Technical Notes

- **State persistence:** كل الـ admin stores تحفظ snapshot في localStorage لحين وجود backend.
- **Confirmation:** أي إجراء destructive (حذف/حظر/تغيير role) يتطلب `ConfirmDialog`.
- **Audit trail:** كل action في admin stores ينادي `adminAudit.log(action, target, meta)`.
- **Accessibility:** كل الجداول والـ forms لازم يدعموا keyboard nav + ARIA labels.
- **RTL first:** كل مكونات الإدارة تلتزم بـ `direction: rtl` والـ logical properties.
- **i18n ready:** كل النصوص في template (بدون string literals في logic) تسهيلاً للترجمة لاحقاً.

---

## ✅ Definition of Done (لكل Phase)

- [ ] كل التذاكر في CSV الخاصة بها = `done`
- [ ] build نجح (`npm run build`) بدون أخطاء TS
- [ ] الراوت محمي بـ `requiresSuperAdmin`
- [ ] UI responsive (mobile/tablet/desktop)
- [ ] Dark mode works
- [ ] Empty/loading/error states موجودة
- [ ] Actions مؤرّشفة في Audit log
