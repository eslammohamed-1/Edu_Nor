<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminContentStore } from '@/stores/admin/adminContent';
import DataTable from '@/components/admin/shared/DataTable.vue';
import FilterBar from '@/components/admin/shared/FilterBar.vue';
import ConfirmDialog from '@/components/admin/shared/ConfirmDialog.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import type { Course } from '@/types/course';
import type { Column } from '@/components/admin/shared/DataTable.vue';

const store = useAdminContentStore();

const searchQ = ref('');
const filters = ref<Record<string, string>>({});
const showForm = ref(false);
const editCourse = ref<(Course & { published?: boolean; tags?: string[] }) | null>(null);
const confirmDelete = ref({ open: false, id: '', name: '' });

const form = ref({
  title: '', description: '', subjectId: '', grade: '',
  instructor: '', thumbnail: '', duration: 0,
  tags: ''
});

const filteredCourses = computed(() => {
  let list = store.courses as (Course & { published?: boolean })[];
  if (searchQ.value) {
    const q = searchQ.value.toLowerCase();
    list = list.filter(c => c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q));
  }
  if (filters.value.subject) list = list.filter(c => c.subjectId === filters.value.subject);
  if (filters.value.status === 'published') list = list.filter(c => c.published);
  if (filters.value.status === 'draft') list = list.filter(c => !c.published);
  return list;
});

const columns: Column<Course>[] = [
  { key: 'title', label: 'العنوان', sortable: true },
  { key: 'subjectId', label: 'المادة' },
  { key: 'instructor', label: 'المدرّس', sortable: true },
  { key: 'grade', label: 'الصف' },
  { key: 'lessonsCount', label: 'الدروس', align: 'center' },
  { key: 'published', label: 'الحالة', align: 'center' }
];

const filterChips = computed(() => [
  { key: 'subject', label: 'المادة', options: store.subjects.map(s => ({ value: s.id, label: s.name })) },
  { key: 'status', label: 'الحالة', options: [{ value: 'published', label: 'منشور' }, { value: 'draft', label: 'مسودة' }] }
]);

function openCreate() {
  editCourse.value = null;
  form.value = { title: '', description: '', subjectId: '', grade: '', instructor: '', thumbnail: '', duration: 0, tags: '' };
  showForm.value = true;
}

function openEdit(c: Course & { published?: boolean }) {
  editCourse.value = c;
  form.value = { title: c.title, description: c.description, subjectId: c.subjectId, grade: c.grade, instructor: c.instructor, thumbnail: c.thumbnail || '', duration: c.duration, tags: '' };
  showForm.value = true;
}

function handleSave() {
  if (editCourse.value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.updateCourse(editCourse.value.id, form.value as any);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.createCourse({
      title: form.value.title, description: form.value.description,
      subjectId: form.value.subjectId, grade: form.value.grade,
      instructor: form.value.instructor, thumbnail: form.value.thumbnail,
      duration: form.value.duration, stage: 'secondary',
      lessonsCount: 0, published: false
    } as any);
  }
  showForm.value = false;
}

function doDelete() {
  store.deleteCourse(confirmDelete.value.id);
  confirmDelete.value.open = false;
}

function togglePublish(c: Course & { published?: boolean }) {
  store.publishCourse(c.id, !c.published);
}
</script>

