import type { Stage } from '@/types/course';
import type { SecondaryTrack } from '@/types/auth';

/** ترتيب العرض: ثانوي → إعدادي → ابتدائي (مثل واجهات عربية شائعة) */
export const STAGE_OPTIONS: Array<{ id: Stage; label: string }> = [
  { id: 'secondary', label: 'ثانوي' },
  { id: 'prep', label: 'إعدادي' },
  { id: 'primary', label: 'ابتدائي' }
];

export const GRADES_BY_STAGE: Record<Stage, string[]> = {
  primary: [
    'الصف الأول الابتدائي',
    'الصف الثاني الابتدائي',
    'الصف الثالث الابتدائي',
    'الصف الرابع الابتدائي',
    'الصف الخامس الابتدائي',
    'الصف السادس الابتدائي'
  ],
  prep: [
    'الصف الأول الإعدادي',
    'الصف الثاني الإعدادي',
    'الصف الثالث الإعدادي'
  ],
  secondary: [
    'الصف الأول الثانوي',
    'الصف الثاني الثانوي',
    'الصف الثالث الثانوي'
  ]
};

export const SECONDARY_TRACK_OPTIONS: Array<{
  id: SecondaryTrack;
  label: string;
}> = [
  { id: 'scientific_ar', label: 'علمي (عربي)' },
  { id: 'scientific_languages', label: 'علمي (لغات)' },
  { id: 'literary', label: 'أدبي' }
];

export function trackLabel(t: SecondaryTrack): string {
  return SECONDARY_TRACK_OPTIONS.find((o) => o.id === t)?.label ?? t;
}

export function stageLabel(s: Stage): string {
  return STAGE_OPTIONS.find((o) => o.id === s)?.label ?? s;
}
