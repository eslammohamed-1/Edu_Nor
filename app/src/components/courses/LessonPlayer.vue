<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue';

interface Props {
  videoUrl?: string;
  title: string;
  poster?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="lesson-player">
    <div class="player-ratio">
      <iframe
        v-if="videoUrl"
        :src="videoUrl"
        :title="title"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        class="player-iframe"
      ></iframe>
      <div v-else class="player-placeholder">
        <div class="placeholder-gradient">
          <div class="play-circle">
            <AppIcon name="Play" :size="48" color="var(--color-white)" />
          </div>
          <p class="font-ar">الفيديو غير متاح حالياً</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lesson-player {
  width: 100%;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background-color: #000;
}

.player-ratio {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
}

.player-iframe,
.player-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.placeholder-gradient {
  background: var(--gradient-primary);
  color: var(--color-white);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  width: 100%;
  height: 100%;
}

.play-circle {
  width: 96px;
  height: 96px;
  border-radius: var(--radius-full);
  background-color: rgba(244, 168, 37, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
