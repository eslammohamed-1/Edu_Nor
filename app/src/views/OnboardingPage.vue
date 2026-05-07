<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useCurriculumStore } from '@/stores/curriculum';
import { stageLabel, trackLabel } from '@/config/educationTracks';
import { patchOnboardingComplete } from '@/services/studentStatsService';
import AppButton from '@/components/common/AppButton.vue';
import AppIcon from '@/components/common/AppIcon.vue';

const step = ref(1);
const router = useRouter();
const { user, patchSessionUser } = useAuth();
const curriculum = useCurriculumStore();

const summary = computed(() => {
  const u = user.value;
  if (!u) return '';
  const g = u.grade ?? '';
  if (u.stage === 'secondary' && u.secondaryTrack) {
    return `${stageLabel(u.stage)} — ${g} — ${trackLabel(u.secondaryTrack)}`;
  }
  if (u.stage) {
    return `${stageLabel(u.stage)} — ${g}`;
  }
  return g || 'طالب';
});

const subjects = computed(() => curriculum.subjectsForUser(user.value ?? null));
const selected = ref<string[]>([]);

function toggleSubject(id: string) {
  const i = selected.value.indexOf(id);
  if (i >= 0) {
    selected.value = selected.value.filter((x) => x !== id);
    return;
  }
  if (selected.value.length >= 3) return;
  selected.value = [...selected.value, id];
}

const tourSlides = [
  {
    title: 'خطتك الدراسية',
    text: 'من لوحة التحكم نوفّر لك اقتراحاً للدرس التالي وفق تقدّمك.'
  },
  {
    title: 'نقاط وسلسلة',
    text: 'كل إنجاز يضيف نقاطاً ويشعل سلسلة الأيام النشِطة.'
  },
  {
    title: 'ابدأ الآن',
    text: 'اخترنا معك مواداً تهمّك — يمكنك تغيير ذلك لاحقاً من ملفك.'
  }
];

const tourIndex = ref(0);

const submitting = ref(false);
const err = ref('');

async function finish() {
  err.value = '';
  if (selected.value.length < 1) {
    err.value = 'اختر مادة واحدة على الأقل';
    return;
  }
  submitting.value = true;
  try {
    const nextUser = await patchOnboardingComplete({
      favoriteSubjectIds: selected.value.slice(0, 3),
      stage: user.value?.stage,
      grade: user.value?.grade,
      secondaryTrack: user.value?.secondaryTrack
    });
    patchSessionUser(nextUser);
    await router.push('/dashboard');
  } catch (e) {
    err.value = e instanceof Error ? e.message : 'تعذّر الحفظ';
  } finally {
    submitting.value = false;
  }
}

function nextTour() {
  if (tourIndex.value < tourSlides.length - 1) {
    tourIndex.value += 1;
  } else {
    void finish();
  }
}
</script>

<template>
  <div class="onboarding-page container">
    <div class="panel">
      <div class="steps font-en">
        <span :class="{ active: step === 1 }">1</span>
        <span class="sep">—</span>
        <span :class="{ active: step === 2 }">2</span>
        <span class="sep">—</span>
        <span :class="{ active: step === 3 }">3</span>
      </div>

      <section v-if="step === 1" class="step">
        <h1 class="font-ar">مرحباً {{ user?.name }}</h1>
        <p class="lead font-ar text-secondary">لنركّز تجربتك على ما يناسبك.</p>
        <div class="card-summary font-ar">
          <AppIcon name="GraduationCap" :size="32" color="var(--color-gold)" />
          <p>{{ summary }}</p>
        </div>
        <AppButton @click="step = 2">التالي</AppButton>
      </section>

      <section v-else-if="step === 2" class="step">
        <h2 class="font-ar">اختر حتى 3 مواد تهمّك</h2>
        <p class="text-secondary font-ar">يمكنك تغيير اختيارك لاحقاً.</p>
        <div class="subject-grid">
          <button
            v-for="s in subjects"
            :key="s.id"
            type="button"
            class="subj-chip font-ar"
            :class="{ 'subj-chip--on': selected.includes(s.id) }"
            @click="toggleSubject(s.id)"
          >
            {{ s.name }}
          </button>
        </div>
        <p v-if="err" class="err font-ar">{{ err }}</p>
        <div class="row-btns">
          <AppButton variant="ghost" @click="step = 1">رجوع</AppButton>
          <AppButton :disabled="selected.length < 1" @click="step = 3">التالي</AppButton>
        </div>
      </section>

      <section v-else class="step">
        <h2 class="font-ar">{{ tourSlides[tourIndex]!.title }}</h2>
        <p class="tour-text font-ar text-secondary">{{ tourSlides[tourIndex]!.text }}</p>
        <div class="tour-dots">
          <span
            v-for="(_, i) in tourSlides"
            :key="i"
            class="dot"
            :class="{ 'dot--on': i === tourIndex }"
          />
        </div>
        <div class="row-btns">
          <AppButton v-if="tourIndex > 0" variant="ghost" @click="tourIndex -= 1">رجوع</AppButton>
          <AppButton :loading="submitting" @click="nextTour">
            {{ tourIndex < tourSlides.length - 1 ? 'التالي' : 'ابدأ التعلّم' }}
          </AppButton>
        </div>
        <p v-if="err" class="err font-ar">{{ err }}</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.onboarding-page {
  padding: var(--space-3xl) var(--space-md);
  max-width: 720px;
}

.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-lg);
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
  color: var(--text-muted);
}

.steps span.active {
  color: var(--color-gold);
  font-weight: var(--weight-bold);
}

.step h1,
.step h2 {
  margin: 0 0 var(--space-sm);
  color: var(--text-primary);
}

.lead {
  margin: 0 0 var(--space-lg);
}

.card-summary {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  background: var(--bg-section);
  margin-bottom: var(--space-xl);
}

.subject-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin: var(--space-lg) 0;
}

.subj-chip {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
  background: var(--bg-section);
  cursor: pointer;
  font-weight: var(--weight-medium);
}

.subj-chip--on {
  border-color: var(--color-gold);
  background: rgba(244, 168, 37, 0.12);
  color: var(--color-navy);
}

.row-btns {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-xl);
  flex-wrap: wrap;
}

.err {
  color: var(--color-error);
  margin-top: var(--space-md);
}

.tour-text {
  font-size: 1.05rem;
  line-height: 1.7;
  margin: var(--space-lg) 0;
}

.tour-dots {
  display: flex;
  gap: 6px;
  margin-top: var(--space-md);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--border-color);
}

.dot--on {
  background: var(--color-gold);
}
</style>
