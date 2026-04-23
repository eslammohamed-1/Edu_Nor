# CP3: Advanced Questions | الأسئلة المتقدمة

## 🎯 الهدف
بناء FRQ (إجابة حرة), Counting (عدّ), GMRQ (مجموعات اختيارات).

---

## 📦 المهام

### CP3.1 — FRQ Component
**File:** `src/components/questions/types/FRQQuestion.vue`
- Display stem via StemRenderer
- Textarea for long-form answer (min-height, auto-grow)
- Character/word count display
- Reference to acceptable_answers for self-check
- Review: show model answer alongside student answer
- No auto-grading (manual or AI-assisted placeholder)

### CP3.2 — Counting Component
**File:** `src/components/questions/types/CountingQuestion.vue`
- Display stem with embedded image
- Interactive grid (rows × columns) with clickable cells
- Click to add/remove counter markers
- Counter display showing current count
- Submit: compare count to correct_answer
- Visual feedback: correct/incorrect

### CP3.3 — GMRQ Component
**File:** `src/components/questions/types/GMRQQuestion.vue`
- Display stem via StemRenderer
- Two separate choice groups (Group A + Group B) side by side
- One selection per group (radio within each group)
- Selected state styling per group
- Submit: compare both selections to correct_answer.A and .B
- Review: correct/incorrect per group

---

## ✅ Acceptance Criteria
- [ ] FRQ: textarea works with auto-grow and word count
- [ ] Counting: grid is interactive and counts clicks correctly
- [ ] GMRQ: two groups render and validate independently
- [ ] All responsive on mobile
- [ ] Review mode works for all types
