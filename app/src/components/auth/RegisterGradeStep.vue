<script setup lang="ts">
import { computed } from 'vue';
import type { Stage } from '@/types/course';
import { GRADES_BY_STAGE } from '@/config/educationTracks';

const props = defineProps<{
  stage: Stage;
}>();

defineEmits<{
  select: [grade: string];
  back: [];
}>();

const grades = computed(() => GRADES_BY_STAGE[props.stage] ?? []);
</script>

<template>
  <div class="reg-step reg-step--grade">
    <button type="button" class="back-btn font-ar" @click="$emit('back')">
      <span aria-hidden="true">‹</span> رجوع
    </button>
    <p class="prompt font-ar">الآن اختر صفك:</p>
    <ul class="choice-list" role="list">
      <li v-for="g in grades" :key="g">
        <button type="button" class="choice-btn font-ar" @click="$emit('select', g)">
          {{ g }}
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
  font-size: var(--text-body-lg);
  font-weight: var(--weight-semibold);
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
  text-align: center;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.choice-btn:hover {
  border-color: var(--color-gold);
  box-shadow: var(--shadow-md);
}
</style>
