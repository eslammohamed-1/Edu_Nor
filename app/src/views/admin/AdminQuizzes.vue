<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminQuizzesStore } from '@/stores/admin/adminQuizzes';
import { useAdminContentStore } from '@/stores/admin/adminContent';
import DataTable from '@/components/admin/shared/DataTable.vue';
import FilterBar from '@/components/admin/shared/FilterBar.vue';
import ConfirmDialog from '@/components/admin/shared/ConfirmDialog.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import type { Column } from '@/components/admin/shared/DataTable.vue';

const router = useRouter();
const store = useAdminQuizzesStore();
const contentStore = useAdminContentStore();

const searchQ = ref('');
const filters = ref<Record<string, string>>({});
const confirmDelete = ref({ open: false, id: '', name: '' });

const filteredQuizzes = computed(() => {
  let list = store.quizzes as Record<string, unknown>[];
  if (searchQ.value) {
    const q = searchQ.value.toLowerCase();
    list = list.filter(q2 => String(q2.title).toLowerCase().includes(q));
  }
  if (filters.value.subject) list = list.filter(q2 => q2.subjectId === filters.value.subject);
  if (filters.value.status) list = list.filter(q2 => q2.status === filters.value.status);
  return list;
});

const columns: Column<Record<string, unknown>>[] = [
  { key: 'title', label: 'العنوان', sortable: true },
  { key: 'subjectId', label: 'المادة' },
  { key: 'grade', label: 'الصف' },
  { key: 'duration', label: 'المدة (د)', align: 'center' },
  { key: 'questions', label: 'الأسئلة', align: 'center' },
  { key: 'status', label: 'الحالة', align: 'center' }
];

const filterChips = computed(() => [
  { key: 'subject', label: 'المادة', options: contentStore.subjects.map(s => ({ value: s.id, label: s.name })) },
  { key: 'status', label: 'الحالة', options: [
    { value: 'published', label: 'منشور' },
    { value: 'draft', label: 'مسودة' },
    { value: 'archived', label: 'مؤرشف' }
  ]}
]);

function createNew() {
  const q = store.createQuiz({ title: 'اختبار جديد' });
  router.push(`/admin/quizzes/${q.id}/edit`);
}

function editQuiz(id: string) {
  router.push(`/admin/quizzes/${id}/edit`);
}

function doDelete() {
  store.deleteQuiz(confirmDelete.value.id);
  confirmDelete.value.open = false;
}

const statusLabel: Record<string, string> = {
  published: 'منشور', draft: 'مسودة', archived: 'مؤرشف'
};
const statusClass: Record<string, string> = {
  published: 'pill-green', draft: 'pill-gray', archived: 'pill-yellow'
};
</script>

<template>
  <div class="admin-quizzes">
    <div class="page-header">
      <div>
        <h2 class="font-ar">الاختبارات</h2>
        <p class="page-sub font-ar">{{ store.totalQuizzes }} اختبار — {{ store.publishedQuizzes.length }} منشور</p>
      </div>
      <button class="btn btn-primary font-ar" @click="createNew">
        <AppIcon name="Plus" :size="15" /> اختبار جديد
      </button>
    </div>

    <div class="table-card">
      <FilterBar v-model="searchQ" v-model:filters="filters" placeholder="بحث بعنوان الاختبار..." :chips="filterChips" />
      <DataTable :columns="columns" :rows="filteredQuizzes" :page-size="10" empty-text="لا توجد اختبارات">
        <template #cell-subjectId="{ row }">
          <span class="font-ar">{{ contentStore.subjects.find(s => s.id === row.subjectId)?.name || '—' }}</span>
        </template>
        <template #cell-questions="{ row }">
          <span class="font-ar">{{ Array.isArray(row.questions) ? row.questions.length : 0 }}</span>
        </template>
        <template #cell-status="{ row }">
          <span class="status-pill font-ar" :class="statusClass[String(row.status)]">
            {{ statusLabel[String(row.status)] || row.status }}
          </span>
        </template>
        <template #actions="{ row }">
          <div class="action-btns">
            <button class="action-btn" title="تعديل" @click="editQuiz(String(row.id))">
              <AppIcon name="Pencil" :size="14" />
            </button>
            <button class="action-btn" title="تكرار" @click="store.duplicateQuiz(String(row.id))">
              <AppIcon name="Copy" :size="14" />
            </button>
            <button v-if="row.status === 'published'" class="action-btn" title="أرشفة" @click="store.archiveQuiz(String(row.id))">
              <AppIcon name="Archive" :size="14" />
            </button>
            <button v-else class="action-btn" title="نشر" @click="store.publishQuiz(String(row.id))">
              <AppIcon name="Eye" :size="14" />
            </button>
            <button class="action-btn action-btn--danger" title="حذف" @click="confirmDelete = { open: true, id: String(row.id), name: String(row.title) }">
              <AppIcon name="Trash2" :size="14" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <ConfirmDialog :open="confirmDelete.open" title="حذف الاختبار" :message="`حذف '${confirmDelete.name}'؟`" confirm-label="حذف" :danger="true" @confirm="doDelete" @cancel="confirmDelete.open = false" />
  </div>
</template>

<style scoped>
.admin-quizzes { display: flex; flex-direction: column; gap: var(--space-lg); }
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md); }
.page-header h2 { font-size: var(--text-h2); color: var(--text-primary); }
.page-sub { color: var(--text-muted); font-size: 0.875rem; }
.table-card { background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); overflow: hidden; }
.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem; border-radius: var(--radius-md); border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all var(--duration-fast); }
.btn-primary { background: var(--color-navy); color: #fff; }
.btn-primary:hover { background: var(--color-navy-light); }
.status-pill { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-weight: 600; }
.pill-green { background: #e8f5e9; color: #2e7d32; }
.pill-gray { background: var(--bg-section); color: var(--text-muted); }
.pill-yellow { background: #fff8e1; color: #f57f17; }
.action-btns { display: flex; gap: 0.25rem; justify-content: center; }
.action-btn { width: 28px; height: 28px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: none; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; transition: all var(--duration-fast); }
.action-btn:hover { background: var(--bg-section); color: var(--text-primary); }
.action-btn--danger:hover { border-color: var(--color-error); color: var(--color-error); }
</style>
