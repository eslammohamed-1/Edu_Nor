import type { Lesson } from '@/types/course';
import { courses } from './courses';

export function findLessonById(lessonId: string): {
  lesson: Lesson;
  courseId: string;
  chapterId: string;
} | null {
  for (const course of courses) {
    for (const chapter of course.chapters) {
      const lesson = chapter.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return { lesson, courseId: course.id, chapterId: chapter.id };
      }
    }
  }
  return null;
}

export function getAdjacentLessons(lessonId: string): {
  prev: Lesson | null;
  next: Lesson | null;
} {
  for (const course of courses) {
    const flatLessons: Lesson[] = [];
    for (const chapter of course.chapters) {
      flatLessons.push(...chapter.lessons);
    }

    const idx = flatLessons.findIndex((l) => l.id === lessonId);
    if (idx !== -1) {
      return {
        prev: idx > 0 ? flatLessons[idx - 1] : null,
        next: idx < flatLessons.length - 1 ? flatLessons[idx + 1] : null
      };
    }
  }
  return { prev: null, next: null };
}
