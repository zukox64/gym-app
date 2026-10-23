/**
 * R2-5: رياضيات الرسوم — نقية بالكامل (بدون DOM) عشان tests + بترجع جاهزة للرسم في SVG.
 * كل المسارات normalized على viewBox ثابت للرسم مباشرة.
 */

import type { LoggedExercise, WorkoutLog } from "../types";
import { epley1RM } from "./overload";
import { monthLabel } from "./date";

export interface XYPoint { x: number; y: number }
export interface SeriesPoint { date: string; v: number }

/** حجم تمرين واحد — من setsDone لو مسجلة per-set وإلا التقدير القديم */
export const exerciseVolume = (e: LoggedExercise): number => {
  if (e.setsDone && e.setsDone.length > 0) {
    return e.setsDone.reduce((s, st) => s + st.w * st.r, 0);
  }
  return e.sets * e.reps * e.weight;
};

/** حجم اللوج كله */
export const logVolume = (l: WorkoutLog): number =>
  l.exercises.reduce((s, e) => s + exerciseVolume(e), 0);

/** حجم كل عضلة عبر اللوكز — للـ heatmap */
export const muscleVolumeMap = (logs: readonly WorkoutLog[]): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const l of logs) {
    for (const e of l.exercises) {
      out[e.muscle] = (out[e.muscle] ?? 0) + exerciseVolume(e);
    }
  }
  return out;
};

/** منحنى 1RM التقديري (Epley) لتمرين — أعلى عدة في كل تمرين */
export const est1rmSeries = (logs: readonly WorkoutLog[], name: string): SeriesPoint[] => {
  const pts: SeriesPoint[] = [];
  for (const l of logs) {
    const ex = l.exercises.find(e => e.name === name);
    if (!ex) continue;
    const sets = ex.setsDone && ex.setsDone.length > 0
      ? ex.setsDone
      : [{ w: ex.weight, r: ex.reps }];
    const best = Math.max(0, ...sets.map(st => epley1RM(st.w, st.r)));
    if (best > 0) pts.push({ date: l.date, v: Math.round(best * 100) / 100 });
  }
  return pts;
};

/** حجم شهري لكل شهر من آخر N أشهر — قديمة → جديدة (للرسم) */
export const monthVolumeSeries = (
  logs: readonly WorkoutLog[],
  months = 6,
  ref = new Date(),
): { label: string; v: number }[] => {
  const buckets = new Map<string, number>();
  for (const l of logs) {
    const [y, m] = l.date.split("-").map(Number);
    const k = `${y}-${m}`;
    buckets.set(k, (buckets.get(k) ?? 0) + logVolume(l));
  }
  const out: { label: string; v: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    const k = `${d.getFullYear()}-${d.getMonth() + 1}`;
    out.push({ label: monthLabel(d.getFullYear(), d.getMonth()), v: buckets.get(k) ?? 0 });
  }
  return out;
};

/**
 * مسار خط SVG من نقاط (viewBox 0..w/0..h مع padding) — قديمة → جديدة (x صغير → كبير)
 * نقطة واحدة ⇒ خط مسطح في المنتصف. صفر نقاط ⇒ "".
 */
export const linePath = (pts: readonly SeriesPoint[], w: number, h: number, pad = 6): string => {
  if (pts.length === 0) return "";
  const xs = pts.length === 1 ? [w / 2] : pts.map((_, i) => pad + (i / (pts.length - 1)) * (w - pad * 2));
  const max = Math.max(1, ...pts.map(p => p.v));
  const ys = pts.map(p => h - pad - (p.v / max) * (h - pad * 2));
  const coords: XYPoint[] = xs.map((x, i) => ({ x, y: ys[i]! }));
  return coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
};

/** مسار المنطقة (خط + إغلاق للأرض) — لـ fill بالـ gradient */
export const areaPath = (pts: readonly SeriesPoint[], w: number, h: number, pad = 6): string => {
  const line = linePath(pts, w, h, pad);
  if (!line) return "";
  const lastX = pts.length === 1 ? w / 2 : pad + (w - pad * 2);
  return `${line} L${lastX.toFixed(1)},${h - pad} L${(pts.length === 1 ? w / 2 : pad).toFixed(1)},${h - pad} Z`;
};
