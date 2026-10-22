/**
 * مولّد الخطط (A1) — دالة نقية بلا أي حالة أو I/O.
 *
 * القواعد:
 *  1. العضلات بتتطبّع عبر خريطة صريحة (Lats/MidBack/LowerBack → Back،
 *     SideDelt/FrontDelt/RearDelt → Shoulders …) — بدون includes فضفاض.
 *  2. التمارين بتتوزع round-robin على عضلات اليوم، ف(Bاي & Back) يظل فيه صدر + ضهر.
 *  3. المركبات (compound) قبل العزل (isolation) في كل مجموعة.
 *  4. الحد الأقصى لكل يوم حسب المستوى: مبتدئ ٤ / متوسط ٥ / متقدم ٦.
 *  5. لا تكرار لنفس التمرين داخل اليوم.
 *  6. فلترة المعدات (A2): حركة بدون equipment متاحة للكل؛ وإلا لازم معدات
 *     مشتركة مع المختارة للمستخدم، و("Full Gym" أو قائمة فارغة تفتح كل شيء).
 */

import type { BuiltPlanDay, Exercise, Equipment, PlanTemplate } from "../types";
import { muscleGroupOf } from "../data/muscles";
import { uid } from "./id";

export type LibraryEntryLike = Omit<Exercise, "id"> & { equipment?: Equipment[] };

/* كلمات مفتاحية للحركات المركّبة (بيستخدم للطرد الجديد — المكتبة القديمة عليها قائمة صريحة) */
const COMPOUND_KEYWORDS = [
  "squat",
  "deadlift",
  "press",
  "bench",
  "row",
  "pull-up",
  "pullup",
  "chin-up",
  "chinup",
  "pulldown",
  "push-up",
  "pushup",
  "dip",
  "lunge",
  "step-up",
  "thrust",
  "clean",
  "snatch",
  "burpee",
  "bridge",
  "inverted row",
  "muscle-up",
  "carry",
  "walk",
  "hinge",
];

const COMPOUND_EXACT = new Set([
  "Barbell Bench Press",
  "Incline Dumbbell Press",
  "Push-ups",
  "Dumbbell Rows",
  "Lat Pulldown",
  "Pull-ups",
  "Seated Cable Row",
  "Overhead Press",
  "Barbell Squat",
  "Leg Press",
  "Romanian Deadlift",
  "Hip Thrust",
  "Bulgarian Split Squat",
]);

/** هل الحركة مركّبة (multi-joint)؟ قائمة صريحة + كلمات مفتاحية للحركات الجديدة */
export const isCompound = (name: string): boolean => {
  if (COMPOUND_EXACT.has(name)) return true;
  const n = name.toLowerCase();
  return COMPOUND_KEYWORDS.some((k) => n.includes(k));
};

/**
 * توافق المعدات (A2):
 *  - حركة من غير معدات ⇒ متاحة للكل (بيانات قديمة).
 *  - "Full Gym" أو قائمة معدات فاضية ⇒ كل شيء متاح.
 *  - غير كده: لازم تقاطع بين معدات الحركة والمتاحة للمستخدم.
 */
export const equipmentCompatible = (
  ex: { equipment?: Equipment[] },
  available: readonly string[],
): boolean => {
  if (!ex.equipment || ex.equipment.length === 0) return true;
  if (available.length === 0) return true;
  if (available.some((a) => a.toLowerCase() === "full gym")) return true;
  return ex.equipment.some((eq) => available.some((a) => a.toLowerCase() === eq.toLowerCase()));
};

/** الحد الأقصى لعدد التمارين في اليوم حسب مستوى المتدرب */
export const maxExercisesPerDay = (level: string): number =>
  level === "Beginner" ? 4 : level === "Advanced" ? 6 : 5;

/** round-robin داخلي: بيختار بالتناوب من كل مجموعة عضلية حتى العدد المطلوب ينتهي */
const pickRoundRobin = (
  groups: readonly string[],
  pools: Map<string, LibraryEntryLike[]>,
  count: number,
): LibraryEntryLike[] => {
  const picked: LibraryEntryLike[] = [];
  const used = new Set<string>();
  let gi = 0;
  let emptyStreak = 0;
  while (picked.length < count && emptyStreak < groups.length) {
    const g = groups[gi % groups.length];
    gi += 1;
    const pool = pools.get(g) ?? [];
    let next: LibraryEntryLike | undefined;
    while (pool.length > 0) {
      const cand = pool.shift()!;
      if (!used.has(cand.name)) {
        next = cand;
        break;
      }
    }
    if (next) {
      used.add(next.name);
      picked.push(next);
      emptyStreak = 0;
    } else {
      emptyStreak += 1;
    }
  }
  return picked;
};

const buildPools = (
  groups: readonly string[],
  library: readonly LibraryEntryLike[],
  filter?: (ex: LibraryEntryLike) => boolean,
): Map<string, LibraryEntryLike[]> => {
  const pools = new Map<string, LibraryEntryLike[]>();
  for (const g of groups) pools.set(g, []);
  for (const ex of library) {
    if (filter && !filter(ex)) continue;
    const g = muscleGroupOf(ex.muscle);
    if (!g) continue;
    const arr = pools.get(g);
    if (arr) arr.push(ex);
  }
  for (const g of groups) {
    const arr = pools.get(g)!;
    // compound أولاً ثم بترتيب المكتبة (stability)
    arr.sort((a, b) => Number(isCompound(b.name)) - Number(isCompound(a.name)));
  }
  return pools;
};

/**
 * مولّد الخطة النقي — المدخل تطبيق تيمبليت + مكتبة + معدات + مستوى.
 * لو يوم مقدرش ينكمل بالكامل (مثلاً بعد فلترة المعدات) بيرجع اللي قدر عليه
 * مع complete=false عشان الواجهة تعمل toast توضيحي.
 */
export function buildPlanFromTemplate(
  template: PlanTemplate,
  library: readonly LibraryEntryLike[],
  availableEquipment: readonly string[],
  level: string,
): BuiltPlanDay[] {
  const cap = maxExercisesPerDay(level);

  return template.daysPlan.map((dp) => {
    // مجموعة العضلات الموحّدة لليوم، مع الحفاظ على ترتيب التطبيل
    const groups: string[] = [];
    for (const m of dp.muscles) {
      const g = muscleGroupOf(m);
      if (g && !groups.includes(g)) groups.push(g);
    }

    if (groups.length === 0) {
      return { label: dp.label, exercises: [], complete: false };
    }

    // العدد المثالي بدون فلترة المعدات (المرجع للحكم على "عدم الاكتمال")
    const idealPools = buildPools(groups, library);
    const ideal = pickRoundRobin(groups, idealPools, cap).length;

    // الاختيار الفعلي مطبّق فيه فلترة المعدات
    const realPools = buildPools(groups, library, (ex) => equipmentCompatible(ex, availableEquipment));
    const picked = pickRoundRobin(groups, realPools, cap);

    const exercises: Exercise[] = picked.map((ex) => ({ ...ex, id: uid() }));
    return { label: dp.label, exercises, complete: exercises.length >= ideal };
  });
}
