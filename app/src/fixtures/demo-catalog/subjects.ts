import type { Subject } from '@/types/course';
import subjectsJson from './generated/subjects.json';

export const subjects: Subject[] = subjectsJson as Subject[];

export function findSubjectById(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id);
}

export function findSubjectBySlug(slug: string): Subject | undefined {
  return subjects.find((s) => s.slug === slug);
}
