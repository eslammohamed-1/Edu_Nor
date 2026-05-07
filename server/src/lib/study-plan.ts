import { prisma } from '../db.js';
import type { Course, Chapter, Lesson, Subject } from '@prisma/client';

export type StudyPlanLessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface StudyPlanLessonItem {
  lessonId: string;
  title: string;
  duration: number;
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  courseId: string;
  courseTitle: string;
  chapterId: string;
  chapterTitle: string;
  status: StudyPlanLessonStatus;
  isNext: boolean;
}

export interface StudyPlanNext {
  lessonId: string;
  title: string;
  duration: number;
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  courseId: string;
  chapterId: string;
}

export interface StudyPlanResult {
  nextLesson: StudyPlanNext | null;
  items: StudyPlanLessonItem[];
}

function lessonStatus(
  row: { status: string; watchedSeconds: number } | undefined
): StudyPlanLessonStatus {
  if (!row) return 'not_started';
  if (row.status === 'completed') return 'completed';
  if (row.watchedSeconds > 0 || row.status === 'in_progress') return 'in_progress';
  return 'not_started';
}

/**
 * ترتيب كامل للدروس (مادة → كورس → فصل → درس) ثم أول درس غير مكتمل = «التالي».
 */
export async function computeStudyPlanForUser(userId: string): Promise<StudyPlanResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { grade: true, stage: true, secondaryTrack: true, role: true, banned: true }
  });

  if (!user || user.banned || user.role !== 'student') {
    return { nextLesson: null, items: [] };
  }

  const progressRows = await prisma.lessonProgress.findMany({
    where: { userId }
  });
  const progressByLesson = new Map(progressRows.map((p) => [p.lessonId, p]));

  const whereCourse: import('@prisma/client').Prisma.CourseWhereInput = {
    published: true,
    subject: { visible: true }
  };

  if (user.grade) {
    whereCourse.grade = user.grade;
  }
  if (user.stage) {
    whereCourse.stage = user.stage;
  }
  if (user.secondaryTrack) {
    whereCourse.OR = [{ secondaryTrack: null }, { secondaryTrack: user.secondaryTrack }];
  }

  const courses = await prisma.course.findMany({
    where: whereCourse,
    include: {
      subject: true,
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            where: { published: true },
            orderBy: { order: 'asc' }
          }
        }
      }
    },
    orderBy: [{ subject: { sortOrder: 'asc' } }, { id: 'asc' }]
  });

  type Row = {
    lesson: Lesson;
    chapter: Chapter;
    course: Course & { subject: Subject };
  };

  const ordered: Row[] = [];
  for (const course of courses) {
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        ordered.push({ lesson, chapter, course });
      }
    }
  }

  const items: StudyPlanLessonItem[] = ordered.map((row) => {
    const pr = progressByLesson.get(row.lesson.id);
    return {
      lessonId: row.lesson.id,
      title: row.lesson.title,
      duration: row.lesson.duration,
      subjectId: row.course.subject.id,
      subjectName: row.course.subject.name,
      subjectSlug: row.course.subject.slug,
      courseId: row.course.id,
      courseTitle: row.course.title,
      chapterId: row.chapter.id,
      chapterTitle: row.chapter.title,
      status: lessonStatus(pr),
      isNext: false
    };
  });

  let nextLesson: StudyPlanNext | null = null;
  const firstIncomplete = items.findIndex((it) => it.status !== 'completed');
  if (firstIncomplete >= 0) {
    const nextItem = items[firstIncomplete];
    items[firstIncomplete] = { ...nextItem, isNext: true };
    nextLesson = {
      lessonId: nextItem.lessonId,
      title: nextItem.title,
      duration: nextItem.duration,
      subjectId: nextItem.subjectId,
      subjectName: nextItem.subjectName,
      subjectSlug: nextItem.subjectSlug,
      courseId: nextItem.courseId,
      chapterId: nextItem.chapterId
    };
  }

  return { nextLesson, items };
}
