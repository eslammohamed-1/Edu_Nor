<script setup lang="ts">
import AppButton from '@/components/common/AppButton.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppBadge from '@/components/common/AppBadge.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import AppProgressBar from '@/components/common/AppProgressBar.vue';
import AppSkeleton from '@/components/common/AppSkeleton.vue';
import AppModal from '@/components/common/AppModal.vue';
import AppToast from '@/components/common/AppToast.vue';
import { useToast } from '@/composables/useToast';
import { ref } from 'vue';

const { success, error } = useToast();
const showModal = ref(false);
const inputValue = ref('');
</script>

<template>
  <div class="design-system-preview container p-lg">
    <h1 class="text-navy mb-lg">EduNor Design System Preview</h1>
    
    <AppToast />

    <!-- Buttons -->
    <section class="mb-2xl">
      <h2 class="mb-md">Buttons</h2>
      <div class="flex flex-wrap gap-md">
        <AppButton>Primary Button</AppButton>
        <AppButton variant="secondary">Secondary Button</AppButton>
        <AppButton variant="ghost">Ghost Button</AppButton>
        <AppButton variant="danger">Danger Button</AppButton>
        <AppButton loading>Loading</AppButton>
        <AppButton disabled>Disabled</AppButton>
      </div>
    </section>

    <!-- Cards -->
    <section class="mb-2xl">
      <h2 class="mb-md">Cards</h2>
      <div class="grid-2 gap-lg">
        <AppCard title="Standard Card" hoverable>
          <template #header>
            <h3 class="text-navy">Card Header</h3>
          </template>
          <p>This is a standard card with the EduNor brand shadow and border radius.</p>
          <template #footer>
            <AppButton size="sm">Action</AppButton>
          </template>
        </AppCard>

        <AppCard :bordered="false">
          <h3 class="text-gold mb-sm">No Border Card</h3>
          <p>Cards can also be used without borders for a cleaner look on section backgrounds.</p>
        </AppCard>
      </div>
    </section>

    <!-- Forms -->
    <section class="mb-2xl">
      <h2 class="mb-md">Form Inputs</h2>
      <div class="max-w-md flex flex-col gap-md">
        <AppInput
          v-model="inputValue"
          label="Full Name"
          placeholder="Enter your name"
          required
        />
        <AppInput
          v-model="inputValue"
          label="Email"
          type="email"
          error="Please enter a valid email address"
        />
      </div>
    </section>

    <!-- Badges & Icons -->
    <section class="mb-2xl">
      <h2 class="mb-md">Badges & Icons</h2>
      <div class="flex items-center gap-md flex-wrap">
        <AppBadge>Primary</AppBadge>
        <AppBadge variant="success">Success</AppBadge>
        <AppBadge variant="danger">Danger</AppBadge>
        <AppBadge variant="teal">Teal Accent</AppBadge>
        <div class="flex gap-sm items-center ml-lg">
          <AppIcon name="BookOpen" color="var(--color-navy)" />
          <AppIcon name="GraduationCap" color="var(--color-gold)" />
          <AppIcon name="Star" color="var(--color-teal)" />
        </div>
      </div>
    </section>

    <!-- Feedback -->
    <section class="mb-2xl">
      <h2 class="mb-md">Feedback & Status</h2>
      <div class="flex flex-col gap-lg">
        <div class="flex gap-md">
          <AppButton @click="success('تمت العملية بنجاح!')">Show Success Toast</AppButton>
          <AppButton variant="danger" @click="error('حدث خطأ ما!')">Show Error Toast</AppButton>
          <AppButton variant="secondary" @click="showModal = true">Open Modal</AppButton>
        </div>
        
        <div class="max-w-sm">
          <p class="mb-xs text-body-sm">Course Progress</p>
          <AppProgressBar :progress="65" show-label />
        </div>

        <div class="flex gap-md">
          <AppSkeleton :width="100" :height="100" shape="circle" />
          <div class="flex-1 flex flex-col gap-sm">
            <AppSkeleton height="20px" width="60%" />
            <AppSkeleton height="16px" width="100%" />
            <AppSkeleton height="16px" width="80%" />
          </div>
        </div>
      </div>
    </section>

    <AppModal :show="showModal" title="Example Modal" @close="showModal = false">
      <p>This modal follows the EduNor brand guidelines with blur backdrop and smooth animations.</p>
      <template #footer>
        <AppButton variant="ghost" @click="showModal = false">Cancel</AppButton>
        <AppButton @click="showModal = false">Confirm</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.design-system-preview {
  min-height: 100vh;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.max-w-md { max-width: 450px; }
.max-w-sm { max-width: 300px; }
.mb-xs { margin-bottom: var(--space-xs); }
.mb-sm { margin-bottom: var(--space-sm); }
.mb-md { margin-bottom: var(--space-md); }
.mb-lg { margin-bottom: var(--space-lg); }
.mb-xl { margin-bottom: var(--space-xl); }
.mb-2xl { margin-bottom: var(--space-2xl); }
.ml-lg { margin-left: var(--space-lg); }
</style>
