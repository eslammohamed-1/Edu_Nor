<script setup lang="ts">
import { computed } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';
import AppButton from '@/components/common/AppButton.vue';
import type { Quiz, QuizAttempt } from '@/types/quiz';

interface Props {
  quiz: Quiz;
  attempt: QuizAttempt;
}

const props = defineProps<Props>();

defineEmits<{
  retry: [];
  review: [];
}>();

const dashOffset = computed(() => {
  const c = 2 * Math.PI * 70;
  return c - (props.attempt.percentage / 100) * c;
});

const resultColor = computed(() => (props.attempt.passed ? 'var(--color-success)' : 'var(--color-error)'));
</script>

<template>
  <div class="quiz-results animate-fade-in">
    <div class="results-head">
      <div class="results-icon">
        <AppIcon
          :name="attempt.passed ? 'Trophy' : 'AlertCircle'"
          :size="56"
          :color="resultColor"
        />
      </div>
      <h2 class="font-ar">
        {{ attempt.passed ? 'تهانينا! لقد نجحت 🎉' : 'حظاً أوفر في المرة القادمة' }}
      </h2>
      <p class="font-ar text-secondary">
        {{ attempt.passed
          ? 'أحسنت! أجزت الاختبار بنجاح.'
          : `تحتاج إلى ${quiz.passingScore}% للنجاح. جرّب مرة أخرى!` }}
      </p>
    </div>

    <div class="score-ring">
      <svg viewBox="0 0 160 160" class="ring-svg">
        <circle cx="80" cy="80" r="70" class="ring-bg" />
        <circle
          cx="80"
          cy="80"
          r="70"
          class="ring-fg"
          :stroke="resultColor"
          :style="{ strokeDashoffset: dashOffset }"
        />
      </svg>
      <div class="ring-center">
        <span class="ring-percentage font-en">{{ attempt.percentage }}%</span>
        <span class="ring-label font-ar">النتيجة</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat">
        <AppIcon name="CheckCircle2" :size="24" color="var(--color-success)" />
        <span class="stat-value font-en">{{ attempt.score }}</span>
        <span class="stat-label font-ar">صحيحة</span>
      </div>
      <div class="stat">
        <AppIcon name="XCircle" :size="24" color="var(--color-error)" />
        <span class="stat-value font-en">{{ attempt.total - attempt.score }}</span>
        <span class="stat-label font-ar">خاطئة</span>
      </div>
      <div class="stat">
        <AppIcon name="HelpCircle" :size="24" color="var(--color-info)" />
        <span class="stat-value font-en">{{ attempt.total }}</span>
        <span class="stat-label font-ar">إجمالي</span>
      </div>
    </div>

    <div class="actions">
      <AppButton variant="secondary" @click="$emit('review')">
        مراجعة الإجابات
      </AppButton>
      <AppButton @click="$emit('retry')">
        إعادة الاختبار
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.quiz-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xl);
  padding: var(--space-2xl);
  background-color: var(--bg-card);
  border-radius: var(--radius-xl);
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.results-head h2 {
  font-size: var(--text-h2);
  color: var(--color-navy);
  margin: var(--space-md) 0 var(--space-xs);
}

.results-icon {
  display: flex;
  justify-content: center;
}

.score-ring {
  position: relative;
  width: 200px;
  height: 200px;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg,
.ring-fg {
  fill: none;
  stroke-width: 14;
  stroke-linecap: round;
}

.ring-bg {
  stroke: var(--color-gray-200);
}

.ring-fg {
  stroke-dasharray: 439.823;
  transition: stroke-dashoffset 1s var(--ease-smooth);
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xxs);
}

.ring-percentage {
  font-size: 3rem;
  font-weight: var(--weight-bold);
  color: var(--color-navy);
}

.ring-label {
  font-size: var(--text-body-sm);
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
  width: 100%;
  max-width: 500px;
  padding: var(--space-lg) 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.stat-value {
  font-size: var(--text-h2);
  font-weight: var(--weight-bold);
  color: var(--color-navy);
}

.stat-label {
  font-size: var(--text-caption);
  color: var(--text-muted);
}

.actions {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
  justify-content: center;
}
</style>
