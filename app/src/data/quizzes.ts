import type { Quiz } from '@/types/quiz';
import { allQuestions } from './questions';

// The imported array is already typed correctly in the index.ts
const masterQuestions = allQuestions;

export const quizzes: Quiz[] = [
  {
    id: 'master-13-types-demo',
    title: 'الاختبار الشامل للـ 13 نوع (عرض تجريبي)',
    description: 'يحتوي هذا الاختبار على جميع الأشكال المعتمدة للأسئلة مثل الترتيب، التوصيل، الإدخال الرقمي، وغيرها.',
    subjectId: 'history',
    grade: 'الصف الثالث الثانوي',
    duration: 30,
    passingScore: 50,
    questions: masterQuestions
  },
  {
    id: 'history-quiz-1',
    title: 'اختبار: عوامل قدوم الحملة الفرنسية',
    description: 'اختبر معلوماتك حول الأسباب والدوافع التي أدت لمجيء الحملة الفرنسية على مصر.',
    subjectId: 'history',
    grade: 'الصف الثالث الثانوي',
    lessonId: 'toc-l-a58d0b2e1f095b',
    duration: 5,
    passingScore: 50,
    questions: [
      {
        id: 'hq1',
        type: 'mcq',
        stem: 'ما هو الهدف الأساسي من مجيء الحملة الفرنسية إلى مصر؟',
        explanation: 'كان الهدف الاستراتيجي الرئيسي لفرنسا هو ضرب مصالح إنجلترا الاستعمارية وقطع طريق تجارتها إلى الهند.',
        choices: [
          { id: 'c1', label: 'قطع طريق التجارة على إنجلترا إلى الهند', isCorrect: true },
          { id: 'c2', label: 'مساعدة المماليك في السيطرة', isCorrect: false },
          { id: 'c3', label: 'نشر الثقافة الفرنسية', isCorrect: false },
          { id: 'c4', label: 'دعم الدولة العثمانية', isCorrect: false }
        ]
      }
    ]
  }
];

export function findQuizById(id: string): Quiz | undefined {
  return quizzes.find((q) => q.id === id);
}

export function findQuizByLessonId(lessonId: string): Quiz | undefined {
  return quizzes.find((q) => q.lessonId === lessonId);
}
