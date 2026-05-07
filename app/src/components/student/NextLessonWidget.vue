<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { getApiBase } from '@/services/http/client';
import { readStoredAuth } from '@/lib/authStorage';
import { fetchStudyPlan, type StudyPlanNext } from '@/services/studyPlanService';
import AppIcon from '@/components/common/AppIcon.vue';
import AppButton from '@/components/common/AppButton.vue';

const loading = ref(true);
const next = ref<StudyPlanNext | null>(null);
const hide = ref(false);

onMounted(async () => {
  if (!getApiBase() || !readStoredAuth()?.token) {
    hide.value = true;
    loading.value = false;
    return;
  }
  try {
    const data = await fetchStudyPlan();
    next.value = data.nextLesson;
  } catch {
    hide.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="!hide && !loading && next" class="next-lesson-widget animate-fade-in">
    <div class="next-lesson-widget__icon">
      <AppIcon name="Sparkles" :size="24" color="var(--color-gold)" />
    </div>
    <div class="next-lesson-widget__body">
      <p class="next-lesson-widget__label font-ar">الدرس المقترح</p>
      <p class="next-lesson-widget__title font-ar text-navy">{{ next.title }}</p>
      <p class="next-lesson-widget__meta font-ar text-secondary">
        {{ next.subjectName }} • {{ next.duration }} د
      </p>
    </div>
    <div class="next-lesson-widget__actions">
      <RouterLink :to="`/lessons/${next.lessonId}`">
        <AppButton size="sm">ابدأ الآن</AppButton>
      </RouterLink>
      <RouterLink to="/study-plan" class="plan-link font-ar">الخطة الكاملة</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.next-lesson-widget {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: linear-gradient(
    125deg,
    rgba(30, 58, 95, 0.06),
    rgba(244, 168, 37, 0.1)
  );
  border: 1px solid rgba(244, 168, 37, 0.35);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-xl);
}

.next-lesson-widget__icon {
  flex-shrink: 0;
}

.next-lesson-widget__body {
  flex: 1;
  min-width: 0;
}

.next-lesson-widget__label {
  margin: 0;
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  color: var(--color-gold);
}

.next-lesson-widget__title {
  margin: 4px 0 2px;
  font-size: var(--text-body-lg);
  font-weight: var(--weight-bold);
  line-height: var(--leading-snug);
}

.next-lesson-widget__meta {
  margin: 0;
  font-size: var(--text-body-sm);
}

.next-lesson-widget__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
}

.plan-link {
  font-size: var(--text-body-sm);
  color: var(--color-navy);
  text-decoration: none;
}

.plan-link:hover {
  text-decoration: underline;
}
</style>
