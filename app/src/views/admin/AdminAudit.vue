<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminAuditStore } from '@/stores/admin/adminAudit';
import DataTable from '@/components/admin/shared/DataTable.vue';
import FilterBar from '@/components/admin/shared/FilterBar.vue';
import ConfirmDialog from '@/components/admin/shared/ConfirmDialog.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import { toCSV, downloadCSV } from '@/lib/csv';
import type { Column } from '@/components/admin/shared/DataTable.vue';
import type { AuditEntry } from '@/stores/admin/adminAudit';

const store = useAdminAuditStore();
const searchQ = ref('');
const filters = ref<Record<string, string>>({});
const confirmClear = ref(false);

const filtered = computed(() => {
  let list = store.logs;
  if (searchQ.value) {
    const q = searchQ.value.toLowerCase();
    list = list.filter(l =>
      l.action.toLowerCase().includes(q) ||
      l.actor.name.toLowerCase().includes(q) ||
      l.target?.label?.toLowerCase().includes(q)
    );
  }
  if (filters.value.actor) {
    list = list.filter(l => l.actor.id === filters.value.actor);
  }
  return list;
});

const columns: Column<AuditEntry>[] = [
  { key: 'createdAt', label: 'الوقت', sortable: true },
  { key: 'actor', label: 'المنفّذ' },
  { key: 'action', label: 'الفعل', sortable: true },
  { key: 'target', label: 'الهدف' },
  { key: 'ip', label: 'IP' }
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ar-EG');
}

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    'user.create': 'إنشاء مستخدم',
    'user.update': 'تعديل مستخدم',
    'user.delete': 'حذف مستخدم',
    'user.ban': 'حظر مستخدم',
    'user.unban': 'رفع الحظر',
    'user.roleChange': 'تغيير الدور',
    'user.resetPassword': 'إعادة تعيين كلمة المرور',
    'course.create': 'إنشاء كورس',
    'course.publish': 'نشر كورس',
    'lesson.create': 'إنشاء درس',
    'quiz.create': 'إنشاء اختبار',
    'settings.update': 'تحديث الإعدادات',
    'settings.reset': 'إعادة تعيين الإعدادات',
    'impersonate.start': 'بدء التشخيص',
    'impersonate.stop': 'إيقاف التشخيص',
  };
  return labels[action] || action;
}

function exportAudit() {
  const rows = filtered.value.map(l => ({
    time: l.createdAt,
    actor: l.actor.name,
    role: l.actor.role,
    action: l.action,
    target: l.target?.label || '',
    ip: l.ip || ''
  }));
  downloadCSV(`audit-${new Date().toISOString().slice(0, 10)}.csv`,
    toCSV(rows as Record<string, unknown>[], ['time', 'actor', 'role', 'action', 'target', 'ip']));
}

function doClear() {
  store.clear();
  confirmClear.value = false;
}
</script>

<template>
  <div class="admin-audit">
    <div class="page-header">
      <div>
        <h2 class="font-ar">سجل التدقيق</h2>
        <p class="page-sub font-ar">{{ store.logs.length }} إجراء مسجّل</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline font-ar" @click="exportAudit">
          <AppIcon name="Download" :size="14" /> تصدير CSV
        </button>
        <button class="btn btn-danger font-ar" @click="confirmClear = true">
          <AppIcon name="Trash2" :size="14" /> مسح السجل
        </button>
      </div>
    </div>

    <!-- Info card -->
    <div class="info-card font-ar">
      <AppIcon name="Info" :size="16" color="var(--color-info)" />
      <p>يُسجَّل كل إجراء على المستخدمين، المحتوى، الاختبارات، والإعدادات تلقائياً. يُحتفظ بآخر 1000 إجراء.</p>
    </div>

    <div class="table-card">
      <FilterBar
        v-model="searchQ"
        placeholder="بحث بالفعل أو المنفّذ..."
      />

      <DataTable
        :columns="(columns as unknown as Column<Record<string, unknown>>[])"
        :rows="(filtered as unknown as Record<string, unknown>[])"
        :page-size="15"
        empty-text="لا توجد سجلات"
      >
        <template #cell-createdAt="{ row }">
          <span class="font-ar time-cell">{{ formatDate((row as unknown as AuditEntry).createdAt) }}</span>
        </template>
        <template #cell-actor="{ row }">
          <div class="actor-cell">
            <div class="actor-avatar font-ar">{{ (row as unknown as AuditEntry).actor?.name?.slice(0, 1) }}</div>
            <span class="font-ar">{{ (row as unknown as AuditEntry).actor?.name }}</span>
          </div>
        </template>
        <template #cell-action="{ row }">
          <span class="action-tag font-ar">{{ actionLabel((row as unknown as AuditEntry).action) }}</span>
        </template>
        <template #cell-target="{ row }">
          <span class="font-ar target-cell">{{ (row as unknown as AuditEntry).target?.label || '—' }}</span>
        </template>
        <template #cell-ip="{ row }">
          <span class="font-en ip-cell">{{ (row as unknown as AuditEntry).ip || '—' }}</span>
        </template>
        <template #actions>
          <!-- no row actions for audit log -->
          <span></span>
        </template>
      </DataTable>
    </div>

    <ConfirmDialog
      :open="confirmClear"
      title="مسح سجل التدقيق"
      message="هل تريد مسح كل السجلات نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
      confirm-label="مسح الكل"
      :danger="true"
      @confirm="doClear"
      @cancel="confirmClear = false"
    />
  </div>
</template>

<style scoped>
.admin-audit { display: flex; flex-direction: column; gap: var(--space-lg); }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md); }
.page-header h2 { font-size: var(--text-h2); color: var(--text-primary); }
.page-sub { color: var(--text-muted); font-size: 0.875rem; }
.header-actions { display: flex; gap: var(--space-sm); flex-wrap: wrap; }

.info-card { display: flex; align-items: flex-start; gap: 0.75rem; padding: var(--space-md) var(--space-lg); background: #e3f2fd; border-radius: var(--radius-lg); border: 1px solid #90caf9; font-size: 0.875rem; color: #1565c0; }
[data-theme="dark"] .info-card { background: #0d2137; color: #90caf9; border-color: #1565c0; }
.table-card { background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); overflow: hidden; }

.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem; border-radius: var(--radius-md); border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all var(--duration-fast); }
.btn-outline { background: none; border: 1.5px solid var(--border-color); color: var(--text-secondary); }
.btn-outline:hover { border-color: var(--color-navy); color: var(--color-navy); }
.btn-danger { background: var(--color-error); color: #fff; }
.btn-danger:hover { filter: brightness(1.1); }

.time-cell { font-size: 0.75rem; color: var(--text-muted); }
.actor-cell { display: flex; align-items: center; gap: 0.5rem; }
.actor-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--gradient-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
.action-tag { font-size: 0.8125rem; background: var(--bg-section); padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); color: var(--text-secondary); }
.target-cell { font-size: 0.8125rem; color: var(--text-primary); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; }
.ip-cell { font-size: 0.75rem; color: var(--text-muted); }
</style>
