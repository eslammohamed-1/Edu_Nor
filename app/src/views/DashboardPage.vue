<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { LessonInfo } from '@/types/course';
import { useAuth } from '@/composables/useAuth';
import { useCurriculumStore } from '@/stores/curriculum';
import DashboardStats from '@/components/dashboard/DashboardStats.vue';
import RecentLessons from '@/components/dashboard/RecentLessons.vue';
import ProgressChart from '@/components/dashboard/ProgressChart.vue';
import ProfileCard from '@/components/dashboard/ProfileCard.vue';
import NextLessonWidget from '@/components/student/NextLessonWidget.vue';
import StreakWidget from '@/components/student/StreakWidget.vue';
import BadgesGrid from '@/components/student/BadgesGrid.vue';

const { user } = useAuth();
const curriculum = useCurriculumStore();

// المواد حسب الطالب
const mySubjects = computed(() => {
  if (!user.value || user.value.role !== 'student') return [];
  return curriculum.subjectsForUser(user.value);
});

const totalLessonsCompleted = computed(() => curriculum.completedLessons.size);

const stats = computed(() => [
  {
    label: 'دروس مكتملة',
    value: totalLessonsCompleted.value,
    icon: 'CheckCircle2',
    color: 'var(--color-success)'
  },
  {
    label: 'مواد نشطة',
    value: mySubjects.value.filter(s => curriculum.subjectProgress(s.id) > 0).length,
    icon: 'BookOpen',
    color: 'var(--color-navy)'
  },
  {
    label: 'ساعات تعلم',
    value: Math.round(totalLessonsCompleted.value * 0.4),
    icon: 'Clock',
    color: 'var(--color-teal)'
  },
  {
    label: 'المواد المتاحة',
    value: mySubjects.value.length,
    icon: 'Layers',
    color: 'var(--color-gold)'
  }
]);

const recentLessons = computed(() => {
  const items: Array<{ lesson: LessonInfo; courseTitle: string; courseId: string }> = [];
  for (const subj of mySubjects.value) {
    for (const lesson of subj.lessons) {
      if (curriculum.isLessonComplete(lesson.id)) {
        items.push({ lesson, courseTitle: subj.name, courseId: subj.id });
      }
    }
  }
  return items.slice(0, 5);
});

const subjectProgress = computed(() => {
  return mySubjects.value
    .map((subj) => {
      const completed = subj.lessons.filter((l) => curriculum.isLessonComplete(l.id)).length;
      const progress = subj.lessons.length === 0 ? 0 : Math.round((completed / subj.lessons.length) * 100);
      return {
        name: subj.name,
        icon: subj.icon,
        color: subj.color,
        progress,
        completed,
        total: subj.lessons.length
      };
    })
    .filter((s) => s.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 6);
});
</script>

<template>
  <div class="dashboard-page container">
    <div v-if="user" class="dashboard-grid">
      <div class="dashboard-main">
        <DashboardStats :user-name="user.name" :stats="stats" />

        <NextLessonWidget v-if="user.role === 'student'" />

        <div v-if="user.role === 'student'" class="gamify-row">
          <StreakWidget />
          <BadgesGrid />
        </div>

        <div v-if="user.role === 'student'" class="quick-links font-ar">
          <RouterLink to="/leaderboard" class="ql">لوحة المتصدرين</RouterLink>
          <RouterLink to="/my-notes" class="ql">ملاحظاتي</RouterLink>
          <RouterLink to="/study-plan" class="ql">خطتي الدراسية</RouterLink>
        </div>

        <div class="widgets-row">
          <RecentLessons :lessons="recentLessons" />
          <ProgressChart :subjects="subjectProgress" />
        </div>
      </div>

      <aside class="dashboard-aside">
        <ProfileCard :user="user" />
      </aside>
    </div>

    <div v-else class="not-auth">
      <p class="font-ar">الرجاء تسجيل الدخول أولاً.</p>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  padding: var(--space-2xl) var(--space-md) var(--space-4xl);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-xl);
}

.dashboard-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  min-width: 0;
}

.widgets-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.gamify-row {
  display: grid;
  grid-template-columns: minmax(220px, 320px) 1fr;
  gap: var(--space-md);
  align-items: start;
}

.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.ql {
  color: var(--color-teal);
  font-weight: var(--weight-semibold);
  text-decoration: none;
}

.ql:hover {
  text-decoration: underline;
}

.dashboard-aside {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.not-auth {
  text-align: center;
  padding: var(--space-4xl);
}

@media (max-width: 992px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .widgets-row {
    grid-template-columns: 1fr;
  }
  .gamify-row {
    grid-template-columns: 1fr;
  }
}
</style>
