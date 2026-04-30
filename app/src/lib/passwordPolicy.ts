export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSymbol: boolean;
  maxAgeDays: number;
}

/** Returns Arabic error message or null if valid */
export function validatePasswordAgainstPolicy(password: string, p: PasswordPolicy): string | null {
  if (password.length < p.minLength) {
    return `كلمة المرور يجب أن تكون ${p.minLength} أحرف على الأقل`;
  }
  if (p.requireUppercase && !/[A-Z]/.test(password)) {
    return 'يجب أن تحتوي كلمة المرور على حرف إنجليزي كبير واحد على الأقل';
  }
  if (p.requireNumber && !/\d/.test(password)) {
    return 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل';
  }
  if (p.requireSymbol && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل';
  }
  return null;
}
