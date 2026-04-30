/**
 * يولّد مُعرِّف عشوائي مكوَّن من 12 رقم.
 * يُستخدم لكل الكيانات: Stage, Grade, Term, Subject, Lesson, Section.
 *
 * @param existingIds - مجموعة اختيارية من المعرفات الموجودة لضمان عدم التكرار
 */
export function generateId(existingIds?: Set<string>): string {
  const min = 100_000_000_000;
  const max = 999_999_999_999;

  let id: string;
  do {
    id = String(Math.floor(Math.random() * (max - min + 1)) + min);
  } while (existingIds?.has(id));

  existingIds?.add(id);
  return id;
}
