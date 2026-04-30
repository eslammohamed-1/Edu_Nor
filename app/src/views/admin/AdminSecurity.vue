<script setup lang="ts">
import { ref, computed } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';
import { useAdminSettingsStore } from '@/stores/admin/adminSettings';
import { useAdminSessionsStore } from '@/stores/admin/adminSessions';
import { audit } from '@/lib/audit';
import DataTable from '@/components/admin/shared/DataTable.vue';
import type { Column } from '@/components/admin/shared/DataTable.vue';
import type { AdminSessionRow } from '@/types/adminSession';
import { useToast } from '@/composables/useToast';

const settingsStore = useAdminSettingsStore();
const sessionsStore = useAdminSessionsStore();
const toast = useToast();

const tfaCode = ref('');
const tfaStep = ref<'idle' | 'pending'>('idle');

const policy = computed(() => settingsStore.settings.security.passwordPolicy);

function savePasswordPolicy() {
  settingsStore.update('security', {
    passwordPolicy: { ...policy.value },
    twoFactorEnabled: settingsStore.settings.security.twoFactorEnabled
  });
  toast.success('تم حفظ سياسة كلمة المرور');
}

function resetPasswordPolicy() {
  settingsStore.reset('security');
  toast.success('تمت استعادة الإعدادات الافتراضية للأمان');
}

function onToggle2FA(enabled: boolean) {
  if (enabled) {
    tfaStep.value = 'pending';
    tfaCode.value = '';
    return;
  }
  settingsStore.update('security', {
    ...settingsStore.settings.security,
    twoFactorEnabled: false
  });
  tfaStep.value = 'idle';
  audit('security.2fa.disabled', { type: 'security', id: '2fa' });
  toast.success('تم إيقاف التحقق بخطوتين');
}

function verify2FA() {
  if (tfaCode.value !== '000000') {
    toast.error('رمز غير صحيح. للتجربة أدخل 000000');
    return;
  }
  settingsStore.update('security', {
    ...settingsStore.settings.security,
    twoFactorEnabled: true
  });
  tfaStep.value = 'idle';
  tfaCode.value = '';
  audit('security.2fa.enabled', { type: 'security', id: '2fa' });
  toast.success('تم تفعيل التحقق بخطوتين (وضع تجريبي)');
}

function cancel2FASetup() {
  tfaStep.value = 'idle';
  tfaCode.value = '';
}

function formatSeen(iso: string) {
  return new Date(iso).toLocaleString('ar-EG');
}

async function revokeSession(id: string) {
  const ok = await sessionsStore.revoke(id);
  if (!ok) toast.error('لا يمكن إنهاء الجلسة الحالية من هنا');
  else {
    audit('security.session.revoked', { type: 'session', id });
    toast.success('تم إنهاء الجلسة');
  }
}

const sessionColumns: Column<AdminSessionRow>[] = [
  { key: 'deviceLabel', label: 'الجهاز' },
  { key: 'ip', label: 'IP' },
  { key: 'lastSeen', label: 'آخر نشاط' }
];
</script>

