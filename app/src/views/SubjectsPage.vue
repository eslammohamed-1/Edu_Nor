<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useCurriculumStore } from '@/stores/curriculum';
import { useAuth } from '@/composables/useAuth';
import SubjectCard from '@/components/courses/SubjectCard.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import type { Stage, SubjectInfo } from '@/types/course';
import { stageLabel } from '@/config/educationTracks';

const store = useCurriculumStore();
const { user } = useAuth();

const stages: Array<{ id: Stage | 'all'; label: string }> = [
  { id: 'all', label: 'جميع المراحل' },
  { id: 'primary', label: 'الابتدائي' },
  { id: 'prep', label: 'الإعدادي' },
  { id: 'secondary', label: 'الثانوي' }
];

// الصف المحدد (داخل المرحلة)
const selectedGradeId = ref<string | null>(null);
// الترم المحدد (1 أو 2)
const selectedTerm = ref<number>(1);

/** طالب اكتملت بياناته */
const lockStudentToMyOnly = computed(
  () => user.value?.role === 'student' && !!user.value?.stage && !!user.value?.grade
);

const pageSubtitle = computed(() => {
  if (lockStudentToMyOnly.value && user.value?.stage) {
    const g = user.value.grade ? ` — ${user.value.grade}` : '';
    return `مواد ${stageLabel(user.value.stage)}${g} فقط — حسب تسجيلك في المنصة.`;
  }
  return 'تصفح المواد: اختر المرحلة والصف لعرض المواد المتاحة.';
});

function onStageTab(id: Stage | 'all') {
  store.setStageFilter(id);
  selectedGradeId.value = null;
}

/** الصفوف المتاحة حسب المرحلة المختارة */
const availableGrades = computed(() => {
  if (store.stageFilter === 'all') {
    return store.stages.flatMap(s => s.grades);
  }
  const stage = store.findStageBySlug(store.stageFilter);
  return stage?.grades ?? [];
});

/** الترمات المتاحة حسب الصف المختار */
const availableTerms = computed(() => {
  if (!selectedGradeId.value) return [];
  const grade = store.findGradeById(selectedGradeId.value);
  return grade?.terms ?? [];
});

/** المواد المعروضة */
const displayedSubjects = computed<SubjectInfo[]>(() => {
  // طالب مقيّد
  if (lockStudentToMyOnly.value && user.value) {
    return store.subjectsForUser(user.value);
  }

  // لو مفيش صف محدد → عرض كل مواد الصفوف في المرحلة
  if (!selectedGradeId.value) {
    const subs: SubjectInfo[] = [];
    const seenSlugs = new Set<string>();
    for (const grade of availableGrades.value) {
      for (const term of grade.terms) {
        if (term.order !== selectedTerm.value) continue;
        for (const subj of term.subjects) {
          if (!seenSlugs.has(subj.slug)) {
            seenSlugs.add(subj.slug);
            subs.push(subj);
          }
        }
      }
    }
    return applySearch(subs);
  }

  // صف محدد + ترم
  const grade = store.findGradeById(selectedGradeId.value);
  if (!grade) return [];
  const term = grade.terms.find(t => t.order === selectedTerm.value);
  return applySearch(term?.subjects ?? []);
});

function applySearch(list: SubjectInfo[]): SubjectInfo[] {
  const q = store.searchQuery.trim().toLowerCase();
  if (!q) return list;
  return list.filter(s => s.name.toLowerCase().includes(q));
}

function syncFromUser() {
  const u = user.value;
  if (u?.role === 'student' && u.stage && u.grade) {
    store.setStageFilter(u.stage);
    // find grade by name
    const stage = store.findStageBySlug(u.stage);
    const grade = stage?.grades.find(g => g.name === u.grade);
    if (grade) selectedGradeId.value = grade.id;
  }
}

onMounted(syncFromUser);
watch(
  () => [user.value?.id, user.value?.grade, user.value?.stage] as const,
  () => syncFromUser()
);
</script>

