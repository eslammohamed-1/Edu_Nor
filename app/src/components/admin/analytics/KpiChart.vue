<script setup lang="ts">
import { computed, ref } from 'vue';

const gradId = ref(`kpiGrad_${Math.random().toString(36).slice(2, 10)}`);

const props = withDefaults(
  defineProps<{
    title: string;
    type: 'line' | 'bar';
    values: number[];
    labels?: string[];
    color?: string;
    unitLabel?: string;
  }>(),
  { color: 'var(--color-navy)', unitLabel: '' }
);

const W = 400;
const H = 120;
const PAD = 8;

const maxVal = computed(() => Math.max(...props.values, 1));

const points = computed(() => {
  const n = props.values.length;
  if (n === 0) return '';
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;
  return props.values
    .map((v, i) => {
      const x = PAD + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
      const y = PAD + innerH - (v / maxVal.value) * innerH;
      return `${x},${y}`;
    })
    .join(' ');
});

const barRects = computed(() => {
  const n = props.values.length;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;
  const bw = n ? innerW / n - 2 : 0;
  return props.values.map((v, i) => {
    const h = (v / maxVal.value) * innerH;
    const x = PAD + i * (bw + 2) + 1;
    const y = PAD + innerH - h;
    return { x, y, h: Math.max(h, 2), w: Math.max(bw, 2) };
  });
});

const sum = computed(() => props.values.reduce((a, b) => a + b, 0));
</script>

<template>
  <div class="kpi-chart">
    <h4 class="chart-heading font-ar">{{ title }}</h4>
    <svg class="chart-svg" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" dir="ltr">
      <template v-if="type === 'line' && values.length">
        <polygon
          :points="`${PAD},${H - PAD} ${points} ${W - PAD},${H - PAD}`"
          :fill="`url(#${gradId})`"
          opacity="0.22"
        />
        <polyline
          fill="none"
          :stroke="color"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :points="points"
          opacity="0.95"
        />
        <defs>
          <linearGradient :id="gradId" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" :stop-color="color" stop-opacity="0.45" />
            <stop offset="100%" :stop-color="color" stop-opacity="0" />
          </linearGradient>
        </defs>
      </template>
      <g v-else-if="type === 'bar'">
        <rect
          v-for="(r, i) in barRects"
          :key="i"
          :x="r.x"
          :y="r.y"
          :width="r.w"
          :height="r.h"
          :fill="color"
          rx="3"
          opacity="0.85"
        />
      </g>
    </svg>
    <p v-if="unitLabel" class="chart-foot font-ar">{{ unitLabel }} · المجموع {{ sum }}</p>
  </div>
</template>

<style scoped>
.kpi-chart {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  padding: var(--space-md) var(--space-lg);
}
.chart-heading {
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}
.chart-svg {
  display: block;
  width: 100%;
  height: 120px;
}
.chart-foot {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
}
</style>
