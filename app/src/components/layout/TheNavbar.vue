<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import AppButton from '@/components/common/AppButton.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import { useTheme } from '@/composables/useTheme';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { isDark, toggle } = useTheme();
const { isAuthenticated, user, logout, isSuperAdmin } = useAuth();

const isMobileMenuOpen = ref(false);
const isUserMenuOpen = ref(false);

function closeMobile() {
  isMobileMenuOpen.value = false;
}

function handleLogout() {
  logout();
  isUserMenuOpen.value = false;
  router.push('/');
}
</script>

<template>
  <nav class="the-navbar shadow-sm">
    <div class="container navbar-container">
      <RouterLink to="/" class="navbar-logo">
        <AppIcon name="GraduationCap" :size="32" color="var(--color-gold)" />
        <span class="logo-text font-en">Edu<span class="text-gold">Nor</span></span>
      </RouterLink>

      <div class="navbar-links hidden-mobile">
        <RouterLink to="/" class="nav-link font-ar">الرئيسية</RouterLink>
        <RouterLink to="/subjects" class="nav-link font-ar">المواد الدراسية</RouterLink>
        <RouterLink to="/quiz" class="nav-link font-ar">الاختبارات</RouterLink>
        <RouterLink v-if="isAuthenticated" to="/dashboard" class="nav-link font-ar">لوحتي</RouterLink>
        <RouterLink
          v-if="isSuperAdmin"
          to="/admin"
          class="nav-link font-ar nav-link--admin"
        >
          إدارة المنصة
        </RouterLink>
      </div>

      <div class="navbar-actions">
        <button
          class="theme-toggle"
          @click="toggle"
          :title="isDark ? 'الوضع الفاتح' : 'الوضع الليلي'"
          aria-label="تبديل الوضع"
        >
          <AppIcon :name="isDark ? 'Sun' : 'Moon'" :size="20" />
        </button>

        <div v-if="isAuthenticated && user" class="user-menu-wrap hidden-mobile">
          <button
            class="user-menu-btn"
            @click="isUserMenuOpen = !isUserMenuOpen"
            aria-label="قائمة المستخدم"
          >
            <span class="user-avatar font-en">{{ user.name.charAt(0).toUpperCase() }}</span>
            <span class="user-name-short font-ar">{{ user.name }}</span>
            <AppIcon name="ChevronDown" :size="16" />
          </button>
          <div v-if="isUserMenuOpen" class="user-dropdown shadow-lg" @click="isUserMenuOpen = false">
            <RouterLink to="/dashboard" class="dropdown-item font-ar">
              <AppIcon name="LayoutDashboard" :size="16" />
              لوحة التحكم
            </RouterLink>
            <RouterLink to="/profile" class="dropdown-item font-ar">
              <AppIcon name="User" :size="16" />
              الملف الشخصي
            </RouterLink>
            <RouterLink v-if="isSuperAdmin" to="/admin" class="dropdown-item font-ar">
              <AppIcon name="Shield" :size="16" />
              إدارة المنصة
            </RouterLink>
            <button class="dropdown-item dropdown-item--danger font-ar" @click="handleLogout">
              <AppIcon name="LogOut" :size="16" />
              تسجيل الخروج
            </button>
          </div>
        </div>

        <div v-else class="hidden-mobile flex gap-sm">
          <RouterLink to="/login">
            <AppButton variant="ghost" size="sm">تسجيل دخول</AppButton>
          </RouterLink>
          <RouterLink to="/register">
            <AppButton size="sm">إنشاء حساب</AppButton>
          </RouterLink>
        </div>

        <button
          class="mobile-toggle show-mobile"
          @click="isMobileMenuOpen = true"
          aria-label="فتح القائمة"
        >
          <AppIcon name="Menu" :size="24" />
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isMobileMenuOpen"
          class="mobile-overlay"
          @click="closeMobile"
        ></div>
      </Transition>
      <Transition name="slide-right">
        <div v-if="isMobileMenuOpen" class="mobile-drawer shadow-xl">
          <div class="drawer-header">
            <span class="logo-text font-en">Edu<span class="text-gold">Nor</span></span>
            <button @click="closeMobile" aria-label="إغلاق">
              <AppIcon name="X" :size="24" />
            </button>
          </div>
          <div class="drawer-links p-lg flex flex-col gap-lg">
            <RouterLink to="/" class="nav-link font-ar" @click="closeMobile">الرئيسية</RouterLink>
            <RouterLink to="/subjects" class="nav-link font-ar" @click="closeMobile">المواد الدراسية</RouterLink>
            <RouterLink to="/quiz" class="nav-link font-ar" @click="closeMobile">الاختبارات</RouterLink>
            <RouterLink v-if="isAuthenticated" to="/dashboard" class="nav-link font-ar" @click="closeMobile">لوحتي</RouterLink>
            <RouterLink
              v-if="isSuperAdmin"
              to="/admin"
              class="nav-link font-ar"
              @click="closeMobile"
            >
              إدارة المنصة
            </RouterLink>

            <div class="flex flex-col gap-md pt-lg">
              <template v-if="isAuthenticated">
                <RouterLink to="/profile" @click="closeMobile">
                  <AppButton block variant="secondary">الملف الشخصي</AppButton>
                </RouterLink>
                <AppButton block variant="danger" @click="handleLogout(); closeMobile()">
                  تسجيل الخروج
                </AppButton>
              </template>
              <template v-else>
                <RouterLink to="/register" @click="closeMobile">
                  <AppButton block>إنشاء حساب</AppButton>
                </RouterLink>
                <RouterLink to="/login" @click="closeMobile">
                  <AppButton block variant="secondary">تسجيل دخول</AppButton>
                </RouterLink>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<style scoped>
