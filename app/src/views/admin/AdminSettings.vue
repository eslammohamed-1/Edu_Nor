<script setup lang="ts">
import { ref } from 'vue';
import { useAdminSettingsStore } from '@/stores/admin/adminSettings';
import { downloadBackup, importAll } from '@/lib/backup';
import AppIcon from '@/components/common/AppIcon.vue';

const store = useAdminSettingsStore();
const activeTab = ref<'general' | 'branding' | 'seo' | 'integrations' | 'features'>('general');
const saved = ref(false);

function save(section: keyof typeof store.settings) {
  store.update(section, store.settings[section] as Parameters<typeof store.update>[1]);
  saved.value = true;
  setTimeout(() => (saved.value = false), 2000);
}

function resetSection(section: keyof typeof store.settings) {
  if (confirm('هل تريد استعادة الافتراضيات لهذا القسم؟')) {
    store.reset(section);
  }
}

function handleBackup() { downloadBackup(); }

function handleRestore() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (!confirm('هل تريد استعادة هذه النسخة الاحتياطية؟ سيُستبدَل كل البيانات المحفوظة.')) return;
      const result = importAll(ev.target?.result as string);
      if (result.ok) { alert(`تم استعادة ${result.keysRestored} مفتاح.`); window.location.reload(); }
      else alert('فشل الاستعادة: ' + result.error);
    };
    reader.readAsText(file);
  };
  input.click();
}

const tabs = [
  { key: 'general', label: 'عام', icon: 'Settings' },
  { key: 'branding', label: 'الهوية', icon: 'Palette' },
  { key: 'seo', label: 'SEO', icon: 'Globe' },
  { key: 'integrations', label: 'التكاملات', icon: 'Plug' },
  { key: 'features', label: 'الميزات', icon: 'ToggleLeft' }
] as const;
</script>

