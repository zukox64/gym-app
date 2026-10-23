import { describe, expect, it } from "vitest";
import {
  epley1RM,
  overloadSessionsFromLogs,
  suggestOverload,
} from "./overload";
import {
  beatsAnyPr,
  exerciseRest,
  isCompound,
  platesFor,
  prTripleMap,
  warmupRamp,
} from "./training";
import { convertBodyUnit, convertLogsUnit, convertPlanUnit } from "./unitMigration";
import type { WorkoutLog } from "../types";

const mkLog = (id: string, date: string, ex: { name: string; sets: number; reps: number; weight: number }): WorkoutLog => ({
  id, date, dayId: "d1", dayLabel: "Day 1",
  exercises: [{ ...ex, muscle: "Chest" }],
  volume: ex.sets * ex.reps * ex.weight,
});

describe("R2-4 overload", () => {
  it("بيصفر الجلسة القديمة (w بقيمة واحدة) لعدد عدّات بنفس w/r", () => {
    const logs = [
      mkLog("1", "2026-10-22", { name: "Bench", sets: 3, reps: 8, weight: 70 }),
      mkLog("2", "2026-10-20", { name: "Bench", sets: 3, reps: 8, weight: 70 }),
    ];
    const s = overloadSessionsFromLogs(logs, "Bench");
    expect(s).toHaveLength(2);
    expect(s[0]!.sets).toHaveLength(3);
    expect(s[0]!.sets[0]).toEqual({ w: 70, r: 8 });
  });

  it("لما اتجلس كل عدّات بلغت الهدف بنفس الوزن — بيقترح +2.5", () => {
    const logs = [
      mkLog("1", "2026-10-22", { name: "Bench", sets: 3, reps: 8, weight: 70 }),
      mkLog("2", "2026-10-20", { name: "Bench", sets: 3, reps: 8, weight: 70 }),
    ];
    const sug = suggestOverload(overloadSessionsFromLogs(logs, "Bench"), 8, "kg");
    expect(sug).not.toBeNull();
    expect(sug!.nextWeight).toBe(72.5);
    expect(sug!.increment).toBe(2.5);
  });

  it("لسه مفيش جلستين → مفيش اقتراح", () => {
    const logs = [mkLog("1", "2026-10-22", { name: "Bench", sets: 3, reps: 8, weight: 70 })];
    expect(suggestOverload(overloadSessionsFromLogs(logs, "Bench"), 8)).toBeNull();
  });

  it("لو العدد ما وصلتش الهدف — مفيش اقتراح", () => {
    const logs = [
      mkLog("1", "2026-10-22", { name: "Bench", sets: 3, reps: 6, weight: 70 }),
      mkLog("2", "2026-10-20", { name: "Bench", sets: 3, reps: 6, weight: 70 }),
    ];
    expect(suggestOverload(overloadSessionsFromLogs(logs, "Bench"), 8)).toBeNull();
  });

  it("الوزن مختلف بين جلسة — مفيش اقتراح", () => {
    const logs = [
      mkLog("1", "2026-10-22", { name: "Bench", sets: 3, reps: 8, weight: 72.5 }),
      mkLog("2", "2026-10-20", { name: "Bench", sets: 3, reps: 8, weight: 70 }),
    ];
    expect(suggestOverload(overloadSessionsFromLogs(logs, "Bench"), 8)).toBeNull();
  });

  it("بالباوند الزيادة 5", () => {
    const logs = [
      mkLog("1", "2026-10-22", { name: "Bench", sets: 2, reps: 8, weight: 155 }),
      mkLog("2", "2026-10-20", { name: "Bench", sets: 2, reps: 8, weight: 155 }),
    ];
    const sug = suggestOverload(overloadSessionsFromLogs(logs, "Bench"), 8, "lbs");
    expect(sug!.nextWeight).toBe(160);
  });

  it("Epley 1RM", () => {
    expect(epley1RM(100, 1)).toBe(100);
    expect(Math.round(epley1RM(100, 10))).toBe(133);
  });
});

