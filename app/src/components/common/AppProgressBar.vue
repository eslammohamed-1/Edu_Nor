<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  progress: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'teal';
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  height: 8,
  animated: true
});

const progressWidth = computed(() => `${Math.min(100, Math.max(0, props.progress))}%`);
</script>

<template>
  <div class="progress-container" :style="{ height: `${height}px` }">
    <div
      class="progress-bar transition-all"
      :class="[`progress--${variant}`, { 'progress--animated': animated }]"
      :style="{ width: progressWidth }"
    >
      <span v-if="showLabel" class="progress-label font-en">
        {{ Math.round(progress) }}%
      </span>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  width: 100%;
  background-color: var(--color-gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.progress--primary { background-color: var(--color-gold); }
.progress--success { background-color: var(--color-success); }
.progress--warning { background-color: var(--color-warning); }
.progress--danger { background-color: var(--color-error); }
.progress--teal { background-color: var(--color-teal); }

.progress--animated {
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-label {
  font-size: 10px;
  font-weight: var(--weight-bold);
  color: var(--color-navy);
  position: absolute;
  right: var(--space-xs);
}
</style>
