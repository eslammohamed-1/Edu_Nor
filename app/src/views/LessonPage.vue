<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { findLessonById, getAdjacentLessons } from '@/data/lessons';
import { findCourseById } from '@/data/courses';
import { useCoursesStore } from '@/stores/courses';
import { useToast } from '@/composables/useToast';
import LessonPlayer from '@/components/courses/LessonPlayer.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppBadge from '@/components/common/AppBadge.vue';

const route = useRoute();
const router = useRouter();
const store = useCoursesStore();
const toast = useToast();

const lessonId = computed(() => route.params.lessonId as string);

const lessonData = computed(() => findLessonById(lessonId.value));
const lesson = computed(() => lessonData.value?.lesson);
const course = computed(() =>
  lessonData.value ? findCourseById(lessonData.value.courseId) : undefined
);
const currentChapterId = computed(() => lessonData.value?.chapterId);

const adjacent = computed(() => getAdjacentLessons(lessonId.value));

const expandedChapters = ref<Set<string>>(new Set());

watch(currentChapterId, (id) => {
  if (id) expandedChapters.value.add(id);
}, { immediate: true });

function toggleChapter(id: string) {
  if (expandedChapters.value.has(id)) {
    expandedChapters.value.delete(id);
  } else {
    expandedChapters.value.add(id);
  }
}

function goToLesson(id: string) {
  router.push(`/lessons/${id}`);
}

function markComplete() {
  if (!lesson.value) return;
  if (store.isLessonComplete(lesson.value.id)) {
    store.unmarkLessonComplete(lesson.value.id);
    toast.info('تم إلغاء علامة الإتمام');
  } else {
    store.markLessonComplete(lesson.value.id);
    toast.success('تم إتمام الدرس بنجاح 🎉');
  }
}
</script>

<template>
  <div class="lesson-page">
    <div v-if="lesson && course" class="lesson-layout">
      <div class="lesson-main">
        <nav class="breadcrumb font-ar">
          <RouterLink to="/subjects">المواد</RouterLink>
          <AppIcon name="ChevronLeft" :size="14" />
          <RouterLink :to="`/courses/${course.id}`">{{ course.title }}</RouterLink>
          <AppIcon name="ChevronLeft" :size="14" />
          <span class="current">{{ lesson.title }}</span>
        </nav>

        <LessonPlayer :video-url="lesson.videoUrl" :title="lesson.title" />

        <article class="lesson-article">
          <div class="lesson-head">
            <div>
              <AppBadge :variant="store.isLessonComplete(lesson.id) ? 'success' : 'teal'">
                {{ store.isLessonComplete(lesson.id) ? 'مكتمل' : 'قيد التعلم' }}
              </AppBadge>
              <h1 class="lesson-title text-navy font-ar">{{ lesson.title }}</h1>
              <p class="lesson-desc text-secondary font-ar">{{ lesson.description }}</p>
              <div class="lesson-meta">
                <span>
                  <AppIcon name="Clock" :size="16" />
                  {{ lesson.duration }} دقيقة
                </span>
                <span>
                  <AppIcon name="BookOpen" :size="16" />
                  {{ course.grade }}
                </span>
              </div>
            </div>
            <AppButton
              :variant="store.isLessonComplete(lesson.id) ? 'ghost' : 'primary'"
              @click="markComplete"
            >
              <AppIcon
                :name="store.isLessonComplete(lesson.id) ? 'CheckCircle2' : 'Circle'"
                :size="18"
              />
              <span style="margin-inline-start: 6px">
                {{ store.isLessonComplete(lesson.id) ? 'تم الإتمام' : 'تحديد كمكتمل' }}
              </span>
            </AppButton>
          </div>

          <div class="lesson-content" v-html="lesson.content"></div>

          <div v-if="lesson.keyPoints && lesson.keyPoints.length" class="key-points">
            <h3 class="font-ar text-navy">
              <AppIcon name="ListChecks" :size="20" color="var(--color-gold)" />
              النقاط الأساسية
            </h3>
            <ul>
              <li v-for="point in lesson.keyPoints" :key="point" class="font-ar">
                <AppIcon name="Check" :size="16" color="var(--color-success)" />
                {{ point }}
              </li>
            </ul>
          </div>

          <nav class="lesson-nav">
            <button
              class="nav-btn"
              :disabled="!adjacent.prev"
              @click="adjacent.prev && goToLesson(adjacent.prev.id)"
            >
              <AppIcon name="ChevronRight" :size="20" />
              <div class="nav-btn-info">
                <span class="nav-label font-ar">الدرس السابق</span>
                <strong v-if="adjacent.prev" class="font-ar">{{ adjacent.prev.title }}</strong>
              </div>
            </button>
            <button
              class="nav-btn nav-btn--next"
              :disabled="!adjacent.next"
              @click="adjacent.next && goToLesson(adjacent.next.id)"
            >
              <div class="nav-btn-info">
                <span class="nav-label font-ar">الدرس التالي</span>
                <strong v-if="adjacent.next" class="font-ar">{{ adjacent.next.title }}</strong>
              </div>
              <AppIcon name="ChevronLeft" :size="20" />
            </button>
          </nav>
        </article>
      </div>

      <aside class="lesson-sidebar">
        <div class="sidebar-head">
          <h3 class="font-ar text-navy">محتوى الكورس</h3>
          <p class="font-ar text-secondary">{{ course.lessonsCount }} درس</p>
        </div>
        <div class="sidebar-chapters">
          <div v-for="chapter in course.chapters" :key="chapter.id" class="sidebar-chapter">
            <button class="chapter-btn" @click="toggleChapter(chapter.id)">
              <span class="chapter-no font-en">{{ chapter.order }}</span>
              <span class="chapter-name font-ar">{{ chapter.title }}</span>
              <AppIcon
                :name="expandedChapters.has(chapter.id) ? 'ChevronUp' : 'ChevronDown'"
                :size="16"
              />
            </button>
            <div v-if="expandedChapters.has(chapter.id)" class="chapter-inner">
              <button
                v-for="l in chapter.lessons"
                :key="l.id"
                class="sidebar-lesson"
                :class="{ 'sidebar-lesson--active': l.id === lesson.id }"
                @click="goToLesson(l.id)"
              >
                <AppIcon
                  :name="store.isLessonComplete(l.id) ? 'CheckCircle2' : 'Circle'"
                  :size="16"
                  :color="store.isLessonComplete(l.id) ? 'var(--color-success)' : 'var(--text-muted)'"
                />
                <span class="font-ar">{{ l.title }}</span>
                <span class="duration-tag font-ar">{{ l.duration }}د</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div v-else class="not-found">
      <AppIcon name="SearchX" :size="64" color="var(--text-muted)" />
      <h2 class="text-navy font-ar">لم يتم العثور على الدرس</h2>
      <RouterLink to="/subjects">
        <AppButton>العودة إلى المواد</AppButton>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.lesson-page {
  padding: var(--space-xl) 0;
}

