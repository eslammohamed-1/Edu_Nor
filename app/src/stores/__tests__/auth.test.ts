import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { User } from '@/types/auth';

vi.mock('@/services/http/client', () => ({
  apiLogoutRefresh: vi.fn(() => Promise.resolve()),
  getApiBase: vi.fn(() => 'http://api.test')
}));

vi.mock('@/services/authService', () => ({
  loginRemote: vi.fn(),
  registerRemote: vi.fn(),
  verifyTwoFactorRemote: vi.fn()
}));

import { AUTH_STORAGE_KEY } from '@/lib/authStorage';
import { apiLogoutRefresh, getApiBase } from '@/services/http/client';
import {
  loginRemote,
  registerRemote,
  verifyTwoFactorRemote
} from '@/services/authService';
import { useAuthStore } from '@/stores/auth';

const student: User = {
  id: 'u1',
  name: 'Student',
  email: 'student@example.com',
  role: 'student',
  createdAt: '2026-01-01T00:00:00.000Z',
  onboardingCompleted: false
};

function resetStore() {
  setActivePinia(createPinia());
  vi.mocked(getApiBase).mockReturnValue('http://api.test');
  vi.mocked(loginRemote).mockReset();
  vi.mocked(registerRemote).mockReset();
  vi.mocked(verifyTwoFactorRemote).mockReset();
  vi.mocked(apiLogoutRefresh).mockClear();
  return useAuthStore();
}

describe('auth store', () => {
  beforeEach(() => {
    resetStore();
  });

  it('hydrates a stored session', () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ user: student, token: 'stored-token' })
    );
    const auth = useAuthStore();

    auth.hydrate();

    expect(auth.user?.email).toBe('student@example.com');
    expect(auth.token).toBe('stored-token');
    expect(auth.isAuthenticated).toBe(true);
  });

  it('logs in with a remote session and persists it', async () => {
    const auth = useAuthStore();
    vi.mocked(loginRemote).mockResolvedValue({
      kind: 'session',
      session: { user: student, token: 'access-token' }
    });

    await expect(
      auth.login({ email: 'student@example.com', password: 'password', remember: true })
    ).resolves.toBe(true);

    expect(auth.user?.id).toBe('u1');
    expect(auth.token).toBe('access-token');
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? '{}')).toMatchObject({
      token: 'access-token'
    });
  });

  it('returns twofa and stores the pending ticket', async () => {
    const auth = useAuthStore();
    vi.mocked(loginRemote).mockResolvedValue({
      kind: 'twofa',
      twoFactorTicket: 'ticket-1'
    });

    await expect(auth.login({ email: 's@example.com', password: 'password' })).resolves.toBe(
      'twofa'
    );

    expect(sessionStorage.getItem('edunor_2fa_ticket')).toBe('ticket-1');
    expect(auth.isAuthenticated).toBe(false);
  });

  it('completes two-factor login and clears the ticket', async () => {
    const auth = useAuthStore();
    sessionStorage.setItem('edunor_2fa_ticket', 'ticket-1');
    vi.mocked(verifyTwoFactorRemote).mockResolvedValue({
      user: student,
      token: 'twofa-token'
    });

    await expect(auth.completeTwoFactor('123456')).resolves.toBe(true);

    expect(verifyTwoFactorRemote).toHaveBeenCalledWith('ticket-1', '123456');
    expect(sessionStorage.getItem('edunor_2fa_ticket')).toBeNull();
    expect(auth.token).toBe('twofa-token');
  });

  it('registers a remote user and marks the session authenticated', async () => {
    const auth = useAuthStore();
    vi.mocked(registerRemote).mockResolvedValue({ user: student, token: 'register-token' });

    await expect(
      auth.register({
        name: 'Student',
        email: 'student@example.com',
        phone: '01000000000',
        password: 'strong-password',
        confirmPassword: 'strong-password',
        stage: 'secondary',
        grade: 'الصف الثالث الثانوي',
        secondaryTrack: 'literary'
      })
    ).resolves.toBe(true);

    expect(auth.isAuthenticated).toBe(true);
    expect(auth.token).toBe('register-token');
  });

  it('logs out remotely and clears local session', async () => {
    const auth = useAuthStore();
    vi.mocked(loginRemote).mockResolvedValue({
      kind: 'session',
      session: { user: student, token: 'access-token' }
    });
    await auth.login({ email: 'student@example.com', password: 'password' });

    await auth.logout();

    expect(apiLogoutRefresh).toHaveBeenCalledOnce();
    expect(auth.user).toBeNull();
    expect(auth.token).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