.the-navbar {
  height: var(--navbar-height);
  background-color: var(--bg-card);
  position: sticky;
  top: 0;
  z-index: var(--z-navbar);
  display: flex;
  align-items: center;
  transition: background-color var(--duration-normal);
  border-bottom: 1px solid var(--border-color);
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  text-decoration: none;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: var(--weight-bold);
  color: var(--color-navy);
}

[data-theme="dark"] .logo-text { color: var(--color-white); }

.navbar-links {
  display: flex;
  gap: var(--space-xl);
}

.nav-link {
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
  transition: color var(--duration-fast);
}

.nav-link:hover,
.router-link-active {
  color: var(--color-navy);
}

.nav-link--admin {
  color: var(--color-gold) !important;
  font-weight: var(--weight-semibold);
}

[data-theme="dark"] .nav-link:hover,
[data-theme="dark"] .router-link-active {
  color: var(--color-gold);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.theme-toggle {
  color: var(--text-secondary);
  padding: var(--space-xs);
  border-radius: var(--radius-full);
  transition: background-color var(--duration-fast);
}

.theme-toggle:hover {
  background-color: var(--bg-section);
  color: var(--color-navy);
}

.user-menu-wrap {
  position: relative;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xxs) var(--space-xs);
  border-radius: var(--radius-full);
  background-color: var(--bg-section);
  transition: all var(--duration-fast);
  color: var(--text-primary);
}

.user-menu-btn:hover {
  background-color: var(--color-gold);
  color: var(--color-navy);
}

.user-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  color: var(--color-white);
  border-radius: var(--radius-full);
  font-weight: var(--weight-bold);
  font-size: var(--text-body-sm);
}

.user-name-short {
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--text-body-sm);
  font-weight: var(--weight-semibold);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  inset-inline-end: 0;
  min-width: 220px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-xs);
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: var(--z-dropdown);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--text-body-sm);
  text-align: inherit;
  font-weight: var(--weight-medium);
  transition: background-color var(--duration-fast);
  width: 100%;
}

.dropdown-item:hover {
  background-color: var(--bg-section);
}

.dropdown-item--danger {
  color: var(--color-error);
  border-top: 1px solid var(--border-color);
  margin-top: var(--space-xxs);
  padding-top: var(--space-sm);
}

@media (max-width: 768px) {
  .hidden-mobile { display: none; }
}

@media (min-width: 769px) {
  .show-mobile { display: none; }
}

.mobile-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-drawer) - 1);
}

.mobile-drawer {
  position: fixed;
  top: 0;
  inset-inline-end: 0;
  width: 280px;
  height: 100%;
  background-color: var(--bg-card);
  z-index: var(--z-drawer);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s var(--ease-smooth);
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pt-lg { padding-top: var(--space-lg); }
.p-lg { padding: var(--space-lg); }
</style>
