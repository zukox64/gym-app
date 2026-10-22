/**
 * فينك الوسائط (A5 هيثبّت المحتوى بدل CDN هنا) — الخريطة ارجنت في مسارات:
 * GIF حركات + صور + عضلات تشريحية + عناصر غواها.
 */

export interface MuscleArt { f: string; x: number; y: number; z: number; back?: boolean }

/* ===== صور التمارين (حالياً CDN — بتتنقل local في A5) ===== */
export const PHOTO_BASE = "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/";
export const EXERCISE_PHOTOS: Record<string, string> = {
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

/* ===== حركات التمارين — GIF ===== */
export const GIF_BASE = "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/";
export const EXERCISE_GIFS: Record<string, string> = {
  "Barbell Bench Press": "0025-EIeI8Vf.gif",
  "Incline Dumbbell Press": "0314-ns0SIbU.gif",
  "Cable Fly": "0227-Pr9Rhf4.gif",
  "Push-ups": "0662-I4hDWkc.gif",
  "Dumbbell Rows": "0293-BJ0Hz5L.gif",
  "Lat Pulldown": "2330-LEprlgG.gif",
  "Pull-ups": "0652-lBDjFxJ.gif",
  "Seated Cable Row": "0861-fUBheHs.gif",
  "Overhead Press": "1457-Kyd9Rz5.gif",
  "Lateral Raise": "0334-DsgkuIt.gif",
  "Front Raise": "0310-3eGE2JC.gif",
  "Face Pull": "3697-G61cXLk.gif",
  "Barbell Curl": "0031-25GPyDY.gif",
  "Hammer Curl": "0313-slDvUAU.gif",
  "Preacher Curl": "0372-jivWf8n.gif",
  "Tricep Pushdown": "1723-qRZ5S1N.gif",
  "Skull Crushers": "1721-yRLPCLu.gif",
  "Overhead Extension": "0194-2IxROQ1.gif",
  "Barbell Squat": "0043-qXTaZnJ.gif",
  "Leg Press": "0739-10Z2DXU.gif",
  "Leg Extension": "0585-my33uHU.gif",
  "Romanian Deadlift": "0085-wQ2c4XD.gif",
  "Leg Curl": "0586-17lJ1kr.gif",
  "Hip Thrust": "1409-qKBpF7I.gif",
  "Bulgarian Split Squat": "0381-SSsBDwB.gif",
  "Calf Raise": "1372-8ozhUIZ.gif",
  "Crunches": "0267-kjJ3VoQ.gif",
  "Hanging Leg Raise": "0472-I3tsCnC.gif",
  "Plank": "0464-CosupLu.gif",
  "Russian Twist": "0687-XVDdcoj.gif",
  "Farmer's Walk": "2133-qPEzJjA.gif",
  "Barbell Shrug": "0095-dG7tG5y.gif",
};

/* ===== العضلات التشريحية (wger) — كل صورة جسم رمادي + عضلة حمراء بيتعملها zoom ===== */
export const MUSCLE_IMG_BASE = "https://wger.de/static/images/muscles/";
export const BODY_IMG = {
  front: MUSCLE_IMG_BASE + "muscular_system_front.svg",
  back: MUSCLE_IMG_BASE + "muscular_system_back.svg",
};

export const MUSCLE_IMG: Record<string, MuscleArt> = {
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

/** إيموجي العضلات — fallback آخر في السلسلة */
export const MUSCLE_EMOJI: Record<string, string> = {
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
