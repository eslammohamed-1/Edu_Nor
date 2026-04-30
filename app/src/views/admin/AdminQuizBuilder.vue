<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminQuizzesStore } from '@/stores/admin/adminQuizzes';
import { useAdminContentStore } from '@/stores/admin/adminContent';
import AppIcon from '@/components/common/AppIcon.vue';
import type { AnyQuestion } from '@/types/quiz';

const route = useRoute();
const router = useRouter();
const store = useAdminQuizzesStore();
const contentStore = useAdminContentStore();

const quiz = computed(() => store.getById(route.params.id as string));
const selectedQuestionIdx = ref<number | null>(null);

const meta = ref({ title: '', description: '', duration: 15, passingScore: 60, grade: '', subjectId: '' });
const questions = ref<Array<{
  id: string; text: string; type: string; points: number;
  options?: Array<{ id: string; label: string }>;
  correctOptionId?: string; explanation?: string;
}>>([]);

watch(quiz, (q) => {
  if (q) {
    meta.value = { title: q.title, description: q.description || '', duration: q.duration, passingScore: q.passingScore, grade: q.grade, subjectId: q.subjectId };
    questions.value = q.questions as unknown as typeof questions.value;
  }
}, { immediate: true });

const selectedQuestion = computed(() =>
  selectedQuestionIdx.value !== null ? questions.value[selectedQuestionIdx.value] : null
);

function addQuestion() {
  questions.value.push({
    id: 'q_' + Date.now(),
    text: 'سؤال جديد',
    type: 'mcq',
    points: 1,
    options: [
      { id: 'a', label: 'الخيار أ' },
      { id: 'b', label: 'الخيار ب' },
      { id: 'c', label: 'الخيار ج' },
      { id: 'd', label: 'الخيار د' }
    ],
    correctOptionId: 'a',
    explanation: ''
  });
  selectedQuestionIdx.value = questions.value.length - 1;
}

function removeQuestion(idx: number) {
  questions.value.splice(idx, 1);
  if (selectedQuestionIdx.value === idx) selectedQuestionIdx.value = null;
}

function addOption() {
  if (!selectedQuestion.value) return;
  const letters = ['a','b','c','d','e','f'];
  const idx = selectedQuestion.value.options?.length || 0;
  selectedQuestion.value.options?.push({ id: letters[idx] || `opt_${idx}`, label: 'خيار جديد' });
}

function removeOption(optIdx: number) {
  selectedQuestion.value?.options?.splice(optIdx, 1);
}

function saveQuiz() {
  if (!quiz.value) return;
  store.updateQuiz(quiz.value.id, {
    ...meta.value,
    questions: questions.value as unknown as AnyQuestion[],
  });
  router.push('/admin/quizzes');
}