<template>
  <div class="admin-settings">
    <div class="page-header">
      <h2 class="font-ar">الإعدادات</h2>
      <div v-if="saved" class="saved-toast font-ar">
        <AppIcon name="Check" :size="14" /> تم الحفظ
      </div>
    </div>

    <!-- Tabs -->
    <div class="settings-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn font-ar"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <AppIcon :name="tab.icon" :size="16" />
        {{ tab.label }}
      </button>
    </div>

    <!-- General -->
    <div v-if="activeTab === 'general'" class="settings-panel">
      <h3 class="panel-title font-ar">الإعدادات العامة</h3>
      <div class="two-col">
        <div class="field-row">
          <label class="field-label font-ar">اسم المنصة</label>
          <input v-model="store.settings.general.platformName" class="field-input font-ar" />
        </div>
        <div class="field-row">
          <label class="field-label font-ar">البريد الإلكتروني</label>
          <input v-model="store.settings.general.contactEmail" class="field-input font-en" />
        </div>
        <div class="field-row">
          <label class="field-label font-ar">الهاتف</label>
          <input v-model="store.settings.general.phone" class="field-input font-en" />
        </div>
        <div class="field-row">
          <label class="field-label font-ar">العنوان</label>
          <input v-model="store.settings.general.address" class="field-input font-ar" />
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-ghost font-ar" @click="resetSection('general')">استعادة الافتراضي</button>
        <button class="btn btn-primary font-ar" @click="save('general')">حفظ</button>
      </div>
    </div>

    <!-- Branding -->
    <div v-if="activeTab === 'branding'" class="settings-panel">
      <h3 class="panel-title font-ar">الهوية البصرية</h3>
      <div class="field-row">
        <label class="field-label font-ar">رابط الشعار (Logo URL)</label>
        <input v-model="store.settings.branding.logoUrl" class="field-input font-en" placeholder="https://..." />
      </div>
      <div class="colors-row">
        <div class="field-row">
          <label class="field-label font-ar">اللون الأساسي (Navy)</label>
          <input v-model="store.settings.branding.primaryColor" type="color" class="color-picker" />
        </div>
        <div class="field-row">
          <label class="field-label font-ar">اللون الذهبي (Gold)</label>
          <input v-model="store.settings.branding.goldColor" type="color" class="color-picker" />
        </div>
      </div>
      <!-- Live Preview -->
      <div class="brand-preview">
        <p class="field-label font-ar">معاينة مباشرة</p>
        <div class="preview-card" :style="`border-top: 4px solid ${store.settings.branding.primaryColor}`">
          <span class="preview-title font-ar">{{ store.settings.general.platformName }}</span>
          <button class="preview-btn" :style="`background: ${store.settings.branding.goldColor}`">معاينة زر</button>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-ghost font-ar" @click="resetSection('branding')">استعادة الافتراضي</button>
        <button class="btn btn-primary font-ar" @click="save('branding')">حفظ وتطبيق</button>
      </div>
    </div>

    <!-- SEO -->
    <div v-if="activeTab === 'seo'" class="settings-panel">
      <h3 class="panel-title font-ar">إعدادات SEO</h3>
      <div class="field-row">
        <label class="field-label font-ar">عنوان الصفحة الافتراضي</label>
        <input v-model="store.settings.seo.defaultTitle" class="field-input font-ar" />
      </div>
      <div class="field-row">
        <label class="field-label font-ar">الوصف الافتراضي</label>
        <textarea v-model="store.settings.seo.defaultDescription" class="field-input font-ar" rows="2"></textarea>
      </div>
      <div class="field-row">
        <label class="field-label font-ar">صورة OG</label>
        <input v-model="store.settings.seo.ogImageUrl" class="field-input font-en" placeholder="https://..." />
      </div>
      <div class="field-row">
        <label class="field-label font-ar">Robots</label>
        <input v-model="store.settings.seo.robots" class="field-input font-en" />
      </div>
      <!-- Google preview mock -->
      <div class="google-preview">
        <p class="gp-url font-en">https://edunor.com</p>
        <p class="gp-title font-ar">{{ store.settings.seo.defaultTitle }}</p>
        <p class="gp-desc font-ar">{{ store.settings.seo.defaultDescription }}</p>
      </div>
      <div class="panel-footer">
        <button class="btn btn-ghost font-ar" @click="resetSection('seo')">استعادة الافتراضي</button>
        <button class="btn btn-primary font-ar" @click="save('seo')">حفظ</button>
      </div>
    </div>

    <!-- Integrations -->
    <div v-if="activeTab === 'integrations'" class="settings-panel">
      <h3 class="panel-title font-ar">التكاملات</h3>
      <div class="two-col">
        <div class="field-row">
          <label class="field-label font-ar">Google Analytics ID</label>
          <input v-model="store.settings.integrations.gaId" class="field-input font-en" placeholder="G-XXXXXXXXXX" />
        </div>
        <div class="field-row">
          <label class="field-label font-ar">Meta Pixel ID</label>
          <input v-model="store.settings.integrations.metaPixelId" class="field-input font-en" placeholder="XXXXXXXXXXXXXXXX" />
        </div>
        <div class="field-row">
          <label class="field-label font-ar">SMTP Host</label>
          <input v-model="store.settings.integrations.smtpHost" class="field-input font-en" placeholder="smtp.example.com" />
        </div>
        <div class="field-row">
          <label class="field-label font-ar">SMTP User</label>
          <input v-model="store.settings.integrations.smtpUser" class="field-input font-en" />
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-ghost font-ar" @click="resetSection('integrations')">استعادة الافتراضي</button>
        <button class="btn btn-primary font-ar" @click="save('integrations')">حفظ</button>
      </div>
    </div>

    <!-- Features -->
    <div v-if="activeTab === 'features'" class="settings-panel">
      <h3 class="panel-title font-ar">تفعيل الميزات</h3>
      <div class="toggles-list">
        <div class="toggle-row">
          <div>
            <p class="toggle-label font-ar">وضع الصيانة</p>
            <p class="toggle-desc font-ar">يمنع الطلاب من الدخول مع إظهار رسالة صيانة</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="store.settings.features.maintenanceMode" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="toggle-row">
          <div>
            <p class="toggle-label font-ar">فتح التسجيل</p>
            <p class="toggle-desc font-ar">يسمح للمستخدمين الجدد بالتسجيل</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="store.settings.features.registrationOpen" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="toggle-row">
          <div>
            <p class="toggle-label font-ar">الكاتالوج العام</p>
            <p class="toggle-desc font-ar">يتيح عرض المواد والكورسات بدون تسجيل دخول</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="store.settings.features.publicCatalog" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="toggle-row">
          <div>
            <p class="toggle-label font-ar">الوضع الداكن افتراضياً</p>
            <p class="toggle-desc font-ar">يبدأ المستخدمون الجدد بالوضع الداكن</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="store.settings.features.darkModeDefault" />
            <span class="slider"></span>
          </label>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-primary font-ar" @click="save('features')">حفظ</button>
      </div>
    </div>

    <!-- Backup -->
    <div class="backup-card">
      <h3 class="panel-title font-ar">النسخ الاحتياطية</h3>
      <div class="backup-actions">
        <button class="btn btn-outline font-ar" @click="handleBackup">
          <AppIcon name="Download" :size="14" /> تصدير نسخة احتياطية
        </button>
        <button class="btn btn-outline font-ar" @click="handleRestore">
          <AppIcon name="Upload" :size="14" /> استيراد نسخة احتياطية
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-settings { display: flex; flex-direction: column; gap: var(--space-lg); }
.page-header { display: flex; align-items: center; justify-content: space-between; }
.page-header h2 { font-size: var(--text-h2); color: var(--text-primary); }
.saved-toast { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.875rem; background: #e8f5e9; color: #2e7d32; border-radius: var(--radius-full); font-size: 0.8125rem; font-weight: 600; }

.settings-tabs { display: flex; gap: 0.25rem; background: var(--bg-section); border-radius: var(--radius-lg); padding: 4px; flex-wrap: wrap; }
.tab-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border: none; background: none; border-radius: var(--radius-md); cursor: pointer; font-size: 0.875rem; color: var(--text-secondary); transition: all var(--duration-fast); }
.tab-btn.active { background: var(--bg-card); color: var(--color-navy); font-weight: 700; box-shadow: var(--shadow-sm); }

