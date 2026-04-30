export type ErrorReportKind = 'vue' | 'unhandledrejection' | 'router' | 'manual';

export interface ErrorReportContext {
  kind: ErrorReportKind;
  /** معلومات Vue مثل hook السياق */
  info?: string;
  /** اسم المكوّن إن وُجد */
  componentName?: string;
}

export interface NormalizedClientErrorPayload {
  kind: ErrorReportKind;
  info?: string;
  componentName?: string;
  message: string;
  stack?: string;
  time: string;
  url: string;
}

function normalizeMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function normalizeStack(error: unknown): string | undefined {
  return error instanceof Error ? error.stack : undefined;
}

/**
 * توجيه خطأ الواجهة لمركز واحد: السجل + خطاف اختياري للمراقبة (Sentry، إلخ).
 * عيّن `window.__EDUNOR_REPORT_ERROR__` من HTML أو إعداد لاحق لإرسال الحدث لخدمة خارجية.
 */
export function reportClientError(error: unknown, context: ErrorReportContext): void {
  const payload: NormalizedClientErrorPayload = {
    kind: context.kind,
    info: context.info,
    componentName: context.componentName,
    message: normalizeMessage(error),
    stack: normalizeStack(error),
    time: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : ''
  };

  console.error('[EduNor client]', payload);

  try {
    const hook = (window as Window & { __EDUNOR_REPORT_ERROR__?: (p: NormalizedClientErrorPayload) => void })
      .__EDUNOR_REPORT_ERROR__;
    hook?.(payload);
  } catch {
    /* تجاهل أعطال مسارات المراقبة */
  }
}
