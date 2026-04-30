import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, UserRole } from '@/types/auth';
import { audit } from '@/lib/audit';
import { getApiBase } from '@/services/http/client';
import {
  type AdminUser,
  fetchAdminUsers,
  createAdminUser as postAdminUser,
  patchAdminUser,
  deleteAdminUser,
  patchAdminUserRole,
  patchAdminUserPermissions,
  patchAdminUserBanned,
  patchAdminUserPassword
} from '@/services/adminUsersService';
import { seedDemoAdminUsers } from '@/fixtures/demo/adminUsers.seed';

const STORAGE_KEY = 'edunor.admin.users';

function seed(): User[] {
  return seedDemoAdminUsers();
}

function readStorage(): AdminUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seed();
  } catch {
    return seed();
  }
}

function writeStorage(list: AdminUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export const useAdminUsersStore = defineStore('adminUsers', () => {
  const apiEnabled = !!getApiBase();
  const users = ref<AdminUser[]>(apiEnabled ? [] : readStorage());
  const loading = ref(false);

  const totalUsers = computed(() => users.value.length);
  const activeUsers = computed(() => users.value.filter(u => !u.banned).length);

  function saveLocalSnapshot() {
    if (getApiBase()) return;
    writeStorage(users.value);
  }

  async function fetchUsers(): Promise<void> {
    if (!getApiBase()) {
      users.value = readStorage();
      return;
    }
    loading.value = true;
    try {
      const list = await fetchAdminUsers();
      users.value = list ?? [];
    } catch {
      users.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function createUser(
    payload: Partial<AdminUser> & { password?: string }
  ): Promise<AdminUser | undefined> {
    if (getApiBase()) {
      const pwd = payload.password?.trim();
      if (!pwd || pwd.length < 8) {
        console.warn('كلمة المرور مطلوبة (٨ أحرف على الأقل) لمستخدم API');
        return undefined;
      }
      const body: Record<string, unknown> = {
        name: payload.name,
        email: payload.email,
        password: pwd,
        role: payload.role ?? 'student',
        banned: payload.banned ?? false
      };
      if (payload.grade) body.grade = payload.grade;
      if (payload.phone) body.phone = payload.phone;
      if (payload.stage) body.stage = payload.stage;
      if (payload.secondaryTrack) body.secondaryTrack = payload.secondaryTrack;
      if (payload.permissions?.length) body.permissions = payload.permissions;

      const dataUser = await postAdminUser(body);
      if (!dataUser) return undefined;
      audit('user.create', { type: 'user', id: dataUser.id, label: dataUser.name });
      await fetchUsers();
      return dataUser;
    }

    const u: AdminUser = {
      ...(payload as AdminUser),
      id: 'u_' + Date.now(),
      name: payload.name || '',
      email: payload.email || '',
      role: (payload.role ?? 'student') as UserRole,
      createdAt: new Date().toISOString()
    };
    users.value.unshift(u);
    saveLocalSnapshot();
    audit('user.create', { type: 'user', id: u.id, label: u.name });
    return u;
  }

  async function updateUser(id: string, updates: Partial<AdminUser> & { password?: string }) {
    if (getApiBase()) {
      const body: Record<string, unknown> = {};
      if (updates.name !== undefined) body.name = updates.name;
      if (updates.email !== undefined) body.email = updates.email;
      if (updates.password?.trim()) body.password = updates.password.trim();
      if (updates.role !== undefined) body.role = updates.role;
      if (updates.grade !== undefined) body.grade = updates.grade || null;
      if (updates.phone !== undefined) body.phone = updates.phone;
      if (updates.stage !== undefined) body.stage = updates.stage;
      if (updates.secondaryTrack !== undefined) body.secondaryTrack = updates.secondaryTrack;
      if (updates.banned !== undefined) body.banned = updates.banned;
      if (updates.permissions !== undefined) body.permissions = updates.permissions;

      const ok = await patchAdminUser(id, body);
      if (!ok) return;
      const row = users.value.find(u => u.id === id);
      audit('user.update', { type: 'user', id, label: row?.name ?? id });
      await fetchUsers();
      return;
    }

    const idx = users.value.findIndex(u => u.id === id);
    if (idx === -1) return;
    users.value[idx] = { ...users.value[idx], ...updates };
    saveLocalSnapshot();
    audit('user.update', { type: 'user', id, label: users.value[idx].name });
  }

  async function deleteUser(id: string) {
    if (getApiBase()) {
      const row = users.value.find(u => u.id === id);
      const ok = await deleteAdminUser(id);
      if (!ok) return;
      audit('user.delete', { type: 'user', id, label: row?.name });
      await fetchUsers();
      return;
    }

    const u = users.value.find(u => u.id === id);
    users.value = users.value.filter(u => u.id !== id);
    saveLocalSnapshot();
    audit('user.delete', { type: 'user', id, label: u?.name });
  }

  async function changeRole(id: string, role: UserRole) {
    if (!getApiBase()) {
      const idx = users.value.findIndex(u => u.id === id);
      if (idx === -1) return;
      users.value[idx].role = role;
      saveLocalSnapshot();
      audit('user.roleChange', { type: 'user', id, label: users.value[idx].name }, { role });
      return;
    }
    const row = users.value.find(u => u.id === id);
    const ok = await patchAdminUserRole(id, role);
    if (!ok) return;
    audit('user.roleChange', { type: 'user', id, label: row?.name ?? id }, { role });
    await fetchUsers();
  }

  async function updatePermissions(id: string, permissions: string[]) {
    if (!getApiBase()) {
      const idx = users.value.findIndex(u => u.id === id);
      if (idx === -1) return;
      users.value[idx].permissions = permissions;
      saveLocalSnapshot();
      audit('user.permissionsUpdate', { type: 'user', id, label: users.value[idx].name });
      return;
    }
    const row = users.value.find(u => u.id === id);
    const ok = await patchAdminUserPermissions(id, permissions);
    if (!ok) return;
    audit('user.permissionsUpdate', { type: 'user', id, label: row?.name ?? id });
    await fetchUsers();
  }

  async function toggleBan(id: string) {
    const idx = users.value.findIndex(u => u.id === id);
    if (idx === -1) return;
    const row = users.value[idx];
    const banned = !row.banned;
    if (!getApiBase()) {
      users.value[idx] = { ...row, banned };
      saveLocalSnapshot();
      audit(banned ? 'user.ban' : 'user.unban', { type: 'user', id, label: row.name });
      return;
    }
    const ok = await patchAdminUserBanned(id, banned);
    if (!ok) return;
    audit(banned ? 'user.ban' : 'user.unban', { type: 'user', id, label: row.name });
    await fetchUsers();
  }

  async function resetPassword(id: string): Promise<string | undefined> {
    const row = users.value.find(u => u.id === id);
    audit('user.resetPassword', { type: 'user', id, label: row?.name });
    if (!getApiBase()) return undefined;

    const temp = `Tmp_${Math.random().toString(36).slice(2, 10)}Aa1`;
    const ok = await patchAdminUserPassword(id, temp);
    if (!ok) return undefined;
    await fetchUsers();
    return temp;
  }

  function getById(id: string): AdminUser | undefined {
    return users.value.find(u => u.id === id);
  }

  return {
    users,
    loading,
    totalUsers,
    activeUsers,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    changeRole,
    updatePermissions,
    toggleBan,
    resetPassword,
    getById
  };
});
