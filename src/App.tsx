import React, { useState, useEffect } from "react";

type Page = "Home" | "Schedule" | "Progress" | "AI";

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
  weight?: number;
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

/* ===== Anatomical muscle diagrams (wger, open source) =====
   كل صورة = جسم تشريحي رمادي + العضلة المستهدفة بالأحمر (بنعمل zoom على العضلة) */
const EXERCISE_PHOTOS: Record<string, string> = {
  "Barbell Bench Press": "Barbell_Bench_Press_-_Medium_Grip/0.jpg",
  "Incline Dumbbell Press": "Incline_Dumbbell_Press/0.jpg",
  "Cable Fly": "Flat_Bench_Cable_Flyes/0.jpg",
  "Push-ups": "Pushups/0.jpg",
  "Dumbbell Rows": "Bent_Over_Two-Dumbbell_Row/0.jpg",
  "Lat Pulldown": "Wide-Grip_Lat_Pulldown/0.jpg",
  "Pull-ups": "Pullups/0.jpg",
  "Seated Cable Row": "Seated_Cable_Rows/0.jpg",
  "Overhead Press": "Standing_Military_Press/0.jpg",
  "Lateral Raise": "Side_Lateral_Raise/0.jpg",
  "Front Raise": "Front_Dumbbell_Raise/0.jpg",
  "Face Pull": "Face_Pull/0.jpg",
  "Barbell Curl": "Barbell_Curl/0.jpg",
  "Hammer Curl": "Hammer_Curls/0.jpg",
  "Preacher Curl": "Preacher_Curl/0.jpg",
  "Tricep Pushdown": "Triceps_Pushdown/0.jpg",
  "Skull Crushers": "EZ-Bar_Skullcrusher/0.jpg",
  "Overhead Extension": "Cable_Rope_Overhead_Triceps_Extension/0.jpg",
  "Barbell Squat": "Barbell_Squat/0.jpg",
  "Leg Press": "Leg_Press/0.jpg",
  "Leg Extension": "Leg_Extensions/0.jpg",
  "Romanian Deadlift": "Romanian_Deadlift/0.jpg",
  "Leg Curl": "Lying_Leg_Curls/0.jpg",
  "Hip Thrust": "Barbell_Hip_Thrust/0.jpg",
  "Bulgarian Split Squat": "Split_Squat_with_Dumbbells/0.jpg",
  "Calf Raise": "Standing_Calf_Raises/0.jpg",
  "Crunches": "Crunches/0.jpg",
  "Hanging Leg Raise": "Hanging_Leg_Raise/0.jpg",
  "Plank": "Plank/0.jpg",
  "Russian Twist": "Russian_Twist/0.jpg",
  "Farmer's Walk": "Farmers_Walk/0.jpg",
  "Barbell Shrug": "Barbell_Shrug/0.jpg",
};

const PHOTO_BASE = "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/";

const MUSCLE_IMG_BASE = "https://wger.de/static/images/muscles/";
const BODY_IMG = {
  front: MUSCLE_IMG_BASE + "muscular_system_front.svg",
  back: MUSCLE_IMG_BASE + "muscular_system_back.svg",
};

interface MuscleArt { f: string; x: number; y: number; z: number; back?: boolean }

const MUSCLE_IMG: Record<string, MuscleArt> = {
  Chest: { f: "main/muscle-4.c9fa9a228bc8.svg", x: 50, y: 25, z: 2.6 },
  Back: { f: "main/muscle-12.6a5de7a0e373.svg", x: 50, y: 34, z: 2.2, back: true },
  Lats: { f: "main/muscle-12.6a5de7a0e373.svg", x: 50, y: 34, z: 2.2, back: true },
  "Mid Back": { f: "main/muscle-12.6a5de7a0e373.svg", x: 50, y: 34, z: 2.2, back: true },
  "Lower Back": { f: "main/muscle-9.b491050a7108.svg", x: 50, y: 30, z: 2.1, back: true },
  Shoulders: { f: "main/muscle-2.e1e1205a3202.svg", x: 57, y: 24, z: 2.4 },
  "Side Delt": { f: "main/muscle-2.e1e1205a3202.svg", x: 57, y: 24, z: 2.4 },
  "Front Delt": { f: "main/muscle-2.e1e1205a3202.svg", x: 57, y: 24, z: 2.4 },
  "Rear Delt": { f: "main/muscle-2.e1e1205a3202.svg", x: 57, y: 24, z: 2.4, back: true },
  Biceps: { f: "main/muscle-1.8790f8a0b3b9.svg", x: 60, y: 31, z: 2.4 },
  Triceps: { f: "main/muscle-5.8a2b934b5486.svg", x: 60, y: 31, z: 2.4, back: true },
  Forearms: { f: "main/muscle-13.3fd85231b089.svg", x: 59, y: 32, z: 2.5 },
  Quads: { f: "main/muscle-10.b1445ea1acf6.svg", x: 50, y: 60, z: 2.1 },
  Hamstrings: { f: "main/muscle-11.54ef31755917.svg", x: 50, y: 66, z: 2.1, back: true },
  Glutes: { f: "main/muscle-8.fbdfb46f3bc0.svg", x: 50, y: 54, z: 2.0, back: true },
  Calves: { f: "main/muscle-7.edbd8c381b0c.svg", x: 50, y: 84, z: 1.9, back: true },
  Abs: { f: "main/muscle-6.592f938fa8c7.svg", x: 50, y: 41, z: 2.3 },
  "Upper Abs": { f: "main/muscle-6.592f938fa8c7.svg", x: 50, y: 39, z: 2.4 },
  "Lower Abs": { f: "main/muscle-6.592f938fa8c7.svg", x: 50, y: 44, z: 2.4 },
  Obliques: { f: "main/muscle-14.153978038d0b.svg", x: 50, y: 40, z: 2.3 },
  Traps: { f: "main/muscle-9.b491050a7108.svg", x: 50, y: 22, z: 2.2, back: true },
};

