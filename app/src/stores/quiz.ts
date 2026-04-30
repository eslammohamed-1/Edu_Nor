import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Quiz, QuizAnswer, QuizAttempt } from '@/types/quiz';
import { quizzes as seedQuizzes } from '@/fixtures/demo-catalog/quizzes';
import { mergeQuizzesWithQuestionBank } from '@/lib/mergeQuizQuestionBank';
import { fetchPublicQuestionsBank } from '@/services/questionsBankService';
import { getApiBase } from '@/services/http/client';
import { fetchPublicQuizzes } from '@/services/quizzesService';

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
  /** المصدر الموحّد: fixtures ثم استبدالها باستجابة `/api/v1/quizzes`، مع تحديث كل سؤال من `/api/v1/questions-bank` عند وجود مطابقة لـ id. */
  const quizCatalog = ref<Quiz[]>(seedQuizzes.map((q) => ({ ...q })));

  async function hydrateQuizzesFromApi(): Promise<void> {
    if (!getApiBase()) return;
    const [remote, bank] = await Promise.all([
      fetchPublicQuizzes(),
      fetchPublicQuestionsBank()
    ]);
    if (!remote?.length) return;
    quizCatalog.value = mergeQuizzesWithQuestionBank(remote, bank ?? new Map());
  }

  /** قائمة كل الاختبارات المعروضة في الواجهة (مسودّات ومؤرشفة مُفعّدة من الخادم). */
  const quizzesInCatalog = computed(() => quizCatalog.value);

  function findQuizById(quizId: string | undefined): Quiz | undefined {
    if (!quizId) return undefined;
    return quizCatalog.value.find((q) => q.id === quizId);
  }

  function findQuizByLessonId(lessonId: string | undefined): Quiz | undefined {
    if (!lessonId) return undefined;
    return quizCatalog.value.find((q) => q.lessonId === lessonId);
  }

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
      let isCorrect = false;

      if ('choices' in q && Array.isArray(q.choices)) {
        const choice = q.choices.find((c) => c.id === selected);
        isCorrect = choice?.isCorrect === true;
      }

      return {
        questionId: q.id,
        selectedOptionId: selected,
        isCorrect: isCorrect
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
    quizCatalog,
    hydrateQuizzesFromApi,
    quizzesInCatalog,
    findQuizById,
    findQuizByLessonId,
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
