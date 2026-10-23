import { describe, expect, it } from "vitest";
import { evaluateAchievements } from "./achievements";
import type { AchievementCtx } from "./achievements";
import type { WorkoutLog } from "../types";

/** لوج صغير بالحجم المطلوب */
const mkLog = (id: string, date: string, vol = 1000): WorkoutLog => {
  // عدة واحدة 20×25 = 500 × 2 تمارين = 1000
  return {
    id, date, dayId: "d1", dayLabel: "يوم",
    exercises: [
      { name: "Bench Press", muscle: "Chest", sets: 2, reps: 25, weight: 20 },
      { name: "Row", muscle: "Back", sets: 2, reps: 25, weight: 20 },
    ],
    volume: vol, duration: 1800, rest: 300,
  };
};

const ctx = (over: Partial<AchievementCtx> = {}): AchievementCtx => ({
  logs: [],
  plan: [{ id: "d1", label: "دفع", exercises: [] }],
  body: [],
  profile: null,
  todayIso: "2026-10-23",
  unit: "kg",
  ...over,
});

describe("R2-5 achievements — نقي من اللوجز", () => {
  it("من غير لوجز — مفيش unlocks غير ميزان/خطة", () => {
    const v = evaluateAchievements(ctx());
    const unlockedIds = v.filter(x => x.unlocked).map(x => x.ach.id);
    // 16 إنجاز، مفيش واحد محقّق بلا داتا
    expect(v).toHaveLength(16);
    expect(unlockedIds).toEqual([]);
  });

  it("أول تمرين بتاريخ اللوج نفسه — مش ليوم التشغيل", () => {
    const v = evaluateAchievements(ctx({ logs: [mkLog("l1", "2026-01-05")] }));
    const first = v.find(x => x.ach.id === "first-workout")!;
    expect(first.unlocked).toBe(true);
    expect(first.date).toBe("2026-01-05");
  });

  it("10 تمرينات — بتاريخ اللوج العاشر", () => {
    const logs = Array.from({ length: 10 }, (_, i) => mkLog(`l${i}`, `2026-01-${String(i + 1).padStart(2, "0")}`));
    const v = evaluateAchievements(ctx({ logs }));
    expect(v.find(x => x.ach.id === "sessions-10")!.date).toBe("2026-01-10");
    expect(v.find(x => x.ach.id === "sessions-25")!.unlocked).toBe(false);
  });

  it("حجم إجمالي: 50 لوجز × 1000 = 50k — يفتح عتبة الـ50k", () => {
    const logs = Array.from({ length: 50 }, (_, i) => mkLog(`l${i}`, `2026-0${(i % 9) + 1}-15`));
    const v = evaluateAchievements(ctx({ logs }));
    const vol50 = v.find(x => x.ach.id === "vol-50k")!;
    expect(vol50.unlocked).toBe(true);
    // آخر لوج تجاوز الهدف (تقريبًا الأخير) — تاريخ ضمن اللوجز
    expect(vol50.date).toMatch(/2026-/);
    expect(v.find(x => x.ach.id === "vol-250k")!.unlocked).toBe(false);
  });

  it("بالباوند العتبتين بتتظبط 2.2× — 10k كجم يعادل ~22046 lbs", () => {
    const logs = Array.from({ length: 23 }, () => mkLog("l", "2026-03-10")); // 23000 lbs = ~10433 kg
    const v = evaluateAchievements(ctx({ logs, unit: "lbs" }));
    expect(v.find(x => x.ach.id === "vol-10k")!.unlocked).toBe(true);
  });

  it("ستريك من streak الموجود في stats", () => {
    const logs = ["2026-10-21", "2026-10-22", "2026-10-23"].map(d => mkLog("l", d));
    const v = evaluateAchievements(ctx({ logs }));
    expect(v.find(x => x.ach.id === "streak-3")!.unlocked).toBe(true);
    expect(v.find(x => x.ach.id === "streak-7")!.unlocked).toBe(false);
  });

  it("ميزان + شهر منظم", () => {
    const c = ctx({
      logs: Array.from({ length: 8 }, (_, i) => mkLog(`l${i}`, `2026-09-${String(i + 1).padStart(2, "0")}`)),
      body: [{ d: "2026-09-05", v: 78 }, { d: "2026-10-01", v: 77.4 }],
    });
    const v = evaluateAchievements(c);
    expect(v.find(x => x.ach.id === "body-log-1")!.unlocked).toBe(true);
    expect(v.find(x => x.ach.id === "month-8")!.unlocked).toBe(true);
  });

  it("أسلوب tiers متنوع + كل إنجاز له تاريخ لو مفتوح", () => {
    const logs = Array.from({ length: 60 }, () => mkLog("l", "2026-05-10"));
    const v = evaluateAchievements(ctx({ logs }));
    for (const x of v) {
      if (x.unlocked) expect(x.date).toBeTruthy();
    }
    const gold = v.filter(x => x.ach.tier === "gold");
    expect(gold.length).toBeGreaterThanOrEqual(3);
  });
});
