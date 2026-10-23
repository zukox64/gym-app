/**
 * R2-4: تحويل وحدات التخزين عند التغيير kg↔lbs — migration صريح، مفيش داتا بتبقى مقسومة.
 * اللوجز + وزن الجسم + الخطة كلها بتتقلب، والـ volume بيتحسب من جديد من العدادات.
 */

import type { WorkoutDay, WorkoutLog } from "../types";
import type { BodyWeightPoint } from "./migrations";
import { convertWeight, KG_TO_LBS, LBS_TO_KG } from "./training";

export const convertLogsUnit = (logs: readonly WorkoutLog[], from: "kg" | "lbs", to: "kg" | "lbs"): WorkoutLog[] => {
  if (from === to) return [...logs];
  const k = from === "kg" ? KG_TO_LBS : LBS_TO_KG;
  return logs.map((l) => {
    const exercises = l.exercises.map((ex) => ({
      ...ex,
      weight: convertWeight(ex.weight, from, to),
      setsDone: ex.setsDone?.map((s) => ({ w: convertWeight(s.w, from, to), r: s.r })),
    }));
    const volume = exercises.reduce(
      (sum, ex) => sum + (ex.setsDone?.length
        ? ex.setsDone.slice(0, Math.max(1, ex.sets)).reduce((s, st) => s + st.w * st.r, 0)
        : ex.sets * ex.reps * ex.weight),
      0,
    );
    return { ...l, exercises, volume: Math.round(volume) || Math.round(l.volume * k) };
  });
};

export const convertBodyUnit = (body: readonly BodyWeightPoint[], from: "kg" | "lbs", to: "kg" | "lbs"): BodyWeightPoint[] => {
  if (from === to) return [...body];
  return body.map((p) => ({ d: p.d, v: convertWeight(p.v, from, to) }));
};

export const convertPlanUnit = (plan: readonly WorkoutDay[], from: "kg" | "lbs", to: "kg" | "lbs"): WorkoutDay[] => {
  if (from === to) return [...plan];
  return plan.map((d) => ({
    ...d,
    exercises: d.exercises.map((ex) => ({ ...ex, weight: convertWeight(ex.weight || 0, from, to) })),
  }));
};
