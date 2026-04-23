# SA6: Analytics & Reports | التحليلات والتقارير

## 🎯 الهدف
تزويد السوبر أدمن بصورة رقمية واضحة عن أداء المنصة، مع قدرة تصدير تقارير جاهزة.

---

## 📦 المهام

### 6.1 — Analytics Data Layer
**File:** `src/stores/admin/adminAnalytics.ts` (اختياري — أو computed من الـ stores الموجودة)
- Getters:
  - `usersByGrade`, `usersByRole`, `signupsByDay`
  - `lessonsCompletedByDay`, `averageQuizScoreByCourse`
  - `topStudents(limit)`, `topCourses(limit)`
  - `engagementFunnel`: signups → first lesson → first quiz

### 6.2 — Analytics Dashboard Page
**File:** `src/views/admin/AdminAnalytics.vue`
- Time range picker: 7d / 30d / 90d / custom
- Grid الإحصاءات الكبيرة (reuse `StatCard`)
- Charts متعدّدة (line/bar/donut)
- Top lists (students/courses)

### 6.3 — Chart Components
- `LineChartMini.vue` — SVG-based trend
- `BarChartMini.vue`
- `DonutChart.vue` — توزيع المستخدمين حسب الـ grade/role
- بدون مكتبات خارجية (لتبسيط bundle) — إلا لو فيه حاجة قوية

### 6.4 — Reports Builder
- زر "إنشاء تقرير" يفتح modal:
  - نوع التقرير (users / courses / quizzes / revenue)
  - الفترة الزمنية
  - الأعمدة المطلوبة
  - التنسيق (CSV / PDF)
- معاينة قبل التصدير

### 6.5 — CSV Export Utility
**File:** `src/lib/csv.ts`
- `toCSV(rows, columns)` → string
- `downloadCSV(filename, content)`

### 6.6 — PDF Export (Optional)
- Placeholder: توليد HTML قابل للطباعة + `window.print()`
- أو استخدام مكتبة خفيفة لاحقاً (jsPDF)

### 6.7 — Scheduled Reports (Mock)
- UI لإعداد تقارير أسبوعية تُرسل لإيميل (بدون تنفيذ فعلي — visual only)
- حفظ الإعدادات في localStorage

### 6.8 — Funnel Widget
- 4 خطوات: Signup → Verified → First Lesson → First Quiz
- نِسب التحويل بين كل خطوة

### 6.9 — Data Refresh Button
- زر تحديث في كل صفحة analytics
- Loading state + timestamp آخر تحديث

---

## ✅ Acceptance Criteria
- [ ] كل الإحصاءات تُحسب ديناميكياً من stores
- [ ] Time range picker يعمل على كل الـ widgets
- [ ] CSV export ينزّل ملفاً صحيحاً
- [ ] Funnel يعرض نسباً منطقية حتى على بيانات mock
- [ ] Charts responsive وتدعم dark mode
- [ ] لا فشل في build