function exportJSON() {
  if (!quiz.value) return;
  const data = JSON.stringify({ ...meta.value, questions: questions.value }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quiz-${quiz.value.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          questions.value = parsed.questions.map((q: Record<string, unknown>, i: number) => ({
            id: String(q.id || 'q_' + i),
            text: String(q.text || q.stem || ''),
            type: 'mcq',
            points: 1,
            options: Array.isArray(q.options) ? q.options : [],
            correctOptionId: String(q.correctOptionId || ''),
            explanation: String(q.explanation || '')
          }));
          if (parsed.title) meta.value.title = parsed.title;
          alert(`تم استيراد ${questions.value.length} سؤال بنجاح.`);
        }
      } catch {
        alert('فشل تحليل الملف.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
</script>

<template>
  <div class="quiz-builder">
    <div class="qb-header">
      <button class="back-link font-ar" @click="router.back()">
        <AppIcon name="ArrowRight" :size="16" /> عودة
      </button>
      <h2 class="font-ar">{{ meta.title || 'اختبار بلا عنوان' }}</h2>
      <div class="qb-header-actions">
        <button class="btn btn-outline font-ar" @click="importJSON">
          <AppIcon name="Upload" :size="14" /> استيراد JSON
        </button>
        <button class="btn btn-outline font-ar" @click="exportJSON">
          <AppIcon name="Download" :size="14" /> تصدير JSON
        </button>
        <button class="btn btn-primary font-ar" @click="saveQuiz">
          <AppIcon name="Save" :size="14" /> حفظ الاختبار
        </button>
      </div>
    </div>

    <div class="qb-body">
      <!-- Meta Panel -->
      <div class="qb-meta-panel">
        <h3 class="panel-title font-ar">معلومات الاختبار</h3>
        <div class="field-row">
          <label class="field-label font-ar">العنوان</label>
          <input v-model="meta.title" class="field-input font-ar" />
        </div>
        <div class="field-row">
          <label class="field-label font-ar">الوصف</label>
          <textarea v-model="meta.description" class="field-input font-ar" rows="2"></textarea>
        </div>
        <div class="two-col">
          <div class="field-row">
            <label class="field-label font-ar">المدة (دقيقة)</label>
            <input v-model.number="meta.duration" type="number" class="field-input font-en" />
          </div>
          <div class="field-row">
            <label class="field-label font-ar">درجة النجاح (%)</label>
            <input v-model.number="meta.passingScore" type="number" class="field-input font-en" />
          </div>
        </div>
        <div class="field-row">
          <label class="field-label font-ar">المادة</label>
          <select v-model="meta.subjectId" class="field-input font-ar">
            <option value="">— اختر —</option>
            <option v-for="s in contentStore.subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <!-- Questions List -->
        <div class="ql-header">
          <h3 class="panel-title font-ar">الأسئلة ({{ questions.length }})</h3>
          <button class="add-q-btn font-ar" @click="addQuestion">
            <AppIcon name="Plus" :size="14" /> إضافة
          </button>
        </div>
        <ul class="q-list">
          <li
            v-for="(q, i) in questions"
            :key="q.id"
            class="q-item font-ar"
            :class="{ active: selectedQuestionIdx === i }"
            @click="selectedQuestionIdx = i"
          >
            <span class="q-num">{{ i + 1 }}</span>
            <span class="q-text">{{ q.text }}</span>
            <button class="q-remove" @click.stop="removeQuestion(i)">
              <AppIcon name="X" :size="12" />
            </button>
          </li>
          <li v-if="!questions.length" class="q-empty font-ar">لا توجد أسئلة — اضغط إضافة</li>
        </ul>
      </div>

      <!-- Question Editor -->
      <div class="qb-editor-panel">
        <div v-if="selectedQuestion === null" class="editor-empty font-ar">
          <AppIcon name="MousePointer" :size="48" color="var(--text-muted)" />
          <p>اختر سؤالاً من القائمة أو أنشئ سؤالاً جديداً</p>
        </div>

        <template v-else>
          <h3 class="panel-title font-ar">تعديل السؤال {{ selectedQuestionIdx! + 1 }}</h3>
          <div class="field-row">
            <label class="field-label font-ar">نص السؤال</label>
            <textarea v-model="selectedQuestion.text" class="field-input font-ar" rows="3"></textarea>
          </div>

          <div class="field-row">
            <div class="options-header">
              <label class="field-label font-ar">الخيارات</label>
              <button class="add-opt-btn font-ar" @click="addOption">+ إضافة خيار</button>
            </div>
            <div class="options-list">
              <div v-for="(opt, oi) in selectedQuestion.options" :key="opt.id" class="option-row">
                <input
                  type="radio"
                  :name="`q-${selectedQuestion.id}`"
                  :value="opt.id"
                  v-model="selectedQuestion.correctOptionId"
                  title="الإجابة الصحيحة"
                />
                <input v-model="opt.label" class="field-input font-ar opt-input" />
                <button class="opt-remove" @click="removeOption(oi)"><AppIcon name="X" :size="12" /></button>
              </div>
            </div>
          </div>

          <div class="field-row">
            <label class="field-label font-ar">الشرح (اختياري)</label>
            <textarea v-model="selectedQuestion.explanation" class="field-input font-ar" rows="2"></textarea>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-builder { display: flex; flex-direction: column; gap: var(--space-lg); height: calc(100vh - 120px); }
.qb-header { display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap; }
.back-link { display: flex; align-items: center; gap: 0.4rem; background: none; border: none; cursor: pointer; color: var(--text-secondary); font-size: 0.875rem; padding: 0; }
.qb-header h2 { flex: 1; font-size: var(--text-h3); color: var(--text-primary); }
.qb-header-actions { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem; border-radius: var(--radius-md); border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all var(--duration-fast); }
.btn-primary { background: var(--color-navy); color: #fff; }
.btn-primary:hover { background: var(--color-navy-light); }
.btn-outline { background: none; border: 1.5px solid var(--border-color); color: var(--text-secondary); }
.btn-outline:hover { border-color: var(--color-navy); color: var(--color-navy); }

.qb-body { display: grid; grid-template-columns: 360px 1fr; gap: var(--space-lg); flex: 1; overflow: hidden; }
@media (max-width: 900px) { .qb-body { grid-template-columns: 1fr; overflow: auto; } }

.qb-meta-panel, .qb-editor-panel { background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); padding: var(--space-lg); overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-md); }
.panel-title { font-size: var(--text-h4); color: var(--text-primary); }
.field-row { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); }
.field-input { padding: 0.625rem 0.875rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-input); color: var(--text-primary); font-size: 0.875rem; outline: none; resize: vertical; }
.field-input:focus { border-color: var(--color-gold); }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }

.ql-header { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-md); }
.add-q-btn { display: flex; align-items: center; gap: 0.25rem; background: var(--color-navy); color: #fff; border: none; border-radius: var(--radius-md); padding: 0.4rem 0.75rem; font-size: 0.8125rem; cursor: pointer; }

.q-list { list-style: none; display: flex; flex-direction: column; gap: 0.25rem; }
.q-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); cursor: pointer; transition: all var(--duration-fast); font-size: 0.8125rem; }
.q-item:hover { border-color: var(--color-navy); }
.q-item.active { border-color: var(--color-gold); background: #fffde7; }
[data-theme="dark"] .q-item.active { background: #4e3c00; }
.q-num { width: 20px; height: 20px; border-radius: 50%; background: var(--bg-section); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }
.q-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-primary); }
.q-remove { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 2px; }
.q-empty { text-align: center; color: var(--text-muted); padding: var(--space-lg); }

.editor-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-md); height: 100%; color: var(--text-muted); }

.options-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.add-opt-btn { font-size: 0.75rem; background: none; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.25rem 0.6rem; cursor: pointer; color: var(--text-secondary); }
.options-list { display: flex; flex-direction: column; gap: 0.5rem; }
.option-row { display: flex; align-items: center; gap: 0.5rem; }
.opt-input { flex: 1; }
.opt-remove { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 2px; }
</style>
