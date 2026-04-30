import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Quiz } from '@/types/quiz';
import { quizzes as seedQuizzes } from '@/fixtures/demo-catalog/quizzes';
import { audit } from '@/lib/audit';

const STORAGE_KEY = 'edunor.admin.quizzes';

type QuizStatus = 'draft' | 'published' | 'archived';

interface AdminQuiz extends Quiz {
  status: QuizStatus;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

function readStorage(): AdminQuiz[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AdminQuiz[];
  } catch {}
  return seedQuizzes.map(q => ({
    ...q,
    status: 'published' as QuizStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
}

function writeStorage(quizzes: AdminQuiz[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
}

export const useAdminQuizzesStore = defineStore('adminQuizzes', () => {
  const quizzes = ref<AdminQuiz[]>(readStorage());
  const loading = ref(false);

  const publishedQuizzes = computed(() => quizzes.value.filter(q => q.status === 'published'));
  const totalQuizzes = computed(() => quizzes.value.length);

  function save() { writeStorage(quizzes.value); }

  function createQuiz(payload: Partial<AdminQuiz>): AdminQuiz {
    const q: AdminQuiz = {
      id: 'quiz_' + Date.now(),
      title: payload.title || 'اختبار جديد',
      description: payload.description || '',
      subjectId: payload.subjectId || '',
      grade: payload.grade || '',
      duration: payload.duration ?? 15,
      passingScore: payload.passingScore ?? 60,
      questions: payload.questions || [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    quizzes.value.unshift(q);
    save();
    audit('quiz.create', { type: 'quiz', id: q.id, label: q.title });
    return q;
  }

  function updateQuiz(id: string, updates: Partial<AdminQuiz>) {
    const idx = quizzes.value.findIndex(q => q.id === id);
    if (idx === -1) return;
    quizzes.value[idx] = { ...quizzes.value[idx], ...updates, updatedAt: new Date().toISOString() };
    save();
    audit('quiz.update', { type: 'quiz', id, label: quizzes.value[idx].title });
  }

  function deleteQuiz(id: string) {
    const q = quizzes.value.find(q => q.id === id);
    quizzes.value = quizzes.value.filter(q => q.id !== id);
    save();
    audit('quiz.delete', { type: 'quiz', id, label: q?.title });
  }

  function duplicateQuiz(id: string): AdminQuiz | undefined {
    const original = quizzes.value.find(q => q.id === id);
    if (!original) return;
    const copy: AdminQuiz = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'quiz_' + Date.now(),
      title: original.title + ' (نسخة)',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    quizzes.value.unshift(copy);
    save();
    audit('quiz.duplicate', { type: 'quiz', id: copy.id, label: copy.title });
    return copy;
  }

  function archiveQuiz(id: string) {
    updateQuiz(id, { status: 'archived' });
    audit('quiz.archive', { type: 'quiz', id });
  }

  function publishQuiz(id: string) {
    updateQuiz(id, { status: 'published' });
    audit('quiz.publish', { type: 'quiz', id });
  }

  function getById(id: string): AdminQuiz | undefined {
    return quizzes.value.find(q => q.id === id);
  }

  return {
    quizzes, loading, publishedQuizzes, totalQuizzes,
    createQuiz, updateQuiz, deleteQuiz, duplicateQuiz, archiveQuiz, publishQuiz, getById
  };
});
