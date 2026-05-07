#!/usr/bin/env node
/**
 * إعادة تعيين كلمة مرور سوبر الأدمن من سطر الأوامر (استرداد وصول).
 * التشغيل من جذر المستودع:
 *   cd server && npx tsx ../scripts/superadmin-reset.ts "NewSecurePass10!"
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(root, '../server/.env') });

const { prisma } = await import('../server/src/db.js');
const { hashPassword } = await import('../server/src/lib/password.js');
const { evaluatePasswordPolicy } = await import('../server/src/lib/passwordPolicy.js');

const newPass = process.argv[2];
const email = (process.env.SUPER_ADMIN_EMAIL ?? 'superadmin@edunor.local').trim().toLowerCase();

if (!newPass) {
  console.error('الاستخدام: npx tsx scripts/superadmin-reset.ts "<كلمة المرور الجديدة>"');
  process.exit(1);
}

const user = await prisma.user.findUnique({ where: { email } });
if (!user) {
  console.error('لا يوجد مستخدم بهذا البريد:', email);
  process.exit(1);
}

const pol = await evaluatePasswordPolicy(newPass, { email: user.email, name: user.name });
if (!pol.ok) {
  console.error('سياسة كلمة المرور:', pol.errors.join(' — '));
  process.exit(1);
}

const passwordHash = await hashPassword(newPass);
await prisma.user.update({
  where: { id: user.id },
  data: { passwordHash, role: 'super_admin' }
});

await prisma.auditLog.create({
  data: {
    actorName: 'CLI',
    actorRole: 'system',
    action: 'security.superadmin_password.cli_reset',
    actorId: null,
    targetJson: JSON.stringify({ type: 'user', id: user.id, label: email })
  }
});

console.log('تم تحديث كلمة مرور السوبر أدمن وكُتب سجل تدقيق.');
await prisma.$disconnect();
