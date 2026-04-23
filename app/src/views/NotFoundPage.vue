<script setup lang="ts">
import AppButton from '@/components/common/AppButton.vue';
import AppIcon from '@/components/common/AppIcon.vue';
</script>

<template>
  <div class="not-found-page">
    <div class="container inner">
      <div class="big-404 font-en">404</div>
      <AppIcon name="SearchX" :size="56" color="var(--color-gold)" class="icon" />
      <h1 class="font-ar text-navy">الصفحة غير موجودة</h1>
      <p class="font-ar text-secondary">
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها. تأكد من الرابط أو عد إلى الصفحة الرئيسية.
      </p>
      <div class="actions">
        <RouterLink to="/">
          <AppButton size="lg">
            <AppIcon name="Home" :size="18" />
            <span style="margin-inline-start: 6px">الصفحة الرئيسية</span>
          </AppButton>
        </RouterLink>
        <RouterLink to="/subjects">
          <AppButton variant="secondary" size="lg">استكشف المواد</AppButton>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: calc(100vh - var(--navbar-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl) var(--space-md);
}

.inner {
  max-width: 520px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.big-404 {
  font-size: 8rem;
  font-weight: var(--weight-bold);
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  letter-spacing: -4px;
}

.icon {
  margin-top: -20px;
  margin-bottom: var(--space-sm);
}

.inner h1 {
  font-size: var(--text-h2);
}

.actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-md);
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 768px) {
  .big-404 { font-size: 5rem; }
}
</style>
