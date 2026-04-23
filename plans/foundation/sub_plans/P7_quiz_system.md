# P7: Quiz System | نظام الاختبارات

## 🎯 الهدف
بناء نظام اختبارات تفاعلي مع أسئلة اختيار من متعدد ونتائج مفصلة.

---

## 📦 المهام

### 7.1 — Quiz Types
**File:** `src/types/quiz.ts`
- `Quiz`: id, title, lessonId, questions, timeLimit, passingScore
- `Question`: id, text, options, correctAnswer, explanation
- `QuizAttempt`: id, quizId, answers, score, completedAt

### 7.2 — Mock Quiz Data
**File:** `src/data/quizzes.ts`
- 5+ quizzes linked to lessons, 5-10 questions each, all Arabic

### 7.3 — Quiz Store
**File:** `src/stores/quiz.ts`
- State, actions (start, submit, navigate, finish), getters (progress, score)

### 7.4 — QuizQuestion, QuizProgress, QuizResults Components
- Question display with 4 options, selected highlighting, correct/incorrect feedback
- Progress bar + timer + question dots
- Score display, pass/fail, review mode, retry

### 7.5 — QuizPage View
**File:** `src/views/QuizPage.vue`
- Full quiz flow: progress → question → navigation → results

---

## ✅ Acceptance Criteria
- [ ] Quiz loads, answers work, progress updates, results display correctly
- [ ] Timer, review mode, retry all functional
- [ ] Responsive on mobile
