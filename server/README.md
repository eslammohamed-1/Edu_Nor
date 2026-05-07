# EduNor API — خادم الإنتاج (مبدئي)

## السلوك

- **Fastify 5** + **Prisma** + **PostgreSQL** (Docker **اختياري**؛ كان SQLite سابقًا).
- مصادقة: **JWT** (صلاحية قصيرة) + **Refresh token** مخزَّن hash في قاعدة البيانات ويُرسل للمتصفح عبر HttpOnly cookie.
- لوحة الإدارة — مستخدمون: CRUD تحت `/api/v1/admin/users` (سوبر أدمن فقط).
- تسجيل طالب جديد (`POST /api/v1/auth/register`): بعد الحفظ في قاعدة البيانات يُلحق صف في `learners_export.csv` ضمن مجلد CSV (`CSV_DATA_DIR` أو الافتراضي `../data/csv`). لا يُخزَّن أي كلمة مرور في CSV.
- **OpenAPI**: عند `ENABLE_API_DOCS=true` — واجهة `/documentation` و JSON على `/documentation/json`.
- **جاهزية**: `GET /ready` يتحقق من اتصال PostgreSQL.

## التشغيل المحلي

**المنطق:** في `server/.env.example` أمثلة **كلها محلية** (Postgres على `localhost`، S3 = MinIO على `127.0.0.1:9000`). انسخها إلى `.env` واشتغل. لما تحتاج سحابة (Neon، R2، …) غيّر نفس المتغيرات فقط — من غير ما تلمس الكود.

تحتاج **PostgreSQL شغّال** وقيمة `DATABASE_URL` صحيحة في `server/.env`. طرق التشغيل:

### أ) بدون Docker — Postgres على الجهاز (macOS بـ Homebrew)

لو لسه منزلتش Docker، ثبّت Postgres على الماك مباشرة:

```bash
brew install postgresql@16
brew services start postgresql@16
```

أضف ثنائي الأوامر إلى الـ `PATH` إذا طلبت Homebrew ذلك (اتبع التعليمات بعد التثبيت).

افتح عميل SQL واتصل كمستخدم يملك صلاحية إنشاء قواعد (غالباً `psql postgres` أو من تطبيق **Postgres.app**):

```sql
CREATE ROLE edunor WITH LOGIN PASSWORD 'edunor';
CREATE DATABASE edunor OWNER edunor;
```

إذا ظهر خطأ أن `edunor` موجوداً مسبقاً، استخدم `ALTER ROLE edunor WITH PASSWORD 'edunor';` ثم تأكد أن قاعدة `edunor` موجودة.

في `server/.env`:

```env
DATABASE_URL="postgresql://edunor:edunor@localhost:5432/edunor"
```

**MinIO (رفع ملفات):** غير مطلوب لتشغيل الـ API أو الـ seed؛ فعّله لاحقاً عند الرفع أو استخدم Docker وقتها.

### ب) بدون Docker — Postgres مستضاف (Neon / Supabase / …)

أنشئ مشروعاً مجانياً، انسخ **connection string** ضعها في `DATABASE_URL` في `server/.env`، ثم نفّذ الترحيل والـ seed كالعادة. لا تحتاج Docker ولا تثبيت Postgres محلي.

### ج) Docker (اختياري — لاحقاً)

عندما تثبّت Docker، من **جذر المستودع**:

```bash
npm run db:up
```

أو من `server/`:

```bash
docker compose up -d
```

يرفع **PostgreSQL 16** على `5432` و **MinIO** على `9000` (واجهة `9001`).

### البيئة والترحيل

```bash
cd server
cp .env.example .env
# عدّل JWT_SECRET في الإنتاج — وحدّث DATABASE_URL إذا غيّرت كلمة سر Postgres
npm install
npm run db:migrate:dev
npm run db:seed
npm run dev
```

> **مهم:** إذا كان ملف `.env` السابق يستخدم `DATABASE_URL="file:./dev.db"` لم يعد صالحاً — انسخ القيم من `.env.example` (`postgresql://edunor:edunor@localhost:5432/edunor`).

الخدمة تستمع على `http://localhost:3001` (أو `PORT` من `.env`).

- فحص: `GET http://localhost:3001/health`
- جاهزية + DB: `GET http://localhost:3001/ready`
- وثائق API (إن فُعّلت): `http://localhost:3001/documentation`

### تصدير OpenAPI وتوليد أنواع الواجهة

```bash
# شغّل السيرفر مع ENABLE_API_DOCS=true ثم من جذر الريبو:
npm run docs:export --prefix server
npm run gen:api
```

يُحدَّث `server/openapi.json` و`app/src/types/api.ts`. التفاصيل الإضافية تحت «توليد أنواع TypeScript» في قسم «مهاجرة من SQLite» أدناه.

### حسابات أولية (بعد `db:seed`)

| الدور | البريد | كلمة المرور (التجربة فقط) |
|--------|--------|---------------------------|
| سوبر أدمن | من `.env` — افتراضي `superadmin@edunor.local` | من `.env` — افتراضي `EduNorSuper2026!` |
| مدير تجريبي | `admin@edunor.local` | `AdminDemo2026!` |

## الواجهة (Vue)

في مجلد `app/` أنشئ `app/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3001
```

بدون هذا المتغيّر تبقى الواجهة في **وضع Mock** كما كانت.

محتوى المواد والكورسات المعروض في الواجهة يُولَّد من CSV في `data/csv/` إلى `app/src/fixtures/demo-catalog/generated/` — انظر `data/csv/README.md` وأمر `npm run build:catalog` من جذر المستودع.

## البناء للإنتاج

```bash
npm run build
npm run start
```

عرّف `DATABASE_URL` و `JWT_SECRET` وأسرار السوبر أدمن على بيئة الاستضافة (ولا ترفع `.env`).

فعّل `COOKIE_SECURE=true` عند التشغيل خلف HTTPS.

في الإنتاج اضبط `ENABLE_API_DOCS=false` ما لم تُؤمَّن وثائق API.

## مهاجرة من SQLite القديم

إن وُجد `server/prisma/dev.db` من تشغيل قديم:

```bash
# اضبط DATABASE_URL لـ Postgres في server/.env
npm run migrate:sqlite
```

لنسخ الاختبارات من لقطة `AdminSnapshot.quizzes` إلى الجداول العلائقية:

```bash
npm run migrate:quizzes
```

(استخدم «تصدير OpenAPI وتوليد أنواع الواجهة» أعلاه لتحديث `app/src/types/api.ts` بعد `docs:export`.)

### إنشاء حاوية MinIO (اختياري)

```bash
npm run bucket:ensure --prefix server
```
