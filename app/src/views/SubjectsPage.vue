<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useCoursesStore } from '@/stores/courses';
import { useAuth } from '@/composables/useAuth';
import SubjectCard from '@/components/courses/SubjectCard.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import type { Stage } from '@/types/course';
import { stageLabel } from '@/config/educationTracks';

const store = useCoursesStore();
const { subjects, stageFilter, searchQuery, subjectsScope } = storeToRefs(store);
const route = useRoute();
const router = useRouter();
const { user } = useAuth();

const stages: Array<{ id: Stage | 'all'; label: string }> = [
  { id: 'all', label: 'جميع المراحل' },
  { id: 'primary', label: 'الابتدائي' },
  { id: 'prep', label: 'الإعدادي' },
  { id: 'secondary', label: 'الثانوي' }
];

/** طالب اكتملت بياناته: يظهر فقط منهج صفه — بدون تبويبات مراحل ولا «كل المراحل» */
const lockStudentToMyOnly = computed(
  () => user.value?.role === 'student' && !!user.value?.stage && !!user.value?.grade
);

/** زوار أو طالب بلا صف/مرحلة: اختيار «مواد صفي» / «كل المراحل» */
const showMyToggle = computed(
  () => !lockStudentToMyOnly.value && user.value?.role === 'student' && !!user.value?.stage
);

const pageSubtitle = computed(() => {
  if (lockStudentToMyOnly.value && user.value?.stage) {
    const g = user.value.grade ? ` — ${user.value.grade}` : '';
    return `مواد ${stageLabel(user.value.stage)}${g} فقط — حسب تسجيلك في المنصة.`;
  }
  if (subjectsScope.value === 'my' && user.value?.stage) {
    const g = user.value.grade ? ` — ${user.value.grade}` : '';
    return `عرض مواد ${stageLabel(user.value.stage)}${g} حسب سجل المنهج. يمكنك التبديل لعرض كل المراحل.`;
  }
  return 'تصفح المواد: استخدم التبويبات، أو سجّل دخولك كطالب لعرض مواد صفك.';
});

function goMyMaterials() {
  const u = user.value;
  if (u?.stage) {
    store.setSubjectsScope('my');
    store.setStageFilter(u.stage);
    router.replace({ path: '/subjects', query: { ...route.query, scope: 'my' } });
  }
}

function goAllMaterials() {
  store.setSubjectsScope('all');
  store.setStageFilter('all');
  const q = { ...route.query };
  delete (q as Record<string, string>).scope;
  router.replace({ path: '/subjects', query: q });
}

function onStageTab(id: Stage | 'all') {
  if (id === 'all') {
    store.setStageFilter('all');
    if (subjectsScope.value === 'my') {
      goAllMaterials();
    } else {
      store.setSubjectsScope('all');
    }
    return;
  }
  if (
    subjectsScope.value === 'my' &&
    user.value?.role === 'student' &&
    user.value.stage &&
    id !== user.value.stage
  ) {
    store.setSubjectsScope('all');
  }
  store.setStageFilter(id);
}

function syncQueryToStore() {
  const u = user.value;
  if (u?.role === 'student' && u.stage && u.grade) {
    store.setSubjectsScope('my');
    store.setStageFilter(u.stage);
    if (route.query.scope === 'all') {
      const q = { ...route.query } as Record<string, string | string[]>;
      delete q.scope;
      router.replace({ path: '/subjects', query: q });
    }
    return;
  }
  if (route.query.scope === 'my' || route.query.scope === 'mine') {
    if (u?.stage) {
      store.setSubjectsScope('my');
      store.setStageFilter(u.stage);
    }
  } else if (route.query.scope === 'all') {
    store.setSubjectsScope('all');
  }
}

onMounted(syncQueryToStore);
watch(
  () => route.query.scope,
  () => syncQueryToStore()
);
watch(
  () => [user.value?.id, user.value?.grade, user.value?.stage] as const,
  () => syncQueryToStore()
);

const isEmptyMy = computed(
  () =>
    subjectsScope.value === 'my' &&
    (lockStudentToMyOnly.value || showMyToggle.value) &&
    subjects.value.length === 0 &&
    stageFilter.value === user.value?.stage
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

        <div v-if="showMyToggle" class="scope-toggles font-ar" role="tablist">
          <button
            type="button"
            class="scope-btn"
            :class="{ 'scope-btn--on': subjectsScope === 'my' }"
            @click="goMyMaterials"
          >
            مواد صفي
          </button>
          <button
            type="button"
            class="scope-btn"
            :class="{ 'scope-btn--on': subjectsScope === 'all' }"
            @click="goAllMaterials"
          >
            كل المراحل
          </button>
        </div>

        <div class="search-bar">
          <AppIcon name="Search" :size="20" color="var(--text-muted)" class="search-icon" />
          <input
            :value="searchQuery"
            @input="store.setSearch(($event.target as HTMLInputElement).value)"
            type="search"
            class="search-input font-ar"
            placeholder="ابحث عن مادة..."
          />
        </div>

        <div v-if="!lockStudentToMyOnly" class="stage-tabs">
          <button
            v-for="stage in stages"
            :key="stage.id"
            type="button"
            class="stage-tab font-ar"
            :class="{ 'stage-tab--active': stageFilter === stage.id }"
            @click="onStageTab(stage.id)"
          >
            {{ stage.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="subjects-grid-section">
      <div class="container">
        <div v-if="isEmptyMy" class="empty-state">
          <AppIcon name="SearchX" :size="64" color="var(--text-muted)" />
          <h3 class="text-navy font-ar">لا توجد مواد مطابقة لصفك في العرض</h3>
          <p class="text-secondary font-ar">
            <template v-if="lockStudentToMyOnly">
              لا توجد مواد مطابقة لصفك في الكتالوج حالياً. جرّب تعديل البحث.
            </template>
            <template v-else>
              لا توجد مواد في الكتالوج تطابق صفك ضمن الفلاتر الحالية (المرحلة والبحث). جرّب «كل المراحل» أو عدّل البحث.
            </template>
          </p>
          <button
            v-if="!lockStudentToMyOnly"
            type="button"
            class="link-all font-ar"
            @click="goAllMaterials"
          >
            تصفح جميع مراحل الكتالوج
          </button>
        </div>
        <div v-else-if="subjects.length === 0" class="empty-state">
          <AppIcon name="SearchX" :size="64" color="var(--text-muted)" />
          <h3 class="text-navy font-ar">لا توجد مواد مطابقة</h3>
          <p class="text-secondary font-ar">جرّب تغيير الفلتر أو كلمة البحث.</p>
        </div>
        <div v-else class="subjects-grid">
          <SubjectCard v-for="s in subjects" :key="s.id" :subject="s" />
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

.scope-toggles {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.scope-btn {
  padding: var(--space-xs) var(--space-lg);
  background: transparent;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: var(--text-body-sm);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
  cursor: pointer;
}

.scope-btn--on {
  background: var(--color-navy);
  border-color: var(--color-navy);
  color: var(--color-white);
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

.link-all {
  margin-top: var(--space-md);
  background: none;
  border: none;
  color: var(--color-gold);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .page-title { font-size: 2rem; }
}
</style>