.settings-panel { background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); padding: var(--space-xl); display: flex; flex-direction: column; gap: var(--space-md); }
.panel-title { font-size: var(--text-h4); color: var(--text-primary); margin-bottom: 0.25rem; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
@media (max-width: 600px) { .two-col { grid-template-columns: 1fr; } }
.field-row { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); }
.field-input { padding: 0.625rem 0.875rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-input); color: var(--text-primary); font-size: 0.875rem; outline: none; resize: vertical; }
.field-input:focus { border-color: var(--color-gold); }
.color-picker { width: 60px; height: 40px; border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; padding: 2px; }
.colors-row { display: flex; gap: var(--space-xl); flex-wrap: wrap; }
.panel-footer { display: flex; gap: var(--space-sm); justify-content: flex-end; padding-top: var(--space-sm); border-top: 1px solid var(--border-color); margin-top: var(--space-sm); }

.brand-preview { padding: var(--space-md); background: var(--bg-section); border-radius: var(--radius-lg); }
.preview-card { display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); border-radius: var(--radius-md); padding: var(--space-md); margin-top: 0.5rem; }
.preview-title { font-weight: 700; color: var(--text-primary); }
.preview-btn { border: none; cursor: pointer; color: #fff; padding: 0.4rem 0.875rem; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 600; }

.google-preview { padding: var(--space-md); background: var(--bg-section); border-radius: var(--radius-lg); border: 1px solid var(--border-color); }
.gp-url { font-size: 0.75rem; color: var(--color-success); }
.gp-title { font-size: 1rem; color: #1a0dab; margin: 2px 0; text-decoration: underline; cursor: pointer; }
[data-theme="dark"] .gp-title { color: #8ab4f8; }
.gp-desc { font-size: 0.8125rem; color: var(--text-muted); }

.toggles-list { display: flex; flex-direction: column; gap: var(--space-md); }
.toggle-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); padding: var(--space-md) 0; border-bottom: 1px solid var(--border-color); }
.toggle-row:last-child { border-bottom: none; }
.toggle-label { font-size: 0.9375rem; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.toggle-desc { font-size: 0.8125rem; color: var(--text-muted); }
.toggle-switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; inset: 0; background: var(--border-color); border-radius: var(--radius-full); cursor: pointer; transition: background var(--duration-fast); }
.slider::before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: transform var(--duration-fast); }
.toggle-switch input:checked + .slider { background: var(--color-navy); }
.toggle-switch input:checked + .slider::before { transform: translateX(20px); }

.backup-card { background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); padding: var(--space-lg); }
.backup-actions { display: flex; gap: var(--space-sm); flex-wrap: wrap; margin-top: var(--space-md); }

.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem; border-radius: var(--radius-md); border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all var(--duration-fast); }
.btn-primary { background: var(--color-navy); color: #fff; }
.btn-primary:hover { background: var(--color-navy-light); }
.btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); }
.btn-ghost:hover { background: var(--bg-section); }
.btn-outline { background: none; border: 1.5px solid var(--border-color); color: var(--text-secondary); }
.btn-outline:hover { border-color: var(--color-navy); color: var(--color-navy); }
</style>
