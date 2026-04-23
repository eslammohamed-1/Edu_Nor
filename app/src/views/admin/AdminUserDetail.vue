<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminUsersStore } from '@/stores/admin/adminUsers';
import RoleBadge from '@/components/admin/users/RoleBadge.vue';
import UserForm from '@/components/admin/users/UserForm.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import type { User } from '@/types/auth';

const route = useRoute();
const router = useRouter();
const store = useAdminUsersStore();

const user = computed(() => store.getById(route.params.id as string));
const showForm = ref(false);

function handleSave(data: Partial<User>) {
  if (user.value) store.updateUser(user.value.id, data);
  showForm.value = false;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}
</script>

<template>
  <div class="user-detail">
    <button class="back-link font-ar" @click="router.back()">
      <AppIcon name="ArrowRight" :size="16" /> عودة للقائمة
    </button>

    <div v-if="!user" class="not-found font-ar">
      <AppIcon name="UserX" :size="48" color="var(--text-muted)" />
      <p>المستخدم غير موجود</p>
    </div>

    <template v-else>
      <div class="profile-card">
        <div class="profile-avatar font-ar">{{ user.name.slice(0, 1) }}</div>
        <div class="profile-info">
          <h2 class="font-ar">{{ user.name }}</h2>
          <p class="font-en email">{{ user.email }}</p>
          <div class="profile-meta">
            <RoleBadge :role="user.role" />
            <span v-if="user.grade" class="grade-tag font-ar">{{ user.grade }}</span>
            <span class="date-tag font-ar">تسجيل: {{ formatDate(user.createdAt) }}</span>
          </div>
        </div>
        <button class="edit-btn font-ar" @click="showForm = true">
          <AppIcon name="Pencil" :size="15" /> تعديل
        </button>
      </div>

      <!-- Permissions -->
      <div v-if="user.role === 'admin' && user.permissions?.length" class="perms-card">
        <h3 class="font-ar section-title">الصلاحيات المُعيّنة</h3>
        <div class="perms-list">
          <span v-for="p in user.permissions" :key="p" class="perm-tag font-en">{{ p }}</span>
        </div>
      </div>

      <div v-if="user.role === 'super_admin'" class="perms-card super">
        <AppIcon name="Shield" :size="20" color="var(--color-gold)" />
        <p class="font-ar">سوبر أدمن — يملك جميع الصلاحيات تلقائياً</p>
      </div>
    </template>

    <UserForm :open="showForm" :edit-user="user" @close="showForm = false" @save="handleSave" />
  </div>
</template>

<style scoped>
.user-detail { display: flex; flex-direction: column; gap: var(--space-lg); }
.back-link { display: inline-flex; align-items: center; gap: 0.4rem; background: none; border: none; cursor: pointer; color: var(--text-secondary); font-size: 0.875rem; padding: 0; transition: color var(--duration-fast); }
.back-link:hover { color: var(--color-navy); }
.not-found { display: flex; flex-direction: column; align-items: center; gap: var(--space-md); padding: var(--space-4xl); color: var(--text-muted); }
.profile-card { display: flex; align-items: center; gap: var(--space-lg); background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); padding: var(--space-xl); }
.profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: var(--gradient-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; flex-shrink: 0; }
.profile-info { flex: 1; }
.profile-info h2 { font-size: var(--text-h3); color: var(--text-primary); margin-bottom: 0.25rem; }
.email { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 0.75rem; }
.profile-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
.grade-tag, .date-tag { font-size: 0.75rem; color: var(--text-muted); background: var(--bg-section); padding: 0.2rem 0.6rem; border-radius: var(--radius-full); }
.edit-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem; background: var(--color-navy); color: #fff; border: none; border-radius: var(--radius-md); cursor: pointer; font-size: 0.875rem; font-weight: 600; }

.perms-card { background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); padding: var(--space-lg); }
.perms-card.super { display: flex; align-items: center; gap: 0.75rem; background: #fffde7; color: #f57f17; border-color: #ffe082; }
[data-theme="dark"] .perms-card.super { background: #4e3c00; color: #ffd54f; border-color: #f9a825; }
.section-title { font-size: var(--text-h4); color: var(--text-primary); margin-bottom: var(--space-md); }
.perms-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.perm-tag { font-size: 0.75rem; background: var(--bg-section); border: 1px solid var(--border-color); padding: 0.25rem 0.75rem; border-radius: var(--radius-full); color: var(--text-secondary); }
</style>
