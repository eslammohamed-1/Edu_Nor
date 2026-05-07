<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';
import type { OrderingQuestion } from '@/types/quiz';

const props = defineProps<{
  question: OrderingQuestion;
  /** ترتيب المعرّفات كما يختاره الطالب — JSON.stringify(id[]) */
  selectedOptionId: string | null;
  showResult?: boolean;
}>();

const emit = defineEmits<{
  select: [value: string];
}>();

const correctOrder = computed(() => props.question.choices.map((c) => c.id));

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** ترتيب ابتدائي عشوائي يختلف عن الصحيح متى أمكن */
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
  [() => props.selectedOptionId, () => props.question.id, correctOrder],
  () => {
    const next = parseOrder(props.selectedOptionId, correctOrder.value);
    order.value = next;
    const serialized = JSON.stringify(next);
    if (serialized !== props.selectedOptionId) {
      emit('select', serialized);
    }
  },
  { immediate: true }
);

function labelFor(id: string): string {
  return props.question.choices.find((c) => c.id === id)?.label ?? id;
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

// —— سحب وإفلات HTML5 ——
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
  <div class="ordering-renderer">
    <p v-if="!showResult" class="ordering-hint font-ar text-secondary">
      رتّب العناصر بالسحب، أو بأسهم الجهاز، أو بأزرار أعلى/أسفل.
    </p>

    <ol
      class="ordering-list"
      role="listbox"
      :aria-disabled="showResult"
      aria-label="ترتيب العناصر"
    >
      <li
        v-for="(id, i) in order"
        :key="id"
        role="option"
        class="ordering-item"
        :class="{
          'ordering-item--ok': slotState(i) === 'ok',
          'ordering-item--bad': slotState(i) === 'bad'
        }"
        :draggable="!showResult"
        tabindex="0"
        @keydown="onKeyDown($event, i)"
        @dragstart="onDragStart(i)"
        @dragover="onDragOver"
        @drop="onDrop(i)"
        @dragend="onDragEnd"
      >
        <span class="ordering-grip font-en" aria-hidden="true">⠿</span>
        <span class="ordering-label font-ar">{{ labelFor(id) }}</span>
        <div v-if="!showResult" class="ordering-actions">
          <button
            type="button"
            class="ordering-btn"
            :disabled="i === 0"
            title="أعلى"
            aria-label="تحريك لأعلى"
            @click="moveUp(i)"
          >
            <AppIcon name="ChevronUp" :size="18" />
          </button>
          <button
            type="button"
            class="ordering-btn"
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
          {{ isFullyCorrect() ? 'ترتيب صحيح!' : 'الترتيب الصحيح في البيانات:' }}
        </strong>
      </div>
      <p class="font-ar">{{ question.explanation }}</p>
    </div>
  </div>
</template>

<style scoped>
.ordering-renderer {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.ordering-hint {
  font-size: var(--text-body-sm);
  margin: 0;
}

.ordering-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.ordering-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: grab;
  outline: none;
  transition:
    border-color var(--duration-fast),
    background var(--duration-fast);
}

.ordering-item:focus-visible {
  border-color: var(--color-navy);
  box-shadow: 0 0 0 2px rgba(30, 58, 95, 0.2);
}

.ordering-item:active {
  cursor: grabbing;
}

.ordering-item--ok {
  border-color: var(--color-success);
  background: rgba(39, 174, 96, 0.08);
}

.ordering-item--bad {
  border-color: var(--color-error);
  background: rgba(231, 76, 60, 0.06);
}

.ordering-grip {
  color: var(--text-muted);
  user-select: none;
  flex-shrink: 0;
}

.ordering-label {
  flex: 1;
  font-size: var(--text-body-lg);
  color: var(--text-primary);
}

.ordering-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}

.ordering-btn {
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

.ordering-btn:hover:not(:disabled) {
  border-color: var(--color-navy);
  color: var(--color-navy);
}

.ordering-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
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
