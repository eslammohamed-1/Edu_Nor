# ADR-004 — OpenAPI أولاً (Swagger UI + تصدير openapi.json)

## الحالة
مقبول — 2026-05-07

## السياق
- الواجهة والعملاء الخارجيون يحتاجون عقد API ثابتاً؛ التوثيق اليدوي يتآكل.

## القرار
- تفعيل `@fastify/swagger` + `@fastify/swagger-ui` عند `ENABLE_API_DOCS=true`.
- سكربت `npm run docs:export` يجلب `/documentation/json` إلى `server/openapi.json`.
- الواجهة يمكن أن تولّد أنواعاً بـ `openapi-typescript` (`npm run gen:api` في `app`).

## العواقب
- في الإنتاج يجب إغلاق الوثائق (`ENABLE_API_DOCS=false`) ما لم يُقصَد نشرها خلف مصادقة.

## البدائل المرفوضة
- Postman كمصدر وحيد للحقيقة — لا يُدمج مع CI ولا codegen.
