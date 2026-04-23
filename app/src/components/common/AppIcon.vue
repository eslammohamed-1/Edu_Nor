<script setup lang="ts">
import { computed } from 'vue';
import * as icons from 'lucide-vue-next';

interface Props {
  name: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  strokeWidth: 2
});

const iconComponent = computed(() => {
  // @ts-ignore
  return icons[props.name] || icons.HelpCircle;
});
</script>

<template>
  <component
    :is="iconComponent"
    :size="size"
    :color="color"
    :stroke-width="strokeWidth"
    class="app-icon"
  />
</template>

<style scoped>
.app-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
