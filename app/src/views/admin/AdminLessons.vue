<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminContentStore } from '@/stores/admin/adminContent';
import ConfirmDialog from '@/components/admin/shared/ConfirmDialog.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import type { Lesson, LessonType } from '@/types/course';

const store = useAdminContentStore();

const selectedSubject = ref('');
const selectedCourse = ref('');
const showForm = ref(false);
const editLesson = ref<(Lesson & { courseId: string; published?: boolean }) | null>(null);
const confirmDelete = ref({ open: false, id: '', name: '' });

const courses = computed(() =>
  selectedSubject.value
    ? store.coursesBySubject(selectedSubject.value)
    : store.courses
);

const lessons = computed(() =>
  selectedCourse.value
    ? store.lessonsByCourse(selectedCourse.value)
    : []
);

const form = ref({
  title: '', description: '', duration: 0, type: 'video' as LessonType,
  videoUrl: '', content: '', keyPoints: [] as string[], order: 0, courseId: ''
});

const newKeyPoint = ref('');

function addKeyPoint() {
  if (newKeyPoint.value.trim()) {
    form.value.keyPoints.push(newKeyPoint.value.trim());
    newKeyPoint.value = '';
  }
}

function removeKeyPoint(idx: number) {
  form.value.keyPoints.splice(idx, 1);
}

function openCreate() {
  editLesson.value = null;
  form.value = { title: '', description: '', duration: 0, type: 'video', videoUrl: '', content: '', keyPoints: [], order: lessons.value.length, courseId: selectedCourse.value };
  showForm.value = true;
}

function openEdit(l: Lesson & { courseId: string; published?: boolean }) {
  editLesson.value = l;
  form.value = { title: l.title, description: l.description, duration: l.duration, type: l.type, videoUrl: l.videoUrl || '', content: l.content, keyPoints: [...(l.keyPoints || [])], order: l.order, courseId: l.courseId };
  showForm.value = true;
}

function handleSave() {
  if (editLesson.value) {
    store.updateLesson(editLesson.value.id, form.value);
  } else {
    const { courseId, ...lessonData } = form.value;
    store.createLesson({ ...lessonData, courseId });
  }
  showForm.value = false;
}

function doDelete() {
  store.deleteLesson(confirmDelete.value.id);
  confirmDelete.value.open = false;
}
</script>

