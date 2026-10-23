/**
 * App — تركيب نحيف بعد التقسيم (A4):
 *  - الحالة المملوكة فوق: profile / plan / logs / theme / session / التاب الحالي / toast
 *  - الشاشات في components، المنطق النقي في lib، المخزن في hooks.
 */

import { Suspense, lazy, useEffect, useState } from "react";
import { Skeleton } from "./components/ui/primitives";
import { Onboarding } from "./components/Onboarding";
import { HomeTab } from "./components/HomeTab";
/* D: تابات أقل استخدامًا — chunks مستقلة تتنزّل عند أول فتح */
const ScheduleTab = lazy(() => import("./components/ScheduleTab").then(m => ({ default: m.ScheduleTab })));
const ProgressTab = lazy(() => import("./components/ProgressTab").then(m => ({ default: m.ProgressTab })));
const AITab = lazy(() => import("./components/AITab").then(m => ({ default: m.AITab })));
import { WorkoutSession } from "./components/WorkoutSession";
import { ThemeModal } from "./components/ThemeModal";
import { NavBar } from "./components/NavBar";
import { SettingsModal } from "./components/SettingsModal";
import { useBodyweight } from "./hooks/useBodyweight";
import { useWakeLock } from "./hooks/useWakeLock";
import { InstallCard } from "./components/InstallCard";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTheme } from "./hooks/useTheme";
import { useWorkoutLogs } from "./hooks/useWorkoutLogs";
import { useWorkoutSession } from "./hooks/useWorkoutSession";
import { DEFAULT_REST_SECONDS, REST_RANGE, STORAGE_KEYS } from "./config";
import { makeBundle, parseBundle, sanitizePlan, sanitizeProfile } from "./lib/migrations";
import { convertBodyUnit, convertLogsUnit, convertPlanUnit } from "./lib/unitMigration";
import { convertWeight } from "./lib/training";
import { closeRest } from "./lib/sessionUtils";
import { fmtClock, todayKey } from "./lib/date";
import { uid } from "./lib/id";
import { S } from "./strings";
import type { LoggedExercise, Page, UserProfile, WorkoutDay, WorkoutLog } from "./types";

/** خطة البداية — 3 أيام فاضية (نفس الأصلي؛ بيتستبدل بالـ onboarding أو hydration) */
const defaultPlan = (): WorkoutDay[] => [
  { id: uid(), label: "Day 1 — Push", exercises: [] },
  { id: uid(), label: "Day 2 — Pull", exercises: [] },
  { id: uid(), label: "Day 3 — Legs", exercises: [] },
];

