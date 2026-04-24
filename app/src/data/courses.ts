import type { Course } from '@/types/course';
import coursesFromToc from '@/data/toc/generated/coursesFromToc.json';

const manualCourses: Course[] = [
  {
    id: 'arabic-sec-1-intro',
    subjectId: 'arabic',
    offeringId: '310000000039',
    title: 'اللغة العربية - الصف الأول الثانوي',
    description: 'مقدمة في النصوص والنحو والتعبير للعام الدراسي الأول بالثانوية.',
    stage: 'secondary',
    grade: 'الصف الأول الثانوي',
    instructor: 'أ. سارة نبيل',
    duration: 240,
    lessonsCount: 8,
    studentsCount: 1200,
    rating: 4.7,
    chapters: [
      {
        id: 'a1-sec-1',
        title: 'الوحدة الأولى: النص والفهم',
        description: 'قراءة وتحليل نصوص',
        order: 1,
        lessons: [
          {
            id: 'a1-sec-1-l1',
            title: 'استيعاب المقروء',
            description: 'مهارات فهم النص',
            duration: 22,
            type: 'video',
            content: '<p>نصوص وأسئلة فهم.</p>',
            keyPoints: ['الفكرة الرئيسية', 'تفاصيل'],
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'math-sec-1-basics',
    subjectId: 'math',
    offeringId: '310000000041',
    title: 'الرياضيات - الصف الأول الثانوي (أساسيات)',
    description: 'دوال ومتباينات وتمهيد لما يلي في السنوات التالية.',
    stage: 'secondary',
    grade: 'الصف الأول الثانوي',
    instructor: 'أ. كريم فؤاد',
    duration: 360,
    lessonsCount: 10,
    studentsCount: 2100,
    rating: 4.6,
    chapters: [
      {
        id: 'm1-sec-1',
        title: 'الدوال',
        description: 'مفاهيم أساسية',
        order: 1,
        lessons: [
          {
            id: 'm1-sec-1-l1',
            title: 'تعريف الدالة',
            description: 'المجال والمدى',
            duration: 24,
            type: 'video',
            content: '<p>مقدمة في الدوال الحقيقية.</p>',
            keyPoints: ['تعريف', 'رسم بسيط'],
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'math-sec-3-algebra',
    subjectId: 'math',
    title: 'الجبر والمعادلات - ثانوية عامة',
    description: 'كورس شامل في الجبر يغطي المعادلات والمتباينات والدوال للصف الثالث الثانوي.',
    stage: 'secondary',
    grade: 'الصف الثالث الثانوي',
    instructor: 'أ. محمود حسن',
    duration: 720,
    lessonsCount: 24,
    studentsCount: 1245,
    rating: 4.8,
    progress: 45,
    chapters: [
      {
        id: 'ch1',
        title: 'أساسيات الجبر',
        description: 'المقدمة إلى المعادلات والمتغيرات',
        order: 1,
        lessons: [
          {
            id: 'l1',
            title: 'مقدمة في الجبر',
            description: 'تعريف الجبر وأهميته في الرياضيات',
            duration: 25,
            type: 'video',
            videoUrl: 'https://www.youtube.com/embed/NybHckSEQBI',
            content: '<p>الجبر هو فرع من فروع الرياضيات يدرس العمليات على المتغيرات...</p>',
            keyPoints: ['تعريف المتغير', 'الفرق بين الثابت والمتغير', 'أهمية الجبر'],
            order: 1
          },
          {
            id: 'l2',
            title: 'المعادلات الخطية',
            description: 'حل المعادلات من الدرجة الأولى',
            duration: 30,
            type: 'video',
            content: '<p>المعادلة الخطية هي معادلة من الدرجة الأولى...</p>',
            keyPoints: ['صيغة المعادلة الخطية', 'طرق الحل', 'أمثلة تطبيقية'],
            order: 2
          },
          {
            id: 'l3',
            title: 'تمارين تطبيقية',
            description: 'تطبيقات على المعادلات الخطية',
            duration: 20,
            type: 'quiz',
            content: '<p>حل التمارين التالية لتعزيز فهمك...</p>',
            order: 3
          }
        ]
      },
      {
        id: 'ch2',
        title: 'الدوال والمتباينات',
        description: 'دراسة الدوال وحل المتباينات',
        order: 2,
        lessons: [
          {
            id: 'l4',
            title: 'مفهوم الدالة',
            description: 'ما هي الدالة وأنواعها',
            duration: 28,
            type: 'video',
            content: '<p>الدالة هي علاقة تربط كل عنصر من مجموعة...</p>',
            keyPoints: ['تعريف الدالة', 'المجال والمدى', 'أنواع الدوال'],
            order: 1
          },
          {
            id: 'l5',
            title: 'المتباينات',
            description: 'حل المتباينات ورسمها',
            duration: 32,
            type: 'video',
            content: '<p>المتباينة هي علاقة تبين أن أحد الأطراف أكبر من الآخر...</p>',
            order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'math-sec-3-geometry',
    subjectId: 'math',
    title: 'الهندسة التحليلية',
    description: 'دراسة الخطوط المستقيمة والقطوع المخروطية في المستوى.',
    stage: 'secondary',
    grade: 'الصف الثالث الثانوي',
    instructor: 'أ. محمود حسن',
    duration: 480,
    lessonsCount: 16,
    studentsCount: 890,
    rating: 4.6,
    progress: 20,
    chapters: [
      {
        id: 'gch1',
        title: 'الخط المستقيم',
        description: 'معادلة الخط المستقيم وخصائصه',
        order: 1,
        lessons: [
          {
            id: 'gl1',
            title: 'معادلة الخط المستقيم',
            description: 'صيغ معادلة الخط المستقيم',
            duration: 30,
            type: 'video',
            content: '<p>للخط المستقيم عدة صيغ لمعادلته...</p>',
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'physics-sec-3',
    subjectId: 'physics',
    title: 'الكهرومغناطيسية',
    description: 'كورس متقدم في الكهرومغناطيسية للصف الثالث الثانوي.',
    stage: 'secondary',
    grade: 'الصف الثالث الثانوي',
    instructor: 'د. أحمد ياسين',
    duration: 600,
    lessonsCount: 20,
    studentsCount: 1560,
    rating: 4.9,
    progress: 70,
    chapters: [
      {
        id: 'pch1',
        title: 'المجال الكهربي',
        description: 'المجال والجهد الكهربي',
        order: 1,
        lessons: [
          {
            id: 'pl1',
            title: 'شحنة كهربية وقانون كولوم',
            description: 'أساسيات الشحنات الكهربية',
            duration: 28,
            type: 'video',
            content: '<p>ينص قانون كولوم على أن القوة بين شحنتين نقطيتين...</p>',
            keyPoints: ['الشحنة الكهربية', 'قانون كولوم', 'وحدات القياس'],
            order: 1
          },
          {
            id: 'pl2',
            title: 'المجال الكهربي',
            description: 'تعريف المجال الكهربي',
            duration: 25,
            type: 'video',
            content: '<p>المجال الكهربي هو حيز من الفراغ...</p>',
            order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'arabic-prep-2',
    subjectId: 'arabic',
    title: 'النحو والصرف - إعدادي',
    description: 'شرح مبسط لقواعد النحو والصرف للصف الثاني الإعدادي.',
    stage: 'prep',
    grade: 'الصف الثاني الإعدادي',
    instructor: 'أ. فاطمة علي',
    duration: 360,
    lessonsCount: 18,
    studentsCount: 780,
    rating: 4.7,
    chapters: [
      {
        id: 'ach1',
        title: 'أقسام الكلام',
        description: 'الاسم والفعل والحرف',
        order: 1,
        lessons: [
          {
            id: 'al1',
            title: 'الاسم وعلاماته',
            description: 'تعريف الاسم وعلاماته المميزة',
            duration: 22,
            type: 'video',
            content: '<p>الاسم هو كل كلمة تدل على شيء...</p>',
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'english-prep-3',
    subjectId: 'english',
    title: 'English Grammar Essentials',
    description: 'Master the fundamentals of English grammar.',
    stage: 'prep',
    grade: 'الصف الثالث الإعدادي',
    instructor: 'Ms. Sarah Adams',
    duration: 420,
    lessonsCount: 14,
    studentsCount: 2100,
    rating: 4.8,
    progress: 10,
    chapters: [
      {
        id: 'ech1',
        title: 'Tenses',
        description: 'Present, past, and future tenses',
        order: 1,
        lessons: [
          {
            id: 'el1',
            title: 'Present Simple',
            description: 'Understanding the present simple tense',
            duration: 25,
            type: 'video',
            content: '<p>The present simple is used to describe habits...</p>',
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'science-prep-1',
    subjectId: 'science',
    title: 'العلوم الطبيعية - إعدادي',
    description: 'استكشاف عالم العلوم الطبيعية للصف الأول الإعدادي.',
    stage: 'prep',
    grade: 'الصف الأول الإعدادي',
    instructor: 'أ. خالد يوسف',
    duration: 300,
    lessonsCount: 15,
    studentsCount: 1100,
    rating: 4.5,
    chapters: [
      {
        id: 'sch1',
        title: 'الكائنات الحية',
        description: 'تصنيف الكائنات الحية',
        order: 1,
        lessons: [
          {
            id: 'sl1',
            title: 'الخلية وحدة بناء الكائن الحي',
            description: 'التركيب الأساسي للخلية',
            duration: 20,
            type: 'video',
            content: '<p>الخلية هي الوحدة الأساسية لبناء الكائنات الحية...</p>',
            order: 1
          }
        ]
      }
    ]
  }
];

export const courses: Course[] = [
  ...manualCourses,
  ...(coursesFromToc as Course[]),
];

export function findCourseById(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function findCoursesBySubject(subjectId: string): Course[] {
  return courses.filter((c) => c.subjectId === subjectId);
}
