# P8: Student Dashboard | لوحة الطالب

## 🎯 الهدف
بناء لوحة تحكم للطالب تعرض تقدمه وكورساته ونتائجه.

---

## 📦 المهام

### 8.1 — DashboardStats Component
- Welcome message with student name
- 4 stat cards: دروس مكتملة, كورسات نشطة, نتيجة الاختبارات, ساعات التعلم
- Animated numbers, brand colors

### 8.2 — RecentLessons Component
- Last 5 lessons accessed
- Lesson title + subject + date + resume button
- Empty state if no lessons

### 8.3 — ProgressChart Component
- Visual progress per subject (bar chart or progress bars)
- Brand colors per subject
- Percentage labels

### 8.4 — ProfileCard Component
- Avatar, name, email, grade
- Edit profile button

### 8.5 — DashboardPage View
**File:** `src/views/DashboardPage.vue`
- Grid layout: stats (top), recent + progress (middle), profile (sidebar)
- Responsive: stack on mobile

### 8.6 — ProfilePage View
**File:** `src/views/ProfilePage.vue`
- Edit name, email, grade
- Change password section
- Avatar upload placeholder
- Save button with validation

---

## ✅ Acceptance Criteria
- [ ] Dashboard shows correct user data
- [ ] Stats display with animations
- [ ] Progress charts render correctly
- [ ] Profile edit works and persists
- [ ] Responsive on all breakpoints
