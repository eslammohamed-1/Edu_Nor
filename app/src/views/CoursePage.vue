<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { findSubjectBySlug } from '@/data/subjects';
import { findCourseById } from '@/data/courses';
import { useCoursesStore } from '@/stores/courses';
import CourseCard from '@/components/courses/CourseCard.vue';
import LessonCard from '@/components/courses/LessonCard.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import AppButton from '@/components/common/AppButton.vue';

import { useAuth } from '@/composables/useAuth';
import { stageLabel } from '@/config/educationTracks';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const store = useCoursesStore();
const { user } = useAuth();
const { subjectsScope, stageFilter } = storeToRefs(store);

const subjectSlug = computed(() => route.params.subjectSlug as string | undefined);
const courseId = computed(() => route.params.courseId as string | undefined);

const subject = computed(() => (subjectSlug.value ? findSubjectBySlug(subjectSlug.value) : undefined));
const course = computed(() => (courseId.value ? findCourseById(courseId.value) : undefined));
const subjectCourses = computed(() => (subject.value ? store.filteredCoursesBySubject(subject.value.id) : []));

const listContextLabel = computed(() => {
  if (subjectsScope.value === 'my' && user.value?.grade) {
    let text = `يعرض كورسات ${user.value.grade}`;
    if (user.value.stage === 'secondary' && user.value.secondaryTrack) {
      const trackName = user.value.secondaryTrack === 'scientific_ar' || user.value.secondaryTrack === 'scientific_languages' ? 'علمي' : 'أدبي';
      text += ` (${trackName})`;
    }
    return text + ' — بناءً على حسابك';
  } else if (stageFilter.value !== 'all') {
    return `يعرض كورسات المرحلة ${stageLabel(stageFilter.value as any)}`;
  }
  return 'يعرض جميع الكورسات لجميع المراحل';
});

const expandedChapters = ref<Set<string>>(new Set());

function toggleChapter(id: string) {
  if (expandedChapters.value.has(id)) {
    expandedChapters.value.delete(id);
  } else {
    expandedChapters.value.add(id);
  }
}

function openLesson(lessonId: string) {
  router.push(`/lessons/${lessonId}`);
}
</script>

<template>
  <div class="course-page">
    <div v-if="course" class="container">
      <nav class="breadcrumb font-ar">
        <RouterLink to="/subjects">المواد</RouterLink>
        <AppIcon name="ChevronLeft" :size="14" />
        <RouterLink v-if="subject" :to="`/subjects/${subject.slug}`">{{ subject.name }}</RouterLink>
        <template v-else>
          <span>المادة</span>
        </template>
        <AppIcon name="ChevronLeft" :size="14" />
        <span class="current">{{ course.title }}</span>
      </nav>

      <header class="course-header">
        <div class="course-header-body">
          <h1 class="course-title text-navy font-ar">{{ course.title }}</h1>
          <p class="course-description text-secondary font-ar">{{ course.description }}</p>

          <div class="course-meta">
            <span class="meta-item">
              <AppIcon name="User" :size="16" />
              {{ course.instructor }}
            </span>
            <span class="meta-item">
              <AppIcon name="GraduationCap" :size="16" />
              {{ course.grade }}
            </span>
            <span
              v-if="course.academicYear"
              class="meta-item"
              title="العام الدراسي (جدول المنهج المستورد)"
            >
              <AppIcon name="Calendar" :size="16" />
              {{ course.academicYear }}<span v-if="course.term != null" class="font-en"> — فصل {{ course.term }}</span>
            </span>
            <span v-if="course.rating > 0" class="meta-item">
              <AppIcon name="Star" :size="16" color="var(--color-gold)" />
              {{ course.rating }}
            </span>
            <span class="meta-item">
              <AppIcon name="Users" :size="16" />
              {{ course.studentsCount.toLocaleString('ar-EG') }} طالب
            </span>
          </div>

          <div class="course-actions">
            <AppButton size="lg" @click="course.chapters[0] && openLesson(course.chapters[0].lessons[0].id)">
              ابدأ التعلم الآن
            </AppButton>
          </div>
        </div>
      </header>

      <section class="chapters-section">
        <h2 class="section-title text-navy font-ar">محتوى الكورس</h2>
        <p class="text-secondary font-ar mb-lg">
          {{ course.chapters.length }} فصل • {{ course.lessonsCount }} درس
        </p>

        <div class="chapters-list">
          <div
            v-for="chapter in course.chapters"
            :key="chapter.id"
            class="chapter-card"
          >
            <button class="chapter-header" @click="toggleChapter(chapter.id)">
              <div class="chapter-head-info">
                <span class="chapter-number font-en">{{ chapter.order }}</span>
                <div>
                  <h3 class="chapter-title font-ar">{{ chapter.title }}</h3>
                  <p class="chapter-desc text-secondary font-ar">{{ chapter.description }}</p>
                </div>
              </div>
              <div class="chapter-toggle">
                <span class="font-ar">{{ chapter.lessons.length }} درس</span>
                <AppIcon
                  :name="expandedChapters.has(chapter.id) ? 'ChevronUp' : 'ChevronDown'"
                  :size="20"
                />
              </div>
            </button>

            <div v-if="expandedChapters.has(chapter.id)" class="chapter-lessons animate-fade-in">
              <LessonCard
                v-for="(lesson, idx) in chapter.lessons"
                :key="lesson.id"
                :lesson="lesson"
                :index="idx + 1"
                :completed="store.isLessonComplete(lesson.id)"
                @click="openLesson(lesson.id)"
              />
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Subject page view (listing courses by subject) -->
    <div v-else-if="subject" class="container">
      <nav class="breadcrumb font-ar">
        <RouterLink to="/subjects">المواد</RouterLink>
        <AppIcon name="ChevronLeft" :size="14" />
        <span class="current">{{ subject.name }}</span>
      </nav>

      <header class="subject-header">
        <div class="subject-icon" :style="{ backgroundColor: subject.color + '15' }">
          <AppIcon :name="subject.icon" :size="48" :color="subject.color" />
        </div>
        <h1 class="course-title text-navy font-ar">{{ subject.name }}</h1>
        <p class="text-secondary font-ar max-w-sm">{{ subject.description }}</p>
        <div class="context-badge font-ar mt-sm">
          <AppIcon name="Info" :size="14" />
          {{ listContextLabel }}
        </div>
      </header>

      <section>
        <h2 class="section-title text-navy font-ar mb-lg">الكورسات المتاحة</h2>
        <div v-if="subjectCourses.length === 0" class="empty-state">
          <AppIcon name="BookX" :size="48" color="var(--text-muted)" />
          <p class="text-secondary font-ar">لا توجد كورسات متاحة حالياً.</p>
        </div>
        <div v-else class="courses-grid">
          <CourseCard
            v-for="c in subjectCourses"
            :key="c.id"
            :course="c"
            :progress="store.courseProgress(c.id)"
          />
        </div>
      </section>
    </div>

    <div v-else class="container not-found">
      <AppIcon name="SearchX" :size="64" color="var(--text-muted)" />
      <h2 class="text-navy font-ar">لم يتم العثور على الكورس</h2>
      <RouterLink to="/subjects">
        <AppButton>العودة إلى المواد</AppButton>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.course-page {
  padding: var(--space-2xl) 0 var(--space-4xl);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-body-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
}

