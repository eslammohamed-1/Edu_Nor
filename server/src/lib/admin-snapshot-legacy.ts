/**
 * مصدر الحقيقة الحالي للاختبارات والإعدادات يبقى `AdminSnapshot` (`content` | `quizzes` | `settings`)
 * إلى أن تكتمل مزامنة U3/U4. احتفظ باللقطات في DB كمسار رجوع (~30 يوم) بعد تهيئة الجداول العلائقية.
 *
 * عند حذف أو تعطيل اللقطات: تأكد من وجود نسخة احتياطية أو أن البيانات منسوخة إلى
 * جداول `Quiz` / `Setting` (U1) قبل الإزالة.
 *
 * للرجوع المؤقت للقراءة فقط: استخدم واجهة سوبر أدمن للّقطات أو `GET /api/v1/admin/snapshots/:key`;
 * الجداول العلائقية للاختبارات تُملأ عبر `npm run migrate:quizzes` من لقطة `quizzes`.
 */

export const ADMIN_SNAPSHOT_KEYS = ['content', 'quizzes', 'settings'] as const;
