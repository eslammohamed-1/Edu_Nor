# U3 — Quiz Engine V2 | محرّك الاختبارات نسخة ٢

## 🎯 الهدف

تحويل محرّك الاختبارات من **MVP بيدعم نوع واحد فقط فعلياً** (MCQ/MRQ/Opinion/Gap عبر choices) إلى محرّك حقيقي بيدعم كل الـ **١٣ نوع** الموجودة في `app/src/types/quiz.ts`، مع **scoring في السيرفر** (مش محلي)، **persistence** للمحاولات، و **anti-cheating** أساسي.

---

## 🧱 المهام

### 3.1 — Renderers لكل نوع سؤال
لكل نوع component مستقل في `app/src/components/quiz/renderers/`:

| النوع | المكوّن |
|------|--------|
| `mcq` / `mrq` / `opinion` | `ChoicesRenderer.vue` (موجود ✓) |
| `gap` | `GapRenderer.vue` (يدعم اختيار + drag) |
| `ordering` | `OrderingRenderer.vue` (drag & drop) |
| `matching` | `MatchingRenderer.vue` (left ↔ right + خطوط مرسومة) |
| `string` / `frq` | `TextRenderer.vue` (textarea + count) |
| `input` / `counting` | `InputRenderer.vue` (input + unit suffix) |
| `puzzle` | `PuzzleRenderer.vue` (image puzzle drag) |
| `gmrq` | `GroupedMrqRenderer.vue` (مجموعات) |
| `multipart` | `MultipartRenderer.vue` (recursive) |

- `QuizQuestion.vue` يصبح dispatcher يختار renderer بناءً على `question.type`.
- normalize answer payload شكل موحد: `{ kind, value }`.

### 3.2 — Server-side scoring
- endpoint `POST /api/v1/quiz-attempts` يبدأ محاولة (`startedAt`, `quizSnapshotJson`).
- endpoint `PATCH /api/v1/quiz-attempts/:id/answer` يحفظ إجابة سؤال.
- endpoint `POST /api/v1/quiz-attempts/:id/submit` يسلّم ويقيم في السيرفر.
- منطق scoring في `server/src/lib/quiz-scoring.ts` لكل نوع.
- استبدال `submitQuiz()` المحلي في `quiz.ts` بـ API call.

### 3.3 — Quiz attempts history
- endpoint `GET /api/v1/me/attempts` يرجع محاولات الطالب.
- صفحة `MyAttemptsPage.vue` في dashboard الطالب.
- صفحة `AdminQuizAttempts.vue` لعرض كل المحاولات لاختبار معين.

### 3.4 — Quiz Builder V2
- AdminQuizBuilder يدعم إنشاء أنواع جديدة (drag & drop UI).
- live preview على نفس الصفحة.
- validation: حد أدنى من choices، اختيار correct واحد على الأقل، إلخ.
- import/export JSON يحترم schema جديد (Zod schema موحد).

### 3.5 — Anti-cheating خفيف
- منع copy/paste على text questions (option في إعدادات Quiz).
- timer enforcement على السيرفر (لو تجاوز time → submit تلقائي).
- detect tab switching (Page Visibility API) → warning + log.
- random order للأسئلة + للـ choices لو الإعداد مفعل.

### 3.6 — Question Bank V2
- API endpoints `GET/POST/PUT/DELETE /api/v1/admin/questions-bank`.
- بدل قراءة الفايلز من القرص في runtime، نسحبها لـ DB (`Question` table) مع كاش.
- صفحة `AdminQuestionsBank.vue` لإدارة بنك الأسئلة.

### 3.7 — Partial credit + explanation richer
- support `partialCredit: true` في السؤال؛ scoring يحسب نسبي.
- explanation بصيغة markdown بسيطة (sanitized).
- شرح بعد كل سؤال في review mode.

---

## ✅ Acceptance Criteria
- [ ] كل ١٣ نوع يرندر صح ويُجاب عليه.
- [ ] scoring يطابق expected output في unit tests (≥ ١٠ scenarios).
- [ ] محاولة الطالب بتظهر في dashboard بعد reload وعلى جهاز ثاني.
- [ ] timer expiry يسلّم تلقائياً ويُحفظ.
- [ ] AdminQuizBuilder ينشئ أي نوع بدون كتابة JSON يدوي.

---

## 🔗 ملفات

```
server/prisma/schema.prisma                            # Question, QuizAttempt, QuizAttemptAnswer
server/src/routes/quiz-attempts.ts                     # جديد
server/src/lib/quiz-scoring.ts                         # جديد
server/src/routes/admin/questions-bank.ts              # جديد
app/src/components/quiz/QuizQuestion.vue               # dispatcher
app/src/components/quiz/renderers/*.vue                # ٩ مكوّنات
app/src/services/quizAttemptsService.ts                # جديد
app/src/stores/quiz.ts                                 # ربط بـ API
app/src/views/MyAttemptsPage.vue                       # جديد
app/src/views/admin/AdminQuestionsBank.vue             # جديد
app/src/views/admin/AdminQuizAttempts.vue              # جديد
app/src/views/admin/AdminQuizBuilder.vue               # نسخة V2
```
