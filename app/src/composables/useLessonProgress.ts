import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import { getApiBase } from '@/services/http/client';
import { readStoredAuth } from '@/lib/authStorage';
import { fetchMyLessonProgress, postLessonProgress } from '@/services/lessonProgressService';

const SYNC_MS = 30_000;

function canSyncProgress(): boolean {
  return Boolean(getApiBase() && readStoredAuth()?.token);
}

/**
 * مزامنة تقدّم الدرس مع الخادم: تحميل أولي + دفع كل ٣٠ ثانية + flush عند المغادرة.
 * يعتمد على وجود `VITE_API_BASE_URL` ورمز وصول؛ بدون ذلك لا يعمل شيء شبكي.
 */
export function useLessonProgress(lessonIdRef: Ref<string | undefined>) {
  const watchedSeconds = ref(0);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  async function hydrateFromServer() {
    if (!canSyncProgress() || !lessonIdRef.value) return;
    try {
      const items = await fetchMyLessonProgress();
      const row = items.find((i) => i.lessonId === lessonIdRef.value);
      if (row) {
        watchedSeconds.value = row.watchedSeconds;
      }
    } catch {
      /* تجاهل — وضع عدم اتصال */
    }
  }

  async function flush() {
    if (!canSyncProgress() || !lessonIdRef.value) return;
    try {
      await postLessonProgress({
        lessonId: lessonIdRef.value,
        watchedSeconds: watchedSeconds.value
      });
    } catch {
      /* تجاهل */
    }
  }

  async function markCompletedOnServer() {
    if (!canSyncProgress() || !lessonIdRef.value) return;
    await postLessonProgress({
      lessonId: lessonIdRef.value,
      status: 'completed',
      watchedSeconds: watchedSeconds.value
    });
  }

  async function markInProgressOnServer() {
    if (!canSyncProgress() || !lessonIdRef.value) return;
    await postLessonProgress({
      lessonId: lessonIdRef.value,
      status: 'in_progress'
    });
  }

  onMounted(() => {
    void hydrateFromServer();
    intervalId = setInterval(() => {
      void flush();
    }, SYNC_MS);
  });

  onBeforeUnmount(() => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    void flush();
  });

  watch(lessonIdRef, () => {
    void hydrateFromServer();
  });

  return {
    watchedSeconds,
    flush,
    markCompletedOnServer,
    markInProgressOnServer
  };
}
