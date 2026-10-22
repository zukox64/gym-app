/* النماذج الأساسية للتطبيق — المصدر الوحيد للـ types المشتركة */

export type Page = "Home" | "Schedule" | "Progress" | "AI";

export type ThemeKey = "mono" | "emerald" | "orange" | "violet" | "cyan" | "rose";

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

/** مسجل سِت فردي داخل السيشن (B1 هيتوسّع) */
export interface SessionItem {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: number;
  weight: number;
  doneSets: number;
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