/* ===== Themes ===== */
type ThemeKey = "mono" | "emerald" | "orange" | "violet" | "cyan" | "rose";
const THEME_KEY = "gym-theme-v1";
const THEMES: { key: ThemeKey; label: string; swatch: string }[] = [
  { key: "mono", label: "Dark", swatch: "#f5f6f7" },
  { key: "emerald", label: "Emerald", swatch: "#22c55e" },
  { key: "orange", label: "Sunset", swatch: "#f97316" },
  { key: "violet", label: "Violet", swatch: "#8b5cf6" },
  { key: "cyan", label: "Ice", swatch: "#06b6d4" },
  { key: "rose", label: "Rose", swatch: "#f43f5e" },
];

/* ===== Workout logging ===== */
const LOG_KEY = "gym-logs-v1";

interface LoggedExercise {
  name: string;
  muscle: string;
  sets: number;
  reps: number;
  weight: number;
}
interface WorkoutLog {
  id: string;
  date: string;
  dayId: string;
  dayLabel: string;
  exercises: LoggedExercise[];
  volume: number;
  duration?: number;
  rest?: number;
}

interface SessionItem {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: number;
  weight: number;
  doneSets: number;
}

interface SessionState {
  dayId: string;
  label: string;
  startedAt: number;
  restSec: number;
  items: SessionItem[];
  currentIdx: number;
  restLeft: number | null;
}

const REST_SECONDS = 90;

const todayKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const monthLabel = (y: number, m: number) => `${AR_MONTHS[m]} ${y}`;

const fmtDate = (iso: string) => {
  const parts = iso.split("-").map(Number);
  const d = parts[2] || 1;
  const m = (parts[1] || 1) - 1;
  return `${d} ${AR_MONTHS[m]}`;
};

const fmtClock = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const defaultPlan = (): WorkoutDay[] => [
  { id: uid(), label: "Day 1 — Push", exercises: [] },
  { id: uid(), label: "Day 2 — Pull", exercises: [] },
  { id: uid(), label: "Day 3 — Legs", exercises: [] },
];

interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  level: string;
  days: number;
  split: string;
  daysPlan: { label: string; muscles: string[] }[];
}

