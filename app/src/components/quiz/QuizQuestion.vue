<script setup lang="ts">
import { computed } from 'vue';
import type { AnyQuestion, McqQuestion, QuestionType } from '@/types/quiz';
import ChoicesRenderer from '@/components/quiz/renderers/ChoicesRenderer.vue';
import GapRenderer from '@/components/quiz/renderers/GapRenderer.vue';
import GroupedMrqRenderer from '@/components/quiz/renderers/GroupedMrqRenderer.vue';
import InputRenderer from '@/components/quiz/renderers/InputRenderer.vue';
import MatchingRenderer from '@/components/quiz/renderers/MatchingRenderer.vue';
import MultipartRenderer from '@/components/quiz/renderers/MultipartRenderer.vue';
import OrderingRenderer from '@/components/quiz/renderers/OrderingRenderer.vue';
import PlaceholderRenderer from '@/components/quiz/renderers/PlaceholderRenderer.vue';
import PuzzleRenderer from '@/components/quiz/renderers/PuzzleRenderer.vue';
import TextRenderer from '@/components/quiz/renderers/TextRenderer.vue';

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

function isChoiceRenderer(q: AnyQuestion): q is McqQuestion {
  return (
    CHOICE_TYPES.includes(q.type) &&
    'choices' in q &&
    Array.isArray(q.choices) &&
    q.choices.length > 0
  );
}

/** نص السطر الأول: لا نكرر وصف gap داخل العنوان، والمركّب يعرض `statement`. */
const headline = computed(() => {
  const q = props.question;
  if (q.type === 'gap') return '';
  if (q.type === 'multipart') return (q.statement?.trim() || q.stem) ?? '';
  return q.stem;
});
</script>

<template>
  <div class="quiz-question animate-fade-in">
    <div class="question-head">
      <span class="question-counter font-en">
        {{ questionNumber }} / {{ total }}
      </span>
      <h2 v-if="headline" class="question-text font-ar">{{ headline }}</h2>
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

    <MatchingRenderer
      v-else-if="question.type === 'matching'"
      :question="question"
      :selected-option-id="selectedOptionId"
      :show-result="showResult"
      @select="$emit('select', $event)"
    />

    <TextRenderer
      v-else-if="question.type === 'string' || question.type === 'frq'"
      :question="question"
      :selected-option-id="selectedOptionId"
      :show-result="showResult"
      @select="$emit('select', $event)"
    />

    <InputRenderer
      v-else-if="question.type === 'input' || question.type === 'counting'"
      :question="question"
      :selected-option-id="selectedOptionId"
      :show-result="showResult"
      @select="$emit('select', $event)"
    />

    <PuzzleRenderer
      v-else-if="question.type === 'puzzle'"
      :question="question"
      :selected-option-id="selectedOptionId"
      :show-result="showResult"
      @select="$emit('select', $event)"
    />

    <GroupedMrqRenderer
      v-else-if="question.type === 'gmrq'"
      :question="question"
      :selected-option-id="selectedOptionId"
      :show-result="showResult"
      @select="$emit('select', $event)"
    />

    <MultipartRenderer
      v-else-if="question.type === 'multipart'"
      :question="question"
      :selected-option-id="selectedOptionId"
      :show-result="showResult"
      @select="$emit('select', $event)"
    />

    <PlaceholderRenderer v-else :question-type="question.type" />
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
</style>
