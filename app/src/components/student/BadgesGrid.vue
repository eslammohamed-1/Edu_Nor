<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRemoteApi } from '@/services/http/client';
import { fetchMyStats } from '@/services/studentStatsService';
import AppIcon from '@/components/common/AppIcon.vue';

const ALL_BADGES: { id: string; label: string; hint: string }[] = [
  { id: 'first_lesson', label: 'بداية مشوارة', hint: 'أكمل أول درس' },
  { id: 'streak_7', label: 'أسبوع قوّي', hint: 'سلسلة 7 أيام' },
  { id: 'streak_30', label: 'إصرار', hint: 'سلسلة 30 يوماً' },
  { id: 'bookworm', label: 'مثابر', hint: 'عشرون درساً مكتملاً' },
  { id: 'quiz_master', label: 'بطل اختبارات', hint: 'اجتياز 5 اختبارات' },
  { id: 'subject_hero', label: 'بطل مادة', hint: 'إتمام مادة كاملة' }
];

const earned = ref<Set<string>>(new Set());
const loading = ref(true);

onMounted(async () => {
  if (!useRemoteApi()) {
    loading.value = false;
    return;
  }
  try {
    const s = await fetchMyStats();
    earned.value = new Set(s.badges ?? []);
  } catch {
    /* تجاهل */
  } finally {
    loading.value = false;
  }
});

const grid = computed(() =>
  ALL_BADGES.map((b) => ({
    ...b,
    unlocked: earned.value.has(b.id)
  }))
);
</script>

<template>
  <div class="badges-grid-wrap">
    <h3 class="heading font-ar">
      <AppIcon name="Award" :size="22" color="var(--color-gold)" />
      الشارات
    </h3>
    <p v-if="loading" class="muted font-ar">جاري التحميل…</p>
    <div v-else class="badges-grid">
      <div
        v-for="b in grid"
        :key="b.id"
        class="badge-cell"
        :class="{ 'badge-cell--locked': !b.unlocked }"
        :title="b.hint"
      >
        <div class="badge-icon">
          <AppIcon
            :name="b.unlocked ? 'Award' : 'Lock'"
            :size="24"
            :color="b.unlocked ? 'var(--color-gold)' : 'var(--text-muted)'"
          />
        </div>
        <span class="badge-label font-ar">{{ b.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.badges-grid-wrap {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.heading {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin: 0 0 var(--space-md);
  font-size: 1.1rem;
  color: var(--text-primary);
}

.muted {
  color: var(--text-muted);
  margin: 0;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-sm);
}

.badge-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: var(--bg-section);
  border: 1px solid var(--border-color);
  text-align: center;
  transition: opacity var(--duration-fast);
}

.badge-cell--locked {
  opacity: 0.55;
}

.badge-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: rgba(244, 168, 37, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-label {
  font-size: var(--text-body-sm);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}
</style>
