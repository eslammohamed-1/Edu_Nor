<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { getApiBase } from '@/services/http/client';
import { fetchMyCertificate, publicVerifyUrl } from '@/services/certificateService';
import type { MyCertificateDetail } from '@/services/certificateService';
import { readStoredAuth } from '@/lib/authStorage';
import AppIcon from '@/components/common/AppIcon.vue';
import AppButton from '@/components/common/AppButton.vue';

const route = useRoute();
const loading = ref(true);
const error = ref<string | null>(null);
const cert = ref<MyCertificateDetail | null>(null);
const copied = ref(false);

const certificateId = computed(() => String(route.params.certificateId ?? ''));

const verifyShareUrl = computed(() =>
  cert.value ? publicVerifyUrl(cert.value.id) : ''
);

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return iso;
  }
}

function printPage(): void {
  window.print();
}

async function copyVerifyLink(): Promise<void> {
  if (!verifyShareUrl.value) return;
  try {
    await navigator.clipboard.writeText(verifyShareUrl.value);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    /* تجاهل */
  }
}

onMounted(async () => {
  const id = certificateId.value;
  if (!id) {
    loading.value = false;
    error.value = 'معرّف الشهادة غير صالح.';
    return;
  }

  if (!getApiBase() || !readStoredAuth()?.token) {
    loading.value = false;
    error.value = 'سجّل الدخول وفعّل الاتصال بالخادم لعرض الشهادة.';
    return;
  }

  try {
    cert.value = await fetchMyCertificate(id);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'تعذّر التحميل.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="cert-page">
    <header class="cert-toolbar no-print">
      <RouterLink to="/dashboard" class="back-link font-ar">
        <AppIcon name="ArrowRight" :size="18" />
        لوحة التحكم
      </RouterLink>
      <div class="toolbar-actions">
        <AppButton variant="ghost" class="font-ar" @click="copyVerifyLink">
          <AppIcon :name="copied ? 'Check' : 'Link2'" :size="18" />
          <span style="margin-inline-start: 8px">{{ copied ? 'تم النسخ' : 'نسخ رابط التحقق' }}</span>
        </AppButton>
        <AppButton class="font-ar" @click="printPage">
          <AppIcon name="Printer" :size="18" />
          <span style="margin-inline-start: 8px">طباعة</span>
        </AppButton>
      </div>
    </header>

    <div v-if="loading" class="state font-ar text-secondary">جاري التحميل…</div>
    <div v-else-if="error" class="state state--err font-ar">{{ error }}</div>

    <article v-else-if="cert" class="cert-sheet animate-fade-in">
      <div class="cert-frame">
        <div class="cert-corner cert-corner--tl" aria-hidden="true" />
        <div class="cert-corner cert-corner--tr" aria-hidden="true" />
        <div class="cert-corner cert-corner--bl" aria-hidden="true" />
        <div class="cert-corner cert-corner--br" aria-hidden="true" />

        <div class="cert-crest no-print" aria-hidden="true">
          <AppIcon name="Award" :size="36" />
        </div>

        <p class="cert-kicker font-ar text-secondary">شهادة إنجاز — إديو نور</p>

        <h1 class="cert-title font-ar">{{ cert.title }}</h1>

        <p class="cert-body font-ar text-secondary">
          تُمنح هذه الشهادة إلى
          <strong class="cert-name">{{ cert.recipientName }}</strong>
          إقرارًا بتحقيق المتطلبات المعروضة ضمن سجل المنصة.
        </p>

        <div class="cert-meta font-ar">
          <div class="meta-block">
            <span class="meta-label">المادة</span>
            <span class="meta-value">{{ cert.subjectName }}</span>
          </div>
          <div class="meta-block">
            <span class="meta-label">تاريخ الإصدار</span>
            <span class="meta-value">{{ formatDate(cert.issuedAt) }}</span>
          </div>
          <div v-if="!cert.signatureValid" class="meta-block meta-block--warn">
            <span class="meta-label">التوقيع</span>
            <span class="meta-value">غير متطابق مع مفتاح الخادم الحالي</span>
          </div>
        </div>

        <footer class="cert-footer font-ar text-secondary no-print">
          <span>رابط التحقق العام:</span>
          <a :href="verifyShareUrl" class="verify-link" target="_blank" rel="noopener">
            {{ verifyShareUrl }}
          </a>
        </footer>
      </div>
    </article>
  </div>
</template>

<style scoped>
.cert-page {
  max-width: 920px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-md) var(--space-4xl);
}

.cert-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-teal);
  font-size: 0.95rem;
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.state {
  text-align: center;
  padding: var(--space-2xl);
}

.state--err {
  color: var(--color-danger, #c0392b);
}

.cert-sheet {
  position: relative;
}

.cert-frame {
  position: relative;
  padding: clamp(2.5rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem);
  border-radius: var(--radius-xl);
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--color-surface) 92%, #fff) 0%,
    var(--color-surface) 40%,
    color-mix(in srgb, var(--color-navy) 4%, var(--color-surface)) 100%
  );
  border: 2px solid color-mix(in srgb, var(--color-gold) 55%, transparent);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-navy) 8%, transparent),
    var(--shadow-lg);
  overflow: hidden;
}

