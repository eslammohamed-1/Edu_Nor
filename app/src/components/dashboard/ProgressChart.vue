<script setup lang="ts">
import AppProgressBar from '@/components/common/AppProgressBar.vue';
import AppIcon from '@/components/common/AppIcon.vue';

interface SubjectProgress {
  name: string;
  icon: string;
  color: string;
  progress: number;
  completed: number;
  total: number;
}

interface Props {
  subjects: SubjectProgress[];
}

defineProps<Props>();
</script>

<template>
  <section class="widget progress-chart">
    <header class="widget-head">
      <h3 class="font-ar text-navy">تقدمك في المواد</h3>
    </header>

    <div v-if="subjects.length === 0" class="empty font-ar text-secondary">
      لم تبدأ أي مادة بعد.
    </div>

    <ul v-else class="subjects-list">
      <li v-for="subject in subjects" :key="subject.name" class="progress-row">
        <div class="row-head">
          <div class="subject-info">
            <div class="subject-icon" :style="{ backgroundColor: subject.color + '15' }">
              <AppIcon :name="subject.icon" :size="18" :color="subject.color" />
            </div>
            <strong class="font-ar">{{ subject.name }}</strong>
          </div>
          <span class="progress-text font-en">{{ subject.progress }}%</span>
        </div>
        <AppProgressBar :progress="subject.progress" :height="6" />
        <span class="lessons-count font-ar text-muted">
          {{ subject.completed }} من {{ subject.total }} درس
        </span>
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
}

.widget-head {
  margin-bottom: var(--space-md);
}

.widget-head h3 {
  font-size: var(--text-h4);
  font-weight: var(--weight-bold);
}

.empty {
  text-align: center;
  padding: var(--space-xl) 0;
}

.subjects-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.progress-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.row-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subject-info {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.subject-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-text {
  font-size: var(--text-body-sm);
  font-weight: var(--weight-bold);
  color: var(--color-navy);
}

.lessons-count {
  font-size: var(--text-caption);
}
</style>
