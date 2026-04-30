import type { User, UserRole } from '@/types/auth';
import { PERMISSIONS } from '@/lib/permissions';

/** مستخدمون وهميون للوضع المحلي بدون API — لا يُستخدم في الإنتاج الحقيقي */
export function seedDemoAdminUsers(): User[] {
  return [
    {
      id: 'user_super_admin',
      name: 'مدير النظام',
      email: 'superadmin@edunor.local',
      role: 'super_admin',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'u_admin_1',
      name: 'أحمد المدير',
      email: 'admin@edunor.local',
      role: 'admin',
      permissions: [PERMISSIONS.CONTENT_READ, PERMISSIONS.CONTENT_WRITE],
      grade: undefined,
      createdAt: '2026-01-15T00:00:00.000Z'
    },
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `u_student_${i + 1}`,
      name: [
        'محمد علي',
        'فاطمة حسن',
        'يوسف إبراهيم',
        'مريم أحمد',
        'عمر خالد',
        'نور محمود',
        'سارة عبدالله',
        'أيمن رضا',
        'دينا سامي',
        'كريم وليد'
      ][i],
      email: `student${i + 1}@example.com`,
      role: 'student' as UserRole,
      grade: [
        'الصف الأول الثانوي',
        'الصف الثاني الثانوي',
        'الصف الثالث الثانوي',
        'الصف الأول الإعدادي',
        'الصف الثالث الإعدادي'
      ][i % 5],
      createdAt: new Date(2026, 1, i + 1).toISOString(),
      banned: false
    }))
  ];
}
