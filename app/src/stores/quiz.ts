import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Quiz, QuizAnswer, QuizAttempt } from '@/types/quiz';
import { findQuizById } from '@/data/quizzes';

const ATTEMPTS_KEY = 'edunor_quiz_attempts';

function loadAttempts(): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? (JSON.parse(raw) as QuizAttempt[]) : [];
  } catch {
    return [];
  }
}

function persistAttempts(attempts: QuizAttempt[]) {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

export const useQuizStore = defineStore('quiz', () => {
  const currentQuiz = ref<Quiz | null>(null);
  const currentIndex = ref(0);
  const answers = ref<Record<string, string | null>>({});
  const startedAt = ref<string | null>(null);
  const submitted = ref(false);
  const attempts = ref<QuizAttempt[]>(loadAttempts());

  const currentQuestion = computed(() => {
    if (!currentQuiz.value) return null;
    return currentQuiz.value.questions[currentIndex.value] ?? null;
  });

  const progress = computed(() => {
    if (!currentQuiz.value) return 0;
    return Math.round(((currentIndex.value + 1) / currentQuiz.value.questions.length) * 100);
  });

  const answeredCount = computed(() => {
    return Object.values(answers.value).filter((v) => v !== null && v !== undefined).length;
  });

  function startQuiz(quizId: string): boolean {
    const quiz = findQuizById(quizId);
    if (!quiz) return false;
    currentQuiz.value = quiz;
    currentIndex.value = 0;
    answers.value = {};
    quiz.questions.forEach((q) => (answers.value[q.id] = null));
    startedAt.value = new Date().toISOString();
    submitted.value = false;
    return true;
  }

  function selectAnswer(questionId: string, optionId: string) {
    answers.value[questionId] = optionId;
  }

  function goNext() {
    if (!currentQuiz.value) return;
    if (currentIndex.value < currentQuiz.value.questions.length - 1) {
      currentIndex.value++;
    }
  }

  function goPrev() {
    if (currentIndex.value > 0) currentIndex.value--;
  }

  function goToIndex(idx: number) {
    if (!currentQuiz.value) return;
    if (idx >= 0 && idx < currentQuiz.value.questions.length) {
      currentIndex.value = idx;
    }
  }

  function submitQuiz(): QuizAttempt | null {
    if (!currentQuiz.value || !startedAt.value) return null;

    const quizAnswers: QuizAnswer[] = currentQuiz.value.questions.map((q) => {
      const selected = answers.value[q.id] ?? null;
      return {
        questionId: q.id,
        selectedOptionId: selected,
        isCorrect: selected === q.correctOptionId
      };
    });

    const score = quizAnswers.filter((a) => a.isCorrect).length;
    const total = currentQuiz.value.questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= currentQuiz.value.passingScore;

    const attempt: QuizAttempt = {
      quizId: currentQuiz.value.id,
      answers: quizAnswers,
      score,
      total,
      percentage,
      passed,
      startedAt: startedAt.value,
      finishedAt: new Date().toISOString()
    };

    attempts.value.push(attempt);
    persistAttempts(attempts.value);
    submitted.value = true;
    return attempt;
  }

  function reset() {
    currentQuiz.value = null;
    currentIndex.value = 0;
    answers.value = {};
    startedAt.value = null;
    submitted.value = false;
  }

  return {
    currentQuiz,
    currentIndex,
    answers,
    startedAt,
    submitted,
    attempts,
    currentQuestion,
    progress,
    answeredCount,
    startQuiz,
    selectAnswer,
    goNext,
    goPrev,
    goToIndex,
    submitQuiz,
    reset
  };
});
