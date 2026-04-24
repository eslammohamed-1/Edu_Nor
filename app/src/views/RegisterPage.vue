<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import AppIcon from '@/components/common/AppIcon.vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';
import RegisterStageStep from '@/components/auth/RegisterStageStep.vue';
import RegisterSecondaryTrackStep from '@/components/auth/RegisterSecondaryTrackStep.vue';
import RegisterGradeStep from '@/components/auth/RegisterGradeStep.vue';
import type { Stage } from '@/types/course';
import type { SecondaryTrack } from '@/types/auth';

const router = useRouter();

type WizardStep = 'stage' | 'secondary_track' | 'grade' | 'account';

const step = ref<WizardStep>('stage');
const selectedStage = ref<Stage | null>(null);
const selectedTrack = ref<SecondaryTrack | null>(null);
const selectedGrade = ref<string | null>(null);

const canShowAccount = computed(
  () =>
    selectedStage.value &&
    selectedGrade.value &&
    (selectedStage.value !== 'secondary' || selectedTrack.value !== null)
);

function onSelectStage(s: Stage) {
  selectedStage.value = s;
  selectedTrack.value = null;
  selectedGrade.value = null;
  if (s === 'secondary') {
    step.value = 'secondary_track';
  } else {
    step.value = 'grade';
  }
}

function onSelectTrack(t: SecondaryTrack) {
  selectedTrack.value = t;
  step.value = 'grade';
}

function onSelectGrade(g: string) {
  selectedGrade.value = g;
  step.value = 'account';
}

function goBack() {
  if (step.value === 'stage') {
    router.push('/login');
    return;
  }
  if (step.value === 'secondary_track') {
    step.value = 'stage';
    selectedStage.value = null;
    return;
  }
  if (step.value === 'grade') {
    selectedGrade.value = null;
    if (selectedStage.value === 'secondary') {
      step.value = 'secondary_track';
      selectedTrack.value = null;
    } else {
      step.value = 'stage';
      selectedStage.value = null;
    }
    return;
  }
  if (step.value === 'account') {
    step.value = 'grade';
    selectedGrade.value = null;
  }
}
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
            ابدأ رحلتك <span class="text-gold">اليوم</span>
          </h2>
          <p class="decoration-desc font-ar">
            انضم لآلاف الطلاب الذين غيّروا طريقة تعلمهم مع إديو نور.
          </p>

          <ul class="decoration-features">
            <li>
              <AppIcon name="Zap" :size="20" color="var(--color-gold)" />
              <span class="font-ar">بدء مجاني بدون بطاقة ائتمان</span>
            </li>
            <li>
              <AppIcon name="Users" :size="20" color="var(--color-gold)" />
              <span class="font-ar">مجتمع طلابي داعم</span>
            </li>
            <li>
              <AppIcon name="TrendingUp" :size="20" color="var(--color-gold)" />
              <span class="font-ar">تتبّع تقدمك بالتفصيل</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="auth-form-area">
      <RegisterStageStep v-if="step === 'stage'" @select="onSelectStage" @back="goBack" />
      <RegisterSecondaryTrackStep
        v-else-if="step === 'secondary_track'"
        @select="onSelectTrack"
        @back="goBack"
      />
      <RegisterGradeStep
        v-else-if="step === 'grade' && selectedStage"
        :stage="selectedStage"
        @select="onSelectGrade"
        @back="goBack"
      />
      <div v-else-if="step === 'account' && canShowAccount" class="account-step-wrap">
        <button type="button" class="form-back font-ar" @click="goBack">‹ رجوع</button>
        <RegisterForm
          :stage="selectedStage!"
          :grade="selectedGrade!"
          :secondary-track="selectedTrack ?? undefined"
        />
      </div>
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
  bottom: -30%;
  left: -20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(46, 196, 182, 0.15) 0%, transparent 70%);
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
  padding: var(--space-2xl) var(--space-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.form-back {
  display: block;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--text-body-sm);
  cursor: pointer;
  margin-bottom: var(--space-md);
  padding: 0;
  text-align: start;
}
.form-back:hover {
  color: var(--color-navy);
}
.account-step-wrap {
  width: 100%;
  max-width: 480px;
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
