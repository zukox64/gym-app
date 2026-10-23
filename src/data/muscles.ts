/**
 * كل شيء عن العضلات: المجموعات الموحدة (normalized groups) والأيقونات.
 * التسميات بالعربي تلاقها في strings.ts.
 */

/** مجموعة موحّدة تُستخدم في مولّد الخطط والفلاتر — أسماء إنجليزية دائمة */
export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Quads"
  | "Hamstrings"
  | "Glutes"
  | "Calves"
  | "Abs"
  | "Obliques"
  | "Forearms";

/** خريطة التطبيع الصريحة — أي عضلة خام داخل التطبيلات أو المكتبة بتتحول لمجموعة موحّدة (A1) */
const MUSCLE_TO_GROUP: Record<string, MuscleGroup> = {
  Chest: "Chest",
  Back: "Back",
  Lats: "Back",
  "Mid Back": "Back",
  "Lower Back": "Back",
  Traps: "Back",
  Shoulders: "Shoulders",
  "Side Delt": "Shoulders",
  "Front Delt": "Shoulders",
  "Rear Delt": "Shoulders",
  Biceps: "Biceps",
  Triceps: "Triceps",
  Quads: "Quads",
  Hamstrings: "Hamstrings",
  Glutes: "Glutes",
  Calves: "Calves",
  Abs: "Abs",
  "Upper Abs": "Abs",
  "Lower Abs": "Abs",
  Obliques: "Obliques",
  Forearms: "Forearms",
};

/** التطبيع الصريح — بدون includes فضفاض. Unknown ⇒ null (يُتجاهل بالأمان) */
export const muscleGroupOf = (raw: string): MuscleGroup | null => MUSCLE_TO_GROUP[raw] ?? null;

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Abs",
  "Obliques",
  "Forearms",
];
