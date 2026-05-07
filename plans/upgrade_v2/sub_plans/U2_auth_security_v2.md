# U2 — Auth & Security V2 | المصادقة والأمان نسخة ٢

## 🎯 الهدف

سدّ الثغرات الأمنية الحالية وتحويل تجربة الدخول لـ **مستوى منتج إنتاجي**: استرداد كلمة سر، 2FA لـ super_admin، lockout ذكي، helmet + CSP، RBAC أدق، CSRF token صريح للنماذج الحساسة.

---

## 🧱 المهام

### 2.1 — Forgot/Reset Password (نهاية إلى نهاية)
- جدول `PasswordResetToken` (id, userId, tokenHash, expiresAt, usedAt).
- endpoints:
  - `POST /api/v1/auth/forgot` — يقبل email؛ يولّد token صالح ساعة، يرسل email (في dev يلوغ فقط).
  - `POST /api/v1/auth/reset` — يقبل token + password جديد + confirm.
- صفحات الواجهة `ForgotPasswordPage.vue` و `ResetPasswordPage.vue`.
- email service interface (يبدأ بـ logger، لاحقاً SMTP/Resend).

### 2.2 — TOTP 2FA لـ super_admin
- dependency: `otpauth` أو `speakeasy`.
- جدول `UserTwoFactor` (userId PK, secret, enabled, recoveryCodesJson).
- endpoints:
  - `POST /api/v1/auth/2fa/setup` → يرجع otpauth URI + QR.
  - `POST /api/v1/auth/2fa/enable` → يتحقق من code + recovery codes.
  - `POST /api/v1/auth/2fa/verify` → بعد login إذا 2FA مفعل.
  - `POST /api/v1/auth/2fa/disable` → يحتاج كلمة سر.
- تعديل `/login`: لو user.twoFactor.enabled رد بـ `{ requires2fa: true, ticket }`.
- صفحة `TwoFactorPage.vue` في الواجهة.

### 2.3 — Account Lockout بعد محاولات فاشلة
- جدول `LoginAttempt` (id, email, ip, success, createdAt).
- منطق: ٥ محاولات فاشلة في ١٥ دقيقة لنفس email → lock ٣٠ دقيقة، رد 423 Locked.
- إشعار في audit log.

### 2.4 — Password Policy V2
- module `server/src/lib/passwordPolicy.ts`:
  - min 10 chars
  - حرف كبير + رقم + رمز
  - مفيش substring من email/name
  - فحص ضد breach list (k-anonymity، API of `haveibeenpwned`).
- تطبيق على `/register`, `/reset`, `/admin/users` create/update.
- نفس policy على الواجهة (مرآة) لرسائل خطأ فورية.

### 2.5 — Helmet + CSP
- dependency: `@fastify/helmet`.
- CSP صارمة: `default-src 'self'`، `script-src 'self'`، `img-src 'self' data: https:`، `connect-src` للـ API.
- تعطيل CSP في dev فقط لو لزم.
- اختبار E2E يتأكد من headers.

### 2.6 — CSRF Token صريح للنماذج
- pattern: double-submit cookie + custom header `X-CSRF-Token`.
- middleware `requireCsrf` على mutations حساسة.
- helper في الواجهة يحقن header تلقائياً.

### 2.7 — RBAC Fine-grained + Teacher Role
- إضافة دور `teacher` في enum + types الواجهة.
- جدول `Permission` بقائمة موسّعة (e.g. `quiz:grade`, `class:manage`, `lesson:publish`).
- role-permissions matrix (default per role) في seed.
- `can(permission)` helper يمشي عبر role + per-user override.

### 2.8 — Audit Logger موسّع
- middleware يلتقط كل mutation تلقائياً (URL + method + actor + body summary).
- استبعاد passwords من المتقاط.
- إضافة `severity` و `category` للسجل.

### 2.9 — Recovery flow لـ super_admin
- CLI script `scripts/superadmin-reset.ts` يعمل reset لكلمة سر السوبر أدمن من السيرفر مباشرة (ضد فقدان الوصول).
- يطبع audit log واضح.

---

## ✅ Acceptance Criteria
- [ ] forgot → email log → reset → login جديدة شغّال.
- [ ] super_admin مع 2FA لازم يدخل OTP بعد كلمة المرور.
- [ ] ٥ محاولات خاطئة بترجع 423 + audit entry.
- [ ] CSP headers موجودة في الإنتاج، لا يوجد inline scripts.
- [ ] CSRF token مطلوب على POST /admin/* + اختبار سلبي.
- [ ] passwords ضعيفة مرفوضة مع رسائل واضحة.
- [ ] role `teacher` متاح في user form.

---

## 🔗 ملفات

```
server/prisma/schema.prisma           # PasswordResetToken, UserTwoFactor, LoginAttempt, Permission
server/src/routes/auth.ts             # forgot, reset, 2fa
server/src/lib/email.ts               # جديد
server/src/lib/passwordPolicy.ts      # جديد
server/src/lib/csrf.ts                # جديد
server/src/plugins/helmet.ts          # جديد
app/src/views/ForgotPasswordPage.vue  # ربط حقيقي
app/src/views/ResetPasswordPage.vue   # جديد
app/src/views/TwoFactorPage.vue       # جديد
app/src/lib/passwordPolicy.ts         # مرآة
app/src/lib/csrf.ts                   # helper
scripts/superadmin-reset.ts           # جديد
```
