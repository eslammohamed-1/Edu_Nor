<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import Hls from 'hls.js';
import AppIcon from '@/components/common/AppIcon.vue';

const props = defineProps<{
  src: string;
  title: string;
  poster?: string;
  /** مسار WebVTT اختياري */
  captionsSrc?: string;
  /** استئناف التشغيل بالثواني */
  initialSeconds?: number;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
let hls: InstanceType<typeof Hls> | null = null;

const rates = [0.75, 1, 1.25, 1.5, 2];
const rateIdx = ref(1);

const showControlsHint = ref(false);

const playbackRateLabel = computed(() => rates[rateIdx.value] ?? 1);

function cycleRate() {
  rateIdx.value = (rateIdx.value + 1) % rates.length;
  const el = videoRef.value;
  if (el) el.playbackRate = rates[rateIdx.value]!;
}

function isHlsUrl(u: string): boolean {
  return /\.m3u8(\?|$)/i.test(u) || u.includes('application/x-mpegURL');
}

function isDirectVideo(u: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(u);
}

function teardown() {
  if (hls) {
    hls.destroy();
    hls = null;
  }
  const el = videoRef.value;
  if (el) {
    el.removeAttribute('src');
    el.load();
  }
}

function applySeekFromStart(seconds: number) {
  const el = videoRef.value;
  if (!el || seconds <= 0) return;
  const once = () => {
    el.currentTime = seconds;
    el.removeEventListener('loadedmetadata', once);
  };
  el.addEventListener('loadedmetadata', once);
}

function mountSource() {
  const el = videoRef.value;
  if (!el) return;
  teardown();
  const url = props.src;
  el.playbackRate = rates[rateIdx.value]!;

  if (isHlsUrl(url) && Hls.isSupported()) {
    hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(url);
    hls.attachMedia(el);
  } else if (isHlsUrl(url) && el.canPlayType('application/vnd.apple.mpegurl')) {
    el.src = url;
  } else if (isDirectVideo(url) || isHlsUrl(url)) {
    el.src = url;
  } else {
    el.src = url;
  }

  if (props.initialSeconds && props.initialSeconds > 0) {
    applySeekFromStart(props.initialSeconds);
  }
}

onMounted(() => {
  mountSource();
  showControlsHint.value = true;
  setTimeout(() => {
    showControlsHint.value = false;
  }, 4000);
});

watch(
  () => props.src,
  () => {
    mountSource();
  }
);

watch(
  () => props.initialSeconds,
  (sec) => {
    const el = videoRef.value;
    if (el && sec != null && sec > 0) {
      el.currentTime = sec;
    }
  }
);

onBeforeUnmount(() => {
  teardown();
});
</script>

<template>
  <div class="v2-wrap">
    <video
      ref="videoRef"
      class="v2-video"
      controls
      playsinline
      :title="title"
      :poster="poster"
    >
      <track
        v-if="captionsSrc"
        kind="subtitles"
        srclang="ar"
        label="العربية"
        :src="captionsSrc"
      />
      المتصفح لا يدعم تشغيل هذا الفيديو.
    </video>
    <div v-if="showControlsHint" class="v2-hint font-ar">
      <AppIcon name="Info" :size="16" />
      استخدم أزرار المشغّل لتغيير السرعة من الشريط السفلي أو الاختصار هنا
    </div>
    <div class="v2-toolbar">
      <button type="button" class="rate-btn font-ar" @click="cycleRate">
        السرعة: ×{{ playbackRateLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.v2-wrap {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #000;
}

.v2-video {
  width: 100%;
  height: 100%;
  display: block;
}

.v2-hint {
  position: absolute;
  top: var(--space-md);
  inset-inline-start: var(--space-md);
  inset-inline-end: var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.65);
  color: var(--color-white);
  font-size: var(--text-body-sm);
  pointer-events: none;
  z-index: 2;
}

.v2-toolbar {
  position: absolute;
  bottom: var(--space-md);
  inset-inline-end: var(--space-md);
  z-index: 3;
}

.rate-btn {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  background: rgba(30, 58, 95, 0.9);
  color: var(--color-white);
  font-size: var(--text-body-sm);
  font-weight: var(--weight-semibold);
  border: 1px solid rgba(244, 168, 37, 0.5);
  cursor: pointer;
}
.rate-btn:hover {
  background: var(--color-navy);
}
</style>
