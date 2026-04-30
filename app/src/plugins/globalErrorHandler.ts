import type { App, ComponentPublicInstance } from 'vue';
import type { Router } from 'vue-router';
import { useToast } from '@/composables/useToast';
import { reportClientError } from '@/lib/errorReporting';

const GENERIC_USER_MESSAGE =
  'حدث خطأ غير متوقع. حاول مرة أخرى أو حدّث الصفحة.';
const ROUTER_CHUNK_MESSAGE =
  'تعذّر تحميل جزء من الصفحة. تحقق من الاتصال ثم أعد المحاولة.';

function userFacingMessage(err: unknown): string {
  if (import.meta.env.DEV && err instanceof Error && err.message.trim()) {
    return err.message;
  }
  return GENERIC_USER_MESSAGE;
}

function isLikelyChunkFailure(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Loading chunk') ||
    msg.includes('Importing a module script failed')
  );
}

function componentLabel(instance: ComponentPublicInstance | null): string | undefined {
  if (!instance) return undefined;
  const internal = (instance as unknown as { $?: { type?: { __name?: string; name?: string } } }).$;
  const t = internal?.type;
  return t?.__name ?? t?.name;
}

/**
 * معالجة مركزية: أخطاء Vue، رفض promises غير المعالج، وفشل تحميل تقسيم الكود في Vue Router.
 */
export function installGlobalErrorHandler(app: App, router: Router): void {
  const toast = useToast();

  app.config.errorHandler = (err, instance, info) => {
    reportClientError(err, {
      kind: 'vue',
      info,
      componentName: componentLabel(instance)
    });
    toast.error(userFacingMessage(err), 5500);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    reportClientError(reason, { kind: 'unhandledrejection' });
    toast.error(userFacingMessage(reason), 5500);
  });

  router.onError((err) => {
    reportClientError(err, { kind: 'router' });
    const msg = isLikelyChunkFailure(err) ? ROUTER_CHUNK_MESSAGE : userFacingMessage(err);
    toast.error(msg, 6000);
  });
}
