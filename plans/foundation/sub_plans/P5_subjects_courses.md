# P5: Subjects & Courses | المواد والكورسات

## 🎯 الهدف
بناء صفحات عرض المواد والكورسات مع التصفية حسب المرحلة الدراسية.

---

## 📦 المهام

### 5.1 — Course Types
**File:** `src/types/course.ts`
- `Subject`: id, name, nameAr, icon, color, lessonCount, grades
- `Course`: id, subjectId, title, description, chapters, progress, grade
- `Chapter`: id, courseId, title, lessons, order
- `Lesson`: id, chapterId, title, duration, type (video/text/quiz), completed, order

### 5.2 — Mock Data
**Files:** `src/data/subjects.ts`, `src/data/courses.ts`, `src/data/lessons.ts`
- 8+ subjects: رياضيات, علوم, عربي, إنجليزي, دراسات, فيزياء, كيمياء, أحياء
- 3-4 courses per subject
- 3-5 chapters per course
- 3-5 lessons per chapter
- All in Arabic

### 5.3 — Courses Store
**File:** `src/stores/courses.ts`
- State: subjects, courses, currentSubject, currentCourse, filters
- Actions: fetchSubjects, fetchCourses, setFilter
- Getters: filteredSubjects, subjectById, coursesBySubject

### 5.4 — SubjectCard Component
**File:** `src/components/courses/SubjectCard.vue`
- Props: subject
- Subject icon (Lucide) with colored background
- Subject name (Arabic)
- Lesson count badge
- Hover effect (lift + shadow)
- Click → navigate to subject courses

### 5.5 — CourseCard Component
**File:** `src/components/courses/CourseCard.vue`
- Props: course
- Course title + description (truncated)
- Chapter count + lesson count
- Progress bar (if user enrolled)
- Grade badge
- CTA button "ابدأ الكورس"
- Hover effect

### 5.6 — LessonCard Component
**File:** `src/components/courses/LessonCard.vue`
- Props: lesson
- Lesson title
- Duration
- Type icon (video/text/quiz)
- Completion check mark
- Click → navigate to lesson

### 5.7 — SubjectsPage View
**File:** `src/views/SubjectsPage.vue`
- Page title: "المواد الدراسية"
- Grade filter tabs: الكل | ابتدائي | إعدادي | ثانوي
- Grid of SubjectCards
- Empty state if no subjects for grade
- Responsive grid

### 5.8 — CoursePage View
**File:** `src/views/CoursePage.vue`
- Subject header (icon + name + description)
- Breadcrumb: الرئيسية > المواد > [المادة]
- List of courses for this subject
- Accordion chapters with lesson list
- Sidebar: subject info + stats
- Responsive layout

---

## ✅ Acceptance Criteria
- [ ] All subjects display with correct icons and Arabic names
- [ ] Grade filter works correctly
- [ ] Course cards show progress for enrolled users
- [ ] Chapter accordion expands/collapses smoothly
- [ ] Lessons show type and completion status
- [ ] Navigation works: subjects → course → lesson
- [ ] Responsive on all breakpoints
- [ ] Mock data is realistic Arabic content
