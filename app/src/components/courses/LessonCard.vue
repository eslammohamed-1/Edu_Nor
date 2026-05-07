<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue';
import type { LessonInfo } from '@/types/course';

interface Props {
  lesson: LessonInfo;
  /** مُكمَلو محليًا أو من الخادم */
  completed?: boolean;
  /** 0–100؛ عند غيابها لا يُعرض شريط التقدّم */
  progressPercent?: number;
  active?: boolean;
  index?: number;
}

defineProps<Props>();

function iconForType(type: string): string {
  if (type === 'video') return 'PlayCircle';
  if (type === 'quiz') return 'HelpCircle';
  return 'FileText';
}

function formatDuration(minutes: number): string {
  return `${minutes} دقيقة`;
}
</script>

<template>
  <div
    class="lesson-card transition-all"
    :class="{ 'lesson-card--active': active, 'lesson-card--done': completed }"
  >
    <div class="lesson-card-inner">
      <div class="lesson-index">
        <AppIcon v-if="completed" name="CheckCircle2" :size="22" color="var(--color-success)" />
        <span v-else class="index-num font-en">{{ index ?? lesson.order }}</span>
      </div>

      <div class="lesson-type">
        <AppIcon :name="iconForType(lesson.type)" :size="20" :color="active ? 'var(--color-gold)' : 'var(--color-navy)'" />
      </div>

      <div class="lesson-body">
        <h4 class="lesson-title font-ar">{{ lesson.title }}</h4>
        <p v-if="lesson.description" class="lesson-desc text-secondary font-ar">
          {{ lesson.description }}
        </p>
      </div>

      <div class="lesson-meta">
        <AppIcon name="Clock" :size="14" />
        <span class="font-ar">{{ formatDuration(lesson.duration) }}</span>
      </div>
    </div>

    <div v-if="progressPercent != null" class="lesson-progress" aria-hidden="true">
      <div class="lesson-progress__fill" :style="{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }" />
    </div>
  </div>
</template>

<style scoped>
.lesson-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  overflow: hidden;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.lesson-card-inner {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
}

.lesson-card:hover {
  border-color: var(--color-gold);
  background-color: rgba(244, 168, 37, 0.04);
}

.lesson-card--active {
  border-color: var(--color-gold);
  background-color: rgba(244, 168, 37, 0.08);
}

.lesson-card--done {
  opacity: 0.8;
}

.lesson-index {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background-color: var(--bg-section);
  font-size: var(--text-body-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
}

.lesson-card--active .lesson-index {
  background-color: var(--color-gold);
  color: var(--color-navy);
}

.index-num {
  font-weight: var(--weight-bold);
}

.lesson-type {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lesson-title {
  font-size: var(--text-body);
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
  margin-bottom: 2px;
}

.lesson-desc {
  font-size: var(--text-caption);
  line-height: var(--leading-snug);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lesson-meta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xxs);
  font-size: var(--text-caption);
  color: var(--text-muted);
  white-space: nowrap;
}

.lesson-progress {
  height: 4px;
  width: 100%;
  background: var(--color-gray-200);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  overflow: hidden;
}

.lesson-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-gold), rgba(244, 168, 37, 0.65));
  transition: width 0.35s var(--ease-smooth);
}
</style>
