<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ref, computed } from 'vue';

export interface Column<TRow = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'start' | 'center' | 'end';
  render?: (row: TRow) => string;
}

const props = withDefaults(defineProps<{
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  emptyText?: string;
  selectable?: boolean;
  pageSize?: number;
}>(), {
  loading: false,
  emptyText: 'لا توجد بيانات',
  selectable: false,
  pageSize: 10
});

const emit = defineEmits<{
  'action': [row: T, action: string];
  'selection-change': [selected: T[]];
}>();

const page = ref(1);
const sortKey = ref('');
const sortDir = ref<'asc' | 'desc'>('asc');
const selected = ref<Set<unknown>>(new Set());

const sorted = computed(() => {
  if (!sortKey.value) return props.rows;
  const dir = sortDir.value === 'asc' ? 1 : -1;
  return [...props.rows].sort((a, b) => {
    const av = a[sortKey.value];
    const bv = b[sortKey.value];
    if (av == null) return 1;
    if (bv == null) return -1;
    return String(av).localeCompare(String(bv), 'ar') * dir;
  });
});

const total = computed(() => sorted.value.length);
const totalPages = computed(() => Math.ceil(total.value / props.pageSize));
const paginated = computed(() => {
  const start = (page.value - 1) * props.pageSize;
  return sorted.value.slice(start, start + props.pageSize);
});

const allSelected = computed(() =>
  paginated.value.length > 0 && paginated.value.every(r => selected.value.has((r as Record<string, unknown>).id))
);

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDir.value = 'asc';
  }
}

function toggleAll() {
  if (allSelected.value) {
    paginated.value.forEach(r => selected.value.delete((r as Record<string, unknown>).id));
  } else {
    paginated.value.forEach(r => selected.value.add((r as Record<string, unknown>).id));
  }
  emitSelection();
}

function toggleRow(row: T) {
  const id = (row as Record<string, unknown>).id;
  if (selected.value.has(id)) selected.value.delete(id);
  else selected.value.add(id);
  emitSelection();
}

function emitSelection() {
  const sel = props.rows.filter(r => selected.value.has((r as Record<string, unknown>).id));
  emit('selection-change', sel);
}

function getCellValue(row: T, col: Column<T>): string {
  if (col.render) return col.render(row);
  const v = row[col.key];
  return v == null ? '—' : String(v);
}
</script>

<template>
  <div class="data-table-wrap">
    <!-- Loading skeleton -->
    <div v-if="loading" class="dt-loading">
      <div v-for="i in 5" :key="i" class="dt-skeleton-row"></div>
    </div>

    <template v-else>
      <div class="dt-scroll">
        <table class="dt-table">
          <thead>
            <tr>
              <th v-if="selectable" class="dt-check-col">
                <input type="checkbox" :checked="allSelected" @change="toggleAll" />
              </th>
              <th
                v-for="col in columns"
                :key="col.key"
                :style="col.width ? `width:${col.width}` : ''"
                :class="['dt-th font-ar', col.sortable && 'dt-sortable', `align-${col.align || 'start'}`]"
                @click="col.sortable && toggleSort(col.key)"
              >
                {{ col.label }}
                <span v-if="col.sortable && sortKey === col.key" class="sort-arrow">
                  {{ sortDir === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="dt-th dt-actions-col font-ar">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="rows.length === 0">
              <td :colspan="columns.length + (selectable ? 2 : 1)" class="dt-empty font-ar">
                {{ emptyText }}
              </td>
            </tr>
            <tr v-for="row in paginated" :key="String((row as Record<string, unknown>).id)" class="dt-row">
              <td v-if="selectable" class="dt-check-col">
                <input
                  type="checkbox"
                  :checked="selected.has((row as Record<string, unknown>).id)"
                  @change="toggleRow(row)"
                />
              </td>
              <td
                v-for="col in columns"
                :key="col.key"
                :class="['dt-td', `align-${col.align || 'start'}`]"
              >
                <slot :name="`cell-${col.key}`" :row="row" :value="getCellValue(row, col)">
                  <span class="font-ar">{{ getCellValue(row, col) }}</span>
                </slot>
              </td>
              <td class="dt-td dt-actions-cell">
                <slot name="actions" :row="row"></slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="dt-pagination">
        <span class="dt-count font-ar">{{ total }} نتيجة</span>
        <div class="dt-pages">
          <button class="pg-btn" :disabled="page === 1" @click="page--">‹</button>
          <button
            v-for="p in totalPages"
            :key="p"
            class="pg-btn"
            :class="{ active: p === page }"
            @click="page = p"
          >{{ p }}</button>
          <button class="pg-btn" :disabled="page === totalPages" @click="page++">›</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.data-table-wrap { width: 100%; }
.dt-scroll { overflow-x: auto; }
.dt-table { width: 100%; border-collapse: collapse; }
.dt-th {
  padding: 0.75rem 1rem;
  background: var(--bg-section);
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-weight: 600;
  text-align: right;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}
.dt-sortable { cursor: pointer; user-select: none; }
.dt-sortable:hover { color: var(--color-navy); }
.sort-arrow { margin-right: 4px; }
.dt-check-col { width: 40px; text-align: center; }
.dt-actions-col { width: 120px; text-align: center; }
.dt-row { border-bottom: 1px solid var(--border-color); transition: background var(--duration-fast); }
.dt-row:hover { background: var(--bg-section); }
.dt-td { padding: 0.875rem 1rem; font-size: 0.875rem; color: var(--text-primary); text-align: right; }
.dt-actions-cell { text-align: center; }
.dt-empty { padding: 3rem; text-align: center; color: var(--text-muted); }
.dt-loading { display: flex; flex-direction: column; gap: 0.5rem; }
.dt-skeleton-row { height: 48px; background: var(--bg-section); border-radius: var(--radius-md); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
.align-center { text-align: center; }
.align-end { text-align: left; }

.dt-pagination { display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-top: 1px solid var(--border-color); }
.dt-count { color: var(--text-muted); font-size: 0.8125rem; }
.dt-pages { display: flex; gap: 0.25rem; }
.pg-btn { width: 32px; height: 32px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); border-radius: var(--radius-sm); cursor: pointer; font-size: 0.875rem; transition: all var(--duration-fast); }
.pg-btn:hover:not(:disabled) { border-color: var(--color-navy); color: var(--color-navy); }
.pg-btn.active { background: var(--color-navy); color: #fff; border-color: var(--color-navy); }
.pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
