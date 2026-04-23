<script setup lang="ts">
import { RouterView } from 'vue-router';
import TheNavbar from '@/components/layout/TheNavbar.vue';
import TheFooter from '@/components/layout/TheFooter.vue';
import AppToast from '@/components/common/AppToast.vue';
</script>

<template>
  <div class="the-layout">
    <TheNavbar />
    <main class="layout-main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <TheFooter />
    <AppToast />
  </div>
</template>

<style scoped>
.the-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
