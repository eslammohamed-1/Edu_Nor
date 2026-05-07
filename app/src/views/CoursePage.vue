<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCurriculumStore } from '@/stores/curriculum';
import { getApiBase } from '@/services/http/client';
import { readStoredAuth } from '@/lib/authStorage';
import { fetchMyLessonProgress } from '@/services/lessonProgressService';
import type { LessonProgressItem } from '@/services/lessonProgressService';
import type { LessonInfo } from '@/types/course';
import LessonCard from '@/components/courses/LessonCard.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import AppButton from '@/components/common/AppButton.vue';

const route = useRoute();
const router = useRouter();
const store = useCurriculumStore();

const subjectId = computed(() => route.params.subjectSlug as string | undefined);

const subject = computed(() =>
  subjectId.value ? store.findSubjectById(subjectId.value) : undefined
);

const firstLesson = computed(() => subject.value?.lessons?.[0]);

// Group lessons by unitTitle
const lessonGroups = computed(() => {
  if (!subject.value) return [];
  const groups: Array<{ title: string; lessons: typeof subject.value.lessons }> = [];
  let currentGroup: typeof groups[0] | null = null;

  for (const lesson of subject.value.lessons) {
    const unitTitle = lesson.unitTitle || 'دروس عامة';
    if (!currentGroup || currentGroup.title !== unitTitle) {
      currentGroup = { title: unitTitle, lessons: [] };
      groups.push(currentGroup);
    }
    currentGroup.lessons.push(lesson);
  }
  return groups;
});

const expandedGroups = ref<Set<string>>(new Set());

// Expand first group by default
if (lessonGroups.value.length > 0) {
  expandedGroups.value.add(lessonGroups.value[0].title);
}

function toggleGroup(title: string) {
  if (expandedGroups.value.has(title)) {
    expandedGroups.value.delete(title);
  } else {
    expandedGroups.value.add(title);
  }
}

function openLesson(lessonId: string) {
  router.push(`/lessons/${lessonId}`);
}

const apiProgressByLesson = ref<Map<string, LessonProgressItem>>(new Map());

onMounted(async () => {
  if (!getApiBase() || !readStoredAuth()?.token) return;
  try {
    const items = await fetchMyLessonProgress();
    const m = new Map<string, LessonProgressItem>();
    const completedIds: string[] = [];
    for (const it of items) {
      m.set(it.lessonId, it);
      if (it.status === 'completed') completedIds.push(it.lessonId);
    }
    apiProgressByLesson.value = m;
    store.mergeCompletedFromServer(completedIds);
  } catch {
    /* غير مسجّل أو لا خادم */
  }
});

function lessonDone(id: string): boolean {
  const row = apiProgressByLesson.value.get(id);
  return store.isLessonComplete(id) || row?.status === 'completed';
}

function lessonProgressPercent(lesson: LessonInfo): number | undefined {
  if (lessonDone(lesson.id)) return 100;
  const row = apiProgressByLesson.value.get(lesson.id);
  if (!row || lesson.duration <= 0) return undefined;
  const totalSec = lesson.duration * 60;
  if (totalSec <= 0) return undefined;
  return Math.min(99, Math.round((row.watchedSeconds / totalSec) * 100));
}

const progress = computed(() =>
  subject.value ? store.subjectProgress(subject.value.id) : 0
);
</script>

