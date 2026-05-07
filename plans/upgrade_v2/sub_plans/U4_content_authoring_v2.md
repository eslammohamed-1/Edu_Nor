# U4 — Content Authoring V2 | تأليف المحتوى نسخة ٢

## 🎯 الهدف

ترقية تجربة الأدمن في إدارة المحتوى من **forms ثابتة + JSON snapshot** إلى **محرّر احترافي**: رفع فيديوهات/صور، rich text، drag-reorder، bulk operations، version history، و publish/unpublish workflow.

---

## 🧱 المهام

### 4.1 — Media Uploads (يعتمد على U1)
- مكوّن `MediaUploader.vue` يدعم: drag & drop، multi-file، progress per file.
- يستخدم presigned URL من السيرفر (`POST /api/v1/admin/media/presign`).
- بعد الرفع، يحفظ metadata: `{ url, mime, size, width, height, duration }` في جدول `Media`.
- thumbnail تلقائي للفيديو (server-side via ffmpeg في worker queue، أو شاهد عبر video element كحل أولي).

### 4.2 — Rich Text Editor
- اختيار: **Tiptap** (Vue-friendly، ProseMirror-based).
- مكوّن `RichTextEditor.vue` يعرض bold/italic/list/link/image/quote/code/heading.
- output HTML sanitized عبر DOMPurify على السيرفر قبل الحفظ.
- preview live للـ markdown.
- استبدال `textarea` في AdminLessons.

### 4.3 — Drag & Reorder موحد
- composable `useReorder()` يعتمد على `vue-draggable-next`.
- استخدامه في:
  - subjects ordering
  - lessons داخل subject
  - sections داخل lesson
  - chapters
  - questions داخل quiz
- حفظ orders في batch endpoint `PATCH /api/v1/admin/.../reorder`.

### 4.4 — Bulk Actions
- DataTable shared component يدعم row selection + bulk actions bar.
- bulk: publish, unpublish, archive, delete, export.
- confirmation modal مع عدد العناصر المحدّدة.

### 4.5 — Version History (للـ lessons والـ quizzes)
- جدول `ContentVersion` (entityType, entityId, dataJson, authorId, createdAt, comment).
- كل save بيخلق version جديد (مع limit ٢٠ نسخة).
- UI: button "History" → Modal بيعرض diff (نص بسيط initially).
- "Restore this version" زرار.

### 4.6 — Publish/Unpublish Workflow
- إضافة `status: 'draft' | 'published' | 'archived'` على Lesson/Subject/Quiz.
- الواجهة العامة بترى `published` فقط.
- AdminLayout يعرض badge على entity بحالتها.
- bulk publish ممكن.

### 4.7 — Validation شامل قبل النشر
- Zod schemas server-side لكل entity قبل save.
- Helper `validateLessonForPublish(lesson)` يرجع warnings:
  - "ينقص thumbnail"
  - "محتوى فاضي"
  - "لا يوجد أسئلة في الاختبار المربوط"
- UI يعرض warnings في sidebar ويمنع النشر للأخطاء الحرجة.

### 4.8 — Content Search Server-side
- endpoint `GET /api/v1/admin/search?q=...` يبحث في كل الـ entities.
- استخدام Postgres full-text search (`tsvector`) على title + description + content.
- AdminTopbar يستخدمه (موجود حالياً مكان البحث).

---

## ✅ Acceptance Criteria
- [ ] رفع فيديو ١٠٠MB ينجح ويظهر في UI خلال ثوانٍ.
- [ ] Tiptap editor يحفظ HTML نظيف (لا scripts، لا inline styles خطرة).
- [ ] reorder ٣٠ سؤال + save يستغرق < 1s ويبقى بعد reload.
- [ ] bulk delete ١٠ دروس يعمل + يكتب audit واحد.
- [ ] version history بترجع للقديم بدقة.
- [ ] publish lesson من صفحة AdminLessons ينعكس في `/subjects/...` فوراً.
- [ ] global search يرجع نتائج محتلطة من كل الـ entities.

---

## 🔗 ملفات

```
server/prisma/schema.prisma                              # Media, ContentVersion, status fields
server/src/routes/admin/media.ts                         # جديد
server/src/routes/admin/search.ts                        # جديد
server/src/lib/sanitize.ts                               # جديد
server/src/lib/contentVersion.ts                         # جديد
app/src/components/admin/shared/MediaUploader.vue        # جديد
app/src/components/admin/shared/RichTextEditor.vue       # جديد
app/src/composables/useReorder.ts                        # جديد
app/src/components/admin/shared/DataTable.vue            # دعم selection + bulk
app/src/components/admin/shared/VersionHistoryModal.vue  # جديد
app/src/views/admin/AdminLessons.vue                     # ترقية
app/src/views/admin/AdminSubjects.vue                    # ترقية
app/src/views/admin/AdminQuizBuilder.vue                 # ترقية (rich text + reorder)
```
