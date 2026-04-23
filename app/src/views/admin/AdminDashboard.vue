<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import StatCard from '@/components/admin/shared/StatCard.vue';
import ActivityFeed from '@/components/admin/shared/ActivityFeed.vue';
import { useAuth } from '@/composables/useAuth';
import { useAdminUsersStore } from '@/stores/admin/adminUsers';
import { useAdminContentStore } from '@/stores/admin/adminContent';
import { useAdminQuizzesStore } from '@/stores/admin/adminQuizzes';
import AppIcon from '@/components/common/AppIcon.vue';

const router = useRouter();
const { user } = useAuth();
const usersStore = useAdminUsersStore();
const contentStore = useAdminContentStore();
const quizzesStore = useAdminQuizzesStore();

const stats = computed(() => [
  { title: 'إجمالي المستخدمين', value: usersStore.totalUsers, icon: 'Users', color: '#1E3A5F', delta: `${usersStore.activeUsers} نشط`, trend: 'up' as const },
  { title: 'المواد الدراسية', value: contentStore.subjects.length, icon: 'BookOpen', color: '#F4A825', delta: 'كل المراحل', trend: 'neutral' as const },
  { title: 'الكورسات', value: contentStore.courses.length, icon: 'GraduationCap', color: '#2EC4B6', delta: `${contentStore.publishedCourses.length} منشور`, trend: 'up' as const },
  { title: 'الاختبارات', value: quizzesStore.totalQuizzes, icon: 'ClipboardList', color: '#27AE60', delta: `${quizzesStore.publishedQuizzes.length} نشط`, trend: 'neutral' as const }
]);

const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const recentUsers = computed(() => usersStore.users.slice(0, 5));

const quickActions = [
  { label: 'مستخدم جديد', icon: 'UserPlus', to: '/admin/users', color: '#1E3A5F' },
  { label: 'مادة جديدة', icon: 'Plus', to: '/admin/subjects', color: '#F4A825' },
  { label: 'اختبار جديد', icon: 'ClipboardList', to: '/admin/quizzes', color: '#2EC4B6' },
  { label: 'الإعدادات', icon: 'Settings', to: '/admin/settings', color: '#6C757D' }
];
</script>

<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <div class="dash-header">
      <div>
        <h1 class="font-ar">مرحباً، {{ user?.name }} 👋</h1>
        <p class="dash-date font-ar">{{ today }}</p>
      </div>
      <span class="admin-pill font-ar">
        <AppIcon name="Shield" :size="14" />
        سوبر أدمن
      </span>
    </div>

    <!-- KPIs -->
    <div class="stats-grid">
      <StatCard
        v-for="stat in stats"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :icon="stat.icon"
        :color="stat.color"
        :delta="stat.delta"
        :trend="stat.trend"
      />
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions-row">
      <button
        v-for="action in quickActions"
        :key="action.label"
        class="quick-action font-ar"
        :style="`--action-color: ${action.color}`"
        @click="router.push(action.to)"
      >
        <span class="qa-icon">
          <AppIcon :name="action.icon" :size="20" />
        </span>
        {{ action.label }}
      </button>
    </div>

    <!-- Main content -->
    <div class="dash-content">
      <!-- Recent Users -->
      <div class="dash-card">
        <div class="card-header">
          <h3 class="font-ar">أحدث المستخدمين</h3>
          <RouterLink to="/admin/users" class="view-all font-ar">عرض الكل</RouterLink>
        </div>
        <ul class="user-list">
          <li v-for="u in recentUsers" :key="u.id" class="user-row">
            <div class="u-avatar font-ar">{{ u.name?.slice(0, 1) }}</div>
            <div class="u-info">
              <p class="u-name font-ar">{{ u.name }}</p>
              <p class="u-email font-en">{{ u.email }}</p>
            </div>
            <span class="u-grade font-ar">{{ u.grade || '—' }}</span>
          </li>
        </ul>
      </div>

      <!-- Activity Feed -->
      <div class="dash-card">
        <div class="card-header">
          <h3 class="font-ar">آخر النشاطات</h3>
          <RouterLink to="/admin/audit" class="view-all font-ar">عرض السجل</RouterLink>
        </div>
        <ActivityFeed :limit="8" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard { display: flex; flex-direction: column; gap: var(--space-xl); }
.dash-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-sm); }
.dash-header h1 { font-size: var(--text-h2); color: var(--text-primary); }
.dash-date { color: var(--text-muted); font-size: 0.875rem; margin-top: 4px; }
.admin-pill { display: inline-flex; align-items: center; gap: 6px; padding: 0.4rem 1rem; background: #e8eaf6; color: #283593; border-radius: var(--radius-full); font-size: 0.8125rem; font-weight: 700; }
[data-theme="dark"] .admin-pill { background: #1a237e; color: #9fa8da; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); }
@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr; } }

.quick-actions-row { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
.quick-action {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border: 1.5px solid var(--action-color, var(--border-color));
  border-radius: var(--radius-full);
  background: none;
  color: var(--action-color, var(--text-primary));
  font-size: 0.875rem; font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast);
}
.quick-action:hover { background: var(--action-color, var(--color-navy)); color: #fff; }
.qa-icon { display: flex; align-items: center; }

.dash-content { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
@media (max-width: 900px) { .dash-content { grid-template-columns: 1fr; } }

.dash-card { background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); overflow: hidden; }
.card-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-lg); border-bottom: 1px solid var(--border-color); }
.card-header h3 { font-size: var(--text-h4); color: var(--text-primary); }
.view-all { font-size: 0.8125rem; color: var(--color-navy); text-decoration: none; }
.view-all:hover { text-decoration: underline; }

.user-list { list-style: none; }
.user-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem var(--space-lg); border-bottom: 1px solid var(--border-color); }
.user-row:last-child { border-bottom: none; }
.u-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--gradient-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 700; flex-shrink: 0; }
.u-info { flex: 1; min-width: 0; }
.u-name { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
.u-email { font-size: 0.75rem; color: var(--text-muted); }
.u-grade { font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; }
</style>