<template>
  <div class="admin-lessons">
    <div class="page-header">
      <h2 class="font-ar">الدروس</h2>
    </div>

    <!-- Filters -->
    <div class="lesson-filters">
      <div class="field-row">
        <label class="field-label font-ar">المادة</label>
        <select v-model="selectedSubject" class="field-input font-ar" @change="selectedCourse = ''">
          <option value="">— كل المواد —</option>
          <option v-for="s in store.subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div class="field-row">
        <label class="field-label font-ar">الكورس</label>
        <select v-model="selectedCourse" class="field-input font-ar">
          <option value="">— اختر كورساً —</option>
          <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.title }}</option>
        </select>
      </div>
      <button v-if="selectedCourse" class="btn btn-primary font-ar add-btn" @click="openCreate">
        <AppIcon name="Plus" :size="15" /> درس جديد
      </button>
    </div>

    <!-- Lessons List -->
    <div v-if="!selectedCourse" class="no-selection font-ar">
      <AppIcon name="PlayCircle" :size="48" color="var(--text-muted)" />
      <p>اختر كورساً لعرض دروسه وإدارتها</p>
    </div>

    <div v-else-if="lessons.length === 0" class="no-selection font-ar">
      <AppIcon name="Plus" :size="48" color="var(--text-muted)" />
      <p>لا توجد دروس — ابدأ بإنشاء درس جديد</p>
    </div>

    <div v-else class="lessons-table">
      <div v-for="lesson in lessons" :key="lesson.id" class="lesson-row">
        <div class="lesson-order font-en">{{ lesson.order + 1 }}</div>
        <div class="lesson-type-icon">
          <AppIcon :name="lesson.type === 'video' ? 'PlayCircle' : lesson.type === 'quiz' ? 'ClipboardList' : 'FileText'" :size="18" color="var(--color-navy)" />
        </div>
        <div class="lesson-info">
          <p class="lesson-title font-ar">{{ lesson.title }}</p>
          <p class="lesson-meta font-ar">{{ lesson.duration }} دقيقة</p>
        </div>
        <span class="status-pill font-ar" :class="lesson.published ? 'published' : 'draft'">
          {{ lesson.published ? 'منشور' : 'مسودة' }}
        </span>
        <div class="lesson-actions">
          <button class="action-btn" @click="store.publishLesson(lesson.id, !lesson.published)" :title="lesson.published ? 'إلغاء النشر' : 'نشر'">
            <AppIcon :name="lesson.published ? 'EyeOff' : 'Eye'" :size="14" />
          </button>
          <button class="action-btn" @click="openEdit(lesson)" title="تعديل">
            <AppIcon name="Pencil" :size="14" />
          </button>
          <button class="action-btn action-btn--danger" @click="confirmDelete = { open: true, id: lesson.id, name: lesson.title }" title="حذف">
            <AppIcon name="Trash2" :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- Lesson Form Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <h3 class="font-ar">{{ editLesson ? 'تعديل الدرس' : 'درس جديد' }}</h3>
            <button class="close-btn" @click="showForm = false"><AppIcon name="X" :size="18" /></button>
          </div>
          <div class="modal-body">
            <div class="two-col">
              <div class="field-row">
                <label class="field-label font-ar">عنوان الدرس</label>
                <input v-model="form.title" class="field-input font-ar" />
              </div>
              <div class="field-row">
                <label class="field-label font-ar">النوع</label>
                <select v-model="form.type" class="field-input font-ar">
                  <option value="video">فيديو</option>
                  <option value="reading">قراءة</option>
                  <option value="quiz">اختبار</option>
                </select>
              </div>
            </div>
            <div class="field-row">
              <label class="field-label font-ar">رابط الفيديو</label>
              <input v-model="form.videoUrl" class="field-input font-en" placeholder="https://..." />
            </div>
            <div class="two-col">
              <div class="field-row">
                <label class="field-label font-ar">المدة (دقيقة)</label>
                <input v-model.number="form.duration" type="number" class="field-input font-en" />
              </div>
              <div class="field-row">
                <label class="field-label font-ar">الترتيب</label>
                <input v-model.number="form.order" type="number" class="field-input font-en" />
              </div>
            </div>
            <div class="field-row">
              <label class="field-label font-ar">الوصف</label>
              <textarea v-model="form.description" class="field-input font-ar" rows="2"></textarea>
            </div>
            <div class="field-row">
              <label class="field-label font-ar">المحتوى (HTML)</label>
              <textarea v-model="form.content" class="field-input font-en" rows="3" dir="ltr"></textarea>
            </div>
            <div class="field-row">
              <label class="field-label font-ar">النقاط الرئيسية</label>
              <div class="key-points-add">
                <input v-model="newKeyPoint" class="field-input font-ar" placeholder="أضف نقطة..." @keyup.enter="addKeyPoint" />
                <button class="add-kp-btn" @click="addKeyPoint"><AppIcon name="Plus" :size="16" /></button>
              </div>
              <ul v-if="form.keyPoints.length" class="kp-list">
                <li v-for="(kp, i) in form.keyPoints" :key="i" class="kp-item font-ar">
                  {{ kp }}
                  <button class="kp-remove" @click="removeKeyPoint(i)"><AppIcon name="X" :size="12" /></button>
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost font-ar" @click="showForm = false">إلغاء</button>
            <button class="btn btn-primary font-ar" @click="handleSave">حفظ الدرس</button>
          </div>
        </div>
      </div>
    </Teleport>

    <ConfirmDialog :open="confirmDelete.open" title="حذف الدرس" :message="`حذف '${confirmDelete.name}'؟`" confirm-label="حذف" :danger="true" @confirm="doDelete" @cancel="confirmDelete.open = false" />
  </div>
