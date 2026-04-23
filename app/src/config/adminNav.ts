export interface NavLink {
  to: string;
  label: string;
  icon: string;
}

export interface NavSection {
  title: string;
  links: NavLink[];
}

export const adminNavSections: NavSection[] = [
  {
    title: 'عام',
    links: [
      { to: '/admin', label: 'لوحة التحكم', icon: 'LayoutDashboard' }
    ]
  },
  {
    title: 'المستخدمون',
    links: [
      { to: '/admin/users', label: 'إدارة المستخدمين', icon: 'Users' }
    ]
  },
  {
    title: 'المحتوى',
    links: [
      { to: '/admin/subjects', label: 'المواد الدراسية', icon: 'BookOpen' },
      { to: '/admin/courses', label: 'الكورسات', icon: 'GraduationCap' },
      { to: '/admin/lessons', label: 'الدروس', icon: 'PlayCircle' }
    ]
  },
  {
    title: 'التقييم',
    links: [
      { to: '/admin/quizzes', label: 'الاختبارات', icon: 'ClipboardList' }
    ]
  },
  {
    title: 'التحليلات',
    links: [
      { to: '/admin/analytics', label: 'الإحصائيات', icon: 'BarChart3' }
    ]
  },
  {
    title: 'النظام',
    links: [
      { to: '/admin/settings', label: 'الإعدادات', icon: 'Settings' },
      { to: '/admin/audit', label: 'سجل التدقيق', icon: 'Shield' }
    ]
  }
];
