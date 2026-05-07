# U5 — Student Experience V2 | تجربة الطالب نسخة ٢

## 🎯 الهدف

تحويل واجهة الطالب من **عرض ثابت للمحتوى** إلى **رحلة تعلّم تفاعلية**: progress حقيقي، خطة دراسة، شهادات إنجاز، gamification light، onboarding، ومتابعة منهجية.

---

## 🧱 المهام

### 5.1 — Real Progress Tracking
- جداول جديدة: `LessonProgress` (userId, lessonId, status, watchedSeconds, completedAt).
- endpoint `POST /api/v1/me/progress/lesson` يحفظ progress (يُستدعى من video player).
- composable `useLessonProgress()` يعمل sync كل ٣٠ ثانية.
- UI: progress bar على كل LessonCard + checkmark على المنتهية.

### 5.2 — Study Plan ذكي
- خوارزمية بسيطة: للطلاب المسجلين، اقتراح الدرس التالي بناءً على:
  - اخر درس تم
  - subject نفسها
  - عدم تجاوز sequence المدرس وضعه
- صفحة `MyStudyPlanPage.vue` تعرض "ابدأ من هنا".
- widget في dashboard.

### 5.3 — Certificates
- جدول `Certificate` (id, userId, subjectId, issuedAt, hashSignature).
- يصدر تلقائياً عند:
  - إنهاء كل دروس subject (status=completed)
  - اجتياز quiz نهائي (passingScore)
- صفحة `CertificatePage.vue` بتصميم احترافي.
- زر "Print PDF" (puppeteer or jspdf).
- صفحة عامة `/cert/verify/:hash` للتحقق.

### 5.4 — Gamification Light
- جدول `UserStats` (userId, points, streakDays, lastActivityAt, badgesJson).
- منطق نقاط:
  - +5 لإكمال درس
  - +10 لاجتياز quiz
  - +50 لإنهاء كورس
- streak: ينقص لو فات يوم.
- badges: "First Lesson", "7-Day Streak", "Quiz Master", "Course Finisher".
- widget في dashboard + leaderboard أسبوعي للصف.

### 5.5 — Student Onboarding Flow
- بعد register: redirect إلى `/onboarding` ٣ خطوات:
  1. اختيار stage/grade (إذا لم يحدد).
  2. اختيار ٣ مواد للبداية.
  3. tour سريع للواجهة (3 highlights).
- skip button متاح.
- localStorage flag لمنع التكرار.

### 5.6 — Notifications للطالب
- جدول `Notification` (userId, type, payload, readAt).
- in-app bell dropdown + count.
- types: lesson_published, certificate_issued, streak_lost, new_quiz, badge_earned.
- endpoint SSE أو polling كل دقيقة.

### 5.7 — Bookmarks & Notes
- bookmarks على lessons (`UserBookmark` table).
- notes شخصية (`UserNote`: lessonId, body markdown).
- صفحة `MyNotesPage.vue` لتجميع الـ notes.
- search داخل notes.

### 5.8 — Video Player V2
- استبدال placeholder بـ player حقيقي يدعم:
  - HLS (hls.js) للـ adaptive streaming
  - playback speed (0.5x → 2x)
  - keyboard shortcuts
  - resume from last position
  - subtitles VTT
  - بيكب progress للسيرفر تلقائياً.

---

## ✅ Acceptance Criteria
- [ ] طالب يكمل درس → progress 100% بعد closing tab + open على جهاز ثاني.
- [ ] إنهاء subject كاملة + quiz نهائي → certificate يصدر تلقائياً.
- [ ] streak counter يحسب صح حتى لو timezone مختلف.
- [ ] dashboard يعرض next recommended lesson بدقة.
- [ ] new student يمر بـ onboarding flow كامل.
- [ ] notifications تظهر بدون تأخير ملحوظ.
- [ ] video player resume يحفظ آخر ثانية.

---

## 🔗 ملفات

```
server/prisma/schema.prisma                # LessonProgress, Certificate, UserStats, Notification, UserBookmark, UserNote
server/src/routes/me/progress.ts           # جديد
server/src/routes/me/notifications.ts      # جديد
server/src/routes/me/certificates.ts       # جديد
server/src/lib/gamification.ts             # جديد
server/src/lib/study-plan.ts               # جديد
app/src/composables/useLessonProgress.ts   # جديد
app/src/composables/useNotifications.ts    # جديد
app/src/views/MyStudyPlanPage.vue          # جديد
app/src/views/MyNotesPage.vue              # جديد
app/src/views/CertificatePage.vue          # جديد
app/src/views/OnboardingPage.vue           # جديد
app/src/components/student/StreakWidget.vue # جديد
app/src/components/student/BadgesGrid.vue  # جديد
app/src/components/courses/VideoPlayerV2.vue # جديد
app/src/components/common/NotificationBell.vue # جديد
```
