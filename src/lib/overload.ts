/**
 * R2-4: قاعدة Progressive Overload الشفافة — pure ومغطاة بـ tests.
 *
 * القاعدة: لو آخر جلستين للتمرين مشتغلين بنفس الوزن،
 * وكل عدة فيهم وصلت العدد المستهدف — نقترح وزن الجلسة الجاية = وزن + خطوة زيادة (2.5 kg / 5 lbs).
 */

import type { WorkoutLog } from "../types";

export interface SessionSetRef { w: number; r: number }
export interface OverloadSession { sets: SessionSetRef[] }

export interface OverloadSuggestion {
  /** الوزن المقترح للجلسة الجاية */
  nextWeight: number;
  /** مقدار الزيادة */
  increment: number;
  /** سبب مقترح — للعرض للمستخدم */
  reason: string;
}

export const KG_INCREMENT = 2.5;
export const LBS_INCREMENT = 5;

/** تقدير 1RM بمعادلة Epley — عدة واحدة بتعطي الوزن نفسه */
export const epley1RM = (weight: number, reps: number): number =>
  reps <= 1 ? weight : weight * (1 + reps / 30);

export const suggestOverload = (
  sessions: OverloadSession[],
  targetReps: number,
  unit: "kg" | "lbs" = "kg",
): OverloadSuggestion | null => {
  if (sessions.length < 2) return null;
  const [last, prev] = sessions;

  const pass = (s: OverloadSession): number | null => {
    if (s.sets.length === 0) return null;
    for (const st of s.sets) {
      if (st.r < targetReps || st.w <= 0) return null;
    }
    return s.sets[0]!.w;
  };
  const lastW = pass(last);
  const prevW = pass(prev);
  if (lastW === null || prevW === null) return null;

  if (Math.abs(lastW - prevW) > 0.001) return null;

  const inc = unit === "lbs" ? LBS_INCREMENT : KG_INCREMENT;
  return {
    nextWeight: Math.round((lastW + inc) * 100) / 100,
    increment: inc,
    reason: `جلستين كل العدّات بنفس الوزن (${lastW} ${unit}) — زوّد ${inc} ${unit}`,
  };
};

/** آخر جلستين للتمرين من اللوجز — معمورين من setsDone لو موجودة وإلا من sets/reps/weight القديمة (migration-safe) */
export const overloadSessionsFromLogs = (logs: readonly WorkoutLog[], name: string): OverloadSession[] => {
  const out: OverloadSession[] = [];
  for (const l of logs) {
    const ex = l.exercises.find((e) => e.name === name);
    if (!ex) continue;
    const sets: SessionSetRef[] = ex.setsDone
      ? ex.setsDone.slice(0, Math.max(ex.sets, ex.setsDone.length))
      : Array.from({ length: Math.max(ex.sets, 1) }, () => ({ w: ex.weight, r: ex.reps }));
    out.push({ sets });
    if (out.length === 2) break;
  }
  return out;
};
