/**
 * تحقق الحقول في الـ onboarding (A7) — رسائل inline + حدود منطقية.
 * النقاط: ما بنضغطش أثناء الكتابة — الارتباط حصل عند "التالي/احفظ".
 */

/* حدود منطقية (kg/cm هي المرجع؛ lbs/ft تتحوّل) */
export const AGE_RANGE = [10, 90] as const;
export const WEIGHT_KG = [20, 300] as const;
export const WEIGHT_LBS = [45, 660] as const;
export const HEIGHT_CM = [80, 250] as const;
export const HEIGHT_FT = [2, 8] as const;
export const TARGET_KG = [30, 400] as const;
export const TARGET_LBS = [65, 880] as const;

/* R2-1: حدود التحرير في اليوم/السيشن — مجموعة وثقل ووزن السيت */
export const SETS_RANGE = [1, 20] as const;
export const REPS_RANGE = [1, 200] as const;
/** وزن السيت ≥ 0 ويتحول من lbs (1000 lbs سقف معقول) */
export const WEIGHT_KG_SET = [0, 500] as const;
export const WEIGHT_LBS_SET = [0, 1000] as const;

/** أي مدخل غير رقمي (NaN) بيرجع للحد الأدنى — مش بينشر NaN في البيانات */
const safe = (v: number, min: number): number => (Number.isFinite(v) ? v : min);

export const clampN = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Math.round(safe(v, min))));

/** R2-1: clamp من غير تقريب — للوزن (خطوات 2.5 لازمة) */
export const clampF = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, safe(v, min)));

/** lbs ↔ kg تقريب */
export const toLbs = (kg: number): number => Math.round(kg * 2.20462);
export const toKg = (lbs: number): number => Math.round(lbs / 2.20462);

const inRange = (v: number, r: readonly [number, number]) =>
  Number.isFinite(v) && v >= r[0] && v <= r[1];

export const nameError = (v: string): string | null =>
  v.trim().length === 0 ? "اكتب اسمك الأول" : null;

export const ageError = (v: number | ""): string | null => {
  if (v === "" || !Number.isFinite(v)) return "اكتب عمرك";
  if (!inRange(v, AGE_RANGE)) return "العمر بين 10 و 90 سنة";
  return null;
};

export const weightError = (v: number | "", unit: "kg" | "lbs"): string | null => {
  if (v === "" || !Number.isFinite(v)) return "اكتب وزنك";
  const r = unit === "lbs" ? WEIGHT_LBS : WEIGHT_KG;
  if (!inRange(v, r)) return `الوزن بين ${r[0]} و ${r[1]} ${unit}`;
  return null;
};

export const heightError = (v: number | "", unit: "cm" | "ft"): string | null => {
  if (v === "" || !Number.isFinite(v)) return "اكتب طولك";
  const r = unit === "ft" ? HEIGHT_FT : HEIGHT_CM;
  if (!inRange(v, r)) return `الطول بين ${r[0]} و ${r[1]} ${unit}`;
  return null;
};

export const targetError = (v: number | "", unit: "kg" | "lbs"): string | null => {
  if (v === "" || !Number.isFinite(v)) return "اكتب وزنك المستهدف";
  const r = unit === "lbs" ? TARGET_LBS : TARGET_KG;
  if (!inRange(v, r)) return `المستهدف بين ${r[0]} و ${r[1]} ${unit}`;
  return null;
};

/** إدخالات الحفظ بعد التحقق — البيانات المخزنة دايمًا داخل الحدود */
export const clampedProfile = (raw: {
  age: number; weight: number; weightUnit: "kg" | "lbs"; height: number; heightUnit: "cm" | "ft"; targetWeight: number;
}): { age: number; weight: number; height: number; targetWeight: number } => {
  const wr = raw.weightUnit === "lbs" ? WEIGHT_LBS : WEIGHT_KG;
  const hr = raw.heightUnit === "ft" ? HEIGHT_FT : HEIGHT_CM;
  const tr = raw.weightUnit === "lbs" ? TARGET_LBS : TARGET_KG;
  return {
    age: clampN(raw.age, AGE_RANGE[0], AGE_RANGE[1]),
    weight: clampN(raw.weight, wr[0], wr[1]),
    height: clampN(raw.height, hr[0], hr[1]),
    targetWeight: clampN(raw.targetWeight, tr[0], tr[1]),
  };
};
