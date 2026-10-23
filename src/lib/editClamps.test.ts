import { describe, expect, it } from "vitest";
import {
  clampF,
  clampN,
  REPS_RANGE,
  SETS_RANGE,
  WEIGHT_KG_SET,
  WEIGHT_LBS_SET,
} from "./validate";

/** محاكاة حفظ التعديل في HomeTab — نفس المعادلة المستخدمة في saveExerciseEdit */
const editedExercise = (editSets: unknown, editReps: unknown, editWeight: unknown, unit: "kg" | "lbs" = "kg") => {
  const sR = SETS_RANGE;
  const rR = REPS_RANGE;
  const wR = unit === "lbs" ? WEIGHT_LBS_SET : WEIGHT_KG_SET;
  return {
    sets: clampN(Number(editSets), sR[0], sR[1]),
    reps: clampN(Number(editReps), rR[0], rR[1]),
    weight: clampF(Number(editWeight), wR[0], wR[1]),
  };
};

describe("R2-1 clamps: alcance مجموعة/تكرار/وزن في مسار التحرير", () => {
  it("المجموعات 1–20", () => {
    expect(SETS_RANGE).toEqual([1, 20]);
    expect(editedExercise(0, 10, 0).sets).toBe(1);        // تحت → سقف السفلي
    expect(editedExercise(99, 10, 0).sets).toBe(20);      // فوق → سقف العلوي
    expect(editedExercise("خرابيط", 10, 0).sets).toBe(1); // NaN → أدنى حد
    expect(editedExercise(4, 10, 0).sets).toBe(4);        // جوه الحدود زي ما هي
  });

  it("التكرارات 1–200", () => {
    expect(REPS_RANGE).toEqual([1, 200]);
    expect(editedExercise(3, 0, 0).reps).toBe(1);
    expect(editedExercise(3, 500, 0).reps).toBe(200);
    expect(editedExercise(3, "", 0).reps).toBe(1);
  });

  it("الوزن ≥ 0 بالكيلوجرام والباوند", () => {
    expect(WEIGHT_KG_SET[0]).toBe(0);
    expect(editedExercise(3, 10, -50).weight).toBe(0);     // سالب → 0
    expect(editedExercise(3, 10, 9999).weight).toBe(500);  // ك كبير (kg سقف 500)
    expect(editedExercise(3, 10, 9999, "lbs").weight).toBe(1000); // lbs سقف 1000
    expect(editedExercise(3, 10, 62.5).weight).toBe(62.5); // بدون تقريب — خطوات 2.5 محفوظة
  });
});
