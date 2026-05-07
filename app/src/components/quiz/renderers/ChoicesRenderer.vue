<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue';
import type { GapQuestion, McqQuestion } from '@/types/quiz';

/** MCQ / MRQ / Opinion / Gap — خيارات من مصفوفة choices */
export type ChoiceQuestion = McqQuestion | GapQuestion;

interface Props {
  question: ChoiceQuestion;
  /** MCQ/Gap/Opinion: id الخيار. MRQ: JSON.stringify(string[]) لترتيب مستقر */
  selectedOptionId: string | null;
  showResult?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [value: string];
}>();

const isMrq = () => props.question.type === 'mrq';

function getChoices() {
  return props.question.choices;
}

function userIdSet(): Set<string> {
  if (!props.selectedOptionId) return new Set();
  if (isMrq()) {
    try {
      const a = JSON.parse(props.selectedOptionId) as unknown;
      if (Array.isArray(a)) return new Set(a.map((x) => String(x)));
    } catch {
      return new Set();
    }
    return new Set();
  }
  return new Set([props.selectedOptionId]);
}

function correctIdSet(): Set<string> {
  return new Set(getChoices().filter((c) => c.isCorrect === true).map((c) => c.id));
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) {
    if (!b.has(x)) return false;
  }
  return true;
}

function checkIsCorrect(optionId: string): boolean {
  const choice = getChoices().find((c) => c.id === optionId);
  return choice?.isCorrect === true;
}

function optionState(optionId: string): 'default' | 'correct' | 'wrong' | 'selected' {
  if (!props.showResult) {
    return userIdSet().has(optionId) ? 'selected' : 'default';
  }

  const isCorrectOption = checkIsCorrect(optionId);
  const selected = userIdSet().has(optionId);

  if (isCorrectOption) return 'correct';
  if (selected && !isCorrectOption) return 'wrong';

  return 'default';
}

function isUserAnswerCorrect(): boolean {
  if (isMrq()) {
    return setsEqual(userIdSet(), correctIdSet());
  }
  if (!props.selectedOptionId) return false;
  return checkIsCorrect(props.selectedOptionId);
}

function onOptionClick(optionId: string) {
  if (props.showResult) return;
  if (isMrq()) {
    const s = userIdSet();
    if (s.has(optionId)) s.delete(optionId);
    else s.add(optionId);
    const arr = [...s].sort();
    emit('select', JSON.stringify(arr));
    return;
  }
  emit('select', optionId);
}
</script>

<template>
  <div class="choices-renderer">
    <div class="options">
      <button
        v-for="(option, idx) in getChoices()"
        :key="option.id"
        type="button"
        class="option"
        :class="[`option--${optionState(option.id)}`]"
        :disabled="showResult"
        @click="onOptionClick(option.id)"
      >
        <span class="option-letter font-en">{{ ['أ', 'ب', 'ج', 'د', 'هـ', 'و'][idx] || idx + 1 }}</span>
        <span class="option-label font-ar">{{ option.label }}</span>
        <span v-if="showResult" class="option-icon">
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

    <p v-if="isMrq() && !showResult" class="mrq-hint font-ar text-secondary">
      يمكنك اختيار أكثر من إجابة صحيحة.
    </p>

    <div
      v-if="showResult && question.explanation"
      class="explanation animate-fade-in"
      :class="{
        'explanation--correct': isUserAnswerCorrect(),
        'explanation--wrong': !isUserAnswerCorrect()
      }"
    >
      <div class="explanation-head">
        <AppIcon :name="isUserAnswerCorrect() ? 'CheckCircle2' : 'Info'" :size="20" />
        <strong class="font-ar">
          {{ isUserAnswerCorrect() ? 'إجابة صحيحة!' : 'الإجابة الصحيحة:' }}
        </strong>
      </div>
      <p class="font-ar">{{ question.explanation }}</p>
    </div>
  </div>
</template>

<style scoped>
.choices-renderer {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.mrq-hint {
  font-size: var(--text-body-sm);
  margin: 0;
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
  margin-top: var(--space-sm);
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
