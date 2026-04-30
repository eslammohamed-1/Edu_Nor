import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password.js';
import { bootstrapCatalogFromFixturesIfEmpty } from '../src/lib/catalog-content.js';
import { bootstrapQuizzesSnapshotIfEmpty } from '../src/lib/quiz-content.js';

const prisma = new PrismaClient();

async function main() {
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
