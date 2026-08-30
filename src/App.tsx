import React, { useState, useEffect } from "react";

type Page = "Home" | "Schedule" | "Nutrition" | "AI";

interface UserProfile {
  name: string;
  age: number;
  weight: number;
  weightUnit: "kg" | "lbs";
  height: number;
  heightUnit: "cm" | "ft";
  goal: string;
  targetWeight: number;
  level: string;
  daysPerWeek: number;
  equipment: string[];
}

interface Exercise {
  id: string;
  name: string;
  muscle: string;
  icon: string;
  sets: number;
  reps: number;
}

interface WorkoutDay {
  id: string;
  label: string;
  exercises: Exercise[];
}

const MUSCLE_ICONS: Record<string, string> = {
  Chest: "🫁",
  Back: "🔙",
  Shoulders: "💪",
  Biceps: "💪",
  Triceps: "🦾",
  Quads: "🦵",
  Hamstrings: "🦵",
  Glutes: "🍑",
  Calves: "🦵",
  Abs: "🧱",
  Obliques: "🧱",
  Forearms: "🤲",
  Traps: "🏔️",
  "Rear Delt": "🎯",
  "Side Delt": "🎯",
  "Front Delt": "🎯",
  Lats: "🔙",
  "Mid Back": "🔙",
  "Lower Back": "🔙",
  "Upper Abs": "🧱",
  "Lower Abs": "🧱",
};

const EXERCISE_LIBRARY: Omit<Exercise, "id">[] = [
  { name: "Barbell Bench Press", muscle: "Chest", icon: " bench-press ", sets: 4, reps: 8 },
  { name: "Incline Dumbbell Press", muscle: "Chest", icon: " incline-db ", sets: 3, reps: 10 },
  { name: "Cable Fly", muscle: "Chest", icon: " cable-fly ", sets: 3, reps: 12 },
  { name: "Push-ups", muscle: "Chest", icon: " pushup ", sets: 3, reps: 15 },
  { name: "Dumbbell Rows", muscle: "Back", icon: " db-row ", sets: 4, reps: 10 },
  { name: "Lat Pulldown", muscle: "Back", icon: " lat-pull ", sets: 3, reps: 12 },
  { name: "Pull-ups", muscle: "Back", icon: " pullup ", sets: 3, reps: 8 },
  { name: "Seated Cable Row", muscle: "Back", icon: " cable-row ", sets: 3, reps: 12 },
  { name: "Overhead Press", muscle: "Shoulders", icon: " ohp ", sets: 4, reps: 8 },
  { name: "Lateral Raise", muscle: "Side Delt", icon: " lat-raise ", sets: 3, reps: 15 },
  { name: "Front Raise", muscle: "Front Delt", icon: " front-raise ", sets: 3, reps: 12 },
  { name: "Face Pull", muscle: "Rear Delt", icon: " face-pull ", sets: 3, reps: 15 },
  { name: "Barbell Curl", muscle: "Biceps", icon: " curl ", sets: 3, reps: 10 },
  { name: "Hammer Curl", muscle: "Biceps", icon: " hammer ", sets: 3, reps: 12 },
  { name: "Preacher Curl", muscle: "Biceps", icon: " preacher ", sets: 3, reps: 10 },
  { name: "Tricep Pushdown", muscle: "Triceps", icon: " pushdown ", sets: 3, reps: 12 },
  { name: "Skull Crushers", muscle: "Triceps", icon: " skull ", sets: 3, reps: 10 },
  { name: "Overhead Extension", muscle: "Triceps", icon: " overhead-tri ", sets: 3, reps: 12 },
  { name: "Barbell Squat", muscle: "Quads", icon: " squat ", sets: 4, reps: 8 },
  { name: "Leg Press", muscle: "Quads", icon: " leg-press ", sets: 3, reps: 12 },
  { name: "Leg Extension", muscle: "Quads", icon: " leg-ext ", sets: 3, reps: 15 },
  { name: "Romanian Deadlift", muscle: "Hamstrings", icon: " rdl ", sets: 4, reps: 8 },
  { name: "Leg Curl", muscle: "Hamstrings", icon: " leg-curl ", sets: 3, reps: 12 },
  { name: "Hip Thrust", muscle: "Glutes", icon: " hip-thrust ", sets: 3, reps: 12 },
  { name: "Bulgarian Split Squat", muscle: "Glutes", icon: " bulgarian ", sets: 3, reps: 10 },
  { name: "Calf Raise", muscle: "Calves", icon: " calf-raise ", sets: 4, reps: 15 },
  { name: "Crunches", muscle: "Abs", icon: " crunch ", sets: 3, reps: 20 },
  { name: "Hanging Leg Raise", muscle: "Abs", icon: " leg-raise ", sets: 3, reps: 12 },
  { name: "Plank", muscle: "Abs", icon: " plank ", sets: 3, reps: 60 },
  { name: "Russian Twist", muscle: "Obliques", icon: " russian ", sets: 3, reps: 20 },
  { name: "Farmer's Walk", muscle: "Forearms", icon: " farmer ", sets: 3, reps: 40 },
  { name: "Barbell Shrug", muscle: "Traps", icon: " shrug ", sets: 3, reps: 12 },
];