.breadcrumb a {
  color: var(--text-secondary);
}

.breadcrumb a:hover {
  color: var(--color-navy);
}

.breadcrumb .current {
  color: var(--color-navy);
  font-weight: var(--weight-semibold);
}

.course-header {
  background: linear-gradient(135deg, var(--bg-section) 0%, var(--bg-page) 100%);
  padding: var(--space-2xl);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-2xl);
  border: 1px solid var(--border-color);
}

.course-title {
  font-size: var(--text-h1);
  margin-bottom: var(--space-sm);
}

.course-description {
  font-size: var(--text-body-lg);
  margin-bottom: var(--space-lg);
  max-width: 700px;
}

.course-meta {
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
  margin-bottom: var(--space-lg);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-body-sm);
  color: var(--text-secondary);
}

.course-actions {
  display: flex;
  gap: var(--space-md);
}

.section-title {
  font-size: var(--text-h2);
  margin-bottom: var(--space-xs);
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.chapter-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.chapter-header {
  width: 100%;
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: inherit;
  transition: background-color var(--duration-fast);
}

.chapter-header:hover {
  background-color: var(--bg-section);
}

.chapter-head-info {
  display: flex;
  gap: var(--space-md);
  align-items: center;
}

.chapter-number {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background-color: var(--color-gold);
  color: var(--color-navy);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--weight-bold);
  font-size: var(--text-body);
  flex-shrink: 0;
}

.chapter-title {
  font-size: var(--text-h4);
  font-weight: var(--weight-semibold);
  color: var(--color-navy);
}

.chapter-desc {
  font-size: var(--text-caption);
  margin-top: 2px;
}

.chapter-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--text-secondary);
  font-size: var(--text-body-sm);
}

.chapter-lessons {
  padding: var(--space-md) var(--space-lg) var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  border-top: 1px solid var(--border-color);
}

.subject-header {
  text-align: center;
  padding: var(--space-2xl) 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-2xl);
}

.subject-icon {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-md);
}

.max-w-sm { max-width: 600px; }

.context-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--bg-section);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: var(--text-caption);
  border: 1px solid var(--border-color);
}

.mt-sm { margin-top: var(--space-sm); }

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-lg);
}

.empty-state {
  text-align: center;
  padding: var(--space-3xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.not-found {
  text-align: center;
  padding: var(--space-4xl) var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.mb-lg { margin-bottom: var(--space-lg); }
</style>
