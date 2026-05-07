# EduNor — تحليل ٣ خبراء للتول قبل ترقية الإصدار ٢

> ده تحليل تفصيلي للحالة الحالية للمنصّة من ٣ زوايا متخصصة. نتائج التحليل ده هي اللي بُنيت عليها فلسفة `master_plan.md` ومراحل `U1..U10`.

---

## 🏛️ الخبير الأول — مهندس البنية والباكند (Senior Architect)

### الوضع الحالي (نقاط القوة)

| الجانب | الحالة |
|--------|--------|
| فصل المسؤوليات | `app/` (Vue 3 + Vite) و `server/` (Fastify + Prisma) و `data/` و `scripts/` كلها مفصولة بشكل صحي. |
| ORM | Prisma + schema منظّم لـ Stage→Grade→Term→Subject→Lesson→Section. |
| التوكنز | Access JWT + Refresh مخزّن hash داخل قاعدة البيانات (`RefreshToken`). |
| Audit log | جدول `AuditLog` مع indexes صحيحة (`createdAt`, `actorId`, `action`). |
| Bank الأسئلة | مصدر واحد على القرص (`data/question-bank/<id>/<id>.json`) + barrel مولّد. |

### نقاط الضعف وفرص التحسين

| رقم | المشكلة | الأثر | المرحلة المقترحة |
|----|---------|------|------------------|
| A1 | **SQLite في dev** بدون مسار واضح للهجرة لـ Postgres؛ ولا توجد ملفات `prisma/migrations/` (الـ schema بيتدفع بـ `db push`). | تعارضات schema حتمية في الإنتاج، فقدان بيانات محتمل. | U1 |
| A2 | **AdminSnapshot** بيخزن `content` و `quizzes` و `settings` كـ JSON blob ضخم في صف واحد لكل مفتاح. لا يوجد versioning ولا audit عل الـ diff. | استحالة عمل مراجعة تغييرات أو rollback؛ race conditions عند تعديل من أكتر من سوبر أدمن. | U1, U4 |
| A3 | مصادر حقيقة متضاربة: CSV → fixtures → Snapshot → DB. | صعوبة معرفة "اللي في الإنتاج فعلاً". | U1, U4 |
| A4 | الواجهة لسه تعتمد على `localStorage` لمحاولات الاختبار (`edunor_quiz_attempts`) بدل ما تكون في الباكند. | الطالب بيفقد محاولاته بمسح الكاش، ولا يوجد analytics حقيقي. | U3 |
| A5 | لا يوجد endpoint **forgot/reset password** في الباكند رغم وجود `ForgotPasswordPage.vue`. | أمان وتجربة مستخدم سيئة. | U2 |
| A6 | لا يوجد **rate-limit** على `/register` ولا على endpoints الإدارة الحساسة. | عرضة لـ enumeration attacks. | U2, U7 |
| A7 | لا يوجد **CSRF** صريح رغم استخدام HttpOnly cookies للـ refresh. | المعتمد حالياً `SameSite=Lax` فقط — كافٍ نسبياً لكن الأفضل CSRF token صريح للنماذج الحساسة. | U2 |
| A8 | إصدارات غريبة في `package.json`: `typescript ~6.0.2` (غير موجودة)، `vite ^8.0.10` (غير موجودة)، `vue-tsc ^3.2.7` — يبدو أنها مولّدة بأخطاء. | عدم استقرار build في بيئات تانية. | U7 |
| A9 | لا يوجد **API versioning strategy** واضحة بعد `/api/v1/` (مفيش docs أو OpenAPI/Swagger). | صعب على أي عميل خارجي يبني tooling. | U1, U8 |
| A10 | لا يوجد **uploads** (صور/فيديو/PDF) — `videoUrl` نص فقط، بدون handling لـ media. | محدودية المحتوى التعليمي الحقيقي. | U4 |
| A11 | الـ `db.ts` فيه instance واحدة لـ Prisma بدون graceful shutdown مع تعامل مع `beforeExit` (موجود `SIGINT`/`SIGTERM` بس). | OK مبدئي لكن يحتاج connection pooling عند الـ Postgres. | U1, U8 |
| A12 | السيرفر بيستخدم top-level await (`await app.register(...)`) — يحتاج Node 20+ والتوثيق. | بدون `engines` في package.json بيحصل أخطاء شغّالة. | U1, U7 |

### القرارات المعمارية الموصى بها

1. **Postgres + Prisma migrations** كأساس الإنتاج (بدلاً من `db push`).
2. **Normalize** جداول `quizzes` و `content` و `settings` كـ entities حقيقية، وخلي `AdminSnapshot` مجرد cache/legacy.
3. **OpenAPI auto-generation** من Fastify schemas (`@fastify/swagger`).
4. **Object storage** (S3-compatible: MinIO محلياً, R2/Spaces في الإنتاج) للوسائط.
5. **API client codegen** للواجهة من OpenAPI لتوحيد الـ types.

---

