<script setup lang="ts">
import type { SecondaryTrack } from '@/types/auth';
import { SECONDARY_TRACK_OPTIONS } from '@/config/educationTracks';

defineEmits<{
  select: [track: SecondaryTrack];
  back: [];
}>();
</script>

<template>
  <div class="reg-step reg-step--track">
    <button type="button" class="back-btn font-ar" @click="$emit('back')">
      <span aria-hidden="true">‹</span> رجوع
    </button>
    <p class="prompt font-ar">المسار؟</p>
    <ul class="choice-list" role="list">
      <li v-for="o in SECONDARY_TRACK_OPTIONS" :key="o.id">
        <button type="button" class="choice-btn font-ar" @click="$emit('select', o.id)">
          {{ o.label }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.reg-step {
  width: 100%;
  max-width: 420px;
}
.back-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xxs);
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--text-body-sm);
  cursor: pointer;
  margin-bottom: var(--space-lg);
  padding: 0;
}
.back-btn:hover {
  color: var(--color-navy);
}
.prompt {
  color: var(--color-navy);
  font-size: var(--text-h3);
  font-weight: var(--weight-bold);
  margin-bottom: var(--space-lg);
  text-align: center;
}
.choice-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.choice-btn {
  width: 100%;
  min-height: 56px;
  padding: var(--space-md) var(--space-lg);
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: var(--text-body);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.choice-btn:hover {
  border-color: var(--color-gold);
  box-shadow: var(--shadow-md);
}
</style>
