/**
 * فاليديشن المجموعات المحفوظة + ملفات التصدير/الاستيراد (A4). مفيش داتا بيتم رميها — أي شكل
 * غير صالح بيتفلتر بحرص بدل ما نضيع اللي أحفظه المستخدم.
 */

import type { LoggedExercise, UserProfile, WorkoutDay, WorkoutLog } from "../types";

/* ===== Golden keys — القايمات الأساسية (للتصدير) ===== */
export const DATA_VERSION = 1;

export interface DataBundle {
  version: number;
  exportedAt: string;
  profile: UserProfile | null;
  plan: WorkoutDay[] | null;
  logs: WorkoutLog[] | null;
  /** B6: وزن الجسم (اختياري — النسخ القديمة من غيره مستوردة زي ما هي) */
  body?: BodyWeightPoint[] | null;
}

/* ===== الفاليدين ====================== */

const isFiniteNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export const sanitizeProfile = (v: unknown): UserProfile | null => {
  if (!v || typeof v !== "object") return null;
  const p = v as Partial<UserProfile>;
  if (typeof p.name !== "string") return null;
  if (
    !isFiniteNum(p.age) || !isFiniteNum(p.weight) || !isFiniteNum(p.height) || !isFiniteNum(p.targetWeight) ||
    !isFiniteNum(p.daysPerWeek)
  ) return null;
  if ((p.weightUnit !== "kg" && p.weightUnit !== "lbs") || (p.heightUnit !== "cm" && p.heightUnit !== "ft")) return null;
  if (!Array.isArray(p.equipment)) return null;
  return {
    name: p.name,
    age: p.age,
    weight: p.weight,
    weightUnit: p.weightUnit,
    height: p.height,
    heightUnit: p.heightUnit,
    goal: typeof p.goal === "string" ? p.goal : "",
    targetWeight: p.targetWeight,
    level: typeof p.level === "string" ? p.level : "",
    daysPerWeek: p.daysPerWeek,
    equipment: p.equipment.map(String),
    // B1: نحفظ الاستراحة الدهب لو صالحة (30–600) — وإلا نسيبها تحت وتفضل الـ default
    ...(isFiniteNum(p.restSeconds) && p.restSeconds >= 30 && p.restSeconds <= 600
      ? { restSeconds: p.restSeconds }
      : {}),
  };
};

const isValidExercise = (v: unknown): boolean => {
  const e = v as Partial<WorkoutDay["exercises"][number]>;
  return !!e && typeof e.name === "string" && isFiniteNum(e.sets) && isFiniteNum(e.reps);
};

export const sanitizePlan = (v: unknown): WorkoutDay[] | null => {
  if (!Array.isArray(v)) return null;
  const days = v.filter((d) => {
    const day = d as Partial<WorkoutDay>;
    return !!day && typeof day.label === "string" && Array.isArray(day.exercises) && day.exercises.every(isValidExercise);
  }) as WorkoutDay[];
  return days;
};

export const sanitizeLogs = (v: unknown): WorkoutLog[] => {
  if (!Array.isArray(v)) return [];
  return v.filter((l) => {
    const log = l as Partial<WorkoutLog>;
    if (!log || typeof log.id !== "string" || typeof log.date !== "string" || !Array.isArray(log.exercises)) return false;
    return log.exercises.every((e) => {
      const ex = e as Partial<LoggedExercise>;
      return !!ex && typeof ex.name === "string" && isFiniteNum(ex.sets) && isFiniteNum(ex.reps) && isFiniteNum(ex.weight);
    });
  }) as WorkoutLog[];
};

/* ===== التصدير/الاستيراد ================= */

/** نقطة وزن جسم (B6) */
export interface BodyWeightPoint { d: string; v: number }

const isIsoDate = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

export const sanitizeBodyLog = (v: unknown): BodyWeightPoint[] => {
  if (!Array.isArray(v)) return [];
  const out: BodyWeightPoint[] = [];
  for (const item of v) {
    const p = item as Partial<BodyWeightPoint>;
    if (isIsoDate(p.d) && isFiniteNum(p.v) && p.v > 0) out.push({ d: p.d, v: p.v });
  }
  return out;
};

export const makeBundle = (args: {
  profile: UserProfile | null;
  plan: WorkoutDay[] | null;
  logs: WorkoutLog[];
  body?: BodyWeightPoint[] | null;
}): DataBundle => ({
  version: DATA_VERSION,
  exportedAt: new Date().toISOString(),
  profile: args.profile,
  plan: args.plan,
  logs: args.logs,
  ...(Array.isArray(args.body) ? { body: args.body } : {}),
});

/** بيقرأ JSON مجمّع مستورد (نص أو object مباشر) وبيصلح كل جزء — بيرجع null لو مفيش حاجة مفهومة فيه */
export const parseBundle = (json: string | unknown): DataBundle | null => {
  let raw: unknown = json;
  if (typeof json === "string") {
    try { raw = JSON.parse(json); } catch { return null; }
  }
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Partial<DataBundle>;
  const profile = b.profile === null || b.profile === undefined ? null : sanitizeProfile(b.profile);
  const plan = planOrNull(b.plan);
  const logs = b.logs === null || b.logs === undefined ? null : sanitizeLogs(b.logs);
  const body = b.body === null || b.body === undefined ? null : sanitizeBodyLog(b.body);
  if (!profile && !plan && !logs && (!body || body.length === 0)) return null;
  return { version: 1, exportedAt: typeof b.exportedAt === "string" ? b.exportedAt : "", profile, plan, logs, ...(body && body.length ? { body } : {}) };

  function planOrNull(v: unknown): WorkoutDay[] | null {
    if (v === null || v === undefined) return null;
    return sanitizePlan(v);
  }
};