## 🛡️ الخبير الثاني — الجودة والأمان والـ DevOps (QA / Security / SRE)

### الوضع الحالي (نقاط القوة)

| الجانب | الحالة |
|--------|--------|
| Hashing كلمات المرور | bcrypt — مقبول. |
| Rate limit | global rate-limit + `/login` خاص (15 / دقيقة). |
| Cookies | HttpOnly + Secure flag حسب البيئة. |
| Logging | Fastify logger مفعّل افتراضياً. |

### نقاط الضعف الحرجة

| رقم | المشكلة | الخطر | المرحلة |
|----|---------|------|---------|
| Q1 | **مفيش اختبارات أوتوماتيكية فعلية**: `vitest` مثبّت في الواجهة + مجلد `tests/` فاضي تقريباً، والباكند مفيش tests خالص. | bug regressions صامتة. | U7 |
| Q2 | **مفيش CI/CD**: `.github/workflows/` موجود لكن مفيهوش حاجة (ولّا فيه شيء بسيط — نتأكد). | كل نشر يدوي وعرضة لأخطاء. | U8 |
| Q3 | **مفيش error monitoring**: `errorReporting.ts` موجود في الواجهة لكن مش متصل بـ Sentry حقيقي. | أخطاء production غير مرئية. | U8 |
| Q4 | **مفيش backup**: قاعدة البيانات SQLite ملف على القرص، لا توجد cron job أو script للنسخ الاحتياطي اليومي. | فقدان بيانات كارثي محتمل. | U8 |
| Q5 | **Password policy ضعيفة**: `min(8)` فقط — مفيش complexity check ولا breach check (haveibeenpwned). | حسابات سهلة الاختراق. | U2 |
| Q6 | **مفيش 2FA** (TOTP أو email) للسوبر أدمن. | حساب super_admin مهدّد بـ credential stuffing. | U2 |
| Q7 | **Audit log غير قابل للبحث** بشكل متقدم في الواجهة (مفيش filter/search/export شامل من السيرفر). | استحالة تحقيقات أمنية. | U6 |
| Q8 | **مفيش lockout** بعد عدد محاولات فاشلة على نفس الإيميل. | brute-force أبطأ شوية بس ممكن. | U2 |
| Q9 | **JWT_SECRET في .env** بدون secrets manager (Vault, AWS SSM). | أمان متوسط فقط. | U8 |
| Q10 | **CORS** لو `*` كاملة بتسمح للجميع — يحتاج تكون مقيدة في الإنتاج. | السماحية الواسعة خطر XSRF. | U8 |
| Q11 | **مفيش security headers** (CSP, HSTS, X-Frame-Options) عبر Fastify helmet. | clickjacking, XSS injection. | U2, U8 |
| Q12 | **Bundle size** غير محسوب ولا monitored — Vue 3 + Pinia + lucide بكامله ممكن يكون كبير. | UX سيء على شبكات بطيئة (مهم لطلاب في مصر/الريف). | U7 |
| Q13 | **a11y**: مفيش audit آلي (axe-core)؛ بعض الأزرار `<div>` أو بدون `aria-label`. | بيستثني مستخدمين بصريين. | U9 |
| Q14 | **مفيش staging environment** موصوف في الـ README. | اختبار في الإنتاج. | U8 |
| Q15 | **Logs غير منظمة**: stdout عادي، مفيش JSON structured logging مع correlation IDs. | تتبع مشاكل صعب جداً. | U8 |

### القرارات الموصى بها

1. **Vitest + Playwright** للـ unit + E2E.
2. **GitHub Actions**: lint → typecheck → test → build → deploy.
3. **Sentry** للواجهة والباكند.
4. **Helmet** + **CSP** صارمة.
5. **TOTP 2FA** على الأقل لـ super_admin.
6. **Backup يومي** + retention policy.
7. **WCAG 2.1 AA** كهدف رسمي.

---

## 🎓 الخبير الثالث — المنتج وتجربة المستخدم والمنهج التعليمي (Product / UX / Pedagogy)

### الوضع الحالي (نقاط القوة)

| الجانب | الحالة |
|--------|--------|
| RTL أولاً | تصميم عربي واضح في الـ Brand Guide. |
| Roles | `student / admin / super_admin` تأسيس جيد. |
| Question types | تعريف types في `quiz.ts` يدعم 13 نوع نظرياً. |
| Catalog | هيكلية تعليمية صحيحة (مرحلة → صف → ترم → مادة → درس → قسم). |

### نقاط الضعف من منظور المستخدم

