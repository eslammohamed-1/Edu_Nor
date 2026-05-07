<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';
import type { PuzzleQuestion } from '@/types/quiz';

const props = defineProps<{
  question: PuzzleQuestion;
  /** ترتيب معرفات القطع — JSON.stringify(id[]) */
  selectedOptionId: string | null;
  showResult?: boolean;
}>();

const emit = defineEmits<{
  select: [value: string];
}>();

const pieceIds = computed(() => props.question.pieces.map((p) => p.id));
const correctOrder = computed(() => props.question.solution);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initialShuffle(ids: string[]): string[] {
  if (ids.length <= 1) return [...ids];
  let s: string[];
  let guard = 0;
  do {
    s = shuffle(ids);
    guard++;
  } while (guard < 80 && s.every((id, i) => id === ids[i]));
  return s;
}

function isPermutation(candidate: unknown[], canonical: string[]): boolean {
  if (!Array.isArray(candidate) || candidate.length !== canonical.length) return false;
  const a = candidate.map(String).sort().join(',');
  const b = [...canonical].sort().join(',');
  return a === b;
}

function parseOrder(raw: string | null, canonical: string[]): string[] {
  if (!raw) return initialShuffle(canonical);
  try {
    const a = JSON.parse(raw) as unknown;
    if (Array.isArray(a) && isPermutation(a, canonical)) {
      return a.map((x) => String(x));
    }
  } catch {
    /* ignore */
  }
  return initialShuffle(canonical);
}

const order = ref<string[]>([]);

watch(
  [() => props.selectedOptionId, () => props.question.id, pieceIds],
  () => {
    const next = parseOrder(props.selectedOptionId, pieceIds.value);
    order.value = next;
    const serialized = JSON.stringify(next);
    if (serialized !== props.selectedOptionId) {
      emit('select', serialized);
    }
  },
  { immediate: true }
);

function pieceFor(id: string) {
  return props.question.pieces.find((p) => p.id === id);
}

function emitOrder() {
  emit('select', JSON.stringify(order.value));
}

function moveUp(i: number) {
  if (props.showResult || i <= 0) return;
  const next = [...order.value];
  [next[i - 1], next[i]] = [next[i], next[i - 1]];
  order.value = next;
  emitOrder();
}

function moveDown(i: number) {
  if (props.showResult || i >= order.value.length - 1) return;
  const next = [...order.value];
  [next[i], next[i + 1]] = [next[i + 1], next[i]];
  order.value = next;
  emitOrder();
}

function onKeyDown(e: KeyboardEvent, i: number) {
  if (props.showResult) return;
  if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
    e.preventDefault();
    moveUp(i);
  } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
    e.preventDefault();
    moveDown(i);
  }
}

const dragIndex = ref<number | null>(null);

function onDragStart(i: number) {
  if (props.showResult) return;
  dragIndex.value = i;
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
}

function onDrop(target: number) {
  if (props.showResult || dragIndex.value === null) return;
  const from = dragIndex.value;
  dragIndex.value = null;
  if (from === target) return;
  const next = [...order.value];
  const [item] = next.splice(from, 1);
  next.splice(target, 0, item);
  order.value = next;
  emitOrder();
}

function onDragEnd() {
  dragIndex.value = null;
}

function slotState(i: number): 'ok' | 'bad' | '' {
  if (!props.showResult) return '';
  const want = correctOrder.value;
  return order.value[i] === want[i] ? 'ok' : 'bad';
}

function isFullyCorrect(): boolean {
  const want = correctOrder.value;
  return (
    order.value.length === want.length &&
    want.every((id, i) => order.value[i] === id)
  );
}
</script>

