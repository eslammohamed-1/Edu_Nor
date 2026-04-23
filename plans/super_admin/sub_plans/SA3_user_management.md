# SA3: User Management | إدارة المستخدمين

## 🎯 الهدف
CRUD كامل على المستخدمين، تغيير الأدوار، تعديل الصلاحيات، حظر، reset password، ودخول كمستخدم آخر (impersonate).

---

## 📦 المهام

### 3.1 — Admin Users Store
**File:** `src/stores/admin/adminUsers.ts`
- State: `users[]`, `loading`, `error`, `filters`, `pagination`
- Actions: `fetchAll`, `createUser`, `updateUser`, `deleteUser`, `changeRole`, `toggleBan`, `resetPassword`, `updatePermissions`
- Mock: قراءة/كتابة من localStorage تحت مفتاح `edunor.admin.users`
- seed: السوبر أدمن نفسه + 10 طلاب تجريبيين

### 3.2 — DataTable Shared Component
**File:** `src/components/admin/shared/DataTable.vue`
- Props: `columns`, `rows`, `loading`, `emptyText`, `selectable`
- Features: sort بالأعمدة، pagination، multi-select (checkbox)
- Slot لكل column render مخصّص
- Responsive (horizontal scroll على الموبايل)

### 3.3 — FilterBar Component
**File:** `src/components/admin/shared/FilterBar.vue`
- Search input (debounced)
- Filter chips: role (all/student/admin/super_admin), status (active/banned)، grade
- زر Clear

### 3.4 — RoleBadge Component
**File:** `src/components/admin/users/RoleBadge.vue`
- Pill مع لون حسب الدور (student=primary, admin=gold, super_admin=navy)
- أيقونة Lucide ملائمة

### 3.5 — UserForm Component
**File:** `src/components/admin/users/UserForm.vue`
- Mode: `create | edit`
- حقول: name, email, password (create only), grade, role, permissions (لو role=admin)
- Validation: required، صيغة الايميل، قوة كلمة السر
- يستخدم `AppInput` و`AppButton`

### 3.6 — Users List Page
**File:** `src/views/admin/AdminUsers.vue`
- Header: "إدارة المستخدمين" + زر "+ مستخدم جديد" يفتح modal
- FilterBar
- DataTable: Avatar | الاسم | الإيميل | الدور | Grade | الحالة | تاريخ التسجيل | إجراءات
- إجراءات صف: View / Edit / Reset Password / Ban/Unban / Delete / Impersonate
- Bulk actions: delete selected, export CSV
- Confirm dialogs على كل إجراء destructive

### 3.7 — User Detail Page
**File:** `src/views/admin/AdminUserDetail.vue`
- معلومات المستخدم الكاملة
- Tabs: Info | Permissions | Activity | Progress
- زر Edit يفتح UserForm modal
- عرض كورسات ودروس الطالب ونسبة الإنجاز

### 3.8 — Permissions Editor
داخل UserForm عند `role=admin`:
- Checkboxes من `PERMISSIONS`
- أزرار "تحديد الكل" / "إلغاء الكل"
- معاينة ملخّص الصلاحيات المختارة

### 3.9 — Impersonate Feature
**File:** `src/composables/useImpersonate.ts`
- `start(userId)`: يحفظ السوبر أدمن الأصلي في `edunor.impersonate.origin` ويبدّل `auth.user` بالمستخدم الهدف
- `stop()`: يعيد السوبر أدمن من `origin` ويمسح المفتاح
- Banner أصفر في `AdminTopbar` أثناء التشغيل مع زر "عودة"
- تسجيل في Audit log (both start and stop)

### 3.10 — CSV Import/Export
- زر "تصدير CSV" يبني ملف من المستخدمين الحاليين
- زر "استيراد CSV" يقبل ملفاً ويضيف المستخدمين بعد validation
- preview قبل التطبيق النهائي

---

## ✅ Acceptance Criteria
- [ ] كل عمليات CRUD تعمل وتُحفظ في localStorage
- [ ] Filters/search/pagination تعمل
- [ ] تغيير الدور والصلاحيات يُحفظ ويظهر في RoleBadge
- [ ] Ban/unban يمنع الدخول عند login
- [ ] Reset password يسجّل حدثاً في Audit log (بدون إرسال email فعلي)
- [ ] Impersonate يعمل جيئة وذهاباً ولا يُفقد السوبر أدمن
- [ ] CSV export/import يعمل مع validation
- [ ] Confirm dialog على كل destructive action
