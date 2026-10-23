/**
 * تاب "تقدمك" — الإحصائيات انقلت لدوال نقية في lib/stats (A4); الشاشة عرض فقط.
 */

import * as React from "react";
import { useMemo, useState } from "react";
import { PaletteIcon, TrashIcon } from "./icons";
import { EmptyState } from "./ui/primitives";
import { useCountUp } from "../hooks/useCountUp";
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
import {
  areaPath,
  est1rmSeries,
  linePath,
  monthVolumeSeries,
  muscleVolumeMap,
  type SeriesPoint,
} from "../lib/charts";
import { achievementCount, evaluateAchievements } from "../lib/achievements";
import { drawMonthlyReport, shareOrDownload } from "../lib/reportCard";
import { ProgressRing } from "./ui/primitives";
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

  /* R2-5: الرسوم + الإنجازات + الهدف */
  const volMonths = useMemo(() => monthVolumeSeries(logs, 6), [logs]);
  const mVol = useMemo(() => muscleVolumeMap(logs), [logs]);
  const muscleRows = useMemo(
    () => Object.entries(mVol).sort((a, b) => b[1] - a[1]).filter(([, v]) => v > 0),
    [mVol],
  );
  const muscleTop = muscleRows[0]?.[0] ?? "";
  const oneRm = useMemo(() => (pickedEx ? est1rmSeries(logs, pickedEx) : []), [logs, pickedEx]);
  const goal = useMemo(() => goalProgress(profile, body), [profile, body]);
  const achViews = useMemo(
    () => evaluateAchievements({ logs, plan: [], body, profile, todayIso: todayKey(), unit }),
    [logs, body, profile, unit],
  );
  const achUnlocked = achievementCount(achViews);

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
      favorite: favoriteExercise(month),    };
  }, [logs, calMonth]);

  const { month: monthLogs, volume, delta, buckets, logged, best, favorite } = stats;
  /* R2-3: count-up للأرقام الكبيرة */
  const volumeAnim = useCountUp(volume);
  const sessionsAnim = useCountUp(monthLogs.length);
  const streakAnim = useCountUp(stats.streak);
  const { firstDayOfWeek: firstDow, daysInMonth } = monthMeta(calMonth.y, calMonth.m);

  /* R2-5: تقرير الشهر — يتبني canvas ويشارك/ينزل */
  const [reportMsg, setReportMsg] = useState("");
  const exportReport = () => {
    const cv = document.createElement("canvas");
    drawMonthlyReport(cv, {
      monthLabel: monthLabel(calMonth.y, calMonth.m),
      sessions: monthLogs.length,
      volume,
      unit,
      streak: stats.streak,
      prList: prList as [string, number][],
      favorite,
      bestDay: best ? fmtDate(best.date) : null,
      userName: profile?.name ?? "",
      topMuscle: muscleTop,
    });
    void shareOrDownload(cv, `gym-report-${calMonth.y}-${String(calMonth.m + 1).padStart(2, "0")}.png`)
      .then(r => setReportMsg(r === "shared" ? S.progress.reportShared : r === "downloaded" ? S.progress.reportDone : S.progress.reportFailed));
  };

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
            <p className="stat-value num">{fmtVolume(volumeAnim)}<span className="stat-unit">{unit}</span></p>
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
            <p className="stat-value num">{sessionsAnim}</p>
            <p className="stat-hint">{monthLogs.length ? `متوسط ${fmtVolume(volume / monthLogs.length)} ${unit} للتمرين` : "لسه مفيش"}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">ستريك</p>
            <p className="stat-value num">{streakAnim}<span className="stat-unit">يوم</span></p>
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
            <h3 className="card-title">{S.progress.weeksBarTitle}</h3>
            <span className="card-badge">{fmtVolume(volume)} {unit}</span>
          </div>
          <SvgBars vals={buckets} labels={buckets.map((_, i) => S.progress.weeksOf(i + 1))} fmt={v => fmtVolume(v)} />
        </div>

        {/* R2-5: حجم آخر 6 شهور — area chart */}
        <div className="card">
          <div className="card-head-row">
            <h3 className="card-title">{S.progress.monthsAreaTitle}</h3>
            <span className="card-badge">{fmtVolume(volMonths[volMonths.length - 1]?.v ?? 0)} {unit}</span>
          </div>
          <SvgArea pts={volMonths.map(p => ({ date: p.label, v: p.v }))} fmt={v => fmtVolume(v)} id="g-months" />
        </div>

        {/* R2-5: خريطة العضلات */}
        {muscleRows.length > 0 && (
          <div className="card">
            <h3 className="card-title">{S.progress.heatmapTitle}</h3>
            <p className="card-sub">{S.progress.heatmapSub(muscleTop)}</p>
            <div className="heat-grid">
              {muscleRows.map(([muscle, v]) => {
                const max = muscleRows[0]![1] || 1;
                return (
                  <div key={muscle} className="heat-cell" style={{ "--vol": String(v / max) } as React.CSSProperties}>
                    <span className="heat-muscle">{muscle}</span>
                    <span className="heat-val num">{fmtVolume(v)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* R2-5: هدف الجسم — ring */}
        {goal && (
          <div className="card goal-card">
            <h3 className="card-title">{S.progress.goalTitle}</h3>
            <div className="goal-row">
              <ProgressRing pct={goal.pct} size={108} stroke={10}>
                <span className="goal-ring-num num">{fmtVolume(goal.pct * 100)}<em>%</em></span>
              </ProgressRing>
              <div className="goal-info">
                <span className="goal-line"><em>{S.progress.goalStart}</em> {goal.start} {unit}</span>
                <span className="goal-line"><em>{S.progress.goalNow}</em> {goal.cur} {unit}</span>
                <span className="goal-line"><em>{S.progress.goalTarget}</em> {goal.target} {unit}</span>
                <span className={`goal-diff ${goal.diff === 0 ? "reached" : ""} num`}>
                  {goal.diff === 0 ? "🎯 وصلت!" : S.progress.goalRemaining(Math.abs(Math.round(goal.diff * 10) / 10))}
                </span>
              </div>
            </div>
          </div>
        )}

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
          ) : (            <div className="ex-history-list">
              {/* R2-5: 1RM التقديري — منحنى على جيب */}
              {oneRm.length > 0 && (
                <div className="one-rm-chart">
                  <span className="card-sub">{S.progress.oneRmTitle}</span>
                  <SvgArea pts={oneRm} fmt={v => `${Math.round(v)}`} unitLabel={unit} id="g-1rm" />
                </div>
              )}
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
            <EmptyState kind="trophy" title={S.progress.prTitle} sub={S.progress.prEmpty} />
          ) : (
            <div className="pr-list">
              {prList.map(([name, w], i) => (
                <div key={name} className="pr-row" style={{ "--i": i } as React.CSSProperties}>
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
            <EmptyState kind="scale" title={S.progress.bodyTitle} sub={S.progress.bodyEmpty} />
          ) : (
            <>
              {/* R2-5: منحنى الاتجاه لو فيه نقطة ومية */}
              {body.length >= 2 && (
                <div className="body-trend">
                  <SvgArea pts={[...body].reverse().map(p => ({ date: p.d, v: p.v }))} fmt={v => `${v}`} unitLabel={unit} id="g-body" />
                </div>
              )}
              <p className="card-sub">{S.progress.bodyKeep}</p>
              <div className="body-points">
                {body.slice(0, 8).map(p => (
                  <div key={p.d} className="body-point-row">
                    <span className="ex-history-date">{fmtDate(p.d)}</span>
                    <span className="body-val">{p.v} {unit}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* B7: آخر التمارين مع حذف سجل */}
        <div className="card">
          <h3 className="card-title">آخر التمارين</h3>
          {logs.length === 0 ? (
            <EmptyState kind="calendar" title={S.progress.emptyRecent} sub="افتح يوم من «تماريني» واضغط «خلصت التمرين» وبنوب عليه." />
          ) : (
            <div className="recent-list">
              {logs.slice(0, 6).map((l, i) => (
                <div key={l.id} className="recent-row" style={{ "--i": i } as React.CSSProperties}>
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

        {/* R2-5: كارت التقرير الشهري */}
        <div className="card report-card">
          <div className="card-head-row">
            <h3 className="card-title">{S.progress.reportTitle}</h3>
            <span className="card-badge">{monthLabel(calMonth.y, calMonth.m)}</span>
          </div>
          <p className="card-sub">{S.progress.reportSub}</p>
          <button
            className="btn-save report-btn"
            onClick={exportReport}
          >
            📸 {S.progress.reportBtn}
          </button>
          {reportMsg && <p className="report-msg">{reportMsg}</p>}
        </div>

        {/* R2-5: رفّ الإنجازات */}
        <div className="card ach-card">
          <div className="card-head-row">
            <h3 className="card-title">{S.progress.achTitle}</h3>
            <span className="card-badge">{S.progress.achSub(achUnlocked, achViews.length)}</span>
          </div>
          <div className="ach-grid">
            {achViews.map(v => (
              <div key={v.ach.id} className={`ach-tile ${v.unlocked ? `ach-unlocked tier-${v.ach.tier}` : "ach-locked"}`}
                title={v.ach.desc}>
                <span className="ach-icon">{v.unlocked ? v.ach.icon : "🔒"}</span>
                <span className="ach-name">{v.ach.title}</span>
                <span className="ach-date">{v.unlocked && v.date ? fmtDate(v.date) : S.progress.achLocked}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

/* ══════════════ R2-5: مكوّنات الرسم (SVG بدل divs) + الهدف ══════════════ */

/** أعمدة الحجم الأسبوعي — rect بيتنقل scaleY من تحت (بfallback مقائل لحركة reduce) */
const SvgBars: React.FC<{ vals: readonly number[]; labels: readonly string[]; fmt: (v: number) => string }> = ({ vals, labels, fmt }) => {
  const max = Math.max(1, ...vals);
  const bw = 44, gap = 16, pad = 14, H = 158, labelY = H - 6;
  const W = vals.length * bw + Math.max(0, vals.length - 1) * gap + pad * 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="svg-bars" role="img">
      {vals.map((v, i) => {
        const bh = v > 0 ? Math.max(6, Math.round((v / max) * (H - 46))) : 0;
        const x = pad + i * (bw + gap);
        const y = H - 22 - bh;
        return (
          <g key={i} className="svgbar" style={{ "--i": i } as React.CSSProperties}>
            <text x={x + bw / 2} y={y - 6} textAnchor="middle" className="svgbar-val num">{v > 0 ? fmt(v) : ""}</text>
            <rect x={x} y={y} width={bw} height={Math.max(2, bh)} rx="7" className={`svgbar-fill ${v > 0 ? "" : "svgbar-zero"}`} />
            <text x={x + bw / 2} y={labelY} textAnchor="middle" className="svgbar-label">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
};

/** منحنى area عام — للأشهر/الـ 1RM/وزن الجسم */
const SvgArea: React.FC<{ pts: readonly SeriesPoint[]; fmt: (v: number) => string; unitLabel?: string; id: string }> = ({ pts, fmt, unitLabel = "", id }) => {
  const W = 330, H = 150, pad = 12;
  const line = linePath(pts, W, H, pad);
  const area = areaPath(pts, W, H, pad);
  const max = Math.max(1, ...pts.map(p => p.v));
  const last = pts[pts.length - 1];
  const lastX = pts.length === 1 ? W / 2 : W - pad;
  const lastY = last ? H - pad - (last.v / max) * (H - pad * 2) : H / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="area-chart" role="img" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity=".35" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <path d={area} fill={`url(#${id}-grad)`} className="area-fill" />}
      {line && <path d={line} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" />
      }
      {last && (
        <g>
          <circle cx={lastX} cy={lastY} r="4" className="area-dot" />
          <text x={lastX - 4} y={Math.max(14, lastY - 10)} textAnchor="end" className="area-last num">
            {fmt(last.v)}{unitLabel ? ` ${unitLabel}` : ""}
          </text>
        </g>
      )}
      {pts.length >= 2 && pts[0] && pts[pts.length - 1] && (
        <g className="area-labels">
          <text x={pad} y={H - 1} textAnchor="start" className="area-date">{pts[0]!.date}</text>
          <text x={W - pad} y={H - 1} textAnchor="end" className="area-date">{pts[pts.length - 1]!.date}</text>
        </g>
      )}
    </svg>
  );
};

/** تقدم هدف الوزن — من أول قياس جسم لحد الهدف */
const goalProgress = (
  profile: UserProfile | null,
  body: readonly BodyWeightPoint[],
): { pct: number; start: number; cur: number; target: number; diff: number } | null => {
  if (!profile || !profile.targetWeight) return null;
  const target = profile.targetWeight;
  const series = [...body].reverse();
  const start = series[0]?.v ?? profile.weight ?? target;
  const cur = series[series.length - 1]?.v ?? profile.weight ?? target;
  const total = Math.abs(start - target);
  const pct = total > 0 ? Math.max(0, Math.min(1, Math.abs(start - cur) / total)) : 1;
  const diff = Math.round((cur - target) * 10) / 10;
  return { pct, start, cur, target, diff };
};
