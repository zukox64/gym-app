import { describe, expect, it } from "vitest";
import { buildPlanFromTemplate, isCompound, maxExercisesPerDay } from "./templateBuilder";
import { PLAN_TEMPLATES } from "../data/templates";
import { muscleGroupOf } from "../data/muscles";

/* مكتبة مصغّرة للتست السريع — نفس شكل المكتبة الحقيقية (من غير معدات في A1) */
const LIB = [
  { name: "Barbell Bench Press", muscle: "Chest", sets: 4, reps: 8 },
  { name: "Incline Dumbbell Press", muscle: "Chest", sets: 3, reps: 10 },
  { name: "Cable Fly", muscle: "Chest", sets: 3, reps: 12 },
  { name: "Push-ups", muscle: "Chest", sets: 3, reps: 15 },
  { name: "Dumbbell Rows", muscle: "Back", sets: 4, reps: 10 },
  { name: "Lat Pulldown", muscle: "Back", sets: 3, reps: 12 },
  { name: "Pull-ups", muscle: "Back", sets: 3, reps: 8 },
  { name: "Barbell Curl", muscle: "Biceps", sets: 3, reps: 10 },
  { name: "Tricep Pushdown", muscle: "Triceps", sets: 3, reps: 12 },
  { name: "Barbell Squat", muscle: "Quads", sets: 4, reps: 8 },
  { name: "Leg Curl", muscle: "Hamstrings", sets: 3, reps: 12 },
  { name: "Calf Raise", muscle: "Calves", sets: 4, reps: 15 },
  { name: "Crunches", muscle: "Abs", sets: 3, reps: 20 },
] as const;

describe("isCompound", () => {
  it("يعرف المركبات الصريحة والعزل", () => {
    expect(isCompound("Barbell Bench Press")).toBe(true);
    expect(isCompound("Romanian Deadlift")).toBe(true);
    expect(isCompound("Cable Fly")).toBe(false);
    expect(isCompound("Tricep Pushdown")).toBe(false);
  });

  it("كلمات مفتاحية للحركات الجديدة", () => {
    expect(isCompound("Glute Bridge")).toBe(true);
    expect(isCompound("Pike Push-Ups")).toBe(true);
    expect(isCompound("Lateral Raise")).toBe(false);
  });
});

describe("buildPlanFromTemplate — كل التطبيلات", () => {
  for (const t of PLAN_TEMPLATES) {
    it(`${t.id}: كل يوم فيه تمارين وبدون تكرار`, () => {
      const built = buildPlanFromTemplate(t, LIB, ["Full Gym"], t.level);
      expect(built.length).toBe(t.daysPlan.length);
      for (const day of built) {
        expect(day.exercises.length).toBeGreaterThan(0);
        const names = day.exercises.map((e) => e.name);
        expect(new Set(names).size).toBe(names.length); // بدون تكرار
      }
    });
  }
});

describe("تغطية العضلات بالتطبيع الصريح", () => {
  it("يوم Chest & Back بيكسب الصدر والضهر معًا (مرر الباج القديم)", () => {
    const arnold = PLAN_TEMPLATES.find((t) => t.id === "arnold")!;
    const [chestBack] = buildPlanFromTemplate(arnold, LIB, ["Full Gym"], "Advanced");
    const groups = new Set(chestBack.exercises.map((e) => muscleGroupOf(e.muscle)));
    expect(groups.has("Chest")).toBe(true);
    expect(groups.has("Back")).toBe(true);
  });

  it("التوزيع round-robin بين عضلات يوم الليغز", () => {
    const ppl = PLAN_TEMPLATES.find((t) => t.id === "ppl")!;
    const [, , legs] = buildPlanFromTemplate(ppl, LIB, ["Full Gym"], "Intermediate");
    const groups = new Set(legs.exercises.map((e) => muscleGroupOf(e.muscle)));
    // Quads/Hamstrings/Calves مذكورة بالاسم — كلهم لازم يظهروا
    expect(groups.has("Quads")).toBe(true);
    expect(groups.has("Hamstrings")).toBe(true);
    expect(groups.has("Calves")).toBe(true);
  });
});

describe("cap حسب المستوى", () => {
  it("مبتدئ ٤ / متوسط ٥ / متقدم ٦", () => {
    expect(maxExercisesPerDay("Beginner")).toBe(4);
    expect(maxExercisesPerDay("Intermediate")).toBe(5);
    expect(maxExercisesPerDay("Advanced")).toBe(6);
  });

  it("نفس اليوم ما يتعداش الـ cap", () => {
    const arnold = PLAN_TEMPLATES.find((t) => t.id === "arnold")!;
    for (const level of ["Beginner", "Intermediate", "Advanced"]) {
      const cap = maxExercisesPerDay(level);
      for (const day of buildPlanFromTemplate(arnold, LIB, [], level)) {
        expect(day.exercises.length).toBeLessThanOrEqual(cap);
      }
    }
  });
});

describe("compound قبل isolation", () => {
  it("أول تمرين في مجموعة صدر اللي هو المركب", () => {
    const bro = PLAN_TEMPLATES.find((t) => t.id === "bro")!;
    const [chest] = buildPlanFromTemplate(bro, LIB, [], "Advanced");
    const g = muscleGroupOf(chest.exercises[0].muscle);
    expect(g).toBe("Chest");
    expect(isCompound(chest.exercises[0].name)).toBe(true);
  });
});

describe("معرّفات فريدة", () => {
  it("كل استدعاء بيطلع أيديات مختلفة", () => {
    const t = PLAN_TEMPLATES[0];
    const a = buildPlanFromTemplate(t, LIB, [], "Intermediate");
    const b = buildPlanFromTemplate(t, LIB, [], "Intermediate");
    const idsA = a.flatMap((d) => d.exercises.map((e) => e.id));
    const idsB = b.flatMap((d) => d.exercises.map((e) => e.id));
    expect(new Set(idsA).size).toBe(idsA.length);
    expect(new Set([...idsA, ...idsB]).size).toBe(idsA.length + idsB.length);
  });
});
