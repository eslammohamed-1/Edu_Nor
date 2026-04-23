<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppIcon from '@/components/common/AppIcon.vue';
import { useAuth } from '@/composables/useAuth';
import { useTheme } from '@/composables/useTheme';

defineProps<{ sidebarWidth?: number }>();
const emit = defineEmits<{ 'toggle-mobile': [] }>();

const router = useRouter();
const { user, logout } = useAuth();
const { isDark, toggle: toggleTheme } = useTheme();

const showUserMenu = ref(false);

async function handleLogout() {
  logout();
  await router.push('/login');
}

// Impersonation state
const impersonating = ref(!!localStorage.getItem('edunor.impersonate.origin'));

function stopImpersonate() {
  try {
    const origin = localStorage.getItem('edunor.impersonate.origin');
    if (origin) {
      localStorage.setItem('edunor_auth', origin);
      localStorage.removeItem('edunor.impersonate.origin');
      window.location.reload();
    }
  } catch {}
}
</script>

<template>
  <header class="admin-topbar">
    <!-- Mobile hamburger -->
    <button class="mobile-menu-btn" @click="emit('toggle-mobile')">
      <AppIcon name="Menu" :size="20" />
    </button>

    <!-- Impersonation Banner -->
    <div v-if="impersonating" class="impersonate-banner font-ar">
      <AppIcon name="AlertTriangle" :size="14" />
      أنت تتصفح كمستخدم آخر —
      <button class="stop-btn font-ar" @click="stopImpersonate">عُد لحسابك</button>
    </div>

    <div class="topbar-end">
      <!-- Theme toggle -->
      <button class="icon-btn" @click="toggleTheme" :title="isDark ? 'وضع النهار' : 'وضع الليل'">
        <AppIcon :name="isDark ? 'Sun' : 'Moon'" :size="18" />
      </button>

      <!-- User menu -->
      <div class="user-menu-wrap" @mouseleave="showUserMenu = false">
        <button class="user-btn" @click="showUserMenu = !showUserMenu">
          <div class="user-avatar font-ar">{{ user?.name?.slice(0, 1) || 'م' }}</div>
          <span class="user-name font-ar">{{ user?.name }}</span>
          <AppIcon name="ChevronDown" :size="14" />
        </button>
        <div v-if="showUserMenu" class="user-dropdown">
          <RouterLink to="/admin" class="dd-item font-ar" @click="showUserMenu = false">
            <AppIcon name="LayoutDashboard" :size="15" /> لوحة التحكم
          </RouterLink>
          <RouterLink to="/profile" class="dd-item font-ar" @click="showUserMenu = false">
            <AppIcon name="User" :size="15" /> الملف الشخصي
          </RouterLink>
          <RouterLink to="/admin/settings" class="dd-item font-ar" @click="showUserMenu = false">
            <AppIcon name="Settings" :size="15" /> الإعدادات
          </RouterLink>
          <div class="dd-divider"></div>
          <button class="dd-item dd-logout font-ar" @click="handleLogout">
            <AppIcon name="LogOut" :size="15" /> تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.admin-topbar {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 0 var(--space-lg);
  height: 64px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  z-index: var(--z-sticky);
}
.mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; color: var(--text-primary); padding: 0.5rem; border-radius: var(--radius-md); }
@media (max-width: 768px) { .mobile-menu-btn { display: flex; align-items: center; } }

.impersonate-banner {
  flex: 1;
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: #fff3cd;
  color: #856404;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 600;
}
[data-theme="dark"] .impersonate-banner { background: #4e3c00; color: #ffc107; }
.stop-btn { background: none; border: none; cursor: pointer; text-decoration: underline; color: inherit; font-size: inherit; padding: 0; font-weight: 700; }

.topbar-end { margin-right: auto; display: flex; align-items: center; gap: var(--space-sm); }
.icon-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.5rem; border-radius: var(--radius-md); transition: all var(--duration-fast); display: flex; align-items: center; }
.icon-btn:hover { background: var(--bg-section); color: var(--text-primary); }

.user-menu-wrap { position: relative; }
.user-btn { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; cursor: pointer; padding: 0.4rem 0.75rem; border-radius: var(--radius-md); color: var(--text-primary); transition: background var(--duration-fast); }
.user-btn:hover { background: var(--bg-section); }
.user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--gradient-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 700; }
.user-name { font-size: 0.875rem; font-weight: 600; }

.user-dropdown {
  position: absolute;
  left: 0;
  top: calc(100% + 4px);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  overflow: hidden;
  z-index: var(--z-dropdown);
}
.dd-item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 0.875rem;
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  transition: background var(--duration-fast);
}
.dd-item:hover { background: var(--bg-section); }
.dd-divider { height: 1px; background: var(--border-color); margin: 0.25rem 0; }
.dd-logout { color: var(--color-error); }
</style>
