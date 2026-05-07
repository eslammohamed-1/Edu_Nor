<script setup lang="ts">
import type { QuestionType } from '@/types/quiz';

const props = defineProps<{
  questionType: QuestionType;
}>();

const labels: Partial<Record<QuestionType, string>> = {
  ordering: 'ترتيب العناصر (سحب وإفلات)',
  matching: 'توصيل العناصر',
  string: 'إجابة قصيرة',
  frq: 'إجابة مفتوحة',
  input: 'إدخال رقم أو نص',
  counting: 'عدّ أو إدخال',
  puzzle: 'تركيب الصورة',
  gmrq: 'اختيار من متعدد داخل مجموعات',
  multipart: 'سؤال مركّب'
};
</script>

<template>
  <div class="quiz-placeholder font-ar">
    <p class="quiz-placeholder__title">واجهة النوع «{{ questionType }}»</p>
    <p class="quiz-placeholder__hint text-secondary">
      {{ labels[questionType] ?? 'عرض تفاعلي' }} — قيد التطوير ضمن U3 (محرّك الاختبارات v2).
    </p>
  </div>
</template>

<style scoped>
.quiz-placeholder {
  padding: var(--space-xl);
  background: var(--bg-section);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border-color);
  text-align: center;
}
.quiz-placeholder__title {
  margin: 0 0 var(--space-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}
.quiz-placeholder__hint {
  margin: 0;
  font-size: var(--text-body-sm);
}
</style>
