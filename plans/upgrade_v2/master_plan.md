# EduNor — Upgrade V2 Master Plan | الخطة الرئيسية للترقية إصدار ٢

> خطة شاملة لترقية EduNor من حالة "MVP يعمل" إلى **منتج إنتاجي صلب وموثوق وقابل للنمو**.
> الخطة مبنية على [`experts_analysis.md`](./experts_analysis.md) — تحليل من ٣ خبراء (بنية / أمان وجودة / منتج وتعليم).

---

## 🎯 أهداف الترقية

| الهدف | المعيار |
|-------|---------|
| استقرار البنية | Postgres + Prisma migrations + OpenAPI موثّق |
| أمان حقيقي | 2FA لـ super_admin + forgot/reset + helmet + CSP + lockout |
| محرك اختبارات كامل | كل الـ 13 نوع شغال + scoring في السيرفر + attempts persisted |
| محتوى احترافي | uploads + version history + drag reorder + bulk |
| تجربة طالب جذّابة | progress حقيقي + certificates + gamification |
| تحليلات إدارية حقيقية | charts من DB + filters + exports + audit search |
| جودة ممتازة | Vitest + Playwright + lighthouse > 90 + a11y |
| تشغيل آمن | CI/CD + Sentry + structured logs + daily backup + staging |
| وصول للجميع | WCAG 2.1 AA + i18n EN/AR + dark mode متّسق |
| جاهزية محمولة | PWA + offline lessons + push notifications |

---

## 🧭 المبادئ الإرشادية

1. **مفيش كسر أوسع للتطبيق** — كل phase ينشر vertical slice قابل للاختبار.
2. **السيرفر هو مصدر الحقيقة** — استبدال أي اعتماد متبقي على `localStorage` لبيانات حرجة.
3. **اختبارات مع كل feature** — لا feature بدون tests.
4. **Backwards compatibility للـ API** — `/api/v1` يفضل ثابت؛ أي تغيير breaking يبقى تحت `/api/v2`.
5. **Performance budget**: Initial bundle ≤ 200KB gzipped، LCP ≤ 2.5s على 3G.
6. **Accessibility from day 1** — أي PR يفشل axe = مرفوض.

---

## 🏗️ المراحل (Phases)

| Phase | الاسم | الوصف المختصر | الأولوية | التقدير |
|-------|-------|-------------|---------|---------|
| **U1** | Architecture Hardening | Postgres + Prisma migrations + OpenAPI + Storage + Normalize entities | 🔴 Critical | 5-7 days |
| **U2** | Auth & Security V2 | Forgot/reset, 2FA TOTP, lockout, helmet+CSP, RBAC fine-grained, CSRF | 🔴 Critical | 4-6 days |
| **U3** | Quiz Engine V2 | كل الـ 13 نوع + server-side attempts + scoring + anti-cheating | 🔴 Critical | 6-8 days |
| **U4** | Content Authoring V2 | Rich editor + media uploads + versioning + drag reorder + bulk | 🟡 High | 5-7 days |
| **U5** | Student Experience V2 | Real progress + study plan + certificates + gamification + onboarding | 🟡 High | 5-7 days |
| **U6** | Admin Analytics V2 | Real charts + filters + exports + global search + advanced audit | 🟡 High | 4-5 days |
| **U7** | Testing, Performance & DX | Vitest+Playwright + Lighthouse>90 + bundle analyze + types strict | 🟡 High | 4-6 days |
| **U8** | Observability & Ops | Sentry + structured logs + Prometheus metrics + backup + CI/CD + staging | 🟡 High | 4-5 days |
| **U9** | Accessibility, i18n & Theming V2 | WCAG 2.1 AA + i18n EN/AR + dark mode متّسق + keyboard nav | 🟢 Medium | 4-5 days |
| **U10** | Mobile, PWA & Offline | PWA shell + offline lessons + push notifications + mobile polish | 🟢 Medium | 4-6 days |

**التقدير الإجمالي: ~45-62 يوم عمل** (موزّعة على فريق صغير).

---

## 🔗 خرائط الاعتمادية (Dependencies)

```
U1 ─┬─> U2 ─┬─> U6 ─┬─> U10
    ├─> U3 ─┘     │
    ├─> U4 ──────┘
    ├─> U5 ──────┘
    ├─> U7 (مستمر مع كل phase)
    ├─> U8 (مستمر مع كل phase)
    └─> U9 (مع كل phase + sprint مخصّص)
```

- **U1** أساس لكل المراحل التالية.
- **U7 / U8 / U9** يفضل يكونوا متوازيين على شكل "خط أساس" مع كل sprint.
- **U10** يأتي في النهاية لأنه يعتمد على استقرار البيانات والواجهات.

---

## 📁 المجلد المستهدف

```
plans/upgrade_v2/
├── master_plan.md             ← هذا الملف
├── experts_analysis.md        ← تحليل ٣ خبراء
├── sub_plans/
│   ├── U1_architecture_hardening.md
│   ├── U2_auth_security_v2.md
│   ├── U3_quiz_engine_v2.md
│   ├── U4_content_authoring_v2.md
│   ├── U5_student_experience_v2.md
│   ├── U6_admin_analytics_v2.md
│   ├── U7_testing_performance_dx.md
│   ├── U8_observability_ops.md
│   ├── U9_a11y_i18n_theming.md
│   └── U10_mobile_pwa_offline.md
└── tickets/
    ├── U1_tickets.csv
    ├── U2_tickets.csv
    ├── U3_tickets.csv
    ├── U4_tickets.csv
    ├── U5_tickets.csv
    ├── U6_tickets.csv
    ├── U7_tickets.csv
    ├── U8_tickets.csv
    ├── U9_tickets.csv
    └── U10_tickets.csv
```

---

