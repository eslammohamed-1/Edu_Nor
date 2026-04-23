# P6: Lesson Viewer | عرض الدروس

## 🎯 الهدف
بناء صفحة عرض الدرس مع مشغل فيديو وملاحظات ونظام تنقل بين الدروس.

---

## 📦 المهام

### 6.1 — LessonPlayer Component
**File:** `src/components/courses/LessonPlayer.vue`
- Video embed placeholder (16:9 aspect ratio)
- YouTube-style responsive container
- Play button overlay
- Brand-colored progress bar
- Fallback for non-video lessons (text content display)

### 6.2 — LessonPage View
**File:** `src/views/LessonPage.vue`
- Two-column layout: content (70%) + sidebar (30%)
- Top: Breadcrumb navigation
- Main area: LessonPlayer
- Below player: Lesson title + description
- Lesson notes/content section (rich text)
- Previous/Next lesson navigation buttons
- Sidebar: chapter lessons list (current lesson highlighted)
- Mark as complete button
- Responsive: stack on mobile (sidebar becomes collapsible)

### 6.3 — Lesson Navigation
- Previous / Next lesson buttons at bottom
- Auto-navigate suggestion after completion
- Chapter awareness (move to next chapter when current done)
- Progress tracking per lesson

### 6.4 — Lesson Content Area
- Markdown-style content rendering
- Key points highlighted in gold
- Important notes in teal boxes
- Code/formula blocks (if applicable)
- Images support

### 6.5 — Lesson Sidebar
- Chapter list with lessons
- Current lesson highlighted (Gold left border)
- Completed lessons with checkmark
- Collapse/expand chapters
- Sticky on desktop

### 6.6 — Lesson Completion
- "أكملت الدرس" button
- Completion state persisted in store
- Visual checkmark on completed lessons
- Progress update in course

---

## ✅ Acceptance Criteria
- [ ] Video player renders responsively (16:9)
- [ ] Lesson content displays correctly
- [ ] Previous/Next navigation works across chapters
- [ ] Sidebar shows chapter structure with current lesson highlighted
- [ ] Lesson completion persists
- [ ] Responsive layout works on mobile
- [ ] Breadcrumb navigation is correct
