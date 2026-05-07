<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCurriculumStore } from '@/stores/curriculum';
import { useQuizStore } from '@/stores/quiz';
import { useToast } from '@/composables/useToast';
import LessonPlayer from '@/components/courses/LessonPlayer.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppBadge from '@/components/common/AppBadge.vue';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

const route = useRoute();
const router = useRouter();
const store = useCurriculumStore();
const quizStore = useQuizStore();
const toast = useToast();

const lessonId = computed(() => route.params.lessonId as string);

const lessonData = computed(() => store.findLessonById(lessonId.value));
const lesson = computed(() => lessonData.value?.lesson);
const subject = computed(() => lessonData.value?.subject);
const safeLessonContent = computed(() => sanitizeHtml(lesson.value?.content ?? ''));

const adjacent = computed(() => store.getAdjacentLessons(lessonId.value));
const relatedQuiz = computed(() =>
  lessonId.value ? quizStore.findQuizByLessonId(lessonId.value) : undefined
);

// Sidebar: all lessons in the same subject
const sidebarLessons = computed(() => subject.value?.lessons ?? []);

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
    <div v-if="lesson && subject" class="lesson-layout">
      <div class="lesson-main">
        <nav class="breadcrumb font-ar">
          <RouterLink to="/subjects">المواد</RouterLink>
          <AppIcon name="ChevronLeft" :size="14" />
          <RouterLink :to="`/subjects/${subject.id}`">{{ subject.name }}</RouterLink>
          <AppIcon name="ChevronLeft" :size="14" />
          <span class="current">{{ lesson.title }}</span>
        </nav>

        <LessonPlayer :video-url="lesson.videoUrl ?? undefined" :title="lesson.title" />

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
                  {{ subject.name }}
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

          <!-- Sections -->
          <div v-if="lesson.sections && lesson.sections.length > 0" class="sections-list">
            <h3 class="font-ar text-navy sections-heading">
              <AppIcon name="Layers" :size="20" color="var(--color-gold)" />
              أقسام الدرس
            </h3>
            <div v-for="section in lesson.sections" :key="section.id" class="section-item">
              <AppIcon
                :name="section.hasQuiz ? 'HelpCircle' : 'FileText'"
                :size="18"
                :color="section.hasQuiz ? 'var(--color-gold)' : 'var(--color-navy)'"
              />
              <span class="font-ar">{{ section.title }}</span>
              <AppBadge v-if="section.hasQuiz" variant="gold" size="sm">اختبار</AppBadge>
            </div>
          </div>

          <div class="lesson-content" v-html="safeLessonContent"></div>

          <div v-if="relatedQuiz" class="lesson-quiz-banner">
            <div class="quiz-banner-info">
              <AppIcon name="HelpCircle" :size="32" color="var(--color-gold)" />
              <div>
                <h3 class="font-ar text-navy">اختبار الدرس: {{ relatedQuiz.title }}</h3>
                <p class="font-ar text-secondary">قس مدى استيعابك لهذا الدرس بإجراء اختبار سريع مكون من {{ relatedQuiz.questions.length }} سؤال.</p>
              </div>
            </div>
            <AppButton @click="router.push(`/quiz/${relatedQuiz.id}`)">
              ابدأ الاختبار الآن
            </AppButton>
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
          <h3 class="font-ar text-navy">دروس المادة</h3>
          <p class="font-ar text-secondary">{{ sidebarLessons.length }} درس</p>
        </div>
        <div class="sidebar-lessons">
          <button
            v-for="l in sidebarLessons"
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

.sections-list {
  background-color: rgba(244, 168, 37, 0.04);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.sections-heading {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-h4);
  margin-bottom: var(--space-md);
}

.section-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) 0;
  color: var(--text-primary);
  font-size: var(--text-body-sm);
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

.lesson-quiz-banner {
  background: linear-gradient(135deg, var(--bg-section) 0%, rgba(244, 168, 37, 0.05) 100%);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  margin-bottom: var(--space-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.quiz-banner-info {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  flex: 1;
  min-width: 280px;
}

.quiz-banner-info h3 {
  font-size: var(--text-h4);
  margin-bottom: 4px;
}

.quiz-banner-info p {
  font-size: var(--text-body-sm);
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

.sidebar-lessons {
  max-height: 500px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-lesson {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  color: var(--text-secondary);
  font-size: var(--text-body-sm);
  text-align: inherit;
  transition: all var(--duration-fast);
  border-bottom: 1px solid var(--border-color);
}

.sidebar-lesson:last-child {
  border-bottom: none;
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
