import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, UserRole } from '@/types/auth';
import { audit } from '@/lib/audit';
import { PERMISSIONS } from '@/lib/permissions';

const STORAGE_KEY = 'edunor.admin.users';

function seed(): User[] {
  return [
    {
      id: 'user_super_admin', name: 'مدير النظام', email: 'superadmin@edunor.local',
      role: 'super_admin', createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'u_admin_1', name: 'أحمد المدير', email: 'admin@edunor.local',
      role: 'admin', permissions: [PERMISSIONS.CONTENT_READ, PERMISSIONS.CONTENT_WRITE],
      grade: undefined, createdAt: '2026-01-15T00:00:00.000Z'
    },
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `u_student_${i + 1}`,
      name: ['محمد علي', 'فاطمة حسن', 'يوسف إبراهيم', 'مريم أحمد', 'عمر خالد',
             'نور محمود', 'سارة عبدالله', 'أيمن رضا', 'دينا سامي', 'كريم وليد'][i],
      email: `student${i + 1}@example.com`,
      role: 'student' as UserRole,
      grade: ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي',
              'الصف الأول الإعدادي', 'الصف الثالث الإعدادي'][i % 5],
      createdAt: new Date(2026, 1, i + 1).toISOString(),
      banned: false
    }))
  ];
}

interface AdminUser extends User {
  banned?: boolean;
}

function readStorage(): AdminUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seed();
  } catch {
    return seed();
  }
}

function writeStorage(users: AdminUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export const useAdminUsersStore = defineStore('adminUsers', () => {
  const users = ref<AdminUser[]>(readStorage());
  const loading = ref(false);

  const totalUsers = computed(() => users.value.length);
  const activeUsers = computed(() => users.value.filter(u => !u.banned).length);

  function save() { writeStorage(users.value); }

  function createUser(payload: Omit<AdminUser, 'id' | 'createdAt'>): AdminUser {
    const u: AdminUser = {
      ...payload,
      id: 'u_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    users.value.unshift(u);
    save();
    audit('user.create', { type: 'user', id: u.id, label: u.name });
    return u;
  }

  function updateUser(id: string, updates: Partial<AdminUser>) {
    const idx = users.value.findIndex(u => u.id === id);
    if (idx === -1) return;
    users.value[idx] = { ...users.value[idx], ...updates };
    save();
    audit('user.update', { type: 'user', id, label: users.value[idx].name });
  }

  function deleteUser(id: string) {
    const u = users.value.find(u => u.id === id);
    users.value = users.value.filter(u => u.id !== id);
    save();
    audit('user.delete', { type: 'user', id, label: u?.name });
  }

  function changeRole(id: string, role: UserRole) {
    const idx = users.value.findIndex(u => u.id === id);
    if (idx === -1) return;
    users.value[idx].role = role;
    save();
    audit('user.roleChange', { type: 'user', id, label: users.value[idx].name }, { role });
  }

  function updatePermissions(id: string, permissions: string[]) {
    const idx = users.value.findIndex(u => u.id === id);
    if (idx === -1) return;
    users.value[idx].permissions = permissions;
    save();
    audit('user.permissionsUpdate', { type: 'user', id, label: users.value[idx].name });
  }

  function toggleBan(id: string) {
    const idx = users.value.findIndex(u => u.id === id);
    if (idx === -1) return;
    const banned = !users.value[idx].banned;
    users.value[idx].banned = banned;
    save();
    audit(banned ? 'user.ban' : 'user.unban', { type: 'user', id, label: users.value[idx].name });
  }

  function resetPassword(id: string) {
    const u = users.value.find(u => u.id === id);
    audit('user.resetPassword', { type: 'user', id, label: u?.name });
  }

  function getById(id: string): AdminUser | undefined {
    return users.value.find(u => u.id === id);
  }

  return {
    users, loading, totalUsers, activeUsers,
    createUser, updateUser, deleteUser, changeRole,
    updatePermissions, toggleBan, resetPassword, getById
  };
});
