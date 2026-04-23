<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
import AppIcon from '@/components/common/AppIcon.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppCard from '@/components/common/AppCard.vue';
import { PERMISSIONS } from '@/lib/permissions';

const { user, isSuperAdmin } = useAuth();

const adminLinks = [
  { to: '/design-system', label: 'نظام التصميم', icon: 'Palette', desc: 'مكوّنات الواجهة والألوان' },
  { to: '/subjects', label: 'المواد والكورسات', icon: 'BookOpen', desc: 'عرض المحتوى كما يراه الطلاب' },
  { to: '/quiz', label: 'الاختبارات', icon: 'HelpCircle', desc: 'إدارة تجربة الاختبارات' },
  { to: '/dashboard', label: 'لوحة الطالب', icon: 'LayoutDashboard', desc: 'معاينة لوحة المستخدم' }
];

const permissionList = Object.values(PERMISSIONS);
</script>

<template>
  <div class="admin-page container">
    <header class="admin-header">
      <div class="badge-row">
        <span class="role-pill font-ar">
          <AppIcon name="Shield" :size="18" color="var(--color-gold)" />
          سوبر أدمن — صلاحيات كاملة
        </span>
      </div>
      <h1 class="font-ar text-navy">إدارة المنصة</h1>
      <p class="font-ar text-secondary">
        مرحباً <strong>{{ user?.name }}</strong> — يمكنك الوصول لكل أجزاء النظام والمحتوى والإعدادات (وضع تجريبي بدون خادم).
      </p>
    </header>

    <AppCard v-if="isSuperAdmin" padding="lg" class="perms-card">
      <h2 class="font-ar text-navy section-title">
        <AppIcon name="Key" :size="20" color="var(--color-gold)" />
        الصلاحيات المفعّلة
      </h2>
      <p class="font-ar text-secondary mb-md">
        حساب السوبر أدمن يتجاهل قيود <code>permissions</code> ويملك تلقائياً:
      </p>
      <ul class="perm-list">
        <li v-for="p in permissionList" :key="p" class="font-en perm-item">
          <AppIcon name="Check" :size="16" color="var(--color-success)" />
          {{ p }}
        </li>
        <li class="font-ar perm-item perm-wild">
          <AppIcon name="Sparkles" :size="16" color="var(--color-gold)" />
          <strong>وأي صلاحية future (*)</strong>
        </li>
      </ul>
    </AppCard>

    <section v-else class="denied">
      <AppIcon name="Lock" :size="48" color="var(--text-muted)" />
      <p class="font-ar">ليس لديك صلاحية الوصول لهذه الصفحة.</p>
      <RouterLink to="/">
        <AppButton>الرئيسية</AppButton>
      </RouterLink>
    </section>

    <section v-if="isSuperAdmin" class="quick-grid">
      <RouterLink v-for="link in adminLinks" :key="link.to" :to="link.to" class="quick-link">
        <AppCard hoverable padding="lg">
          <div class="quick-inner">
            <AppIcon :name="link.icon" :size="28" color="var(--color-navy)" />
            <h3 class="font-ar text-navy">{{ link.label }}</h3>
            <p class="font-ar text-secondary text-body-sm">{{ link.desc }}</p>
          </div>
        </AppCard>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.admin-page {
  padding: var(--space-2xl) var(--space-md) var(--space-4xl);
  max-width: 960px;
  margin: 0 auto;
}

.admin-header {
  margin-bottom: var(--space-xl);
}

.badge-row {
  margin-bottom: var(--space-sm);
}

.role-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  background: linear-gradient(135deg, rgba(30, 58, 95, 0.12) 0%, rgba(244, 168, 37, 0.15) 100%);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: var(--text-body-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-navy);
}

.admin-header h1 {
  font-size: var(--text-h1);
  margin-bottom: var(--space-xs);
}

.perms-card {
  margin-bottom: var(--space-xl);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-h3);
  margin-bottom: var(--space-sm);
}

.mb-md { margin-bottom: var(--space-md); }

code {
  font-size: 0.9em;
  padding: 2px 6px;
  background: var(--bg-section);
  border-radius: var(--radius-sm);
}

.perm-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  list-style: none;
}

.perm-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-body-sm);
  color: var(--text-primary);
}

.perm-wild {
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px dashed var(--border-color);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-md);
}

.quick-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.quick-inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: flex-start;
}

.quick-inner h3 {
  font-size: var(--text-h4);
}

.denied {
  text-align: center;
  padding: var(--space-3xl) var(--space-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}
</style>
