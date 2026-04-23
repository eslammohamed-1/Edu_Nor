import { audit } from '@/lib/audit';

export function useImpersonate() {
  function start(targetUserId: string, targetUserName: string) {
    // Save current super admin session
    const current = localStorage.getItem('edunor_auth');
    if (!current) return;

    localStorage.setItem('edunor.impersonate.origin', current);

    // Create a mock session for the target user
    const targetSession = {
      user: {
        id: targetUserId,
        name: targetUserName,
        email: `${targetUserId}@mock.local`,
        role: 'student',
        createdAt: new Date().toISOString()
      },
      token: 'impersonate_' + Math.random().toString(36).slice(2)
    };
    localStorage.setItem('edunor_auth', JSON.stringify(targetSession));
    audit('impersonate.start', { type: 'user', id: targetUserId, label: targetUserName });
    window.location.href = '/dashboard';
  }

  function stop() {
    const origin = localStorage.getItem('edunor.impersonate.origin');
    if (!origin) return;
    const session = JSON.parse(origin);
    audit('impersonate.stop', { type: 'user', id: session?.user?.id || '' });
    localStorage.setItem('edunor_auth', origin);
    localStorage.removeItem('edunor.impersonate.origin');
    window.location.href = '/admin';
  }

  const isImpersonating = !!localStorage.getItem('edunor.impersonate.origin');

  return { start, stop, isImpersonating };
}
