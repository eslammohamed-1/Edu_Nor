# SA8: Audit & Security | سجل التدقيق والأمان

## 🎯 الهدف
ضمان الشفافية والمساءلة عبر تسجيل كل عملية حسّاسة، مع أدوات أمان أساسية (جلسات، 2FA mock، كلمات السر).

---

## 📦 المهام

### 8.1 — Audit Store
**File:** `src/stores/admin/adminAudit.ts`
- State: `logs[]`
- Entry shape:
  ```ts
  {
    id: string;
    actor: { id: string; name: string; role: UserRole };
    action: string;         // e.g. 'user.create', 'lesson.delete'
    target?: { type: string; id: string; label?: string };
    meta?: Record<string, unknown>;
    ip?: string;            // mock
    userAgent?: string;
    createdAt: string;      // ISO
  }
  ```
- Actions: `log(entry)`, `clear()`, `export()`
- Persist في localStorage (cap آخر 1000 إدخال)

### 8.2 — Audit Logger Wrapper
**File:** `src/lib/audit.ts`
- Helper `audit(action, target?, meta?)` يستدعي `adminAudit.log` ويملأ `actor` من auth store
- يُستخدم في كل admin stores (users/content/quizzes/settings)

### 8.3 — Audit Log Page
**File:** `src/views/admin/AdminAudit.vue`
- DataTable: الوقت | الفاعل | الدور | الفعل | الهدف | IP | الجهاز
- Filters: by actor / action / date range
- Search نصّي
- زر تصدير CSV
- زر مسح السجل (مع confirm مزدوج + إعادة تأكيد كلمة السر)

### 8.4 — Sessions Management
**File:** `src/views/admin/AdminSessions.vue` (اختياري مدمج)
- جدول الجلسات النشطة الحالية (من localStorage الخاص بالتطبيق)
- عمود: Device | IP | Last seen | Actions
- زر "إنهاء الجلسة" يمسح token ويُخرج المستخدم

### 8.5 — Password Policy
داخل Settings أو صفحة Security مستقلة:
- minLength, requireUppercase, requireNumber, requireSymbol, maxAge (days)
- تُطبَّق عند register + reset password

### 8.6 — 2FA (Mock)
- Toggle في صفحة Security للسوبر أدمن
- عند التفعيل: عرض QR placeholder + حقل 6 أرقام
- Mock verify يقبل `000000`
- يحفظ `twoFactorEnabled: true` في user

### 8.7 — Failed Login Throttling (Mock)
- عند 5 محاولات فاشلة في دقيقة: قفل مؤقّت 60 ثانية
- يُسجّل في audit log

### 8.8 — Backup System
**File:** `src/lib/backup.ts`
- `exportAll()`: يجمع كل localStorage keys الخاصة بـ EduNor في JSON
- `importAll(json)`: يتحقّق من schema ويطبّقه مع confirm
- زر في Audit page: "نسخة احتياطية كاملة"

### 8.9 — Security Dashboard Widget
- في `AdminDashboard`: بطاقة تُظهر آخر محاولات الدخول الفاشلة + التحذيرات الأمنية

### 8.10 — Documentation Section
- داخل الصفحة: بطاقة توضيحية "ماذا يُسجَّل؟" تشرح الأحداث الممسوحة
- روابط داخلية لـ SA3/SA4/SA7

---

## ✅ Acceptance Criteria
- [ ] كل CRUD من SA3/SA4/SA5/SA7 يظهر في audit log
- [ ] Filters وSearch تعمل
- [ ] CSV export يعمل
- [ ] Backup/restore كامل يعمل (export يصدر، import يطبّق)
- [ ] Password policy يُطبَّق على register/reset
- [ ] 2FA mock يعمل عند إدخال `000000`
- [ ] Failed login throttling يقفل مؤقّتاً ويظهر رسالة واضحة
