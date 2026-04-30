# بنك الأسئلة (مصدر واحد على القرص)

كل سؤال في مجلّد باسم **`id`** السؤال، وداخله ملف **`{id}.json`** حيث يطابق الحقل **`id`** داخل JSON اسم المجلّد.

مثال:

```text
data/question-bank/h6BUdTq8mlZF/h6BUdTq8mlZF.json
```

## الخادم

- المتغير الاختياري **`QUESTION_BANK_ROOT`**: مسار مطلق، أو مسار **نسبي من جذر المستودع**؛ إذا تُرك فارغاً يُستخدم `data/question-bank`.
- نقاط الطرف:
  - `GET /api/v1/questions-bank`
  - `GET /api/v1/questions/:id`

## الواجهة والباندل

- يُشتق الباريل `app/src/fixtures/demo-catalog/questions/index.ts` من هذا المجلّد بتشغيل:

```bash
# من مجلّد الواجهة app/
npm run generate:questions-index
```

(يُستدعى تلقائياً أيضاً قبل `npm run build` في الواجهة.)

أو من جذر المستودع:

```bash
node --experimental-strip-types scripts/generate-questions-index.ts
```

لا يُعتمد بعد الآن على SQLite لبنك الأسئلة.