| رقم | المشكلة | تأثيرها على المستخدم | المرحلة |
|----|---------|----------------------|---------|
| P1 | **`QuizQuestion.vue` بتدعم MCQ/MRQ/Opinion/Gap بس فعلياً**. باقي الأنواع (matching, ordering, puzzle, gmrq, multipart, frq, input, counting, string) بترجع نص "غير مبرمجة". | ٧٠٪ من أنواع الأسئلة مش مستخدمة. | U3 |
| P2 | **مفيش teacher role**. كل المحتوى من سوبر أدمن — مش عملي للنمو. | استحالة تنفيذ نموذج "مدرّس + فصل". | U2, U5 |
| P3 | **محاولات الاختبار محلية فقط** — مفيش drill of attempts عبر الأجهزة، مفيش analytics لمعلم. | قيمة المنصة محدودة. | U3, U6 |
| P4 | **مفيش progress tracking حقيقي** للدروس. الواجهة بترى الدروس كـ بطاقات بدون "تم/قيد التقدم/مكتمل". | حافز التعلم ضعيف. | U5 |
| P5 | **مفيش onboarding** للطالب الجديد (welcome → اختيار مرحلة → tour). | معدل الـ activation منخفض. | U5 |
| P6 | **مفيش homework / assignments**. | غياب آلية تكليف. | U5 |
| P7 | **مفيش discussion / Q&A** بين الطالب والمدرّس/الأدمن. | تجربة منعزلة. | U5 |
| P8 | **مفيش certificates** عند إنهاء كورس. | حافز شهادات مفقود. | U5 |
| P9 | **مفيش recommendations** ("ادرس بعد كده" / "اختبار مقترح"). | قرار التعلم على الطالب وحده. | U5 |
| P10 | **Dark mode** جزئي — التوكنز موجودة بس مش كل الـ views بتطبّقها. | UX غير متّسق. | U9 |
| P11 | **مفيش i18n حقيقي** رغم الإشارات في master plan الأصلي. كل النصوص hardcoded. | استحالة دعم EN/FR لاحقاً. | U9 |
| P12 | **mobile-first** مذكور بس فعلياً مفيش breakpoints واضحة في كل صفحة + بعض الجداول الإدارية مش مناسبة للموبايل. | أكتر من ٧٠٪ من الطلاب على الموبايل. | U10 |
| P13 | **مفيش PWA / offline** — الطالب اللي شبكته ضعيفة بيخسر التجربة. | فقدان مستخدمين في المناطق الضعيفة. | U10 |
| P14 | **AdminQuizBuilder** متاح لكن بدون preview live ولا validation شامل. | الأدمن بينشئ اختبارات معطوبة بدون ملاحظة. | U4 |
| P15 | **AdminLessons** بدون رفع وسائط فعلي — videoUrl نص فقط. | الأدمن بيلصق YouTube/Vimeo فقط. | U4 |
| P16 | **مفيش gamification** (نقاط، شارات، leaderboard) رغم أن الجمهور (طلاب) يستجيب لها بقوة. | معدل retention أقل. | U5 |
| P17 | **مفيش analytics view** للأدمن بمستوى course/quiz performance حقيقي (charts بياخد mock data). | قرار تحسين المحتوى مفقود. | U6 |
| P18 | **مفيش search global** للأدمن (بالإسم/الإيميل/درس/اختبار) عبر كل الـ entities. | إنتاجية الأدمن منخفضة. | U6 |
| P19 | **مفيش keyboard navigation كامل** + ARIA على الجداول والـ Modals. | استثناء مستخدمين ذوي إعاقة. | U9 |
| P20 | **Loading/empty/error states** غير موحّدة عبر الواجهات. | تجربة متفاوتة. | U7, U9 |

### القرارات الموصى بها

1. **Quiz Engine V2** يدعم كل الـ 13 نوع برندر حقيقي + scoring server-side.
2. **Teacher role** + class/section model.
3. **Real progress tracking** + completions + streaks.
4. **PWA + offline lessons** للموبايل.
5. **i18n** infrastructure من البداية.
6. **Gamification light** (points, streaks, badges).
7. **Server-side analytics** بدل mock.
8. **WCAG 2.1 AA** كحد أدنى.

---

## 🧮 الخلاصة — أولويات الترقية

| البُعد | الأولوية | المرحلة |
|--------|---------|---------|
| استقرار البنية والبيانات (Postgres + migrations + normalize) | 🔴 Critical | U1 |
| أمان قوي (forgot password / 2FA / lockout / helmet / CSP) | 🔴 Critical | U2 |
| Quiz Engine حقيقي (13 نوع + server attempts) | 🔴 Critical | U3 |
| Content Authoring V2 (uploads, validation, versioning) | 🟡 High | U4 |
| تجربة الطالب (progress, certificates, gamification) | 🟡 High | U5 |
| Analytics & Reports حقيقية | 🟡 High | U6 |
| Tests + Performance + DX | 🟡 High | U7 |
| Observability + Backup + CI/CD | 🟡 High | U8 |
| Accessibility + i18n + Dark mode V2 | 🟢 Medium | U9 |
| Mobile + PWA + Offline | 🟢 Medium | U10 |

> **مرشد العمل:** نفّذ U1 → U2 → U7 (testing infrastructure) بالتوازي، بعدين U3 → U4 → U5، وفي الخلفية U8 (CI/CD + observability) لازم يكون شغّال من U1.