const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "ppl",
    name: "Push / Pull / Legs",
    description: "كلاسيكي جداً وفعال جداً، مناسب لمعظم الناس",
    level: "Intermediate",
    days: 3,
    split: "PPL",
    daysPlan: [
      { label: "Day 1 — Push (Chest/Shoulders/Triceps)", muscles: ["Chest", "Shoulders", "Side Delt", "Front Delt", "Triceps"] },
      { label: "Day 2 — Pull (Back/Biceps)", muscles: ["Back", "Lats", "Mid Back", "Rear Delt", "Biceps", "Traps"] },
      { label: "Day 3 — Legs (Quads/Hamstrings/Glutes/Calves)", muscles: ["Quads", "Hamstrings", "Glutes", "Calves", "Abs"] },
    ],
  },
  {
    id: "fullbody3",
    name: "Full Body 3x/Week",
    description: "مثالي للمبتدئين، يركز على كل عضلات الجسم ٣ مرات أسبوعياً",
    level: "Beginner",
    days: 3,
    split: "Full Body",
    daysPlan: [
      { label: "Day 1 — Full Body A", muscles: ["Chest", "Back", "Quads", "Shoulders", "Abs"] },
      { label: "Day 2 — Full Body B", muscles: ["Quads", "Hamstrings", "Glutes", "Back", "Triceps", "Biceps"] },
      { label: "Day 3 — Full Body C", muscles: ["Chest", "Lats", "Hamstrings", "Shoulders", "Abs", "Calves"] },
    ],
  },
  {
    id: "upperlower4",
    name: "Upper / Lower 4x/Week",
    description: "توازن ممتاز بين الحجم والتعافي، مناسب للمتوسط",
    level: "Intermediate",
    days: 4,
    split: "Upper/Lower",
    daysPlan: [
      { label: "Day 1 — Upper Body", muscles: ["Chest", "Back", "Shoulders", "Biceps", "Triceps"] },
      { label: "Day 2 — Lower Body", muscles: ["Quads", "Hamstrings", "Glutes", "Calves", "Abs"] },
      { label: "Day 3 — Upper Body Focus", muscles: ["Chest", "Lats", "Rear Delt", "Side Delt", "Biceps", "Triceps"] },
      { label: "Day 4 — Lower Body Focus", muscles: ["Quads", "Hamstrings", "Glutes", "Calves", "Obliques"] },
    ],
  },
  {
    id: "fullbody2",
    name: "Full Body 2x/Week",
    description: "خفيف جداً، ممتاز لو وقتك ضيق أو لسه مبتدئ",
    level: "Beginner",
    days: 2,
    split: "Full Body",
    daysPlan: [
      { label: "Day 1 — Full Body", muscles: ["Chest", "Back", "Quads", "Shoulders", "Triceps", "Biceps", "Abs"] },
      { label: "Day 2 — Full Body", muscles: ["Hamstrings", "Glutes", "Lats", "Shoulders", "Triceps", "Biceps", "Calves"] },
    ],
  },
  {
    id: "bro",
    name: "Classic Bro Split 5x/Week",
    description: "كل عضلة يوم لوحدها، يركز جداً على كل عضلة",
    level: "Advanced",
    days: 5,
    split: "Body Part",
    daysPlan: [
      { label: "Day 1 — Chest", muscles: ["Chest"] },
      { label: "Day 2 — Back", muscles: ["Back", "Lats", "Mid Back"] },
      { label: "Day 3 — Shoulders", muscles: ["Shoulders", "Front Delt", "Side Delt", "Rear Delt", "Traps"] },
      { label: "Day 4 — Arms", muscles: ["Biceps", "Triceps", "Forearms"] },
      { label: "Day 5 — Legs", muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
    ],
  },
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

const DumbbellIcon: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 6.5v11M3 9v6M17.5 6.5v11M21 9v6M6.5 12h11" />
  </svg>
);

const PaletteIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="8" cy="10" r="1" fill="currentColor" />
    <circle cx="12" cy="7.5" r="1" fill="currentColor" />
    <circle cx="16" cy="10" r="1" fill="currentColor" />
    <path d="M12 22a4 4 0 0 1 0-8 3 3 0 0 0 0-6" opacity=".5" />
  </svg>
);

const PlayIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="6 3 21 12 6 21 6 3" />
  </svg>
);

const CheckIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ExerciseThumb: React.FC<{ name: string; muscle: string; size?: number; mode?: "photo" | "anatomy" }> = ({ name, muscle, size = 46, mode = "photo" }) => {
  const [failedPhoto, setFailedPhoto] = useState(false);
  const [failedArt, setFailedArt] = useState(false);
  const photo = EXERCISE_PHOTOS[name];
  const art = MUSCLE_IMG[muscle];

  if (mode === "anatomy" && art && !failedArt) {
    return (
      <div className="ex-thumb ex-thumb-art" style={{ width: size, height: size }} title={name}>
        <div className="ex-thumb-zoom" style={{ transform: `scale(${art.z})`, transformOrigin: `${art.x}% ${art.y}%` }}>
          <img className="ex-art-body" src={art.back ? BODY_IMG.back : BODY_IMG.front} alt="" loading="lazy" decoding="async" onError={() => setFailedArt(true)} />
          <img className="ex-art-muscle" src={MUSCLE_IMG_BASE + art.f} alt={name} loading="lazy" decoding="async" onError={() => setFailedArt(true)} />
        </div>
      </div>
    );
  }

  if (photo && !failedPhoto) {
    return (
      <div className="ex-thumb" style={{ width: size, height: size }} title={name}>
        <img className="ex-art-photo" src={PHOTO_BASE + photo} alt={name} loading="lazy" decoding="async" onError={() => setFailedPhoto(true)} />
      </div>
    );
  }

  return (
    <div className="ex-icon ex-icon-fallback" style={{ width: size, height: size }}>
      {MUSCLE_ICONS[muscle] || "🏋️"}
    </div>
  );
};

