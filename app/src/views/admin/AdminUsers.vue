<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAdminUsersStore } from '@/stores/admin/adminUsers';
import DataTable from '@/components/admin/shared/DataTable.vue';
import FilterBar from '@/components/admin/shared/FilterBar.vue';
import ConfirmDialog from '@/components/admin/shared/ConfirmDialog.vue';
import UserForm from '@/components/admin/users/UserForm.vue';
import RoleBadge from '@/components/admin/users/RoleBadge.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import { useImpersonate } from '@/composables/useImpersonate';
import type { User } from '@/types/auth';
import { toCSV, downloadCSV } from '@/lib/csv';
import type { Column } from '@/components/admin/shared/DataTable.vue';
import { useToast } from '@/composables/useToast';

const store = useAdminUsersStore();
const toast = useToast();
const { start: impersonateStart } = useImpersonate();

onMounted(() => {
  void store.fetchUsers();
});

const searchQ = ref('');
const filters = ref<Record<string, string>>({});
const showForm = ref(false);
const editUser = ref<User | null>(null);
const confirmDelete = ref<{ open: boolean; userId: string; name: string }>({ open: false, userId: '', name: '' });
const confirmBan = ref<{ open: boolean; userId: string; name: string; banned: boolean }>({ open: false, userId: '', name: '', banned: false });

