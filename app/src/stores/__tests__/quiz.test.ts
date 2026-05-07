import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { AnyQuestion } from '@/types/quiz';

vi.mock('@/services/http/client', () => ({
  getApiBase: vi.fn(() => null)
}));

import { quizzes } from '@/fixtures/demo-catalog/quizzes';
import { useQuizStore } from '@/stores/quiz';

function correctAnswerFor(q: AnyQuestion): string {
  switch (q.type) {
    case 'mcq':
    case 'opinion':
      return q.choices.find((c) => c.isCorrect)?.id ?? q.choices[0]?.id ?? '';

    case 'mrq':
      return JSON.stringify(q.choices.filter((c) => c.isCorrect).map((c) => c.id));

    case 'gap': {
      const blanks = (q.stem.match(/@BLANK/g) || []).length;
      const correctIds = q.choices.filter((c) => c.isCorrect).map((c) => c.id);
      return blanks > 1 ? JSON.stringify(correctIds) : correctIds[0] ?? '';
    }

    case 'ordering':
      return JSON.stringify(q.choices.map((c) => c.id));

    case 'string':
    case 'frq':
    case 'input':
    case 'counting':
      return q.answer;

    case 'matching':
      return JSON.stringify(Object.fromEntries(q.pairs.map((p) => [p.id, p.right])));

    case 'puzzle':
      return JSON.stringify(q.solution);

    case 'gmrq':
      return JSON.stringify(
        Object.fromEntries(
          q.groups.map((g) => [g.name, g.choices.find((c) => c.isCorrect)?.id ?? ''])
        )
      );

    case 'multipart':
      return JSON.stringify(
        Object.fromEntries(q.parts.map((part) => [part.id, correctAnswerFor(part)]))
      );
  }
}

describe('quiz store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('returns false when starting an unknown quiz', async () => {
    const store = useQuizStore();

    await expect(store.startQuiz('missing')).resolves.toBe(false);

    expect(store.currentQuiz).toBeNull();
  });

  it('starts a quiz and initializes answer slots', async () => {
    const store = useQuizStore();
    const quiz = quizzes[1]!;

    await expect(store.startQuiz(quiz.id)).resolves.toBe(true);

    expect(store.currentQuiz?.id).toBe(quiz.id);
    expect(store.currentIndex).toBe(0);
    expect(Object.keys(store.answers)).toEqual(quiz.questions.map((q) => q.id));
    expect(store.answeredCount).toBe(0);
    expect(store.startedAt).toEqual(expect.any(String));
  });

  it('selects answers, navigates, and resets state', async () => {
    const store = useQuizStore();
    const quiz = quizzes[1]!;
    const firstQuestion = quiz.questions[0]!;

    await store.startQuiz(quiz.id);
    store.selectAnswer(firstQuestion.id, correctAnswerFor(firstQuestion));
    store.goNext();
    store.goPrev();
    store.goToIndex(0);

    expect(store.answers[firstQuestion.id]).toBe(correctAnswerFor(firstQuestion));
    expect(store.answeredCount).toBe(1);
    expect(store.currentIndex).toBe(0);

    store.reset();
    expect(store.currentQuiz).toBeNull();
    expect(store.answers).toEqual({});
    expect(store.submitted).toBe(false);
  });

  it('submits the master fixture covering all 13 question types locally', async () => {
    const store = useQuizStore();
    const quiz = quizzes.find((q) => q.id === 'master-13-types-demo')!;
    const types = new Set(quiz.questions.map((q) => q.type));

    expect(types.size).toBeGreaterThanOrEqual(13);

    await store.startQuiz(quiz.id);
    for (const q of quiz.questions) {
      store.selectAnswer(q.id, correctAnswerFor(q));
    }

    const attempt = await store.submitQuiz();
    const gradableTotal = quiz.questions.filter((q) => q.type !== 'opinion').length;

    expect(attempt).not.toBeNull();
    expect(attempt?.quizId).toBe(quiz.id);
    expect(attempt?.total).toBe(quiz.questions.length);
    expect(attempt?.score).toBe(gradableTotal);
    expect(attempt?.passed).toBe(true);
    expect(store.submitted).toBe(true);
  });
});
