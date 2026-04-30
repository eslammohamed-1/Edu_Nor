import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Subject, Course, Lesson } from '@/types/course';
import { subjects as seedSubjects } from '@/fixtures/demo-catalog/subjects';
import { courses as seedCourses } from '@/fixtures/demo-catalog/courses';
import { audit } from '@/lib/audit';

const STORAGE_KEY = 'edunor.admin.content';

interface AdminLesson extends Lesson {
  courseId: string;
  published?: boolean;
}

interface AdminCourse extends Course {
  published?: boolean;
  tags?: string[];
}

interface AdminSubject extends Subject {
  visible?: boolean;
}

interface ContentStore {
  subjects: AdminSubject[];
  courses: AdminCourse[];
  lessons: AdminLesson[];
}

function readStorage(): ContentStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ContentStore;
  } catch {}

  // seed from existing data
  const lessons: AdminLesson[] = [];
  seedCourses.forEach(course => {
    course.chapters?.forEach(ch =>
      ch.lessons?.forEach(l =>
        lessons.push({ ...l, courseId: course.id, published: true })
      )
    );
  });

  return {
    subjects: seedSubjects.map(s => ({ ...s, visible: true })),
    courses: seedCourses.map(c => ({ ...c, published: true })),
    lessons
  };
}

function writeStorage(data: ContentStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const useAdminContentStore = defineStore('adminContent', () => {
  const data = ref<ContentStore>(readStorage());

  const subjects = computed(() => data.value.subjects);
  const courses = computed(() => data.value.courses);
  const lessons = computed(() => data.value.lessons);
  const publishedCourses = computed(() => data.value.courses.filter(c => c.published !== false));

  function save() { writeStorage(data.value); }

  // ---- Subjects ----
  function createSubject(payload: Omit<AdminSubject, 'id' | 'lessonsCount' | 'coursesCount'>): AdminSubject {
    const s: AdminSubject = {
      ...payload, id: 'sub_' + Date.now(),
      lessonsCount: 0, coursesCount: 0, visible: true
    };
    data.value.subjects.push(s);
    save();
    audit('subject.create', { type: 'subject', id: s.id, label: s.name });
    return s;
  }

  function updateSubject(id: string, updates: Partial<AdminSubject>) {
    const idx = data.value.subjects.findIndex(s => s.id === id);
    if (idx === -1) return;
    data.value.subjects[idx] = { ...data.value.subjects[idx], ...updates };
    save();
    audit('subject.update', { type: 'subject', id, label: data.value.subjects[idx].name });
  }

  function deleteSubject(id: string) {
    const s = data.value.subjects.find(s => s.id === id);
    data.value.subjects = data.value.subjects.filter(s => s.id !== id);
    save();
    audit('subject.delete', { type: 'subject', id, label: s?.name });
  }

  function reorderSubjects(newOrder: string[]) {
    const map = Object.fromEntries(data.value.subjects.map(s => [s.id, s]));
    data.value.subjects = newOrder.map(id => map[id]).filter(Boolean);
    save();
  }

  // ---- Courses ----
  function createCourse(payload: Omit<AdminCourse, 'id' | 'studentsCount' | 'rating' | 'chapters'>): AdminCourse {
    const c: AdminCourse = {
      ...payload, id: 'course_' + Date.now(),
      studentsCount: 0, rating: 0, chapters: [], published: false
    };
    data.value.courses.push(c);
    save();
    audit('course.create', { type: 'course', id: c.id, label: c.title });
    return c;
  }

  function updateCourse(id: string, updates: Partial<AdminCourse>) {
    const idx = data.value.courses.findIndex(c => c.id === id);
    if (idx === -1) return;
    data.value.courses[idx] = { ...data.value.courses[idx], ...updates };
    save();
    audit('course.update', { type: 'course', id, label: data.value.courses[idx].title });
  }

  function deleteCourse(id: string) {
    const c = data.value.courses.find(c => c.id === id);
    data.value.courses = data.value.courses.filter(c => c.id !== id);
    data.value.lessons = data.value.lessons.filter(l => l.courseId !== id);
    save();
    audit('course.delete', { type: 'course', id, label: c?.title });
  }

  function publishCourse(id: string, published: boolean) {
    const idx = data.value.courses.findIndex(c => c.id === id);
    if (idx === -1) return;
    data.value.courses[idx].published = published;
    save();
    audit(published ? 'course.publish' : 'course.unpublish',
      { type: 'course', id, label: data.value.courses[idx].title });
  }

  // ---- Lessons ----
  function createLesson(payload: Omit<AdminLesson, 'id'>): AdminLesson {
    const l: AdminLesson = { ...payload, id: 'lesson_' + Date.now(), published: false };
    data.value.lessons.push(l);
    save();
    audit('lesson.create', { type: 'lesson', id: l.id, label: l.title });
    return l;
  }

  function updateLesson(id: string, updates: Partial<AdminLesson>) {
    const idx = data.value.lessons.findIndex(l => l.id === id);
    if (idx === -1) return;
    data.value.lessons[idx] = { ...data.value.lessons[idx], ...updates };
    save();
    audit('lesson.update', { type: 'lesson', id, label: data.value.lessons[idx].title });
  }

  function deleteLesson(id: string) {
    const l = data.value.lessons.find(l => l.id === id);
    data.value.lessons = data.value.lessons.filter(l => l.id !== id);
    save();
    audit('lesson.delete', { type: 'lesson', id, label: l?.title });
  }

  function publishLesson(id: string, published: boolean) {
    const idx = data.value.lessons.findIndex(l => l.id === id);
    if (idx === -1) return;
    data.value.lessons[idx].published = published;
    save();
    audit(published ? 'lesson.publish' : 'lesson.unpublish',
      { type: 'lesson', id, label: data.value.lessons[idx].title });
  }

  function lessonsByCourse(courseId: string): AdminLesson[] {
    return data.value.lessons.filter(l => l.courseId === courseId);
  }

  function coursesBySubject(subjectId: string): AdminCourse[] {
    return data.value.courses.filter(c => c.subjectId === subjectId);
  }

  return {
    subjects, courses, lessons, publishedCourses,
    createSubject, updateSubject, deleteSubject, reorderSubjects,
    createCourse, updateCourse, deleteCourse, publishCourse,
    createLesson, updateLesson, deleteLesson, publishLesson,
    lessonsByCourse, coursesBySubject
  };
});
