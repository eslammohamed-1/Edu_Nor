<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppBadge from '@/components/common/AppBadge.vue';
import AppProgressBar from '@/components/common/AppProgressBar.vue';
import type { Course } from '@/types/course';

interface Props {
  course: Course;
  progress?: number;
}

defineProps<Props>();

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} دقيقة`;
  return m === 0 ? `${h} ساعة` : `${h} س ${m} د`;
}
</script>

<template>
  <div class="course-card transition-all">
    <div class="course-thumb">
      <div class="thumb-gradient">
        <AppIcon name="PlayCircle" :size="48" color="var(--color-white)" />
      </div>
      <AppBadge variant="teal" class="stage-badge">
        {{ course.stage === 'secondary' ? 'ثانوي' : course.stage === 'prep' ? 'إعدادي' : 'ابتدائي' }}
      </AppBadge>
    </div>

    <div class="course-body">
      <h3 class="course-title text-navy font-ar">{{ course.title }}</h3>
      <p class="course-desc text-secondary font-ar">{{ course.description }}</p>

      <div class="course-meta">
        <span class="meta-item">
          <AppIcon name="User" :size="14" />
          {{ course.instructor }}
        </span>
        <span class="meta-item">
          <AppIcon name="Clock" :size="14" />
          {{ formatDuration(course.duration) }}
        </span>
      </div>

      <div class="course-stats">
        <span class="stat-pill">
          <AppIcon name="Star" :size="14" color="var(--color-gold)" />
          <strong>{{ course.rating }}</strong>
        </span>
        <span class="stat-pill">
          <AppIcon name="Users" :size="14" />
          {{ course.studentsCount.toLocaleString('ar-EG') }}
        </span>
        <span class="stat-pill">
          <AppIcon name="BookOpen" :size="14" />
          {{ course.lessonsCount }} درس
        </span>
      </div>

      <div v-if="progress !== undefined && progress > 0" class="progress-wrap">
        <div class="progress-labels">
          <span class="font-ar">التقدم</span>
          <span class="font-en">{{ progress }}%</span>
        </div>
        <AppProgressBar :progress="progress" :height="6" />
      </div>

      <RouterLink :to="`/courses/${course.id}`" class="course-cta">
        <AppButton block :variant="progress && progress > 0 ? 'primary' : 'secondary'">
          {{ progress && progress > 0 ? 'متابعة الكورس' : 'ابدأ الكورس' }}
        </AppButton>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.course-card {
  background-color: var(--bg-card);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.course-thumb {
  position: relative;
  height: 160px;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-gradient {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.85;
}

.stage-badge {
  position: absolute;
  top: var(--space-sm);
  inset-inline-end: var(--space-sm);
}

.course-body {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  flex: 1;
}

.course-title {
  font-size: var(--text-h4);
  font-weight: var(--weight-bold);
  line-height: var(--leading-snug);
}

.course-desc {
  font-size: var(--text-body-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.course-meta {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
  font-size: var(--text-caption);
  color: var(--text-muted);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xxs);
}

.course-stats {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xxs);
  padding: var(--space-xxs) var(--space-xs);
  background-color: var(--bg-section);
  border-radius: var(--radius-full);
  font-size: var(--text-caption);
  color: var(--text-secondary);
}

.progress-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-xxs);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-caption);
  color: var(--text-secondary);
}

.course-cta {
  display: block;
  margin-top: var(--space-xs);
}
</style>
