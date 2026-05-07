<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';
import ChoicesRenderer from '@/components/quiz/renderers/ChoicesRenderer.vue';
import GapRenderer from '@/components/quiz/renderers/GapRenderer.vue';
import GroupedMrqRenderer from '@/components/quiz/renderers/GroupedMrqRenderer.vue';
import InputRenderer from '@/components/quiz/renderers/InputRenderer.vue';
import MatchingRenderer from '@/components/quiz/renderers/MatchingRenderer.vue';
import MultipartNested from '@/components/quiz/renderers/MultipartRenderer.vue';
import OrderingRenderer from '@/components/quiz/renderers/OrderingRenderer.vue';
import PuzzleRenderer from '@/components/quiz/renderers/PuzzleRenderer.vue';
import TextRenderer from '@/components/quiz/renderers/TextRenderer.vue';
import { gradeAnswer } from '@/lib/quizGrade';
import type { AnyQuestion, McqQuestion, MultipartQuestion, QuestionType } from '@/types/quiz';

const CHOICE_TYPES: QuestionType[] = ['mcq', 'mrq', 'opinion'];

function isChoiceRenderer(q: AnyQuestion): q is McqQuestion {
  return (
    CHOICE_TYPES.includes(q.type) &&
    'choices' in q &&
    Array.isArray(q.choices) &&
    q.choices.length > 0
  );
}

const props = defineProps<{
  question: MultipartQuestion;
  selectedOptionId: string | null;
  showResult?: boolean;
}>();

const emit = defineEmits<{
  select: [value: string];
}>();

const map = ref<Record<string, string>>({});

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
    map.value = parse(props.selectedOptionId);
  },
  { immediate: true }
);

function emitAll() {
  emit('select', JSON.stringify(map.value));
}

function setPart(id: string, value: string) {
  if (props.showResult) return;
  map.value = { ...map.value, [id]: value };
  emitAll();
}

function partValue(id: string): string | null {
  return map.value[id] ?? null;
}

const isCorrect = computed(() => gradeAnswer(props.question, props.selectedOptionId ?? null));
</script>

<template>
  <div class="multipart-renderer">
    <div
      v-for="part in question.parts"
      :key="part.id"
      class="multipart-part"
    >
      <h3 v-if="part.type !== 'gap'" class="multipart-part-stem font-ar">{{ part.stem }}</h3>

      <ChoicesRenderer
        v-if="isChoiceRenderer(part)"
        :question="part"
        :selected-option-id="partValue(part.id)"
        :show-result="showResult"
        @select="setPart(part.id, $event)"
      />
      <GapRenderer
        v-else-if="part.type === 'gap'"
        :question="part"
        :selected-option-id="partValue(part.id)"
        :show-result="showResult"
        @select="setPart(part.id, $event)"
      />
      <OrderingRenderer
        v-else-if="part.type === 'ordering'"
        :question="part"
        :selected-option-id="partValue(part.id)"
        :show-result="showResult"
        @select="setPart(part.id, $event)"
      />
      <MatchingRenderer
        v-else-if="part.type === 'matching'"
        :question="part"
        :selected-option-id="partValue(part.id)"
        :show-result="showResult"
        @select="setPart(part.id, $event)"
      />
      <TextRenderer
        v-else-if="part.type === 'string' || part.type === 'frq'"
        :question="part"
        :selected-option-id="partValue(part.id)"
        :show-result="showResult"
        @select="setPart(part.id, $event)"
      />
      <InputRenderer
        v-else-if="part.type === 'input' || part.type === 'counting'"
        :question="part"
        :selected-option-id="partValue(part.id)"
        :show-result="showResult"
        @select="setPart(part.id, $event)"
      />
      <PuzzleRenderer
        v-else-if="part.type === 'puzzle'"
        :question="part"
        :selected-option-id="partValue(part.id)"
        :show-result="showResult"
        @select="setPart(part.id, $event)"
      />
      <GroupedMrqRenderer
        v-else-if="part.type === 'gmrq'"
        :question="part"
        :selected-option-id="partValue(part.id)"
        :show-result="showResult"
        @select="setPart(part.id, $event)"
      />
      <MultipartNested
        v-else-if="part.type === 'multipart'"
        :question="part"
        :selected-option-id="partValue(part.id)"
        :show-result="showResult"
        @select="setPart(part.id, $event)"
      />
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
        <strong class="font-ar">{{ isCorrect ? 'إجابة السؤال المركّب صحيحة!' : 'تنويه' }}</strong>
      </div>
      <p class="font-ar">{{ question.explanation }}</p>
    </div>
  </div>
</template>

<style scoped>
.multipart-renderer {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.multipart-part {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-section);
}

.multipart-part-stem {
  margin: 0;
  font-size: var(--text-body-lg);
  color: var(--color-navy);
  line-height: var(--leading-relaxed);
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
