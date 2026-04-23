# SA5: Quiz Management | إدارة الاختبارات والأسئلة

## 🎯 الهدف
إدارة شاملة للاختبارات والأسئلة، مع Builder لأنواع الأسئلة، واستيراد/تصدير JSON مرتبط بـ [Content Plan](../../content_plan/master_plan.md).

---

## 📦 المهام

### 5.1 — Admin Quizzes Store
**File:** `src/stores/admin/adminQuizzes.ts`
- State: `quizzes[]`, `questions[]`, `loading`
- Actions:
  - Quizzes: `createQuiz`, `updateQuiz`, `deleteQuiz`, `duplicateQuiz`, `archiveQuiz`
  - Questions: `addQuestion`, `updateQuestion`, `deleteQuestion`, `reorderQuestions`
- Persist في localStorage

### 5.2 — Quizzes List Page
**File:** `src/views/admin/AdminQuizzes.vue`
- DataTable: العنوان | الكورس/الدرس | عدد الأسئلة | المدة | المحاولات | المتوسط | الحالة | إجراءات
- Filters: by subject/course/status (draft/published/archived)
- إجراءات: Edit / Duplicate / Preview / Archive / Delete

### 5.3 — Quiz Builder Page
**File:** `src/views/admin/AdminQuizBuilder.vue`
- Panel أيسر: metadata (title, description, time limit, passing score, attempts allowed)
- Panel أوسط: قائمة الأسئلة (drag to reorder)
- Panel أيمن: محرر السؤال الحالي

### 5.4 — QuestionBuilder Component
**File:** `src/components/admin/quiz/QuestionBuilder.vue`
- Type selector (dropdown): mcq, mrq, input, string, ordering, matching, gap, frq, counting, puzzle, opinion, gmrq, multipart
- Form ديناميكي حسب النوع (type-specific fields)
- Stem editor (textarea مع HTML + preview + math)
- Explanation editor
- قسم خاص لـ correct_answer حسب النوع
- Metadata: points، tags، difficulty، grade، subject

### 5.5 — Type-Specific Renderers (Priority Tier 1)
في هذه المرحلة نبني builders لـ: `mcq`, `mrq`, `input`, `string`, `opinion` (من CP1).
أنواع CP2/CP3/CP4 تأتي لاحقاً عبر تذاكر منفصلة.

### 5.6 — JSON Import/Export
- زر "استيراد JSON": يقبل ملف بصيغة `skill/question_samples/*.json`
- Validator: يتحقّق من الـ required fields ويعرض أخطاء واضحة قبل الحفظ
- زر "تصدير JSON": يخرج الاختبار كاملاً بصيغة قياسية

### 5.7 — Quiz Preview
- زر "معاينة" يفتح الاختبار بنفس UI الطالب (read-only mode)
- إظهار الإجابات الصحيحة للسوبر أدمن

### 5.8 — Question Bank View
**File:** `src/views/admin/AdminQuestionBank.vue` (اختياري هذه المرحلة)
- مكتبة موحّدة لكل الأسئلة قابلة لإعادة الاستخدام عبر الاختبارات
- Tags + filters

### 5.9 — Quiz Analytics
- عرض: عدد المحاولات، متوسط الدرجة، أصعب سؤال، أسهل سؤال
- في modal عند الضغط على صف اختبار

### 5.10 — Audit Integration
- كل CRUD على quiz/question يُسجّل في audit log

---

## ✅ Acceptance Criteria
- [ ] إنشاء اختبار كامل مع عدة أنواع أسئلة (على الأقل mcq/mrq/input/string/opinion)
- [ ] Drag reorder للأسئلة يعمل
- [ ] Import/Export JSON يعمل مع validation واضح
- [ ] Preview يعرض الاختبار بشكل مطابق لما يراه الطالب
- [ ] Duplicate ينسخ كامل البيانات بدون ربط
- [ ] Archive يخفي من قائمة الطلاب
- [ ] Analytics يعرض أرقاماً صحيحة
