<script setup lang="ts">
import type { AnyQuestion, McqQuestion, QuestionType } from '@/types/quiz';
import AppIcon from '@/components/common/AppIcon.vue';
import ChoicesRenderer from '@/components/quiz/renderers/ChoicesRenderer.vue';
import GapRenderer from '@/components/quiz/renderers/GapRenderer.vue';
import OrderingRenderer from '@/components/quiz/renderers/OrderingRenderer.vue';
import PlaceholderRenderer from '@/components/quiz/renderers/PlaceholderRenderer.vue';

interface Props {
  question: AnyQuestion;
  selectedOptionId: string | null;
  showResult?: boolean;
  questionNumber: number;
  total: number;
}

const props = defineProps<Props>();

defineEmits<{
  select: [value: string];
}>();

const CHOICE_TYPES: QuestionType[] = ['mcq', 'mrq', 'opinion'];

function isChoiceRenderer(
  q: AnyQuestion
): q is McqQuestion {
  return (
    CHOICE_TYPES.includes(q.type) &&
    'choices' in q &&
    Array.isArray(q.choices) &&
    q.choices.length > 0
  );
}
</script>

<template>
  <div class="quiz-question animate-fade-in">
    <div class="question-head">
      <span class="question-counter font-en">
        {{ questionNumber }} / {{ total }}
      </span>
      <h2 v-if="question.type !== 'gap'" class="question-text font-ar">{{ question.stem }}</h2>
    </div>

    <GapRenderer
      v-if="question.type === 'gap'"
      :question="question"
      :selected-option-id="selectedOptionId"
      :show-result="showResult"
      @select="$emit('select', $event)"
    />

    <OrderingRenderer
      v-else-if="question.type === 'ordering'"
      :question="question"
      :selected-option-id="selectedOptionId"
      :show-result="showResult"
      @select="$emit('select', $event)"
    />

    <ChoicesRenderer
      v-else-if="isChoiceRenderer(question)"
      :question="question"
      :selected-option-id="selectedOptionId"
      :show-result="showResult"
      @select="$emit('select', $event)"
    />

    <PlaceholderRenderer v-else :question-type="question.type" />

    <!-- شرح بدون اختيارات (أنواع placeholder) بعد التسليم — gap له شرح داخل GapRenderer -->
    <div
      v-if="
        showResult &&
        question.explanation &&
        !isChoiceRenderer(question) &&
        question.type !== 'gap' &&
        question.type !== 'ordering'
      "
      class="explanation explanation--neutral animate-fade-in"
    >
      <div class="explanation-head">
        <AppIcon name="Info" :size="20" />
        <strong class="font-ar">تنويه</strong>
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

.explanation {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border-inline-start: 4px solid var(--color-info);
}

.explanation--neutral {
  background-color: rgba(52, 152, 219, 0.08);
  border-color: var(--color-info);
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
  margin: 0;
}
</style>
