import type { Course } from '@/types/course';
import coursesJson from './generated/courses.json';

/** كتالوج الكورسات يُولَّد من `data/csv/*` عبر `python3 scripts/build_catalog_from_csv.py` ودمج ToC. */
export const courses: Course[] = coursesJson as Course[];

export function findCourseById(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function findCoursesBySubject(subjectId: string): Course[] {
  return courses.filter((c) => c.subjectId === subjectId);
}
