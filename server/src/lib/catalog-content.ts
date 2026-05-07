import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { prisma } from '../db.js';

const _dir = dirname(fileURLToPath(import.meta.url));

/** `server/src/lib` → repo root */
export function repoRootFromLib(): string {
  return join(_dir, '..', '..', '..');
}

/** يملأ الحقل لمخازن SQLite القديمة: dedupe كان يستخدم id بصيغة canonical__dupأو تبقى كما هي. */
export async function ensureLessonSourceLessonKeysBackfilled(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    UPDATE "Lesson"
    SET "sourceLessonKey" = CASE
      WHEN strpos("id", '__dup') > 0 THEN substring("id" from 1 for strpos("id", '__dup') - 1)
      ELSE "id"
    END
    WHERE "sourceLessonKey" IS NULL
  `);
}

export function fixtureGeneratedDir(): string {
  return join(repoRootFromLib(), 'app', 'src', 'fixtures', 'demo-catalog', 'generated');
}

const lessonSnapSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().default(''),
  duration: z.number().optional().default(0),
  type: z.string().default('reading'),
  videoUrl: z.string().optional(),
  content: z.string().optional().default(''),
  keyPoints: z.array(z.string()).optional(),
  order: z.number().optional().default(0),
  published: z.boolean().optional(),
  courseId: z.string().optional(),
  sourceLessonKey: z.string().optional()
});

const chapterSnapSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().default(''),
  order: z.number().optional().default(0),
  lessons: z.array(lessonSnapSchema).default([])
});

const courseSnapSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  offeringId: z.string().nullable().optional(),
  title: z.string(),
  description: z.string().optional().default(''),
  stage: z.string(),
  grade: z.string(),
  secondaryTrack: z.string().nullable().optional(),
  academicYear: z.string().optional(),
  term: z.number().nullable().optional(),
  season: z.number().nullable().optional(),
  instructor: z.string().optional().default(''),
  thumbnail: z.string().optional(),
  duration: z.number().optional().default(0),
  lessonsCount: z.number().optional().default(0),
  studentsCount: z.number().optional().default(0),
  rating: z.number().optional().default(0),
  progress: z.number().optional(),
  chapters: z.array(chapterSnapSchema).optional().default([]),
  published: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

const subjectSnapSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().optional(),
  color: z.string().optional(),
  stages: z.array(z.string()).optional().default([]),
  description: z.string().optional().default(''),
  lessonsCount: z.number().optional().default(0),
  coursesCount: z.number().optional().default(0),
  visible: z.boolean().optional()
});

export const contentSnapshotSchema = z.object({
  subjects: z.array(subjectSnapSchema),
  courses: z.array(courseSnapSchema),
  lessons: z.array(lessonSnapSchema).optional().default([])
});

export type ContentSnapshot = z.infer<typeof contentSnapshotSchema>;

function resolveChaptersForCourse(
  course: z.infer<typeof courseSnapSchema>,
  flatLessons: z.infer<typeof lessonSnapSchema>[]
): z.infer<typeof chapterSnapSchema>[] {
  if (course.chapters.length > 0) {
    return course.chapters.map((ch) => ({
      ...ch,
      lessons: ch.lessons.map((l) => ({
        ...l,
        courseId: l.courseId ?? course.id
      }))
    }));
  }
  const own = flatLessons.filter((l) => l.courseId === course.id);
  if (own.length === 0) return [];
  return [
    {
      id: `ch_${course.id}_default`,
      title: 'المحتوى',
      description: '',
      order: 0,
      lessons: own
    }
  ];
}

/** Replace relational catalog from admin content snapshot / seed payload. */
export async function applyContentSnapshotToDatabase(raw: unknown): Promise<void> {
  const parsed = contentSnapshotSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error('محتوى غير صالح لحفظ الكتالوج');
  }
  const { subjects, courses, lessons: flatLessons } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.lesson.deleteMany();
    await tx.chapter.deleteMany();
    await tx.course.deleteMany();
    await tx.subject.deleteMany();

    let sortOrder = 0;
    for (const s of subjects) {
      await tx.subject.create({
        data: {
          id: s.id,
          name: s.name,
          slug: s.slug,
          icon: s.icon ?? 'BookOpen',
          color: s.color ?? '#1E3A5F',
          stagesJson: JSON.stringify(s.stages ?? []),
          description: s.description ?? '',
          visible: s.visible !== false,
          sortOrder: sortOrder++
        }
      });
    }

    const usedChapterIds = new Set<string>();
    const usedLessonIds = new Set<string>();

    for (const c of courses) {
      const chapters = resolveChaptersForCourse(c, flatLessons);
      await tx.course.create({
        data: {
          id: c.id,
          subjectId: c.subjectId,
          offeringId: c.offeringId ?? undefined,
          title: c.title,
          description: c.description ?? '',
          stage: c.stage,
          grade: c.grade,
          secondaryTrack: c.secondaryTrack ?? undefined,
          academicYear: c.academicYear,
          term: c.term ?? undefined,
          season: c.season ?? undefined,
          instructor: c.instructor ?? '',
          thumbnail: c.thumbnail,
          duration: c.duration ?? 0,
          studentsCount: c.studentsCount ?? 0,
          rating: c.rating ?? 0,
          published: c.published !== false
        }
      });

      for (const ch of chapters) {
        let chapterRowId = ch.id;
        let cn = 0;
        while (usedChapterIds.has(chapterRowId)) {
          cn++;
          chapterRowId = `${ch.id}__dup${cn}_${c.id}`;
        }
        usedChapterIds.add(chapterRowId);
        await tx.chapter.create({
          data: {
            id: chapterRowId,
            courseId: c.id,
            title: ch.title,
            description: ch.description ?? '',
            order: ch.order
          }
        });
        for (const l of ch.lessons) {
          let lessonRowId = l.id;
          let n = 0;
          while (usedLessonIds.has(lessonRowId)) {
            n++;
            lessonRowId = `${l.id}__dup${n}_${ch.id}`;
          }
          usedLessonIds.add(lessonRowId);
          await tx.lesson.create({
            data: {
              id: lessonRowId,
              chapterId: chapterRowId,
              sourceLessonKey: l.id,
              title: l.title,
              description: l.description ?? '',
              duration: l.duration,
              type: l.type,
              videoUrl: l.videoUrl,
              content: l.content ?? '',
              keyPointsJson: l.keyPoints?.length ? JSON.stringify(l.keyPoints) : null,
              order: l.order,
              published: l.published !== false
            }
          });
        }
      }
    }
  });
}

function parseKeyPoints(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? (v as string[]) : undefined;
  } catch {
    return undefined;
  }
}

/** Admin-style snapshot (includes unpublished) for `AdminSnapshot.content`. */
export async function buildContentSnapshotFromDatabase(): Promise<ContentSnapshot> {
  const subjectRows = await prisma.subject.findMany({ orderBy: { sortOrder: 'asc' } });
  const courseRows = await prisma.course.findMany({
    orderBy: { id: 'asc' },
    include: {
      chapters: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } }
      }
    }
  });

  const flatLessons: z.infer<typeof lessonSnapSchema>[] = [];

  const courses: ContentSnapshot['courses'] = courseRows.map((c) => {
    const chapters = c.chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      description: ch.description,
      order: ch.order,
      lessons: ch.lessons.map((l) => {
        flatLessons.push({
          id: l.id,
          title: l.title,
          description: l.description,
          duration: l.duration,
          type: l.type,
          videoUrl: l.videoUrl ?? undefined,
          content: l.content,
          keyPoints: parseKeyPoints(l.keyPointsJson),
          order: l.order,
          published: l.published,
          courseId: c.id,
          ...(l.sourceLessonKey ? { sourceLessonKey: l.sourceLessonKey } : {})
        });
        return {
          id: l.id,
          title: l.title,
          description: l.description,
          duration: l.duration,
          type: l.type,
          videoUrl: l.videoUrl ?? undefined,
          content: l.content,
          keyPoints: parseKeyPoints(l.keyPointsJson),
          order: l.order,
          published: l.published,
          ...(l.sourceLessonKey ? { sourceLessonKey: l.sourceLessonKey } : {})
        };
      })
    }));

    return {
      id: c.id,
      subjectId: c.subjectId,
      offeringId: c.offeringId,
      title: c.title,
      description: c.description,
      stage: c.stage,
      grade: c.grade,
      secondaryTrack: c.secondaryTrack,
      academicYear: c.academicYear ?? undefined,
      term: c.term ?? undefined,
      season: c.season ?? undefined,
      instructor: c.instructor,
      thumbnail: c.thumbnail ?? undefined,
      duration: c.duration,
      lessonsCount: chapters.reduce((acc, ch) => acc + ch.lessons.length, 0),
      studentsCount: c.studentsCount,
      rating: c.rating,
      chapters,
      published: c.published
    };
  });

  const subjects: ContentSnapshot['subjects'] = subjectRows.map((s) => {
    const myCourses = courses.filter((c) => c.subjectId === s.id);
    const lessonsCount = myCourses.reduce((acc, c) => acc + c.lessonsCount, 0);
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      icon: s.icon,
      color: s.color,
      stages: JSON.parse(s.stagesJson) as string[],
      description: s.description,
      lessonsCount,
      coursesCount: myCourses.length,
      visible: s.visible
    };
  });

  return { subjects, courses, lessons: flatLessons };
}

export async function persistAdminContentSnapshotFromDatabase(): Promise<void> {
  const snap = await buildContentSnapshotFromDatabase();
  await prisma.adminSnapshot.upsert({
    where: { key: 'content' },
    create: { key: 'content', dataJson: JSON.stringify(snap) },
    update: { dataJson: JSON.stringify(snap) }
  });
}

export type LearnerSubject = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  stages: string[];
  description: string;
  lessonsCount: number;
  coursesCount: number;
};

export type LearnerCourse = {
  id: string;
  subjectId: string;
  offeringId?: string;
  title: string;
  description: string;
  stage: string;
  grade: string;
  secondaryTrack?: 'scientific_ar' | 'scientific_languages' | 'literary';
  academicYear?: string;
  term?: number;
  season?: number;
  instructor: string;
  thumbnail?: string;
  duration: number;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  progress?: number;
  chapters: {
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      description: string;
      duration: number;
      type: string;
      videoUrl?: string;
      content: string;
      keyPoints?: string[];
      order: number;
    }[];
  }[];
};

/** Published catalog for learners (matches frontend `Subject` / `Course` JSON shape). */
export async function getLearnerCatalogFromDatabase(): Promise<{
  subjects: LearnerSubject[];
  courses: LearnerCourse[];
}> {
  await ensureLessonSourceLessonKeysBackfilled();
  const subjectRows = await prisma.subject.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' }
  });
  const courseRows = await prisma.course.findMany({
    where: { published: true },
    orderBy: { id: 'asc' },
    include: {
      chapters: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' }, where: { published: true } } }
      }
    }
  });

  const coursesFiltered: LearnerCourse[] = [];
  for (const c of courseRows) {
    const chapters = c.chapters
      .map((ch) => ({
        id: ch.id,
        title: ch.title,
        description: ch.description,
        order: ch.order,
        lessons: ch.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          duration: l.duration,
          type: l.type,
          videoUrl: l.videoUrl ?? undefined,
          content: l.content,
          keyPoints: parseKeyPoints(l.keyPointsJson),
          order: l.order
        }))
      }))
      .filter((ch) => ch.lessons.length > 0);

    if (chapters.length === 0) continue;

    const lessonsCount = chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
    coursesFiltered.push({
      id: c.id,
      subjectId: c.subjectId,
      offeringId: c.offeringId ?? undefined,
      title: c.title,
      description: c.description,
      stage: c.stage as LearnerCourse['stage'],
      grade: c.grade,
      secondaryTrack: (c.secondaryTrack ?? undefined) as LearnerCourse['secondaryTrack'],
      academicYear: c.academicYear ?? undefined,
      term: c.term ?? undefined,
      season: c.season ?? undefined,
      instructor: c.instructor,
      thumbnail: c.thumbnail ?? undefined,
      duration: c.duration,
      lessonsCount,
      studentsCount: c.studentsCount,
      rating: c.rating,
      chapters
    });
  }

  const subjectIdsUsed = new Set(coursesFiltered.map((c) => c.subjectId));
  const subjectsOut: LearnerSubject[] = subjectRows
    .filter((s) => subjectIdsUsed.has(s.id))
    .map((s) => {
      const my = coursesFiltered.filter((c) => c.subjectId === s.id);
      const lessonsCount = my.reduce((acc, c) => acc + c.lessonsCount, 0);
      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        icon: s.icon,
        color: s.color,
        stages: JSON.parse(s.stagesJson) as string[],
        description: s.description,
        lessonsCount,
        coursesCount: my.length
      };
    });

  return { subjects: subjectsOut, courses: coursesFiltered };
}

/** صفوف دروس المتعلّم المنشورة (كتالوج)، تتضمن مفتاح المصدر لمطابقة quiz.lessonId. */
export async function getLearnerPublishedLessonRows(): Promise<
  Array<{ id: string; sourceLessonKey: string | null }>
> {
  return prisma.lesson.findMany({
    where: {
      published: true,
      chapter: {
        course: {
          published: true,
          subject: { visible: true }
        }
      }
    },
    select: { id: true, sourceLessonKey: true }
  });
}

export async function readFixtureCatalogSnapshot(): Promise<ContentSnapshot> {
  const gen = fixtureGeneratedDir();
  const [subjectsRaw, coursesRaw] = await Promise.all([
    readFile(join(gen, 'subjects.json'), 'utf-8'),
    readFile(join(gen, 'courses.json'), 'utf-8')
  ]);
  const subjectsJson = JSON.parse(subjectsRaw) as unknown[];
  const coursesJson = JSON.parse(coursesRaw) as unknown[];

  const subjects = subjectsJson.map((raw) => {
    const parsed = subjectSnapSchema.safeParse({ ...(raw as object), visible: true });
    if (!parsed.success) throw new Error(`subjects.json: ${parsed.error.message}`);
    return parsed.data;
  });

  const courses: ContentSnapshot['courses'] = [];
  const flatLessons: z.infer<typeof lessonSnapSchema>[] = [];
  for (const raw of coursesJson) {
    const parsed = courseSnapSchema.safeParse(raw);
    if (!parsed.success) throw new Error(`courses.json: ${parsed.error.message}`);
    const c = parsed.data;
    courses.push(c);
    const chs = resolveChaptersForCourse(c, []);
    for (const ch of chs) {
      for (const l of ch.lessons) {
        flatLessons.push({
          ...l,
          courseId: l.courseId ?? c.id
        });
      }
    }
  }

  return { subjects, courses, lessons: flatLessons };
}

/** If relational catalog empty, hydrate from bundled `fixtures/demo-catalog/generated` JSON. */
export async function bootstrapCatalogFromFixturesIfEmpty(): Promise<boolean> {
  if ((await prisma.subject.count()) > 0) return false;
  const snap = await readFixtureCatalogSnapshot();
  await applyContentSnapshotToDatabase(snap);
  await persistAdminContentSnapshotFromDatabase();
  return true;
}
