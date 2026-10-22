/**
 * شاشة التمرين الحية (session) — عرض + أزرار المحرك (المحرك نفسه في useWorkoutSession).
 */

import * as React from "react";
import { ExerciseThumb } from "./ExerciseThumb";
import { CheckIcon, MinusIcon, PlusIcon, XIcon } from "./icons";
import { fmtClock } from "../lib/date";
import type { WorkoutSessionApi } from "../hooks/useWorkoutSession";

interface SessionProps {
  api: WorkoutSessionApi;
  unit: string;
  /** إنهاء + تسجيل (App يشغّل اللوج + الصق الأوزان في الخطة) */
  onFinish: () => void;
}

export const WorkoutSession: React.FC<SessionProps> = ({ api, unit, onFinish }) => {
  const { session, nowTime, liveRestLeft, markSet, next, prev, jump, skipRest, quit } = api;
  if (!session) return null;

  const cur = session.items[session.currentIdx];
  if (!cur) return null;

  // A3: العدادات كلها من الطوابع الزمنية — صح حتى بعد sleep
  const elapsed = Math.floor((nowTime - session.startedAt) / 1000);
  const totalSets = session.items.reduce((a, i) => a + i.sets, 0);
  const doneSetsAll = session.items.reduce((a, i) => a + Math.min(i.doneSets, i.sets), 0);

  return (
    <div className="app session-page">
      <header className="header sticky dash-header">
        <div className="dash-header-row">
          <button className="sess-quit" onClick={quit} title="إلغاء"><XIcon size={20} /></button>
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
            <span className="sess-timer-label">وقت التمرين</span>
            <strong className="sess-timer-val">{fmtClock(elapsed)}</strong>
          </div>
          <div className={`sess-timer ${liveRestLeft > 0 ? "sess-timer-live" : ""}`}>
            <span className="sess-timer-label">{liveRestLeft > 0 ? "استراحة كمان" : "وقت البريك"}</span>
            <strong className="sess-timer-val">{fmtClock(liveRestLeft > 0 ? liveRestLeft : session.restSec)}</strong>
          </div>
        </div>

        {liveRestLeft > 0 && (
          <button className="rest-skip" onClick={skipRest}>
            <span>استراحة جارية · {fmtClock(liveRestLeft)}</span>
            <strong>تخطّي الاستراحة</strong>
          </button>
        )}

        <div className="card sess-card">
          <div className="sess-top">
            <ExerciseThumb name={cur.name} muscle={cur.muscle} size={72} />
            <div className="sess-info">
              <span className="sess-idx">تمرين {session.currentIdx + 1} من {session.items.length}</span>
              <h3 className="sess-name">{cur.name}</h3>
              <p className="ex-muscle">{cur.muscle} · {cur.reps} عدة × {cur.sets} مجموعات</p>
            </div>
            <button className="sess-anatomy-btn" title="عضلة التمرين">
              <ExerciseThumb mode="anatomy" name={cur.name} muscle={cur.muscle} size={44} />
            </button>
          </div>

          <SessionWeightRow api={api} unit={unit} weight={cur.weight} doneSets={cur.doneSets} sets={cur.sets} />

          <div className="sess-btns">
            <button className="sess-btn-ghost" onClick={prev} disabled={session.currentIdx === 0}>
              <span>‹ الرجوع</span>
            </button>
            <button className="sess-btn-set" onClick={markSet} disabled={cur.doneSets >= cur.sets}>
              <CheckIcon size={16} />
              <span>عدّة تتمت</span>
            </button>
            <button className="sess-btn-primary" onClick={next}>
              <span>التالي</span>
              <span className="sess-next-chev">›</span>
            </button>
          </div>
        </div>

        <div className="card sess-list-card">
          <h3 className="card-title">تمارين اليوم</h3>
          <div className="sess-list">
            {session.items.map((it, i) => (
              <button key={it.id} className={`sess-row ${i === session.currentIdx ? "sess-row-now" : i < session.currentIdx ? "sess-row-done" : ""}`}
                onClick={() => jump(i)}>
                <span className="sess-row-idx">{i < session.currentIdx ? "✓" : i + 1}</span>
                <span className="sess-row-name">{it.name}</span>
                <span className="sess-row-sets">{it.sets}×{it.reps}</span>
                <span className="sess-row-w">{it.weight} {unit}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="finish-btn sess-finish" onClick={onFinish}>
          <CheckIcon size={16} />
          <span>اقفل اليوم وسجّله</span>
        </button>
      </main>
    </div>
  );
};

/** صف تعديل الوزن — مثل الكود الأصلي بالظبط: الـ stepper + sets-done في نفس الصف */
const SessionWeightRow: React.FC<{ api: WorkoutSessionApi; unit: string; weight: number; doneSets: number; sets: number }> = ({ api, unit, weight, doneSets, sets }) => (
  <div className="sess-weight-row">
    <span className="sess-label">وزن المجموعة</span>
    <div className="weight-stepper">
      <button className="stepper-btn stepper-btn-sm" onClick={() => api.nudgeWeight(-2.5)}><MinusIcon /></button>
      <span className="weight-val">{weight}<em>{unit}</em></span>
      <button className="stepper-btn stepper-btn-sm" onClick={() => api.nudgeWeight(2.5)}><PlusIcon size={12} /></button>
    </div>
    <span className={`sess-sets-done ${doneSets >= sets ? "sess-sets-full" : ""}`}>
      {doneSets}/{sets} تم
    </span>
  </div>
);
