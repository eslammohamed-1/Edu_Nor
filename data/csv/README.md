# دليل مسار CSV → الكتالوج

مجلد `data/csv/` هو المصدر الذي يعتمد عليه السكربت لبناء الملفات المُنشأة في الواجهة.

## خط الأنابيب

1. **تحرّر** ملفات الـCSV هنا (`subjects.csv`, `courses.csv`, `chapters.csv`, `lessons.csv`, إلخ).
2. من جذر المشروع تشغّل:

   ```bash
   python3 scripts/build_catalog_from_csv.py
   ```

3. يُكتَب الخرج أساسًا إلى [`app/src/fixtures/demo-catalog/generated/`](../app/src/fixtures/demo-catalog/generated/) (مثل `catalog.json`, `courses.json`, `subjects.json` حسب تعريف السكربت).
4. الواجهة تضم هذه الملفات عند البناء؛ الافتراضي محلي بدون خادم يبقى عبر هذا المسار.
5. عند تشغيل **خادم API** مع SQLite:
   - `GET /api/v1/catalog` يقرأ المواد والكورسات من الجداول (`Subject`, `Course`, إلخ).
   - بعد أول تشغيل بقائمة فارغة، أو عبر `npx prisma db seed` من مجلّد `server/`, يُستورد الكتالوج من نفس مسار **`generated/`** ثم يُحدَّث بمرور الوقت عن طريق لوحة الإدارة (مزامنة `AdminSnapshot.content` أو مسارات الإدارة `/api/v1/admin/catalog/*`).

**باختصار:** بعد أي تعديل على CSV وتوليد الملفات، أعد تشغيل التطبيق وبناء الواجهة؛ عند وجود الخادم، أعد أيضًا الـseed أو ادفع المحتوى عبر سوبر الأدمن لتحديث قاعدة البيانات.

## الاختبارات (مزامنة الخادم)

محتوى الاختبارات في المنصّة يحدّده مصدر واحد مركزيًا: **`AdminSnapshot`** بمفتاح **`quizzes`** على الخادم (سوبر أدمن يحرّره من لوحة الإدارة أو يُستورد مع الـseed).

1. لتوليد ملف ثابت يُستهلك عند بداية التشغيل للـseed أو عندما لا توجد لقطة في SQLite، من مجلّد **`app`** نفّذ:

   ```bash
   npm run export:quizzes-snapshot
   ```

   هذا يكتب **`app/src/fixtures/demo-catalog/generated/quizzes.snapshot.json`** اعتمادًا على [`app/src/fixtures/demo-catalog/quizzes.ts`](../../app/src/fixtures/demo-catalog/quizzes.ts).

2. المتصفّح يحمّل الاختبارات المنشورة من **`GET /api/v1/quizzes`** (مسودّات ومؤرشفة تُصفّى قبل الإرسال). إن كان **`lessonId`** يشير لمفتاح المصدر (**toc**) بدل المعرف المحفوظ في القاعدة بعد تجنّب التعارض، يُعاد ضبطه في الاستجابة إلى معرف الدرس الحالي حتى يتطابق مع مسارات الصفحة. بدون خادم، المصدر لا يزال المحلي الثابت.
