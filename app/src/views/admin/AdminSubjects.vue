<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminContentStore } from '@/stores/admin/adminContent';
import ConfirmDialog from '@/components/admin/shared/ConfirmDialog.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import type { SubjectInfo, Stage } from '@/types/course';
import curriculumData from '@/fixtures/demo-catalog/generated/curriculum.json';

const store = useAdminContentStore();

const showForm = ref(false);
const editSubject = ref<SubjectInfo | null>(null);
const confirmDelete = ref({ open: false, id: '', name: '' });

// الحصول على كل التيرمات المتاحة للاختيار منها عند إنشاء مادة
const allTerms = computed(() => {
  const terms: { id: string; name: string; gradeName: string; stageLabel: string }[] = [];
  for (const stage of curriculumData.stages) {
    for (const grade of stage.grades) {
      for (const term of grade.terms) {
        terms.push({
          id: term.id,
          name: term.name,
          gradeName: grade.name,
          stageLabel: stages.find(s => s.value === stage.slug)?.label || stage.name
        });
      }
    }
  }
  return terms;
});

const form = ref({
  name: '',
  slug: '',
  termId: '',
  icon: 'BookOpen',
  color: '#1E3A5F',
  order: 1
});

function openCreate() {
  editSubject.value = null;
  form.value = { name: '', slug: '', termId: '', icon: 'BookOpen', color: '#1E3A5F', order: store.subjects.length + 1 };
  showForm.value = true;
}

function openEdit(s: SubjectInfo) {
  editSubject.value = s;
  form.value = {
    name: s.name,
    slug: s.slug,
    termId: s.termId,
    icon: s.icon,
    color: s.color,
    order: s.order
  };
  showForm.value = true;
}

function handleSave() {
  if (editSubject.value) {
    store.updateSubject(editSubject.value.id, { ...form.value });
  } else {
    store.createSubject(form.value);
  }
  showForm.value = false;
}

function doDelete() {
  store.deleteSubject(confirmDelete.value.id);
  confirmDelete.value.open = false;
}

const stages: { value: Stage; label: string }[] = [
  { value: 'primary', label: 'ابتدائي' },
  { value: 'prep', label: 'إعدادي' },
  { value: 'secondary', label: 'ثانوي' }
];

function getTermContext(termId: string) {
  const term = allTerms.value.find(t => t.id === termId);
  if (!term) return 'غير محدد';
  return `${term.stageLabel} — ${term.gradeName} — ${term.name}`;
}
</script>

<template>
  <div class="admin-subjects">
    <div class="page-header">
      <div>
        <h2 class="font-ar">المواد الدراسية</h2>
        <p class="page-sub font-ar">{{ store.subjects.length }} مادة دراسية مسجلة</p>
      </div>
      <button class="btn btn-primary font-ar" @click="openCreate">
        <AppIcon name="Plus" :size="15" /> مادة جديدة
      </button>
    </div>

    <div class="subjects-grid">
      <div v-for="subject in store.subjects" :key="subject.id" class="subject-card">
        <div class="sc-color-bar" :style="`background: ${subject.color}`"></div>
        <div class="sc-body">
          <div class="sc-icon" :style="`background: ${subject.color}20; color: ${subject.color}`">
            <AppIcon :name="subject.icon || 'BookOpen'" :size="24" />
          </div>
          <div class="sc-info">
            <h3 class="font-ar">{{ subject.name }}</h3>
            <p class="sc-slug font-en">{{ subject.slug }}</p>
            <p class="sc-context font-ar">{{ getTermContext(subject.termId) }}</p>
            <div class="sc-meta font-ar">
              <span>{{ subject.lessons.length }} درس</span>
            </div>
          </div>
        </div>
        <div class="sc-actions">
          <button class="action-btn" @click="openEdit(subject)" title="تعديل"><AppIcon name="Pencil" :size="14" /></button>
          <button class="action-btn action-btn--danger" @click="confirmDelete = { open: true, id: subject.id, name: subject.name }" title="حذف">
            <AppIcon name="Trash2" :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="font-ar">{{ editSubject ? 'تعديل المادة' : 'مادة جديدة' }}</h3>
            <button class="close-btn" @click="showForm = false"><AppIcon name="X" :size="18" /></button>
          </div>
          <div class="modal-body">
            <div class="field-row">
              <label class="field-label font-ar">اسم المادة</label>
              <input v-model="form.name" class="field-input font-ar" placeholder="الرياضيات" />
            </div>
            <div class="field-row">
              <label class="field-label font-ar">Slug</label>
              <input v-model="form.slug" class="field-input font-en" placeholder="math" />
            </div>
            <div class="field-row">
              <label class="field-label font-ar">الصف والترم</label>
              <select v-model="form.termId" class="field-input font-ar">
                <option value="">— اختر الترم —</option>
                <option v-for="t in allTerms" :key="t.id" :value="t.id">
                  {{ t.stageLabel }} — {{ t.gradeName }} — {{ t.name }}
                </option>
              </select>
            </div>
            <div class="two-col">
              <div class="field-row">
                <label class="field-label font-ar">أيقونة (Lucide)</label>
                <input v-model="form.icon" class="field-input font-en" placeholder="Calculator" />
              </div>
              <div class="field-row">
                <label class="field-label font-ar">الترتيب</label>
                <input v-model.number="form.order" type="number" class="field-input font-en" />
              </div>
            </div>
            <div class="field-row">
              <label class="field-label font-ar">اللون المميز</label>
              <input v-model="form.color" type="color" class="color-picker" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost font-ar" @click="showForm = false">إلغاء</button>
            <button class="btn btn-primary font-ar" @click="handleSave">حفظ المادة</button>
          </div>
        </div>
      </div>
    </Teleport>

    <ConfirmDialog
      :open="confirmDelete.open"
      title="حذف المادة"
      :message="`هل تريد حذف '${confirmDelete.name}'؟ سيؤدي ذلك لحذف جميع الدروس التابعة لها.`"
      confirm-label="حذف"
      :danger="true"
      @confirm="doDelete"
      @cancel="confirmDelete.open = false"
    />
  </div>
