<script setup lang="ts">
interface Props {
  width?: string | number;
  height?: string | number;
  shape?: 'rect' | 'circle';
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '20px',
  shape: 'rect'
});

const styles = {
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  borderRadius: props.shape === 'circle' ? '50%' : 'var(--radius-sm)'
};
</script>

<template>
  <div class="app-skeleton shimmer-bg" :style="styles"></div>
</template>

<style scoped>
.app-skeleton {
  background-color: var(--bg-section);
  display: inline-block;
}
</style>
