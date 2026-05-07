import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Quiz, QuizAnswer, QuizAttempt } from '@/types/quiz';
import { quizzes as seedQuizzes } from '@/fixtures/demo-catalog/quizzes';
import { mergeQuizzesWithQuestionBank } from '@/lib/mergeQuizQuestionBank';
import { readStoredAuth } from '@/lib/authStorage';
import { fetchPublicQuestionsBank } from '@/services/questionsBankService';
import { getApiBase } from '@/services/http/client';
import { fetchPublicQuizzes } from '@/services/quizzesService';
import {
  saveQuizAttemptAnswer,
  startQuizAttempt,
  submitQuizAttempt
} from '@/services/quizAttemptsService';
import { gradeAnswer } from '@/lib/quizGrade';

function canSyncQuizAttempts(): boolean {
  return Boolean(getApiBase() && readStoredAuth()?.token);
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
  /** محاولة نشطة على الخادم (U3) — فارغة في الوضع المحلي فقط. */
  const currentAttemptId = ref<string | null>(null);

  const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const SAVE_DEBOUNCE_MS = 450;

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

  async function startQuiz(quizId: string): Promise<boolean> {
    const quiz = findQuizById(quizId);
    if (!quiz) return false;
    currentQuiz.value = quiz;
    currentIndex.value = 0;
    answers.value = {};
    quiz.questions.forEach((q) => (answers.value[q.id] = null));
    submitted.value = false;
    currentAttemptId.value = null;
    for (const t of saveTimers.values()) clearTimeout(t);
    saveTimers.clear();

    if (canSyncQuizAttempts()) {
      try {
        const remote = await startQuizAttempt(quizId);
        currentAttemptId.value = remote.attemptId;
        startedAt.value = remote.startedAt;
        return true;
      } catch {
        currentAttemptId.value = null;
        startedAt.value = new Date().toISOString();
        return true;
      }
    }

    startedAt.value = new Date().toISOString();
    return true;
  }

  function scheduleServerSave(questionId: string, rawValue: string) {
    const aid = currentAttemptId.value;
    if (!aid || !canSyncQuizAttempts()) return;

    const prev = saveTimers.get(questionId);
    if (prev) clearTimeout(prev);

    saveTimers.set(
      questionId,
      setTimeout(() => {
        saveTimers.delete(questionId);
        void saveQuizAttemptAnswer(aid, questionId, rawValue).catch(() => {
          /* يُكمّل العمل دون شبكة أو عند 401 */
        });
      }, SAVE_DEBOUNCE_MS)
    );
  }

  function selectAnswer(questionId: string, optionId: string) {
    answers.value[questionId] = optionId;
    scheduleServerSave(questionId, optionId);
  }

  async function flushPendingAnswerSaves(): Promise<void> {
    const aid = currentAttemptId.value;
    if (!aid || !canSyncQuizAttempts()) {
      for (const t of saveTimers.values()) clearTimeout(t);
      saveTimers.clear();
      return;
    }

    const qids = new Set([...Object.keys(answers.value), ...saveTimers.keys()]);
    for (const qid of saveTimers.keys()) {
      const t = saveTimers.get(qid);
      if (t) clearTimeout(t);
    }
    saveTimers.clear();

    const tasks: Promise<void>[] = [];
    for (const qid of qids) {
      const v = answers.value[qid];
      tasks.push(
        saveQuizAttemptAnswer(aid, qid, v).catch(() => {
          /* ignore */
        })
      );
    }
    await Promise.all(tasks);
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

  function buildLocalGradedAttempt(): QuizAttempt | null {
    if (!currentQuiz.value || !startedAt.value) return null;

    const quizAnswers: QuizAnswer[] = currentQuiz.value.questions.map((q) => {
      const selected = answers.value[q.id] ?? null;
      const isCorrect = gradeAnswer(q, selected);
      return {
        questionId: q.id,
        selectedOptionId: selected,
        isCorrect
      };
    });

    const score = quizAnswers.filter((a) => a.isCorrect).length;
    const total = currentQuiz.value.questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= currentQuiz.value.passingScore;

    return {
      quizId: currentQuiz.value.id,
      answers: quizAnswers,
      score,
      total,
      percentage,
      passed,
      startedAt: startedAt.value,
      finishedAt: new Date().toISOString()
    };
  }

  async function submitQuiz(): Promise<QuizAttempt | null> {
    if (!currentQuiz.value || !startedAt.value) return null;

    await flushPendingAnswerSaves();

    const aid = currentAttemptId.value;
    if (aid && canSyncQuizAttempts()) {
      try {
        const result = await submitQuizAttempt(aid);
        const quizAnswers: QuizAnswer[] = currentQuiz.value.questions.map((q) => {
          const selected = answers.value[q.id] ?? null;
          return {
            questionId: q.id,
            selectedOptionId: selected,
            isCorrect: gradeAnswer(q, selected)
          };
        });
        const attempt: QuizAttempt = {
          quizId: currentQuiz.value.id,
          answers: quizAnswers,
          score: result.score,
          total: result.total,
          percentage: result.percentage,
          passed: result.passed,
          startedAt: startedAt.value,
          finishedAt: result.finishedAt
        };
        submitted.value = true;
        currentAttemptId.value = null;
        return attempt;
      } catch {
        const fallback = buildLocalGradedAttempt();
        if (fallback) submitted.value = true;
        currentAttemptId.value = null;
        return fallback;
      }
    }

    const attempt = buildLocalGradedAttempt();
    if (attempt) submitted.value = true;
    return attempt;
  }

  function reset() {
    for (const t of saveTimers.values()) clearTimeout(t);
    saveTimers.clear();
    currentQuiz.value = null;
    currentIndex.value = 0;
    answers.value = {};
    startedAt.value = null;
    submitted.value = false;
    currentAttemptId.value = null;
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
    currentAttemptId,
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
