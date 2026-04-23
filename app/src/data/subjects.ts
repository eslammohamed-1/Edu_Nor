import type { Subject } from '@/types/course';

export const subjects: Subject[] = [
  {
    id: 'math',
    name: 'الرياضيات',
    slug: 'math',
    icon: 'Calculator',
    color: '#F4A825',
    stages: ['primary', 'prep', 'secondary'],
    description: 'كل ما تحتاجه لفهم الرياضيات من الأساسيات إلى التفاضل والتكامل.',
    lessonsCount: 248,
    coursesCount: 12
  },
  {
    id: 'science',
    name: 'العلوم',
    slug: 'science',
    icon: 'Atom',
    color: '#2EC4B6',
    stages: ['primary', 'prep'],
    description: 'استكشف عالم العلوم الطبيعية بتجارب شيقة ومحتوى تفاعلي.',
    lessonsCount: 180,
    coursesCount: 9
  },
  {
    id: 'arabic',
    name: 'اللغة العربية',
    slug: 'arabic',
    icon: 'BookOpen',
    color: '#1E3A5F',
    stages: ['primary', 'prep', 'secondary'],
    description: 'النحو والبلاغة والأدب والنصوص بطريقة مبسطة وممتعة.',
    lessonsCount: 215,
    coursesCount: 10
  },
  {
    id: 'english',
    name: 'اللغة الإنجليزية',
    slug: 'english',
    icon: 'Languages',
    color: '#3498DB',
    stages: ['primary', 'prep', 'secondary'],
    description: 'تعلم الإنجليزية من المحادثة حتى القواعد المتقدمة.',
    lessonsCount: 192,
    coursesCount: 11
  },
  {
    id: 'physics',
    name: 'الفيزياء',
    slug: 'physics',
    icon: 'Zap',
    color: '#9B59B6',
    stages: ['secondary'],
    description: 'اكتشف قوانين الكون من الميكانيكا إلى الكهرومغناطيسية.',
    lessonsCount: 140,
    coursesCount: 6
  },
  {
    id: 'chemistry',
    name: 'الكيمياء',
    slug: 'chemistry',
    icon: 'FlaskConical',
    color: '#27AE60',
    stages: ['prep', 'secondary'],
    description: 'تعمق في عالم الذرات والتفاعلات والمركبات الكيميائية.',
    lessonsCount: 128,
    coursesCount: 5
  },
  {
    id: 'biology',
    name: 'الأحياء',
    slug: 'biology',
    icon: 'Dna',
    color: '#E67E22',
    stages: ['secondary'],
    description: 'ادرس الكائنات الحية والتركيب الخلوي ووظائف الأعضاء.',
    lessonsCount: 112,
    coursesCount: 4
  },
  {
    id: 'history',
    name: 'التاريخ والجغرافيا',
    slug: 'social',
    icon: 'Globe',
    color: '#E74C3C',
    stages: ['prep', 'secondary'],
    description: 'رحلة عبر الحضارات والدول والأماكن حول العالم.',
    lessonsCount: 96,
    coursesCount: 6
  }
];

export function findSubjectById(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id);
}

export function findSubjectBySlug(slug: string): Subject | undefined {
  return subjects.find((s) => s.slug === slug);
}
