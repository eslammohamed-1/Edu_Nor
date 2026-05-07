<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useRemoteApi } from '@/services/http/client';
import { fetchNotes, upsertNote, deleteNote, type NoteRow } from '@/services/notesService';
import AppButton from '@/components/common/AppButton.vue';
import AppIcon from '@/components/common/AppIcon.vue';

const items = ref<NoteRow[]>([]);
const q = ref('');
const loading = ref(true);
const err = ref('');
const editingId = ref<string | null>(null);
const draft = ref('');

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase();
  if (!s) return items.value;
  return items.value.filter(
    (n) =>
      n.title.toLowerCase().includes(s) ||
      n.courseTitle.toLowerCase().includes(s) ||
      n.body.toLowerCase().includes(s)
  );
});

onMounted(async () => {
  if (!useRemoteApi()) {
    err.value = 'تتطلب هذه الصفحة اتصالاً بالخادم';
    loading.value = false;
    return;
  }
  try {
    items.value = await fetchNotes();
  } catch (e) {
    err.value = e instanceof Error ? e.message : 'تعذّر التحميل';
  } finally {
    loading.value = false;
  }
});

function startEdit(n: NoteRow) {
  editingId.value = n.lessonId;
  draft.value = n.body;
}

async function save() {
  if (!editingId.value) return;
  try {
    await upsertNote(editingId.value, draft.value);
    items.value = await fetchNotes();
    editingId.value = null;
  } catch (e) {
    err.value = e instanceof Error ? e.message : 'فشل الحفظ';
  }
}

async function remove(lessonId: string) {
  if (!confirm('حذف الملاحظة لهذا الدرس؟')) return;
  try {
    await deleteNote(lessonId);
    items.value = await fetchNotes();
    if (editingId.value === lessonId) editingId.value = null;
  } catch (e) {
    err.value = e instanceof Error ? e.message : 'فشل الحذف';
  }
}
</script>

<template>
  <div class="my-notes container">
    <header class="head">
      <h1 class="font-ar text-navy">ملاحظاتي</h1>
      <input
        v-model="q"
        class="search font-ar"
        type="search"
        placeholder="ابحث في الملاحظات…"
        aria-label="بحث"
      />
    </header>

    <p v-if="err" class="err font-ar">{{ err }}</p>
    <p v-else-if="loading" class="muted font-ar">جاري التحميل…</p>

    <ul v-else class="list">
      <li v-for="n in filtered" :key="n.lessonId" class="note-card">
        <div class="note-top">
          <div>
            <RouterLink :to="`/lessons/${n.lessonId}`" class="lesson-link font-ar">
              {{ n.title }}
            </RouterLink>
            <p class="course font-ar text-secondary">{{ n.courseTitle }}</p>
          </div>
          <div class="actions">
            <AppButton size="sm" variant="ghost" @click="startEdit(n)">
              <AppIcon name="Pencil" :size="16" />
            </AppButton>
            <AppButton size="sm" variant="ghost" @click="remove(n.lessonId)">
              <AppIcon name="Trash2" :size="16" />
            </AppButton>
          </div>
        </div>

        <div v-if="editingId === n.lessonId" class="edit-box">
          <textarea v-model="draft" class="ta font-ar" rows="4" />
          <div class="edit-actions">
            <AppButton size="sm" @click="save">حفظ</AppButton>
            <AppButton size="sm" variant="ghost" @click="editingId = null">إلغاء</AppButton>
          </div>
        </div>
        <p v-else class="body-preview font-ar">{{ n.body || '—' }}</p>
        <span class="meta font-en">{{ n.updatedAt }}</span>
      </li>
    </ul>

    <p v-if="!loading && !filtered.length" class="muted font-ar">لا ملاحظات بعد.</p>
  </div>
</template>

<style scoped>
.my-notes {
  padding: var(--space-2xl) var(--space-md) var(--space-4xl);
  max-width: 720px;
}

.head {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.head h1 {
  margin: 0;
}

.search {
  min-width: 220px;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.note-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  background: var(--bg-card);
}

.note-top {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
}

.lesson-link {
  font-weight: var(--weight-semibold);
  color: var(--color-navy);
  text-decoration: none;
}

[data-theme='dark'] .lesson-link {
  color: var(--color-gold);
}

.course {
  margin: 4px 0 0;
  font-size: var(--text-body-sm);
}

.actions {
  display: flex;
  gap: var(--space-xxs);
}

.body-preview {
  margin: var(--space-sm) 0 0;
  white-space: pre-wrap;
  color: var(--text-secondary);
}

.meta {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: var(--space-sm);
}

.edit-box {
  margin-top: var(--space-sm);
}

.ta {
  width: 100%;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: var(--bg-page);
  color: var(--text-primary);
  resize: vertical;
}

.edit-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.err {
  color: var(--color-error);
}

.muted {
  color: var(--text-muted);
}
</style>
