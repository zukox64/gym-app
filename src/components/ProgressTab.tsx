/**
 * تاب "تقدمك" — الإحصائيات انقلت لدوال نقية في lib/stats (A4); الشاشة عرض فقط.
 */

import * as React from "react";
import { useMemo, useState } from "react";
import { PaletteIcon, TrashIcon } from "./icons";
import { ExerciseThumb } from "./ExerciseThumb";
import { fmtClock, fmtDate, monthLabel, monthMeta, todayKey } from "../lib/date";
import { fmtVolume, unitOf } from "../lib/units";
import {
  bestLog,
  exerciseHistory,
  favoriteExercise,
  loggedDates,
  loggedExerciseNames,
  logsOfMonth,
  monthVolume,
  prMap,
  streak,
  volumeDeltaPct,
  weekBuckets,
  weekSummary,
} from "../lib/stats";
import type { UserProfile, WorkoutLog } from "../types";
import type { BodyWeightPoint } from "../lib/migrations";
import { S } from "../strings";

interface ProgressTabProps {
  logs: WorkoutLog[];
  profile: UserProfile | null;
  onDeleteLog: (id: string) => void;
  body: BodyWeightPoint[];
  onAddBody: (v: number, d: string) => void;
  onOpenTheme: () => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({ logs, profile, onDeleteLog, body, onAddBody, onOpenTheme }) => {
  const unit = unitOf(profile);
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [pickedEx, setPickedEx] = useState("");
  const [bodyInput, setBodyInput] = useState<number | "">("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  /* B8: ملخص الأسبوع + B5: PRs + B4: أسماء التمارين المسجلة */
  const week = useMemo(() => weekSummary(logs), [logs]);
  const prs = useMemo(() => prMap(logs), [logs]);
  const prList = useMemo(
    () => Object.entries(prs).filter(([, w]) => w > 0).sort((a, b) => b[1] - a[1]).slice(0, 8),
    [prs],
  );
  const exNames = useMemo(() => loggedExerciseNames(logs), [logs]);
  const history = useMemo(
    () => (pickedEx ? exerciseHistory(logs, pickedEx).slice(0, 5) : []),
    [logs, pickedEx],
  );

  const saveBody = () => {
    const v = Number(bodyInput);
    if (!Number.isFinite(v) || v <= 0) return;
    onAddBody(Math.round(v * 10) / 10, todayKey());
    setBodyInput("");
  };

  const shiftMonth = (delta: number) => {
    setCalMonth(prev => {
      const d = new Date(prev.y, prev.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const stats = useMemo(() => {
    const ref = { y: calMonth.y, m0: calMonth.m };
    const month = logsOfMonth(logs, ref);
    const volume = monthVolume(month);
    return {
      month,
      volume,
      delta: volumeDeltaPct(logs, ref),
      buckets: weekBuckets(month),
      logged: loggedDates(month),
      streak: streak(logs),
      best: bestLog(month),
      favorite: favoriteExercise(month),
    };
  }, [logs, calMonth]);

  const { month: monthLogs, volume, delta, buckets, logged, best, favorite } = stats;
  const maxWeek = Math.max(1, ...buckets);
  const { firstDayOfWeek: firstDow, daysInMonth } = monthMeta(calMonth.y, calMonth.m);

  return (
    <>
      <header className="header sticky dash-header">
        <div className="dash-header-row">
          <div>
            <h1 className="dash-title">{S.progress.title}</h1>
            <p className="dash-sub">{S.progress.sub(logs.length)}</p>
          </div>
          <div className="dash-header-actions">
            <button className="icon-btn-circle" onClick={onOpenTheme} title={S.progress.theme}><PaletteIcon size={18} /></button>
          </div>
        </div>
      </header>

      <main className="main dash-main progress-main">
        {/* B8: ملخص الأسبوع */}
        <div className="card week-card">
          <div className="card-head-row">
            <h3 className="card-title">{S.progress.weekTitle}</h3>
            <span className="card-badge">{S.progress.weekSub(week.count, fmtVolume(week.volume) + " " + unit)}</span>
          </div>
          <p className={`week-hint ${week.count >= week.prevCount ? "up" : "down"}`}>
            {week.prevCount === 0
              ? "بدأك السنة صح — أول أسبوع في التسجيل"
              : week.count >= week.prevCount
                ? `▲ ${Math.max(0, week.count - week.prevCount)} تمرين زيادة على الكسب`
                : `▼ ${week.prevCount - week.count} تمرين أقل من الكسب اللي فات`}
          </p>
        </div>

        <div className="stat-grid">
          <div className="stat-card stat-hero">
            <p className="stat-label">إجمالي الوزن المرفوع</p>
            <p className="stat-value">{fmtVolume(volume)}<span className="stat-unit">{unit}</span></p>
            <p className={`stat-hint ${delta === null ? "" : delta >= 0 ? "up" : "down"}`}>
              {delta === null
                ? "أول شهر ليك — كمّل!"
                : delta >= 0
                  ? `▲ ${delta}% عن الشهر اللي فات`
                  : `▼ ${Math.abs(delta)}% عن الشهر اللي فات`}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">تمارين خلصتها</p>
            <p className="stat-value">{monthLogs.length}</p>
            <p className="stat-hint">{monthLogs.length ? `متوسط ${fmtVolume(volume / monthLogs.length)} ${unit} للتمرين` : "لسه مفيش"}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">ستريك</p>
            <p className="stat-value">{stats.streak}<span className="stat-unit">يوم</span></p>
            <p className="stat-hint">{stats.streak > 0 ? "كمّل كده 🔥" : "ابدأ سلسلة جديدة"}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">أقوى يوم</p>
            <p className="stat-value">{best ? best.date.slice(8, 10) : "—"}</p>
            <p className="stat-hint">{best ? `${fmtVolume(best.volume)} ${unit}` : "لسه مفيش"}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">التمرين المفضل</p>
            <p className="stat-value stat-value-sm">{favorite || "—"}</p>
            <p className="stat-hint">{favorite ? "أكتر تمرين كررته" : "لسه مفيش"}</p>
          </div>
        </div>

        <div className="card cal-card">
          <div className="cal-head">
            <button className="cal-nav" onClick={() => shiftMonth(-1)}>‹</button>
            <h3 className="cal-title">{monthLabel(calMonth.y, calMonth.m)}</h3>
            <button className="cal-nav" onClick={() => shiftMonth(1)}>›</button>
          </div>
          <div className="cal-grid cal-dow">
            {["ح", "ن", "ث", "ر", "خ", "ج", "س"].map((d, i) => <span key={i} className="cal-dow-label">{d}</span>)}
          </div>
          <div className="cal-grid">
            {Array.from({ length: firstDow }).map((_, i) => <span key={`e${i}`} className="cal-cell cal-cell-empty" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const n = i + 1;
              const key = `${calMonth.y}-${String(calMonth.m + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
              const done = logged.has(key);
              const isToday = key === todayKey();
              return (
                <div key={key} className={`cal-cell ${done ? "cal-cell-done" : ""} ${isToday ? "cal-cell-today" : ""}`}>
                  <span className="cal-num">{n}</span>
                  {done && <span className="cal-dot" />}
                </div>
              );
            })}
          </div>
          <div className="cal-legend">
            <span><i className="legend-dot legend-dot-done" /> يوم تمرين</span>
            <span><i className="legend-dot legend-dot-today" /> النهاردة</span>
          </div>
        </div>

        <div className="card bars-card">
          <div className="card-head-row">
            <h3 className="card-title">الوزن على الأسابيع</h3>
            <span className="card-badge">{fmtVolume(volume)} {unit}</span>
          </div>
          <div className="bars">
            {buckets.map((v, i) => (
              <div key={i} className="bar-col">
                <span className="bar-val">{v > 0 ? fmtVolume(v) : ""}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: v > 0 ? `${Math.max(6, Math.round((v / maxWeek) * 100))}%` : "0%" }} />
                </div>
                <span className="bar-label">أسبوع {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* B4: تقدم تمرين معيّن */}
        <div className="card">
          <h3 className="card-title">{S.progress.exProgress}</h3>
          <select className="field-input ex-progress-select" value={pickedEx}
            onChange={e => setPickedEx(e.target.value)} aria-label={S.progress.exProgress}>
            <option value="">{S.progress.pickPh}</option>
            {exNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          {history.length === 0 ? (
            <p className="day-empty">{S.progress.noSessions}</p>
          ) : (
            <div className="ex-history-list">
              {history.map(h => (
                <div key={h.date} className="ex-history-row">
                  <span className="ex-history-date">{fmtDate(h.date)}</span>
                  <div className="ex-history-bar-track">
                    <div className="ex-history-bar"
                      style={{ width: `${Math.max(8, Math.round((h.weight / Math.max(1, Math.max(...history.map(x => x.weight)))) * 100))}%` }} />
                  </div>
                  <span className="ex-history-val">{h.weight} {unit} · {h.sets}×{h.reps}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* B5: أرقام شخصية */}
        <div className="card">
          <h3 className="card-title">{S.progress.prTitle}</h3>
          {prList.length === 0 ? (
            <p className="day-empty">{S.progress.prEmpty}</p>
          ) : (
            <div className="pr-list">
              {prList.map(([name, w]) => (
                <div key={name} className="pr-row">
                  <span className="pr-name">{name}</span>
                  <span className="pr-val">{w} <em>{unit}</em></span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* B6: وزن الجسم */}
        <div className="card">
          <h3 className="card-title">{S.progress.bodyTitle}</h3>
          <div className="body-input-row">
            <input className="field-input body-input" type="number" inputMode="numeric"
              placeholder={S.progress.bodyPh} value={bodyInput}
              onChange={e => setBodyInput(e.target.value === "" ? "" : Number(e.target.value))} />
            <button className="btn-save body-save" onClick={saveBody}>{S.progress.save}</button>
          </div>
          {body.length === 0 ? (
            <p className="day-empty">{S.progress.bodyEmpty}</p>
          ) : (
            <div className="body-points">
              {body.slice(0, 8).map(p => (
                <div key={p.d} className="body-point-row">
                  <span className="ex-history-date">{fmtDate(p.d)}</span>
                  <span className="body-val">{p.v} {unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* B7: آخر التمارين مع حذف سجل */}
        <div className="card">
          <h3 className="card-title">آخر التمارين</h3>
          {logs.length === 0 ? (
            <p className="day-empty">لسه مسجلتش تمرين — افتح يوم واضغط «خلصت التمرين».</p>
          ) : (
            <div className="recent-list">
              {logs.slice(0, 6).map(l => (
                <div key={l.id} className="recent-row">
                  <ExerciseThumb name={l.exercises[0]?.name || ""} muscle={l.exercises[0]?.muscle || ""} size={34} />
                  <div className="recent-info">
                    <p className="ex-name">{l.dayLabel}</p>
                    <p className="ex-muscle">{l.exercises.length} تمارين · {fmtDate(l.date)}{l.duration ? ` · ${fmtClock(l.duration)}` : ""}{l.rest ? ` · بريك ${fmtClock(l.rest)}` : ""}</p>
                  </div>
                  <button className={`recent-del ${confirmDelete === l.id ? "recent-del-arm" : ""}`}
                    onClick={() => {
                      if (confirmDelete === l.id) { onDeleteLog(l.id); setConfirmDelete(null); }
                      else setConfirmDelete(l.id);
                    }}
                    aria-label={confirmDelete === l.id ? S.progress.confirmDel : "حذف السجل"}>
                    {confirmDelete === l.id ? S.progress.confirmDel : <TrashIcon size={13} />}
                  </button>
                  <span className="recent-vol">{fmtVolume(l.volume)}<em>{unit}</em></span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};