.cert-corner {
  position: absolute;
  width: 72px;
  height: 72px;
  border: 2px solid color-mix(in srgb, var(--color-gold) 70%, transparent);
  pointer-events: none;
  opacity: 0.9;
}

.cert-corner--tl {
  top: 12px;
  inset-inline-start: 12px;
  border-inline-end: none;
  border-block-end: none;
  border-start-start-radius: 8px;
}

.cert-corner--tr {
  top: 12px;
  inset-inline-end: 12px;
  border-inline-start: none;
  border-block-end: none;
  border-start-end-radius: 8px;
}

.cert-corner--bl {
  bottom: 12px;
  inset-inline-start: 12px;
  border-inline-end: none;
  border-block-start: none;
  border-end-start-radius: 8px;
}

.cert-corner--br {
  bottom: 12px;
  inset-inline-end: 12px;
  border-inline-start: none;
  border-block-start: none;
  border-end-end-radius: 8px;
}

.cert-crest {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-md);
  color: color-mix(in srgb, var(--color-gold) 85%, var(--color-navy));
}

.cert-kicker {
  text-align: center;
  letter-spacing: 0.04em;
  font-size: 0.95rem;
  margin-bottom: var(--space-sm);
}

.cert-title {
  text-align: center;
  font-size: clamp(1.35rem, 3.5vw, 1.85rem);
  color: var(--color-navy);
  line-height: 1.35;
  margin: 0 0 var(--space-xl);
}

.cert-body {
  text-align: center;
  font-size: 1.05rem;
  line-height: 1.75;
  max-width: 36rem;
  margin: 0 auto var(--space-xl);
}

.cert-name {
  color: var(--color-navy);
}

.cert-meta {
  display: grid;
  gap: var(--space-md);
  max-width: 28rem;
  margin: 0 auto;
  text-align: center;
}

.meta-label {
  display: block;
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.meta-value {
  font-weight: 600;
  color: var(--color-navy);
}

.meta-block--warn .meta-value {
  color: var(--color-gold);
}

.cert-footer {
  margin-top: var(--space-2xl);
  padding-top: var(--space-lg);
  border-top: 1px solid color-mix(in srgb, var(--color-navy) 10%, transparent);
  font-size: 0.85rem;
  display: grid;
  gap: 6px;
  text-align: center;
  word-break: break-all;
}

.verify-link {
  color: var(--color-teal);
}

@media print {
  .no-print {
    display: none !important;
  }

  .cert-page {
    padding: 0;
    max-width: none;
  }

  .cert-frame {
    box-shadow: none;
    border: 2px solid #b8932e;
  }
}
</style>
