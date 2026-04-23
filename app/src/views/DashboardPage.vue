<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useCoursesStore } from '@/stores/courses';
import { courses as allCourses } from '@/data/courses';
import { subjects as allSubjects } from '@/data/subjects';
import DashboardStats from '@/components/dashboard/DashboardStats.vue';
import RecentLessons from '@/components/dashboard/RecentLessons.vue';
import ProgressChart from '@/components/dashboard/ProgressChart.vue';
import ProfileCard from '@/components/dashboard/ProfileCard.vue';
import CourseCard from '@/components/courses/CourseCard.vue';

const { user } = useAuth();
const coursesStore = useCoursesStore();

const totalLessonsCompleted = computed(() => coursesStore.completedLessons.size);

const enrolledCourses = computed(() =>
  allCourses.filter((c) => coursesStore.courseProgress(c.id) > 0)
);

const stats = computed(() => [
  {
    label: 'دروس مكتملة',
    value: totalLessonsCompleted.value,
    icon: 'CheckCircle2',
    color: 'var(--color-success)'
  },
  {
    label: 'كورسات نشطة',
    value: enrolledCourses.value.length,
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
    label: 'معدل التقدم',
    value: enrolledCourses.value.length === 0
      ? '0%'
      : Math.round(
          enrolledCourses.value.reduce((acc, c) => acc + coursesStore.courseProgress(c.id), 0) /
            enrolledCourses.value.length
        ) + '%',
    icon: 'TrendingUp',
    color: 'var(--color-gold)'
  }
]);

const recentLessons = computed(() => {
  const items: Array<{ lesson: typeof allCourses[number]['chapters'][number]['lessons'][number]; courseTitle: string; courseId: string }> = [];
  for (const course of allCourses) {
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (coursesStore.isLessonComplete(lesson.id)) {
          items.push({ lesson, courseTitle: course.title, courseId: course.id });
        }
      }
    }
  }
  return items.slice(0, 5);
});

const subjectProgress = computed(() => {
  return allSubjects
    .map((subject) => {
      const subjectCourses = allCourses.filter((c) => c.subjectId === subject.id);
      const allLessons = subjectCourses.flatMap((c) => c.chapters.flatMap((ch) => ch.lessons));
      const completed = allLessons.filter((l) => coursesStore.isLessonComplete(l.id)).length;
      const progress = allLessons.length === 0 ? 0 : Math.round((completed / allLessons.length) * 100);
      return {
        name: subject.name,
        icon: subject.icon,
        color: subject.color,
        progress,
        completed,
        total: allLessons.length
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

        <div class="widgets-row">
          <RecentLessons :lessons="recentLessons" />
          <ProgressChart :subjects="subjectProgress" />
        </div>

        <section v-if="enrolledCourses.length > 0" class="courses-section">
          <h2 class="font-ar text-navy section-title">كورساتي الحالية</h2>
          <div class="courses-grid">
            <CourseCard
              v-for="course in enrolledCourses"
              :key="course.id"
              :course="course"
              :progress="coursesStore.courseProgress(course.id)"
            />
          </div>
        </section>
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

.courses-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.section-title {
  font-size: var(--text-h3);
  margin-bottom: var(--space-xs);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-md);
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
}
</style>
