<script setup lang="ts">
import LoginForm from '@/components/auth/LoginForm.vue';
import AppIcon from '@/components/common/AppIcon.vue';
</script>

<template>
  <div class="auth-page">
    <div class="auth-decoration">
      <div class="decoration-inner">
        <RouterLink to="/" class="brand-link">
          <AppIcon name="GraduationCap" :size="40" color="var(--color-gold)" />
          <span class="brand-text font-en">Edu<span class="text-gold">Nor</span></span>
        </RouterLink>

        <div class="decoration-content">
          <h2 class="decoration-title font-ar">
            تعلم بطريقة <span class="text-gold">مختلفة</span>
          </h2>
          <p class="decoration-desc font-ar">
            منصة تعليمية متكاملة تساعدك على فهم المناهج بعمق عبر أسئلة تفاعلية ومحتوى مخصص.
          </p>

          <ul class="decoration-features">
            <li>
              <AppIcon name="CheckCircle" :size="20" color="var(--color-gold)" />
              <span class="font-ar">أكثر من 500 كورس تعليمي</span>
            </li>
            <li>
              <AppIcon name="CheckCircle" :size="20" color="var(--color-gold)" />
              <span class="font-ar">13 نوعاً من الأسئلة التفاعلية</span>
            </li>
            <li>
              <AppIcon name="CheckCircle" :size="20" color="var(--color-gold)" />
              <span class="font-ar">محتوى معتمد لجميع المراحل</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="auth-form-area">
      <LoginForm />
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - var(--navbar-height));
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: var(--bg-page);
}

.auth-decoration {
  background: linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-dark) 100%);
  padding: var(--space-3xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  position: relative;
  overflow: hidden;
}

.auth-decoration::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(244, 168, 37, 0.12) 0%, transparent 70%);
  border-radius: 50%;
}

.decoration-inner {
  position: relative;
  z-index: 2;
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
}

.brand-link {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-white);
}

.brand-text {
  font-size: 1.75rem;
  font-weight: var(--weight-bold);
}

.decoration-title {
  font-size: 2.5rem;
  line-height: 1.2;
  margin-bottom: var(--space-md);
}

.decoration-desc {
  font-size: var(--text-body-lg);
  color: var(--color-gray-300);
  margin-bottom: var(--space-xl);
}

.decoration-features {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.decoration-features li {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-gray-100);
}

.auth-form-area {
  padding: var(--space-3xl) var(--space-xl);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 992px) {
  .auth-page {
    grid-template-columns: 1fr;
  }
  .auth-decoration {
    display: none;
  }
}
</style>