<template>
  <div class="admin-security">
    <div class="page-header">
      <div>
        <h2 class="font-ar">الأمان والجلسات</h2>
        <p class="page-sub font-ar">سياسة كلمات المرور، التحقق بخطوتين (تجريبي)، وإدارة الجلسات النشطة.</p>
      </div>
    </div>

    <div class="panel">
      <h3 class="panel-title font-ar">
        <AppIcon name="KeyRound" :size="18" /> سياسة كلمة المرور
      </h3>
      <p class="panel-desc font-ar">
        تُطبَّق على التسجيل، تسجيل الدخول، وإنشاء المستخدمين من لوحة الإدارة.
      </p>
      <div class="fields-grid">
        <div class="field-row">
          <label class="field-label font-ar">الحد الأدنى للطول</label>
          <input v-model.number="policy.minLength" type="number" min="6" max="128" class="field-input font-en" />
        </div>
        <label class="check-row font-ar">
          <input type="checkbox" v-model="policy.requireUppercase" />
          يتطلب حرفاً إنجليزياً كبيراً
        </label>
        <label class="check-row font-ar">
          <input type="checkbox" v-model="policy.requireNumber" />
          يتطلب رقماً واحداً على الأقل
        </label>
        <label class="check-row font-ar">
          <input type="checkbox" v-model="policy.requireSymbol" />
          يتطلب رمزاً خاصاً
        </label>
        <div class="field-row">
          <label class="field-label font-ar">مدة الصلاحية (أيام، 0 = بدون انتهاء)</label>
          <input v-model.number="policy.maxAgeDays" type="number" min="0" max="365" class="field-input font-en" />
        </div>
      </div>
      <div class="panel-actions">
        <button type="button" class="btn btn-ghost font-ar" @click="resetPasswordPolicy">استعادة افتراضي</button>
        <button type="button" class="btn btn-primary font-ar" @click="savePasswordPolicy">حفظ السياسة</button>
      </div>
    </div>

    <div class="panel">
      <h3 class="panel-title font-ar">
        <AppIcon name="ShieldCheck" :size="18" /> التحقق بخطوتين (Mock)
      </h3>
      <p class="panel-desc font-ar">
        للعرض فقط: بعد التفعيل استخدم الرمز <strong class="font-en">000000</strong> للتحقق.
      </p>

      <div v-if="settingsStore.settings.security.twoFactorEnabled" class="tfa-on font-ar">
        <AppIcon name="CheckCircle2" :size="18" color="var(--color-success)" />
        التحقق بخطوتين مفعّل لهذا الحساب (محلي).
        <button type="button" class="btn btn-outline font-ar" @click="onToggle2FA(false)">إيقاف</button>
      </div>

      <div v-else-if="tfaStep === 'pending'" class="tfa-setup">
        <div class="qr-placeholder font-ar" aria-hidden="true">
          <AppIcon name="QrCode" :size="64" color="var(--text-muted)" />
          <span>مسح ضوئي وهمي</span>
        </div>
        <div class="tfa-form">
          <label class="field-label font-ar">رمز مكوّن من 6 أرقام</label>
          <input v-model="tfaCode" class="field-input font-en" maxlength="6" autocomplete="one-time-code" />
          <div class="panel-actions">
            <button type="button" class="btn btn-ghost font-ar" @click="cancel2FASetup">إلغاء</button>
            <button type="button" class="btn btn-primary font-ar" @click="verify2FA">تحقق وتفعيل</button>
          </div>
        </div>
      </div>

      <div v-else>
        <button type="button" class="btn btn-primary font-ar" @click="onToggle2FA(true)">بدء تفعيل التحقق بخطوتين</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head-row">
        <h3 class="panel-title font-ar">
          <AppIcon name="MonitorSmartphone" :size="18" /> الجلسات النشطة
        </h3>
        <button type="button" class="btn btn-ghost font-ar" @click="sessionsStore.refreshMockDevices">
          تحديث القائمة
        </button>
      </div>
      <p class="panel-desc font-ar">{{ sessionsStore.activeCount }} جلسة مسجّلة (بيانات تجريبية محلية).</p>

      <DataTable
        :columns="(sessionColumns as unknown as Column<Record<string, unknown>>[])"
        :rows="(sessionsStore.sessions as unknown as Record<string, unknown>[])"
        :page-size="10"
        empty-text="لا توجد جلسات"
      >
        <template #cell-deviceLabel="{ row }">
          <span class="font-ar">{{ (row as unknown as AdminSessionRow).deviceLabel }}</span>
        </template>
        <template #cell-ip="{ row }">
          <span class="font-en">{{ (row as unknown as AdminSessionRow).ip }}</span>
        </template>
        <template #cell-lastSeen="{ row }">
          <span class="font-ar">{{ formatSeen((row as unknown as AdminSessionRow).lastSeen) }}</span>
        </template>
        <template #actions="{ row }">
          <button
            type="button"
            class="link-danger font-ar"
            :disabled="!!(row as unknown as AdminSessionRow).current"
            @click="revokeSession((row as unknown as AdminSessionRow).id)"
          >
            إنهاء
          </button>
        </template>
      </DataTable>
    </div>

    <div class="doc-card font-ar">
      <AppIcon name="BookOpen" :size="16" />
      <div>
        <p class="doc-title">ماذا يُسجَّل في التدقيق؟</p>
        <p class="doc-body">
          عمليات المستخدمين والمحتوى والاختبارات والإعدادات، إضافة إلى محاولات تسجيل الدخول الفاشلة وتغييرات الأمان.
          راجع
          <RouterLink to="/admin/audit">سجل التدقيق</RouterLink>
          و
          <RouterLink to="/admin/settings">الإعدادات العامة</RouterLink>.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-security {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.page-header h2 {
  font-size: var(--text-h2);
  color: var(--text-primary);
}
.page-sub {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.panel {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.panel-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-h4);
  color: var(--text-primary);
}
.panel-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.fields-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.field-row {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  max-width: 280px;
}
.field-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
}
.field-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-input);
  color: var(--text-primary);
}
.check-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  cursor: pointer;
}

.panel-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: var(--space-sm);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
}
.btn-primary {
  background: var(--color-navy);
  color: #fff;
}
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.btn-outline {
  background: none;
  border: 1.5px solid var(--border-color);
  color: var(--text-secondary);
}

.tfa-on {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
  padding: var(--space-md);
  background: var(--bg-section);
  border-radius: var(--radius-lg);
}
.tfa-setup {
  display: flex;
  gap: var(--space-xl);
  flex-wrap: wrap;
  align-items: flex-start;
}
.qr-placeholder {
  width: 160px;
  height: 160px;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.75rem;
}
.tfa-form {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-danger {
  background: none;
  border: none;
  color: var(--color-error);
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 600;
}
.link-danger:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.doc-card {
  display: flex;
  gap: 0.75rem;
  padding: var(--space-lg);
  background: var(--bg-section);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
}
.doc-title {
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}
.doc-card a {
  color: var(--color-navy);
  font-weight: 600;
}
</style>