export default function App() {
  /* ===== الحالة المملوكة ===== */
  const [profile, setProfile] = useLocalStorage<UserProfile | null>(STORAGE_KEYS.profile, () => null, {
    validate: v => (v === null ? null : sanitizeProfile(v)),
  });
  const [days, setDays] = useLocalStorage<WorkoutDay[]>(STORAGE_KEYS.plan, defaultPlan, {
    validate: sanitizePlan,
  });
  const { logs, setLogs, addLog } = useWorkoutLogs();
  const { body, addBody, setBody: setBodyList } = useBodyweight();
  const { theme, setTheme } = useTheme();
  // B1: الاستراحة الافتراضية من الملف الشخصي (fallback 90)
  const api = useWorkoutSession(profile?.restSeconds ?? DEFAULT_REST_SECONDS);

  const [currentPage, setCurrentPage] = useState<Page>("Home");
  const [editingProfile, setEditingProfile] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toastState, setToastState] = useState<{ msg: string; undo?: () => void } | null>(null);
  /** R2-6: لما الـ SW يشاور على نسخة جديدة */
  const [swUpdate, setSwUpdate] = useState(false);
  /* R2-6: Wake Lock — الشاشة صاحية وقت السيشن بس */
  useWakeLock(!!api.session);
  /* R2-6: تحديث بموافقة المستخدم (registerType: prompt) */
  const sw = useRegisterSW({
    onNeedRefresh: () => setSwUpdate(true),
  });

  /* ===== تأثيرات عرضية ===== */
  useEffect(() => {
    if (!toastState) return;
    const t = window.setTimeout(() => setToastState(null), 2600);
    return () => window.clearTimeout(t);
  }, [toastState]);

  /* ===== العمليات المشتركة ===== */
  const savePlan = (next: WorkoutDay[]) => setDays(next);
  const onToast = (msg: string, undo?: () => void) => {
    setToastState({ msg, undo });
  };

  /* ===== A7: تصدير/استيراد ===== */
  const exportData = () => {
    const bundle = makeBundle({ profile, plan: days, logs, body });
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gym-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastState({ msg: S.settings.exported });
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** B9: CSV لسجل التمارين (UTF-8 + BOM يفتح صح في Excel) */
  const exportCsv = () => {
    const rows: string[] = ["date,day,exercise,muscle,sets,reps,weight,volume"];
    for (const l of logs) {
      for (const e of l.exercises) {
        const vol = e.sets * e.reps * e.weight;
        rows.push([l.date, l.dayLabel.replace(/,/g, " "), e.name.replace(/,/g, " "), e.muscle.replace(/,/g, " "), e.sets, e.reps, e.weight, vol].join(","));
      }
    }
    const csv = "\uFEFF" + rows.join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `gym-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    setToastState({ msg: S.settings.csvExported });
  };

  /** B7: حذف سجل من التقدم */
  const deleteLog = (id: string) => setLogs(prev => prev.filter(l => l.id !== id));

  const importFile = (file: File) => {    file.text()
      .then(json => {
        const bundle = parseBundle(json);
        if (!bundle) { setToastState({ msg: S.settings.importFailed }); return; }
        const applied: string[] = [];
        if (bundle.profile) { setProfile(bundle.profile); applied.push("profile"); }
        if (bundle.plan) { setDays(bundle.plan); applied.push("plan"); }
        if (bundle.logs) { setLogs(bundle.logs); applied.push("logs"); }
        setToastState({ msg: applied.length ? S.settings.imported : S.settings.importEmpty });
      })
      .catch(() => setToastState({ msg: S.settings.importFailed }));
  };

  const startSession = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    if (!day) return;
    if (day.exercises.length === 0) { setToastState({ msg: S.session.emptyDay }); return; }
    api.start(day);
  };

  /** إنهاء السيشن: لوج + الصق الأوزان في الخطة + قفل التخزين (نفس الأصلي) */
  const finishSession = () => {
    const session = api.session;
    if (!session) return;
    const closed = closeRest(session);
    const elapsed = Math.floor((Date.now() - closed.startedAt) / 1000);
    /** R2-4: البناء من setsDone لو موجودة (per-set) وإلا fallback القديم */
    const logged: LoggedExercise[] = closed.items.map(it => ({
      name: it.name, muscle: it.muscle,
      sets: it.doneSets > 0 ? it.doneSets : it.sets,
      reps: it.reps, weight: it.weight,
      setsDone: it.setsDone.length > 0 ? it.setsDone : undefined,
      note: it.note,
    }));
    const volume = logged.reduce((s, e) => s + (e.setsDone?.length
      ? e.setsDone.reduce((sv, st) => sv + st.w * st.r, 0)
      : e.sets * e.reps * e.weight), 0);
    const entry: WorkoutLog = {
      id: uid(), date: todayKey(), dayId: closed.dayId,
      dayLabel: closed.label, exercises: logged, volume, duration: elapsed, rest: closed.restSec,
    };
    addLog(entry);

    setDays(days.map(d => d.id === closed.dayId
      ? { ...d, exercises: d.exercises.map(e => { const it = closed.items.find(x => x.id === e.id); return it ? { ...e, weight: it.weight } : e; }) }
      : d));

    api.quit();
    setToastState({ msg: S.session.finished(fmtClock(elapsed)) });
  };

  /** حفظ من الـ Onboarding: ملف الشخصي + خطة فاضية بعدد الأيام (سلوك الأصلي) */
  const saveOnboarding = (p: UserProfile, plan: WorkoutDay[]) => {
    setProfile(p);
    setDays(plan);
    setEditingProfile(false);
  };

  /** B1: تغيير الاستراحة الافتراضية ±15 داخل الحدود */
  const changeRest = (delta: number) => {
    if (!profile) return;
    const next = Math.min(REST_RANGE[1], Math.max(REST_RANGE[0], (profile.restSeconds ?? DEFAULT_REST_SECONDS) + delta));
    setProfile({ ...profile, restSeconds: next });
  };

  /** R2-4: تبديل وحدة الأوزان — تحويل كامل للوجز/الوزن/الهدف/الخطة/سجل الوزن (unitMigration) */
  const changeUnits = (unit: "kg" | "lbs") => {
    if (!profile || profile.weightUnit === unit) return;
    const from = profile.weightUnit;
    setLogs(l => convertLogsUnit(l, from, unit));
    setBodyList(b => convertBodyUnit(b, from, unit));
    setDays(d => convertPlanUnit(d, from, unit));
    setProfile(p => p ? {
      ...p,
      weightUnit: unit,
      weight: convertWeight(p.weight, from, unit),
      targetWeight: convertWeight(p.targetWeight, from, unit),
    } : p);
    setToastState({ msg: S.settings.unitConverted });
  };

  /** R2-4: بيب نهاية الاستراحة (اختياري) */
  const changeBeep = (v: boolean) => {
    setProfile(p => p ? { ...p, restBeep: v } : p);
  };

  const toastEl = toastState ? (
    <div className="toast">
      <span>{toastState.msg}</span>
      {toastState.undo && (
        <button
          className="toast-undo"
          onClick={() => {
            setToastState(null);
            toastState.undo?.();
          }}
        >
          ↩ {S.session.undo}
        </button>
      )}
    </div>
  ) : null;
  const themeModalEl = (
    <ThemeModal
      open={showTheme}
      theme={theme}
      onPick={t => { setTheme(t); setShowTheme(false); setToastState({ msg: "اتغيّر الثيم ✨" }); }}
      onClose={() => setShowTheme(false)}
    />
  );
  const settingsModalEl = showSettings ? (
    <SettingsModal
      profile={profile}
      onEditProfile={() => setEditingProfile(true)}
      onExport={exportData}
      onImportFile={importFile}
      onRestDelta={changeRest}
      onExportCsv={exportCsv}
      onOpenTheme={() => setShowTheme(true)}
      onUnitChange={changeUnits}
      onBeepToggle={changeBeep}
      onClose={() => setShowSettings(false)}
    />
  ) : null;

  /* ===== Onboarding / Settings ===== */
  if (profile === null || editingProfile) {
    return (
      <Onboarding
        existing={profile}
        onSave={saveOnboarding}
        onCancel={() => setEditingProfile(false)}
      />
    );
  }

  /* ===== شاشة التمرين الحية ===== */
  if (api.session) {
    return (
      <div className="app session-page">
        <WorkoutSession api={api} unit={profile.weightUnit} logs={logs} beep={profile.restBeep} onFinish={finishSession} />
        {toastEl}
      </div>
    );
  }

  /* R2-6: بانر التحديث — autoUpdate اترحّل لـ prompt بموافقة المستخدم */
  const updateBanner = swUpdate ? (
    <div className="update-banner" role="status" aria-live="polite">
      <span>{S.pwa.updateReady}</span>
      <button className="update-btn" onClick={() => sw.updateServiceWorker(true)}>{S.pwa.updateBtn}</button>
      <button className="update-later" onClick={() => setSwUpdate(false)}>{S.pwa.updateLater}</button>
    </div>
  ) : null;

  const tabFall = (
  <div className="tab-loading" role="status" aria-label="جاري التحميل">
    <Skeleton h={26} w="55%" className="sk-title" />
    <Skeleton h={64} w="100%" className="sk-row" />
    <Skeleton h={64} w="100%" className="sk-row" />
    <Skeleton h={64} w="100%" className="sk-row" />
  </div>
);

/* ===== التابات ===== */
  return (
    <div className="app" dir={currentPage === "Schedule" || currentPage === "Progress" ? "rtl" : undefined}>
      {currentPage === "Home" && (
        <HomeTab
          days={days}
          profile={profile}
          setPlan={savePlan}
          addLog={addLog}
          startSession={startSession}
          onToast={onToast}
          onOpenTheme={() => setShowTheme(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}
      {currentPage === "Schedule" && (
        <Suspense fallback={tabFall}>
          <ScheduleTab
            profile={profile}
            setPlan={savePlan}
            goToHome={() => setCurrentPage("Home")}
            onToast={onToast}
            onOpenTheme={() => setShowTheme(true)}
          />
        </Suspense>
      )}
      {currentPage === "Progress" && (
        <Suspense fallback={tabFall}>
          <ProgressTab
            logs={logs}
            profile={profile}
            onDeleteLog={deleteLog}
            body={body}
            onAddBody={(v, d) => addBody(v, d)}
            onOpenTheme={() => setShowTheme(true)}
          />
        </Suspense>
      )}
      {currentPage === "AI" && (
        <Suspense fallback={tabFall}>
          <AITab />
        </Suspense>
      )}

      <NavBar page={currentPage} onGo={setCurrentPage} />
      {currentPage === "Home" && <InstallCard />}
      {updateBanner}
      {themeModalEl}
      {settingsModalEl}
      {toastEl}
    </div>
  );
}
