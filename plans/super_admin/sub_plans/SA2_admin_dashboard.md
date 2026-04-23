# SA2: Admin Dashboard | لوحة التحكم الرئيسية للسوبر أدمن

## 🎯 الهدف
نظرة شاملة على حالة المنصة في صفحة واحدة: KPIs، نشاط حديث، quick actions.

---

## 📦 المهام

### 2.1 — StatCard Component
**File:** `src/components/admin/shared/StatCard.vue`
- Props: `title`, `value`, `icon`, `delta`, `trend` ('up' | 'down'), `color`
- يعرض قيمة كبيرة + أيقونة + نسبة تغيير مع سهم
- Skeleton loading
- دعم الأرقام العربية

### 2.2 — KPI Row
في `AdminDashboard.vue`:
- Total Users (active / banned split)
- Total Subjects / Courses / Lessons
- Total Quizzes + متوسط درجة
- Active Sessions today
- Revenue (mock — 0 حالياً لعدم وجود billing)

### 2.3 — Activity Feed
**File:** `src/components/admin/shared/ActivityFeed.vue`
- آخر 10 إجراءات من `adminAudit` store
- Avatar + فاعل + فعل + توقيت نسبي ("منذ 5 دقائق")
- Empty state لو مافيش سجل

### 2.4 — Recent Users Widget
- أحدث 5 مستخدمين مسجّلين
- صف لكل مستخدم: صورة + اسم + ايميل + grade + role badge
- زر "عرض كل المستخدمين" → `/admin/users`

### 2.5 — Recent Quizzes Widget
- أحدث 5 اختبارات أضيفت
- مع عدد الأسئلة ومتوسط الدرجة

### 2.6 — Charts
**File:** `src/components/admin/analytics/KpiChart.vue`
- line chart: تسجيلات آخر 30 يوم (SVG بسيط — بدون مكتبة خارجية)
- bar chart: الدروس المُكملة آخر 30 يوم
- يعتمد على mock data من store

### 2.7 — Quick Actions Card
- 4 أزرار: إنشاء مستخدم، إنشاء مادة، إنشاء اختبار، تصدير تقرير
- تفتح modals أو تنقل مباشرة للـ routes المعنية

### 2.8 — Dashboard Page Assembly
**File:** `src/views/admin/AdminDashboard.vue`
- Header: تحية + اسم السوبر أدمن + تاريخ اليوم
- Grid KPIs (4 أعمدة desktop، 2 tablet، 1 mobile)
- صفّان من الـ widgets
- Loading/empty states

---

## ✅ Acceptance Criteria
- [ ] كل الـ KPIs تعرض أرقاماً صحيحة من stores
- [ ] Charts ترسم بشكل صحيح على بيانات mock
- [ ] Quick actions تعمل
- [ ] Skeleton loading يظهر قبل جلب البيانات
- [ ] Responsive على كل الشاشات
- [ ] Dark mode مدعوم
