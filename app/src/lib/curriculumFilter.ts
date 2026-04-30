import type { Subject, Stage } from '@/types/course';
import type { User } from '@/types/auth';
import type { CurriculumOffering } from '@/types/curriculum';
import curriculumData from '@/fixtures/demo-catalog/curriculumOfferings.json';
import { subjects as allSubjects } from '@/fixtures/demo-catalog/subjects';

const { offerings } = curriculumData as { offerings: CurriculumOffering[] };

function offeringMatchesUser(o: CurriculumOffering, user: User): boolean {
  if (o.stage !== user.stage || o.grade !== user.grade) return false;
  if (user.stage !== 'secondary') return true;
  if (!user.secondaryTrack) return true;
  if (!o.secondaryTrack) return true;
  return o.secondaryTrack === user.secondaryTrack;
}

/** أسماء slugs المفروضة لصف/مسار الطالب (طالب فقط) */
export function getSubjectSlugsForUser(user: User): Set<string> {
  return new Set(
    offerings
      .filter((o) => offeringMatchesUser(o, user))
      .map((o) => o.subjectSlug)
  );
}

/**
 * فلترة كتالوج المواد: تبويب مرحلة + بحث + وضع «موادي» حسب سجل المنهج.
 */
export function getDisplayedSubjects(options: {
  user: User | null;
  subjectsScope: 'all' | 'my';
  stageFilter: Stage | 'all';
  searchQuery: string;
  /** إن وُجدت تُستخدم بدل المواد الثابتة من الـfixtures (مصدر الخادم / الكتالوج المزامن). */
  subjectsCatalog?: Subject[];
}): Subject[] {
  const { user, subjectsScope, stageFilter, searchQuery, subjectsCatalog } = options;

  let list = subjectsCatalog ?? allSubjects;
  if (stageFilter !== 'all') {
    list = list.filter((s) => s.stages.includes(stageFilter as Stage));
  }
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    list = list.filter((s) => s.name.toLowerCase().includes(q));
  }

  if (
    subjectsScope !== 'my' ||
    !user ||
    user.role !== 'student' ||
    !user.stage ||
    !user.grade
  ) {
    return list;
  }

  const slugs = getSubjectSlugsForUser(user);
  return list.filter((s) => slugs.has(s.slug));
}

export function getCurriculumOfferings(): CurriculumOffering[] {
  return offerings;
}