<template>
  <div class="admin-courses">
    <div class="page-header">
      <div>
        <h2 class="font-ar">الكورسات</h2>
        <p class="page-sub font-ar">{{ store.courses.length }} كورس — {{ store.publishedCourses.length }} منشور</p>
      </div>
      <button class="btn btn-primary font-ar" @click="openCreate">
        <AppIcon name="Plus" :size="15" /> كورس جديد
      </button>
    </div>

    <div class="table-card">
      <FilterBar v-model="searchQ" v-model:filters="filters" placeholder="بحث بالعنوان أو المدرّس..." :chips="filterChips" />
      <DataTable :columns="(columns as unknown as Column<Record<string, unknown>>[])" :rows="(filteredCourses as unknown as Record<string, unknown>[])" :page-size="10" empty-text="لا توجد كورسات">
        <template #cell-subjectId="{ row }">
          <span class="font-ar">{{ store.subjects.find(s => s.id === (row as unknown as Course).subjectId)?.name || (row as unknown as Course).subjectId }}</span>
        </template>
        <template #cell-published="{ row }">
          <span class="status-pill font-ar" :class="(row as unknown as {published?:boolean}).published ? 'published' : 'draft'">
            {{ (row as unknown as {published?:boolean}).published ? 'منشور' : 'مسودة' }}
          </span>
        </template>
        <template #actions="{ row }">
          <div class="action-btns">
            <button class="action-btn" @click="openEdit(row as unknown as Course & {published?:boolean})" title="تعديل">
              <AppIcon name="Pencil" :size="14" />
            </button>
            <button class="action-btn" @click="togglePublish(row as unknown as Course & {published?:boolean})" :title="(row as unknown as {published?:boolean}).published ? 'إلغاء النشر' : 'نشر'">
              <AppIcon :name="(row as unknown as {published?:boolean}).published ? 'EyeOff' : 'Eye'" :size="14" />
            </button>
            <button class="action-btn action-btn--danger" @click="confirmDelete = { open: true, id: (row as unknown as Course).id, name: (row as unknown as Course).title }" title="حذف">
              <AppIcon name="Trash2" :size="14" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Form Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="font-ar">{{ editCourse ? 'تعديل الكورس' : 'كورس جديد' }}</h3>
            <button class="close-btn" @click="showForm = false"><AppIcon name="X" :size="18" /></button>
          </div>
          <div class="modal-body">
            <div class="field-row">
              <label class="field-label font-ar">العنوان</label>
              <input v-model="form.title" class="field-input font-ar" placeholder="عنوان الكورس" />
            </div>
            <div class="field-row">
              <label class="field-label font-ar">الوصف</label>
              <textarea v-model="form.description" class="field-input font-ar" rows="2"></textarea>
            </div>
            <div class="two-col">
              <div class="field-row">
                <label class="field-label font-ar">المادة</label>
                <select v-model="form.subjectId" class="field-input font-ar">
                  <option value="">— اختر —</option>
                  <option v-for="s in store.subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>
              <div class="field-row">
                <label class="field-label font-ar">المرحلة</label>
                <select class="field-input font-ar">
                  <option value="primary">ابتدائي</option>
                  <option value="prep">إعدادي</option>
                  <option value="secondary">ثانوي</option>
                </select>
              </div>
            </div>
            <div class="field-row">
              <label class="field-label font-ar">المدرّس</label>
              <input v-model="form.instructor" class="field-input font-ar" placeholder="اسم المدرّس" />
            </div>
            <div class="field-row">
              <label class="field-label font-ar">رابط الصورة المصغّرة</label>
              <input v-model="form.thumbnail" class="field-input font-en" placeholder="https://..." />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost font-ar" @click="showForm = false">إلغاء</button>
            <button class="btn btn-primary font-ar" @click="handleSave">حفظ</button>
          </div>
        </div>
      </div>
    </Teleport>

    <ConfirmDialog :open="confirmDelete.open" title="حذف الكورس" :message="`حذف '${confirmDelete.name}'؟`" confirm-label="حذف" :danger="true" @confirm="doDelete" @cancel="confirmDelete.open = false" />
  </div>
</template>

<style scoped>
.admin-courses { display: flex; flex-direction: column; gap: var(--space-lg); }
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md); }
.page-header h2 { font-size: var(--text-h2); color: var(--text-primary); }
.page-sub { color: var(--text-muted); font-size: 0.875rem; }
.table-card { background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); overflow: hidden; }
.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem; border-radius: var(--radius-md); border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all var(--duration-fast); }
.btn-primary { background: var(--color-navy); color: #fff; }
.btn-primary:hover { background: var(--color-navy-light); }
.btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); }
.status-pill { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-weight: 600; }
.status-pill.published { background: #e8f5e9; color: #2e7d32; }
.status-pill.draft { background: var(--bg-section); color: var(--text-muted); }
.action-btns { display: flex; gap: 0.25rem; justify-content: center; }
.action-btn { width: 28px; height: 28px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: none; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; transition: all var(--duration-fast); }
.action-btn:hover { background: var(--bg-section); color: var(--text-primary); }
.action-btn--danger:hover { border-color: var(--color-error); color: var(--color-error); }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: var(--z-modal-backdrop); padding: 1rem; }
.modal-dialog { background: var(--bg-card); border-radius: var(--radius-xl); width: 100%; max-width: 520px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: var(--shadow-xl); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-lg); border-bottom: 1px solid var(--border-color); }
.modal-header h3 { font-size: var(--text-h4); color: var(--text-primary); }
.close-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); }
.modal-body { flex: 1; overflow-y: auto; padding: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-md); }
.modal-footer { padding: var(--space-md) var(--space-lg); border-top: 1px solid var(--border-color); display: flex; gap: var(--space-sm); justify-content: flex-end; }
.field-row { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); }
.field-input { padding: 0.625rem 0.875rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-input); color: var(--text-primary); font-size: 0.875rem; outline: none; resize: vertical; }
.field-input:focus { border-color: var(--color-gold); }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
</style>
