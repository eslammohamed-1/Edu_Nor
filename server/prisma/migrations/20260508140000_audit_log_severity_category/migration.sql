-- U2-021: أعمدة تصنيف سجل التدقيق + القيم الافتراضية للصفوف القديمة
ALTER TABLE "AuditLog" ADD COLUMN "severity" TEXT NOT NULL DEFAULT 'info';
ALTER TABLE "AuditLog" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'admin';
