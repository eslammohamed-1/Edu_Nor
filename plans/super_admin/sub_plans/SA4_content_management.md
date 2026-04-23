# SA4: Content Management | إدارة المحتوى التعليمي

## 🎯 الهدف
تمكين السوبر أدمن من إدارة كل الهرم التعليمي: المواد → الكورسات → الفصول → الدروس، مع دعم النشر وإلغاء النشر وإعادة الترتيب.

---

## 📦 المهام

### 4.1 — Admin Content Store
**File:** `src/stores/admin/adminContent.ts`
- State: `subjects[]`, `courses[]`, `lessons[]` (منقولة/مزامنة مع `src/data/*`)
- Actions:
  - Subjects: `createSubject`, `updateSubject`, `deleteSubject`, `reorderSubjects`
  - Courses: `createCourse`, `updateCourse`, `deleteCourse`, `attachToSubject`
  - Lessons: `createLesson`, `updateLesson`, `deleteLesson`, `reorderLessons`, `publish`, `unpublish`
- Persist في localStorage تحت `edunor.admin.content`

### 4.2 — Subjects Management Page
**File:** `src/views/admin/AdminSubjects.vue`
- Grid cards للمواد مع عدد الكورسات والطلاب
- زر "+ مادة جديدة" → modal `SubjectForm`
- لكل card: Edit / Delete / Toggle visibility
- إعادة ترتيب (drag handle أو أزرار ↑↓)

### 4.3 — SubjectForm Component
**File:** `src/components/admin/content/SubjectForm.vue`
- حقول: name (AR/EN)، description، slug، icon name (Lucide)، color، stages (multi-select: ابتدائي/إعدادي/ثانوي)، order
- Live preview للـ card
- Validation: slug unique، اسم مطلوب

### 4.4 — Courses Management Page
**File:** `src/views/admin/AdminCourses.vue`
- Filter by subject + search + status
- DataTable: thumbnail | العنوان | المادة | Instructor | Grade | عدد الدروس | الحالة | إجراءات
- CRUD كامل

### 4.5 — CourseForm Component
**File:** `src/components/admin/content/CourseForm.vue`
- حقول: title، description، subject (select)، grade، instructor، thumbnail URL، duration، tags (chips)، publishedAt
- Thumbnail upload placeholder (mock — يقبل URL)

### 4.6 — Lessons Management Page
**File:** `src/views/admin/AdminLessons.vue`
- Tree view: Subject → Course → Chapter → Lesson
- إمكانية فتح/طيّ كل مستوى
- Drag to reorder داخل نفس الكورس/الفصل
- زر "+ درس" عند كل chapter

### 4.7 — LessonEditor Component
**File:** `src/components/admin/content/LessonEditor.vue`
- حقول: title، summary، videoUrl، duration، description (textarea مع preview)، keyPoints (قائمة قابلة للإضافة/الحذف)، attachments
- Preview mode جنب الـ form (side-by-side)
- Auto-save draft في localStorage كل 10 ثوانٍ

### 4.8 — Publish / Unpublish
- زر توجل على كل درس/كورس
- المحتوى غير المنشور لا يظهر للطلاب (فلترة في `coursesStore` العام)
- تاريخ النشر يُسجّل

### 4.9 — Bulk Actions
- Select متعدّد في جداول الكورسات والدروس
- Bulk publish / unpublish / delete / move to another subject

### 4.10 — Content Audit
- كل CRUD يُسجّل في `adminAudit` (SA8) مع diff مختصر

---

## ✅ Acceptance Criteria
- [ ] إنشاء/تعديل/حذف مواد يعمل ويظهر فوراً في `/subjects`
- [ ] Courses & Lessons CRUD يعمل بالكامل
- [ ] Reorder يحفظ الترتيب الجديد
- [ ] Publish/unpublish يخفي/يظهر المحتوى للطلاب
- [ ] Auto-save يعمل في LessonEditor
- [ ] Bulk actions تعمل مع confirm dialog
- [ ] كل CRUD في Audit log
