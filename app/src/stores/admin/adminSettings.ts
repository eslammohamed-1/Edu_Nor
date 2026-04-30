import { defineStore } from 'pinia';
import { ref } from 'vue';
import { audit } from '@/lib/audit';
import type { PasswordPolicy } from '@/lib/passwordPolicy';
import { fetchAdminSnapshot, saveAdminSnapshot } from '@/services/adminSystemService';
import { getApiBase } from '@/services/http/client';

const STORAGE_KEY = 'edunor.admin.settings';

export interface PlatformSettings {
  general: {
    platformName: string;
    contactEmail: string;
    phone: string;
    address: string;
    timezone: string;
    defaultLocale: 'ar' | 'en';
  };
  branding: {
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    goldColor: string;
    navyColor: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImageUrl: string;
    robots: string;
  };
  integrations: {
    gaId: string;
    metaPixelId: string;
    smtpHost: string;
    smtpUser: string;
  };
  features: {
    maintenanceMode: boolean;
    registrationOpen: boolean;
    publicCatalog: boolean;
    darkModeDefault: boolean;
  };
  security: {
    passwordPolicy: PasswordPolicy;
    twoFactorEnabled: boolean;
  };
}

const defaults: PlatformSettings = {
  general: {
    platformName: 'إديو نور',
    contactEmail: 'hello@edunor.com',
    phone: '+20 100 000 0000',
    address: 'القاهرة، مصر',
    timezone: 'Africa/Cairo',
    defaultLocale: 'ar'
  },
  branding: {
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#1E3A5F',
    goldColor: '#F4A825',
    navyColor: '#1E3A5F'
  },
  seo: {
    defaultTitle: 'إديو نور — منصتك التعليمية',
    defaultDescription: 'منصة تعليمية رائدة في المنطقة العربية',
    ogImageUrl: '',
    robots: 'index, follow'
  },
  integrations: {
    gaId: '',
    metaPixelId: '',
    smtpHost: '',
    smtpUser: ''
  },
  features: {
    maintenanceMode: false,
    registrationOpen: true,
    publicCatalog: true,
    darkModeDefault: false
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: false,
      requireNumber: true,
      requireSymbol: false,
      maxAgeDays: 0
    },
    twoFactorEnabled: false
  }
};

function mergeSettings(saved: Partial<PlatformSettings>): PlatformSettings {
  return {
    ...defaults,
    ...saved,
    general: { ...defaults.general, ...saved.general },
    branding: { ...defaults.branding, ...saved.branding },
    seo: { ...defaults.seo, ...saved.seo },
    integrations: { ...defaults.integrations, ...saved.integrations },
    features: { ...defaults.features, ...saved.features },
    security: {
      ...defaults.security,
      ...saved.security,
      passwordPolicy: {
        ...defaults.security.passwordPolicy,
        ...saved.security?.passwordPolicy
      }
    }
  };
}

function readStorage(): PlatformSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<PlatformSettings>;
      return mergeSettings(saved);
    }
  } catch {}
  return { ...defaults };
}

export const useAdminSettingsStore = defineStore('adminSettings', () => {
  const settings = ref<PlatformSettings>(readStorage());

  function save() {
    if (!getApiBase()) localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value));
    else void saveAdminSnapshot('settings', settings.value);
  }

  async function fetchSettings() {
    if (!getApiBase()) {
      settings.value = readStorage();
      applyBranding();
      return;
    }
    const remote = await fetchAdminSnapshot<Partial<PlatformSettings>>('settings');
    if (remote) settings.value = mergeSettings(remote);
    else await saveAdminSnapshot('settings', settings.value);
    applyBranding();
  }

  function update<K extends keyof PlatformSettings>(
    section: K,
    payload: Partial<PlatformSettings[K]>
  ) {
    if (section === 'security') {
      const p = payload as Partial<PlatformSettings['security']>;
      settings.value.security = {
        ...settings.value.security,
        ...p,
        passwordPolicy: {
          ...settings.value.security.passwordPolicy,
          ...(p.passwordPolicy || {})
        }
      };
    } else {
      settings.value[section] = { ...settings.value[section], ...payload } as PlatformSettings[K];
    }
    save();
    audit('settings.update', { type: 'settings', id: section }, { section });
    applyBranding();
  }

  function reset<K extends keyof PlatformSettings>(section: K) {
    settings.value[section] = structuredClone(defaults[section]) as PlatformSettings[K];
    save();
    audit('settings.reset', { type: 'settings', id: String(section) });
    applyBranding();
  }

  function applyBranding() {
    const { primaryColor, goldColor, navyColor } = settings.value.branding;
    if (primaryColor) document.documentElement.style.setProperty('--color-navy', primaryColor);
    if (goldColor) document.documentElement.style.setProperty('--color-gold', goldColor);
    if (navyColor) document.documentElement.style.setProperty('--color-navy-dark', navyColor);
  }

  function init() {
    applyBranding();
    void fetchSettings();
  }

  return { settings, update, reset, init, fetchSettings };
});
