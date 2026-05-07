<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useRemoteApi } from '@/services/http/client';
import { fetchWeeklyLeaderboard } from '@/services/studentStatsService';
import AppIcon from '@/components/common/AppIcon.vue';
import AppButton from '@/components/common/AppButton.vue';

const data = ref<Awaited<ReturnType<typeof fetchWeeklyLeaderboard>> | null>(null);
const err = ref('');

onMounted(async () => {
  if (!useRemoteApi()) {
    err.value = 'ربط الواجهة بالخادم غير مفعّل';
    return;
  }
  try {
    data.value = await fetchWeeklyLeaderboard();
  } catch (e) {
    err.value = e instanceof Error ? e.message : 'تعذّر التحميل';
  }
});
</script>

<template>
  <div class="leaderboard-page container">
    <header class="page-head">
      <h1 class="font-ar text-navy">لوحة المتصدرين</h1>
      <p class="font-ar text-secondary">
        ترتيب أسبوعي حسب النقاط ضمن صفّك
        <template v-if="data?.weekKey">
          — <span class="font-en">{{ data.weekKey }}</span>
        </template>
      </p>
    </header>

    <p v-if="err" class="err font-ar">{{ err }}</p>

    <div v-else-if="data" class="board card">
      <div v-if="data.myRank != null" class="me-rank font-ar">
        <AppIcon name="TrendingUp" :size="20" color="var(--color-gold)" />
        ترتيبك هذا الأسبوع: {{ data.myRank }}
      </div>
      <table class="table font-ar">
        <thead>
          <tr>
            <th>#</th>
            <th>الطالب</th>
            <th>النقاط الأسبوعية</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in data.items" :key="r.userId">
            <td class="font-en">{{ r.rank }}</td>
            <td>{{ r.name }}</td>
            <td class="font-en">{{ r.weeklyPoints }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!data.items.length" class="muted font-ar">لا بيانات لهذا الأسبوع بعد.</p>

      <RouterLink to="/dashboard">
        <AppButton variant="ghost">العودة للوحة</AppButton>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.leaderboard-page {
  padding: var(--space-2xl) var(--space-md) var(--space-4xl);
  max-width: 720px;
}

.page-head h1 {
  margin: 0 0 var(--space-xs);
}

.err {
  color: var(--color-error);
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  margin-top: var(--space-lg);
}

.me-rank {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  font-weight: var(--weight-semibold);
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--space-lg);
}

.table th,
.table td {
  padding: var(--space-sm) var(--space-md);
  text-align: start;
  border-bottom: 1px solid var(--border-color);
}

.table th {
  color: var(--text-secondary);
  font-weight: var(--weight-semibold);
}

.muted {
  color: var(--text-muted);
}
</style>