## 🔗 جدول الـ Sub Plans والتذاكر

| Phase | Sub Plan | Tickets |
|-------|----------|---------|
| U1 | [sub_plans/U1_architecture_hardening.md](./sub_plans/U1_architecture_hardening.md) | [tickets/U1_tickets.csv](./tickets/U1_tickets.csv) |
| U2 | [sub_plans/U2_auth_security_v2.md](./sub_plans/U2_auth_security_v2.md) | [tickets/U2_tickets.csv](./tickets/U2_tickets.csv) |
| U3 | [sub_plans/U3_quiz_engine_v2.md](./sub_plans/U3_quiz_engine_v2.md) | [tickets/U3_tickets.csv](./tickets/U3_tickets.csv) |
| U4 | [sub_plans/U4_content_authoring_v2.md](./sub_plans/U4_content_authoring_v2.md) | [tickets/U4_tickets.csv](./tickets/U4_tickets.csv) |
| U5 | [sub_plans/U5_student_experience_v2.md](./sub_plans/U5_student_experience_v2.md) | [tickets/U5_tickets.csv](./tickets/U5_tickets.csv) |
| U6 | [sub_plans/U6_admin_analytics_v2.md](./sub_plans/U6_admin_analytics_v2.md) | [tickets/U6_tickets.csv](./tickets/U6_tickets.csv) |
| U7 | [sub_plans/U7_testing_performance_dx.md](./sub_plans/U7_testing_performance_dx.md) | [tickets/U7_tickets.csv](./tickets/U7_tickets.csv) |
| U8 | [sub_plans/U8_observability_ops.md](./sub_plans/U8_observability_ops.md) | [tickets/U8_tickets.csv](./tickets/U8_tickets.csv) |
| U9 | [sub_plans/U9_a11y_i18n_theming.md](./sub_plans/U9_a11y_i18n_theming.md) | [tickets/U9_tickets.csv](./tickets/U9_tickets.csv) |
| U10 | [sub_plans/U10_mobile_pwa_offline.md](./sub_plans/U10_mobile_pwa_offline.md) | [tickets/U10_tickets.csv](./tickets/U10_tickets.csv) |

---

## ⚙️ القرارات التقنية المعتمدة

| القرار | الاختيار | السبب |
|--------|---------|-------|
| Database (prod) | **PostgreSQL 16** | استدامة + أنواع بيانات + JSONB |
| Migrations | **Prisma Migrate** (ملفات `prisma/migrations/`) | reproducible + CI-friendly |
| Object Storage | **S3-compatible** (R2/Spaces/MinIO local) | uploads scalable |
| API Docs | **OpenAPI 3.1** + `@fastify/swagger` | DX + تكامل خارجي |
| Tests | **Vitest** (unit) + **Playwright** (e2e) | سرعة + تغطية |
| Error monitoring | **Sentry** (frontend + backend) | معروف + ageless |
| 2FA | **TOTP** (RFC 6238) + recovery codes | بدون تكلفة SMS |
| i18n | **vue-i18n** (Composition API) | الأساسي لـ Vue 3 |
| PWA | **vite-plugin-pwa** | تكامل بلا ضجيج |
| CI/CD | **GitHub Actions** | المستودع موجود على GitHub |
| Logs | **pino** (موجود default Fastify) + JSON structured | متوافق + سريع |
| Metrics | **prom-client** + `/metrics` endpoint | معيار صناعي |

---

## ✅ تعريف "تم" (Definition of Done) لكل Phase

- [ ] كل التذاكر في CSV الخاص بالـ phase = `done`
- [ ] tests خضراء (unit + e2e للـ slice المعني)
- [ ] `npm run build` نجح بدون warnings جديدة
- [ ] OpenAPI محدّث لو فيه تغيير API
- [ ] CHANGELOG.md في `plans/upgrade_v2/` يوثّق التغييرات
- [ ] Lighthouse score ≥ 90 على الواجهات المعدلة
- [ ] axe-core يمر بدون violations حرجة
- [ ] Sentry سجل صفر errors جديدة من المرحلة في staging لمدة ٢٤ ساعة
- [ ] PR merged + branch محذوف

---

## ⚠️ المخاطر والتخفيف

| المخاطرة | احتمال | تأثير | التخفيف |
|----------|--------|------|---------|
| تعارض schema عند الهجرة لـ Postgres | متوسط | عالي | dry-run على نسخة + rollback plan في U1 |
| كسر العقد في الواجهة عند تغيير API | عالي | عالي | OpenAPI codegen + contract tests في U7 |
| أداء PWA على هواتف ضعيفة | متوسط | متوسط | Lighthouse على Moto G4 emulator + budget |
| تعقيد 2FA على المستخدم | منخفض | متوسط | recovery codes + توثيق واضح |
| تكلفة Sentry/Storage | منخفض | منخفض | tier مجاني كافٍ في البداية |

---

## 📌 ملاحظات مهمة

> [!IMPORTANT]
> - كل phase لازم يبدأ بـ ADR (Architecture Decision Record) قصير في `plans/upgrade_v2/decisions/` (ينشئ تلقائياً في U1).
> - لا تبدأ U3..U10 قبل ما U1 يخلص minimum viable (Postgres + migrations).
> - U7 و U8 يبدأوا في خلفية U1 مباشرة (testing harness + CI skeleton).

> [!TIP]
> رتّب العمل في sprints أسبوع: في الأسبوع تقدر تخلص phase صغير (U6/U9/U10) أو نص phase كبير (U3/U4).

---

## 🔄 تحديث الحالة

التذاكر في `tickets/*.csv` فيها عمود `status` بقيم: `todo / in_progress / blocked / review / done`.
حدّث القيمة مع كل commit وادفع لو حابب تتبّع تقدّم على GitHub Projects.
