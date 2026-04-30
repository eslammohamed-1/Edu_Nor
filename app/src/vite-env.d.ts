/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPER_ADMIN_EMAIL?: string;
  readonly VITE_SUPER_ADMIN_PASSWORD?: string;
  readonly VITE_ENABLE_MOCK_AUTH?: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** خطاف اختياري من `index.html` أو تهيئة لمزود مراقبة (Sentry، إلخ) */
interface Window {
  __EDUNOR_REPORT_ERROR__?: (payload: Record<string, unknown>) => void;
}
