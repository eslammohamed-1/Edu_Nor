<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue';
import AppButton from '@/components/common/AppButton.vue';
import type { Lesson } from '@/types/course';

interface Props {
  lessons: Array<{ lesson: Lesson; courseTitle: string; courseId: string }>;
}

defineProps<Props>();
</script>

<template>
  <section class="recent-lessons widget">
    <header class="widget-head">
      <h3 class="font-ar text-navy">آخر الدروس</h3>
      <RouterLink to="/subjects?scope=my" class="view-all font-ar">عرض الكل</RouterLink>
    </header>

    <div v-if="lessons.length === 0" class="empty">
      <AppIcon name="BookOpen" :size="48" color="var(--text-muted)" />
      <p class="font-ar text-secondary">لم تبدأ أي درس بعد</p>
      <RouterLink to="/subjects?scope=my">
        <AppButton size="sm">استكشف مواد صفي</AppButton>
      </RouterLink>
    </div>

    <ul v-else class="lessons-list">
      <li v-for="item in lessons" :key="item.lesson.id" class="lesson-item">
        <div class="lesson-icon">
          <AppIcon name="PlayCircle" :size="24" color="var(--color-gold)" />
        </div>
        <div class="lesson-info">
          <strong class="font-ar">{{ item.lesson.title }}</strong>
          <span class="lesson-meta font-ar text-muted">
            {{ item.courseTitle }} • {{ item.lesson.duration }} دقيقة
          </span>
        </div>
        <RouterLink :to="`/lessons/${item.lesson.id}`" class="resume-btn">
          <AppButton variant="ghost" size="sm">متابعة</AppButton>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.widget {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.widget-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.widget-head h3 {
  font-size: var(--text-h4);
  font-weight: var(--weight-bold);
}

.view-all {
  font-size: var(--text-body-sm);
  color: var(--color-gold);
  font-weight: var(--weight-medium);
}

.view-all:hover {
  color: var(--color-gold-dark);
}

.empty {
  text-align: center;
  padding: var(--space-xl) 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  transition: background-color var(--duration-fast);
}

.lesson-item:hover {
  background-color: var(--bg-section);
}

.lesson-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background-color: rgba(244, 168, 37, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lesson-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.lesson-info strong {
  font-size: var(--text-body-sm);
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lesson-meta {
  font-size: var(--text-caption);
  color: var(--text-muted);
}

.resume-btn {
  flex-shrink: 0;
}
</style>
