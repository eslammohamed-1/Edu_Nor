import { audit } from '@/lib/audit';
import {
  currentAuthStorageMode,
  readStoredAuth,
  writeStoredAuth,
  type StoredAuthPayload
} from '@/lib/authStorage';
import { getApiBase } from '@/services/http/client';
import { impersonateRemote } from '@/services/adminSystemService';

const ORIGIN_KEY = 'edunor.impersonate.origin';
const MODE_KEY = 'edunor.impersonate.mode';

export function useImpersonate() {
  async function start(targetUserId: string, targetUserName: string) {
    const current = readStoredAuth();
    if (!current) return;

    sessionStorage.setItem(ORIGIN_KEY, JSON.stringify(current));
    sessionStorage.setItem(MODE_KEY, currentAuthStorageMode());

    let targetSession: StoredAuthPayload | null = null;
    if (getApiBase()) {
      targetSession = await impersonateRemote(targetUserId);
    } else {
      targetSession = {
        user: {
          id: targetUserId,
          name: targetUserName,
          email: `${targetUserId}@mock.local`,
          role: 'student',
          createdAt: new Date().toISOString()
        },
        token: 'impersonate_' + Math.random().toString(36).slice(2)
      };
    }
    if (!targetSession) return;
    writeStoredAuth(targetSession, false);
    audit('impersonate.start', { type: 'user', id: targetUserId, label: targetUserName });
    window.location.href = '/dashboard';
  }

  function stop() {
    const origin = sessionStorage.getItem(ORIGIN_KEY);
    if (!origin) return;
    const session = JSON.parse(origin) as StoredAuthPayload;
    audit('impersonate.stop', { type: 'user', id: session?.user?.id || '' });
    writeStoredAuth(session, sessionStorage.getItem(MODE_KEY) !== 'session');
    sessionStorage.removeItem(ORIGIN_KEY);
    sessionStorage.removeItem(MODE_KEY);
    window.location.href = '/admin';
  }

  const isImpersonating = !!sessionStorage.getItem(ORIGIN_KEY);

  return { start, stop, isImpersonating };
}
