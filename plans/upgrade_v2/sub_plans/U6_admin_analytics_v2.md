# U6 — Admin Analytics V2 | تحليلات الأدمن نسخة ٢

## 🎯 الهدف

تحويل لوحات الأدمن من **mock charts على بيانات وهمية** إلى **dashboard حقيقي مدفوع بـ DB**، مع filters زمنية، cohorts، exports، و global search على كل entities المنصّة.

---

## 🧱 المهام

### 6.1 — Real KPIs Dashboard
- endpoints جديدة:
  - `GET /api/v1/admin/stats/overview` → users count, active today, lessons published, quizzes total, attempts last 7d.
  - `GET /api/v1/admin/stats/timeseries?metric=registrations&from=&to=&granularity=day`.
  - `GET /api/v1/admin/stats/top?metric=subjects|quizzes|students&limit=10`.
- استبدال bullshit data في `AdminDashboard.vue` بنداءات حقيقية.

### 6.2 — Charts احترافية
- اختيار: **Apache ECharts** (خفيفة، RTL friendly، canvas-based).
- مكوّنات: `LineChart.vue`, `BarChart.vue`, `PieChart.vue`, `HeatmapChart.vue`.
- theme موحد (يقرأ من CSS variables الواجهة).
- responsive + dark-mode aware.

### 6.3 — Reports القابلة للتصدير
- صفحة `AdminReports.vue` بتقارير محددة:
  - Top performing subjects
  - Lowest pass-rate quizzes
  - Student progress (per grade)
  - Revenue (لو فيه billing لاحقاً)
- export CSV + PDF (server-side via puppeteer-headless).
- schedule reports (إيميل أسبوعي للسوبر أدمن).

### 6.4 — Cohort Analysis
- endpoint `GET /api/v1/admin/stats/cohorts?type=signup-week`.
- يرجع matrix retention by signup week.
- visualization heatmap على صفحة `AdminCohorts.vue`.

### 6.5 — Global Search Admin
- AdminTopbar الـ search box يرسل لـ `/api/v1/admin/search?q=...`.
- يعرض dropdown نتائج مقسمة (Users / Lessons / Quizzes / Subjects).
- keyboard navigation (Cmd/Ctrl+K).
- recent searches في localStorage.

### 6.6 — Audit Log Search & Export
- AdminAudit page upgrade:
  - filters: actor, action, target type, date range.
  - search by free text.
  - export to CSV.
  - virtual scroll لو > 1000 record.
- endpoint `GET /api/v1/admin/audit?...filters` يدعم pagination.

### 6.7 — Real Sessions Management
- AdminSecurity:
  - عرض كل sessions نشطة (refresh tokens) مع device guess.
  - revoke session per row.
  - revoke all sessions per user.
- نُسَجّل كل revoke في audit.

### 6.8 — Funnels
- funnel: signup → first lesson → first quiz → certificate.
- يحسب conversion rate بين كل خطوتين.
- visualization: bar chart مع نسبة دروب.

---

## ✅ Acceptance Criteria
- [ ] AdminDashboard يحمل في < 1.5s مع بيانات حقيقية.
- [ ] timeseries بترسم بدقة لو DB فيها 100k records.
- [ ] CSV export ينزل بدون errors.
- [ ] global search يرجع نتائج في < 300ms.
- [ ] audit filters تشتغل بالتركيب (actor + action + date).
- [ ] cohort heatmap يعرض ٨ أسابيع بشكل صحيح.

---

## 🔗 ملفات

```
server/src/routes/admin/stats.ts                # جديد
server/src/routes/admin/reports.ts              # جديد
server/src/lib/analytics.ts                     # جديد
server/src/lib/pdf-export.ts                    # جديد
app/src/components/admin/charts/LineChart.vue   # جديد
app/src/components/admin/charts/BarChart.vue    # جديد
app/src/components/admin/charts/PieChart.vue    # جديد
app/src/components/admin/charts/HeatmapChart.vue # جديد
app/src/views/admin/AdminDashboard.vue          # ترقية
app/src/views/admin/AdminAnalytics.vue          # ترقية
app/src/views/admin/AdminReports.vue            # جديد
app/src/views/admin/AdminCohorts.vue            # جديد
app/src/views/admin/AdminAudit.vue              # ترقية (filters)
app/src/components/admin/layout/AdminTopbar.vue # global search
```