<template>
  <div class="puzzle-renderer">
    <p v-if="!showResult" class="puzzle-hint font-ar text-secondary">
      رتّب مقاطع الصورة بالسحب أو بالأزرار لتشكيل الترتيب الصحيح.
    </p>

    <ol class="puzzle-list" role="listbox" aria-label="قطع الصورة">
      <li
        v-for="(id, i) in order"
        :key="id"
        role="option"
        class="puzzle-item"
        :class="{
          'puzzle-item--ok': slotState(i) === 'ok',
          'puzzle-item--bad': slotState(i) === 'bad'
        }"
        :draggable="!showResult"
        tabindex="0"
        @keydown="onKeyDown($event, i)"
        @dragstart="onDragStart(i)"
        @dragover="onDragOver"
        @drop="onDrop(i)"
        @dragend="onDragEnd"
      >
        <span class="puzzle-grip font-en" aria-hidden="true">⠿</span>
        <img
          v-if="pieceFor(id)"
          class="puzzle-thumb"
          :src="pieceFor(id)!.url"
          :alt="`قطعة ${i + 1}`"
        />
        <div v-if="!showResult" class="puzzle-actions">
          <button
            type="button"
            class="puzzle-btn"
            :disabled="i === 0"
            title="أعلى"
            aria-label="تحريك لأعلى"
            @click="moveUp(i)"
          >
            <AppIcon name="ChevronUp" :size="18" />
          </button>
          <button
            type="button"
            class="puzzle-btn"
            :disabled="i >= order.length - 1"
            title="أسفل"
            aria-label="تحريك لأسفل"
            @click="moveDown(i)"
          >
            <AppIcon name="ChevronDown" :size="18" />
          </button>
        </div>
      </li>
    </ol>

    <figure v-if="showResult && question.completeImage" class="puzzle-preview">
      <img :src="question.completeImage" alt="الصورة كاملة بعد الإجابة" class="puzzle-full" />
      <figcaption class="font-ar text-secondary">معاينة الصورة الكاملة</figcaption>
    </figure>

    <div
      v-if="showResult && question.explanation"
      class="explanation animate-fade-in"
      :class="{
        'explanation--correct': isFullyCorrect(),
        'explanation--wrong': !isFullyCorrect()
      }"
    >
      <div class="explanation-head">
        <AppIcon :name="isFullyCorrect() ? 'CheckCircle2' : 'Info'" :size="20" />
        <strong class="font-ar">
          {{ isFullyCorrect() ? 'تركيب صحيح!' : 'تنويه' }}
        </strong>
      </div>
      <p class="font-ar">{{ question.explanation }}</p>
    </div>
  </div>
</template>

<style scoped>
.puzzle-renderer {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.puzzle-hint {
  font-size: var(--text-body-sm);
  margin: 0;
}

.puzzle-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.puzzle-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm);
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: grab;
  outline: none;
}

.puzzle-item:focus-visible {
  border-color: var(--color-navy);
  box-shadow: 0 0 0 2px rgba(30, 58, 95, 0.2);
}

.puzzle-item:active {
  cursor: grabbing;
}

.puzzle-item--ok {
  border-color: var(--color-success);
  background: rgba(39, 174, 96, 0.06);
}

.puzzle-item--bad {
  border-color: var(--color-error);
  background: rgba(231, 76, 60, 0.06);
}

.puzzle-grip {
  color: var(--text-muted);
  user-select: none;
  flex-shrink: 0;
}

.puzzle-thumb {
  flex: 1;
  max-height: 120px;
  width: 100%;
  object-fit: contain;
  border-radius: var(--radius-md);
  background: var(--bg-section);
}

.puzzle-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}

.puzzle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 28px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-section);
  cursor: pointer;
  color: var(--text-secondary);
}

.puzzle-btn:hover:not(:disabled) {
  border-color: var(--color-navy);
  color: var(--color-navy);
}

.puzzle-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.puzzle-preview {
  margin: 0;
  text-align: center;
}

.puzzle-full {
  max-width: 100%;
  max-height: 320px;
  object-fit: contain;
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
}

.puzzle-preview figcaption {
  margin-top: var(--space-xs);
  font-size: var(--text-body-sm);
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
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
  margin: 0;
}
</style>
