import { describe, expect, it } from "vitest";
import {
  areaPath,
  est1rmSeries,
  exerciseVolume,
  linePath,
  logVolume,
  monthVolumeSeries,
  muscleVolumeMap,
} from "./charts";
import type { WorkoutLog } from "../types";

const mkLog = (date: string, exs: WorkoutLog["exercises"]): WorkoutLog => ({
  id: `l-${date}-${exs.length}`,
  date, dayId: "d1", dayLabel: "يوم", exercises: exs,
  volume: 0, duration: 1800, rest: 300,
});

describe("R2-5 charts — رياضيات الرسم نقية", () => {
  it("exerciseVolume بيقرأ setsDone لو موجودة وإلا يعمل التقدير", () => {
    expect(exerciseVolume({ name: "X", muscle: "Chest", sets: 3, reps: 10, weight: 50, setsDone: [{ w: 60, r: 8 }, { w: 60, r: 8 }] })).toBe(960);
    expect(exerciseVolume({ name: "X", muscle: "Chest", sets: 3, reps: 10, weight: 50 })).toBe(1500);
  });

  it("logVolume يجمع setDone عبر التمارين", () => {
    const l = mkLog("2026-10-01", [
      { name: "A", muscle: "Chest", sets: 1, reps: 1, weight: 10, setsDone: [{ w: 10, r: 10 }] },
      { name: "B", muscle: "Back", sets: 2, reps: 10, weight: 20 },
    ]);
    expect(logVolume(l)).toBe(100 + 400);
  });

  it("muscleVolumeMap بيجمع بالعضلات", () => {
    const m = muscleVolumeMap([
      mkLog("2026-10-01", [{ name: "A", muscle: "Chest", sets: 1, reps: 10, weight: 20 }]),
      mkLog("2026-10-02", [{ name: "B", muscle: "Chest", sets: 1, reps: 10, weight: 30 }]),
      mkLog("2026-10-03", [{ name: "C", muscle: "Back", sets: 1, reps: 5, weight: 40 }]),
    ]);
    expect(m["Chest"]).toBe(200 + 300);
    expect(m["Back"]).toBe(200);
  });

  it("est1rmSeries بيقارن أفضل عدة (Epley) لكل تمرين", () => {
    const s = est1rmSeries([
      mkLog("2026-10-01", [{ name: "Bench", muscle: "Chest", sets: 1, reps: 1, weight: 10, setsDone: [{ w: 100, r: 5 }, { w: 90, r: 3 }] }]),
      mkLog("2026-10-08", [{ name: "Bench", muscle: "Chest", sets: 1, reps: 1, weight: 10, setsDone: [{ w: 110, r: 5 }] }]),
    ], "Bench");
    expect(s).toHaveLength(2);
    // 100×5 → 100×(1+5/30) ≈ 116.67 ; 90×3 → 99
    expect(s[0]!.v).toBeCloseTo(116.67, 0);
    expect(s[1]!.v).toBeCloseTo(128.33, 0);
  });

  it("monthVolumeSeries بيبني 6 شهور قديمة→جديدة حتى الفاضي", () => {
    const s = monthVolumeSeries([
      mkLog("2026-08-01", [{ name: "A", muscle: "Chest", sets: 1, reps: 10, weight: 100 }]),
      mkLog("2026-10-05", [{ name: "A", muscle: "Chest", sets: 1, reps: 10, weight: 200 }]),
    ], 6, new Date(2026, 9, 23));
    expect(s).toHaveLength(6);
    expect(s[5]!.v).toBe(2000);            // أكتوبر (الشهر الحالي هو الأخير)
    expect(s[3]!.v).toBe(1000);            // أغسطس
    expect(s[0]!.v).toBe(0);               // مايو فاضي
  });

  it("linePath/areaPath شكلها سليم (M أول + L) والمساحة بتتقفل", () => {
    const pts = [{ date: "a", v: 10 }, { date: "b", v: 20 }];
    const line = linePath(pts, 300, 120);
    expect(line.startsWith("M")).toBe(true);
    expect(line).toContain("L");
    const area = areaPath(pts, 300, 120);
    expect(area.endsWith("Z")).toBe(true);
    // نقطة واحدة ⇒ خط أفقي في المنتصف
    expect(linePath([{ date: "a", v: 5 }], 300, 120)).toContain("150.0");
    expect(linePath([], 300, 120)).toBe("");
  });
});
