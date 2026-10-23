/**
 * شاشة التمرين الحية (session) — R2-4 per-set logging + PR badge + overload
 * suggestion + rest v2 (ring + ±15/skip + بيب اختياري). المحرك في useWorkoutSession.
 */

import * as React from "react";
import { ExerciseThumb } from "./ExerciseThumb";
import { MinusIcon, PlusIcon, XIcon } from "./icons";
import { ProgressRing } from "./ui/primitives";
import { fmtClock } from "../lib/date";
import { buzz } from "../lib/motion";
import { restBeep } from "../lib/beep";
import { beatsAnyPr, prTripleMap } from "../lib/training";
import { overloadSessionsFromLogs, suggestOverload } from "../lib/overload";
import { S } from "../strings";
import type { SessionItem, WorkoutLog } from "../types";
import type { WorkoutSessionApi } from "../hooks/useWorkoutSession";

interface SessionProps {
  api: WorkoutSessionApi;
  unit: string;
  /** اللوجز — للـ PRs واقتراح الـ overload */
  logs: readonly WorkoutLog[];
  /** بيب نهاية الاستراحة (اختياري من الإعدادات) */
  beep?: boolean;
  /** إنهاء + تسجيل (App يشغّل اللوج + الصق الأوزان في الخطة) */
  onFinish: () => void;
}

/** خطوة الوزن حسب الوحدة */
const weightStep = (unit: string): number => (unit === "lbs" ? 5 : 2.5);

