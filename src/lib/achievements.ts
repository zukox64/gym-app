/**
 * R2-5: الإنجازات — منطق نقي بالكامل، بيرجع unlocks بتواريخ محسوبة من اللوجز نفسها
 * (مش تواريخ التشغيل) عشان الاستيراد/النسخ الاحتياطي يفضل صادق.
 */

import type { UserProfile, WorkoutDay, WorkoutLog } from "../types";
import type { BodyWeightPoint } from "./migrations";
import { prMap } from "./stats";
import { logVolume } from "./charts";
import { streak } from "./stats";

export type Tier = "bronze" | "silver" | "gold";

export interface AchievementCtx {
  logs: readonly WorkoutLog[];
  plan: readonly WorkoutDay[];
  body: readonly BodyWeightPoint[];
  profile: UserProfile | null;
  todayIso: string;
  /** وحدة التركيبة الحالية — عشان thresholds كجم */
  unit: "kg" | "lbs";
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  tier: Tier;
  /** تحقق أساسي */
  test: (c: AchievementCtx) => boolean;
  /** تاريخ أول تحقق — من اللوجز لو ممكن */
  dateOf: (c: AchievementCtx) => string;
}

export interface AchievementView {
  ach: Achievement;
  unlocked: boolean;
  date: string | null;
}

/* ===== مساعدين ===== */

/** حجم ثوابت العتبات بالجم — لو الباوند نحول لحظة */
const kgVol = (v: number, unit: "kg" | "lbs"): number => (unit === "lbs" ? v * 2.20462 : v);

/** تاريخ اللوج اللي حقق الهدف n (session-count achievements) */
const dateAt = (c: AchievementCtx, n: number, cond?: (l: WorkoutLog) => boolean): string => {
  const ls = cond ? c.logs.filter(cond) : c.logs;
  return ls[Math.min(n, ls.length) - 1]?.date ?? c.todayIso;
};

/** أول تاريخ التراكمي وصل حجم معين (بجم) */
const dateVolumeAt = (c: AchievementCtx, targetKg: number): string => {
  const target = kgVol(targetKg, c.unit);
  let acc = 0;
  for (const l of c.logs) {
    acc += logVolume(l);
    if (acc >= target) return l.date;
  }
  return c.todayIso;
};

const need = (c: AchievementCtx): string => c.todayIso;

/* ===== القائمة (16) ===== */

export const ACHIEVEMENTS: Achievement[] = [
  // عدد التمارين
  { ...a("first-workout", "🏋", "أول تمرين", "سجّلت أول تمرين في حياتك هنا", "bronze", c => c.logs.length >= 1), dateOf: c => dateAt(c, 1) },
  { ...a("sessions-10", "💪", "10 تمرينات", "عشرة جلسات في السجل — البداية أصعب حاجة", "bronze", c => c.logs.length >= 10), dateOf: c => dateAt(c, 10) },
  { ...a("sessions-25", "🔥", "ربع سنة", "25 جلسة — معتاد على المدى الطويل", "silver", c => c.logs.length >= 25), dateOf: c => dateAt(c, 25) },
  { ...a("sessions-50", "⚡", "نص قرن", "50 جلسة — الكباد ما بيفسرش", "gold", c => c.logs.length >= 50), dateOf: c => dateAt(c, 50) },
  { ...a("sessions-100", "👑", "مئة جلسة", "100 جلسة — أسطورة الاستمرارية", "gold", c => c.logs.length >= 100), dateOf: c => dateAt(c, 100) },
  // ستريك
  { ...a("streak-3", "🙌", "أول 3", "تمرينات 3 أيام ورا بعض", "bronze", c => streak(c.logs, c.todayIso) >= 3), dateOf: need },
  { ...a("streak-7", "🔥", "أسبوع ورا بعض", "سبعة أيام ستريك — العادة اتولدت", "silver", c => streak(c.logs, c.todayIso) >= 7), dateOf: need },
  { ...a("streak-14", "💎", "أسبوعين كاملين", "ستريك 14 يوم", "silver", c => streak(c.logs, c.todayIso) >= 14), dateOf: need },
  { ...a("streak-30", "🏆", "شهر كامل", "ستريك 30 يوم — انسى التململ", "gold", c => streak(c.logs, c.todayIso) >= 30), dateOf: need },
  // حجم إجمالي
  { ...a("vol-10k", "🦾", "عشرة آلاف", "رفعت 10,000 كجم إجمالي", "bronze", c => totalVolKg(c) >= 10_000), dateOf: c => dateVolumeAt(c, 10_000) },
  { ...a("vol-50k", "🐘", "خمسين ألف", "50,000 كجم — شاحنة صغيرة من حديد", "silver", c => totalVolKg(c) >= 50_000), dateOf: c => dateVolumeAt(c, 50_000) },
  { ...a("vol-250k", "🎡", "ربع مليون", "250,000 كجم إجمالي — أرقام الملاعب", "gold", c => totalVolKg(c) >= 250_000), dateOf: c => dateVolumeAt(c, 250_000) },
  // PRs
  { ...a("prs-5", "📈", "خمسة أرقام", "5 تمارين ليه منحنى 1RM قاعد", "silver", c => Object.keys(prMap(c.logs)).length >= 5), dateOf: need },
  { ...a("prs-15", "🎯", "15 رقم قياسي", "كل حركة عندك بتحسن — overload شغال معاك", "gold", c => Object.keys(prMap(c.logs)).length >= 15), dateOf: need },
  // أنماط
  { ...a("body-log-1", "⚖", "على الميزان", "سجّلت وزن جسمك أول مرة", "bronze", c => c.body.length >= 1), dateOf: c => c.body[c.body.length - 1]?.d ?? c.todayIso },
  { ...a("month-8", "🧱", "شهر منظم", "8 جلسات في شهر واحد — التزام حقيقي", "gold", c => busiestMonthCount(c) >= 8), dateOf: need },
];

/** helper مشترك عشان التكرار: fields الأساسية */
function a(
  id: string, icon: string, title: string, desc: string, tier: Tier,
  test: (c: AchievementCtx) => boolean,
): Pick<Achievement, "id" | "icon" | "title" | "desc" | "tier" | "test"> {
  return { id, icon, title, desc, tier, test };
}

/** الحجم الإجمالي بالجم (مع تحويل الباوند) */
const totalVolKg = (c: AchievementCtx): number =>
  c.logs.reduce((s, l) => s + logVolume(l), 0) / kgVol(1, c.unit);

/** أكبر عدد جلسات في شهر ميلادي واحد */
const busiestMonthCount = (c: AchievementCtx): number => {
  const m = new Map<string, number>();
  for (const l of c.logs) {
    const k = l.date.slice(0, 7);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return Math.max(0, ...m.values());
};

/** تقييم كامل — ثابت الترتيب زي القائمة */
export const evaluateAchievements = (c: AchievementCtx): AchievementView[] =>
  ACHIEVEMENTS.map(ach => {
    let unlocked = false;
    let date: string | null = null;
    try {
      unlocked = ach.test(c);
      if (unlocked) date = ach.dateOf(c);
    } catch {
      unlocked = false;
    }
    return { ach, unlocked, date };
  });

/** عدد الأفكار للمظهر — مساعد للجزء العلوي */
export const achievementCount = (views: readonly AchievementView[]): number =>
  views.filter(v => v.unlocked).length;
