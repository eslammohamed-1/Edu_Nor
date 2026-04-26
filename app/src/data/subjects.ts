import type { Subject } from '@/types/course';

/**
 * كتالوج مواد المنهج (ابتدائي / إعدادي / ثانوي) مبني على تغطية المقررات الشائعة
 * (مثل: برامج مثل Nagwa Classes). المعرفات `id` لـ math, arabic, english, science
 * و physics, chemistry, biology تبقى كما هي لربطها بالكورسات والوحدات الحالية.
 */
export const subjects: Subject[] = [
  {
    id: 'arabic',
    name: 'اللغة العربية',
    slug: 'arabic',
    icon: 'BookOpen',
    color: '#1E3A5F',
    stages: ['primary', 'prep', 'secondary'],
    description: 'نحو وبلاغة وأدب ونصوص — من الابتدائي حتى الثانوي.',
    lessonsCount: 1374,
    coursesCount: 71
  },
  {
    id: 'english',
    name: 'اللغة الإنجليزية',
    slug: 'english',
    icon: 'Languages',
    color: '#3498DB',
    stages: ['primary', 'prep', 'secondary'],
    description: 'English — من المستوى الأول حتى الامتحانات النهائية.',
    lessonsCount: 1056,
    coursesCount: 21
  },
  {
    id: 'connect-plus',
    name: 'Connect Plus',
    slug: 'connect-plus',
    icon: 'Link2',
    color: '#1ABC9C',
    stages: ['primary'],
    description: 'برنامج مكوّن للتأسيس (غالباً صف أول–ثالث ابتدائي).',
    lessonsCount: 944,
    coursesCount: 5
  },
  {
    id: 'math',
    name: 'الرياضيات',
    slug: 'math',
    icon: 'Calculator',
    color: '#F4A825',
    stages: ['primary', 'prep', 'secondary'],
    description: 'Mathematics / الجبر والهندسة والتفاضل — جميع الأقسام (أدبي وعلمي).',
    lessonsCount: 1521,
    coursesCount: 33
  },
  {
    id: 'discover',
    name: 'اكتشف',
    slug: 'discover',
    icon: 'Compass',
    color: '#8E44AD',
    stages: ['primary'],
    description: 'Discover — أنشطة استكشاف وربط (غالباً صف أول–ثالث ابتدائي).',
    lessonsCount: 255,
    coursesCount: 6
  },
  {
    id: 'science',
    name: 'العلوم',
    slug: 'science',
    icon: 'Atom',
    color: '#2EC4B6',
    stages: ['primary', 'prep', 'secondary'],
    description: 'Science / علوم من الجذور حتى تخصصات الثانوية (مع العلوم المتكاملة في أولى ثانوي).',
    lessonsCount: 472,
    coursesCount: 20
  },
  {
    id: 'social-studies',
    name: 'الدراسات الاجتماعية',
    slug: 'social-studies',
    icon: 'LandPlot',
    color: '#C0392B',
    stages: ['primary', 'prep'],
    description: 'مادة موحّدة في الابتدائي والإعدادي قبل التفكيك في الثانوية.',
    lessonsCount: 446,
    coursesCount: 29
  },
  {
    id: 'ict',
    name: 'تكنولوجيا المعلومات والاتصالات (ICT)',
    slug: 'ict',
    icon: 'Laptop',
    color: '#16A085',
    stages: ['primary'],
    description: 'ICT — من الصف الرابع الابتدائي عادة.',
    lessonsCount: 40,
    coursesCount: 2
  },
  {
    id: 'french',
    name: 'Français',
    slug: 'french',
    icon: 'BookMarked',
    color: '#2980B9',
    stages: ['secondary'],
    description: 'اللغة الفرنسية — ثانوي.',
    lessonsCount: 64,
    coursesCount: 3
  },
  {
    id: 'german',
    name: 'Deutsch',
    slug: 'german',
    icon: 'BookMarked',
    color: '#5D6D7E',
    stages: ['secondary'],
    description: 'اللغة الألمانية — ثانوي.',
    lessonsCount: 64,
    coursesCount: 3
  },
  {
    id: 'italian',
    name: 'Italiano',
    slug: 'italian',
    icon: 'BookMarked',
    color: '#E67E22',
    stages: ['secondary'],
    description: 'اللغة الإيطالية — ثانوي.',
    lessonsCount: 48,
    coursesCount: 2
  },
  {
    id: 'spanish',
    name: 'Español',
    slug: 'spanish',
    icon: 'BookMarked',
    color: '#E74C3C',
    stages: ['secondary'],
    description: 'اللغة الإسبانية — ثانوي.',
    lessonsCount: 48,
    coursesCount: 2
  },
  {
    id: 'history',
    name: 'التاريخ',
    slug: 'history',
    icon: 'Scroll',
    color: '#A0522D',
    stages: ['secondary'],
    description: 'التاريخ — في الثانوية بشكل مستقل.',
    lessonsCount: 228,
    coursesCount: 7
  },
  {
    id: 'philosophy',
    name: 'الفلسفة والمنطق',
    slug: 'philosophy',
    icon: 'Lightbulb',
    color: '#7D6608',
    stages: ['secondary'],
    description: 'فلسفة ومنطق — عادة في أولى ثانوي وما بعده.',
    lessonsCount: 81,
    coursesCount: 5
  },
  {
    id: 'integrated-science',
    name: 'العلوم المتكاملة / Integrated Science',
    slug: 'integrated-science',
    icon: 'FlaskConical',
    color: '#117A65',
    stages: ['secondary'],
    description: 'محتوى مدمج في أولى ثانوي (عربي/إنجليزي).',
    lessonsCount: 178,
    coursesCount: 2
  },
  {
    id: 'physics',
    name: 'الفيزياء',
    slug: 'physics',
    icon: 'Zap',
    color: '#9B59B6',
    stages: ['secondary'],
    description: 'Physics — من تانية ثانوي فصاعداً في المسارات الشائعة.',
    lessonsCount: 2,
    coursesCount: 1
  },
  {
    id: 'chemistry',
    name: 'الكيمياء',
    slug: 'chemistry',
    icon: 'FlaskConical',
    color: '#27AE60',
    stages: ['secondary'],
    description: 'Chemistry — ثانوي (قسم علمي).',
    lessonsCount: 158,
    coursesCount: 4
  },
  {
    id: 'biology',
    name: 'الأحياء',
    slug: 'biology',
    icon: 'Dna',
    color: '#E67E22',
    stages: ['secondary'],
    description: 'Biology — عادة تالتة ثانوي (قسم علمي).',
    lessonsCount: 296,
    coursesCount: 2
  },
  {
    id: 'geography',
    name: 'الجغرافيا',
    slug: 'geography',
    icon: 'Globe2',
    color: '#1E8449',
    stages: ['secondary'],
    description: 'الجغرافيا — ثانوي (منفصلة غالباً في أولى/تانية ثانوي).',
    lessonsCount: 176,
    coursesCount: 4
  },
  {
    id: 'psychology-social',
    name: 'علم النفس والاجتماع',
    slug: 'psychology-social',
    icon: 'Users',
    color: '#AF7AC5',
    stages: ['secondary'],
    description: 'Psychology & Sociology — تانية ثانوي في عدة برامج.',
    lessonsCount: 76,
    coursesCount: 2
  },
  {
    id: 'statistics',
    name: 'الإحصاء',
    slug: 'statistics',
    icon: 'BarChart3',
    color: '#2874A6',
    stages: ['secondary'],
    description: 'Statistics / الإحصاء — تالتة ثانوي.',
    lessonsCount: 101,
    coursesCount: 2
  }
];

export function findSubjectById(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id);
}

export function findSubjectBySlug(slug: string): Subject | undefined {
  return subjects.find((s) => s.slug === slug);
}
