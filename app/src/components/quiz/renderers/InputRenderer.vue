<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';
import { gradeAnswer } from '@/lib/quizGrade';
import type { InputQuestion } from '@/types/quiz';

const props = defineProps<{
  question: InputQuestion;
  selectedOptionId: string | null;
  showResult?: boolean;
}>();

const emit = defineEmits<{
  select: [value: string];
}>();

const value = ref('');

watch(
  () => [props.selectedOptionId, props.question.id] as const,
  () => {
    value.value = props.selectedOptionId ?? '';
  },
  { immediate: true }
);

function onInput() {
  if (props.showResult) return;
  emit('select', value.value);
}

const isCorrect = computed(() => gradeAnswer(props.question, props.selectedOptionId ?? null));

const inputMode = computed(() =>
  props.question.type === 'counting' ? 'numeric' : 'text'
);
</script>

<template>
  <div class="input-renderer">
    <div class="input-row">
      <label class="sr-only" :for="'inp-' + question.id">القيمة</label>
      <input
        :id="'inp-' + question.id"
        v-model="value"
        class="input-field font-en"
        :type="inputMode === 'numeric' ? 'text' : 'text'"
        inputmode="decimal"
        dir="ltr"
        :readonly="showResult"
        :aria-describedby="question.unit ? 'unit-' + question.id : undefined"
        @input="onInput"
      />
      <span
        v-if="question.unit"
        :id="'unit-' + question.id"
        class="input-unit font-ar text-secondary"
      >
        {{ question.unit }}
      </span>
    </div>

    <div
      v-if="showResult && question.explanation"
      class="explanation animate-fade-in font-ar"
      :class="{
        'explanation--correct': isCorrect,
        'explanation--wrong': !isCorrect
      }"
    >
      <div class="explanation-head">
        <AppIcon :name="isCorrect ? 'CheckCircle2' : 'Info'" :size="20" />
        <strong>{{ isCorrect ? 'قيمة صحيحة!' : 'تنويه' }}</strong>
      </div>
      <p>{{ question.explanation }}</p>
    </div>
  </div>
</template>

<style scoped>
.input-renderer {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.input-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-md);
}

.input-field {
  flex: 1;
  min-width: 8rem;
  max-width: 20rem;
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  font-size: var(--text-body-lg);
}

.input-field:focus-visible {
  outline: none;
  border-color: var(--color-navy);
  box-shadow: 0 0 0 2px rgba(30, 58, 95, 0.2);
}

.input-unit {
  font-size: var(--text-body);
}

.explanation {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border-inline-start: 4px solid;
}

.explanation--correct {
  background-color: rgba(39, 174, 96, 0.08);
  border-color: var(--color-success);
}

.explanation--wrong {
  background-color: rgba(243, 156, 18, 0.08);
  border-color: var(--color-warning);
}

.explanation-head {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
}

.explanation p {
  margin: 0;
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
}
</style>
