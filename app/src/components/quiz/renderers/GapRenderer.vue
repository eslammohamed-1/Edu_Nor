<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';
import type { Choice, GapQuestion } from '@/types/quiz';

const BLANK = '@BLANK';

const props = defineProps<{
  question: GapQuestion;
  /** فراغ واحد: id الخيار. أكثر من فراغ: JSON.stringify(ids[]) بنفس ترتيب @BLANK من اليسار لليمين */
  selectedOptionId: string | null;
  showResult?: boolean;
}>();

const emit = defineEmits<{
  select: [value: string];
}>();

const parts = computed(() => props.question.stem.split(BLANK));
const blankCount = computed(() => Math.max(0, parts.value.length - 1));

/** ترتيب معرفات الإجابات الصحيحة كما في `choices` (للفراغات المتعددة: يطابق ترتيب الفراغات في النص) */
const correctIdsOrdered = computed(() =>
  props.question.choices.filter((c) => c.isCorrect === true).map((c) => c.id)
);

const assignments = ref<string[]>([]);
const focusedSlot = ref<number | null>(null);

function parseToSlots(raw: string | null, n: number): string[] {
  if (n <= 0) return [];
  if (!raw) return Array.from({ length: n }, () => '');
  try {
    const a = JSON.parse(raw) as unknown;
    if (Array.isArray(a)) {
      const arr = a.map((x) => (x == null || x === '' ? '' : String(x)));
      while (arr.length < n) arr.push('');
      return arr.slice(0, n);
    }
  } catch {
    /* legacy: معرف واحد كنص */
  }
  if (n === 1) return [raw];
  return Array.from({ length: n }, () => '');
}

watch(
  [() => props.selectedOptionId, blankCount],
  () => {
    assignments.value = parseToSlots(props.selectedOptionId, blankCount.value);
  },
  { immediate: true }
);

function choiceById(id: string): Choice | undefined {
  return props.question.choices.find((c) => c.id === id);
}

function labelForSlot(idx: number): string {
  const id = assignments.value[idx];
  if (!id) return '';
  return choiceById(id)?.label ?? '';
}

/** خيارات لم تُستعمل بعد في فراغ (للتبديل يمكن إعادة الضغط على الفراغ ثم الخيار) */
const poolChoices = computed(() => {
  const used = new Set(assignments.value.filter(Boolean));
  return props.question.choices.filter((c) => !used.has(c.id));
});

function emitAssignments() {
  const n = blankCount.value;
  if (n <= 0) return;
  if (n === 1) {
    const v = assignments.value[0] ?? '';
    if (!v) {
      emit('select', '');
      return;
    }
    emit('select', JSON.stringify([v]));
    return;
  }
  emit('select', JSON.stringify(assignments.value));
}

function onChipPick(choiceId: string) {
  if (props.showResult) return;
  const n = blankCount.value;
  if (n <= 0) {
    emit('select', choiceId);
    return;
  }
  let idx = focusedSlot.value;
  if (idx === null) {
    idx = assignments.value.findIndex((x) => !x);
    if (idx < 0) idx = n - 1;
  }
  const next = [...assignments.value];
  if (idx >= 0 && idx < n) {
    next[idx] = choiceId;
    assignments.value = next;
    focusedSlot.value = null;
    emitAssignments();
  }
}

function onSlotClick(slotIdx: number) {
  if (props.showResult) return;
  focusedSlot.value = focusedSlot.value === slotIdx ? null : slotIdx;
}

function clearSlot(slotIdx: number) {
  if (props.showResult) return;
  const next = [...assignments.value];
  next[slotIdx] = '';
  assignments.value = next;
  focusedSlot.value = null;
  emitAssignments();
}

function isSlotCorrect(idx: number): boolean {
  if (!props.showResult) return false;
  const want = correctIdsOrdered.value;
  if (idx >= want.length) return false;
  return assignments.value[idx] === want[idx];
}

function isUserFullyCorrect(): boolean {
  const n = blankCount.value;
  if (n <= 0) {
    const raw = props.selectedOptionId;
    if (!raw) return false;
    const c = props.question.choices.find((x) => x.id === raw);
    return c?.isCorrect === true;
  }
  const want = correctIdsOrdered.value;
  if (want.length !== n || assignments.value.length !== n) return false;
  return want.every((id, i) => assignments.value[i] === id);
}

function slotClass(idx: number): string {
  if (!props.showResult) {
    return focusedSlot.value === idx ? 'gap-slot--focus' : '';
  }
  return isSlotCorrect(idx) ? 'gap-slot--ok' : 'gap-slot--bad';
}
</script>