.lesson-layout {
  max-width: var(--max-content-width);
  margin: 0 auto;
  padding: 0 var(--space-md);
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: var(--space-xl);
}

.lesson-main {
  min-width: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-body-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.breadcrumb a { color: var(--text-secondary); }
.breadcrumb a:hover { color: var(--color-navy); }
.breadcrumb .current { color: var(--color-navy); font-weight: var(--weight-semibold); }

.lesson-article {
  background-color: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  margin-top: var(--space-lg);
  border: 1px solid var(--border-color);
}

.lesson-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
}

.lesson-title {
  font-size: var(--text-h2);
  margin: var(--space-sm) 0 var(--space-xs);
}

.lesson-desc {
  font-size: var(--text-body);
  margin-bottom: var(--space-md);
}

.lesson-meta {
  display: flex;
  gap: var(--space-lg);
  font-size: var(--text-body-sm);
  color: var(--text-secondary);
}

.lesson-meta span {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xxs);
}

.lesson-content {
  font-size: var(--text-body-lg);
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-xl);
}

.lesson-content :deep(p) {
  margin-bottom: var(--space-md);
}

.key-points {
  background-color: rgba(244, 168, 37, 0.06);
  border-inline-start: 4px solid var(--color-gold);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-xl);
}

.key-points h3 {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-h4);
  margin-bottom: var(--space-md);
}

.key-points ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.key-points li {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--text-primary);
}

.lesson-nav {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--border-color);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background-color: var(--bg-section);
  border-radius: var(--radius-md);
  flex: 1;
  max-width: 240px;
  text-align: start;
  transition: all var(--duration-fast);
}

.nav-btn:hover:not(:disabled) {
  background-color: var(--color-gold);
  color: var(--color-navy);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-btn--next {
  justify-content: flex-end;
  text-align: end;
}

.nav-btn-info {
  display: flex;
  flex-direction: column;
}

.nav-label {
  font-size: var(--text-caption);
  color: var(--text-muted);
}

.lesson-sidebar {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
  height: fit-content;
  position: sticky;
  top: calc(var(--navbar-height) + var(--space-md));
}

.sidebar-head {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
}

.sidebar-head h3 {
  font-size: var(--text-h4);
  font-weight: var(--weight-bold);
  margin-bottom: 2px;
}

.sidebar-head p {
  font-size: var(--text-caption);
}

.sidebar-chapters {
  max-height: 500px;
  overflow-y: auto;
}

.sidebar-chapter {
  border-bottom: 1px solid var(--border-color);
}

.chapter-btn {
  width: 100%;
  padding: var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  text-align: inherit;
  transition: background-color var(--duration-fast);
}

.chapter-btn:hover {
  background-color: var(--bg-section);
}

.chapter-no {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gold);
  color: var(--color-navy);
  border-radius: var(--radius-full);
  font-size: var(--text-caption);
  font-weight: var(--weight-bold);
  flex-shrink: 0;
}

.chapter-name {
  flex: 1;
  font-size: var(--text-body-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-navy);
}

.chapter-inner {
  display: flex;
  flex-direction: column;
  padding-bottom: var(--space-xs);
}

.sidebar-lesson {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md) var(--space-xs) calc(var(--space-md) + 30px);
  color: var(--text-secondary);
  font-size: var(--text-body-sm);
  text-align: inherit;
  transition: all var(--duration-fast);
}

.sidebar-lesson:hover {
  background-color: var(--bg-section);
  color: var(--color-navy);
}

.sidebar-lesson--active {
  background-color: rgba(244, 168, 37, 0.1);
  color: var(--color-navy);
  font-weight: var(--weight-semibold);
}

.sidebar-lesson span:first-of-type {
  flex: 1;
}

.duration-tag {
  font-size: var(--text-caption);
  color: var(--text-muted);
}

.not-found {
  text-align: center;
  padding: var(--space-4xl) var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

@media (max-width: 992px) {
  .lesson-layout {
    grid-template-columns: 1fr;
  }
  .lesson-sidebar {
    position: static;
  }
}
</style>
