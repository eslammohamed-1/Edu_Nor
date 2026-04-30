# بنك الأسئلة (SQLite منفصل)

الملف: يُنشأ وفق المتغير `QUESTIONS_DATABASE_URL`. سكربتات `npm run db:questions:push` و`npm run db:questions:import` تعيّنه افتراضيًا إلى `file:./data/question_database.sqlite` (يعادل تنفيذ Prisma أمام مسار مخطّط `questions-database/schema.prisma`، فالملك عادة **`server/questions-database/data/question_database.sqlite`**). وقت تشغيل الـAPI، `loadEnv()` يضيف نفس القيمة الافتراضية ثم يُمزجها في `process.env` لتطابق ذلك المسار.

جدول واحد `question_bank`: كل صف = سؤال بحسب **`id`** داخل الحمولة JSON (وعمود `payload_json` يحتوي النص الكامل للملف).

## الأوامر (من مجلد `server/`)

```bash
# توليد العميل
npm run db:questions:generate

# إنشاء الجدول
npm run db:questions:push

# تعبئة من مجلّد الواجهة app/src/fixtures/demo-catalog/questions/*.json
npm run db:questions:import
```

## API

- `GET /api/v1/questions-bank` — كل الأسئلة كمجموعة `questions`.
- `GET /api/v1/questions/:id` — سؤال واحد بالمعرف الداخلي.

يمكن أن يعتمد المنطق الأمامي لاحقاً على هذا المسار بدل تضمين كل الأسئلة في ملف واحد في الباندل.
