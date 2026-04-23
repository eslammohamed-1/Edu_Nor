import type { Quiz } from '@/types/quiz';

export const quizzes: Quiz[] = [
  {
    id: 'math-algebra-basic',
    title: 'اختبار الجبر الأساسي',
    description: 'اختبر معلوماتك في الجبر الأساسي للصف الثالث الثانوي.',
    subjectId: 'math',
    grade: 'الصف الثالث الثانوي',
    duration: 10,
    passingScore: 60,
    questions: [
      {
        id: 'q1',
        text: 'ما ناتج حل المعادلة: 2x + 5 = 15 ؟',
        options: [
          { id: 'a', label: 'x = 3' },
          { id: 'b', label: 'x = 5' },
          { id: 'c', label: 'x = 7' },
          { id: 'd', label: 'x = 10' }
        ],
        correctOptionId: 'b',
        explanation: 'نطرح 5 من الطرفين: 2x = 10 ثم نقسم على 2 فيكون x = 5.'
      },
      {
        id: 'q2',
        text: 'إذا كانت ق(س) = 2س + 3 فما قيمة ق(4)؟',
        options: [
          { id: 'a', label: '7' },
          { id: 'b', label: '8' },
          { id: 'c', label: '11' },
          { id: 'd', label: '14' }
        ],
        correctOptionId: 'c',
        explanation: 'نعوض س = 4: ق(4) = 2(4) + 3 = 8 + 3 = 11.'
      },
      {
        id: 'q3',
        text: 'حل المتباينة: 3x - 7 > 2',
        options: [
          { id: 'a', label: 'x > 3' },
          { id: 'b', label: 'x > -3' },
          { id: 'c', label: 'x < 3' },
          { id: 'd', label: 'x = 3' }
        ],
        correctOptionId: 'a',
        explanation: 'نضيف 7 لكلا الطرفين: 3x > 9 ثم نقسم على 3 فيكون x > 3.'
      },
      {
        id: 'q4',
        text: 'ما المعادلة التي مرسومها خط مستقيم يمر بالنقطة (0, 0)؟',
        options: [
          { id: 'a', label: 'y = x + 1' },
          { id: 'b', label: 'y = 2x' },
          { id: 'c', label: 'y = x² ' },
          { id: 'd', label: 'y = 3' }
        ],
        correctOptionId: 'b',
        explanation: 'المعادلة y = 2x تمر بنقطة الأصل (0,0) لأنها لا تحتوي ثابتاً.'
      },
      {
        id: 'q5',
        text: 'ميل الخط المستقيم y = -3x + 4 يساوي:',
        options: [
          { id: 'a', label: '3' },
          { id: 'b', label: '-3' },
          { id: 'c', label: '4' },
          { id: 'd', label: '-4' }
        ],
        correctOptionId: 'b',
        explanation: 'في الصيغة y = mx + b يكون الميل m هو معامل x وهو -3.'
      }
    ]
  },
  {
    id: 'physics-electro',
    title: 'اختبار الكهرومغناطيسية',
    description: 'اختبر فهمك لأساسيات الكهرومغناطيسية.',
    subjectId: 'physics',
    grade: 'الصف الثالث الثانوي',
    duration: 8,
    passingScore: 60,
    questions: [
      {
        id: 'pq1',
        text: 'وحدة قياس الشحنة الكهربية هي:',
        options: [
          { id: 'a', label: 'الأمبير' },
          { id: 'b', label: 'الفولت' },
          { id: 'c', label: 'الكولوم' },
          { id: 'd', label: 'الأوم' }
        ],
        correctOptionId: 'c',
        explanation: 'وحدة قياس الشحنة في النظام الدولي هي الكولوم (C).'
      },
      {
        id: 'pq2',
        text: 'ينص قانون كولوم على أن القوة بين شحنتين:',
        options: [
          { id: 'a', label: 'تتناسب طردياً مع مربع المسافة' },
          { id: 'b', label: 'تتناسب عكسياً مع مربع المسافة' },
          { id: 'c', label: 'تتناسب طردياً مع المسافة' },
          { id: 'd', label: 'لا تعتمد على المسافة' }
        ],
        correctOptionId: 'b',
        explanation: 'القوة تتناسب عكسياً مع مربع المسافة بين الشحنتين.'
      },
      {
        id: 'pq3',
        text: 'وحدة قياس شدة المجال الكهربي:',
        options: [
          { id: 'a', label: 'نيوتن/كولوم' },
          { id: 'b', label: 'جول/كولوم' },
          { id: 'c', label: 'فولت/متر²' },
          { id: 'd', label: 'كولوم/متر' }
        ],
        correctOptionId: 'a',
        explanation: 'شدة المجال = القوة/الشحنة، فالوحدة هي N/C.'
      }
    ]
  }
];

export function findQuizById(id: string): Quiz | undefined {
  return quizzes.find((q) => q.id === id);
}