export const WorkoutSession: React.FC<SessionProps> = ({ api, unit, logs, beep, onFinish }) => {
  const { session, nowTime, liveRestLeft, skipRest } = api;
  const cur = session?.items[session.currentIdx];
  const curId = cur?.id;

  /* مسودة العدة القادمة (w×r) — بتترجع لقيم التمرين الجديد فيه (setState أثناء الـ render — نمط React الموصوف) */
  const [draft, setDraft] = React.useState<{ w: number; r: number; forId: string }>(
    () => ({ w: cur?.weight ?? 0, r: cur?.reps ?? 8, forId: curId ?? "" }),
  );
  if (cur && curId && draft.forId !== curId) {
    setDraft({ w: cur.weight, r: cur.reps, forId: curId });
  }
  const draftW = draft.w;
  const draftR = draft.r;
  const setDraftW = (w: number): void => setDraft(d => ({ ...d, w }));
  const setDraftR = (r: number): void => setDraft(d => ({ ...d, r }));

  /* PRs بحسابات الأبعاد الثلاثة */
  const prs = React.useMemo(() => prTripleMap(logs), [logs]);

  /* PR badge: آخر عدة مكتملة بتكسر رقم؟ (buzz مرة واحدة لكل انتصار) */
  const lastLogged = cur && cur.setsDone.length > 0 ? cur.setsDone[cur.setsDone.length - 1] : null;
  const prKey = lastLogged ? `${curId}:${lastLogged.w}x${lastLogged.r}` : "";
  const prBeaten = !!(lastLogged && cur && beatsAnyPr(cur.name, lastLogged.w, lastLogged.r, prs));
  const prBuzzed = React.useRef("");
  React.useEffect(() => {
    if (!prBeaten || !prKey) return;
    if (prBuzzed.current !== prKey) {
      prBuzzed.current = prKey;
      buzz(40);
    }
  }, [prBeaten, prKey]);

  /* اقتراح الـ overload الشفاف */
  const sug = React.useMemo(() => {
    if (!cur) return null;
    return suggestOverload(overloadSessionsFromLogs(logs, cur.name), cur.reps, unit as "kg" | "lbs");
  }, [logs, cur, unit]);

  /* بيب + haptic عند نهاية الاستراحة */
  const prevRest = React.useRef(0);
  React.useEffect(() => {
    if (prevRest.current > 0 && liveRestLeft === 0) {
      buzz(30);
      if (beep) restBeep();
    }
    prevRest.current = liveRestLeft;
  }, [liveRestLeft, beep]);

  if (!session || !cur) return null;

  const step = weightStep(unit);
  const elapsed = Math.floor((nowTime - session.startedAt) / 1000);
  const totalSets = session.items.reduce((a, i) => a + i.sets, 0);
  const doneSetsAll = session.items.reduce((a, i) => a + Math.min(i.doneSets, i.sets), 0);
  const restTotal = session.restEndsAt && session.restStartedAt
    ? Math.max(1, Math.round((session.restEndsAt - session.restStartedAt) / 1000))
    : cur.restSec;

  return (
    <div className="app session-page">
      <header className="header sticky dash-header">
        <div className="dash-header-row">
          <button className="sess-quit" onClick={api.quit} title={S.session.quit}><XIcon size={20} /></button>
          <div className="sess-head-center">
            <h1 className="dash-title">{session.label}</h1>
            <p className="dash-sub">{doneSetsAll} من {totalSets} مجموعات</p>
          </div>
          <span className="sess-head-spacer" />
        </div>
      </header>

      <main className="main dash-main sess-main">
        <div className="sess-timers">
          <div className="sess-timer">
            <span className="sess-timer-label">{S.session.elapsed}</span>
            <strong className="sess-timer-val num">{fmtClock(elapsed)}</strong>
          </div>
          <div className={`sess-timer ${liveRestLeft > 0 ? "sess-timer-live" : ""}`}>
            <span className="sess-timer-label">{S.session.restTotal}</span>
            <strong className="sess-timer-val num">{fmtClock(liveRestLeft > 0 ? liveRestLeft : session.restSec)}</strong>
          </div>
        </div>

        {liveRestLeft > 0 && (
          <RestPanel left={liveRestLeft} total={restTotal} onSkip={skipRest} onExtend={api.extendRest} />
        )}

        <div className="card sess-card">
          <div className="sess-top">
            <ExerciseThumb name={cur.name} muscle={cur.muscle} size={72} />
            <div className="sess-info">
              <span className="sess-idx">تمرين {session.currentIdx + 1} من {session.items.length}</span>
              <h3 className="sess-name">{cur.name}</h3>
              <p className="ex-muscle">{cur.muscle} · {cur.sets} مجموعات × {cur.reps}</p>
            </div>
            <button className="sess-anatomy-btn" title="عضلة التمرين">
              <ExerciseThumb mode="anatomy" name={cur.name} muscle={cur.muscle} size={44} />
            </button>
          </div>

          {cur.note && (
            <p className="sess-note">📝 {S.session.note}: {cur.note}</p>
          )}

          {/* استراحة التمرين + PR badge */}
          <div className="sess-meta-row">
            <span className="chip">⏱ {cur.restSec}ث {S.session.restTotal}</span>
            {prBeaten && (
              <span className="chip chip-brand pr-flash"><strong>{S.session.prBadge}</strong></span>
            )}
          </div>

          <SetEditor
            api={api}
            unit={unit}
            cur={cur}
            draftW={draftW}
            draftR={draftR}
            setDraftW={setDraftW}
            setDraftR={setDraftR}
            step={step}
          />

          {sug && Math.abs(sug.nextWeight - cur.weight) > 0.01 && (
            <div className="overload-hint">
              <span>{S.session.suggestHint(sug.nextWeight, unit)}</span>
              <button className="chip chip-brand" onClick={() => api.nudgeWeight(sug.nextWeight - cur.weight)}>
                {S.session.useSuggestion}
              </button>
            </div>
          )}

          <div className="sess-btns">
            <button className="sess-btn-ghost" onClick={api.prev} disabled={session.currentIdx === 0}>
              <span>{S.session.goPrev}</span>
            </button>
            <button
              className="sess-btn-set set-pop-host"
              disabled={cur.doneSets >= cur.sets}
              onClick={() => {
                buzz(10);
                api.logSet(draftW, draftR);
              }}
            >
              {S.session.setDone}
            </button>
            <button className="sess-btn-primary" onClick={api.next}>
              <span>{S.session.goNext}</span>
              <span className="sess-next-chev">›</span>
            </button>
          </div>
        </div>

        <div className="card sess-list-card">
          <h3 className="card-title">{S.session.listTitle}</h3>
          <div className="sess-list">
            {session.items.map((it, i) => (
              <button
                key={it.id}
                className={`sess-row ${i === session.currentIdx ? "sess-row-now" : i < session.currentIdx ? "sess-row-done" : ""}`}
                style={{ "--i": i } as React.CSSProperties}
                onClick={() => api.jump(i)}
              >
                <span className="sess-row-idx">{i < session.currentIdx || it.doneSets >= it.sets ? "✓" : i + 1}</span>
                <span className="sess-row-name">{it.name}</span>
                <span className="sess-row-sets num">{it.setsDone.length}/{it.sets}</span>
                <span className="sess-row-w num">{it.weight} {unit}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="finish-btn sess-finish" onClick={onFinish}>
          <span>{S.session.finishBtn}</span>
        </button>
      </main>
    </div>
  );
};

/* ===== لوحة الاستراحة v2 — ring + ±15 + skip ===== */
const RestPanel: React.FC<{
  left: number;
  total: number;
  onSkip: () => void;
  onExtend: (d: number) => void;
}> = ({ left, total, onSkip, onExtend }) => (
  <div className="card rest-card-v2">
    <ProgressRing pct={1 - left / Math.max(1, total)} size={92} stroke={9}>
      <strong className="rest-ring-val num">{fmtClock(left)}</strong>
    </ProgressRing>
    <div className="rest-actions">
      <button className="chip" onClick={() => onExtend(-15)}>{S.session.restMinus}</button>
      <button className="chip chip-brand" onClick={onSkip}>{S.session.restSkip}</button>
      <button className="chip" onClick={() => onExtend(15)}>{S.session.rest15}</button>
    </div>
  </div>
);

/* ===== تسجيل العدة — steppers كبيرة بـ long-press repeat + shortcut chips ===== */

interface HoldRepeat {
  down: (e: React.PointerEvent) => void;
  stop: () => void;
}

/** تكرار بالضغط المطوّل — pointerdown يبدأ، أي رفع/إلغاء يوقف */
const useHoldRepeat = (fn: () => void, delayMs = 420, rateMs = 60): HoldRepeat => {
  const timers = React.useRef<{ t: number; iv: number } | null>(null);
  const stop = React.useCallback((): void => {
    if (timers.current) {
      window.clearTimeout(timers.current.t);
      window.clearInterval(timers.current.iv);
      timers.current = null;
    }
  }, []);
  React.useEffect(() => stop, [stop]);
  const down = React.useCallback((e: React.PointerEvent): void => {
    e.preventDefault();
    fn();
    stop();
    const t = window.setTimeout(() => {
      timers.current = { t: 0, iv: window.setInterval(fn, rateMs) };
    }, delayMs);
    timers.current = { t, iv: 0 };
  }, [fn, stop, delayMs, rateMs]);
  return { down, stop };
};

const SetEditor: React.FC<{
  api: WorkoutSessionApi;
  unit: string;
  cur: SessionItem;
  draftW: number;
  draftR: number;
  setDraftW: (n: number) => void;
  setDraftR: (n: number) => void;
  step: number;
}> = ({ api, unit, cur, draftW, draftR, setDraftW, setDraftR, step }) => {
  const incW = React.useCallback(() => setDraftW(Math.min(500, draftW + step)), [draftW, step, setDraftW]);
  const decW = React.useCallback(() => setDraftW(Math.max(0, draftW - step)), [draftW, step, setDraftW]);
  const incR = React.useCallback(() => setDraftR(Math.min(200, draftR + 1)), [draftR, setDraftR]);
  const decR = React.useCallback(() => setDraftR(Math.max(1, draftR - 1)), [draftR, setDraftR]);

  const wUp = useHoldRepeat(incW);
  const wDown = useHoldRepeat(decW);
  const rUp = useHoldRepeat(incR);
  const rDown = useHoldRepeat(decR);

  const stopAll = (e: React.PointerEvent): void => {
    wUp.stop();
    wDown.stop();
    rUp.stop();
    rDown.stop();
    e.preventDefault();
  };

  const holdProps = (h: HoldRepeat): React.ComponentProps<"button"> => ({
    onPointerDown: h.down,
    onPointerUp: h.stop,
    onPointerCancel: h.stop,
    onPointerLeave: h.stop,
  });

  return (
    <div className="set-editor" onPointerUp={stopAll}>
      <div className="set-editor-cols">
        <div className="set-editor-col">
          <span className="set-editor-label">{S.session.weightLabel}</span>
          <div className="stepper stepper-hold num" role="group">
            <button className="stepper-btn" {...holdProps(wDown)} aria-label="أنقص الوزن"><MinusIcon /></button>
            <span className="set-editor-val num num-xl">{draftW}<em>{unit}</em></span>
            <button className="stepper-btn" {...holdProps(wUp)} aria-label="زد الوزن"><PlusIcon /></button>
          </div>
          <div className="quick-chips">
            <button className="chip chip-brand" onClick={() => setDraftW(draftW + step)}>{S.session.quickPlus(step)}</button>
            <button className="chip" onClick={() => setDraftW(draftW + step * 2)}>{S.session.quickPlus(step * 2)}</button>
          </div>
        </div>
        <div className="set-editor-col">
          <span className="set-editor-label">التكرارات</span>
          <div className="stepper stepper-hold num" role="group">
            <button className="stepper-btn" {...holdProps(rDown)} aria-label="أنقص التكرارات"><MinusIcon /></button>
            <span className="set-editor-val num num-xl">{draftR}</span>
            <button className="stepper-btn" {...holdProps(rUp)} aria-label="زد التكرارات"><PlusIcon /></button>
          </div>
        </div>
      </div>

      {/* العدّات المسجّلة → chips w×r */}
      <div className="sets-done-chips">
        {Array.from({ length: cur.sets }, (_, i) => {
          const logged = cur.setsDone[i];
          const isNext = i === cur.setsDone.length;
          return (
            <span key={i} className={`chip ${logged ? "chip-brand" : ""}${isNext ? " sets-next" : ""}`}>
              {logged ? `${logged.w}×${logged.r}` : isNext ? "التالية" : "—"}
            </span>
          );
        })}
      </div>
      {cur.setsDone.length > 0 && (
        <button className="undo-set-btn" onClick={api.undoSet}>
          ↩ {S.session.undo} — آخر عدة
        </button>
      )}
    </div>
  );
};
