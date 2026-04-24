import type { Stage } from '@/types/course';
import type { SecondaryTrack } from '@/types/auth';

/** عرض مادة فصلية — معرف 12 رقم (نص) يتكرر لكل (مرحلة، صف، مادة، [مسار]) */
export interface CurriculumOffering {
  id: string;
  subjectSlug: string;
  stage: Stage;
  grade: string;
  /** إن وُجدت: مادة خاصة بمسار؛ إن `undefined` = مشتركة لكل مسارات تلك السنة */
  secondaryTrack?: SecondaryTrack;
}

export interface CurriculumOfferingsFile {
  offerings: CurriculumOffering[];
}
