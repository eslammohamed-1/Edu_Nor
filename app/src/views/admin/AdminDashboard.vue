<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import StatCard from '@/components/admin/shared/StatCard.vue';
import ActivityFeed from '@/components/admin/shared/ActivityFeed.vue';
import KpiChart from '@/components/admin/analytics/KpiChart.vue';
import { useAuth } from '@/composables/useAuth';
import { useAdminUsersStore } from '@/stores/admin/adminUsers';
import { useAdminContentStore } from '@/stores/admin/adminContent';
import { useAdminQuizzesStore } from '@/stores/admin/adminQuizzes';
import { useAdminAuditStore } from '@/stores/admin/adminAudit';
import { useAdminSessionsStore } from '@/stores/admin/adminSessions';
import AppIcon from '@/components/common/AppIcon.vue';
import { seededSeries } from '@/lib/chartSeed';
import RoleBadge from '@/components/admin/users/RoleBadge.vue';
import {
  adminDashboardQuickActions as quickActions,
  adminDashboardDemoRevenueStat,
  adminDashboardChartTitles
} from '@/fixtures/demo/adminDashboard.seed';

const router = useRouter();
const { user } = useAuth();
const usersStore = useAdminUsersStore();
const contentStore = useAdminContentStore();
const quizzesStore = useAdminQuizzesStore();
const auditStore = useAdminAuditStore();
const sessionsStore = useAdminSessionsStore();

const dashLoading = ref(true);

let dashLoadTimer: number | undefined;
onMounted(() => {
  dashLoadTimer = window.setTimeout(() => {
    dashLoading.value = false;
  }, 380);
});

onUnmounted(() => {
  if (dashLoadTimer !== undefined) window.clearTimeout(dashLoadTimer);
});

const statsPrimary = computed(() => [
  {
    title: 'إجمالي المستخدمين',
    value: usersStore.totalUsers,
    icon: 'Users',
    color: '#1E3A5F',
    delta: `${usersStore.activeUsers} نشط`,
    trend: 'up' as const
  },
  {
    title: 'المواد الدراسية',
    value: contentStore.subjects.length,
    icon: 'BookOpen',
    color: '#F4A825',
    delta: 'كل المراحل',
    trend: 'neutral' as const
  },
  {
    title: 'الكورسات',
    value: contentStore.courses.length,
    icon: 'GraduationCap',
    color: '#2EC4B6',
    delta: `${contentStore.publishedCourses.length} منشور`,
    trend: 'up' as const
  },
  {
    title: 'الاختبارات',
    value: quizzesStore.totalQuizzes,
    icon: 'ClipboardList',
    color: '#27AE60',
    delta: `${quizzesStore.publishedQuizzes.length} نشط`,
    trend: 'neutral' as const
  }
]);

const avgPassingScore = computed(() => {
  const qs = quizzesStore.quizzes;
  if (!qs.length) return 0;
  return Math.round(qs.reduce((a, q) => a + q.passingScore, 0) / qs.length);
});

const statsSecondary = computed(() => [
  {
    title: 'الدروس',
    value: contentStore.lessons.length,
    icon: 'PlayCircle',
    color: '#6C5CE7',
    delta: 'في الكتالوج',
    trend: 'neutral' as const
  },
  { ...adminDashboardDemoRevenueStat },
  {
    title: 'متوسط درجة الاجتياز',
    value: avgPassingScore.value ? `${avgPassingScore.value}%` : '—',
    icon: 'Percent',
    color: '#E17055',
    delta: 'من إعدادات الاختبارات',
    trend: 'neutral' as const
  },
  {
    title: 'جلسات نشطة (تجريبي)',
    value: sessionsStore.activeCount,
    icon: 'MonitorSmartphone',
    color: '#0984E3',
    delta: 'من لوحة الأمان',
    trend: 'neutral' as const
  }
]);

const today = new Date().toLocaleDateString('ar-EG', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const recentUsers = computed(() =>
  [...usersStore.users].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5)
);

const recentQuizzes = computed(() =>
  [...quizzesStore.quizzes].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5)
);

const signupSeries = computed(() =>
  seededSeries(30, usersStore.totalUsers + 11, 14, 2)
);

const lessonCompletionSeries = computed(() =>
  seededSeries(30, contentStore.lessons.length + 3, 120, 15)
);

const failedLogins = computed(() =>
  auditStore.logs.filter(l => l.action === 'auth.login.failed').slice(0, 5)
);
</script>

