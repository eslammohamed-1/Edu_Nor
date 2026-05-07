import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { User } from '@/types/auth';
import { useCurriculumStore } from '@/stores/curriculum';

const COMPLETED_KEY = 'edunor_completed_lessons';

/** معرفات من `fixtures/demo-catalog/generated/curriculum.json` (ابتدائي — الصف الأول — ترم 1 — عربي) */
const PRIMARY_GRADE_1_ID = '666787907527';
const ARABIC_SUBJECT_ID = '759763533625';
const LESSON_1_ID = '638013161698';
const LESSON_2_ID = '997595989429';
const LESSON_3_ID = '772555758918';
const SECTION_1_ID = '187455309796';

function resetStore() {
  setActivePinia(createPinia());
  return useCurriculumStore();
}

function studentUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    name: 'Student',
    email: 's@example.com',
    role: 'student',
    stage: 'primary',
    grade: 'الصف الأول الابتدائي',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  };
}

describe('curriculum store', () => {
  beforeEach(() => {
    resetStore();
  });

  it('exposes stages from the bundled catalog', () => {
    const c = useCurriculumStore();
    expect(c.stages.length).toBeGreaterThan(0);
    expect(c.stages.some((s) => s.slug === 'primary')).toBe(true);
  });

  it('filters grades by stage via setStageFilter', () => {
    const c = useCurriculumStore();
    const allCount = c.grades.length;
    const primaryStage = c.findStageBySlug('primary');
    expect(primaryStage).toBeTruthy();
    const primaryGradeIds = new Set(primaryStage!.grades.map((g) => g.id));

    c.setStageFilter('primary');
    const primaryOnly = c.grades;
    expect(primaryOnly.length).toBeGreaterThan(0);
    expect(primaryOnly.length).toBeLessThanOrEqual(allCount);
    expect(primaryOnly.every((g) => primaryGradeIds.has(g.id))).toBe(true);

    c.setStageFilter('all');
    expect(c.grades.length).toBe(allCount);
  });

  it('finds nested entities by id', () => {
    const c = useCurriculumStore();

    const grade = c.findGradeById(PRIMARY_GRADE_1_ID);
    expect(grade?.name).toContain('الأول');

    const lessonWrap = c.findLessonById(LESSON_2_ID);
    expect(lessonWrap?.lesson.title).toContain('الاستماع');

    const sectionWrap = c.findSectionById(SECTION_1_ID);
    expect(sectionWrap?.section.lessonId).toBe(LESSON_1_ID);
    expect(sectionWrap?.lesson.id).toBe(LESSON_1_ID);
  });

  it('returns null for empty ids and missing entities', () => {
    const c = useCurriculumStore();
    expect(c.findLessonById('')).toBeNull();
    expect(c.findLessonById('000000000000')).toBeNull();
    expect(c.findSectionById('')).toBeNull();
  });

  it('computes adjacent lessons within the subject', () => {
    const c = useCurriculumStore();

    expect(c.getAdjacentLessons(LESSON_1_ID)).toEqual({
      prev: null,
      next: c.findLessonById(LESSON_2_ID)?.lesson ?? null
    });

    expect(c.getAdjacentLessons(LESSON_2_ID).prev?.id).toBe(LESSON_1_ID);
    expect(c.getAdjacentLessons(LESSON_2_ID).next?.id).toBe(LESSON_3_ID);
  });

  it('subjectsByGradeAndTerm returns term subjects', () => {
    const c = useCurriculumStore();
    const list = c.subjectsByGradeAndTerm(PRIMARY_GRADE_1_ID, 1);
    expect(list.some((s) => s.id === ARABIC_SUBJECT_ID)).toBe(true);
  });

  it('subjectsForUser maps student stage + grade to term 1 subjects', () => {
    const c = useCurriculumStore();
    const subs = c.subjectsForUser(studentUser());
    expect(subs.some((s) => s.id === ARABIC_SUBJECT_ID)).toBe(true);

    expect(c.subjectsForUser(null)).toEqual([]);
    expect(c.subjectsForUser(studentUser({ grade: undefined }))).toEqual([]);
  });

  it('hydrates completed lessons from localStorage when the store is created', () => {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify([LESSON_1_ID]));
    setActivePinia(createPinia());
    const c = useCurriculumStore();
    expect(c.isLessonComplete(LESSON_1_ID)).toBe(true);
  });

  it('persists lesson completion to localStorage', () => {
    const c = useCurriculumStore();
    expect(c.isLessonComplete(LESSON_1_ID)).toBe(false);

    c.markLessonComplete(LESSON_1_ID);
    expect(c.isLessonComplete(LESSON_1_ID)).toBe(true);

    const raw = localStorage.getItem(COMPLETED_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toContain(LESSON_1_ID);

    c.unmarkLessonComplete(LESSON_1_ID);
    expect(c.isLessonComplete(LESSON_1_ID)).toBe(false);
  });

  it('subjectProgress reflects completed fraction', () => {
    const c = useCurriculumStore();
    const subj = c.findSubjectById(ARABIC_SUBJECT_ID);
    expect(subj).toBeTruthy();
    const total = subj!.lessons.length;
    expect(total).toBeGreaterThan(0);

    c.markLessonComplete(LESSON_1_ID);
    const expected = Math.round((1 / total) * 100);
    expect(c.subjectProgress(ARABIC_SUBJECT_ID)).toBe(expected);
  });

  it('mergeCompletedFromServer union with local set', () => {
    const c = useCurriculumStore();
    c.mergeCompletedFromServer([LESSON_2_ID, LESSON_3_ID]);
    expect(c.isLessonComplete(LESSON_2_ID)).toBe(true);
    expect(c.isLessonComplete(LESSON_3_ID)).toBe(true);
  });

  it('applyUserCurriculumContext sets filter for students only', () => {
    const c = useCurriculumStore();
    c.setStageFilter('all');
    c.applyUserCurriculumContext(studentUser());
    expect(c.stageFilter).toBe('primary');
    expect(c.currentUser?.id).toBe('u1');

    c.applyUserCurriculumContext(
      studentUser({ role: 'admin', stage: 'primary' })
    );
    expect(c.stageFilter).toBe('primary');

    c.setStageFilter('all');
    c.applyUserCurriculumContext(
      studentUser({ role: 'admin', stage: 'primary' })
    );
    expect(c.stageFilter).toBe('all');

    c.applyUserCurriculumContext(null);
    expect(c.stageFilter).toBe('all');
    expect(c.currentUser).toBeNull();
  });

  it('setSearch updates search query ref', () => {
    const c = useCurriculumStore();
    c.setSearch('  عربي  ');
    expect(c.searchQuery).toBe('  عربي  ');
  });

  it('total counts aggregate lessons and subjects', () => {
    const c = useCurriculumStore();
    expect(c.totalSubjects).toBeGreaterThan(0);
    expect(c.totalLessons).toBeGreaterThan(c.totalSubjects);
  });
});
