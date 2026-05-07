import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserRole } from '@/types/auth';
import {
  clearRemoteAuditLogs,
  fetchAuditLogs,
  postAuditLog
} from '@/services/adminSystemService';
import { getApiBase } from '@/services/http/client';

export interface AuditEntry {
  id: string;
  actor: { id: string; name: string; role: UserRole | 'guest' | 'system' };
  action: string;
  target?: { type: string; id?: string; label?: string; path?: string; method?: string };
  meta?: Record<string, unknown>;
  severity?: string;
  category?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

const STORAGE_KEY = 'edunor.admin.audit';
const MAX_ENTRIES = 1000;

function readStorage(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(entries: AuditEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

export const useAdminAuditStore = defineStore('adminAudit', () => {
  const logs = ref<AuditEntry[]>(readStorage());

  async function fetchLogs() {
    if (!getApiBase()) {
      logs.value = readStorage();
      return;
    }
    const remote = await fetchAuditLogs();
    if (remote) logs.value = remote;
  }

  function log(entry: Omit<AuditEntry, 'id' | 'createdAt'>) {
    if (getApiBase()) {
      void postAuditLog(entry.action, entry.target, entry.meta);
      return;
    }
    const newEntry: AuditEntry = {
      ...entry,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString()
    };
    logs.value.unshift(newEntry);
    if (logs.value.length > MAX_ENTRIES) {
      logs.value = logs.value.slice(0, MAX_ENTRIES);
    }
    writeStorage(logs.value);
  }

  function clear() {
    logs.value = [];
    if (!getApiBase()) writeStorage([]);
    else void clearRemoteAuditLogs();
  }

  function exportLogs(): AuditEntry[] {
    return [...logs.value];
  }

  return { logs, fetchLogs, log, clear, exportLogs };
});