</template>

<style scoped>
.admin-subjects { display: flex; flex-direction: column; gap: var(--space-lg); }
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md); }
.page-header h2 { font-size: var(--text-h2); color: var(--text-primary); }
.page-sub { color: var(--text-muted); font-size: 0.875rem; }
.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem; border-radius: var(--radius-md); border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all var(--duration-fast); }
.btn-primary { background: var(--color-navy); color: #fff; }
.btn-primary:hover { background: var(--color-navy-light); }
.btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); }
.btn-ghost:hover { background: var(--bg-section); }

.subjects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-md); }
.subject-card { background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); overflow: hidden; position: relative; }
.sc-color-bar { height: 4px; }
.sc-body { display: flex; gap: var(--space-md); padding: var(--space-md); }
.sc-icon { width: 48px; height: 48px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sc-info { flex: 1; min-width: 0; }
.sc-info h3 { font-size: var(--text-h4); color: var(--text-primary); margin-bottom: 2px; }
.sc-slug { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; }
.sc-context { font-size: 0.8125rem; color: var(--color-teal); font-weight: 500; margin-bottom: 0.5rem; }
.sc-meta { font-size: 0.75rem; color: var(--text-muted); }

.sc-actions { display: flex; gap: 0.25rem; justify-content: flex-end; padding: 0 var(--space-md) var(--space-sm); }
.action-btn { width: 30px; height: 30px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: none; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; transition: all var(--duration-fast); }
.action-btn:hover { background: var(--bg-section); color: var(--text-primary); }
.action-btn--danger:hover { border-color: var(--color-error); color: var(--color-error); }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: var(--z-modal-backdrop); padding: 1rem; }
.modal-dialog { background: var(--bg-card); border-radius: var(--radius-xl); width: 100%; max-width: 480px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: var(--shadow-xl); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-lg); border-bottom: 1px solid var(--border-color); }
.modal-header h3 { font-size: var(--text-h4); color: var(--text-primary); }
.close-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; }
.modal-body { flex: 1; overflow-y: auto; padding: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-md); }
.modal-footer { padding: var(--space-md) var(--space-lg); border-top: 1px solid var(--border-color); display: flex; gap: var(--space-sm); justify-content: flex-end; }
.field-row { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); }
.field-input { padding: 0.625rem 0.875rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-input); color: var(--text-primary); font-size: 0.875rem; outline: none; }
.field-input:focus { border-color: var(--color-gold); }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
.color-picker { width: 100%; height: 40px; border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; padding: 2px; }
</style>