const navItems: { page: Page; Icon: React.FC<IconProps> }[] = [
  { page: "Home", Icon: GridIcon },
  { page: "Schedule", Icon: CalendarIcon },
  { page: "Progress", Icon: BarChartIcon },
  { page: "AI", Icon: ChatIcon },
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>("Home");
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [hasProfile, setHasProfile] = useState(() => {
    try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; }
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

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

  const [theme, setTheme] = useState<ThemeKey>(() => {
    try { return (localStorage.getItem(THEME_KEY) as ThemeKey) || "mono"; } catch { return "mono"; }
  });
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [showTheme, setShowTheme] = useState(false);
  const [toast, setToast] = useState("");
  const [editWeight, setEditWeight] = useState(0);
  const [dayToFinish, setDayToFinish] = useState<WorkoutDay | null>(null);
  const [finishWeights, setFinishWeights] = useState<Record<string, number>>({});
  const [session, setSession] = useState<SessionState | null>(null);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  // ساعة الوضع التدريبي — تحديث كل ثانية
  useEffect(() => {
    if (!session) return;
    const id = window.setInterval(() => {
      setSession(s => {
        if (!s) return s;
        if (s.restLeft && s.restLeft > 0) return { ...s, restLeft: s.restLeft - 1, restSec: s.restSec + 1 };
        return s;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [!!session]);

  useEffect(() => {
    try {
      const p = localStorage.getItem(STORAGE_KEY);
      if (p) { setProfile(JSON.parse(p)); setHasProfile(true); }
    } catch { /* ignore */ }
    try {
      const d = localStorage.getItem(PLAN_KEY);
      if (d) setDays(JSON.parse(d));
    } catch { /* ignore */ }
    try {
      const l = localStorage.getItem(LOG_KEY);
      if (l) setLogs(JSON.parse(l));
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
        ? { ...d, exercises: d.exercises.map(e => e.id === editingExercise.ex.id ? { ...e, sets: editSets, reps: editReps, weight: editWeight } : e) }
        : d);
      localStorage.setItem(PLAN_KEY, JSON.stringify(next));
      return next;
    });
    setEditingExercise(null);
  };

  const applyTemplate = (template: PlanTemplate) => {
    const newDays: WorkoutDay[] = template.daysPlan.map(dp => {
      const picks = EXERCISE_LIBRARY.filter(e => dp.muscles.some(m => e.muscle.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(e.muscle.toLowerCase())));
      const selected = picks.slice(0, template.days <= 3 ? 5 : 4);
      const exs = selected.map(p => buildEx(p));
      return { id: uid(), label: dp.label, exercises: exs };
    });
    savePlan(newDays);
    setExpandedDay(newDays[0]?.id || null);
    setCurrentPage("Home");
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

  /* ===== Logging ===== */
  const saveLogs = (next: WorkoutLog[]) => {
    setLogs(next);
    try { localStorage.setItem(LOG_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const openFinish = (day: WorkoutDay) => {
    const w: Record<string, number> = {};
    day.exercises.forEach(e => { w[e.id] = e.weight || 0; });
    setFinishWeights(w);
    setDayToFinish(day);
  };

  const finishDay = () => {
    if (!dayToFinish) return;
    const logged: LoggedExercise[] = dayToFinish.exercises.map(e => ({
      name: e.name, muscle: e.muscle, sets: e.sets, reps: e.reps, weight: finishWeights[e.id] || 0,
    }));
    const volume = logged.reduce((s, e) => s + e.sets * e.reps * e.weight, 0);
    const entry: WorkoutLog = {
      id: uid(), date: todayKey(), dayId: dayToFinish.id,
      dayLabel: dayToFinish.label, exercises: logged, volume,
    };
    saveLogs([entry, ...logs]);

    // الصق الأوزان الجديدة في الخطة
    savePlan(days.map(d => d.id === dayToFinish.id
      ? { ...d, exercises: d.exercises.map(e => ({ ...e, weight: finishWeights[e.id] || 0 })) }
      : d));

    setDayToFinish(null);
    setToast("تم تسجيل التمرين 💪");
  };

  /* ===== الوضع التدريبي ===== */
  const startSession = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    if (!day) return;
    if (day.exercises.length === 0) { setToast("اليوم ده فاضي — ضيف تمارين الأول"); return; }
    setSession({
      dayId: day.id, label: day.label, startedAt: Date.now(), restSec: 0,
      items: day.exercises.map(e => ({ id: e.id, name: e.name, muscle: e.muscle, sets: e.sets, reps: e.reps, weight: e.weight || 0, doneSets: 0 })),
      currentIdx: 0, restLeft: null,
    });
    setShowDayPicker(false);
    setExpandedDay(null);
  };

  const sessionMarkSet = () => {
    setSession(s => {
      if (!s) return s;
      const items = s.items.map((it, i) => i === s.currentIdx ? { ...it, doneSets: Math.min(it.sets, it.doneSets + 1) } : it);
      return { ...s, items };
    });
  };

  const sessionNext = () => {
    setSession(s => {
      if (!s) return s;
      if (s.currentIdx >= s.items.length - 1) return { ...s, restLeft: null };
      return { ...s, currentIdx: s.currentIdx + 1, restLeft: REST_SECONDS };
    });
  };

  const sessionPrev = () => {
    setSession(s => {
      if (!s) return s;
      if (s.currentIdx === 0) return s;
      return { ...s, currentIdx: s.currentIdx - 1, restLeft: null };
    });
  };

  const finishSession = () => {
    if (!session) return;
    const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
    const logged: LoggedExercise[] = session.items.map(it => ({
      name: it.name, muscle: it.muscle, sets: it.doneSets > 0 ? it.doneSets : it.sets, reps: it.reps, weight: it.weight,
    }));
    const volume = logged.reduce((s, e) => s + e.sets * e.reps * e.weight, 0);
    const entry: WorkoutLog = {
      id: uid(), date: todayKey(), dayId: session.dayId,
      dayLabel: session.label, exercises: logged, volume, duration: elapsed, rest: session.restSec,
    };
    saveLogs([entry, ...logs]);

    // الصق الأوزان الجديدة في الخطة
    savePlan(days.map(d => d.id === session.dayId
      ? { ...d, exercises: d.exercises.map(e => { const it = session.items.find(x => x.id === e.id); return it ? { ...e, weight: it.weight } : e; }) }
      : d));

    setSession(null);
    setToast(`تم التسجيل 💪 ${fmtClock(elapsed)}`);
  };

  /* ===== Stats ===== */
  const monthLogs = logs.filter(l => {
    const [y, m] = l.date.split("-").map(Number);
    return y === calMonth.y && m - 1 === calMonth.m;
  });
  const prevRef = new Date(calMonth.y, calMonth.m - 1, 1);
  const prevLogs = logs.filter(l => {
    const [y, m] = l.date.split("-").map(Number);
    return y === prevRef.getFullYear() && m - 1 === prevRef.getMonth();
  });
  const monthVolume = monthLogs.reduce((s, l) => s + l.volume, 0);
  const prevVolume = prevLogs.reduce((s, l) => s + l.volume, 0);
  const volumeDelta = prevVolume > 0 ? Math.round(((monthVolume - prevVolume) / prevVolume) * 100) : null;
  const weekBuckets = [0, 1, 2, 3, 4].map(w =>
    monthLogs.filter(l => Math.min(4, Math.floor((Number(l.date.slice(8, 10)) - 1) / 7)) === w)
      .reduce((s, l) => s + l.volume, 0)
  );
  const maxWeek = Math.max(1, ...weekBuckets);
  const loggedDates = new Set(monthLogs.map(l => l.date));
  const streak = (() => {
    let count = 0;
    const d = new Date();
    if (!new Set(logs.map(l => l.date)).has(todayKey(d))) d.setDate(d.getDate() - 1);
    const all = new Set(logs.map(l => l.date));
    while (all.has(todayKey(d))) { count++; d.setDate(d.getDate() - 1); }
    return count;
  })();
  const firstDow = new Date(calMonth.y, calMonth.m, 1).getDay();
  const daysInMonth = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
  const shiftMonth = (delta: number) => {
    setCalMonth(prev => {
      const d = new Date(prev.y, prev.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const bestLog = monthLogs.reduce<WorkoutLog | null>((best, l) => (!best || l.volume > best.volume ? l : best), null);
  const favoriteExercise = (() => {
    const counts: Record<string, number> = {};
    monthLogs.forEach(l => l.exercises.forEach(e => { counts[e.name] = (counts[e.name] || 0) + 1; }));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : "";
  })();
  const finishTotal = dayToFinish
    ? dayToFinish.exercises.reduce((s, e) => s + e.sets * e.reps * (finishWeights[e.id] || 0), 0)
    : 0;
  const unit = profile?.weightUnit || "kg";
  const fmtVolume = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`;

  const filteredLibrary = EXERCISE_LIBRARY.filter(e => {
    if (pickerFilter !== "All" && e.muscle !== pickerFilter) return false;
    if (pickerSearch && !e.name.toLowerCase().includes(pickerSearch.toLowerCase())) return false;
    return true;
  });

  const muscleFilters = ["All", ...Array.from(new Set(EXERCISE_LIBRARY.map(e => e.muscle)))];

  const totalExercises = days.reduce((s, d) => s + d.exercises.length, 0);

  // ===== Intro / Start screen =====
  if (!hasProfile && !editingProfile && showIntro) {
    return (
      <div className="hero" dir="rtl">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            مدربك الشخصي في جيبك
          </div>

          <h1 className="hero-title">
            شيل تقيل،<br />
            <span className="hero-title-accent">وكبّر كل شهر.</span>
          </h1>

          <p className="hero-sub">
            خطط جاهزة تطبقها بضغطة، تتبّع لكل كيلو شلته، وتقرير شهري
            يوريك بالفلوس قد إيه اتطورت.
          </p>

          <div className="hero-chips">
            <div className="hero-chip"><strong>32</strong><span>تمرين</span></div>
            <div className="hero-chip"><strong>5</strong><span>خطط جاهزة</span></div>
            <div className="hero-chip"><strong>∞</strong><span>تتبع شهري</span></div>
          </div>

          <button className="hero-cta" onClick={() => setShowIntro(false)}>
            <DumbbellIcon size={20} />
            يلا نبدأ
          </button>

          <p className="hero-foot">مجاني · بدون إعلانات · بياناتك محفوظة على جهازك</p>
        </div>
      </div>
    );
  }

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

  const toastEl = toast ? <div className="toast">{toast}</div> : null;

  // ===== شاشة التمرين الحية =====
  if (session) {
    const cur = session.items[session.currentIdx];
    const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
    const totalSets = session.items.reduce((a, i) => a + i.sets, 0);
    const doneSetsAll = session.items.reduce((a, i) => a + Math.min(i.doneSets, i.sets), 0);

    return (
      <div className="app session-page">
        <header className="header sticky dash-header">
          <div className="dash-header-row">
            <button className="sess-quit" onClick={() => setSession(null)} title="إلغاء"><XIcon size={20} /></button>
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
            <div className={`sess-timer ${session.restLeft ? "sess-timer-live" : ""}`}>
              <span className="sess-timer-label">{session.restLeft ? "استراحة كمان" : "وقت البريك"}</span>
              <strong className="sess-timer-val">{fmtClock(session.restLeft ?? session.restSec)}</strong>
            </div>
          </div>

          {session.restLeft && (
            <button className="rest-skip" onClick={() => setSession(s => s ? { ...s, restLeft: null } : s)}>
              <span>استراحة جارية · {fmtClock(session.restLeft)}</span>
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

            <div className="sess-weight-row">
              <span className="sess-label">وزن المجموعة</span>
              <div className="weight-stepper">
                <button className="stepper-btn stepper-btn-sm" onClick={() => setSession(s => {
                  if (!s) return s;
                  return { ...s, items: s.items.map((it, i) => i === s.currentIdx ? { ...it, weight: Math.max(0, it.weight - 2.5) } : it) };
                })}><MinusIcon /></button>
                <span className="weight-val">{cur.weight}<em>{unit}</em></span>
                <button className="stepper-btn stepper-btn-sm" onClick={() => setSession(s => {
                  if (!s) return s;
                  return { ...s, items: s.items.map((it, i) => i === s.currentIdx ? { ...it, weight: it.weight + 2.5 } : it) };
                })}><PlusIcon size={12} /></button>
              </div>
              <span className={`sess-sets-done ${cur.doneSets >= cur.sets ? "sess-sets-full" : ""}`}>
                {cur.doneSets}/{cur.sets} تم
              </span>
            </div>

            <div className="sess-btns">
              <button className="sess-btn-ghost" onClick={sessionPrev} disabled={session.currentIdx === 0}>
                <span>‹ الرجوع</span>
              </button>
              <button className="sess-btn-set" onClick={() => sessionMarkSet()} disabled={cur.doneSets >= cur.sets}>
                <CheckIcon size={16} />
                <span>عدة تتمت</span>
              </button>
              <button className="sess-btn-primary" onClick={sessionNext}>
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
                  onClick={() => setSession(s => s ? { ...s, currentIdx: i, restLeft: null } : s)}>
                  <span className="sess-row-idx">{i < session.currentIdx ? "✓" : i + 1}</span>
                  <span className="sess-row-name">{it.name}</span>
                  <span className="sess-row-sets">{it.sets}×{it.reps}</span>
                  <span className="sess-row-w">{it.weight} {unit}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="finish-btn sess-finish" onClick={finishSession}>
            <CheckIcon size={16} />
            <span>اقفل اليوم وسجّله</span>
          </button>
        </main>
        {toastEl}
      </div>
    );
  }

  const navBar = (
    <nav className="bottom-nav" dir="ltr">
      <div className="nav-inner">
        {navItems.map(({ page, Icon }) => (
          <button key={page} onClick={() => setCurrentPage(page)}
            className={`nav-item ${currentPage === page ? "nav-active" : "nav-inactive"}`}>
            <span className={`nav-icon-wrap ${currentPage === page ? "nav-icon-active" : ""}`}><Icon size={20} /></span>
          </button>
        ))}
      </div>
    </nav>
  );

  const themeModal = showTheme ? (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={() => setShowTheme(false)} />
      <div className="modal-sheet theme-sheet" dir="rtl">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">اختار ثيمك</h3>
            <p className="modal-sub">اللون بيتغيّر على طول وبيتحفظ</p>
          </div>
          <button className="close-btn" onClick={() => setShowTheme(false)}><XIcon size={22} /></button>
        </div>
        <div className="theme-grid">
          {THEMES.map(t => (
            <button key={t.key}
              className={`theme-swatch ${theme === t.key ? "theme-swatch-active" : ""}`}
              onClick={() => { setTheme(t.key); setShowTheme(false); setToast("اتغيّر الثيم ✨"); }}>
              <span className="theme-dot" style={{ background: t.swatch }} />
              <span className="theme-name">{t.label}</span>
              {theme === t.key && <span className="theme-check"><CheckIcon size={12} /></span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  const dayPickerModal = showDayPicker ? (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={() => setShowDayPicker(false)} />
      <div className="modal-sheet theme-sheet" dir="rtl">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">يلا نبدأ — اختار اليوم</h3>
            <p className="modal-sub">بيدوّن وزن كل مجموعة ووقت الاستراحة تلقائياً</p>
          </div>
          <button className="close-btn" onClick={() => setShowDayPicker(false)}><XIcon size={22} /></button>
        </div>
        <div className="day-picker-list">
          {days.map(d => (
            <button key={d.id} className="day-pick-row" onClick={() => startSession(d.id)}
              disabled={d.exercises.length === 0}>
              <span className="day-pick-label">{d.label}</span>
              <span className="day-pick-meta">{d.exercises.length > 0 ? `${d.exercises.length} تمارين` : "فاضي"}</span>
              <span className="day-pick-go"><PlayIcon size={13} /></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  if (currentPage === "Schedule") {
    return (
      <div className="app" dir="rtl">
          <header className="header sticky dash-header">
            <div className="dash-header-row">
              <div>
                <h1 className="dash-title">خطط جاهزة</h1>
                <p className="dash-sub">اختار خطة وطبقها مباشرة على خطتك</p>
              </div>
            </div>
          </header>
          <main className="main dash-main">
            <div className="templates-grid">
              {PLAN_TEMPLATES.map(t => (
                <div key={t.id} className="template-card">
                  <div className="template-header">
                    <div>
                      <h3 className="template-name">{t.name}</h3>
                      <p className="template-desc">{t.description}</p>
                    </div>
                    <span className={`template-badge ${t.level === "Beginner" ? "badge-beginner" : t.level === "Advanced" ? "badge-advanced" : "badge-mid"}`}>{t.level}</span>
                  </div>
                  <div className="template-meta">
                    <span className="template-pill">{t.days} أيام</span>
                    <span className="template-pill">{t.split}</span>
                  </div>
                  <div className="template-days">
                    {t.daysPlan.slice(0, 3).map((dp, idx) => (
                      <div key={idx} className="template-day-row">
                        <div className="template-day-dot" />
                        <span className="template-day-label">{dp.label}</span>
                      </div>
                    ))}
                    {t.daysPlan.length > 3 && <span className="template-more">+{t.daysPlan.length - 3} أيام أخرى</span>}
                  </div>
                  <button className="template-apply" onClick={() => applyTemplate(t)}>تطبيق الخطة</button>
                </div>
              ))}
            </div>
          </main>
          {navBar}
          {themeModal}
          {toastEl}
        </div>
      );
  }

  if (currentPage === "Progress") {
    return (
      <div className="app" dir="rtl">
        <header className="header sticky dash-header">
          <div className="dash-header-row">
            <div>
              <h1 className="dash-title">تقدمك</h1>
              <p className="dash-sub">كل كيلو بتحسبه · {logs.length} تمرين مسجّل</p>
            </div>
            <div className="dash-header-actions">
              <button className="icon-btn-circle" onClick={() => setShowTheme(true)} title="Theme"><PaletteIcon size={18} /></button>
            </div>
          </div>
        </header>

        <main className="main dash-main progress-main">
          <div className="stat-grid">
            <div className="stat-card stat-hero">
              <p className="stat-label">إجمالي الوزن المرفوع</p>
              <p className="stat-value">{fmtVolume(monthVolume)}<span className="stat-unit">{unit}</span></p>
              <p className={`stat-hint ${volumeDelta === null ? "" : volumeDelta >= 0 ? "up" : "down"}`}>
                {volumeDelta === null
                  ? "أول شهر ليك — كمّل!"
                  : volumeDelta >= 0
                    ? `▲ ${volumeDelta}% عن الشهر اللي فات`
                    : `▼ ${Math.abs(volumeDelta)}% عن الشهر اللي فات`}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-label">تمارين خلصتها</p>
              <p className="stat-value">{monthLogs.length}</p>
              <p className="stat-hint">{monthLogs.length ? `متوسط ${fmtVolume(monthVolume / monthLogs.length)} ${unit} للتمرين` : "لسه مفيش"}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">ستريك</p>
              <p className="stat-value">{streak}<span className="stat-unit">يوم</span></p>
              <p className="stat-hint">{streak > 0 ? "كمّل كده 🔥" : "ابدأ سلسلة جديدة"}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">أقوى يوم</p>
              <p className="stat-value">{bestLog ? bestLog.date.slice(8, 10) : "—"}</p>
              <p className="stat-hint">{bestLog ? `${fmtVolume(bestLog.volume)} ${unit}` : "لسه مفيش"}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">التمرين المفضل</p>
              <p className="stat-value stat-value-sm">{favoriteExercise || "—"}</p>
              <p className="stat-hint">{favoriteExercise ? "أكتر تمرين كررته" : "لسه مفيش"}</p>
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
                const done = loggedDates.has(key);
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
              <span className="card-badge">{fmtVolume(monthVolume)} {unit}</span>
            </div>
            <div className="bars">
              {weekBuckets.map((v, i) => (
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
                    <span className="recent-vol">{fmtVolume(l.volume)}<em>{unit}</em></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {navBar}
        {themeModal}
        {toastEl}
      </div>
    );
  }

  if (currentPage === "AI") {
    return (
      <div className="app">
        <header className="header sticky dash-header">
          <div className="dash-header-row">
            <div>
              <h1 className="dash-title">المدرب الذكي</h1>
              <p className="dash-sub">قريب جداً</p>
            </div>
          </div>
        </header>
        <main className="main dash-main">
          <div className="card empty-state-card">
            <div className="empty-icon"><ChatIcon size={26} /></div>
            <h3 className="card-title">المدرب الذكي جاي في الطريق</h3>
            <p className="empty-sub">هيسألك عن هدفك ويبني لك خطة على مقاسك، ويعدّلها حسب تقدمك.</p>
          </div>
        </main>
        {navBar}
        {themeModal}
        {toastEl}
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
            <button className="icon-btn-circle" onClick={() => setShowTheme(true)} title="Theme"><PaletteIcon size={18} /></button>
            <button className="icon-btn-circle" onClick={openSettings}><SettingsIcon size={18} /></button>
          </div>
        </div>
      </header>

      <main className="main dash-main">
        <button className="start-workout-btn" onClick={() => setShowDayPicker(true)}>
          <PlayIcon size={15} />
          <span>ابدأ التمرين</span>
          <em>{days.length} أيام جاهزة</em>
        </button>
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
                          <ExerciseThumb name={ex.name} muscle={ex.muscle} />
                          <div className="ex-info">
                            <p className="ex-name">{ex.name}</p>
                            <p className="ex-muscle">{ex.muscle}{ex.weight ? ` · ${ex.weight} ${unit}` : ""}</p>
                          </div>
                          <div className="ex-sets">{ex.sets}×{ex.reps}</div>
                          <div className="ex-row-actions">
                            <button className="ex-action" onClick={() => { setEditingExercise({ dayId: day.id, ex }); setEditSets(ex.sets); setEditReps(ex.reps); setEditWeight(ex.weight || 0); }}>
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
                  {day.exercises.length > 0 && (
                    <button className="finish-btn" onClick={() => startSession(day.id)}>
                      <PlayIcon size={15} />
                      <span>ابدأ تمرين اليوم ده</span>
                    </button>
                  )}
                  {day.exercises.length > 0 && (
                    <button className="quick-log-btn" onClick={() => openFinish(day)}>
                      <CheckIcon size={14} />
                      <span>خلصت التمرين — تسجيل سريع</span>
                    </button>
                  )}
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

            <div className="edit-field edit-field-wide">
              <div className="ob-field-label-row">
                <label className="ob-field-label">Weight per set</label>
                <span className="edit-weight-hint">{unit}</span>
              </div>
              <div className="stepper stepper-wide">
                <button className="stepper-btn" onClick={() => setEditWeight(w => Math.max(0, w - 2.5))}><MinusIcon /></button>
                <span className="stepper-label">{editWeight}</span>
                <button className="stepper-btn" onClick={() => setEditWeight(w => w + 2.5)}><PlusIcon size={14} /></button>
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
                  <ExerciseThumb name={ex.name} muscle={ex.muscle} />
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

      {dayToFinish && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setDayToFinish(null)} />
          <div className="modal-sheet finish-sheet">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">خلصت التمرين؟</h3>
                <p className="modal-sub">{dayToFinish.label} · {dayToFinish.exercises.length} تمارين</p>
              </div>
              <button className="close-btn" onClick={() => setDayToFinish(null)}><XIcon size={22} /></button>
            </div>

            <div className="finish-list">
              {dayToFinish.exercises.map(e => (
                <div key={e.id} className="finish-row">
                  <ExerciseThumb name={e.name} muscle={e.muscle} size={34} />
                  <div className="finish-info">
                    <p className="ex-name">{e.name}</p>
                    <p className="ex-muscle">{e.sets} × {e.reps}</p>
                  </div>
                  <div className="weight-stepper">
                    <button className="stepper-btn stepper-btn-sm" onClick={() => setFinishWeights(w => ({ ...w, [e.id]: Math.max(0, (w[e.id] || 0) - 2.5) }))}><MinusIcon /></button>
                    <span className="weight-val">{finishWeights[e.id] || 0}<em>{unit}</em></span>
                    <button className="stepper-btn stepper-btn-sm" onClick={() => setFinishWeights(w => ({ ...w, [e.id]: (w[e.id] || 0) + 2.5 }))}><PlusIcon size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="finish-total">
              <span>إجمالي الوزن المرفوع</span>
              <strong>{finishTotal > 0 ? finishTotal.toLocaleString() : 0} {unit}</strong>
            </div>

            <button className="continue-btn finish-confirm" onClick={finishDay}>سجّل التمرين</button>
          </div>
        </div>
      )}

      {navBar}
      {themeModal}
      {dayPickerModal}
      {toastEl}
    </div>
  );
};

export default App;
