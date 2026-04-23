# CP4: Complex Questions | الأسئلة المعقدة

## 🎯 الهدف
بناء Puzzle (لغز صور) و Multipart (سؤال متعدد الأجزاء).

---

## 📦 المهام

### CP4.1 — Puzzle Component
**File:** `src/components/questions/types/PuzzleQuestion.vue`
- Display stem via StemRenderer
- Grid layout (rows × columns) as drop zones
- Scrambled pieces below as draggable items
- Drag pieces into grid positions
- Pieces snap to grid cells
- Submit: compare piece positions to correct_order
- Success: reveal complete image with animation
- Touch support for mobile

### CP4.2 — Multipart Component
**File:** `src/components/questions/types/MultipartQuestion.vue`
- Display shared statement at top (scrollable if long)
- Render each @PART as a separate question below
- Each part uses QuestionRenderer recursively (MCQ, String, etc.)
- Part numbering (الجزء ١, الجزء ٢...)
- Independent answers per part
- Aggregate score from all parts
- Sticky statement option on desktop

---

## ✅ Acceptance Criteria
- [ ] Puzzle: drag & drop into grid works, correct image reveals
- [ ] Multipart: shared statement + multiple independent parts render correctly
- [ ] Recursive rendering of different question types within multipart
- [ ] Mobile responsive for both types
