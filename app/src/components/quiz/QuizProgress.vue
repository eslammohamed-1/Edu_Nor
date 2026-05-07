<script setup lang="ts">
import { computed } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';

interface Props {
  current: number;
  total: number;
  answers: Record<string, string | null>;
  questionIds: string[];
  timeLeft?: number;
}

const props = defineProps<Props>();

defineEmits<{
  jump: [index: number];
}>();

const minutes = computed(() => {
  if (props.timeLeft === undefined) return '';
  const m = Math.floor(props.timeLeft / 60);
  const s = props.timeLeft % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

function isAnswered(qid: string) {
  const val = props.answers[qid];
  if (val === null || val === undefined) return false;
  const t = String(val).trim();
  if (t === '' || t === '[]') return false;
  if (t.startsWith('[')) {
    try {
      const a = JSON.parse(t) as unknown[];
      if (Array.isArray(a)) {
        return (
          a.length > 0 &&
          a.every((x) => x !== null && x !== undefined && String(x).trim().length > 0)
        );
      }
    } catch {
      return false;
    }
  }
  return true;
}
</script>

<template>
  <div class="quiz-progress">
    <div class="progress-top">
      <div class="progress-info">
        <AppIcon name="CircleDot" :size="18" color="var(--color-gold)" />
        <span class="font-ar">السؤال {{ current + 1 }} من {{ total }}</span>
      </div>
      <div v-if="timeLeft !== undefined" class="timer">
        <AppIcon name="Clock" :size="18" :color="timeLeft < 60 ? 'var(--color-error)' : 'var(--color-navy)'" />
        <span class="font-en" :class="{ 'timer-danger': timeLeft < 60 }">{{ minutes }}</span>
      </div>
    </div>

    <div class="progress-bar-wrap">
      <div class="progress-bar" :style="{ width: `${((current + 1) / total) * 100}%` }"></div>
    </div>

    <div class="question-dots">
      <button
        v-for="(qid, idx) in questionIds"
        :key="qid"
        class="dot"
        :class="{
          'dot--current': idx === current,
          'dot--answered': isAnswered(qid)
        }"
        :title="`السؤال ${idx + 1}`"
        @click="$emit('jump', idx)"
      >
        {{ idx + 1 }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.quiz-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.progress-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-info,
.timer {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-body-sm);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.timer-danger {
  color: var(--color-error);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.progress-bar-wrap {
  height: 6px;
  background-color: var(--color-gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--gradient-gold);
  border-radius: var(--radius-full);
  transition: width 0.4s var(--ease-smooth);
}

.question-dots {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.dot {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-section);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  font-size: var(--text-body-sm);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: all var(--duration-fast);
  border: 2px solid transparent;
}

.dot:hover {
  border-color: var(--color-navy);
}

.dot--answered {
  background-color: rgba(39, 174, 96, 0.15);
  color: var(--color-success);
}

.dot--current {
  background-color: var(--color-navy);
  color: var(--color-white);
  transform: scale(1.05);
}
</style>
