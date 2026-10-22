import { describe, expect, it } from "vitest";
import {
  clampedProfile,
} from "./validate";
import {
  makeBundle,
  parseBundle,
  sanitizeBodyLog,
  sanitizeProfile,
  type BodyWeightPoint,
} from "./migrations";

const OK_PROFILE = {
  name: "زوكي",
  age: 25,
  weight: 70,
  weightUnit: "kg" as const,
  height: 175,
  heightUnit: "cm" as const,
  targetWeight: 75,
  goal: "تضخيم",
  level: "مبتدئ",
  daysPerWeek: 3,
  equipment: ["Full Gym"],
};

describe("clampedProfile (A7)", () => {
  it("بيقص القيم بره الحدود لحدودها", () => {
    const out = clampedProfile({ age: 200, weight: 900, weightUnit: "kg", height: 300, heightUnit: "cm", targetWeight: 0 });
    expect(out.age).toBeLessThanOrEqual(90);
    expect(out.weight).toBeLessThanOrEqual(400);
    expect(out.targetWeight).toBeGreaterThanOrEqual(20);
  });
  it("بوحدات lbs بيقص بنفس التحويل", () => {
    const out = clampedProfile({ age: 25, weight: 8000, weightUnit: "lbs", height: 175, heightUnit: "cm", targetWeight: -5 });
    expect(out.weight).toBeLessThanOrEqual(1000);
    expect(out.targetWeight).toBeGreaterThanOrEqual(44);
  });
});

describe("sanitizeProfile (B1)", () => {
  it("بيحفظ restSeconds الصالحة وبيشيل الغلط منها", () => {
    const good = sanitizeProfile({ ...OK_PROFILE, restSeconds: 105 });
    const low = sanitizeProfile({ ...OK_PROFILE, restSeconds: 5 });
    const junk = sanitizeProfile({ ...OK_PROFILE, restSeconds: "a" });
    expect(good?.restSeconds).toBe(105);
    expect(low?.restSeconds).toBeUndefined();
    expect(junk?.restSeconds).toBeUndefined();
  });
});

describe("sanitizeBodyLog (B6)", () => {
  it("بيقبل تواريخ ISO وأوزان موجبة بس", () => {
    const out = sanitizeBodyLog([
      { d: "2026-10-23", v: 78.4 },
      { d: "غدًا", v: 80 },
      { d: "2026-10-24", v: -3 },
      { d: "2026-10-25" },
      "خرابيط",
      { d: "2026-10-26", v: 79.1 },
    ]);
    expect(out).toEqual([
      { d: "2026-10-23", v: 78.4 },
      { d: "2026-10-26", v: 79.1 },
    ]);
  });
});

describe("makeBundle/parseBundle", () => {
  it("bundle بدونه body (نسخ قديمة) بينستورد زي ما هو", () => {
    const b = makeBundle({ profile: OK_PROFILE, plan: null, logs: [] });
    // محاكاة نسخة قديمة من غير حقل body
    const legacy = JSON.parse(JSON.stringify(b));
    delete legacy.body;
    const parsed = parseBundle(legacy);
    expect(parsed?.profile?.name).toBe("زوكي");
    expect(parsed?.body).toBeUndefined();
  });

  it("bundle فيه body بينستورد وبيتعقّم", () => {
    const body: BodyWeightPoint[] = [{ d: "2026-10-23", v: 78.4 }, { d: "bad", v: 99 }];
    const b = makeBundle({ profile: OK_PROFILE, plan: null, logs: [], body });
    const parsed = parseBundle(JSON.parse(JSON.stringify(b)));
    expect(parsed?.body).toEqual([{ d: "2026-10-23", v: 78.4 }]);
  });

  it("نفس كل حاجة غلط → null (رفض النسخة)", () => {
    expect(parseBundle({ version: 1, exportedAt: "", profile: null, plan: null, logs: null })).toBeNull();
    expect(parseBundle("مش JSON أصلاً")).toBeNull();
    expect(parseBundle(null)).toBeNull();
  });
});
