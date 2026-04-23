<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue';
import type { Subject } from '@/types/course';

interface Props {
  subject: Subject;
}

defineProps<Props>();
</script>

<template>
  <RouterLink :to="`/subjects/${subject.slug}`" class="subject-card transition-all">
    <div class="icon-wrap" :style="{ backgroundColor: subject.color + '15' }">
      <AppIcon :name="subject.icon" :size="36" :color="subject.color" />
    </div>
    <h3 class="subject-name font-ar text-navy">{{ subject.name }}</h3>
    <p class="subject-desc text-secondary font-ar">{{ subject.description }}</p>
    <div class="subject-stats">
      <span class="stat">
        <AppIcon name="BookOpen" :size="14" />
        {{ subject.coursesCount }} كورس
      </span>
      <span class="stat">
        <AppIcon name="PlayCircle" :size="14" />
        {{ subject.lessonsCount }} درس
      </span>
    </div>
  </RouterLink>
</template>

<style scoped>
.subject-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  background-color: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.subject-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: transparent;
}

.icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-xs);
}

.subject-name {
  font-size: var(--text-h3);
  font-weight: var(--weight-bold);
}

.subject-desc {
  font-size: var(--text-body-sm);
  line-height: var(--leading-relaxed);
  flex: 1;
}

.subject-stats {
  display: flex;
  gap: var(--space-md);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--border-color);
  font-size: var(--text-caption);
  color: var(--text-muted);
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xxs);
}
</style>
