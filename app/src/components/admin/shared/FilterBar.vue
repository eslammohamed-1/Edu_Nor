<script setup lang="ts">
import { ref, watch } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';

export interface FilterChip {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

const props = defineProps<{
  placeholder?: string;
  chips?: FilterChip[];
  modelValue?: string;
  filters?: Record<string, string>;
}>();

const emit = defineEmits<{
  'update:modelValue': [v: string];
  'update:filters': [v: Record<string, string>];
  search: [q: string];
}>();

const q = ref(props.modelValue || '');
const activeFilters = ref<Record<string, string>>(props.filters || {});
let debounceTimer: ReturnType<typeof setTimeout>;

watch(q, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    emit('update:modelValue', val);
    emit('search', val);
  }, 300);
});

function setFilter(key: string, value: string) {
  if (value === '') {
    delete activeFilters.value[key];
  } else {
    activeFilters.value[key] = value;
  }
  emit('update:filters', { ...activeFilters.value });
}

function clear() {
  q.value = '';
  activeFilters.value = {};
  emit('update:modelValue', '');
  emit('update:filters', {});
}

const hasFilters = () => q.value || Object.keys(activeFilters.value).length > 0;
</script>

<template>
  <div class="filter-bar">
    <div class="search-wrap">
      <AppIcon name="Search" :size="16" class="search-icon" />
      <input
        v-model="q"
        type="text"
        class="filter-input font-ar"
        :placeholder="placeholder || 'بحث...'"
      />
      <button v-if="q" class="clear-btn" @click="q = ''">
        <AppIcon name="X" :size="14" />
      </button>
    </div>

    <div v-if="chips && chips.length" class="chips-row">
      <select
        v-for="chip in chips"
        :key="chip.key"
        class="chip-select font-ar"
        :value="activeFilters[chip.key] || ''"
        @change="setFilter(chip.key, ($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ chip.label }}</option>
        <option v-for="opt in chip.options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <button v-if="hasFilters()" class="clear-all-btn font-ar" @click="clear">
      <AppIcon name="X" :size="14" />
      مسح
    </button>
  </div>
</template>

<style scoped>
.filter-bar { display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; padding: var(--space-md); border-bottom: 1px solid var(--border-color); background: var(--bg-card); }
.search-wrap { position: relative; display: flex; align-items: center; min-width: 220px; }
.search-icon { position: absolute; right: 12px; color: var(--text-muted); pointer-events: none; }
.filter-input { width: 100%; padding: 0.5rem 2.25rem 0.5rem 2.25rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-input); color: var(--text-primary); font-size: 0.875rem; outline: none; transition: border-color var(--duration-fast); }
.filter-input:focus { border-color: var(--color-gold); }
.clear-btn { position: absolute; left: 8px; background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; padding: 2px; }
.chips-row { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.chip-select { padding: 0.4rem 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-full); background: var(--bg-card); color: var(--text-secondary); font-size: 0.8125rem; cursor: pointer; outline: none; }
.chip-select:focus { border-color: var(--color-gold); }
.clear-all-btn { display: flex; align-items: center; gap: 4px; padding: 0.4rem 0.75rem; background: none; border: 1px solid var(--border-color); border-radius: var(--radius-full); color: var(--text-secondary); font-size: 0.8125rem; cursor: pointer; }
.clear-all-btn:hover { border-color: var(--color-error); color: var(--color-error); }
</style>
