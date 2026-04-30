const STORAGE_KEY = 'edunor.loginThrottle';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;
const LOCKOUT_MS = 60_000;

interface Bundle {
  attempts: number[];
  lockedUntil?: number;
}

function read(): Bundle {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { attempts: [] };
    return JSON.parse(raw) as Bundle;
  } catch {
    return { attempts: [] };
  }
}

function write(b: Bundle) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(b));
}

/** Milliseconds remaining for lockout, or 0 if allowed */
export function getLoginLockoutRemainingMs(): number {
  const b = read();
  const now = Date.now();
  if (b.lockedUntil && now < b.lockedUntil) {
    return b.lockedUntil - now;
  }
  if (b.lockedUntil && now >= b.lockedUntil) {
    write({ attempts: [] });
  }
  return 0;
}

export function recordFailedLoginAttempt(): void {
  const now = Date.now();
  let b = read();
  if (b.lockedUntil && now < b.lockedUntil) return;

  b.attempts = b.attempts.filter(t => now - t < WINDOW_MS);
  b.attempts.push(now);

  if (b.attempts.length >= MAX_ATTEMPTS) {
    b.lockedUntil = now + LOCKOUT_MS;
    b.attempts = [];
  }
  write(b);
}

export function clearLoginThrottle(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
