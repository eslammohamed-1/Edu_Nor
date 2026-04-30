import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AdminSessionRow } from '@/types/adminSession';
import { seedDemoAdminSessions } from '@/fixtures/demo/adminSessions.seed';

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

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value));
  }

  const activeCount = computed(() => sessions.value.length);

  function revoke(id: string) {
    const row = sessions.value.find(s => s.id === id);
    if (row?.current) return false;
    sessions.value = sessions.value.filter(s => s.id !== id);
    persist();
    return true;
  }

  function refreshMockDevices() {
    sessions.value = seedDemoAdminSessions();
    persist();
  }

  return { sessions, activeCount, revoke, refreshMockDevices };
});