<template>
  <div class="subject-detail-page">
    <div v-if="subject" class="container">
      <nav class="breadcrumb font-ar">
        <RouterLink to="/subjects">المواد</RouterLink>
        <AppIcon name="ChevronLeft" :size="14" />
        <span class="current">{{ subject.name }}</span>
      </nav>

      <header class="subject-header">
        <div class="subject-icon" :style="{ backgroundColor: subject.color + '15' }">
          <AppIcon :name="subject.icon" :size="48" :color="subject.color" />
        </div>
        <div class="subject-header-body">
          <h1 class="subject-title text-navy font-ar">{{ subject.name }}</h1>
          <div class="subject-meta">
            <span class="meta-item">
              <AppIcon name="BookOpen" :size="16" />
              {{ subject.lessons.length }} درس
            </span>
            <span v-if="progress > 0" class="meta-item">
              <AppIcon name="TrendingUp" :size="16" color="var(--color-success)" />
              {{ progress }}% مكتمل
            </span>
          </div>
          <div class="subject-actions">
            <AppButton size="lg" :disabled="!firstLesson" @click="firstLesson && openLesson(firstLesson.id)">
              ابدأ التعلم الآن
            </AppButton>
          </div>
        </div>
      </header>

      <section class="lessons-section">
        <h2 class="section-title text-navy font-ar">محتوى المادة</h2>
        <p class="text-secondary font-ar mb-lg">
          {{ lessonGroups.length }} وحدة • {{ subject.lessons.length }} درس
        </p>

        <div class="lessons-groups">
          <div
            v-for="(group, idx) in lessonGroups"
            :key="group.title"
            class="group-card"
          >
            <button class="group-header" @click="toggleGroup(group.title)">
              <div class="group-head-info">
                <span class="group-number font-en">{{ idx + 1 }}</span>
                <div>
                  <h3 class="group-title font-ar">{{ group.title }}</h3>
                </div>
              </div>
              <div class="group-toggle">
                <span class="font-ar">{{ group.lessons.length }} درس</span>
                <AppIcon
                  :name="expandedGroups.has(group.title) ? 'ChevronUp' : 'ChevronDown'"
                  :size="20"
                />
              </div>
            </button>

            <div v-if="expandedGroups.has(group.title)" class="group-lessons animate-fade-in">
              <LessonCard
                v-for="(lesson, lidx) in group.lessons"
                :key="lesson.id"
                :lesson="lesson"
                :index="lidx + 1"
                :completed="lessonDone(lesson.id)"
                :progress-percent="lessonProgressPercent(lesson)"
                @click="openLesson(lesson.id)"
              />
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="container not-found">
      <AppIcon name="SearchX" :size="64" color="var(--text-muted)" />
      <h2 class="text-navy font-ar">لم يتم العثور على المادة</h2>
      <RouterLink to="/subjects">
        <AppButton>العودة إلى المواد</AppButton>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.subject-detail-page {
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

.breadcrumb a { color: var(--text-secondary); }
.breadcrumb a:hover { color: var(--color-navy); }
.breadcrumb .current { color: var(--color-navy); font-weight: var(--weight-semibold); }

.subject-header {
  background: linear-gradient(135deg, var(--bg-section) 0%, var(--bg-page) 100%);
  padding: var(--space-2xl);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-2xl);
  border: 1px solid var(--border-color);
  display: flex;
  gap: var(--space-xl);
  align-items: flex-start;
}

.subject-icon {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.subject-title {
  font-size: var(--text-h1);
  margin-bottom: var(--space-sm);
}

.subject-meta {
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

.subject-actions {
  display: flex;
  gap: var(--space-md);
}

.section-title {
  font-size: var(--text-h2);
  margin-bottom: var(--space-xs);
}

.lessons-groups {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.group-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.group-header {
  width: 100%;
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: inherit;
  transition: background-color var(--duration-fast);
}

.group-header:hover {
  background-color: var(--bg-section);
}

.group-head-info {
  display: flex;
  gap: var(--space-md);
  align-items: center;
}

.group-number {
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

.group-title {
  font-size: var(--text-h4);
  font-weight: var(--weight-semibold);
  color: var(--color-navy);
}

.group-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--text-secondary);
  font-size: var(--text-body-sm);
}

.group-lessons {
  padding: var(--space-md) var(--space-lg) var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  border-top: 1px solid var(--border-color);
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

@media (max-width: 768px) {
  .subject-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
