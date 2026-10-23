/* النماذج الأساسية للتطبيق — المصدر الوحيد للـ types المشتركة */

export type Page = "Home" | "Schedule" | "Progress" | "AI";

export type ThemeKey = "mono" | "emerald" | "orange" | "violet" | "cyan" | "rose" | "light" | "amoled";

/** المعدّات اللي ممكن حركة تحتاجها (بالإنجليزي كقيم داخلية، العرض بالعربي في strings.ts) */
export type Equipment =
  | "Barbell"
  | "Dumbbell"
  | "Kettlebell"
  | "Cable"
  | "Machine"
  | "EZ-Bar"
  | "Bands"
  | "Bench"
  | "Pull-up Bar"
  | "Bodyweight";

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  weightUnit: "kg" | "lbs";
  height: number;
  heightUnit: "cm" | "ft";
  goal: string;
  targetWeight: number;
  level: string;
  daysPerWeek: number;
  equipment: string[];
  /** الاستراحة الافتراضية بالثواني (B1) — اختيارية للحفاظ على التوافق مع النسخ القديمة */
  restSeconds?: number;
  /** R2-4: صوت بيب عند نهاية الاستراحة (WebAudio) */
  restBeep?: boolean;
}

/** حركة في خطة المستخدم */
export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  /** @deprecated لا يستخدم — بيتشال نهائيًا (كان نص مش مستغل) */
  icon?: string;
  sets: number;
  reps: number;
  weight?: number;
  /** R2-4: ملاحظة على التمرين (تظهر في السيشن والتعديل) */
  note?: string;
}

/** حركة في مكتبة التمارين (بيتبني منها Exercise بإضافة id) */
export type LibraryEntry = Omit<Exercise, "id"> & { equipment?: Equipment[] };

export interface WorkoutDay {
  id: string;
  label: string;
  exercises: Exercise[];
}

/** يوم جاهز من مولّد الخطط */
export interface BuiltPlanDay {
  label: string;
  exercises: Exercise[];
  /** false = معملناش العدد المستهدف من التمارين (مثلاً بسبب فلترة المعدات) */
  complete: boolean;
}

export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  level: string;
  days: number;
  split: string;
  /** المعدات المسموح بيها في التطبيل (undefined = كل حاجة) — A2 */
  equipment?: Equipment[];
  daysPlan: { label: string; muscles: string[] }[];
}

export interface LoggedExercise {
  name: string;
  muscle: string;
  sets: number;
  reps: number;
  weight: number;
  /** R2-4: عدّة-عدّة (w×r لكل مجموعة) — اختيارية: اللوجز القديمة بدونها شغالة (migration-safe) */
  setsDone?: { w: number; r: number }[];
  /** R2-4: ملاحظة التمرين المنسوخة من الخطة */
  note?: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  dayId: string;
  dayLabel: string;
  exercises: LoggedExercise[];
  volume: number;
  duration?: number;
  rest?: number;
}

/** حركة داخل السيشن الحية (R2-4: per-set logging) */
export interface SessionItem {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: number;
  weight: number;
  doneSets: number;
  /** R2-4: عدّة-عدّة — بتتعبأ أثناء الجلسة */
  setsDone: { w: number; r: number }[];
  /** R2-4: استراحة التمرين ده (compound 150s وإلا الافتراضي) */
  restSec: number;
  /** R2-4: ملاحظة من الخطة */
  note?: string;
}

export interface SessionState {
  dayId: string;
  label: string;
  startedAt: number;
  /** جُمّعة الراحة (ثواني) — بتتراكم لما الراحة تقفل (A3) */
  restSec: number;
  items: SessionItem[];
  currentIdx: number;
  /** الراحة النشطة — طابع زمني بالمللي (timestamp math بدل العدّاد) (A3) */
  restEndsAt: number | null;
  restStartedAt: number | null;
}
