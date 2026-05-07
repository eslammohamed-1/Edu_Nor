<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';
import { gradeAnswer } from '@/lib/quizGrade';
import type { MatchingQuestion } from '@/types/quiz';

const props = defineProps<{
  question: MatchingQuestion;
  /** JSON: Record<pairId, rightLabel> — القيمة النصية لجهة اليمين كما في `pair.right` */
  selectedOptionId: string | null;
  showResult?: boolean;
}>();

const emit = defineEmits<{
  select: [value: string];
}>();

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** خيارات الجهة اليمنى فريدة لكل صف (نفس النص قد يتكرر في بيانات أخرى — نعرض كل الخيارات). */
const rightOptionsPerRow = computed(() => {
  const all = props.question.pairs.map((p) => p.right);
  return props.question.pairs.map(() => shuffle([...new Set(all)]));
});

const assignments = ref<Record<string, string>>({});

function parse(raw: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  try {
    const o = JSON.parse(raw) as Record<string, string>;
    if (typeof o === 'object' && o !== null) {
      for (const p of props.question.pairs) {
        if (typeof o[p.id] === 'string') out[p.id] = o[p.id];
      }
    }
  } catch {
    /* ignore */
  }
  return out;
}

watch(
  () => [props.selectedOptionId, props.question.id] as const,
  () => {
    assignments.value = parse(props.selectedOptionId);
  },
  { immediate: true }
);

function emitState() {
  emit('select', JSON.stringify(assignments.value));
}

function setPair(pairId: string, rightLabel: string) {
  if (props.showResult) return;
  assignments.value = { ...assignments.value, [pairId]: rightLabel };
  emitState();
}

function rowState(pairId: string): 'ok' | 'bad' | 'default' {
  if (!props.showResult) return 'default';
  const picked = assignments.value[pairId];
  const pair = props.question.pairs.find((p) => p.id === pairId);
  if (!pair) return 'default';
  return picked === pair.right ? 'ok' : 'bad';
}

const isCorrect = computed(() => gradeAnswer(props.question, props.selectedOptionId ?? null));
</script>

<template>
  <div class="matching-renderer">
    <p v-if="!showResult" class="matching-hint font-ar text-secondary">
      لكل سطر اختر العنصر المناسب من القائمة المنسدلة.
    </p>

    <div class="matching-rows" role="list">
      <div
        v-for="(pair, idx) in question.pairs"
        :key="pair.id"
        class="matching-row"
        :class="{
          'matching-row--ok': showResult && rowState(pair.id) === 'ok',
          'matching-row--bad': showResult && rowState(pair.id) === 'bad'
        }"
        role="listitem"
      >
        <div class="matching-left font-ar">{{ pair.left }}</div>
        <div class="matching-arrow font-en" aria-hidden="true">←</div>
        <select
          class="matching-select font-ar"
          :value="assignments[pair.id] ?? ''"
          :disabled="showResult"
          :aria-label="`التوصيل لـ ${pair.left}`"
          @change="setPair(pair.id, ($event.target as HTMLSelectElement).value)"
        >
          <option value="" disabled>اختر…</option>
          <option
            v-for="opt in rightOptionsPerRow[idx]"
            :key="pair.id + ':' + opt"
            :value="opt"
          >
            {{ opt }}
          </option>
        </select>
      </div>
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
        <strong class="font-ar">{{ isCorrect ? 'مطابقة صحيحة!' : 'تنويه' }}</strong>
      </div>
      <p class="font-ar">{{ question.explanation }}</p>
    </div>
  </div>
</template>

<style scoped>
.matching-renderer {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.matching-hint {
  margin: 0;
  font-size: var(--text-body-sm);
}

.matching-rows {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.matching-row {
  display: grid;
  grid-template-columns: 1fr auto minmax(10rem, 14rem);
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.matching-row--ok {
  border-color: var(--color-success);
  background: rgba(39, 174, 96, 0.06);
}

.matching-row--bad {
  border-color: var(--color-error);
  background: rgba(231, 76, 60, 0.06);
}

.matching-left {
  font-size: var(--text-body-lg);
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
}

.matching-arrow {
  color: var(--text-muted);
  opacity: 0.8;
}

.matching-select {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-section);
  font: inherit;
  cursor: pointer;
}

.matching-select:disabled {
  opacity: 0.95;
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