describe("R2-4 PRs تفصيلية", () => {
  it("بيقصّو الأبعاد الثلاثة صح", () => {
    const logs = [
      mkLog("1", "2026-10-22", { name: "Bench", sets: 4, reps: 8, weight: 70 }),
      mkLog("2", "2026-10-15", { name: "Bench", sets: 3, reps: 3, weight: 90 }),
    ];
    const pr = prTripleMap(logs)["Bench"]!;
    expect(pr.heaviest).toBe(90);
    expect(pr.est1RM).toBeCloseTo(99, 0);
    // أفضل حجم: 4×8×70 = 2240
    expect(pr.bestVolume).toBe(2240);
  });

  it("عدّة أكبر من أقصى وزن مسجل — bate أي PR", () => {
    const logs = [mkLog("1", "2026-10-22", { name: "Bench", sets: 3, reps: 8, weight: 70 })];
    const prs = prTripleMap(logs);
    expect(beatsAnyPr("Bench", 72.5, 8, prs)).toBe(true);
    expect(beatsAnyPr("Bench", 70, 8, prs)).toBe(false);
    expect(beatsAnyPr("Squat", 100, 5, prs)).toBe(false); // مش موجود أصلاً
  });
});

describe("R2-4 rest للمركبات", () => {
  it("bench/squat/deadlift/row مركبة", () => {
    expect(isCompound("Barbell Bench Press")).toBe(true);
    expect(isCompound("Back Squat")).toBe(true);
    expect(isCompound("Deadlift")).toBe(true);
    expect(isCompound("Barbell Row")).toBe(true);
  });

  it("Lateral Raise مش مركبة", () => {
    expect(isCompound("Lateral Raise")).toBe(false);
    expect(isCompound("Cable Crossover")).toBe(false);
  });

  it("استراحة التمرين: مركب 150ث، وإلا الافتراضي", () => {
    expect(exerciseRest("Barbell Bench Press", 90)).toBe(150);
    expect(exerciseRest("Lateral Raise", 90)).toBe(90);
  });
});

describe("R2-4 حاسبة الأطباق والإحماء", () => {
  it("100 kg = 40 لكل جانب — greedy: 25 ثم 15", () => {
    const p = platesFor(100, "kg", 20);
    expect(p.perSide).toEqual([25, 15]);
    expect(p.residual).toBe(0);
  });

  it("بالباوند — 225 lbs على بار 45", () => {
    const p = platesFor(225, "lbs", 45);
    expect(p.perSide).toEqual([45, 45]);
  });

  it("وزن مش قابل للتطبيق — بيسيب residual", () => {
    const p = platesFor(100, "kg", 20.5);
    expect(p.residual).toBeGreaterThan(0);
  });

  it("سلم الإحماء 40/60/80", () => {
    const r = warmupRamp(100);
    expect(r.map((x) => x.w)).toEqual([40, 60, 80]);
    expect(r.map((x) => x.reps)).toEqual([5, 3, 1]);
  });
});

describe("R2-4 migration الوحدات", () => {
  const logs: WorkoutLog[] = [
    mkLog("1", "2026-10-22", { name: "Bench", sets: 4, reps: 8, weight: 70 }),
  ];

  it("kg → lbs: اللوجز بتتقلب والحجوم كمان", () => {
    const out = convertLogsUnit(logs, "kg", "lbs");
    expect(out[0]!.exercises[0]!.weight).toBe(155); // 70 kg → snap 5 lbs
    expect(out[0]!.volume).toBeGreaterThan(0);
  });

  it("round trip kg→lbs→kg بيرجع نفس الوزن تقريبًا", () => {
    const mid = convertLogsUnit(logs, "kg", "lbs");
    const back = convertLogsUnit(mid, "lbs", "kg");
    expect(back[0]!.exercises[0]!.weight).toBeCloseTo(70, 0);
  });

  it("وزن الجسم بيتحول", () => {
    const out = convertBodyUnit([{ d: "2026-10-23", v: 78.4 }], "kg", "lbs");
    expect(out[0]!.v).toBeGreaterThan(160); // 78.4 kg ≈ 170 lbs
  });

  it("الخطة بيتحول أوزانها", () => {
    const plan = [{ id: "d1", label: "Day 1", exercises: [{ id: "ex1", name: "Bench", muscle: "Chest", sets: 3, reps: 8, weight: 70 }] }];
    const out = convertPlanUnit(plan, "kg", "lbs");
    expect(out[0]!.exercises[0]!.weight).toBe(155);
  });
});