<template>
  <div class="gap-renderer">
    <!-- بدون @BLANK: اختيار واحد مثل MCQ -->
    <template v-if="blankCount === 0">
      <div class="gap-fallback-stem font-ar">{{ question.stem }}</div>
      <div class="gap-pool">
        <button
          v-for="opt in question.choices"
          :key="opt.id"
          type="button"
          class="gap-chip"
          :class="{
            'gap-chip--picked': selectedOptionId === opt.id && !showResult,
            'gap-chip--correct': showResult && opt.isCorrect,
            'gap-chip--wrong':
              showResult && selectedOptionId === opt.id && opt.isCorrect !== true
          }"
          :disabled="showResult"
          @click="onChipPick(opt.id)"
        >
          {{ opt.label }}
        </button>
      </div>
    </template>

    <template v-else>
      <div class="gap-stem font-ar" dir="auto">
        <template v-for="(part, idx) in parts" :key="'p' + idx">
          <span class="gap-part">{{ part }}</span>
          <button
            v-if="idx < parts.length - 1"
            type="button"
            class="gap-slot"
            :class="slotClass(idx)"
            :disabled="showResult"
            @click="onSlotClick(idx)"
          >
            <template v-if="assignments[idx]">
              <span>{{ labelForSlot(idx) }}</span>
              <span
                v-if="!showResult"
                class="gap-slot__clear"
                title="إزالة"
                @click.stop="clearSlot(idx)"
              >
                ×
              </span>
            </template>
            <span v-else class="gap-slot__ph">⋯</span>
          </button>
        </template>
      </div>

      <p v-if="!showResult" class="gap-hint font-ar text-secondary">
        اضغط فراغاً لتحديده ثم اختر كلمة من الأسفل، أو املأ الفراغات بالترتيب.
      </p>

      <div v-if="!showResult" class="gap-pool">
        <button
          v-for="opt in poolChoices"
          :key="opt.id"
          type="button"
          class="gap-chip"
          @click="onChipPick(opt.id)"
        >
          {{ opt.label }}
        </button>
      </div>
    </template>

    <div
      v-if="showResult && question.explanation"
      class="explanation animate-fade-in"
      :class="{
        'explanation--correct': isUserFullyCorrect(),
        'explanation--wrong': !isUserFullyCorrect()
      }"
    >
      <div class="explanation-head">
        <AppIcon :name="isUserFullyCorrect() ? 'CheckCircle2' : 'Info'" :size="20" />
        <strong class="font-ar">
          {{ isUserFullyCorrect() ? 'إجابة صحيحة!' : 'التوضيح:' }}
        </strong>
      </div>
      <p class="font-ar">{{ question.explanation }}</p>
    </div>
  </div>
</template>

<style scoped>
.gap-renderer {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.gap-fallback-stem {
  font-size: var(--text-h3);
  color: var(--color-navy);
  line-height: var(--leading-snug);
  font-weight: var(--weight-bold);
}

.gap-stem {
  font-size: var(--text-body-lg);
  color: var(--text-primary);
  line-height: 1.9;
  flex-wrap: wrap;
  align-items: baseline;
}

.gap-part {
  white-space: pre-wrap;
}

.gap-slot {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 3.5rem;
  min-height: 2rem;
  margin: 0 4px;
  padding: 4px 10px;
  vertical-align: baseline;
  border-radius: var(--radius-md);
  border: 2px dashed var(--border-color);
  background: var(--bg-section);
  cursor: pointer;
  font: inherit;
  color: var(--color-navy);
  font-weight: var(--weight-semibold);
}

.gap-slot:disabled {
  cursor: default;
}

.gap-slot--focus {
  border-color: var(--color-navy);
  box-shadow: 0 0 0 2px rgba(30, 58, 95, 0.2);
}

.gap-slot--ok {
  border-color: var(--color-success);
  background: rgba(39, 174, 96, 0.1);
}

.gap-slot--bad {
  border-color: var(--color-error);
  background: rgba(231, 76, 60, 0.08);
}

.gap-slot__ph {
  color: var(--text-muted);
  font-weight: 400;
}

.gap-slot__clear {
  font-size: 1.1rem;
  line-height: 1;
  color: var(--text-muted);
  padding-inline-start: 4px;
}

.gap-hint {
  font-size: var(--text-body-sm);
  margin: 0;
}

.gap-pool {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.gap-chip {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  cursor: pointer;
  font: inherit;
  color: var(--text-primary);
  transition: all var(--duration-fast);
}

.gap-chip:hover:not(:disabled) {
  border-color: var(--color-navy);
}

.gap-chip:disabled {
  cursor: default;
}

.gap-chip--picked {
  border-color: var(--color-navy);
  background: rgba(30, 58, 95, 0.06);
}

.gap-chip--correct {
  border-color: var(--color-success);
  background: rgba(39, 174, 96, 0.12);
}

.gap-chip--wrong {
  border-color: var(--color-error);
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
