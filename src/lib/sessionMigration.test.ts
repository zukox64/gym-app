import { describe, expect, it } from "vitest";
import { normalizeSession } from "./sessionUtils";
import type { SessionState } from "../types";

/** سيشن محفوظة بنسخة قبل R2-4 — عناصرها بدون setsDone/restSec/note */
const oldSession = (over: Partial<SessionState> = {}): SessionState => ({
  dayId: "d1",
  label: "دفع",
  startedAt: Date.now() - 60000,
  restSec: 30,
  items: [
    { id: "e1", name: "Barbell Bench Press", muscle: "Chest", sets: 4, reps: 8, weight: 60, doneSets: 2 },
    { id: "e2", name: "Lateral Raise", muscle: "Shoulders", sets: 3, reps: 12, weight: 8, doneSets: 0 },
  ] as unknown as SessionState["items"],
  currentIdx: 0,
  restEndsAt: null,
  restStartedAt: null,
  ...over,
});

describe("R2-4 session migration (normalizeSession)", () => {
  it("بتملّئ setsDone الفاضي والـ doneSets الافتراضي — الداتا القديمة ما بتضيعش", () => {
    const n = normalizeSession(oldSession());
    expect(n.items[0]!.setsDone).toEqual([]);
    expect(n.items[0]!.doneSets).toBe(2);
    expect(n.items[1]!.setsDone).toEqual([]);
  });

  it("استراحة المركب بتتستنى 150ث من غير saved restSec", () => {
    const n = normalizeSession(oldSession());
    expect(n.items[0]!.restSec).toBe(150);       // bench
    expect(n.items[1]!.restSec).toBe(90);         // عزل → الافتراضي
  });

  it("restSec المحفوظة أصلاً بتفضل زي ما هي", () => {
    const s = oldSession();
    s.items[0]!.restSec = 120;
    const n = normalizeSession(s);
    expect(n.items[0]!.restSec).toBe(120);
  });

  it("لو فيه setsDone محفوظة — بتتكلم هي (مش بتتصفر)", () => {
    const s = oldSession();
    s.items[0]!.setsDone = [{ w: 60, r: 8 }, { w: 60, r: 8 }];
    const n = normalizeSession(s);
    expect(n.items[0]!.setsDone).toHaveLength(2);
  });
});
