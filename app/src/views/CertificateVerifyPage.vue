<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { getApiBase } from '@/services/http/client';
import AppIcon from '@/components/common/AppIcon.vue';

const route = useRoute();

const loading = ref(true);
const error = ref<string | null>(null);
const signatureValid = ref(false);
const title = ref('');
const issuedAt = ref('');
const subjectName = ref('');

const certificateId = computed(() => String(route.params.certificateId ?? ''));

onMounted(async () => {
  const id = certificateId.value;
  if (!id) {
    loading.value = false;
    error.value = 'معرّف الشهادة غير صالح.';
    return;
  }

  const base = getApiBase();
  if (!base) {
    loading.value = false;
    error.value = 'VITE_API_BASE_URL غير معرّف — لا يمكن التحقق.';
    return;
  }

  try {
    const res = await fetch(`${base}/api/v1/cert/verify/${encodeURIComponent(id)}`, {
      credentials: 'omit'
    });

    if (res.status === 404) {
      loading.value = false;
      error.value = 'لم يُعثر على هذه الشهادة.';
      return;
    }

    if (!res.ok) {
      loading.value = false;
      error.value = 'تعذّر التحقق من الخادم.';
      return;
    }

    const data = (await res.json()) as {
      signatureValid?: boolean;
      certificate?: {
        title?: string;
        issuedAt?: string;
        subjectName?: string;
      } | null;
    };

    signatureValid.value = !!data.signatureValid;
    const c = data.certificate;
    title.value = c?.title ?? '';
    issuedAt.value = c?.issuedAt ?? '';
    subjectName.value = c?.subjectName ?? '';
  } catch {
    error.value = 'حدث خطأ أثناء التحقق.';
  } finally {
    loading.value = false;
  }
});

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
</script>

<template>
  <div class="verify-page">
    <div class="verify-card animate-fade-in">
      <div class="verify-brand font-ar">
        <span class="brand-mark">إديو نور</span>
        <span class="brand-sub text-secondary">التحقق من الشهادة</span>
      </div>

      <div v-if="loading" class="state font-ar text-secondary">جاري التحقق…</div>

      <div v-else-if="error" class="state state--err font-ar">
        <AppIcon name="XCircle" :size="40" class="state-icon" />
        <p>{{ error }}</p>
        <RouterLink to="/" class="home-link font-ar">العودة للرئيسية</RouterLink>
      </div>

      <template v-else>
        <div v-if="signatureValid" class="result result--ok font-ar">
          <AppIcon name="ShieldCheck" :size="48" class="result-icon" />
          <h1 class="result-title">شهادة موثّقة</h1>
          <p class="result-lead text-secondary">
            تطابق بيانات هذه الشهادة التوقيع المخزّن لدى المنصة.
          </p>
        </div>

        <div v-else class="result result--warn font-ar">
          <AppIcon name="AlertTriangle" :size="48" class="result-icon result-icon--warn" />
          <h1 class="result-title">تنبيه</h1>
          <p class="result-lead text-secondary">
            الشهادة موجودة لكن التوقيع لا يطابق المفتاح الحالي للخادم — قد تكون أُعيدت تهيئة الأسرار
            أو حُرّفت البيانات.
          </p>
        </div>

        <dl v-if="title" class="details font-ar">
          <div class="detail-row">
            <dt>العنوان</dt>
            <dd>{{ title }}</dd>
          </div>
          <div v-if="subjectName" class="detail-row">
            <dt>المادة</dt>
            <dd>{{ subjectName }}</dd>
          </div>
          <div v-if="issuedAt" class="detail-row">
            <dt>تاريخ الإصدار</dt>
            <dd>{{ formatDate(issuedAt) }}</dd>
          </div>
        </dl>

        <p class="fine-print font-ar text-secondary">
          معرّف السجل: <code class="cid">{{ certificateId }}</code>
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.verify-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl) var(--space-md);
  background: radial-gradient(
    ellipse 120% 80% at 50% 0%,
    color-mix(in srgb, var(--color-gold) 12%, transparent),
    transparent 55%
  );
}

.verify-card {
  width: 100%;
  max-width: 480px;
  background: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-navy) 12%, transparent);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-2xl);
}

.verify-brand {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.brand-mark {
  display: block;
  font-weight: 700;
  color: var(--color-navy);
  font-size: 1.25rem;
}

.brand-sub {
  display: block;
  font-size: 0.9rem;
  margin-top: 4px;
}

.state {
  text-align: center;
  padding: var(--space-lg);
}

.state--err .state-icon {
  color: var(--color-danger, #c0392b);
  margin-bottom: var(--space-md);
}

.home-link {
  display: inline-block;
  margin-top: var(--space-lg);
  color: var(--color-teal);
}

.result {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.result--ok .result-icon {
  color: var(--color-success, #1b8f5a);
}

.result--warn .result-icon--warn {
  color: var(--color-gold);
}

.result-title {
  font-family: var(--font-ar);
  font-size: 1.5rem;
  color: var(--color-navy);
  margin: var(--space-md) 0 var(--space-sm);
}

.result-lead {
  line-height: 1.65;
  margin: 0;
}

.details {
  margin: 0;
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-navy) 4%, transparent);
}

.detail-row {
  display: grid;
  gap: 4px;
  margin-bottom: var(--space-md);
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row dt {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
}

.detail-row dd {
  margin: 0;
  font-weight: 600;
  color: var(--color-navy);
}

.fine-print {
  margin-top: var(--space-xl);
  font-size: 0.82rem;
  text-align: center;
}

.cid {
  font-size: 0.75rem;
  word-break: break-all;
  background: color-mix(in srgb, var(--color-navy) 8%, transparent);
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
