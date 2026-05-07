<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRemoteApi } from '@/services/http/client';
import { fetchMyStats } from '@/services/studentStatsService';
import AppIcon from '@/components/common/AppIcon.vue';

const streak = ref(0);
const best = ref(0);
const loading = ref(true);

onMounted(async () => {
  if (!useRemoteApi()) {
    loading.value = false;
    return;
  }
  try {
    const s = await fetchMyStats();
    streak.value = s.currentStreak;
    best.value = s.bestStreak;
  } catch {
    /* تجاهل */
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="streak-widget">
    <div class="streak-icon" aria-hidden="true">
      <AppIcon name="Zap" :size="28" color="var(--color-gold)" />
    </div>
    <div class="streak-body">
      <p class="streak-label font-ar">سلسلة الأيام</p>
      <p v-if="loading" class="streak-value font-en">…</p>
      <p v-else class="streak-value font-en">
        {{ streak }}
        <span class="streak-sub font-ar">يوم</span>
      </p>
      <p class="streak-best font-ar">أفضل سلسلة: {{ best }} يوم</p>
    </div>
  </div>
</template>

<style scoped>
.streak-widget {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-section) 100%);
  border: 1px solid var(--border-color);
}

.streak-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: rgba(244, 168, 37, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.streak-label {
  font-size: var(--text-body-sm);
  color: var(--text-secondary);
  margin: 0;
}

.streak-value {
  font-size: 1.75rem;
  font-weight: var(--weight-bold);
  color: var(--color-navy);
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: var(--space-xxs);
}

[data-theme='dark'] .streak-value {
  color: var(--color-gold);
}

.streak-sub {
  font-size: var(--text-body-sm);
  font-weight: var(--weight-medium);
}

.streak-best {
  font-size: var(--text-body-sm);
  color: var(--text-muted);
  margin: var(--space-xxs) 0 0;
}
</style>
