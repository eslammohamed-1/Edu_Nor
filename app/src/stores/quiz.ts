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

      switch (q.type) {
        case 'mcq':
        case 'opinion': {
          if ('choices' in q && Array.isArray(q.choices)) {
            const choice = q.choices.find((c) => c.id === selected);
            isCorrect = choice?.isCorrect === true;
          }
          break;
        }

        case 'gap': {
          if (!('choices' in q) || !Array.isArray(q.choices)) {
            isCorrect = false;
            break;
          }
          const correctIds = q.choices.filter((c) => c.isCorrect === true).map((c) => c.id);
          const blanks = (q.stem.match(/@BLANK/g) || []).length;

          if (!selected) {
            isCorrect = false;
            break;
          }

          if (blanks <= 1) {
            try {
              const a = JSON.parse(selected) as unknown;
              if (Array.isArray(a) && a.length === 1) {
                const id = String(a[0]);
                const choice = q.choices.find((c) => c.id === id);
                isCorrect = choice?.isCorrect === true;
              } else {
                const choice = q.choices.find((c) => c.id === selected);
                isCorrect = choice?.isCorrect === true;
              }
            } catch {
              const choice = q.choices.find((c) => c.id === selected);
              isCorrect = choice?.isCorrect === true;
            }
            break;
          }

          try {
            const arr = JSON.parse(selected) as unknown;
            isCorrect =
              Array.isArray(arr) &&
              (arr as string[]).length === blanks &&
              correctIds.length === blanks &&
              correctIds.every((id, i) => id === (arr as string[])[i]);
          } catch {
            isCorrect = false;
          }
          break;
        }

        case 'mrq': {
          if ('choices' in q && Array.isArray(q.choices) && selected) {
            const correct = new Set(q.choices.filter((c) => c.isCorrect).map((c) => c.id));
            let picked = new Set<string>();
            try {
              const a = JSON.parse(selected) as unknown;
              if (Array.isArray(a)) picked = new Set(a.map((x) => String(x)));
            } catch {
              picked = new Set();
            }
            isCorrect =
              correct.size === picked.size && [...correct].every((id) => picked.has(id));
          }
          break;
        }

        // أسئلة الترتيب: المختارات تُخزّن كمصفوفة JSON
        case 'ordering': {
          if ('choices' in q && Array.isArray(q.choices) && selected) {
            try {
              const userOrder = JSON.parse(selected) as string[];
              const correctOrder = q.choices.map((c) => c.id);
              isCorrect = userOrder.length === correctOrder.length &&
                userOrder.every((id, idx) => id === correctOrder[idx]);
            } catch {
              // مطابقة اختيار فردي كـ fallback
              const choice = q.choices.find((c) => c.id === selected);
              isCorrect = choice?.isCorrect === true;
            }
          }
          break;
        }

        // أسئلة نصية: مقارنة نصية (بدون حساسية لحالة الأحرف والمسافات)
        case 'string':
        case 'frq': {
          if ('answer' in q && selected) {
            const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
            isCorrect = normalize(selected) === normalize(q.answer);
          }
          break;
        }

        // أسئلة الإدخال الرقمي/النصي
        case 'input':
        case 'counting': {
          if ('answer' in q && selected) {
            const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
            isCorrect = normalize(selected) === normalize(q.answer);
          }
          break;
        }

        // أسئلة التوصيل: المطابقة تُخزّن كـ JSON { leftId: rightId }
        case 'matching': {
          if ('pairs' in q && selected) {
            try {
              const userPairs = JSON.parse(selected) as Record<string, string>;
              isCorrect = q.pairs.every((p) => userPairs[p.id] === p.right);
            } catch {
              isCorrect = false;
            }
          }
          break;
        }

        // أسئلة البازل: ترتيب القطع يُخزّن كـ JSON array
        case 'puzzle': {
          if ('solution' in q && selected) {
            try {
              const userSolution = JSON.parse(selected) as string[];
              isCorrect = userSolution.length === q.solution.length &&
                userSolution.every((id, idx) => id === q.solution[idx]);
            } catch {
              isCorrect = false;
            }
          }
          break;
        }

        // أسئلة اختيار متعدد مجمّعة: كل مجموعة لها اختياراتها
        case 'gmrq': {
          if ('groups' in q && selected) {
            try {
              const userSelections = JSON.parse(selected) as Record<string, string>;
              isCorrect = q.groups.every((g) => {
                const correct = g.choices.find((c) => c.isCorrect);
                return correct && userSelections[g.name] === correct.id;
              });
            } catch {
              isCorrect = false;
            }
          }
          break;
        }

        // أسئلة متعددة الأجزاء: لا تُقيَّم مباشرة — كل جزء يُقيَّم على حدة
        case 'multipart': {
          // الأجزاء الفرعية تُعامل كأسئلة مستقلة في الكتالوج
          isCorrect = false;
          break;
        }

        default:
          isCorrect = false;
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
