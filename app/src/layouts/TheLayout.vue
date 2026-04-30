<script setup lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import TheNavbar from '@/components/layout/TheNavbar.vue';
import TheFooter from '@/components/layout/TheFooter.vue';

const route = useRoute();
/** لوحة الإدارة لها شريطها الجانبي والعلوي؛ لا نكرر شريط الموقع العام */
const isAdminShell = computed(() => route.path.startsWith('/admin'));
</script>

<template>
  <div class="the-layout">
    <TheNavbar v-if="!isAdminShell" />
    <main class="layout-main" :class="{ 'layout-main--admin': isAdminShell }">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <TheFooter v-if="!isAdminShell" />
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
.layout-main--admin {
  /* يملأ الشاشة بدون فراغ من غياب النافبار */
  min-height: 100vh;
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
