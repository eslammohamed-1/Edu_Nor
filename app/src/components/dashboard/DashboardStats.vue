<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue';

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  delta?: string;
}

interface Props {
  userName: string;
  stats: StatItem[];
}

defineProps<Props>();
</script>

<template>
  <section class="dashboard-stats">
    <div class="welcome">
      <h1 class="welcome-title font-ar text-navy">
        أهلاً بعودتك، <span class="text-gold">{{ userName }}</span> 👋
      </h1>
      <p class="welcome-subtitle font-ar text-secondary">
        لنواصل رحلة التعلم من حيث توقفنا.
      </p>
    </div>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-icon" :style="{ backgroundColor: stat.color + '15' }">
          <AppIcon :name="stat.icon" :size="24" :color="stat.color" />
        </div>
        <div class="stat-body">
          <span class="stat-label font-ar">{{ stat.label }}</span>
          <strong class="stat-value font-en">{{ stat.value }}</strong>
          <span v-if="stat.delta" class="stat-delta font-ar">
            <AppIcon name="TrendingUp" :size="12" color="var(--color-success)" />
            {{ stat.delta }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.welcome-title {
  font-size: var(--text-h2);
  margin-bottom: var(--space-xs);
}

.welcome-subtitle {
  font-size: var(--text-body);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-md);
}

.stat-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  display: flex;
  gap: var(--space-md);
  align-items: center;
  transition: all var(--duration-fast);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.stat-label {
  font-size: var(--text-caption);
  color: var(--text-muted);
}

.stat-value {
  font-size: var(--text-h3);
  font-weight: var(--weight-bold);
  color: var(--color-navy);
  line-height: 1.2;
}

.stat-delta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: var(--text-caption);
  color: var(--color-success);
  font-weight: var(--weight-medium);
}
</style>
