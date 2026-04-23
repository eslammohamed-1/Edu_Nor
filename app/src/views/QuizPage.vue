<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useQuizStore } from '@/stores/quiz';
import { quizzes } from '@/data/quizzes';
import QuizQuestion from '@/components/quiz/QuizQuestion.vue';
import QuizProgress from '@/components/quiz/QuizProgress.vue';
import QuizResults from '@/components/quiz/QuizResults.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import type { QuizAttempt } from '@/types/quiz';

const route = useRoute();
const router = useRouter();
const store = useQuizStore();
const { currentQuiz, currentIndex, answers, submitted, currentQuestion } = storeToRefs(store);

const quizId = computed(() => route.params.quizId as string | undefined);
const timeLeft = ref<number | null>(null);
const timer = ref<ReturnType<typeof setInterval> | null>(null);
const lastAttempt = ref<QuizAttempt | null>(null);
const reviewMode = ref(false);

const questionIds = computed(() =>
  currentQuiz.value ? currentQuiz.value.questions.map((q) => q.id) : []
);

const isLast = computed(() => {
  if (!currentQuiz.value) return false;
  return currentIndex.value === currentQuiz.value.questions.length - 1;
});

const quizList = computed(() => quizzes);

function start(id: string) {
  const ok = store.startQuiz(id);
  if (!ok) return;
  if (currentQuiz.value) {
    timeLeft.value = currentQuiz.value.duration * 60;
    startTimer();
    lastAttempt.value = null;
    reviewMode.value = false;
  }
}

function startTimer() {
  stopTimer();
  timer.value = setInterval(() => {
    if (timeLeft.value === null) return;
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      handleSubmit();
    }
  }, 1000);
}

function stopTimer() {
  if (timer.value) clearInterval(timer.value);
  timer.value = null;
}

function handleSelect(optionId: string) {
  if (!currentQuestion.value) return;
  if (submitted.value) return;
  store.selectAnswer(currentQuestion.value.id, optionId);
}

function handleSubmit() {
  stopTimer();
  const attempt = store.submitQuiz();
  if (attempt) lastAttempt.value = attempt;
}

function handleRetry() {
  if (!currentQuiz.value) return;
  start(currentQuiz.value.id);
}

function handleReview() {
  reviewMode.value = true;
}

function handleExit() {
  stopTimer();
  store.reset();
  router.push('/subjects');
}

watch(quizId, (id) => {
  if (id) start(id);
}, { immediate: true });

onMounted(() => {
  if (quizId.value) start(quizId.value);
});

onUnmounted(() => {
  stopTimer();
});
</script>

<template>
  <div class="quiz-page">
    <div v-if="!currentQuiz" class="container quiz-picker">
      <h1 class="text-navy font-ar">اختر اختباراً</h1>
      <p class="text-secondary font-ar mb-xl">ابدأ اختبارك الذي تريد الآن.</p>
      <div class="quiz-list">
        <div v-for="q in quizList" :key="q.id" class="quiz-card">
          <div class="quiz-card-head">
            <AppIcon name="HelpCircle" :size="32" color="var(--color-gold)" />
            <div>
              <h3 class="font-ar">{{ q.title }}</h3>
              <p class="font-ar text-secondary">{{ q.description }}</p>
            </div>
          </div>
          <div class="quiz-card-meta">
            <span class="font-ar"><AppIcon name="Clock" :size="14" /> {{ q.duration }} دقيقة</span>
            <span class="font-ar"><AppIcon name="ListChecks" :size="14" /> {{ q.questions.length }} سؤال</span>
          </div>
          <AppButton block @click="router.push(`/quiz/${q.id}`)">ابدأ الاختبار</AppButton>
        </div>
      </div>
    </div>

    <div v-else-if="submitted && !reviewMode && lastAttempt" class="container">
      <QuizResults
        :quiz="currentQuiz"
        :attempt="lastAttempt"
        @retry="handleRetry"
        @review="handleReview"
      />
      <div class="results-footer">
        <AppButton variant="ghost" @click="handleExit">الخروج من الاختبار</AppButton>
      </div>
    </div>

    <div v-else class="container quiz-session">
      <div class="quiz-toolbar">
        <h2 class="font-ar text-navy">{{ currentQuiz.title }}</h2>
        <button class="exit-btn" @click="handleExit" title="خروج">
          <AppIcon name="X" :size="20" />
        </button>
      </div>

      <QuizProgress
        :current="currentIndex"
        :total="currentQuiz.questions.length"
        :answers="answers"
        :question-ids="questionIds"
        :time-left="submitted ? undefined : timeLeft ?? undefined"
        @jump="store.goToIndex"
      />

      <div class="question-wrap">
        <QuizQuestion
          v-if="currentQuestion"
          :question="currentQuestion"
          :selected-option-id="answers[currentQuestion.id]"
          :show-result="submitted || reviewMode"
          :question-number="currentIndex + 1"
          :total="currentQuiz.questions.length"
          @select="handleSelect"
        />
      </div>

      <div class="quiz-actions">
        <AppButton
          variant="secondary"
          :disabled="currentIndex === 0"
          @click="store.goPrev"
        >
          <AppIcon name="ChevronRight" :size="18" />
          <span style="margin-inline-start: 4px">السابق</span>
        </AppButton>

        <AppButton
          v-if="!isLast"
          @click="store.goNext"
        >
          <span style="margin-inline-end: 4px">التالي</span>
          <AppIcon name="ChevronLeft" :size="18" />
        </AppButton>

        <AppButton
          v-else-if="!submitted"
          variant="primary"
          @click="handleSubmit"
        >
          تسليم الاختبار
          <AppIcon name="CheckCircle2" :size="18" style="margin-inline-start: 4px" />
        </AppButton>

        <AppButton v-else @click="reviewMode = false">
          النتيجة
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-page {
  padding: var(--space-2xl) 0;
  min-height: calc(100vh - var(--navbar-height));
}

.quiz-picker h1 {
  font-size: var(--text-h1);
  margin-bottom: var(--space-xs);
}

.mb-xl { margin-bottom: var(--space-xl); }

.quiz-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-lg);
}

.quiz-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.quiz-card-head {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-start;
}

.quiz-card-head h3 {
  font-size: var(--text-h4);
  color: var(--color-navy);
  margin-bottom: var(--space-xxs);
}

.quiz-card-head p {
  font-size: var(--text-body-sm);
}

.quiz-card-meta {
  display: flex;
  gap: var(--space-md);
  font-size: var(--text-caption);
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.quiz-card-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.quiz-session {
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.quiz-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--border-color);
}

.quiz-toolbar h2 {
  font-size: var(--text-h3);
}

.exit-btn {
  padding: var(--space-xs);
  border-radius: var(--radius-full);
  color: var(--text-muted);
  transition: all var(--duration-fast);
}

.exit-btn:hover {
  color: var(--color-error);
  background-color: rgba(231, 76, 60, 0.1);
}

.question-wrap {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  min-height: 400px;
}

.quiz-actions {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
}

.results-footer {
  display: flex;
  justify-content: center;
  margin-top: var(--space-xl);
}
</style>
