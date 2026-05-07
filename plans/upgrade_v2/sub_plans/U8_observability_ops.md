# U8 — Observability & Ops | المراقبة والتشغيل

## 🎯 الهدف

تحويل المشروع من "بيشتغل محلياً" إلى **بيئة إنتاج موصولة بالمراقبة**: Sentry، structured logs، metrics، daily DB backup، CI/CD كامل، staging environment، runbooks.

---

## 🧱 المهام

### 8.1 — Structured Logging
- إعداد `pino` في الباكند بإخراج JSON.
- correlation IDs لكل request (`x-request-id` header).
- مستويات: trace, debug, info, warn, error.
- redaction للحقول الحساسة (passwords, tokens).
- إخراج للـ stdout + لـ file rotation (lo-fi) أو forwarder خارجي.

### 8.2 — Sentry Integration
- frontend: `@sentry/vue` يلتقط errors + performance.
- backend: `@sentry/node` يلتقط exceptions.
- scrubbing PII (إيميلات في عناصر معينة).
- release tagging تلقائي من git SHA.
- alerts: 5xx > 1% / 5min, p95 > 1s.

### 8.3 — Prometheus Metrics
- dependency: `prom-client`.
- endpoint `/metrics` (محمي خلف basic auth أو internal-only).
- counters/histograms:
  - `http_requests_total{path,status}`
  - `http_request_duration_seconds`
  - `quiz_attempts_total`
  - `auth_failed_total`
- README فيه dashboards للـ Grafana.

### 8.4 — Daily DB Backup
- script `scripts/backup-db.sh`:
  - `pg_dump` مع compress.
  - upload لـ S3 bucket مخصّص للنسخ.
  - retention 30 يوم.
- cron في الإنتاج (server-side cron أو GitHub Actions scheduled).
- restore script + توثيق DR.

### 8.5 — CI/CD Pipelines (GitHub Actions)
- `lint.yml` → ESLint + Prettier check.
- `typecheck.yml` → vue-tsc + tsc.
- `test.yml` → unit + integration + e2e (matrix Node 20/22).
- `build.yml` → app + server build + artifact upload.
- `lighthouse.yml` → audit on PR.
- `deploy-staging.yml` → on push to `main` → deploy إلى staging.
- `deploy-production.yml` → manual trigger مع approval.
- `backup-db.yml` → scheduled daily.

### 8.6 — Staging Environment
- Docker image لكل من app و server.
- compose file `docker-compose.staging.yml`.
- subdomain `staging.edunor.app` (أو حسب اختيار النطاق).
- env separation: `.env.staging`, `.env.production`.
- seed data anonymized.

### 8.7 — Runbooks
- `docs/runbooks/`:
  - `deploy.md` — خطوات النشر اليدوي إذا CI فشل.
  - `rollback.md` — كيف ترجع لـ release قديم.
  - `db-restore.md` — استعادة من backup.
  - `incident-response.md` — لو السيرفر طاح.
  - `add-superadmin.md` — إنشاء سوبر أدمن جديد.

### 8.8 — Health & Readiness Probes
- `/health` (موجود) → liveness.
- `/ready` → يتحقق من DB connection + storage reachable.
- documentation للـ K8s lookalikes.

### 8.9 — Secrets Management
- توثيق استخدام **Doppler** أو **GitHub Secrets** أو **AWS SSM**.
- مفيش secrets في الريبو؛ scan أوتوماتيكي بـ `gitleaks` في CI.

### 8.10 — Status Page (لاحقاً اختياري)
- صفحة `/status` تعرض حالة API + DB + storage.
- يستخدم Uptime checks خارجية (UptimeRobot tier مجاني).

---

## ✅ Acceptance Criteria
- [ ] PR على main → كل workflows تخضر.
- [ ] error في الإنتاج يظهر في Sentry خلال ٣٠ ثانية.
- [ ] `/metrics` يرد metrics صالحة لـ Prometheus.
- [ ] backup يومي يحدث بدون تدخل + restore مختبر.
- [ ] staging يعكس أحدث main تلقائياً.
- [ ] runbook يستخدمه شخص جديد بنجاح بدون مساعدة.

---

## 🔗 ملفات

```
server/src/plugins/logger.ts                   # pino tuned
server/src/plugins/sentry.ts                   # جديد
server/src/plugins/metrics.ts                  # جديد
server/src/lib/correlationId.ts                # جديد
app/src/plugins/sentry.ts                      # جديد
scripts/backup-db.sh                           # جديد
.github/workflows/lint.yml                     # جديد
.github/workflows/typecheck.yml                # جديد
.github/workflows/test.yml                     # جديد
.github/workflows/build.yml                    # جديد
.github/workflows/lighthouse.yml               # جديد
.github/workflows/deploy-staging.yml           # جديد
.github/workflows/deploy-production.yml        # جديد
.github/workflows/backup-db.yml                # جديد
.github/workflows/gitleaks.yml                 # جديد
docker-compose.staging.yml                     # جديد
Dockerfile.app                                 # جديد
Dockerfile.server                              # جديد
docs/runbooks/*.md                             # جديد
```
