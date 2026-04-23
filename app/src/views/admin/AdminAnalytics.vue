<script setup lang="ts">
import { computed, ref } from 'vue';
import StatCard from '@/components/admin/shared/StatCard.vue';
import { useAdminUsersStore } from '@/stores/admin/adminUsers';
import { useAdminContentStore } from '@/stores/admin/adminContent';
import { useAdminQuizzesStore } from '@/stores/admin/adminQuizzes';
import AppIcon from '@/components/common/AppIcon.vue';
import { downloadCSV, toCSV } from '@/lib/csv';

const usersStore = useAdminUsersStore();
const contentStore = useAdminContentStore();
const quizzesStore = useAdminQuizzesStore();

const range = ref<'7d' | '30d' | '90d'>('30d');

// Mock chart data
const signupData = computed(() => {
  const days = range.value === '7d' ? 7 : range.value === '30d' ? 30 : 90;
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    value: Math.floor(Math.random() * 8) + 1
  }));
});

const maxSignups = computed(() => Math.max(...signupData.value.map(d => d.value), 1));

// Grade distribution
const gradeDistrib = computed(() => {
  const counts: Record<string, number> = {};
  usersStore.users.forEach(u => {
    const g = u.grade || 'غير محدد';
    counts[g] = (counts[g] || 0) + 1;
  });
  return Object.entries(counts).slice(0, 5).map(([grade, count]) => ({ grade, count }));
});

const totalStudents = computed(() => usersStore.users.filter(u => u.role === 'student').length);

function exportReport() {
  const rows = usersStore.users.map(u => ({
    name: u.name, email: u.email, role: u.role, grade: u.grade || '', createdAt: u.createdAt
  }));
  downloadCSV(`report-${new Date().toISOString().slice(0, 10)}.csv`,
    toCSV(rows as Record<string, unknown>[], ['name', 'email', 'role', 'grade', 'createdAt']));
}

// SVG bar chart helpers
const BAR_H = 80;
function barHeight(val: number) { return (val / maxSignups.value) * BAR_H; }
</script>

