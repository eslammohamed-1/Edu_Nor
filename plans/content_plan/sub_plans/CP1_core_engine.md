# CP1: Core Question Engine | محرك الأسئلة الأساسي

## 🎯 الهدف
بناء البنية التحتية لنظام الأسئلة: TypeScript types, renderer architecture, وتنفيذ الأنواع البسيطة (MCQ, MRQ, Input, String, Opinion).

---

## 📦 المهام

### CP1.1 — Question TypeScript Types
**File:** `src/types/question.ts`
- `QuestionMeta`: question_id, parent_id, language_code, country_code, grade, subject, source, section_id
- `QuestionPart`: n, type, stem, explanation + type-specific union
- `MCQPart`: choices[], correct_answer
- `MRQPart`: choices[], correct_answer[]
- `InputPart`: correct_answer with constraints
- `StringPart`: acceptable_answers[], guidelines[]
- `OpinionPart`: choices[] (no correct answer)
- `Choice`: label, value, is_correct
- `Question`: meta + content.parts[]
- `QuestionAttempt`: questionId, answers, score, timestamp

### CP1.2 — Question Renderer Architecture
**File:** `src/components/questions/QuestionRenderer.vue`
- Dynamic component loader based on `part.type`
- Props: question (full question object), mode (practice/exam/review)
- Emits: answer, complete
- Renders stem with HTML sanitization
- Conditionally shows explanation
- Delegates to type-specific sub-components

### CP1.3 — Stem Renderer (HTML Content)
**File:** `src/components/questions/StemRenderer.vue`
- Safely renders HTML stem content
- Handles RTL/LTR direction from stem attributes
- Renders embedded images
- Placeholder for math rendering (CP5)
- Responsive image sizing

### CP1.4 — MCQ Component
**File:** `src/components/questions/types/MCQQuestion.vue`
- Display stem via StemRenderer
- Radio button choices (single select)
- Choice labels (A, B, C, D)
- Selected state: Gold border
- Review mode: green correct, red incorrect
- Explanation reveal after answer
- Keyboard accessible

### CP1.5 — MRQ Component
**File:** `src/components/questions/types/MRQQuestion.vue`
- Display stem via StemRenderer
- Checkbox choices (multiple select)
- Selected state styling
- Review mode with correct/incorrect indicators
- Partial scoring support

### CP1.6 — Input (Numeric) Component
**File:** `src/components/questions/types/InputQuestion.vue`
- Display stem via StemRenderer
- Numeric input field
- Answer validation against constraints (decimal, sign, format)
- Unit display (if provided)
- Error state for invalid format
- Correct/incorrect feedback

### CP1.7 — String Component
**File:** `src/components/questions/types/StringQuestion.vue`
- Display stem via StemRenderer
- Text input field
- Compare against acceptable_answers (case-insensitive, trimmed)
- Guidelines-based feedback
- Correct/incorrect display

### CP1.8 — Opinion Component
**File:** `src/components/questions/types/OpinionQuestion.vue`
- Display stem via StemRenderer
- Radio/button choices
- No correct/incorrect — just collect response
- "شكرًا لرأيك" feedback after answer
- Teal accent styling

### CP1.9 — Question Store
**File:** `src/stores/questions.ts`
- State: currentQuestion, answers, mode
- Actions: loadQuestion, submitAnswer, showExplanation, nextQuestion
- Getters: isAnswered, isCorrect, score

---

## ✅ Acceptance Criteria
- [ ] All TypeScript types compile with strict mode
- [ ] QuestionRenderer dynamically loads correct component per type
- [ ] MCQ: single select works with correct/incorrect feedback
- [ ] MRQ: multi-select works with partial scoring display
- [ ] Input: numeric validation with constraints works
- [ ] String: text comparison against acceptable answers works
- [ ] Opinion: collects response without grading
- [ ] All components follow brand design system
- [ ] RTL layout works correctly
- [ ] Explanation shows/hides correctly in review mode
