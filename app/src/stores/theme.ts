import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'edunor_theme';

function detectInitial(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('light');
  const isDark = computed(() => theme.value === 'dark');

  function init() {
    theme.value = detectInitial();
    applyTheme(theme.value);
  }

  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }

  function setTheme(next: Theme) {
    theme.value = next;
  }

  watch(theme, (next) => {
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  return { theme, isDark, init, toggle, setTheme };
});
