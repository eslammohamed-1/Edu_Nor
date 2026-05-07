# U1 — Architecture Hardening | تصلّب البنية

## 🎯 الهدف

تحويل المنصّة من stack تطويري (`SQLite` + `db push` + JSON snapshots) إلى **بنية إنتاجية موثّقة وقابلة للتوسّع**: Postgres، Prisma migrations رسمية، تخزين media منفصل، API موثّق بـ OpenAPI، و entities مُنَرمَلة بدل JSON blobs.

---

## 🧱 المهام

### 1.1 — Postgres + Prisma migrations
- إضافة `provider = "postgresql"` كخيار + متغير `DATABASE_URL` في `.env.example`.
- توليد migration أولى من schema الحالي: `prisma migrate dev --name init`.
- script لـ data import من SQLite الحالية إلى Postgres (تشغّل مرة واحدة).
- تحديث `server/README.md` بخطوات التشغيل بـ Docker compose لقاعدة Postgres محلية.

### 1.2 — Normalize entities (إخراج JSON من AdminSnapshot)
- جداول جديدة: `Quiz`, `QuizQuestion`, `QuizQuestionOption`, `Setting` (key/value typed).
- migration تقوم بقراءة `AdminSnapshot('quizzes')` و تستخرج الصفوف.
- إبقاء `AdminSnapshot` كـ legacy read-only لتجربة rollback ٣٠ يوم.

### 1.3 — Quiz Attempts as first-class
- جدول `QuizAttempt` (id, userId, quizId, startedAt, finishedAt, score, total, percentage, passed, ip, userAgent).
- جدول `QuizAttemptAnswer` (id, attemptId, questionId, payload JSONB, isCorrect, points).
- migration للأعمدة + indexes مناسبة.

### 1.4 — Media storage (S3-compatible)
- إضافة dependencies: `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`.
- module جديد `server/src/lib/storage.ts` فيه: `presignUpload`, `presignDownload`, `deleteObject`.
- متغيرات `.env`: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`.
- docker-compose يضيف MinIO للتطوير المحلي.

### 1.5 — OpenAPI auto-generation
- إضافة `@fastify/swagger` + `@fastify/swagger-ui`.
- كل route يضيف `schema` (Zod → JSON Schema عبر `zod-to-json-schema`).
- تشغيل `/docs` في dev فقط.
- script `npm run docs:export` يكتب `openapi.json` إلى `server/dist/`.

### 1.6 — API client codegen للواجهة
- إضافة `openapi-typescript` في devDependencies.
- script `npm run gen:api` يولد `app/src/types/api.ts`.
- استبدال أي fetch يدوي بـ wrapper مُولّد.

### 1.7 — Engines + Node version pin
- إضافة `"engines": { "node": ">=20.10.0" }` في كل `package.json`.
- إضافة `.nvmrc` بـ `20.11`.
- تحديث `app/package.json` لإصدارات صحيحة (TypeScript 5.x، Vite 5.x، vue-tsc 2.x).

### 1.8 — Decision Records
- إنشاء `plans/upgrade_v2/decisions/`.
- كتابة ADRs:
  - `ADR-001-postgres-over-sqlite.md`
  - `ADR-002-normalize-quiz-snapshot.md`
  - `ADR-003-s3-for-media.md`
  - `ADR-004-openapi-first.md`

---

## ✅ Acceptance Criteria
- [ ] `prisma migrate deploy` يعيد إنتاج DB كاملة من صفر بدون أخطاء.
- [ ] `npm run dev` على Postgres محلي شغّال + الواجهة بتعرض البيانات.
- [ ] `/docs` يعرض كل endpoints بشكل صحيح.
- [ ] أي PR بيتفشل لو `prisma format` أو `npm run gen:api` بيعمل diff غير مرتب.
- [ ] uploads تجريبي ناجح إلى MinIO عبر presigned URL.

---

## 🔗 ملفات يُتوقَّع تعديلها/إنشاؤها

```
server/prisma/schema.prisma                  # إضافة Quiz, QuizQuestion, QuizAttempt, Setting
server/prisma/migrations/                    # ملفات migrations رسمية
server/src/lib/storage.ts                    # جديد
server/src/lib/openapi.ts                    # جديد
server/src/index.ts                          # تسجيل swagger
server/docker-compose.yml                    # جديد (postgres + minio)
server/package.json                          # dependencies + scripts
app/src/types/api.ts                         # مولّد
package.json (root)                          # scripts: gen:api, docs:export
plans/upgrade_v2/decisions/ADR-001..004.md   # جديد
.nvmrc                                       # جديد
```