</template>

<style scoped>
.admin-lessons { display: flex; flex-direction: column; gap: var(--space-lg); }
.page-header h2 { font-size: var(--text-h2); color: var(--text-primary); }
.lesson-filters { display: flex; gap: var(--space-md); flex-wrap: wrap; align-items: flex-end; background: var(--bg-card); padding: var(--space-md); border-radius: var(--radius-xl); border: 1px solid var(--border-color); }
.lesson-filters .field-row { flex: 1; min-width: 180px; }
.add-btn { align-self: flex-end; }

.no-selection { display: flex; flex-direction: column; align-items: center; gap: var(--space-md); padding: var(--space-4xl); color: var(--text-muted); }

.lessons-table { background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); overflow: hidden; }
.lesson-row { display: flex; align-items: center; gap: var(--space-md); padding: 0.875rem var(--space-lg); border-bottom: 1px solid var(--border-color); transition: background var(--duration-fast); }
.lesson-row:last-child { border-bottom: none; }
.lesson-row:hover { background: var(--bg-section); }
.lesson-order { width: 24px; text-align: center; color: var(--text-muted); font-size: 0.8125rem; font-weight: 600; }
.lesson-type-icon { flex-shrink: 0; }
.lesson-info { flex: 1; min-width: 0; }
.lesson-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
.lesson-meta { font-size: 0.75rem; color: var(--text-muted); }
.status-pill { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-weight: 600; flex-shrink: 0; }
.status-pill.published { background: #e8f5e9; color: #2e7d32; }
.status-pill.draft { background: var(--bg-section); color: var(--text-muted); }
.lesson-actions { display: flex; gap: 0.25rem; }
.action-btn { width: 28px; height: 28px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: none; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; transition: all var(--duration-fast); }
.action-btn:hover { background: var(--bg-section); color: var(--text-primary); }
.action-btn--danger:hover { border-color: var(--color-error); color: var(--color-error); }

.field-row { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); }
.field-input { padding: 0.625rem 0.875rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-input); color: var(--text-primary); font-size: 0.875rem; outline: none; resize: vertical; }
.field-input:focus { border-color: var(--color-gold); }
.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem; border-radius: var(--radius-md); border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all var(--duration-fast); }
.btn-primary { background: var(--color-navy); color: #fff; }
.btn-primary:hover { background: var(--color-navy-light); }
.btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: var(--z-modal-backdrop); padding: 1rem; }
.modal-dialog { background: var(--bg-card); border-radius: var(--radius-xl); width: 100%; max-width: 520px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: var(--shadow-xl); }
.modal-lg { max-width: 680px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-lg); border-bottom: 1px solid var(--border-color); }
.modal-header h3 { font-size: var(--text-h4); color: var(--text-primary); }
.close-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); }
.modal-body { flex: 1; overflow-y: auto; padding: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-md); }
.modal-footer { padding: var(--space-md) var(--space-lg); border-top: 1px solid var(--border-color); display: flex; gap: var(--space-sm); justify-content: flex-end; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }

.key-points-add { display: flex; gap: 0.5rem; }
.add-kp-btn { padding: 0.625rem; background: var(--color-navy); color: #fff; border: none; border-radius: var(--radius-md); cursor: pointer; display: flex; align-items: center; }
.kp-list { list-style: none; display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
.kp-item { display: flex; align-items: center; gap: 0.4rem; background: var(--bg-section); border: 1px solid var(--border-color); padding: 0.25rem 0.6rem; border-radius: var(--radius-full); font-size: 0.8125rem; color: var(--text-secondary); }
.kp-remove { background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; padding: 0; }
</style>