<template>
  <div class="admin-dashboard">
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

    <p class="dash-note font-ar">
      الأرقام والرسوم البيانية هنا تعكس البيانات المحفوظة في المتصفح (ومحتوى أولي مستورد). ما يُعرض كـ «تجريبي» أو «محاكاة» ليس من خادم حقيقي بعد.
    </p>

    <div class="stats-grid">
      <StatCard
        v-for="stat in statsPrimary"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :icon="stat.icon"
        :color="stat.color"
        :delta="stat.delta"
        :trend="stat.trend"
        :loading="dashLoading"
      />
    </div>

    <div class="stats-grid">
      <StatCard
        v-for="stat in statsSecondary"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :icon="stat.icon"
        :color="stat.color"
        :delta="stat.delta"
        :trend="stat.trend"
        :loading="dashLoading"
      />
    </div>

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

    <div class="charts-row">
      <KpiChart
        :title="adminDashboardChartTitles.signupsLine"
        type="line"
        :values="signupSeries"
        color="var(--color-navy)"
        unit-label="مستخدمون جدد يومياً"
      />
      <KpiChart
        :title="adminDashboardChartTitles.lessonsBar"
        type="bar"
        :values="lessonCompletionSeries"
        color="var(--color-gold)"
        unit-label="عمليات إكمال"
      />
    </div>

    <div class="dash-content">
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
            <RoleBadge :role="u.role" />
            <span class="u-grade font-ar">{{ u.grade || '—' }}</span>
          </li>
        </ul>
      </div>

      <div class="dash-card">
        <div class="card-header">
          <h3 class="font-ar">آخر النشاطات</h3>
          <RouterLink to="/admin/audit" class="view-all font-ar">عرض السجل</RouterLink>
        </div>
        <ActivityFeed :limit="8" />
      </div>
    </div>

    <div class="dash-card quizzes-card">
      <div class="card-header">
        <h3 class="font-ar">أحدث الاختبارات</h3>
        <RouterLink to="/admin/quizzes" class="view-all font-ar">عرض الكل</RouterLink>
      </div>
      <ul class="quiz-list">
        <li v-for="q in recentQuizzes" :key="q.id" class="quiz-row">
          <div class="quiz-main">
            <p class="quiz-title font-ar">{{ q.title }}</p>
            <p class="quiz-meta font-ar">
              {{ q.questions?.length ?? 0 }} سؤال · درجة الاجتياز {{ q.passingScore }}%
            </p>
          </div>
          <RouterLink :to="`/admin/quizzes/${q.id}/edit`" class="quiz-edit font-ar">تحرير</RouterLink>
        </li>
        <li v-if="!recentQuizzes.length" class="font-ar empty-row">لا توجد اختبارات بعد.</li>
      </ul>
    </div>

    <div class="security-strip dash-card">
      <div class="card-header">
        <h3 class="font-ar">
          <AppIcon name="AlertTriangle" :size="16" />
          تنبيهات أمنية
        </h3>
        <RouterLink to="/admin/security" class="view-all font-ar">إدارة الأمان</RouterLink>
      </div>
      <ul v-if="failedLogins.length" class="fail-list">
        <li v-for="log in failedLogins" :key="log.id" class="fail-row font-ar">
          <span class="fail-dot"></span>
          محاولة دخول فاشلة
          <span class="font-en fail-email">{{ (log.meta?.email as string) || '—' }}</span>
          <span class="fail-time">{{ new Date(log.createdAt).toLocaleString('ar-EG') }}</span>
        </li>
      </ul>
      <p v-else class="font-ar sec-ok">لا توجد محاولات فاشلة مسجّلة مؤخراً.</p>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}
.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
.dash-header h1 {
  font-size: var(--text-h2);
  color: var(--text-primary);
}
.dash-date {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 4px;
}
.dash-note {
  font-size: 0.8125rem;
  color: var(--text-muted);
  line-height: 1.55;
  padding: 0 var(--space-xs);
  margin-top: calc(var(--space-sm) * -1);
  max-width: 720px;
}
.admin-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.4rem 1rem;
  background: #e8eaf6;
  color: #283593;
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 700;
}
[data-theme='dark'] .admin-pill {
  background: #1a237e;
  color: #9fa8da;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.quick-actions-row {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}
.quick-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border: 1.5px solid var(--action-color, var(--border-color));
  border-radius: var(--radius-full);
  background: none;
  color: var(--action-color, var(--text-primary));
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast);
}
.quick-action:hover {
  background: var(--action-color, var(--color-navy));
  color: #fff;
}
.qa-icon {
  display: flex;
  align-items: center;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}
@media (max-width: 900px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}

.dash-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}
@media (max-width: 900px) {
  .dash-content {
    grid-template-columns: 1fr;
  }
}

.dash-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  overflow: hidden;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
}
.card-header h3 {
  font-size: var(--text-h4);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.view-all {
  font-size: 0.8125rem;
  color: var(--color-navy);
  text-decoration: none;
}
.view-all:hover {
  text-decoration: underline;
}

.user-list {
  list-style: none;
}
.user-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem var(--space-lg);
  border-bottom: 1px solid var(--border-color);
}
.user-row:last-child {
  border-bottom: none;
}
.u-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
}
.u-info {
  flex: 1;
  min-width: 0;
}
.u-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}
.u-email {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.u-grade {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.quizzes-card .quiz-list {
  list-style: none;
}
.quiz-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: 0.75rem var(--space-lg);
  border-bottom: 1px solid var(--border-color);
}
.quiz-row:last-child {
  border-bottom: none;
}
.quiz-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
}
.quiz-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 2px;
}
.quiz-edit {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-navy);
  text-decoration: none;
  white-space: nowrap;
}
.empty-row {
  padding: var(--space-xl);
  text-align: center;
  color: var(--text-muted);
}

.security-strip .fail-list {
  list-style: none;
  padding: 0 var(--space-lg) var(--space-lg);
}
.fail-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  padding: 0.35rem 0;
}
.fail-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-error);
  flex-shrink: 0;
}
.fail-email {
  color: var(--text-primary);
  font-weight: 600;
}
.fail-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.sec-ok {
  padding: var(--space-lg);
  color: var(--text-muted);
  font-size: 0.875rem;
}
</style>
