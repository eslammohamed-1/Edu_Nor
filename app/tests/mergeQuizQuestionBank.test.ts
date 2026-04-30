import { describe, expect, it } from 'vitest';
import { mergeQuizzesWithQuestionBank } from '@/lib/mergeQuizQuestionBank';
import type { AnyQuestion, Quiz } from '@/types/quiz';

function minimalQuiz(overrides: Partial<Quiz> & Pick<Quiz, 'id' | 'title' | 'questions'>): Quiz {
  return {
    description: '',
    subjectId: 's',
    grade: 'g',
    duration: 10,
    passingScore: 50,
    ...overrides
  };
}

const embeddedQ: AnyQuestion = {
  id: 'q1',
  type: 'mcq',
  stem: 'embedded stem',
  choices: [{ id: 'c1', label: 'a', isCorrect: true }]
};

const bankQ: AnyQuestion = {
  id: 'q1',
  type: 'mcq',
  stem: 'bank stem',
  choices: [{ id: 'c2', label: 'b', isCorrect: true }]
};

describe('mergeQuizzesWithQuestionBank', () => {
  it('returns empty when quizzes array is empty', () => {
    expect(mergeQuizzesWithQuestionBank([], new Map())).toEqual([]);
  });

  it('replaces question with bank entry when id matches (same reference)', () => {
    const bank = new Map<string, AnyQuestion>([['q1', bankQ]]);
    const quizzes = [minimalQuiz({ id: 'quiz-a', title: 'A', questions: [embeddedQ] })];
    const out = mergeQuizzesWithQuestionBank(quizzes, bank);
    expect(out[0].questions[0]).toBe(bankQ);
    expect(out[0].questions[0].stem).toBe('bank stem');
  });

  it('keeps embedded question when id is not in bank', () => {
    const onlyInQuiz: AnyQuestion = {
      id: 'hq1',
      type: 'mcq',
      stem: 'lesson only',
      choices: [{ id: 'x', label: 'y', isCorrect: true }]
    };
    const bank = new Map<string, AnyQuestion>([['q1', bankQ]]);
    const quizzes = [minimalQuiz({ id: 'q', title: 'T', questions: [onlyInQuiz] })];
    const out = mergeQuizzesWithQuestionBank(quizzes, bank);
    expect(out[0].questions[0]).toBe(onlyInQuiz);
  });

  it('preserves question order', () => {
    const q2: AnyQuestion = {
      id: 'q2',
      type: 'mcq',
      stem: 'two',
      choices: [{ id: 'a', label: 'a', isCorrect: true }]
    };
    const q3: AnyQuestion = {
      id: 'q3',
      type: 'mcq',
      stem: 'three',
      choices: [{ id: 'b', label: 'b', isCorrect: true }]
    };
    const bankQ2: AnyQuestion = { ...q2, stem: 'two from bank' };
    const bank = new Map<string, AnyQuestion>([['q2', bankQ2]]);
    const quizzes = [
      minimalQuiz({
        id: 'q',
        title: 'T',
        questions: [embeddedQ, q2, q3]
      })
    ];
    const out = mergeQuizzesWithQuestionBank(quizzes, bank);
    expect(out[0].questions.map((q) => q.id)).toEqual(['q1', 'q2', 'q3']);
    expect(out[0].questions[0]).toBe(embeddedQ);
    expect(out[0].questions[1]).toBe(bankQ2);
    expect(out[0].questions[2]).toBe(q3);
  });

  it('shallow-copies each quiz so titles stay independent per quiz', () => {
    const bank = new Map<string, AnyQuestion>([['q1', bankQ]]);
    const q1 = minimalQuiz({ id: 'a', title: 'First', questions: [embeddedQ] });
    const q2 = minimalQuiz({ id: 'b', title: 'Second', questions: [embeddedQ] });
    const out = mergeQuizzesWithQuestionBank([q1, q2], bank);
    expect(out).toHaveLength(2);
    expect(out[0].title).toBe('First');
    expect(out[1].title).toBe('Second');
    expect(out[0].id).toBe('a');
    expect(out[1].id).toBe('b');
    expect(out[0].questions[0]).toBe(bankQ);
    expect(out[1].questions[0]).toBe(bankQ);
  });
});
