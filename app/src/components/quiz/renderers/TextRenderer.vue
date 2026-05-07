<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';
import { gradeAnswer } from '@/lib/quizGrade';
import type { StringQuestion } from '@/types/quiz';

const props = defineProps<{
  question: StringQuestion;
  selectedOptionId: string | null;
  showResult?: boolean;
}>();

const emit = defineEmits<{
  select: [value: string];
}>();

const text = ref('');

watch(
  () => [props.selectedOptionId, props.question.id] as const,
  () => {
    text.value = props.selectedOptionId ?? '';
  },
  { immediate: true }
);

function onInput() {
  if (props.showResult) return;
  emit('select', text.value);
}

const isCorrect = computed(() => gradeAnswer(props.question, props.selectedOptionId ?? null));

const isFrq = computed(() => props.question.type === 'frq');
const minRows = computed(() => (isFrq.value ? 5 : 2));
</script>

<template>
  <div class="text-renderer font-ar">
    <label class="sr-only" :for="'ta-' + question.id">إجابتك</label>
    <textarea
      :id="'ta-' + question.id"
      v-model="text"
      class="text-area"
      :readonly="showResult"
      :rows="minRows"
      dir="auto"
      :placeholder="isFrq ? 'اكتب إجابتك هنا…' : 'إجابة قصيرة…'"
      @input="onInput"
    />
    <div class="text-meta font-en text-secondary">
      <span>{{ text.length }}</span>
      <span>حرف</span>
    </div>

    <div
      v-if="showResult && question.explanation"
      class="explanation animate-fade-in"
      :class="{
        'explanation--correct': isCorrect,
        'explanation--wrong': !isCorrect
      }"
    >
      <div class="explanation-head">
        <AppIcon :name="isCorrect ? 'CheckCircle2' : 'Info'" :size="20" />
        <strong class="font-ar">{{ isCorrect ? 'إجابة مطابقة!' : 'مرجع' }}</strong>
      </div>
      <p class="font-ar">{{ question.explanation }}</p>
    </div>
  </div>
</template>

<style scoped>
.text-renderer {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
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

.text-area {
  width: 100%;
  min-height: 5rem;
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  font: inherit;
  line-height: var(--leading-relaxed);
  resize: vertical;
}

.text-area:focus-visible {
  outline: none;
  border-color: var(--color-navy);
  box-shadow: 0 0 0 2px rgba(30, 58, 95, 0.2);
}

.text-meta {
  display: flex;
  gap: var(--space-xxs);
  font-size: var(--text-body-sm);
  align-self: flex-end;
}

.explanation {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border-inline-start: 4px solid;
  margin-top: var(--space-xs);
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
