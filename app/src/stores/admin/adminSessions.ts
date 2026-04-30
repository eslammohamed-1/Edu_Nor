import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AdminSessionRow } from '@/types/adminSession';
import { seedDemoAdminSessions } from '@/fixtures/demo/adminSessions.seed';
import { fetchAdminSessions, revokeAdminSession } from '@/services/adminSystemService';
import { getApiBase } from '@/services/http/client';

const STORAGE_KEY = 'edunor.admin.sessions';

function read(): AdminSessionRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AdminSessionRow[];
  } catch {}
  const initial = seedDemoAdminSessions();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export const useAdminSessionsStore = defineStore('adminSessions', () => {
  const sessions = ref<AdminSessionRow[]>(read());
  const loading = ref(false);

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value));
  }

  const activeCount = computed(() => sessions.value.length);

  async function fetchSessions() {
    if (!getApiBase()) {
      sessions.value = read();
      return;
    }
    loading.value = true;
    try {
      const remote = await fetchAdminSessions();
      if (remote) sessions.value = remote;
    } finally {
      loading.value = false;
    }
  }

  async function revoke(id: string) {
    const row = sessions.value.find(s => s.id === id);
    if (row?.current) return false;
    if (getApiBase()) {
      const ok = await revokeAdminSession(id);
      if (ok) await fetchSessions();
      return ok;
    }
    sessions.value = sessions.value.filter(s => s.id !== id);
    persist();
    return true;
  }

  function refreshMockDevices() {
    if (getApiBase()) {
      void fetchSessions();
      return;
    }
    sessions.value = seedDemoAdminSessions();
    persist();
  }

  return { sessions, loading, activeCount, fetchSessions, revoke, refreshMockDevices };
});
