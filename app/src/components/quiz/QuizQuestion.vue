<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue';
import type { Question } from '@/types/quiz';

interface Props {
  question: Question;
  selectedOptionId: string | null;
  showResult?: boolean;
  questionNumber: number;
  total: number;
}

const props = defineProps<Props>();

defineEmits<{
  select: [optionId: string];
}>();

function optionState(optionId: string): 'default' | 'correct' | 'wrong' | 'selected' {
  if (!props.showResult) {
    return props.selectedOptionId === optionId ? 'selected' : 'default';
  }
  if (optionId === props.question.correctOptionId) return 'correct';
  if (optionId === props.selectedOptionId && optionId !== props.question.correctOptionId) {
    return 'wrong';
  }
  return 'default';
}
</script>

<template>
  <div class="quiz-question animate-fade-in">
    <div class="question-head">
      <span class="question-counter font-en">
        {{ questionNumber }} / {{ total }}
      </span>
      <h2 class="question-text font-ar">{{ question.text }}</h2>
    </div>

    <div class="options">
      <button
        v-for="(option, idx) in question.options"
        :key="option.id"
        class="option"
        :class="[`option--${optionState(option.id)}`]"
        :disabled="showResult"
        @click="$emit('select', option.id)"
      >
        <span class="option-letter font-en">{{ ['أ', 'ب', 'ج', 'د'][idx] || idx + 1 }}</span>
        <span class="option-label font-ar">{{ option.label }}</span>
        <span class="option-icon" v-if="showResult">
          <AppIcon
            v-if="optionState(option.id) === 'correct'"
            name="CheckCircle2"
            :size="22"
            color="var(--color-success)"
          />
          <AppIcon
            v-else-if="optionState(option.id) === 'wrong'"
            name="XCircle"
            :size="22"
            color="var(--color-error)"
          />
        </span>
      </button>
    </div>

    <div
      v-if="showResult && question.explanation"
      class="explanation animate-fade-in"
      :class="{
        'explanation--correct': selectedOptionId === question.correctOptionId,
        'explanation--wrong': selectedOptionId !== question.correctOptionId
      }"
    >
      <div class="explanation-head">
        <AppIcon
          :name="selectedOptionId === question.correctOptionId ? 'CheckCircle2' : 'Info'"
          :size="20"
        />
        <strong class="font-ar">
          {{ selectedOptionId === question.correctOptionId ? 'إجابة صحيحة!' : 'الإجابة الصحيحة:' }}
        </strong>
      </div>
      <p class="font-ar">{{ question.explanation }}</p>
    </div>
  </div>
</template>

<style scoped>
.quiz-question {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.question-head {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.question-counter {
  display: inline-block;
  font-size: var(--text-body-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-gold);
  padding: var(--space-xxs) var(--space-sm);
  background-color: rgba(244, 168, 37, 0.12);
  border-radius: var(--radius-full);
  align-self: flex-start;
}

.question-text {
  font-size: var(--text-h3);
  color: var(--color-navy);
  line-height: var(--leading-snug);
  font-weight: var(--weight-bold);
}

.options {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.option {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background-color: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  text-align: inherit;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.option:hover:not(:disabled) {
  border-color: var(--color-navy);
  transform: translateY(-1px);
}

.option--selected {
  border-color: var(--color-navy);
  background-color: rgba(30, 58, 95, 0.04);
}

.option--correct {
  border-color: var(--color-success);
  background-color: rgba(39, 174, 96, 0.08);
}

.option--wrong {
  border-color: var(--color-error);
  background-color: rgba(231, 76, 60, 0.08);
}

.option-letter {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-section);
  color: var(--color-navy);
  border-radius: var(--radius-full);
  font-weight: var(--weight-bold);
  flex-shrink: 0;
}

.option--selected .option-letter {
  background-color: var(--color-navy);
  color: var(--color-white);
}

.option--correct .option-letter {
  background-color: var(--color-success);
  color: var(--color-white);
}

.option--wrong .option-letter {
  background-color: var(--color-error);
  color: var(--color-white);
}

.option-label {
  flex: 1;
  font-size: var(--text-body-lg);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
}

.option:disabled {
  cursor: default;
}

.explanation {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border-inline-start: 4px solid;
}

.explanation--correct {
  background-color: rgba(39, 174, 96, 0.08);
  border-color: var(--color-success);
  color: var(--color-success);
}

.explanation--wrong {
  background-color: rgba(243, 156, 18, 0.08);
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.explanation-head {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
}

.explanation p {
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
}
</style>
