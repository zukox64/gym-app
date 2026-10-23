/**
 * الإحصائيات كدوال نقية — نفس المعادلات القديمة وحدة؟ واحدة، بس بدون حالة (A4).
 * كل الدوال بتاخد اللوجز بره عشان تتحط في tests بسهولة.
 */

import type { WorkoutLog } from "../types";
import { todayKey } from "./date";

export interface MonthRef { y: number; m0: number }

/** لوجز شهر معيّن */
export const logsOfMonth = (logs: readonly WorkoutLog[], ref: MonthRef): WorkoutLog[] =>
  logs.filter((l) => {
    const [y, m] = l.date.split("-").map(Number);
    return y === ref.y && m - 1 === ref.m0;
  });

/** إجمالي الوزن المرفوع في شهر */
export const monthVolume = (monthLogs: readonly WorkoutLog[]): number =>
  monthLogs.reduce((s, l) => s + l.volume, 0);

/** فرق الحجم عن الشهر اللي فات — null لو مفيش أساس مقارنة (أول شهر) */
export const volumeDeltaPct = (logs: readonly WorkoutLog[], ref: MonthRef): number | null => {
  const prev = new Date(ref.y, ref.m0 - 1, 1);
  const prevLogs = logsOfMonth(logs, { y: prev.getFullYear(), m0: prev.getMonth() });
  const prevVolume = monthVolume(prevLogs);
  if (prevVolume <= 0) return null;
  return Math.round(((monthVolume(logsOfMonth(logs, ref)) - prevVolume) / prevVolume) * 100);
};

/** 5 أسبوعات داخل الشهر — بنفس تقسيم الكود القديم */
export const weekBuckets = (monthLogs: readonly WorkoutLog[]): number[] =>
  [0, 1, 2, 3, 4].map((w) =>
    monthLogs
      .filter((l) => Math.min(4, Math.floor((Number(l.date.slice(8, 10)) - 1) / 7)) === w)
      .reduce((s, l) => s + l.volume, 0),
  );

/** أطول سلسلة أيام متتالية فيها تمرين — بتبدأ من النهاردة أو بيرجع يوم لو النهاردة أسجلش بعد */
export const streak = (logs: readonly WorkoutLog[], todayIso: string = todayKey()): number => {
  const all = new Set(logs.map((l) => l.date));
  let count = 0;
  const d = new Date(todayIso + "T12:00:00");
  if (!all.has(todayIso)) d.setDate(d.getDate() - 1);
  while (all.has(todayKey(d))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
};

/** أقوى يوم (أعلى حجم) في الشهر */
export const bestLog = (monthLogs: readonly WorkoutLog[]): WorkoutLog | null =>
  monthLogs.reduce<WorkoutLog | null>((best, l) => (!best || l.volume > best.volume ? l : best), null);

/** أكتر تمرين اتكرر في الشهر */
export const favoriteExercise = (monthLogs: readonly WorkoutLog[]): string => {
  const counts: Record<string, number> = {};
  monthLogs.forEach((l) => l.exercises.forEach((e) => { counts[e.name] = (counts[e.name] || 0) + 1; }));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : "";
};

/** تواريخ تح فيها تمرين (وحدة الشهر) */
export const loggedDates = (monthLogs: readonly WorkoutLog[]): Set<string> =>
  new Set(monthLogs.map((l) => l.date));

/* ===== B4–B5, B7-B8: عناصر التقدم ===== */

export interface ExerciseSetPoint { date: string; weight: number; sets: number; reps: number }

/** B4: تاريخ تمرين معيّن — أحدث تمرين أولًا (max weight لكل جلسة) */
export const exerciseHistory = (logs: readonly WorkoutLog[], name: string): ExerciseSetPoint[] =>
  logs
    .filter((l) => l.exercises.some((e) => e.name === name))
    .map((l) => ({
      date: l.date,
      weight: Math.max(...l.exercises.filter((e) => e.name === name).map((e) => e.weight)),
      sets: Math.max(...l.exercises.filter((e) => e.name === name).map((e) => e.sets)),
      reps: Math.max(...l.exercises.filter((e) => e.name === name).map((e) => e.reps)),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

/** أسماء التمارين اللي في اللوجز (ترتيب أول ظهور) */
export const loggedExerciseNames = (logs: readonly WorkoutLog[]): string[] => {
  const seen: string[] = [];
  const set = new Set<string>();
  for (const l of logs) for (const e of l.exercises) {
    if (!set.has(e.name)) { set.add(e.name); seen.push(e.name); }
  }
  return seen;
};

/** B5: PR لكل تمرين — أقصى وزن بحد ذاته */
export const prMap = (logs: readonly WorkoutLog[]): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const l of logs) for (const e of l.exercises) {
    if (e.weight > (out[e.name] ?? -1)) out[e.name] = e.weight;
  }
  return out;
};

export interface WeekSummary { count: number; volume: number; prevCount: number; prevVolume: number }

/** B8: ملخص 7 أيام مقارنة بالـ 7 اللي قبلها */
export const weekSummary = (logs: readonly WorkoutLog[], todayIso: string = todayKey()): WeekSummary => {
  const within = (iso: string, from: number, to: number): boolean => {
    const t = new Date(todayIso + "T12:00:00").getTime();
    const v = new Date(iso + "T12:00:00").getTime();
    const age = t - v;
    return age >= from && age < to;
  };
  const DAY = 86400000;
  const current = logs.filter((l) => within(l.date, 0, 7 * DAY));
  const previous = logs.filter((l) => within(l.date, 7 * DAY, 14 * DAY));
  return {
    count: current.length,
    volume: current.reduce((s, l) => s + l.volume, 0),
    prevCount: previous.length,
    prevVolume: previous.reduce((s, l) => s + l.volume, 0),
  };
};
