# EduNor API — خادم الإنتاج (مبدئي)

## السلوك

- **Fastify 5** + **Prisma** + **SQLite** (`dev.db`) للتطوير السريع؛ الإنتاج يُفضّل PostgreSQL بتغيير `DATABASE_URL` والـ schema دون تغيير المنطق الحرِج.
- مصادقة: **JWT** (صلاحية قصيرة) + **Refresh token** مخزَّن hash في قاعدة البيانات ويُرسل للمتصفح عبر HttpOnly cookie.
- لوحة الإدارة — مستخدمون: CRUD تحت `/api/v1/admin/users` (سوبر أدمن فقط).
- تسجيل طالب جديد (`POST /api/v1/auth/register`): بعد الحفظ في قاعدة SQLite يُلحق صف في `learners_export.csv` ضمن مجلد CSV (`CSV_DATA_DIR` أو الافتراضي `../data/csv`). لا يُخزَّن أي كلمة مرور في CSV.

## التشغيل المحلي

```bash
cd server
cp .env.example .env   # عدّل JWT_SECRET في الإنتاج الحقيقي
npm install
npx prisma db push
npm run db:seed
npm run dev
```

الخدمة تستمع على `http://localhost:3001` (أو `PORT` من `.env`). فحص: `GET http://localhost:3001/health`.

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

محتوى المواد والكورسات المعروض في الواجهة يُولَّد من CSV في `data/csv/` إلى `app/src/fixtures/demo-catalog/generated/catalog.json` — انظر `data/csv/README.md` وأمر `npm run build:catalog` من مجلد `app/`.

## البناء للإنتاج

```bash
npm run build
npm run start
```

عرّف `DATABASE_URL` و `JWT_SECRET` وأسرار السوبر أدمن على بيئة الاستضافة (ولا ترفع `.env`).
فعّل `COOKIE_SECURE=true` عند التشغيل خلف HTTPS.
