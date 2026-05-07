<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRemoteApi } from '@/services/http/client';
import {
  connectNotificationSse,
  fetchMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem
} from '@/services/notificationsService';
import AppIcon from '@/components/common/AppIcon.vue';

const router = useRouter();
const open = ref(false);
const items = ref<NotificationItem[]>([]);
const unread = ref(0);
const loading = ref(false);
let closer: (() => void) | null = null;

async function refresh() {
  if (!useRemoteApi()) return;
  loading.value = true;
  try {
    const out = await fetchMyNotifications({ limit: 40 });
    items.value = out.items;
    unread.value = out.unreadCount;
  } catch {
    /* تجاهل */
  } finally {
    loading.value = false;
  }
}

function startSse() {
  closer = connectNotificationSse((payload) => {
    const p = payload as { kind?: string; id?: string };
    if (p?.kind === 'notification') {
      void refresh();
    }
  });
}

onMounted(() => {
  void refresh();
  startSse();
});

onBeforeUnmount(() => {
  closer?.();
});

async function onOpen() {
  open.value = !open.value;
  if (open.value) {
    await refresh();
  }
}

async function clickNotif(n: NotificationItem) {
  try {
    await markNotificationRead(n.id);
    await refresh();
  } catch {
    /* تجاهل */
  }
  if (n.href) {
    await router.push(n.href);
  }
  open.value = false;
}

async function markAll() {
  try {
    await markAllNotificationsRead();
    await refresh();
  } catch {
    /* تجاهل */
  }
}
</script>

<template>
  <div v-if="useRemoteApi()" class="bell-wrap">
    <button type="button" class="bell-btn" aria-label="الإشعارات" @click="onOpen">
      <AppIcon name="Bell" :size="22" />
      <span v-if="unread > 0" class="badge-count">{{ unread > 99 ? '99+' : unread }}</span>
    </button>

    <div v-if="open" class="bell-dropdown shadow-lg">
      <div class="bell-head font-ar">
        <span>الإشعارات</span>
        <button v-if="unread > 0" type="button" class="linkish font-ar" @click="markAll">
          تعليم الكل كمقروء
        </button>
      </div>
      <div class="bell-list">
        <p v-if="loading" class="muted font-ar pad">…</p>
        <p v-else-if="!items.length" class="muted font-ar pad">لا إشعارات بعد</p>
        <button
          v-for="n in items"
          :key="n.id"
          type="button"
          class="notif-row font-ar"
          :class="{ 'notif-row--unread': !n.readAt }"
          @click="clickNotif(n)"
        >
          <span class="notif-title">{{ n.title }}</span>
          <span class="notif-body">{{ n.body }}</span>
        </button>
      </div>
    </div>

    <div v-if="open" class="bell-backdrop" @click="open = false"></div>
  </div>
</template>

<style scoped>
.bell-wrap {
  position: relative;
}

.bell-btn {
  position: relative;
  color: var(--text-secondary);
  padding: var(--space-xs);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bell-btn:hover {
  background: var(--bg-section);
  color: var(--color-navy);
}

[data-theme='dark'] .bell-btn:hover {
  color: var(--color-gold);
}

.badge-count {
  position: absolute;
  top: -2px;
  inset-inline-end: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: var(--radius-full);
  background: var(--color-error);
  color: white;
  font-size: 10px;
  font-weight: var(--weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bell-backdrop {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-dropdown) - 1);
}

.bell-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  inset-inline-end: 0;
  width: min(340px, 92vw);
  max-height: 400px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  z-index: var(--z-dropdown);
  display: flex;
  flex-direction: column;
}

.bell-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--border-color);
  font-weight: var(--weight-semibold);
}

.linkish {
  background: none;
  border: none;
  color: var(--color-teal);
  font-size: var(--text-body-sm);
  cursor: pointer;
  padding: 0;
}

.bell-list {
  overflow: auto;
  max-height: 320px;
}

.pad {
  padding: var(--space-md);
}

.muted {
  color: var(--text-muted);
}

.notif-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  width: 100%;
  text-align: start;
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-bottom: 1px solid var(--border-color);
  background: transparent;
  cursor: pointer;
  color: var(--text-primary);
}

.notif-row:hover {
  background: var(--bg-section);
}

.notif-row--unread {
  background: rgba(46, 196, 182, 0.06);
}

.notif-title {
  font-weight: var(--weight-semibold);
  font-size: var(--text-body-sm);
}

.notif-body {
  font-size: var(--text-body-sm);
  color: var(--text-secondary);
}
</style>
