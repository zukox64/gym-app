import { useEffect, useState } from "react";
import { DEFAULT_REST_SECONDS, STORAGE_KEYS } from "../config";
import { closeRest as closeRestPure, restoreSession } from "../lib/sessionUtils";
import { exerciseRest } from "../lib/training";
import { clampF, WEIGHT_LBS_SET } from "../lib/validate";
import type { SessionState, WorkoutDay } from "../types";

export interface WorkoutSessionApi {
  session: SessionState | null;
  /** timestamp آخر tick — للعدادات على الشاشة */
  nowTime: number;
  liveRestLeft: number;
  start: (day: WorkoutDay) => void;
  markSet: () => void;
  /** R2-4: تسجيل عدة محددة (وزن × تكرار) للتمرين الحالي */
  logSet: (w: number, r: number) => void;
  /** R2-4: تراجع آخر عدة مسجّلة للتمرين الحالي */
  undoSet: () => void;
  next: () => void;
  prev: () => void;
  jump: (idx: number) => void;
  skipRest: () => void;
  /** R2-4: مطاط الاستراحة النشطة ±ثواني */
  extendRest: (deltaSec: number) => void;
  quit: () => void;
  /** تغيير وزن التمرين الحالي ±(delta) — بيتستخدم من شاشة السيشن */
  nudgeWeight: (delta: number) => void;
}

/**
 * السيشن الحية — حالة + عداد بالطوابع الزمنية + حفظ/استعادة (A3/A4).
 */
export function useWorkoutSession(restSeconds: number = DEFAULT_REST_SECONDS): WorkoutSessionApi {
  const [session, setSession] = useState<SessionState | null>(() => restoreSession());
  const [nowTime, setNowTime] = useState(() => Date.now());

  const sessionActive = session !== null;

  // ذاكرة للعدادات + ترانزشن نهاية الراحة (بدل decrement كل ثانية)
  useEffect(() => {
    if (!sessionActive) return;
    const id = window.setInterval(() => {
      const now = Date.now();
      setNowTime(now);
      setSession(s => {
        if (!s || !s.restEndsAt || s.restEndsAt > now) return s;
        return closeRestPure(s, now);
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [sessionActive]);

  // حفظ/مسح التخزين مع كل تغيير الحالة
  useEffect(() => {
    try {
      if (!session) localStorage.removeItem(STORAGE_KEYS.session);
      else localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    } catch { /* ignore */ }
  }, [session]);

  const start = (day: WorkoutDay): void => {
    if (day.exercises.length === 0) return;
    setSession({
      dayId: day.id,
      label: day.label,
      startedAt: Date.now(),
      restSec: 0,
      items: day.exercises.map(e => ({
        id: e.id, name: e.name, muscle: e.muscle,
        sets: e.sets, reps: e.reps, weight: e.weight || 0, doneSets: 0,
        setsDone: [],
        restSec: exerciseRest(e.name, restSeconds),
        note: e.note,
      })),
      currentIdx: 0,
      restEndsAt: null,
      restStartedAt: null,
    });
  };

  const markSet = (): void => {
    // one-tap flow: العدة بتتسجل بالوزن والتكرار الحاليين للتمرين
    setSession(s => {
      if (!s) return s;
      return {
        ...s,
        items: s.items.map((it, i) => {
          if (i !== s.currentIdx || it.doneSets >= it.sets) return it;
          return {
            ...it,
            doneSets: it.doneSets + 1,
            setsDone: [...it.setsDone, { w: it.weight, r: it.reps }],
          };
        }),
      };
    });
  };

  const logSet = (w: number, r: number): void => {
    // per-set: العدة بوزن/تكرار محدددين من المستخدم — بس جوه الحدود
    setSession(s => {
      if (!s) return s;
      return {
        ...s,
        items: s.items.map((it, i) => {
          if (i !== s.currentIdx || it.doneSets >= it.sets) return it;
          return {
            ...it,
            doneSets: it.doneSets + 1,
            setsDone: [...it.setsDone, { w: clampF(w, 0, WEIGHT_LBS_SET[1]), r: r }],
          };
        }),
      };
    });
  };

  const undoSet = (): void => {
    setSession(s => {
      if (!s) return s;
      return {
        ...s,
        items: s.items.map((it, i) => {
          if (i !== s.currentIdx || it.setsDone.length === 0) return it;
          return {
            ...it,
            doneSets: Math.max(0, it.doneSets - 1),
            setsDone: it.setsDone.slice(0, -1),
          };
        }),
      };
    });
  };

  const next = (): void => {
    const now = Date.now();
    setSession(s => {
      if (!s) return s;
      const closed = closeRestPure(s, now);
      if (closed.currentIdx >= closed.items.length - 1) return closed;
      // استراحة التمرين اللي خلص (compound 150s وإلا الافتراضي) — timestamp-based
      const restFor = closed.items[closed.currentIdx]?.restSec ?? restSeconds;
      return { ...closed, currentIdx: closed.currentIdx + 1, restEndsAt: now + restFor * 1000, restStartedAt: now };
    });
  };

  const prev = (): void => {
    const now = Date.now();
    setSession(s => {
      if (!s || s.currentIdx === 0) return s;
      return { ...closeRestPure(s, now), currentIdx: s.currentIdx - 1 };
    });
  };

  const jump = (idx: number): void => {
    const now = Date.now();
    setSession(s => (s ? { ...closeRestPure(s, now), currentIdx: idx } : s));
  };

  const skipRest = (): void => {
    const at = Date.now();
    setNowTime(at);
    setSession(s => (s ? closeRestPure(s, at) : s));
  };

  /** R2-4: مطاط الاستراحة ±15ث — مش بنفس الصفر (النقص بيقفلها لو وصلت ما dона) */
  const extendRest = (deltaSec: number): void => {
    setSession(s => {
      if (!s || !s.restEndsAt) return s;
      const now = Date.now();
      const base = Math.max(s.restEndsAt, now);
      return { ...s, restEndsAt: Math.max(now, base + deltaSec * 1000) };
    });
  };

  const quit = (): void => setSession(null);

  /** تغيير وزن التمرين الحالي — سلوك مطابق للـ stepper القديم (±2.5) */
  const nudgeWeight = (delta: number): void => {
    setSession(s => {
      if (!s) return s;
      return {
        ...s,
        items: s.items.map((it, i) => i === s.currentIdx ? { ...it, weight: Math.max(0, it.weight + delta) } : it),
      };
    });
  };

  const liveRestLeft = session?.restEndsAt ? Math.max(0, Math.ceil((session.restEndsAt - nowTime) / 1000)) : 0;

  return { session, nowTime, liveRestLeft, start, markSet, logSet, undoSet, next, prev, jump, skipRest, extendRest, quit, nudgeWeight };
}
