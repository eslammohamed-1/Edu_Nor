import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';

export function useAuth() {
  const store = useAuthStore();
  const { user, token, isLoading, error, isAuthenticated, isSuperAdmin } = storeToRefs(store);

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isSuperAdmin,
    login: store.login,
    completeTwoFactor: store.completeTwoFactor,
    register: store.register,
    logout: store.logout,
    clearError: store.clearError,
    hydrate: store.hydrate
  };
}
