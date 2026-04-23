# P9: Dark Mode & Polish | الوضع الليلي والتحسينات

## 🎯 الهدف
إضافة Dark Mode وتحسين الأداء والـ Accessibility والـ SEO والحالات الفارغة.

---

## 📦 المهام

### 9.1 — Theme System
- `useTheme` composable: toggle, detect OS preference, persist in localStorage
- Theme store (Pinia): currentTheme
- `[data-theme="dark"]` CSS variables activation
- Toggle button in navbar (sun/moon icon)

### 9.2 — Dark Mode CSS
- Apply dark palette from brand guide to all components
- Test contrast ratios meet WCAG AA
- Smooth transition between modes

### 9.3 — Accessibility Audit
- Focus indicators on all interactive elements
- Keyboard navigation for modals, drawers, quizzes
- ARIA labels for icons and interactive elements
- Min touch target 44px on mobile
- Form labels and error descriptions

### 9.4 — SEO Meta Tags
- Unique title + meta description for every page
- Open Graph tags for social sharing
- Semantic HTML review (h1 hierarchy, landmarks)

### 9.5 — Loading & Empty States
- Skeleton loaders for: subjects grid, course list, lesson content, dashboard stats
- Empty states with illustration + message + CTA
- Error states with retry button

### 9.6 — 404 Not Found Page
**File:** `src/views/NotFoundPage.vue`
- Friendly illustration
- "الصفحة مش موجودة" message
- "رجوع للرئيسية" button
- Brand-consistent design

### 9.7 — Performance
- Lazy-load route components
- Image optimization
- CSS cleanup (remove unused)
- Bundle size review

### 9.8 — Final Testing
- Test all pages on: mobile, tablet, desktop
- Test RTL layout
- Test dark/light mode switching
- Test keyboard navigation
- Cross-browser check

---

## ✅ Acceptance Criteria
- [ ] Dark mode toggles correctly with smooth transition
- [ ] OS preference detected on first visit
- [ ] All pages have SEO meta tags
- [ ] Skeleton loaders appear during loading
- [ ] Empty states show friendly messages
- [ ] 404 page is brand-consistent
- [ ] All accessibility checks pass
- [ ] Performance: fast initial load
