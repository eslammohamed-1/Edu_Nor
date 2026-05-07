import crypto from 'node:crypto';

export const PASSWORD_MIN_LEN = 10;

export interface PasswordPolicyContext {
  email: string;
  name: string;
}

export interface PasswordPolicyResult {
  ok: boolean;
  errors: string[];
}

function hasUpper(p: string): boolean {
  return /[A-Z\u0600-\u06FF]/.test(p);
}

function hasDigit(p: string): boolean {
  return /\d/.test(p);
}

function hasSymbol(p: string): boolean {
  return /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p);
}

/** رفض إن وُجدت كلمات المرور الشائعة جداً في HIBP (k-anonymity) */
export async function isPasswordPossiblyBreached(password: string): Promise<boolean> {
  if (process.env.SKIP_BREACH_CHECK === '1' || process.env.SKIP_BREACH_CHECK === 'true') {
    return false;
  }
  const hash = crypto.createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5).toUpperCase();
  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' }
    });
    if (!res.ok) return false;
    const text = await res.text();
    for (const line of text.split('\n')) {
      const part = line.split(':')[0]?.trim();
      if (part && part.toUpperCase() === suffix) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function evaluatePasswordPolicy(
  password: string,
  ctx: PasswordPolicyContext
): Promise<PasswordPolicyResult> {
  const errors: string[] = [];
  if (!password || password.length < PASSWORD_MIN_LEN) {
    errors.push(`كلمة المرور يجب ألا تقل عن ${PASSWORD_MIN_LEN} أحرف`);
  }
  if (!hasUpper(password)) {
    errors.push('استخدم حرفاً كبيراً على الأقل');
  }
  if (!hasDigit(password)) {
    errors.push('استخدم رقماً واحداً على الأقل');
  }
  if (!hasSymbol(password)) {
    errors.push('استخدم رمزاً خاصاً واحداً على الأقل (!@#$…)');
  }

  const emailLocal = ctx.email.split('@')[0]?.toLowerCase() ?? '';
  const nameNorm = ctx.name.trim().toLowerCase().replace(/\s+/g, '');
  const pwLower = password.toLowerCase();
  if (emailLocal.length >= 3 && pwLower.includes(emailLocal)) {
    errors.push('لا تستخدم جزءاً من البريد في كلمة المرور');
  }
  if (nameNorm.length >= 3 && pwLower.includes(nameNorm)) {
    errors.push('لا تستخدم الاسم الكامل أو جزءاً كبيراً منه في كلمة المرور');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (await isPasswordPossiblyBreached(password)) {
    return { ok: false, errors: ['هذه كلمة مرور شائعة في تسريبات معروفة — اختر غيرها'] };
  }

  return { ok: true, errors: [] };
}