const uid = () => Math.random().toString(36).slice(2, 10);

const STORAGE_KEY = "gym-profile-v2";
const PLAN_KEY = "gym-plan-v2";

const defaultPlan = (): WorkoutDay[] => [
  { id: uid(), label: "Day 1 — Push", exercises: [] },
  { id: uid(), label: "Day 2 — Pull", exercises: [] },
  { id: uid(), label: "Day 3 — Legs", exercises: [] },
];

const buildEx = (lib: Omit<Exercise, "id">): Exercise => ({ ...lib, id: uid() });

interface IconProps { size?: number; }

const PlusIcon: React.FC<IconProps> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const EditIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const ChevronDown: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const XIcon: React.FC<IconProps> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MinusIcon: React.FC<IconProps> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SettingsIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const GridIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);

const CalendarIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const BarChartIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="20" x2="6" y2="12" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="18" y1="20" x2="18" y2="15" />
  </svg>
);

const ChatIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const navItems: { page: Page; Icon: React.FC<IconProps> }[] = [
  { page: "Home", Icon: GridIcon },
  { page: "Schedule", Icon: CalendarIcon },
  { page: "Nutrition", Icon: BarChartIcon },
  { page: "AI", Icon: ChatIcon },
];

const placeholderPages: Record<Page, string> = {
  Nutrition: "Nutrition Page",
  Home: "Home",
  Schedule: "Schedule Page",
  AI: "AI Assistant",
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>("Home");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  const [obStep, setObStep] = useState(1);
  const [obName, setObName] = useState("");
  const [obAge, setObAge] = useState<number | "">("");
  const [obWeight, setObWeight] = useState<number | "">("");
  const [obWeightUnit, setObWeightUnit] = useState<"kg" | "lbs">("lbs");
  const [obHeight, setObHeight] = useState<number | "">("");
  const [obHeightUnit, setObHeightUnit] = useState<"cm" | "ft">("cm");
  const [goal, setGoal] = useState("");
  const [targetWeight, setTargetWeight] = useState<number | "">("");
  const [level, setLevel] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [error, setError] = useState("");

  const [days, setDays] = useState<WorkoutDay[]>(defaultPlan);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<{ dayId: string; ex: Exercise } | null>(null);
  const [editSets, setEditSets] = useState(3);
  const [editReps, setEditReps] = useState(12);
  const [pickerDayId, setPickerDayId] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerFilter, setPickerFilter] = useState("All");
  const [newDayLabel, setNewDayLabel] = useState("");
  const [showAddDay, setShowAddDay] = useState(false);
  const [renamingDay, setRenamingDay] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    try {
      const p = localStorage.getItem(STORAGE_KEY);
      if (p) { setProfile(JSON.parse(p)); setHasProfile(true); }
    } catch { /* ignore */ }
    try {
      const d = localStorage.getItem(PLAN_KEY);
      if (d) setDays(JSON.parse(d));
    } catch { /* ignore */ }
  }, []);

  const savePlan = (d: WorkoutDay[]) => { setDays(d); localStorage.setItem(PLAN_KEY, JSON.stringify(d)); };

  const toggleEquipment = (item: string) =>
    setEquipment(p => p.includes(item) ? p.filter(i => i !== item) : [...p, item]);

  const handleObNext = () => setObStep(s => Math.min(4, s + 1));
  const handleObBack = () => setObStep(s => Math.max(1, s - 1));

  const handleObStart = () => {
    if (!obName.trim() || obAge === "" || obWeight === "" || obHeight === "" || !goal || !level || !daysPerWeek || equipment.length === 0 || targetWeight === "") {
      setError("Please complete all steps."); return;
    }
    const p: UserProfile = {
      name: obName.trim(), age: Number(obAge), weight: Number(obWeight), weightUnit: obWeightUnit,
      height: Number(obHeight), heightUnit: obHeightUnit, goal, targetWeight: Number(targetWeight),
      level, daysPerWeek, equipment,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setProfile(p); setHasProfile(true); setEditingProfile(false); setError(""); setObStep(1);

    const newDays: WorkoutDay[] = Array.from({ length: daysPerWeek }, (_, i) => ({
      id: uid(), label: `Day ${i + 1}`, exercises: [],
    }));
    savePlan(newDays);
  };

  const openSettings = () => {
    if (profile) {
      setObName(profile.name); setObAge(profile.age); setObWeight(profile.weight);
      setObWeightUnit(profile.weightUnit); setObHeight(profile.height);
      setObHeightUnit(profile.heightUnit); setGoal(profile.goal);
      setTargetWeight(profile.targetWeight); setLevel(profile.level);
      setDaysPerWeek(profile.daysPerWeek); setEquipment([...profile.equipment]);
    }
    setError(""); setObStep(1); setEditingProfile(true);
  };

  const step1Valid = obName.trim().length > 0;
  const step2Valid = obAge !== "" && Number(obAge) > 0 && obWeight !== "" && Number(obWeight) > 0 && obHeight !== "" && Number(obHeight) > 0;
  const step3Valid = !!goal && !!level && !!daysPerWeek && equipment.length > 0 && targetWeight !== "" && Number(targetWeight) > 0;

  const addExerciseToDay = (dayId: string, libEx: Omit<Exercise, "id">) => {
    setDays(prev => {
      const next = prev.map(d => d.id === dayId ? { ...d, exercises: [...d.exercises, buildEx(libEx)] } : d);
      localStorage.setItem(PLAN_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeExercise = (dayId: string, exId: string) => {
    setDays(prev => {
      const next = prev.map(d => d.id === dayId ? { ...d, exercises: d.exercises.filter(e => e.id !== exId) } : d);
      localStorage.setItem(PLAN_KEY, JSON.stringify(next));
      return next;
    });
  };

  const saveExerciseEdit = () => {
    if (!editingExercise) return;
    setDays(prev => {
      const next = prev.map(d => d.id === editingExercise.dayId
        ? { ...d, exercises: d.exercises.map(e => e.id === editingExercise.ex.id ? { ...e, sets: editSets, reps: editReps } : e) }
        : d);
      localStorage.setItem(PLAN_KEY, JSON.stringify(next));
      return next;
    });
    setEditingExercise(null);
  };

  const addDay = () => {
    if (!newDayLabel.trim()) return;
    const next = [...days, { id: uid(), label: newDayLabel.trim(), exercises: [] }];
    savePlan(next); setNewDayLabel(""); setShowAddDay(false);
  };

  const removeDay = (dayId: string) => {
    savePlan(days.filter(d => d.id !== dayId));
    if (expandedDay === dayId) setExpandedDay(null);
  };

  const startRename = (dayId: string, currentLabel: string) => {
    setRenamingDay(dayId); setRenameValue(currentLabel);
  };

  const confirmRename = () => {
    if (!renamingDay || !renameValue.trim()) return;
    savePlan(days.map(d => d.id === renamingDay ? { ...d, label: renameValue.trim() } : d));
    setRenamingDay(null);
  };

  const filteredLibrary = EXERCISE_LIBRARY.filter(e => {
    if (pickerFilter !== "All" && e.muscle !== pickerFilter) return false;
    if (pickerSearch && !e.name.toLowerCase().includes(pickerSearch.toLowerCase())) return false;
    return true;
  });

  const muscleFilters = ["All", ...Array.from(new Set(EXERCISE_LIBRARY.map(e => e.muscle)))];

  const totalExercises = days.reduce((s, d) => s + d.exercises.length, 0);

  // ===== Onboarding =====
  if (editingProfile || !hasProfile) {
    return (
      <div className="onboarding">
        <div className="ob-topbar">
          {obStep > 1 ? (
            <button className="ob-back-btn" onClick={handleObBack}><span className="arrow-l">‹</span></button>
          ) : <span className="ob-topbar-spacer" />}
          <div className="ob-progress">
            {[1, 2, 3, 4].map(s => <span key={s} className={`ob-dot ${s <= obStep ? "ob-dot-active" : ""}`} />)}
          </div>
          {editingProfile
            ? <button className="ob-cancel-btn" onClick={() => setEditingProfile(false)}>Cancel</button>
            : <span className="ob-topbar-spacer" />}
        </div>

        <div className="ob-content" key={obStep}>
          {obStep === 1 && (
            <>
              <h1 className="ob-question">What's your name?</h1>
              <input className="field-input ob-name-input" type="text" value={obName}
                onChange={e => setObName(e.target.value)} placeholder="Your name" autoFocus />
            </>
          )}
          {obStep === 2 && (
            <>
              <h1 className="ob-question">Tell us about yourself</h1>
              <div className="ob-field-group">
                <label className="ob-field-label">Age</label>
                <input className="field-input" type="number" inputMode="numeric" value={obAge}
                  onChange={e => setObAge(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Years" />
              </div>
              <div className="ob-field-group">
                <div className="ob-field-label-row">
                  <label className="ob-field-label">Weight</label>
                  <div className="unit-toggle">
                    <button type="button" className={obWeightUnit === "lbs" ? "unit-btn unit-btn-active" : "unit-btn"} onClick={() => setObWeightUnit("lbs")}>lbs</button>
                    <button type="button" className={obWeightUnit === "kg" ? "unit-btn unit-btn-active" : "unit-btn"} onClick={() => setObWeightUnit("kg")}>kg</button>
                  </div>
                </div>
                <input className="field-input" type="number" inputMode="numeric" value={obWeight}
                  onChange={e => setObWeight(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Weight" />
              </div>
              <div className="ob-field-group">
                <div className="ob-field-label-row">
                  <label className="ob-field-label">Height</label>
                  <div className="unit-toggle">
                    <button type="button" className={obHeightUnit === "cm" ? "unit-btn unit-btn-active" : "unit-btn"} onClick={() => setObHeightUnit("cm")}>cm</button>
                    <button type="button" className={obHeightUnit === "ft" ? "unit-btn unit-btn-active" : "unit-btn"} onClick={() => setObHeightUnit("ft")}>ft</button>
                  </div>
                </div>
                <input className="field-input" type="number" inputMode="numeric" value={obHeight}
                  onChange={e => setObHeight(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Height" />
              </div>
            </>
          )}
          {obStep === 3 && (
            <>
              <h1 className="ob-question">What's your goal?</h1>
              {["Cutting", "Bulking", "General Fitness"].map(opt => (
                <label key={opt} className={`option ${goal === opt ? "option-selected" : ""}`}>
                  <input type="radio" name="goal" checked={goal === opt} onChange={() => setGoal(opt)} /><span>{opt}</span>
                </label>
              ))}
              <div className="ob-field-group">
                <label className="ob-field-label">Target weight ({obWeightUnit})</label>
                <input className="field-input" type="number" inputMode="numeric" value={targetWeight}
                  onChange={e => setTargetWeight(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Target weight" />
              </div>
              <h2 className="question-title ob-subheading">Experience level?</h2>
              {["Beginner", "Intermediate", "Advanced"].map(opt => (
                <label key={opt} className={`option ${level === opt ? "option-selected" : ""}`}>
                  <input type="radio" name="level" checked={level === opt} onChange={() => setLevel(opt)} /><span>{opt}</span>
                </label>
              ))}
              <h2 className="question-title ob-subheading">Days per week?</h2>
              <div className="day-btn-row">
                {[2, 3, 4, 5, 6].map(d => (
                  <button key={d} type="button" onClick={() => setDaysPerWeek(d)}
                    className={`day-btn ${daysPerWeek === d ? "day-btn-active" : ""}`}>{d}</button>
                ))}
              </div>
              <h2 className="question-title ob-subheading">Equipment?</h2>
              {["Full Gym", "Dumbbells", "Barbell", "Bodyweight Only"].map(item => (
                <label key={item} className={`option ${equipment.includes(item) ? "option-selected" : ""}`}>
                  <input type="checkbox" checked={equipment.includes(item)} onChange={() => toggleEquipment(item)} /><span>{item}</span>
                </label>
              ))}
            </>
          )}
          {obStep === 4 && (
            <div className="ob-summary">
              <h1 className="ob-question">You're all set{obName ? `, ${obName}` : ""}!</h1>
              <div className="card summary-card">
                <div className="summary-row"><span className="summary-label">Goal</span><span className="summary-value">{goal}</span></div>
                <div className="summary-row"><span className="summary-label">Target</span><span className="summary-value">{targetWeight}{obWeightUnit}</span></div>
                <div className="summary-row"><span className="summary-label">Level</span><span className="summary-value">{level}</span></div>
                <div className="summary-row"><span className="summary-label">Training</span><span className="summary-value">{daysPerWeek} days/week</span></div>
              </div>
            </div>
          )}
        </div>

        {error && <div className="error-box ob-error">{error}</div>}

        <div className="bottom-bar">
          {obStep < 4 ? (
            <button className="continue-btn"
              disabled={obStep === 1 ? !step1Valid : obStep === 2 ? !step2Valid : !step3Valid}
              onClick={handleObNext}>Next</button>
          ) : (
            <button className="continue-btn" onClick={handleObStart}>
              {editingProfile ? "Save" : "Start"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ===== Main App =====
  if (currentPage !== "Home") {
    return (
      <div className="app">
        <div className="placeholder">
          <div className="card placeholder-card">
            <p className="placeholder-text">{placeholderPages[currentPage]}</p>
          </div>
        </div>
        <nav className="bottom-nav">
          <div className="nav-inner">
            {navItems.map(({ page, Icon }) => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`nav-item ${currentPage === page ? "nav-active" : "nav-inactive"}`}>
                <span className={`nav-icon-wrap ${currentPage === page ? "nav-icon-active" : ""}`}><Icon size={20} /></span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header sticky dash-header">
        <div className="dash-header-row">
          <div>
            <h1 className="dash-title">My Workouts</h1>
            <p className="dash-sub">{totalExercises} exercises across {days.length} days</p>
          </div>
          <div className="dash-header-actions">
            <button className="icon-btn-circle" onClick={openSettings}><SettingsIcon size={18} /></button>
          </div>
        </div>
      </header>

      <main className="main dash-main">
        {days.map(day => {
          const isExpanded = expandedDay === day.id;
          const exCount = day.exercises.length;
          const muscles = [...new Set(day.exercises.map(e => e.muscle))].slice(0, 3).join(", ");

          return (
            <div key={day.id} className={`day-card ${isExpanded ? "day-card-open" : ""}`}>
              {renamingDay === day.id ? (
                <div className="day-rename-row">
                  <input className="field-input day-rename-input" value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && confirmRename()}
                    autoFocus onBlur={confirmRename} />
                </div>
              ) : (
                <button className="day-card-header" onClick={() => setExpandedDay(isExpanded ? null : day.id)}>
                  <div className="day-card-left">
                    <div className={`day-card-icon ${isExpanded ? "day-card-icon-open" : ""}`}>
                      <ChevronDown size={18} />
                    </div>
                    <div>
                      <h3 className="day-card-title">{day.label}</h3>
                      <p className="day-card-meta">{exCount > 0 ? `${exCount} exercises · ${muscles}` : "No exercises yet"}</p>
                    </div>
                  </div>
                  <div className="day-card-actions" onClick={e => e.stopPropagation()}>
                    <button className="day-action-btn" onClick={() => startRename(day.id, day.label)} title="Rename">
                      <EditIcon size={14} />
                    </button>
                    <button className="day-action-btn day-action-danger" onClick={() => removeDay(day.id)} title="Delete day">
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </button>
              )}

              {isExpanded && (
                <div className="day-card-body">
                  {day.exercises.length === 0 ? (
                    <p className="day-empty">Tap + to add exercises</p>
                  ) : (
                    <div className="ex-list">
                      {day.exercises.map((ex, i) => (
                        <div key={ex.id} className="ex-row">
                          <div className="ex-num">{i + 1}</div>
                          <div className="ex-icon">{MUSCLE_ICONS[ex.muscle] || "🏋️"}</div>
                          <div className="ex-info">
                            <p className="ex-name">{ex.name}</p>
                            <p className="ex-muscle">{ex.muscle}</p>
                          </div>
                          <div className="ex-sets">{ex.sets}×{ex.reps}</div>
                          <div className="ex-row-actions">
                            <button className="ex-action" onClick={() => { setEditingExercise({ dayId: day.id, ex }); setEditSets(ex.sets); setEditReps(ex.reps); }}>
                              <EditIcon size={14} />
                            </button>
                            <button className="ex-action ex-action-danger" onClick={() => removeExercise(day.id, ex.id)}>
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="add-exercise-btn" onClick={() => { setPickerDayId(day.id); setPickerSearch(""); setPickerFilter("All"); }}>
                    <PlusIcon size={16} /> Add Exercise
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {showAddDay ? (
          <div className="add-day-row">
            <input className="field-input day-rename-input" placeholder="Day label (e.g. Day 4 — Arms)"
              value={newDayLabel} onChange={e => setNewDayLabel(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addDay()} autoFocus />
            <div className="add-day-btns">
              <button className="btn-save" onClick={addDay}>Add</button>
              <button className="btn-cancel" onClick={() => { setShowAddDay(false); setNewDayLabel(""); }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="add-day-card" onClick={() => setShowAddDay(true)}>
            <PlusIcon size={22} /> <span>Add New Day</span>
          </button>
        )}
      </main>

      {editingExercise && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setEditingExercise(null)} />
          <div className="modal-sheet">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Edit Exercise</h3>
                <p className="modal-sub">{editingExercise.ex.name}</p>
              </div>
              <button className="close-btn" onClick={() => setEditingExercise(null)}><XIcon size={22} /></button>
            </div>
            <div className="edit-fields">
              <div className="edit-field">
                <label className="ob-field-label">Sets</label>
                <div className="stepper">
                  <button className="stepper-btn" onClick={() => setEditSets(s => Math.max(1, s - 1))}><MinusIcon /></button>
                  <span className="stepper-label">{editSets}</span>
                  <button className="stepper-btn" onClick={() => setEditSets(s => Math.min(20, s + 1))}><PlusIcon size={14} /></button>
                </div>
              </div>
              <div className="edit-field">
                <label className="ob-field-label">Reps</label>
                <div className="stepper">
                  <button className="stepper-btn" onClick={() => setEditReps(r => Math.max(1, r - 1))}><MinusIcon /></button>
                  <span className="stepper-label">{editReps}</span>
                  <button className="stepper-btn" onClick={() => setEditReps(r => Math.min(100, r + 1))}><PlusIcon size={14} /></button>
                </div>
              </div>
            </div>
            <button className="btn-save modal-save" onClick={saveExerciseEdit}>Save</button>
          </div>
        </div>
      )}

      {pickerDayId && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setPickerDayId(null)} />
          <div className="modal-sheet">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Add Exercise</h3>
                <p className="modal-sub">{days.find(d => d.id === pickerDayId)?.label}</p>
              </div>
              <button className="close-btn" onClick={() => setPickerDayId(null)}><XIcon size={22} /></button>
            </div>

            <input className="field-input picker-search" placeholder="Search exercises..."
              value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} />

            <div className="picker-filters">
              {muscleFilters.map(f => (
                <button key={f} className={`picker-filter ${pickerFilter === f ? "picker-filter-active" : ""}`}
                  onClick={() => setPickerFilter(f)}>{f}</button>
              ))}
            </div>

            <div className="picker-list">
              {filteredLibrary.map((ex, i) => (
                <button key={i} className="picker-item" onClick={() => addExerciseToDay(pickerDayId, ex)}>
                  <div className="ex-icon">{MUSCLE_ICONS[ex.muscle] || "🏋️"}</div>
                  <div className="picker-item-info">
                    <p className="ex-name">{ex.name}</p>
                    <p className="ex-muscle">{ex.muscle} · {ex.sets}×{ex.reps}</p>
                  </div>
                  <div className="picker-item-add"><PlusIcon size={16} /></div>
                </button>
              ))}
              {filteredLibrary.length === 0 && <p className="day-empty">No exercises found</p>}
            </div>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        <div className="nav-inner">
          {navItems.map(({ page, Icon }) => (
            <button key={page} onClick={() => setCurrentPage(page)}
              className={`nav-item ${currentPage === page ? "nav-active" : "nav-inactive"}`}>
              <span className={`nav-icon-wrap ${currentPage === page ? "nav-icon-active" : ""}`}><Icon size={20} /></span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
