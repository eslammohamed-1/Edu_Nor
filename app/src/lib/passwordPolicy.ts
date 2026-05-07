/** مرآة قواعد السيرفر — للتلميح الفوري فقط (السيرفر هو الحَكم النهائي). */
export const PASSWORD_MIN_LEN = 10;

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSymbol: boolean;
  maxAgeDays: number;
}

export function passwordPolicyHints(password: string, email: string, name: string): string[] {
  const p = password;
  const hints: string[] = [];
  if (p.length > 0 && p.length < PASSWORD_MIN_LEN) {
    hints.push(`الحد الأدنى ${PASSWORD_MIN_LEN} أحرف`);
  }
  if (p.length > 0 && !/[A-Z\u0600-\u06FF]/.test(p)) {
    hints.push('أضف حرفاً كبيراً');
  }
  if (p.length > 0 && !/\d/.test(p)) {
    hints.push('أضف رقماً واحداً');
  }
  if (
    p.length > 0 &&
    !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p)
  ) {
    hints.push('أضف رمزاً خاصاً');
  }
  const local = email.split('@')[0]?.toLowerCase() ?? '';
  const nameNorm = name.trim().toLowerCase().replace(/\s+/g, '');
  const pl = p.toLowerCase();
  if (local.length >= 3 && pl.includes(local)) {
    hints.push('تجنّب جزء البريد داخل كلمة المرور');
  }
  if (nameNorm.length >= 3 && pl.includes(nameNorm)) {
    hints.push('تجنّب الاسم الكامل في كلمة المرور');
  }
  return hints;
}

/** للنماذج: يُرجع رسالة خطأ أو null */
export function validatePasswordAgainstPolicy(
  password: string,
  policy: PasswordPolicy,
  ctx: { email?: string; name?: string } = {}
): string | null {
  const minLen = Math.max(policy.minLength ?? 8, PASSWORD_MIN_LEN);
  if (!password || password.length < minLen) {
    return `كلمة المرور يجب ألا تقل عن ${minLen} أحرف`;
  }
  const hints = passwordPolicyHints(password, ctx.email ?? '', ctx.name ?? '');
  return hints.length ? hints[0]! : null;
}
