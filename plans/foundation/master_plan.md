# EduNor — Master Plan | الخطة الرئيسية

## 🎯 Project Overview

| Key | Value |
|-----|-------|
| **Project** | EduNor — منصة تعليمية |
| **Stack** | Vue 3 + TypeScript + Vite |
| **Styling** | Vanilla CSS (Design System from Brand Guide) |
| **Router** | Vue Router 4 |
| **State** | Pinia |
| **Icons** | Lucide Icons (flat style) |
| **Fonts** | Cairo (Arabic) + Poppins (English) via Google Fonts |
| **Direction** | RTL-first (Arabic primary) |
| **Approach** | Mobile-first responsive |

---

## 📁 Project Structure

```
Edu_Nor/
├── skill/                        # Brand guides (already done ✅)
├── foundation/                   # Planning docs
│   ├── master_plan.md           # This file
│   ├── sub_plans/               # Detailed phase plans
│   └── tickets/                 # CSV ticket files
├── public/                      # Static assets
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── variables.css    # Design tokens
│   │   │   ├── reset.css        # CSS reset
│   │   │   ├── typography.css   # Font setup
│   │   │   ├── utilities.css    # Utility classes
│   │   │   └── animations.css   # Motion system
│   │   ├── images/
│   │   └── icons/
│   ├── components/
│   │   ├── common/              # Shared UI components
│   │   │   ├── AppButton.vue
│   │   │   ├── AppCard.vue
│   │   │   ├── AppInput.vue
│   │   │   ├── AppBadge.vue
│   │   │   ├── AppModal.vue
│   │   │   ├── AppToast.vue
│   │   │   ├── AppProgressBar.vue
│   │   │   ├── AppSkeleton.vue
│   │   │   └── AppIcon.vue
│   │   ├── layout/              # Layout components
│   │   │   ├── TheNavbar.vue
│   │   │   ├── TheFooter.vue
│   │   │   ├── TheSidebar.vue
│   │   │   └── TheLayout.vue
│   │   ├── home/                # Homepage sections
│   │   │   ├── HeroSection.vue
│   │   │   ├── FeaturesSection.vue
│   │   │   ├── SubjectsSection.vue
│   │   │   ├── StatsSection.vue
│   │   │   ├── TestimonialsSection.vue
│   │   │   └── CTASection.vue
│   │   ├── auth/                # Auth components
│   │   │   ├── LoginForm.vue
│   │   │   └── RegisterForm.vue
│   │   ├── courses/             # Course components
│   │   │   ├── SubjectCard.vue
│   │   │   ├── CourseCard.vue
│   │   │   ├── LessonCard.vue
│   │   │   └── LessonPlayer.vue
│   │   ├── dashboard/           # Dashboard components
│   │   │   ├── DashboardStats.vue
│   │   │   ├── RecentLessons.vue
│   │   │   ├── ProgressChart.vue
│   │   │   └── ProfileCard.vue
│   │   └── quiz/                # Quiz components
│   │       ├── QuizQuestion.vue
│   │       ├── QuizResults.vue
│   │       └── QuizProgress.vue
│   ├── composables/             # Vue composables
│   │   ├── useTheme.ts
│   │   ├── useAuth.ts
│   │   ├── useToast.ts
│   │   └── useBreakpoint.ts
│   ├── stores/                  # Pinia stores
│   │   ├── auth.ts
│   │   ├── courses.ts
│   │   ├── quiz.ts
│   │   └── theme.ts
│   ├── router/
│   │   └── index.ts
│   ├── types/                   # TypeScript types
│   │   ├── auth.ts
│   │   ├── course.ts
│   │   ├── quiz.ts
│   │   └── common.ts
│   ├── data/                    # Mock data (JSON)
│   │   ├── subjects.ts
│   │   ├── courses.ts
│   │   ├── lessons.ts
│   │   └── quizzes.ts
│   ├── views/                   # Page views
│   │   ├── HomePage.vue
│   │   ├── LoginPage.vue
│   │   ├── RegisterPage.vue
│   │   ├── SubjectsPage.vue
│   │   ├── CoursePage.vue
│   │   ├── LessonPage.vue
│   │   ├── QuizPage.vue
│   │   ├── DashboardPage.vue
│   │   ├── ProfilePage.vue
│   │   └── NotFoundPage.vue
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🏗️ Phases Overview

| Phase | الاسم | الوصف | الأولوية | التقدير |
|-------|-------|-------|---------|---------|
| **P1** | Project Setup & Design System | تأسيس المشروع + نظام التصميم | 🔴 Critical | 2-3 days |
| **P2** | Layout & Navigation | الهيكل العام + التنقل | 🔴 Critical | 1-2 days |
| **P3** | Landing Page | الصفحة الرئيسية | 🔴 Critical | 2-3 days |
| **P4** | Authentication | تسجيل الدخول والتسجيل | 🟡 High | 1-2 days |
| **P5** | Subjects & Courses | المواد والكورسات | 🟡 High | 2-3 days |
| **P6** | Lesson Viewer | عرض الدروس | 🟡 High | 2-3 days |
| **P7** | Quiz System | نظام الاختبارات | 🟢 Medium | 2-3 days |
| **P8** | Student Dashboard | لوحة الطالب | 🟢 Medium | 2-3 days |
| **P9** | Dark Mode & Polish | الوضع الليلي + التحسينات | 🔵 Low | 1-2 days |

**Total Estimate: ~16-24 days**

---

## 📋 Phase Summaries

### P1: Project Setup & Design System
- Initialize Vite + Vue 3 + TypeScript
- Install dependencies (Vue Router, Pinia, Lucide)
- Create CSS design system from brand guide (variables, reset, typography, utilities, animations)
- Build base UI components (Button, Card, Input, Badge, Modal, Toast, ProgressBar, Skeleton, Icon)

### P2: Layout & Navigation
- Create app layout (Navbar, Footer, Sidebar)
- Setup Vue Router with all routes
- Implement responsive navigation (hamburger menu on mobile)
- RTL layout configuration

### P3: Landing Page (Homepage)
- Hero section with CTA
- Features section (why EduNor)
- Subjects/grades browser
- Statistics section (animated counters)
- Testimonials carousel
- Final CTA section
- Full responsive design

### P4: Authentication
- Login page with form validation
- Register page with form validation
- Forgot password page
- Auth store (Pinia) with mock auth
- Protected routes setup
- Auth state persistence (localStorage)

### P5: Subjects & Courses
- Subjects listing page (grid of subjects with icons)
- Subject detail page (list of courses)
- Course card component with progress
- Course detail page (chapters & lessons list)
- Filter by grade/stage
- Mock data for subjects, courses, lessons

### P6: Lesson Viewer
- Lesson page layout (video area + notes sidebar)
- Video player placeholder (embedded YouTube-style)
- Lesson notes/content section
- Previous/Next lesson navigation
- Lesson completion tracking
- Related lessons suggestions

### P7: Quiz System
- Quiz taking interface (one question at a time)
- Multiple choice questions
- Timer (optional)
- Quiz progress indicator
- Results page with score + review
- Correct/incorrect feedback with explanations

### P8: Student Dashboard
- Dashboard overview (welcome, stats cards)
- Recent lessons widget
- Progress chart (per subject)
- My courses with progress bars
- Profile settings page
- Achievement badges

### P9: Dark Mode & Polish
- Dark mode toggle (composable + store)
- Dark mode CSS variables
- Accessibility audit (contrast, focus, keyboard)
- SEO meta tags for all pages
- Performance optimization
- Loading states & empty states
- 404 page
- Final responsive testing

---

## 🔗 Sub Plans & Tickets

| Phase | Sub Plan | Tickets |
|-------|----------|---------|
| P1 | [sub_plans/P1_setup_design_system.md](./sub_plans/P1_setup_design_system.md) | [tickets/P1_tickets.csv](./tickets/P1_tickets.csv) |
| P2 | [sub_plans/P2_layout_navigation.md](./sub_plans/P2_layout_navigation.md) | [tickets/P2_tickets.csv](./tickets/P2_tickets.csv) |
| P3 | [sub_plans/P3_landing_page.md](./sub_plans/P3_landing_page.md) | [tickets/P3_tickets.csv](./tickets/P3_tickets.csv) |
| P4 | [sub_plans/P4_authentication.md](./sub_plans/P4_authentication.md) | [tickets/P4_tickets.csv](./tickets/P4_tickets.csv) |
| P5 | [sub_plans/P5_subjects_courses.md](./sub_plans/P5_subjects_courses.md) | [tickets/P5_tickets.csv](./tickets/P5_tickets.csv) |
| P6 | [sub_plans/P6_lesson_viewer.md](./sub_plans/P6_lesson_viewer.md) | [tickets/P6_tickets.csv](./tickets/P6_tickets.csv) |
| P7 | [sub_plans/P7_quiz_system.md](./sub_plans/P7_quiz_system.md) | [tickets/P7_tickets.csv](./tickets/P7_tickets.csv) |
| P8 | [sub_plans/P8_student_dashboard.md](./sub_plans/P8_student_dashboard.md) | [tickets/P8_tickets.csv](./tickets/P8_tickets.csv) |
| P9 | [sub_plans/P9_dark_mode_polish.md](./sub_plans/P9_dark_mode_polish.md) | [tickets/P9_tickets.csv](./tickets/P9_tickets.csv) |

---

## ⚙️ Tech Decisions

| القرار | الاختيار | السبب |
|--------|---------|-------|
| Framework | Vue 3 Composition API | مطلوب من العميل + خفيف وسريع |
| Language | TypeScript | Type safety + أقل أخطاء |
| Build Tool | Vite | سريع جدًا في التطوير |
| CSS | Vanilla CSS + Custom Properties | تحكم كامل + متوافق مع الـ brand guide |
| State | Pinia | الـ official store لـ Vue 3 |
| Router | Vue Router 4 | الـ official router |
| Icons | Lucide Vue | خفيف + flat style + متوافق مع الهوية |
| Fonts | Google Fonts CDN | Cairo + Poppins |
| Mock Data | TypeScript files | مفيش backend دلوقتي |
| RTL | CSS `direction: rtl` + logical properties | Arabic-first |

---

> [!IMPORTANT]
> كل phase لازم يتراجع على الـ **Brand Guide** في `skill/edunor_brand_guide.md` قبل التنفيذ.
> الهوية البصرية هي الأساس — أي component لازم يطابق الألوان والخطوط والـ spacing المحددة.
