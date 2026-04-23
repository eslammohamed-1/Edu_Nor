# CP2: Interactive Questions | الأسئلة التفاعلية

## 🎯 الهدف
بناء أسئلة الـ Drag & Drop: Ordering (ترتيب), Matching (توصيل), Gap Fill (إكمال الفراغات).

---

## 📦 المهام

### CP2.1 — Drag & Drop Composable
**File:** `src/composables/useDragDrop.ts`
- Reusable drag & drop logic (HTML5 Drag API + touch support)
- `onDragStart`, `onDragOver`, `onDrop` handlers
- Touch event support for mobile
- Visual feedback: ghost element, drop zone highlight
- Accessibility: keyboard reordering with arrow keys

### CP2.2 — Ordering Component
**File:** `src/components/questions/types/OrderingQuestion.vue`
- Display stem via StemRenderer
- Draggable items list (horizontal or vertical based on `direction`)
- Drag & drop reordering
- Item pills with grab handle icon
- Drop zone highlighting
- Submit: compare user order to correct_order
- Review: show correct order with numbered badges
- Mobile: touch-friendly drag or move-up/down buttons

### CP2.3 — Matching Component
**File:** `src/components/questions/types/MatchingQuestion.vue`
- Display stem via StemRenderer
- Two columns: Column A (fixed) + Column B (draggable or dropdown)
- Draw connecting lines between matched pairs (SVG/Canvas)
- Or dropdown-based matching (simpler, mobile-friendly)
- Submit: compare pairs to correct matches
- Review: correct pairs in green, incorrect in red
- Responsive: stack on mobile with dropdown approach

### CP2.4 — Gap Fill Component
**File:** `src/components/questions/types/GapQuestion.vue`
- Display stem with blank slots (parse `blank-line` spans)
- Word bank below with draggable word chips
- Drag words into blank slots
- Distractors included (items without correct_order)
- Submit: compare filled gaps to correct_order
- Review: correct words in green, incorrect in red, show correct answers
- Mobile: tap-to-select then tap-blank-to-fill

---

## ✅ Acceptance Criteria
- [ ] Drag & drop works on desktop and mobile (touch)
- [ ] Ordering: items reorder smoothly, correct order validated
- [ ] Matching: pairs connect correctly, visual feedback
- [ ] Gap Fill: blanks fill from word bank, distractors ignored in scoring
- [ ] All keyboard accessible (arrow keys for reorder)
- [ ] Review mode shows correct answers for all 3 types
- [ ] Brand design system followed (colors, shadows, animations)