<template>
  <div class="subjects-page">
    <section class="page-hero">
      <div class="container">
        <h1 class="page-title text-navy font-ar">
          المواد <span class="text-gold">الدراسية</span>
        </h1>
        <p class="page-subtitle text-secondary font-ar">
          {{ pageSubtitle }}
        </p>

        <div class="search-bar">
          <AppIcon name="Search" :size="20" color="var(--text-muted)" class="search-icon" />
          <input
            :value="store.searchQuery"
            @input="store.setSearch(($event.target as HTMLInputElement).value)"
            type="search"
            class="search-input font-ar"
            placeholder="ابحث عن مادة..."
          />
        </div>

        <!-- تبويبات المراحل -->
        <div v-if="!lockStudentToMyOnly" class="stage-tabs">
          <button
            v-for="stage in stages"
            :key="stage.id"
            type="button"
            class="stage-tab font-ar"
            :class="{ 'stage-tab--active': store.stageFilter === stage.id }"
            @click="onStageTab(stage.id)"
          >
            {{ stage.label }}
          </button>
        </div>

        <!-- اختيار الصف -->
        <div v-if="availableGrades.length > 0 && !lockStudentToMyOnly" class="grade-chips">
          <button
            v-for="grade in availableGrades"
            :key="grade.id"
            type="button"
            class="grade-chip font-ar"
            :class="{ 'grade-chip--active': selectedGradeId === grade.id }"
            @click="selectedGradeId = selectedGradeId === grade.id ? null : grade.id"
          >
            {{ grade.name }}
          </button>
        </div>

        <!-- اختيار الترم -->
        <div v-if="availableTerms.length > 1" class="term-toggle font-ar">
          <button
            v-for="term in availableTerms"
            :key="term.id"
            type="button"
            class="term-btn"
            :class="{ 'term-btn--active': selectedTerm === term.order }"
            @click="selectedTerm = term.order"
          >
            {{ term.name }}
          </button>
        </div>
      </div>
    </section>

    <section class="subjects-grid-section">
      <div class="container">
        <div v-if="displayedSubjects.length === 0" class="empty-state">
          <AppIcon name="SearchX" :size="64" color="var(--text-muted)" />
          <h3 class="text-navy font-ar">لا توجد مواد مطابقة</h3>
          <p class="text-secondary font-ar">جرّب تغيير الفلتر أو كلمة البحث.</p>
        </div>
        <div v-else class="subjects-grid">
          <SubjectCard v-for="s in displayedSubjects" :key="s.id" :subject="s" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.subjects-page {
  padding-bottom: var(--space-4xl);
}

.page-hero {
  padding: var(--space-3xl) 0 var(--space-2xl);
  background: linear-gradient(180deg, var(--bg-section) 0%, var(--bg-page) 100%);
}

.page-title {
  font-size: 2.75rem;
  line-height: 1.2;
  margin-bottom: var(--space-sm);
}

.page-subtitle {
  font-size: var(--text-body-lg);
  margin-bottom: var(--space-lg);
  max-width: 640px;
}

.search-bar {
  position: relative;
  max-width: 500px;
  margin-bottom: var(--space-lg);
}

.search-icon {
  position: absolute;
  inset-inline-start: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
}

.search-input {
  width: 100%;
  height: 48px;
  padding-inline-start: calc(var(--space-md) * 2 + 20px);
  padding-inline-end: var(--space-md);
  background-color: var(--bg-card);
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: var(--text-body);
  outline: none;
  color: var(--text-primary);
}

.search-input:focus {
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(244, 168, 37, 0.15);
}

.stage-tabs {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
  margin-bottom: var(--space-md);
}

.stage-tab {
  padding: var(--space-xs) var(--space-lg);
  background-color: transparent;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: var(--text-body-sm);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.stage-tab:hover {
  border-color: var(--color-navy);
  color: var(--color-navy);
}

.stage-tab--active {
  background-color: var(--color-navy);
  border-color: var(--color-navy);
  color: var(--color-white);
}

.grade-chips {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
  margin-bottom: var(--space-md);
}

.grade-chip {
  padding: var(--space-xxs) var(--space-md);
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: var(--text-caption);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.grade-chip:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.grade-chip--active {
  background-color: var(--color-gold);
  border-color: var(--color-gold);
  color: var(--color-navy);
  font-weight: var(--weight-semibold);
}

.term-toggle {
  display: flex;
  gap: var(--space-xs);
}

.term-btn {
  padding: var(--space-xxs) var(--space-md);
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: var(--text-caption);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.term-btn--active {
  background-color: var(--color-teal);
  border-color: var(--color-teal);
  color: var(--color-white);
}

.subjects-grid-section {
  padding-top: var(--space-xl);
}

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.empty-state {
  text-align: center;
  padding: var(--space-4xl) var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.empty-state h3 {
  font-size: var(--text-h3);
  margin-top: var(--space-md);
}

@media (max-width: 768px) {
  .page-title { font-size: 2rem; }
}
</style>
