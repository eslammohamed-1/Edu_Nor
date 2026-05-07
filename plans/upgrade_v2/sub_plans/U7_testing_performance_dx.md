# U7 — Testing, Performance & DX | الاختبار والأداء وتجربة المطوّر

## 🎯 الهدف

بناء شبكة اختبارات حقيقية، تحسين الأداء (initial bundle, LCP, INP)، وتقوية تجربة المطوّر (lint, types, scripts، CONTRIBUTING).

---

## 🧱 المهام

### 7.1 — Testing Pyramid
- **Unit tests** (Vitest):
  - تغطية `quiz-scoring.ts` ≥ 95%.
  - تغطية stores (`auth`, `quiz`, `curriculum`) ≥ 80%.
  - mocks لـ Prisma عبر `prisma-mock` أو `vitest-mock-extended`.
- **Integration tests** (Vitest + supertest):
  - `/auth/*` happy + error paths.
  - `/admin/users` CRUD.
  - `/quiz-attempts/*`.
- **E2E tests** (Playwright):
  - Login + navigate.
  - Register → onboarding → first lesson.
  - Take quiz → submit → see result.
  - Admin: edit lesson → publish → student sees it.
- target overall coverage ≥ 70%.

### 7.2 — Type Safety Strict
- `tsconfig` flags: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- إصلاح كل `any` ضمنية.
- إضافة `vue-tsc --noEmit` في pre-commit.
- types مولّدة من OpenAPI (من U1) تستبدل manual types.

### 7.3 — Lint & Format
- ESLint flat config: `@vue/eslint-config-typescript`, `eslint-plugin-vue`, `eslint-plugin-import`.
- Prettier 3 موحد للمشروع كله.
- pre-commit hook عبر **lefthook** أو **husky + lint-staged**.

### 7.4 — Bundle Optimization
- إضافة `rollup-plugin-visualizer` و run في CI.
- code splitting:
  - admin chunk منفصل (lazy loaded).
  - lucide icons via dynamic import per component.
  - heavy charts library lazy.
- target: initial JS gzipped ≤ 200KB.

### 7.5 — Image & Font Optimization
- استبدال PNGs بـ WebP/AVIF حيث أمكن.
- font-display: swap, preload subset.
- responsive `<img srcset>` على المحتوى الكبير.

### 7.6 — Lighthouse CI
- script `npm run lighthouse` يشغل lighthouse على ٥ صفحات أساسية.
- threshold: performance ≥ 90, a11y ≥ 95, best-practices ≥ 90, seo ≥ 90.
- CI يفشل لو threshold لم يتحقق.

### 7.7 — Performance Monitoring
- web-vitals package يقيس LCP, INP, CLS، FID.
- يرسلهم لـ Sentry (من U8) أو `/api/v1/metrics/web-vitals`.

### 7.8 — DX Improvements
- `CONTRIBUTING.md` فيها: setup، tests، style، PR template.
- `.editorconfig` موحد.
- `pnpm` overrides (لو ننقل من npm) أو `npm dedupe` دوري.
- VS Code workspace file مع recommended extensions.
- error overlay محسّن في dev.

### 7.9 — Caching Strategy
- API Vary headers + ETag على endpoints مناسبة.
- `Cache-Control` على static assets (`immutable`).
- Vue lazy + Suspense للـ views.
- query cache في الواجهة (مخفّف، عبر Pinia + `staleAt`).

### 7.10 — Database Query Performance
- review كل Prisma queries عبر `prisma.$on('query')` في dev.
- إضافة indexes بناءً على الاستعلامات الفعلية.
- N+1 detection في tests.

---

## ✅ Acceptance Criteria
- [ ] Vitest يمشي بدون errors + coverage ≥ 70%.
- [ ] Playwright يمشي على CI Headless و يمر.
- [ ] لا يوجد `any` في tsconfig strict mode.
- [ ] bundle gzipped ≤ 200KB (initial).
- [ ] Lighthouse ≥ 90 على Home + LessonPage + AdminDashboard.
- [ ] pre-commit يرفض كود مكسور.

---

## 🔗 ملفات

```
app/vitest.config.ts                          # ترقية
app/tests/unit/                               # ملفات tests
server/src/__tests__/                         # ملفات tests
e2e/                                          # Playwright
e2e/playwright.config.ts                      # جديد
.github/workflows/test.yml                    # جديد
.github/workflows/lighthouse.yml              # جديد
eslint.config.js                              # flat config
prettier.config.js                            # موحد
lefthook.yml أو .husky/                       # pre-commit
CONTRIBUTING.md                               # جديد
.editorconfig                                 # جديد
.vscode/extensions.json                       # جديد
```
