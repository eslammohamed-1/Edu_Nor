# P2: Layout & Navigation | الهيكل العام والتنقل

## 🎯 الهدف
بناء الهيكل العام للتطبيق (Navbar + Footer + Sidebar) وإعداد الـ Router مع responsive navigation.

---

## 📦 المهام

### 2.1 — Vue Router Setup
**File:** `src/router/index.ts`
- Define all routes:
  - `/` → HomePage
  - `/login` → LoginPage
  - `/register` → RegisterPage
  - `/subjects` → SubjectsPage
  - `/subjects/:subjectId` → CoursePage
  - `/lesson/:lessonId` → LessonPage
  - `/quiz/:quizId` → QuizPage
  - `/dashboard` → DashboardPage (protected)
  - `/profile` → ProfilePage (protected)
  - `/:pathMatch(.*)*` → NotFoundPage
- Route guards for protected routes
- Scroll behavior (top on navigation)
- Page title meta

### 2.2 — TheNavbar Component
**File:** `src/components/layout/TheNavbar.vue`
- Logo (left/right for RTL)
- Navigation links: الرئيسية, المواد, لوحة التحكم
- Auth buttons: تسجيل الدخول, إنشاء حساب (when logged out)
- User avatar + dropdown (when logged in)
- Dark mode toggle button
- Hamburger menu for mobile
- Sticky/fixed top with backdrop blur
- Active route highlighting
- Responsive: full nav on desktop, drawer on mobile

### 2.3 — Mobile Navigation Drawer
- Slide-in drawer from right (RTL)
- Overlay backdrop
- Close on navigation + backdrop click
- Same links as desktop nav
- Smooth transition

### 2.4 — TheFooter Component
**File:** `src/components/layout/TheFooter.vue`
- Logo + tagline "افهم مش تحفظ"
- Quick links: الرئيسية, المواد, من نحن
- Social links: Facebook, YouTube, Instagram
- Contact info placeholder
- Copyright text
- Navy blue background with gold accents
- Responsive grid (3 columns → 1 column on mobile)

### 2.5 — TheSidebar Component
**File:** `src/components/layout/TheSidebar.vue`
- For lesson/dashboard pages only
- Collapsible on desktop
- Hidden by default on mobile (overlay when opened)
- Navigation items with icons
- Active state highlighting

### 2.6 — TheLayout Component
**File:** `src/components/layout/TheLayout.vue`
- Wraps Navbar + main content + Footer
- `<router-view>` in main area
- Conditional sidebar based on route
- Scroll-to-top on route change

### 2.7 — App.vue Update
- Import global CSS files
- Use TheLayout as wrapper
- Toast container placement
- Theme provider (data-theme attribute)

---

## ✅ Acceptance Criteria
- [ ] All routes navigate correctly
- [ ] Navbar responsive: full on desktop, hamburger on mobile
- [ ] Mobile drawer opens/closes smoothly
- [ ] Footer renders correctly with RTL layout
- [ ] Active route is highlighted in nav
- [ ] Protected routes redirect to login
- [ ] Page titles update on navigation
