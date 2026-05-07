<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';
import { gradeAnswer } from '@/lib/quizGrade';
import type { GmrqQuestion } from '@/types/quiz';

const props = defineProps<{
  question: GmrqQuestion;
  /** JSON: Record<groupName, choiceId> */
  selectedOptionId: string | null;
  showResult?: boolean;
}>();

const emit = defineEmits<{
  select: [value: string];
}>();

const state = ref<Record<string, string>>({});

function parse(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const o = JSON.parse(raw) as Record<string, string>;
    if (typeof o === 'object' && o !== null) return { ...o };
  } catch {
    /* ignore */
  }
  return {};
}

watch(
  () => [props.selectedOptionId, props.question.id] as const,
  () => {
    state.value = parse(props.selectedOptionId);
  },
  { immediate: true }
);

function emitState() {
  emit('select', JSON.stringify(state.value));
}

function pickGroup(groupName: string, choiceId: string) {
  if (props.showResult) return;
  state.value = { ...state.value, [groupName]: choiceId };
  emitState();
}

function correctForGroup(groupName: string) {
  const g = props.question.groups.find((x) => x.name === groupName);
  return g?.choices.find((c) => c.isCorrect);
}

function optionClass(groupName: string, choiceId: string): string {
  if (!props.showResult) {
    return state.value[groupName] === choiceId ? 'is-picked' : '';
  }
  const correct = correctForGroup(groupName);
  const isCorrectOption = correct?.id === choiceId;
  const picked = state.value[groupName] === choiceId;
  if (isCorrectOption) return 'is-correct';
  if (picked && !isCorrectOption) return 'is-wrong';
  return '';
}

const isCorrect = computed(() => gradeAnswer(props.question, props.selectedOptionId ?? null));
</script>

<template>
  <div class="gmrq-renderer">
    <p v-if="!showResult" class="gmrq-hint font-ar text-secondary">
      اختر إجابة واحدة لكل مجموعة.
    </p>

    <section
      v-for="group in question.groups"
      :key="group.name"
      class="gmrq-group"
      :aria-labelledby="'gmrq-h-' + group.name"
    >
      <h3 :id="'gmrq-h-' + group.name" class="gmrq-group-title font-ar">{{ group.name }}</h3>
      <div class="gmrq-options" role="radiogroup" :aria-label="group.name">
        <label
          v-for="ch in group.choices"
          :key="group.name + ch.id"
          class="gmrq-option font-ar"
          :class="optionClass(group.name, ch.id)"
        >
          <input
            type="radio"
            class="gmrq-input"
            :name="'gmrq-' + question.id + '-' + group.name"
            :value="ch.id"
            :checked="state[group.name] === ch.id"
            :disabled="showResult"
            @change="pickGroup(group.name, ch.id)"
          />
          <span>{{ ch.label }}</span>
        </label>
      </div>
    </section>

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
        <strong class="font-ar">{{ isCorrect ? 'جميع المجموعات صحيحة!' : 'تنويه' }}</strong>
      </div>
      <p class="font-ar">{{ question.explanation }}</p>
    </div>
  </div>
</template>

<style scoped>
.gmrq-renderer {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.gmrq-hint {
  margin: 0;
  font-size: var(--text-body-sm);
}

.gmrq-group {
  padding: var(--space-md);
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.gmrq-group-title {
  margin: 0 0 var(--space-sm);
  font-size: var(--text-body-lg);
  color: var(--color-navy);
}

.gmrq-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.gmrq-option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  border: 2px solid transparent;
}

.gmrq-input {
  margin-top: 4px;
  flex-shrink: 0;
}

.gmrq-option.is-picked {
  border-color: var(--color-navy);
  background: rgba(30, 58, 95, 0.06);
}

.gmrq-option.is-correct {
  border-color: var(--color-success);
  background: rgba(39, 174, 96, 0.08);
}

.gmrq-option.is-wrong {
  border-color: var(--color-error);
  background: rgba(231, 76, 60, 0.06);
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
