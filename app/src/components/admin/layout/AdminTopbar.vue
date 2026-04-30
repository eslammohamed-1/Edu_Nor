<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import AppIcon from '@/components/common/AppIcon.vue';
import { useAuth } from '@/composables/useAuth';
import { useTheme } from '@/composables/useTheme';
import { useImpersonate } from '@/composables/useImpersonate';
import { adminNavSections } from '@/config/adminNav';

defineProps<{ sidebarWidth?: number }>();
const emit = defineEmits<{ 'toggle-mobile': [] }>();

const router = useRouter();
const { user, logout } = useAuth();
const { isDark, toggle: toggleTheme } = useTheme();
const impersonate = useImpersonate();

const showUserMenu = ref(false);
const searchQ = ref('');
const searchOpen = ref(false);
const showNotifications = ref(false);

const flatNav = computed(() =>
  adminNavSections.flatMap(s => s.links.map(l => ({ ...l, section: s.title })))
);

const searchResults = computed(() => {
  const q = searchQ.value.trim().toLowerCase();
  if (!q) return [];
  return flatNav.value.filter(
    l => l.label.toLowerCase().includes(q) || l.to.toLowerCase().includes(q)
  );
});

function goSearch(to: string) {
  searchOpen.value = false;
  searchQ.value = '';
  router.push(to);
}

function blurSearch() {
  window.setTimeout(() => {
    searchOpen.value = false;
  }, 180);
}

const notifications = [
  { id: '1', text: 'تم نشر كورس جديد (عرض تجريبي)', time: 'منذ ساعة', icon: 'GraduationCap' },
  { id: '2', text: '٣ مستخدمين سجلوا اليوم (محاكاة)', time: 'منذ ٣ ساعات', icon: 'UserPlus' },
  { id: '3', text: 'نسخة احتياطية مقترحة أسبوعياً', time: 'أمس', icon: 'Database' }
];

async function handleLogout() {
  await logout();
  await router.push('/login');
}

const impersonating = ref(impersonate.isImpersonating);

function stopImpersonate() {
  impersonate.stop();
}
</script>

<template>
  <header class="admin-topbar">
    <button class="mobile-menu-btn" type="button" @click="emit('toggle-mobile')">
      <AppIcon name="Menu" :size="20" />
    </button>

    <div v-if="impersonating" class="impersonate-banner font-ar">
      <AppIcon name="AlertTriangle" :size="14" />
      أنت تتصفح كمستخدم آخر —
      <button type="button" class="stop-btn font-ar" @click="stopImpersonate">عُد لحسابك</button>
    </div>

    <div class="topbar-search">
      <div class="search-inner">
        <AppIcon name="Search" :size="18" class="search-icon" />
        <input
          v-model="searchQ"
          type="search"
          class="search-input font-ar"
          placeholder="بحث في لوحة الإدارة..."
          autocomplete="off"
          @focus="searchOpen = true"
          @blur="blurSearch"
          @keydown.enter.prevent="searchResults[0] && goSearch(searchResults[0].to)"
        />
      </div>
      <div v-if="searchOpen && searchResults.length" class="search-dropdown font-ar">
        <button
          v-for="r in searchResults"
          :key="r.to"
          type="button"
          class="search-hit"
          @mousedown.prevent="goSearch(r.to)"
        >
          <AppIcon :name="r.icon" :size="16" />
          {{ r.label }}
          <span class="hit-section">{{ r.section }}</span>
        </button>
      </div>
      <div v-else-if="searchOpen && searchQ.trim() && !searchResults.length" class="search-dropdown font-ar search-empty">
        لا توجد نتائج
      </div>
    </div>

    <div class="topbar-end">
      <div class="notif-wrap">
        <button
          type="button"
          class="icon-btn"
          aria-label="الإشعارات"
          @click="showNotifications = !showNotifications"
        >
          <AppIcon name="Bell" :size="18" />
          <span class="notif-dot"></span>
        </button>
        <div v-if="showNotifications" class="notif-dropdown font-ar" @mouseleave="showNotifications = false">
          <p class="notif-head">إشعارات (تجريبي)</p>
          <button v-for="n in notifications" :key="n.id" type="button" class="notif-item">
            <AppIcon :name="n.icon" :size="16" />
            <span>
              {{ n.text }}
              <small>{{ n.time }}</small>
            </span>
          </button>
        </div>
      </div>

      <button type="button" class="icon-btn" @click="toggleTheme" :title="isDark ? 'وضع النهار' : 'وضع الليل'">
        <AppIcon :name="isDark ? 'Sun' : 'Moon'" :size="18" />
      </button>

      <div class="user-menu-wrap" @mouseleave="showUserMenu = false">
        <button type="button" class="user-btn" @click="showUserMenu = !showUserMenu">
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
          <button type="button" class="dd-item dd-logout font-ar" @click="handleLogout">
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

.topbar-search {
  flex: 1;
  min-width: 0;
  max-width: 420px;
  position: relative;
  margin-inline: var(--space-md);
}
.search-inner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  background: var(--bg-section);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
}
.search-icon { color: var(--text-muted); flex-shrink: 0; }
.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary);
  outline: none;
}
.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: calc(var(--z-dropdown) + 1);
  max-height: 280px;
  overflow-y: auto;
}
.search-hit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-primary);
  text-align: right;
}
.search-hit:hover { background: var(--bg-section); }
.hit-section {
  margin-inline-start: auto;
  font-size: 0.7rem;
  color: var(--text-muted);
}
.search-empty {
  padding: 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.topbar-end { margin-inline-start: auto; display: flex; align-items: center; gap: var(--space-sm); }
.notif-wrap { position: relative; }
.notif-dot {
  position: absolute;
  top: 6px;
  inset-inline-end: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-error);
}
.notif-dropdown {
  position: absolute;
  inset-inline-end: 0;
  top: calc(100% + 6px);
  width: 280px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  padding: 0.5rem 0;
}
.notif-head {
  padding: 0.35rem 1rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
}
.notif-item {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  width: 100%;
  padding: 0.6rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  text-align: right;
  font-size: 0.8125rem;
  color: var(--text-primary);
}
.notif-item:hover { background: var(--bg-section); }
.notif-item small {
  display: block;
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 0.7rem;
}

@media (max-width: 768px) {
  .topbar-search { display: none; }
}
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
