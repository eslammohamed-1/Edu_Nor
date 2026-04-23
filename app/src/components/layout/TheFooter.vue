<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue';
</script>

<template>
  <footer class="the-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <div class="navbar-logo mb-md">
          <AppIcon name="GraduationCap" :size="32" color="var(--color-gold)" />
          <span class="logo-text font-en">Edu<span class="text-gold">Nor</span></span>
        </div>
        <p class="text-gray-400 font-ar">
          إديو نور هي منصة تعليمية تهدف إلى تبسيط المناهج الدراسية وتقديمها بشكل تفاعلي وذكي للطلاب في جميع المراحل.
        </p>
      </div>

      <div class="footer-links">
        <h4 class="text-white mb-md font-ar">روابط سريعة</h4>
        <ul class="flex flex-col gap-sm">
          <li><RouterLink to="/" class="f-link">الرئيسية</RouterLink></li>
          <li><RouterLink to="/subjects" class="f-link">المواد الدراسية</RouterLink></li>
          <li><RouterLink to="/courses" class="f-link">الكورسات</RouterLink></li>
        </ul>
      </div>

      <div class="footer-social">
        <h4 class="text-white mb-md font-ar">تابعنا على</h4>
        <div class="flex gap-md">
          <a
            href="https://www.facebook.com/profile.php?id=61565278753073"
            class="social-icon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="EduNor على فيسبوك"
          ><AppIcon name="Facebook" :size="24" /></a>
          <a href="#" class="social-icon"><AppIcon name="Instagram" :size="24" /></a>
          <a href="#" class="social-icon"><AppIcon name="Twitter" :size="24" /></a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom text-center">
      <div class="container">
        <p class="text-gray-500 font-en">© 2024 EduNor. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.the-footer {
  background-color: var(--color-navy-dark);
  padding-top: var(--space-3xl);
  color: var(--color-gray-100);
  margin-top: auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-2xl);
  padding-bottom: var(--space-2xl);
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .navbar-logo, .flex { justify-content: center; }
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: var(--weight-bold);
  color: var(--color-white);
}

.text-gray-400 { color: var(--color-gray-400); }
.text-gray-500 { color: var(--color-gray-600); }
.text-white { color: var(--color-white); }

.f-link {
  color: var(--color-gray-400);
  transition: color 0.2s;
}

.f-link:hover {
  color: var(--color-gold);
}

.social-icon {
  color: var(--color-gray-100);
  transition: transform 0.2s, color 0.2s;
}

.social-icon:hover {
  transform: translateY(-3px);
  color: var(--color-gold);
}

.footer-bottom {
  padding: var(--space-lg) 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.mb-md { margin-bottom: var(--space-md); }
</style>
