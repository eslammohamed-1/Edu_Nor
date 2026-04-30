import type { Stage, SubjectInfo } from '@/types/course';
import type { User } from '@/types/auth';

/**
 * فلترة المواد حسب المرحلة والبحث.
 * @deprecated — الفلترة الآن تتم في curriculum store مباشرة
 */
export function getDisplayedSubjects(options: {
  subjects: SubjectInfo[];
  stageFilter: Stage | 'all';
  searchQuery: string;
}): SubjectInfo[] {
  const { subjects, stageFilter, searchQuery } = options;

  let list = subjects;

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    list = list.filter((s) => s.name.toLowerCase().includes(q));
  }

  return list;
}
