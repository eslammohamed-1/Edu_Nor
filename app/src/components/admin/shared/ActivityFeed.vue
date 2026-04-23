<script setup lang="ts">
import { computed } from 'vue';
import { useAdminAuditStore } from '@/stores/admin/adminAudit';

const props = withDefaults(defineProps<{ limit?: number }>(), { limit: 10 });

const auditStore = useAdminAuditStore();
const logs = computed(() => auditStore.logs.slice(0, props.limit));

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'منذ لحظات';
  if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} دقيقة`;
  if (diff < 86400000) return `منذ ${Math.floor(diff / 3600000)} ساعة`;
  return `منذ ${Math.floor(diff / 86400000)} يوم`;
}

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    'user.create': 'أنشأ مستخدماً',
    'user.update': 'عدّل مستخدماً',
    'user.delete': 'حذف مستخدماً',
    'user.ban': 'حظر مستخدماً',
    'user.unban': 'رفع الحظر عن مستخدم',
    'user.roleChange': 'غيّر دور مستخدم',
    'course.create': 'أنشأ كورساً',
    'course.publish': 'نشر كورساً',
    'lesson.create': 'أنشأ درساً',
    'quiz.create': 'أنشأ اختباراً',
    'settings.update': 'عدّل الإعدادات',
  };
  return labels[action] || action;
}
</script>

<template>
  <div class="activity-feed">
    <p v-if="!logs.length" class="feed-empty font-ar">لا توجد أنشطة بعد.</p>
    <ul v-else class="feed-list">
      <li v-for="log in logs" :key="log.id" class="feed-item">
        <div class="feed-avatar font-ar">{{ log.actor.name.slice(0, 1) }}</div>
        <div class="feed-content">
          <p class="feed-text font-ar">
            <strong>{{ log.actor.name }}</strong>
            {{ actionLabel(log.action) }}
            <span v-if="log.target?.label" class="feed-target">"{{ log.target.label }}"</span>
          </p>
          <span class="feed-time font-ar">{{ relativeTime(log.createdAt) }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.activity-feed { padding: var(--space-sm) 0; }
.feed-empty { color: var(--text-muted); text-align: center; padding: var(--space-xl); }
.feed-list { list-style: none; }
.feed-item { display: flex; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); border-bottom: 1px solid var(--border-color); }
.feed-item:last-child { border-bottom: none; }
.feed-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--gradient-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; flex-shrink: 0; }
.feed-content { flex: 1; min-width: 0; }
.feed-text { font-size: 0.875rem; color: var(--text-primary); line-height: 1.5; }
.feed-target { color: var(--color-navy); font-weight: 600; }
.feed-time { font-size: 0.75rem; color: var(--text-muted); }
</style>
