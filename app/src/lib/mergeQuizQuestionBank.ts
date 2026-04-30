import type { AnyQuestion, Quiz } from '@/types/quiz';

/**
 * يستبدل كل سؤال في الاختبار بنسخة من البنك إن وجدت لذات الـ id، مع الحفاظ على الترتيب.
 */
export function mergeQuizzesWithQuestionBank(quizzes: Quiz[], bank: Map<string, AnyQuestion>): Quiz[] {
  return quizzes.map((quiz) => ({
    ...quiz,
    questions: quiz.questions.map((q) => bank.get(q.id) ?? q)
  }));
}
