/**
 * أدوات السيشن — نقية (بدون React) عشان تتحط في tests: restore + حساب rest.
 */

import type { SessionState } from "../types";
import { DEFAULT_REST_SECONDS } from "../config";
import { exerciseRest } from "./training";

export const SESSION_VALIDATED_KEYS = ["dayId", "label", "startedAt", "items", "currentIdx"] as const;

/** R2-4: السيشن المحفوظة بنسخة أقدم (قبل per-set) بتتملّى بحقولها الجديدة — migration-safe */
export const normalizeSession = (s: SessionState, defaultRest = DEFAULT_REST_SECONDS): SessionState => ({
  ...s,
  items: s.items.map(it => ({
    ...it,
    doneSets: it.doneSets ?? 0,
    setsDone: Array.isArray(it.setsDone) ? it.setsDone : [],
    restSec: it.restSec && it.restSec > 0 ? it.restSec : exerciseRest(it.name ?? "", defaultRest),
    note: typeof it.note === "string" ? it.note : undefined,
  })),
});

/** يقفل الراحة الجارية ويجمّع ثوانيها في restSec — طوابع زمنية، صحيح حتى بعد sleep */
export const closeRest = (s: SessionState, at?: number): SessionState => {
  if (!s.restEndsAt) return s;
  const now = at ?? Date.now();
  const spent = Math.max(0, Math.round((Math.min(now, s.restEndsAt) - (s.restStartedAt ?? s.restEndsAt)) / 1000));
  return { ...s, restSec: s.restSec + spent, restEndsAt: null, restStartedAt: null };
};

/** استعادة السيشن الكحفظة — فاليديشن شكل؛ داتا فاسدة ⇒ null */
export const restoreSession = (): SessionState | null => {
  try {
    const raw = localStorage.getItem("gym-session-v1");
    if (!raw) return null;
    const v: unknown = JSON.parse(raw);
    if (!v || typeof v !== "object") return null;
    const r = v as Partial<SessionState>;
    if (
      typeof r.dayId !== "string" ||
      typeof r.label !== "string" ||
      typeof r.startedAt !== "number" ||
      typeof r.currentIdx !== "number" ||
      !Array.isArray(r.items)
    ) return null;
    return normalizeSession({
      dayId: r.dayId,
      label: r.label,
      startedAt: r.startedAt,
      restSec: typeof r.restSec === "number" ? r.restSec : 0,
      items: r.items.filter(it => !!it && typeof it.name === "string"),
      currentIdx: r.currentIdx,
      restEndsAt: typeof r.restEndsAt === "number" ? r.restEndsAt : null,
      restStartedAt: typeof r.restStartedAt === "number" ? r.restStartedAt : null,
    });
  } catch {
    return null;
  }
};
