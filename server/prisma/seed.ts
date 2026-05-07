import 'dotenv/config';
import { PrismaClient, type Role } from '@prisma/client';
import { hashPassword } from '../src/lib/password.js';
import { bootstrapCatalogFromFixturesIfEmpty } from '../src/lib/catalog-content.js';
import { bootstrapQuizzesSnapshotIfEmpty } from '../src/lib/quiz-content.js';

const prisma = new PrismaClient();

/** يطابق `PERMISSIONS` في الواجهة + مصفوفة RolePermission للأدوار */
async function seedPermissionsAndRoleGrants() {
  const definitions: { code: string; description: string }[] = [
    { code: 'users:read', description: 'عرض المستخدمين' },
    { code: 'users:write', description: 'إنشاء وتعديل المستخدمين' },
    { code: 'users:delete', description: 'حذف المستخدمين' },
    { code: 'content:read', description: 'قراءة المحتوى' },
    { code: 'content:write', description: 'تعديل المحتوى' },
    { code: 'content:delete', description: 'حذف المحتوى' },
    { code: 'analytics:read', description: 'لوحات التحليلات' },
    { code: 'settings:write', description: 'تعديل إعدادات المنصة' },
    { code: 'billing:read', description: 'عرض الفوترة' },
    { code: 'audit:read', description: 'سجل التدقيق' }
  ];

  for (const d of definitions) {
    await prisma.permission.upsert({
      where: { code: d.code },
      create: d,
      update: { description: d.description }
    });
  }

  const allPerms = await prisma.permission.findMany();
  const idByCode = new Map(allPerms.map((p) => [p.code, p.id] as const));

  await prisma.rolePermission.deleteMany({});

  const rows: { role: Role; codes: string[] }[] = [
    { role: 'student', codes: [] },
    {
      role: 'teacher',
      codes: ['content:read', 'content:write', 'analytics:read']
    },
    {
      role: 'admin',
      codes: [
        'users:read',
        'users:write',
        'users:delete',
        'content:read',
        'content:write',
        'content:delete',
        'analytics:read',
        'settings:write',
        'billing:read',
        'audit:read'
      ]
    },
    { role: 'super_admin', codes: allPerms.map((p) => p.code) }
  ];

  for (const { role, codes } of rows) {
    await prisma.rolePermission.createMany({
      data: codes
        .map((code) => {
          const permissionId = idByCode.get(code);
          return permissionId ? { role, permissionId } : null;
        })
        .filter((x): x is { role: Role; permissionId: string } => x !== null)
    });
  }

  console.log('Seeded Permission + RolePermission matrix.');
}

async function main() {
  await seedPermissionsAndRoleGrants();
  const email = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@edunor.local').trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD || 'EduNorSuper2026!';

  const existing = await prisma.user.findUnique({ where: { email } });
  const hash = await hashPassword(password);

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hash,
        role: 'super_admin',
        name: 'مدير النظام',
        banned: false
      }
    });
    console.log('Updated super admin:', email);
  } else {
    await prisma.user.create({
      data: {
        email,
        name: 'مدير النظام',
        passwordHash: hash,
        role: 'super_admin'
      }
    });
    console.log('Created super admin:', email);
  }

  const demoAdmin = 'admin@edunor.local';
  if (!(await prisma.user.findUnique({ where: { email: demoAdmin } }))) {
    await prisma.user.create({
      data: {
        email: demoAdmin,
        name: 'أحمد المدير',
        passwordHash: await hashPassword('AdminDemo2026!'),
        role: 'admin',
        permissionsJson: JSON.stringify(['content:read', 'content:write'])
      }
    });
    console.log('Created demo admin:', demoAdmin, '/ AdminDemo2026!');
  }

  const bootedCatalog = await bootstrapCatalogFromFixturesIfEmpty();
  if (bootedCatalog) console.log('Seeded relational catalog + admin content snapshot from fixtures.');
  const bootedQuizzes = await bootstrapQuizzesSnapshotIfEmpty();
  if (bootedQuizzes) console.log('Seeded quizzes snapshot from generated/quizzes.snapshot.json.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
