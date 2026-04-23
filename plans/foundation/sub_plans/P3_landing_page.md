# P3: Landing Page | الصفحة الرئيسية

## 🎯 الهدف
بناء صفحة رئيسية جذابة ومتجاوبة تعكس هوية EduNor وتشجع الطالب على التسجيل.

---

## 📦 المهام

### 3.1 — HeroSection
**File:** `src/components/home/HeroSection.vue`
- Navy gradient background
- Main heading: "افهم مش تحفظ" (Gold, large Cairo Bold)
- Subtitle: وصف المنصة في سطرين (White)
- Two CTA buttons: "ابدأ دلوقتي" (Primary Gold) + "اعرف أكتر" (Secondary/Ghost)
- Decorative: floating educational icons/shapes with subtle animation
- Animated entrance (fade + slide up)
- Full viewport height on desktop, auto on mobile
- Responsive text sizes

### 3.2 — FeaturesSection
**File:** `src/components/home/FeaturesSection.vue`
- Section title: "ليه EduNor؟" (Navy, Bold)
- 4 feature cards in grid:
  - 📖 "دروس مبسطة" — شرح سهل وواضح
  - 💡 "افهم مش تحفظ" — ركز على الفهم
  - 🎓 "كل المراحل" — ابتدائي وإعدادي وثانوي
  - 📈 "تابع تقدمك" — شوف مستواك وتحسنك
- Each card: icon (Teal circle bg) + title + description
- Card hover effect (lift + shadow)
- White/Light gray background
- Staggered entrance animation on scroll
- Responsive: 2×2 grid → 1 column on mobile

### 3.3 — SubjectsSection
**File:** `src/components/home/SubjectsSection.vue`
- Section title: "المواد المتاحة"
- Grade tabs/pills: ابتدائي | إعدادي | ثانوي
- Grid of subject cards for selected grade
- Each card: subject icon + name + lesson count
- CTA: "شوف كل المواد"
- Responsive grid

### 3.4 — StatsSection
**File:** `src/components/home/StatsSection.vue`
- Navy background with gradient
- 4 animated stat counters:
  - "+٥٠٠" درس
  - "+١٠٠٠" طالب
  - "+٣٠" مادة
  - "٩٥%" رضا الطلاب
- Gold numbers (large) + White labels
- Animate numbers counting up on scroll (intersection observer)
- Responsive: 4 columns → 2×2 on mobile

### 3.5 — TestimonialsSection
**File:** `src/components/home/TestimonialsSection.vue`
- Section title: "رأي طلابنا"
- Carousel of testimonial cards
- Each card: quote text + student name + grade
- Navigation dots/arrows
- Auto-play with pause on hover
- White background
- Responsive

### 3.6 — CTASection
**File:** `src/components/home/CTASection.vue`
- Gold gradient background
- Heading: "جاهز تبدأ رحلة التعلم؟"
- Subtitle: "سجل دلوقتي وابدأ أول درس مجانًا"
- CTA button: "إنشاء حساب مجاني" (Navy on Gold)
- Navy text on gold background
- Responsive

### 3.7 — HomePage Assembly
**File:** `src/views/HomePage.vue`
- Assemble all sections in order:
  1. HeroSection
  2. FeaturesSection
  3. SubjectsSection
  4. StatsSection
  5. TestimonialsSection
  6. CTASection
- SEO: title + meta description
- Smooth scroll between sections

---

## ✅ Acceptance Criteria
- [ ] Hero section is visually stunning with animations
- [ ] All sections are fully responsive
- [ ] Stats counter animates on scroll
- [ ] Testimonials carousel works
- [ ] All colors/fonts match brand guide
- [ ] CTAs link to correct routes
- [ ] Page loads fast (no unnecessary assets)
