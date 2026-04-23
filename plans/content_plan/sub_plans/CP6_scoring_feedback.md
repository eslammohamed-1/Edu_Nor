# CP6: Scoring & Feedback | التقييم والملاحظات

## 🎯 الهدف
بناء نظام تقييم تلقائي وعرض النتائج والملاحظات.

---

## 📦 المهام

### CP6.1 — Auto-Grading Engine
**File:** `src/utils/grading.ts`
- `gradeMCQ(answer, correct)` → 0 or 1
- `gradeMRQ(answers, correct)` → partial score (correct selections / total correct)
- `gradeOrdering(userOrder, correctOrder)` → percentage of correct positions
- `gradeMatching(pairs, correctPairs)` → correct pairs / total pairs
- `gradeGap(filledGaps, correctGaps)` → correct fills / total gaps
- `gradeInput(value, correct, constraints)` → 0 or 1 (with numeric tolerance)
- `gradeString(answer, acceptableAnswers)` → 0 or 1 (case-insensitive, trimmed)
- `gradeCounting(count, correct)` → 0 or 1
- `gradePuzzle(positions, correctPositions)` → percentage
- `gradeGMRQ(selections, correct)` → both correct = 1, one correct = 0.5, none = 0
- `gradeOpinion()` → always null (no grading)
- `gradeMultipart(parts)` → average of part scores

### CP6.2 — Feedback Display Component
**File:** `src/components/questions/QuestionFeedback.vue`
- Correct: green check + "إجابة صحيحة! 🎉" + animation
- Incorrect: red X + "إجابة خاطئة" + show correct answer
- Partial: orange + "أحسنت! لكن في إجابات تانية" + show missing
- Explanation toggle: "شوف الشرح" button
- Score badge for partial scoring questions

### CP6.3 — Attempt Tracking
**File:** `src/stores/attempts.ts`
- Track per-question attempts
- Store: questionId, answers, score, timestamp, duration
- Persist in localStorage
- Statistics: average score, time per question, most-missed types

### CP6.4 — Results Summary Component
**File:** `src/components/questions/QuizSummary.vue`
- Total score (X / Y)
- Percentage with color-coded badge
- Per-question breakdown (correct/incorrect/partial)
- Filter: show all / incorrect only / correct only
- Retry incorrect questions option
- Time stats

---

## ✅ Acceptance Criteria
- [ ] All 13 question types graded correctly
- [ ] Partial scoring works for MRQ, Ordering, Matching, Gap, GMRQ
- [ ] Feedback animations display correctly
- [ ] Explanations show/hide properly
- [ ] Attempts persist in localStorage
- [ ] Results summary accurately reflects answers
