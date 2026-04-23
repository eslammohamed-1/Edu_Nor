<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCoursesStore } from '@/stores/courses';
import SubjectCard from '@/components/courses/SubjectCard.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import type { Stage } from '@/types/course';

const store = useCoursesStore();
const { subjects, stageFilter, searchQuery } = storeToRefs(store);

const stages: Array<{ id: Stage | 'all'; label: string }> = [
  { id: 'all', label: 'جميع المراحل' },
  { id: 'primary', label: 'الابتدائي' },
  { id: 'prep', label: 'الإعدادي' },
  { id: 'secondary', label: 'الثانوي' }
];
</script>

<template>
  <div class="subjects-page">
    <section class="page-hero">
      <div class="container">
        <h1 class="page-title text-navy font-ar">
          المواد <span class="text-gold">الدراسية</span>
        </h1>
        <p class="page-subtitle text-secondary font-ar">
          اكتشف جميع المواد المتاحة من جميع المراحل الدراسية.
        </p>

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

        <div class="stage-tabs">
          <button
            v-for="stage in stages"
            :key="stage.id"
            class="stage-tab font-ar"
            :class="{ 'stage-tab--active': stageFilter === stage.id }"
            @click="store.setStageFilter(stage.id)"
          >
            {{ stage.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="subjects-grid-section">
      <div class="container">
        <div v-if="subjects.length === 0" class="empty-state">
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
  margin-bottom: var(--space-xl);
  max-width: 600px;
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

@media (max-width: 768px) {
  .page-title { font-size: 2rem; }
}
</style>