<template>
  <div class="admin-analytics">
    <div class="page-header">
      <h2 class="font-ar">الإحصائيات والتقارير</h2>
      <div class="header-actions">
        <div class="range-btns">
          <button v-for="r in ['7d', '30d', '90d']" :key="r" class="range-btn font-ar" :class="{ active: range === r }" @click="range = r as '7d'|'30d'|'90d'">
            {{ r === '7d' ? '7 أيام' : r === '30d' ? '30 يوم' : '90 يوم' }}
          </button>
        </div>
        <button class="btn btn-outline font-ar" @click="exportReport">
          <AppIcon name="Download" :size="14" /> تصدير CSV
        </button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="stats-grid">
      <StatCard title="إجمالي الطلاب" :value="totalStudents" icon="Users" color="#1E3A5F" />
      <StatCard title="المواد المنشورة" :value="contentStore.subjects.length" icon="BookOpen" color="#F4A825" />
      <StatCard title="الكورسات النشطة" :value="contentStore.publishedCourses.length" icon="GraduationCap" color="#2EC4B6" />
      <StatCard title="الاختبارات المنشورة" :value="quizzesStore.publishedQuizzes.length" icon="ClipboardList" color="#27AE60" />
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- Signups Chart -->
      <div class="chart-card">
        <h3 class="font-ar chart-title">تسجيلات المستخدمين (آخر {{ range === '7d' ? 7 : range === '30d' ? 30 : 90 }} يوم)</h3>
        <div class="bar-chart" dir="ltr">
          <svg :width="signupData.length * 12" :height="BAR_H + 20" viewBox="0 0 400 100" preserveAspectRatio="none">
            <g v-for="(d, i) in signupData" :key="i">
              <rect
                :x="(i / signupData.length) * 400"
                :y="BAR_H - barHeight(d.value)"
                :width="(1 / signupData.length) * 390"
                :height="barHeight(d.value)"
                fill="var(--color-navy)"
                rx="2"
                opacity="0.8"
              />
            </g>
          </svg>
        </div>
        <p class="chart-note font-ar">{{ signupData.reduce((a, b) => a + b.value, 0) }} تسجيل تقريبي</p>
      </div>

      <!-- Grade Distribution -->
      <div class="chart-card">
        <h3 class="font-ar chart-title">توزيع الطلاب حسب الصف</h3>
        <div class="dist-list">
          <div v-for="item in gradeDistrib" :key="item.grade" class="dist-row">
            <span class="dist-label font-ar">{{ item.grade }}</span>
            <div class="dist-bar-wrap">
              <div class="dist-bar" :style="`width: ${(item.count / totalStudents) * 100}%`"></div>
            </div>
            <span class="dist-count font-en">{{ item.count }}</span>
          </div>
          <p v-if="!gradeDistrib.length" class="font-ar empty">لا توجد بيانات</p>
        </div>
      </div>
    </div>

    <!-- Funnel -->
    <div class="funnel-card">
      <h3 class="font-ar chart-title">قمع الاشتراك</h3>
      <div class="funnel">
        <div class="funnel-step" v-for="(step, i) in [
          { label: 'التسجيل', value: usersStore.totalUsers, icon: 'UserPlus' },
          { label: 'أول درس', value: Math.floor(usersStore.totalUsers * 0.75), icon: 'Play' },
          { label: 'أول اختبار', value: Math.floor(usersStore.totalUsers * 0.5), icon: 'ClipboardList' },
          { label: 'إكمال كورس', value: Math.floor(usersStore.totalUsers * 0.3), icon: 'Award' }
        ]" :key="i">
          <AppIcon :name="step.icon" :size="20" color="var(--color-navy)" />
          <p class="step-label font-ar">{{ step.label }}</p>
          <p class="step-value font-en">{{ step.value }}</p>
          <div class="step-bar" :style="`width: ${usersStore.totalUsers > 0 ? (step.value / usersStore.totalUsers) * 100 : 0}%`"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-analytics { display: flex; flex-direction: column; gap: var(--space-xl); }
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md); }
.page-header h2 { font-size: var(--text-h2); color: var(--text-primary); }
.header-actions { display: flex; gap: var(--space-sm); align-items: center; flex-wrap: wrap; }
.range-btns { display: flex; gap: 0.25rem; background: var(--bg-section); border-radius: var(--radius-full); padding: 3px; }
.range-btn { padding: 0.35rem 0.875rem; border: none; background: none; border-radius: var(--radius-full); cursor: pointer; font-size: 0.8125rem; color: var(--text-secondary); transition: all var(--duration-fast); }
.range-btn.active { background: var(--bg-card); color: var(--color-navy); font-weight: 700; box-shadow: var(--shadow-sm); }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); }
@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr; } }

.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
@media (max-width: 900px) { .charts-row { grid-template-columns: 1fr; } }

.chart-card, .funnel-card { background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); padding: var(--space-lg); }
.chart-title { font-size: var(--text-h4); color: var(--text-primary); margin-bottom: var(--space-md); }
.bar-chart { overflow-x: auto; margin-bottom: 0.5rem; }
.bar-chart svg { display: block; width: 100%; height: 80px; }
.chart-note { font-size: 0.75rem; color: var(--text-muted); text-align: center; }

.dist-list { display: flex; flex-direction: column; gap: 0.75rem; }
.dist-row { display: flex; align-items: center; gap: 0.75rem; }
.dist-label { font-size: 0.8125rem; color: var(--text-secondary); min-width: 120px; text-align: right; }
.dist-bar-wrap { flex: 1; height: 8px; background: var(--bg-section); border-radius: var(--radius-full); overflow: hidden; }
.dist-bar { height: 100%; background: var(--color-navy); border-radius: var(--radius-full); transition: width 0.5s var(--ease-smooth); }
.dist-count { font-size: 0.8125rem; color: var(--text-muted); min-width: 20px; text-align: center; }
.empty { color: var(--text-muted); text-align: center; padding: var(--space-lg); }

.funnel { display: flex; gap: var(--space-md); flex-wrap: wrap; }
.funnel-step { flex: 1; min-width: 120px; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: var(--space-md); background: var(--bg-section); border-radius: var(--radius-lg); }
.step-label { font-size: 0.8125rem; color: var(--text-secondary); text-align: center; }
.step-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
.step-bar { height: 4px; background: var(--color-gold); border-radius: var(--radius-full); margin-top: 0.25rem; min-width: 4px; transition: width 0.5s; }

.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem; border-radius: var(--radius-md); border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all var(--duration-fast); }
.btn-outline { background: none; border: 1.5px solid var(--border-color); color: var(--text-secondary); }
.btn-outline:hover { border-color: var(--color-navy); color: var(--color-navy); }
</style>
