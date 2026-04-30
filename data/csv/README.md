# مصدر CSV المؤقت للكتالوج

هذا المجلد يعمل كمصدر حقيقة مؤقت قبل ترحيل المحتوى إلى قاعدة بيانات.

- **`subjects.csv`** — المواد الدراسية (حقل `stages` مفصول بفاصلة منقوطة `;`).
- **`courses.csv`** — صفوف الكورسات (بدون فصول/دروس؛ المعرفات مرجعية).
- **`chapters.csv`** — فصول كل كورس (`sort_order` للترتيب).
- **`lessons.csv`** — دروس؛ `key_points` مفصولة بـ `|`؛ `content` يُقتبس وفق CSV؛ اترك `video_url` فارغاً إن لم يوجد.
- **`landing_*.csv`** — مقاطع الصفحة الرئيسية التجريبية.
- **`admin_dashboard.csv`** — إجراءات سريعة وبطاقة إيراد تجريبية وعناوين رسوم (صف واحد للحقول النصية حيث ينطبق).
- **`learners_export.csv`** — يُنشأ الهيدر عند التوليد؛ السيرفر يُلحق صفوفاً عند تسجيل طالب جديد (بدون كلمة مرور).

## التوليد من الواجهة

```bash
cd app && npm run build:catalog
```

(يطلب `python3` في المسار.)

## التوليد من جذر المستودع

```bash
python3 scripts/build_catalog_from_csv.py
```

يُخرِج [`app/src/fixtures/demo-catalog/generated/catalog.json`](../app/src/fixtures/demo-catalog/generated/catalog.json) ويدمج كورسات ToC من `toc/generated/coursesFromToc.json`.

## المتغيرات (السيرفر)

انظر `CSV_DATA_DIR` في `server/.env.example` لمسار مجلد CSV عند إلحاق المسجلين.
