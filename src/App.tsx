/**
 * App — تركيب نحيف بعد التقسيم (A4):
 *  - الحالة المملوكة فوق: profile / plan / logs / theme / session / التاب الحالي / toast
 *  - الشاشات في components، المنطق النقي في lib، المخزن في hooks.
 */

import { useEffect, useState } from "react";
import { Onboarding } from "./components/Onboarding";
import { HomeTab } from "./components/HomeTab";
import { ScheduleTab } from "./components/ScheduleTab";
import { ProgressTab } from "./components/ProgressTab";
import { AITab } from "./components/AITab";
import { WorkoutSession } from "./components/WorkoutSession";
import { ThemeModal } from "./components/ThemeModal";
import { NavBar } from "./components/NavBar";
import { SettingsModal } from "./components/SettingsModal";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTheme } from "./hooks/useTheme";
import { useWorkoutLogs } from "./hooks/useWorkoutLogs";
import { useWorkoutSession } from "./hooks/useWorkoutSession";
import { STORAGE_KEYS } from "./config";
import { makeBundle, parseBundle, sanitizePlan, sanitizeProfile } from "./lib/migrations";
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
  const { theme, setTheme } = useTheme();
  const api = useWorkoutSession();

  const [currentPage, setCurrentPage] = useState<Page>("Home");
  const [editingProfile, setEditingProfile] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState("");

  /* ===== تأثيرات عرضية ===== */
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  /* ===== العمليات المشتركة ===== */
  const savePlan = (next: WorkoutDay[]) => setDays(next);
  const onToast = (msg: string) => setToast(msg);

  /* ===== A7: تصدير/استيراد ===== */
  const exportData = () => {
    const bundle = makeBundle({ profile, plan: days, logs });
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gym-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast(S.settings.exported);
  };

  const importFile = (file: File) => {
    file.text()
      .then(json => {
        const bundle = parseBundle(json);
        if (!bundle) { setToast(S.settings.importFailed); return; }
        const applied: string[] = [];
        if (bundle.profile) { setProfile(bundle.profile); applied.push("profile"); }
        if (bundle.plan) { setDays(bundle.plan); applied.push("plan"); }
        if (bundle.logs) { setLogs(bundle.logs); applied.push("logs"); }
        setToast(applied.length ? S.settings.imported : S.settings.importEmpty);
      })
      .catch(() => setToast(S.settings.importFailed));
  };

  const startSession = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    if (!day) return;
    if (day.exercises.length === 0) { setToast(S.session.emptyDay); return; }
    api.start(day);
  };

  /** إنهاء السيشن: لوج + الصق الأوزان في الخطة + قفل التخزين (نفس الأصلي) */
  const finishSession = () => {
    const session = api.session;
    if (!session) return;
    const closed = closeRest(session);
    const elapsed = Math.floor((Date.now() - closed.startedAt) / 1000);
    const logged: LoggedExercise[] = closed.items.map(it => ({
      name: it.name, muscle: it.muscle, sets: it.doneSets > 0 ? it.doneSets : it.sets, reps: it.reps, weight: it.weight,
    }));
    const volume = logged.reduce((s, e) => s + e.sets * e.reps * e.weight, 0);
    const entry: WorkoutLog = {
      id: uid(), date: todayKey(), dayId: closed.dayId,
      dayLabel: closed.label, exercises: logged, volume, duration: elapsed, rest: closed.restSec,
    };
    addLog(entry);

    setDays(days.map(d => d.id === closed.dayId
      ? { ...d, exercises: d.exercises.map(e => { const it = closed.items.find(x => x.id === e.id); return it ? { ...e, weight: it.weight } : e; }) }
      : d));

    api.quit();
    setToast(S.session.finished(fmtClock(elapsed)));
  };

  /** حفظ من الـ Onboarding: ملف الشخصي + خطة فاضية بعدد الأيام (سلوك الأصلي) */
  const saveOnboarding = (p: UserProfile, plan: WorkoutDay[]) => {
    setProfile(p);
    setDays(plan);
    setEditingProfile(false);
  };

  const toastEl = toast ? <div className="toast">{toast}</div> : null;
  const themeModalEl = (
    <ThemeModal
      open={showTheme}
      theme={theme}
      onPick={t => { setTheme(t); setShowTheme(false); setToast("اتغيّر الثيم ✨"); }}
      onClose={() => setShowTheme(false)}
    />
  );
  const settingsModalEl = showSettings ? (
    <SettingsModal
      profile={profile}
      onEditProfile={() => setEditingProfile(true)}
      onExport={exportData}
      onImportFile={importFile}
      onOpenTheme={() => setShowTheme(true)}
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
        <WorkoutSession api={api} unit={profile.weightUnit} onFinish={finishSession} />
        {toastEl}
      </div>
    );
  }

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
        <ScheduleTab
          profile={profile}
          setPlan={savePlan}
          goToHome={() => setCurrentPage("Home")}
          onToast={onToast}
          onOpenTheme={() => setShowTheme(true)}
        />
      )}
      {currentPage === "Progress" && (
        <ProgressTab logs={logs} profile={profile} onOpenTheme={() => setShowTheme(true)} />
      )}
      {currentPage === "AI" && <AITab />}

      <NavBar page={currentPage} onGo={setCurrentPage} />
      {themeModalEl}
      {settingsModalEl}
      {toastEl}
    </div>
  );
}
