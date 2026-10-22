/**
 * قوالب الخطط الجاهزة (11 قالب) — الحقيقة الوحيدة (single source of truth).
 * العضلات المذكورة في كل يوم بتتطبّع عبر خريطة المجموعات في data/muscles.ts.
 * حقل equipment هيتضاف في A2 (الفلترة حسب المععدة).
 */

import type { PlanTemplate } from "../types";

export type { PlanTemplate };

export const PLAN_TEMPLATES: PlanTemplate[] = [
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
  {
    id: "pplx2",
    name: "PPL ×2 — 6x/Week",
    description: "PPL مرتين في الأسبوع — حجم تدريب عالي جداً للجدعين",
    level: "Advanced",
    days: 6,
    split: "PPL ×2",
    daysPlan: [
      { label: "Day 1 — Push A", muscles: ["Chest", "Shoulders", "Triceps"] },
      { label: "Day 2 — Pull A", muscles: ["Back", "Lats", "Biceps"] },
      { label: "Day 3 — Legs A", muscles: ["Quads", "Hamstrings", "Calves"] },
      { label: "Day 4 — Push B", muscles: ["Chest", "Side Delt", "Triceps"] },
      { label: "Day 5 — Pull B", muscles: ["Lats", "Mid Back", "Rear Delt", "Biceps"] },
      { label: "Day 6 — Legs B", muscles: ["Quads", "Glutes", "Hamstrings", "Calves", "Abs"] },
    ],
  },
  {
    id: "phul",
    name: "PHUL — Power & Hypertrophy",
    description: "يومان قوة (أوزان تقيلة) + يومين ضخامات، توازن ممتاز",
    level: "Intermediate",
    days: 4,
    split: "Power/Hypertrophy",
    daysPlan: [
      { label: "Day 1 — Upper Power", muscles: ["Chest", "Back", "Shoulders", "Triceps"] },
      { label: "Day 2 — Lower Power", muscles: ["Quads", "Hamstrings", "Calves"] },
      { label: "Day 3 — Upper Hypertrophy", muscles: ["Chest", "Lats", "Side Delt", "Biceps", "Triceps"] },
      { label: "Day 4 — Lower Hypertrophy", muscles: ["Quads", "Hamstrings", "Glutes", "Calves", "Abs"] },
    ],
  },
  {
    id: "arnold",
    name: "Arnold Split — 6x/Week",
    description: "الكلاسيك الذهبية: صدر/ضهر، كتف/باي/تراي، رجلين × مرتين",
    level: "Advanced",
    days: 6,
    split: "Arnold",
    daysPlan: [
      { label: "Day 1 — Chest & Back", muscles: ["Chest", "Back", "Lats"] },
      { label: "Day 2 — Shoulders & Arms", muscles: ["Shoulders", "Biceps", "Triceps", "Traps"] },
      { label: "Day 3 — Legs", muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
      { label: "Day 4 — Chest & Back", muscles: ["Chest", "Lats", "Mid Back"] },
      { label: "Day 5 — Shoulders & Arms", muscles: ["Shoulders", "Side Delt", "Biceps", "Triceps", "Forearms"] },
      { label: "Day 6 — Legs", muscles: ["Quads", "Hamstrings", "Calves", "Abs"] },
    ],
  },
  {
    id: "strength5",
    name: "5×5 Strength — 3x/Week",
    description: "خطة قوة كلاسيكية، مركّزة على الأساسيات بأوزان تقيلة",
    level: "Intermediate",
    days: 3,
    split: "A/B/C",
    daysPlan: [
      { label: "Day A — Squat Focus", muscles: ["Quads", "Chest", "Back"] },
      { label: "Day B — Bench Focus", muscles: ["Chest", "Shoulders", "Hamstrings"] },
      { label: "Day C — Deadlift Focus", muscles: ["Hamstrings", "Back", "Calves"] },
    ],
  },
  {
    id: "home",
    name: "Home Dumbbell Plan",
    description: "كل حاجاتها دمبل أو وزن الجسم — تتمرن بالبيت براحتك",
    level: "Beginner",
    days: 3,
    split: "Home",
    daysPlan: [
      { label: "Day 1 — Push (Home)", muscles: ["Chest", "Shoulders", "Triceps"] },
      { label: "Day 2 — Pull (Home)", muscles: ["Back", "Biceps", "Rear Delt"] },
      { label: "Day 3 — Legs & Core (Home)", muscles: ["Quads", "Glutes", "Calves", "Abs"] },
    ],
  },
  {
    id: "cali",
    name: "Calisthenics 3x/Week",
    description: "وزن الجسم بس — قوة وتحكم من غير حد دمبل",
    level: "Beginner",
    days: 3,
    split: "Bodyweight",
    daysPlan: [
      { label: "Day 1 — Upper Push", muscles: ["Chest", "Triceps", "Shoulders"] },
      { label: "Day 2 — Upper Pull", muscles: ["Back", "Lats", "Biceps"] },
      { label: "Day 3 — Core & Legs", muscles: ["Abs", "Quads", "Calves"] },
    ],
  },
];
