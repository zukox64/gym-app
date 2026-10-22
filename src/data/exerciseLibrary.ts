/**
 * مكتبة التمارين — المصدر الوحيد (A2).
 * كل حركة عندها: الاسم (ثابت مستخدم في مفاتيح الصور/الـ GIFs)، العضلة، الـ default sets/reps،
 * والمعدات المطلوبة. حركة من غير equipment = متاحة للكل (بيانات قديمة للملف الشخصي).
 * الأسماء لازم ما تتبدلش — مفاتيح الصور/الوسائط مبنية عليها.
 */

import type { Equipment, LibraryEntry } from "../types";

export type { LibraryEntry };

const L = (name: string, muscle: string, sets: number, reps: number, equipment?: Equipment[]): LibraryEntry =>
  ({ name, muscle, sets, reps, ...(equipment ? { equipment } : {}) });

export const EXERCISE_LIBRARY: LibraryEntry[] = [
  /* ===== Chest ===== */
  L("Barbell Bench Press", "Chest", 4, 8, ["Barbell", "Bench"]),
  L("Dumbbell Bench Press", "Chest", 4, 10, ["Dumbbell", "Bench"]),
  L("Dumbbell Floor Press", "Chest", 3, 12, ["Dumbbell"]),
  L("Incline Dumbbell Press", "Chest", 3, 10, ["Dumbbell", "Bench"]),
  L("Machine Chest Press", "Chest", 3, 12, ["Machine"]),
  L("Pec Deck Fly", "Chest", 3, 12, ["Machine"]),
  L("Cable Fly", "Chest", 3, 12, ["Cable"]),
  L("Dips", "Chest", 3, 10, ["Bodyweight", "Pull-up Bar"]),
  L("Push-ups", "Chest", 3, 15, ["Bodyweight"]),
  L("Incline Push-ups", "Chest", 3, 15, ["Bodyweight"]),

  /* ===== Back ===== */
  L("Pull-ups", "Back", 3, 8, ["Bodyweight", "Pull-up Bar"]),
  L("Chin-ups", "Back", 3, 8, ["Bodyweight", "Pull-up Bar"]),
  L("Lat Pulldown", "Back", 3, 12, ["Machine", "Cable"]),
  L("Barbell Row", "Back", 4, 8, ["Barbell"]),
  L("One-Arm Dumbbell Row", "Back", 3, 10, ["Dumbbell"]),
  L("Dumbbell Rows", "Back", 4, 10, ["Dumbbell"]),
  L("Chest-Supported Dumbbell Row", "Back", 3, 12, ["Dumbbell", "Bench"]),
  L("Machine Row", "Back", 3, 12, ["Machine"]),
  L("Seated Cable Row", "Back", 3, 12, ["Cable"]),
  L("Straight-Arm Pulldown", "Back", 3, 12, ["Cable"]),
  L("Inverted Rows", "Back", 3, 12, ["Bodyweight", "Pull-up Bar"]),
  L("Superman", "Back", 3, 15, ["Bodyweight"]),

  /* ===== Shoulders ===== */
  L("Overhead Press", "Shoulders", 4, 8, ["Barbell"]),
  L("Seated Dumbbell Press", "Shoulders", 4, 10, ["Dumbbell", "Bench"]),
  L("Arnold Press", "Shoulders", 3, 10, ["Dumbbell"]),
  L("Machine Shoulder Press", "Shoulders", 3, 12, ["Machine"]),
  L("Lateral Raise", "Side Delt", 3, 15, ["Dumbbell"]),
  L("Cable Lateral Raise", "Side Delt", 3, 15, ["Cable"]),
  L("Front Raise", "Front Delt", 3, 12, ["Dumbbell"]),
  L("Face Pull", "Rear Delt", 3, 15, ["Cable"]),
  L("Rear Delt Fly", "Rear Delt", 3, 15, ["Dumbbell"]),
  L("Pike Push-ups", "Shoulders", 3, 10, ["Bodyweight"]),
  L("Upright Row", "Shoulders", 3, 12, ["Barbell", "EZ-Bar"]),

  /* ===== Biceps ===== */
  L("Barbell Curl", "Biceps", 3, 10, ["Barbell"]),
  L("EZ-Bar Curl", "Biceps", 3, 10, ["EZ-Bar"]),
  L("Hammer Curl", "Biceps", 3, 12, ["Dumbbell"]),
  L("Incline Dumbbell Curl", "Biceps", 3, 12, ["Dumbbell", "Bench"]),
  L("Concentration Curl", "Biceps", 3, 12, ["Dumbbell"]),
  L("Cable Curl", "Biceps", 3, 12, ["Cable"]),
  L("Band Curl", "Biceps", 3, 15, ["Bands"]),
  L("Preacher Curl", "Biceps", 3, 10, ["Machine"]),

  /* ===== Triceps ===== */
  L("Close-Grip Bench Press", "Triceps", 3, 10, ["Barbell", "Bench"]),
  L("Tricep Pushdown", "Triceps", 3, 12, ["Cable"]),
  L("Skull Crushers", "Triceps", 3, 10, ["Barbell", "EZ-Bar"]),
  L("Overhead Extension", "Triceps", 3, 12, ["Cable", "Dumbbell"]),
  L("Tricep Kickbacks", "Triceps", 3, 15, ["Dumbbell"]),
  L("Bench Dips", "Triceps", 3, 15, ["Bodyweight", "Bench"]),
  L("Diamond Push-ups", "Triceps", 3, 12, ["Bodyweight"]),

  /* ===== Quads ===== */
  L("Barbell Squat", "Quads", 4, 8, ["Barbell"]),
  L("Front Squat", "Quads", 3, 8, ["Barbell"]),
  L("Leg Press", "Quads", 3, 12, ["Machine"]),
  L("Leg Extension", "Quads", 3, 15, ["Machine"]),
  L("Hack Squat", "Quads", 3, 10, ["Machine"]),
  L("Goblet Squat", "Quads", 3, 12, ["Dumbbell", "Kettlebell"]),
  L("Dumbbell Lunges", "Quads", 3, 12, ["Dumbbell"]),
  L("Bodyweight Squat", "Quads", 3, 20, ["Bodyweight"]),
  L("Wall Sit", "Quads", 3, 45, ["Bodyweight"]),

  /* ===== Hamstrings ===== */
  L("Romanian Deadlift", "Hamstrings", 4, 8, ["Barbell"]),
  L("Dumbbell RDL", "Hamstrings", 3, 12, ["Dumbbell"]),
  L("Single-Leg RDL", "Hamstrings", 3, 12, ["Dumbbell"]),
  L("Good Mornings", "Hamstrings", 3, 10, ["Barbell"]),
  L("Leg Curl", "Hamstrings", 3, 12, ["Machine"]),

  /* ===== Glutes ===== */
  L("Hip Thrust", "Glutes", 3, 12, ["Barbell", "Bench"]),
  L("Dumbbell Hip Thrust", "Glutes", 3, 15, ["Dumbbell", "Bench"]),
  L("Cable Kickback", "Glutes", 3, 15, ["Cable"]),
  L("Bulgarian Split Squat", "Glutes", 3, 10, ["Dumbbell", "Bodyweight"]),
  L("Glute Bridge", "Glutes", 3, 15, ["Bodyweight"]),

  /* ===== Calves ===== */
  L("Calf Raise", "Calves", 4, 15, ["Machine", "Bodyweight"]),
  L("Standing Barbell Calf Raise", "Calves", 3, 15, ["Barbell"]),
  L("Seated Calf Raise", "Calves", 3, 20, ["Machine", "Bodyweight"]),

  /* ===== Core ===== */
  L("Crunches", "Abs", 3, 20, ["Bodyweight"]),
  L("Sit-Ups", "Abs", 3, 20, ["Bodyweight"]),
  L("Hanging Leg Raise", "Abs", 3, 12, ["Bodyweight", "Pull-up Bar"]),
  L("Hollow Hold", "Abs", 3, 30, ["Bodyweight"]),
  L("Plank", "Abs", 3, 60, ["Bodyweight"]),
  L("Side Plank", "Obliques", 3, 30, ["Bodyweight"]),
  L("Mountain Climbers", "Abs", 3, 40, ["Bodyweight"]),
  L("Dead Bug", "Abs", 3, 16, ["Bodyweight"]),
  L("Cable Crunch", "Abs", 3, 15, ["Cable"]),
  L("Russian Twist", "Obliques", 3, 20, ["Bodyweight"]),
  L("Cable Woodchopper", "Obliques", 3, 15, ["Cable"]),

  /* ===== Extras ===== */
  L("Farmer's Walk", "Forearms", 3, 40, ["Dumbbell", "Kettlebell"]),
  L("Wrist Curls", "Forearms", 3, 15, ["Dumbbell"]),
  L("Barbell Shrug", "Traps", 3, 12, ["Barbell"]),
  L("Dumbbell Shrugs", "Traps", 3, 15, ["Dumbbell"]),
];
