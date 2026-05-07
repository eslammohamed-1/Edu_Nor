import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SubjectInfo, LessonInfo } from '@/types/course';
import { audit } from '@/lib/audit';
import { fetchAdminSnapshot, saveAdminSnapshot } from '@/services/adminSystemService';
import { getApiBase } from '@/services/http/client';
import curriculumData from '@/fixtures/demo-catalog/generated/curriculum.json';

const STORAGE_KEY = 'edunor.admin.content';

interface AdminLesson extends LessonInfo {
  subjectId: string;
  published?: boolean;
}

interface AdminSubject extends SubjectInfo {
  visible?: boolean;
}

interface ContentStore {
  subjects: AdminSubject[];
  lessons: AdminLesson[];
}

function readStorage(): ContentStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ContentStore;
  } catch {}

  // Seed from curriculum data
  const subjects: AdminSubject[] = [];
  const lessons: AdminLesson[] = [];

  for (const stage of curriculumData.stages) {
    for (const grade of stage.grades) {
      for (const term of grade.terms) {
        for (const subj of term.subjects) {
          subjects.push({ ...(subj as unknown as AdminSubject), visible: true });
          for (const lesson of subj.lessons) {
            lessons.push({
              ...(lesson as unknown as AdminLesson),
              subjectId: subj.id,
              published: true
            });
          }
        }
      }
    }
  }

  return { subjects, lessons };
}

function writeStorage(data: ContentStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const useAdminContentStore = defineStore('adminContent', () => {
  const data = ref<ContentStore>(readStorage());
  const loading = ref(false);

  const subjects = computed(() => data.value.subjects);
  const lessons = computed(() => data.value.lessons);
  /** في هذا المخزن، «الكورس» يُمثَّل بالمادة (Subject)؛ يُستعمل للوحة التحكم فقط */
  const courses = computed(() => data.value.subjects);
  const publishedCourses = computed(() => data.value.lessons.filter((l) => l.published));

  async function fetchContent() {
    if (!getApiBase()) {
      data.value = readStorage();
      return;
    }
    loading.value = true;
    try {
      const remote = await fetchAdminSnapshot<ContentStore>('content');
      if (remote) data.value = remote;
      else await saveAdminSnapshot('content', data.value);
    } finally {
      loading.value = false;
    }
  }

  function save() {
    if (!getApiBase()) writeStorage(data.value);
    else void saveAdminSnapshot('content', data.value);
  }

  // ---- Subjects ----
  function createSubject(payload: Partial<AdminSubject> & { name: string; slug: string }): AdminSubject {
    const s: AdminSubject = {
      ...payload,
      id: String(Math.floor(Math.random() * 899_999_999_999 + 100_000_000_000)),
      termId: payload.termId ?? '',
      icon: payload.icon ?? 'BookOpen',
      color: payload.color ?? '#1E3A5F',
      order: payload.order ?? data.value.subjects.length + 1,
      lessons: [],
      visible: true,
    } as AdminSubject;
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

  // ---- Lessons ----
  function createLesson(payload: Omit<AdminLesson, 'id'>): AdminLesson {
    const l: AdminLesson = {
      ...payload,
      id: String(Math.floor(Math.random() * 899_999_999_999 + 100_000_000_000)),
      published: false
    };
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

  function lessonsBySubject(subjectId: string): AdminLesson[] {
    return data.value.lessons.filter(l => l.subjectId === subjectId);
  }

  return {
    subjects,
    lessons,
    courses,
    publishedCourses,
    loading,
    fetchContent,
    createSubject, updateSubject, deleteSubject, reorderSubjects,
    createLesson, updateLesson, deleteLesson, publishLesson,
    lessonsBySubject
  };
});
