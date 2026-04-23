import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores/theme';

export function useTheme() {
  const store = useThemeStore();
  const { theme, isDark } = storeToRefs(store);

  return {
    theme,
    isDark,
    toggle: store.toggle,
    setTheme: store.setTheme,
    init: store.init
  };
}
