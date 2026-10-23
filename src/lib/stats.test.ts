import { describe, expect, it } from "vitest";
import {
  exerciseHistory,
  loggedExerciseNames,
  prMap,
  weekSummary,
} from "./stats";
import type { WorkoutLog } from "../types";

const mk = (id: string, date: string, exercises: Array<[string, number, number, number]>): WorkoutLog => ({
  id,
  date,
  dayId: "d",
  dayLabel: "Day 1",
  exercises: exercises.map(([name, sets, reps, weight]) => ({ name, muscle: "Chest", sets, reps, weight })),
  volume: 0,
});

const LOGS: WorkoutLog[] = [
  mk("1", "2026-10-20", [["Bench", 3, 8, 80]]),
  mk("2", "2026-10-21", [["Bench", 4, 8, 85], ["Row", 3, 10, 60]]),
  mk("3", "2026-10-14", [["Bench", 3, 8, 70]]),
  mk("4", "2026-10-01", [["Row", 3, 10, 55]]),
];

describe("exerciseHistory (B4)", () => {
  it("بيجيب آخر جلسات التمرين بأحدث تاريخ أولًا", () => {
    const h = exerciseHistory(LOGS, "Bench");
    expect(h.map(p => p.date)).toEqual(["2026-10-21", "2026-10-20", "2026-10-14"]);
    expect(h[0].weight).toBe(85);
  });
  it("تاريخ غير موجود = فاضي", () => {
    expect(exerciseHistory(LOGS, "Squat")).toEqual([]);
  });
});

describe("loggedExerciseNames", () => {
  it("ترتيب أول ظهور بدون تكرار", () => {
    expect(loggedExerciseNames(LOGS)).toEqual(["Bench", "Row"]);
  });
});

describe("prMap (B5)", () => {
  it("أقصى وزن لكل تمرين", () => {
    expect(prMap(LOGS)).toEqual({ Bench: 85, Row: 60 });
  });
});

describe("weekSummary (B8)", () => {
  it("بيقسم آخر 7 أيام عن اللي قبلهم", () => {
    const s = weekSummary(LOGS, "2026-10-23");
    expect(s.count).toBe(2);           // 10-20، 10-21
    expect(s.prevCount).toBe(1);       // 10-14
  });
});
