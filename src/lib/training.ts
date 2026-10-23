/**
 * R2-4: PRs تفصيلية + قاعدة استراحة المركبات + حاسبة الأطباق — كلها pure.
 */

import type { WorkoutLog } from "../types";
import { epley1RM } from "./overload";

/** PR بالأبعاد التلاتة لكل تمرين */
export interface PrTriple { heaviest: number; est1RM: number; bestVolume: number }

export const prTripleMap = (logs: readonly WorkoutLog[]): Record<string, PrTriple> => {
  const out: Record<string, PrTriple> = {};
  for (const l of logs) {
    for (const ex of l.exercises) {
      const done = ex.setsDone && ex.setsDone.length ? ex.setsDone.slice(0, Math.max(0, ex.sets)) : [{ w: ex.weight, r: ex.reps }];
      for (const s of done) {
        const cur = out[ex.name] ?? { heaviest: 0, est1RM: 0, bestVolume: 0 };
        cur.heaviest = Math.max(cur.heaviest, s.w);
        cur.est1RM = Math.max(cur.est1RM, Math.round(epley1RM(s.w, s.r) * 10) / 10);
        cur.bestVolume = Math.max(cur.bestVolume, s.w * s.r * Math.max(1, ex.sets));
        out[ex.name] = cur;
      }
    }
  }
  return out;
};

/** هل العدّة دي بتفوق أي PR؟ (اسم التمرين + مقارنة بالثلاثة) */
export const beatsAnyPr = (name: string, w: number, r: number, prs: Record<string, PrTriple>): boolean => {
  const pr = prs[name];
  if (!pr || w <= 0) return false;
  const isMass = w > pr.heaviest;
  const isRM = Math.round(epley1RM(w, r) * 10) / 10 > pr.est1RM;
  return isMass || isRM;
};

/* ===== استراحة المركبات (R2-4) — compound حسب النمط/الاسم، وقاعدة واضحة بتتكتب في tests ===== */

/** أسماء/أنماط الحركات المركبة الشهيرة (barbell/dumbbell متعددة المفاصل) */
const COMPOUND_PATTERNS = [
  /bench|press(?!.*lateral)|squat|deadlift|row(?!.*lateral)/i,
];

export const isCompound = (name: string): boolean => COMPOUND_PATTERNS.some((re) => re.test(name));

/** استراحة التمرين: 150ث للمركب، وإلا الافتراضي */
export const exerciseRest = (name: string, defaultRest: number): number =>
  isCompound(name) ? 150 : defaultRest;

/* ===== حاسبة الأطباق (R2-4) — pure ===== */

/** أوزان الأطباق الشائعة بالكلوجرام — بالباوند بنستعمل معيّن مقلوب */
export const KG_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25] as const;
export const LBS_PLATES = [45, 35, 25, 10, 5, 2.5] as const;

export interface PlateBreakdown {
  perSide: number[];
  /** الوزن اللي مش قابل للتطبيق بالأطباق المتاحة */
  residual: number;
  /** weight المطلوب أصلاً */
  target: number;
}

/** أطباق الجانب الواحد — البار الافتراضي 20 kg (أو 45 lbs)؛ المدخل وزن إجمالي شامل البار */
export const platesFor = (target: number, unit: "kg" | "lbs", bar: number): PlateBreakdown => {
  const pool = (unit === "lbs" ? LBS_PLATES : KG_PLATES).slice() as unknown as number[];
  let side = (target - bar) / 2;
  const perSide: number[] = [];
  for (const p of pool) {
    while (side >= p - 1e-9) {
      perSide.push(p);
      side = Math.round((side - p) * 100) / 100;
    }
    side = Math.round(side * 100) / 100;
  }
  return { perSide, residual: Math.max(0, Math.round(side * 100) / 100), target };
};

/** سلم الإحماء بنِسَب من وزن العمل — 40% × 5، 60% × 3، 80% × 1 */
export const warmupRamp = (workingWeight: number): { pct: number; w: number; reps: number }[] =>
  [
    { pct: 0.4, reps: 5 },
    { pct: 0.6, reps: 3 },
    { pct: 0.8, reps: 1 },
  ].map(({ pct, reps }) => {
    const w = Math.round(workingWeight * pct * 10) / 10;
    return { pct, w, reps };
  });

/* ===== تحويل الوحدات (R2-4) — migration أداة ===== */

export const KG_TO_LBS = 2.20462;
export const LBS_TO_KG = 1 / KG_TO_LBS;

/** تقريب لأقرب 2.5 (وحدة الكيلو) أو 5 (باوند) حسب الوحدة الجديدة */
export const snapWeight = (w: number, unit: "kg" | "lbs"): number => {
  const step = unit === "lbs" ? 5 : 2.5;
  return Math.round(w / step) * step;
};

export const convertWeight = (w: number, from: "kg" | "lbs", to: "kg" | "lbs", snap = true): number => {
  if (w === 0 || from === to) return w;
  const raw = from === "kg" ? w * KG_TO_LBS : w * LBS_TO_KG;
  return snap ? snapWeight(Math.round(raw * 100) / 100, to) : Math.round(raw * 100) / 100;
};
