<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { getApiBase } from '@/services/http/client';
import { readStoredAuth } from '@/lib/authStorage';
import { fetchStudyPlan, type StudyPlanLessonItem, type StudyPlanNext } from '@/services/studyPlanService';
import AppIcon from '@/components/common/AppIcon.vue';
import AppButton from '@/components/common/AppButton.vue';

const loading = ref(true);
const error = ref<string | null>(null);
const nextLesson = ref<StudyPlanNext | null>(null);
const items = ref<StudyPlanLessonItem[]>([]);

onMounted(async () => {
  if (!getApiBase() || !readStoredAuth()?.token) {
    loading.value = false;
    error.value = 'سجّل الدخول وفعّل الاتصال بالخادم لعرض خطتك.';
    return;
  }
  try {
    const data = await fetchStudyPlan();
    nextLesson.value = data.nextLesson;
    items.value = data.items;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'تعذّر التحميل';
  } finally {
    loading.value = false;
  }
});

function statusLabel(s: StudyPlanLessonItem['status']): string {
  if (s === 'completed') return 'مكتمل';
  if (s === 'in_progress') return 'قيد المشاهدة';
  return 'لم يبدأ';
}

function statusClass(s: StudyPlanLessonItem['status']): string {
  if (s === 'completed') return 'is-done';
  if (s === 'in_progress') return 'is-active';
  return '';
}
</script>

<template>
  <div class="study-plan-page container">
    <header class="page-head">
      <div>
        <h1 class="font-ar text-navy page-title">خطتي الدراسية</h1>
        <p class="text-secondary font-ar page-sub">
          ترتيب مقترح حسب تسلسل المحتوى وتقدّمك المحفوظ على الخادم.
        </p>
      </div>
      <RouterLink to="/dashboard" class="back-link font-ar">
        <AppIcon name="ArrowRight" :size="18" />
        لوحة التحكم
      </RouterLink>
    </header>

    <div v-if="loading" class="state font-ar text-secondary">جاري التحميل…</div>
    <div v-else-if="error" class="state state--err font-ar">{{ error }}</div>

    <template v-else>
      <section v-if="nextLesson" class="hero-next animate-fade-in">
        <div class="hero-next__badge font-ar">ابدأ من هنا</div>
        <h2 class="hero-next__title font-ar">{{ nextLesson.title }}</h2>
        <p class="hero-next__meta font-ar text-secondary">
          {{ nextLesson.subjectName }} • {{ nextLesson.duration }} دقيقة
        </p>
        <RouterLink :to="`/lessons/${nextLesson.lessonId}`">
          <AppButton size="lg">
            <AppIcon name="PlayCircle" :size="20" />
            <span style="margin-inline-start: 8px">متابعة الدرس</span>
          </AppButton>
        </RouterLink>
      </section>

      <section v-else-if="items.length === 0" class="empty font-ar text-secondary">
        لا توجد دروس مطابقة لصفك ومرحلتك في الكتالوج، أو أكمل التعريف في الملف الشخصي.
      </section>

      <section v-else class="all-good font-ar text-secondary">
        أتممت جميع الدروس المتاحة في خطتك — رائع!
      </section>

      <section v-if="items.length > 0" class="list-section">
        <h3 class="list-heading font-ar text-navy">كل الدروس (بالترتيب)</h3>
        <ul class="plan-list">
          <li
            v-for="it in items"
            :key="it.lessonId"
            class="plan-row"
            :class="{ 'plan-row--next': it.isNext, [statusClass(it.status)]: true }"
          >
            <div class="plan-row__main">
              <span v-if="it.isNext" class="next-tag font-ar">التالي</span>
              <span class="plan-title font-ar">{{ it.title }}</span>
              <span class="plan-sub font-ar text-secondary">
                {{ it.subjectName }} — {{ it.chapterTitle }}
              </span>
            </div>
            <span class="plan-status font-ar">{{ statusLabel(it.status) }}</span>
            <RouterLink :to="`/lessons/${it.lessonId}`" class="plan-link font-ar">فتح</RouterLink>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.study-plan-page {
  padding: var(--space-2xl) var(--space-md) var(--space-4xl);
  max-width: 900px;
  margin: 0 auto;
}

.page-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.page-title {
  margin: 0 0 var(--space-xs);
  font-size: var(--text-h2);
}

.page-sub {
  margin: 0;
  font-size: var(--text-body);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xxs);
  color: var(--color-navy);
  text-decoration: none;
  font-size: var(--text-body-sm);
}

.back-link:hover {
  text-decoration: underline;
}

.state {
  padding: var(--space-xl);
  text-align: center;
}

.state--err {
  color: var(--color-error);
}

.hero-next {
  padding: var(--space-xl);
  border-radius: var(--radius-xl);
  background: linear-gradient(
    135deg,
    rgba(30, 58, 95, 0.08) 0%,
    rgba(244, 168, 37, 0.12) 100%
  );
  border: 2px solid rgba(244, 168, 37, 0.35);
  margin-bottom: var(--space-2xl);
  text-align: center;
}

.hero-next__badge {
  display: inline-block;
  padding: var(--space-xxs) var(--space-md);
  background: var(--color-gold);
  color: var(--color-navy);
  font-weight: var(--weight-bold);
  border-radius: var(--radius-full);
  font-size: var(--text-body-sm);
  margin-bottom: var(--space-md);
}

.hero-next__title {
  margin: 0 0 var(--space-sm);
  font-size: var(--text-h3);
  color: var(--color-navy);
}

.hero-next__meta {
  margin: 0 0 var(--space-lg);
}

.empty,
.all-good {
  padding: var(--space-lg);
  background: var(--bg-section);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-xl);
}

.list-heading {
  margin: 0 0 var(--space-md);
  font-size: var(--text-body-lg);
}

.plan-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.plan-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.plan-row--next {
  border-color: var(--color-gold);
  box-shadow: 0 0 0 1px rgba(244, 168, 37, 0.25);
}

.plan-row.is-done {
  opacity: 0.85;
}

.plan-row__main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.next-tag {
  font-size: var(--text-caption);
  font-weight: var(--weight-bold);
  color: var(--color-gold);
}

.plan-title {
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.plan-sub {
  font-size: var(--text-caption);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-status {
  font-size: var(--text-body-sm);
  color: var(--text-secondary);
  white-space: nowrap;
}

.plan-link {
  color: var(--color-navy);
  font-weight: var(--weight-semibold);
  text-decoration: none;
}

.plan-link:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .plan-row {
    grid-template-columns: 1fr;
  }
}
</style>