const filteredUsers = computed(() => {
  let list = store.users as (User & { banned?: boolean })[];
  if (searchQ.value) {
    const q = searchQ.value.toLowerCase();
    list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  if (filters.value.role) list = list.filter(u => u.role === filters.value.role);
  if (filters.value.status === 'banned') list = list.filter(u => u.banned);
  if (filters.value.status === 'active') list = list.filter(u => !u.banned);
  return list;
});

const columns: Column<User>[] = [
  { key: 'name', label: 'الاسم', sortable: true },
  { key: 'email', label: 'البريد', sortable: true },
  { key: 'role', label: 'الدور' },
  { key: 'grade', label: 'الصف' },
  { key: 'createdAt', label: 'تاريخ التسجيل', sortable: true }
];

const filterChips = [
  { key: 'role', label: 'الدور', options: [
    { value: 'student', label: 'طالب' },
    { value: 'admin', label: 'مدير' },
    { value: 'super_admin', label: 'سوبر أدمن' }
  ]},
  { key: 'status', label: 'الحالة', options: [
    { value: 'active', label: 'نشط' },
    { value: 'banned', label: 'محظور' }
  ]}
];

function openCreate() {
  editUser.value = null;
  showForm.value = true;
}

function openEdit(row: User) {
  editUser.value = row;
  showForm.value = true;
}

async function handleSave(data: Partial<User> & { password?: string }) {
  try {
    if (editUser.value) {
      await store.updateUser(editUser.value.id, data);
    } else {
      const created = await store.createUser(data);
      if (!created) {
        toast.error('تعذّر إنشاء المستخدم. تحقق من البيانات أو تشغيل الخادم.');
        return;
      }
    }
    showForm.value = false;
  } catch {
    toast.error('حدث خطأ أثناء الحفظ');
  }
}

function askDelete(row: User) {
  confirmDelete.value = { open: true, userId: row.id, name: row.name };
}

async function doDelete() {
  await store.deleteUser(confirmDelete.value.userId);
  confirmDelete.value.open = false;
}

function askBan(row: User & { banned?: boolean }) {
  confirmBan.value = { open: true, userId: row.id, name: row.name, banned: !!row.banned };
}

async function doBan() {
  await store.toggleBan(confirmBan.value.userId);
  confirmBan.value.open = false;
}

async function doResetPassword(row: User) {
  const temp = await store.resetPassword(row.id);
  if (temp) {
    alert(`تم تعيين كلمة مرور مؤقتة لـ ${row.name}:\n\n${temp}\n\nارسلها للمستخدم ثم اطلب منه تغييرها.`);
  } else {
    alert(`تم تسجيل طلب إعادة تعيين كلمة المرور لـ ${row.name} في سجل التدقيق (وضع محلي بدون خادم).`);
  }
}

function doImpersonate(row: User) {
  if (confirm(`هل تريد الدخول كـ "${row.name}"؟`)) {
    impersonateStart(row.id, row.name);
  }
}

function exportUsers() {
  const cols = ['id', 'name', 'email', 'role', 'grade', 'createdAt'];
  downloadCSV('users.csv', toCSV(filteredUsers.value as unknown as Record<string, unknown>[], cols));
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG');
}
</script>

<template>
  <div class="admin-users">
    <div class="page-header">
      <div>
        <h2 class="font-ar">إدارة المستخدمين</h2>
        <p class="page-sub font-ar">{{ store.totalUsers }} مستخدم — {{ store.activeUsers }} نشط</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline font-ar" @click="exportUsers">
          <AppIcon name="Download" :size="15" /> تصدير CSV
        </button>
        <button class="btn btn-primary font-ar" @click="openCreate">
          <AppIcon name="UserPlus" :size="15" /> مستخدم جديد
        </button>
      </div>
    </div>

    <div class="table-card">
      <FilterBar
        v-model="searchQ"
        v-model:filters="filters"
        placeholder="بحث بالاسم أو البريد..."
        :chips="filterChips"
      />

      <DataTable
        :columns="(columns as unknown as Column<Record<string, unknown>>[])"
        :rows="(filteredUsers as unknown as Record<string, unknown>[])"
        :selectable="true"
        :loading="store.loading"
        :page-size="10"
        empty-text="لا يوجد مستخدمون مطابقون للبحث"
      >
        <template #cell-name="{ row }">
          <div class="user-cell">
            <div class="mini-avatar font-ar">{{ (row as unknown as User).name?.slice(0,1) }}</div>
            <span class="font-ar">{{ (row as unknown as User).name }}</span>
          </div>
        </template>
        <template #cell-email="{ row }">
          <span class="font-en text-sm">{{ (row as unknown as User).email }}</span>
        </template>
        <template #cell-role="{ row }">
          <RoleBadge :role="(row as unknown as User).role" />
        </template>
        <template #cell-grade="{ row }">
          <span class="font-ar text-muted">{{ (row as unknown as User).grade || '—' }}</span>
        </template>
        <template #cell-createdAt="{ row }">
          <span class="font-ar text-muted">{{ formatDate((row as unknown as User).createdAt) }}</span>
        </template>
        <template #actions="{ row }">
          <div class="action-btns">
            <button class="action-btn" title="تعديل" @click="openEdit(row as unknown as User)">
              <AppIcon name="Pencil" :size="14" />
            </button>
            <button class="action-btn" title="تعيين كلمة مرور" @click="doResetPassword(row as unknown as User)">
              <AppIcon name="KeyRound" :size="14" />
            </button>
            <button class="action-btn" :title="(row as unknown as {banned?:boolean}).banned ? 'رفع الحظر' : 'حظر'" @click="askBan(row as unknown as User & {banned?:boolean})">
              <AppIcon :name="(row as unknown as {banned?:boolean}).banned ? 'UserCheck' : 'UserX'" :size="14" />
            </button>
            <button class="action-btn" title="دخول كهذا المستخدم" @click="doImpersonate(row as unknown as User)">
              <AppIcon name="LogIn" :size="14" />
            </button>
            <button class="action-btn action-btn--danger" title="حذف" @click="askDelete(row as unknown as User)">
              <AppIcon name="Trash2" :size="14" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Modals -->
    <UserForm :open="showForm" :edit-user="editUser" @close="showForm = false" @save="handleSave" />

    <ConfirmDialog
      :open="confirmDelete.open"
      title="حذف المستخدم"
      :message="`هل تريد حذف '${confirmDelete.name}' نهائياً؟ لا يمكن التراجع.`"
      confirm-label="حذف"
      :danger="true"
      @confirm="doDelete"
      @cancel="confirmDelete.open = false"
    />

    <ConfirmDialog
      :open="confirmBan.open"
      :title="confirmBan.banned ? 'رفع الحظر' : 'حظر المستخدم'"
      :message="`هل تريد ${confirmBan.banned ? 'رفع الحظر عن' : 'حظر'} '${confirmBan.name}'؟`"
      :confirm-label="confirmBan.banned ? 'رفع الحظر' : 'حظر'"
      :danger="!confirmBan.banned"
      @confirm="doBan"
      @cancel="confirmBan.open = false"
    />
  </div>
</template>

<style scoped>
.admin-users { display: flex; flex-direction: column; gap: var(--space-lg); }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md); }
.page-header h2 { font-size: var(--text-h2); color: var(--text-primary); }
.page-sub { color: var(--text-muted); font-size: 0.875rem; margin-top: 4px; }
.header-actions { display: flex; gap: var(--space-sm); flex-wrap: wrap; }

.table-card { background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); overflow: hidden; }

.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem; border-radius: var(--radius-md); border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all var(--duration-fast); }
.btn-primary { background: var(--color-navy); color: #fff; }
.btn-primary:hover { background: var(--color-navy-light); }
.btn-outline { background: none; border: 1.5px solid var(--border-color); color: var(--text-secondary); }
.btn-outline:hover { border-color: var(--color-navy); color: var(--color-navy); }

.user-cell { display: flex; align-items: center; gap: 0.5rem; }
.mini-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--gradient-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
.text-sm { font-size: 0.8125rem; }
.text-muted { color: var(--text-muted); font-size: 0.8125rem; }

.action-btns { display: flex; gap: 0.25rem; justify-content: center; }
.action-btn { width: 28px; height: 28px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: none; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; transition: all var(--duration-fast); }
.action-btn:hover { background: var(--bg-section); color: var(--text-primary); border-color: var(--color-navy); }
.action-btn--danger:hover { border-color: var(--color-error); color: var(--color-error); }
</style>
