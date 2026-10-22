/**
 * مفاتيح التخزين + مفاتيح الميزات. المفاتيح القديمة مقفولة — التراجع عنها لو معاه
 * بيتسمى بـ migration (متخليهاش تتغير أبداً).
 */

export const STORAGE_KEYS = {
  profile: "gym-profile-v2",
  plan: "gym-plan-v2",
  logs: "gym-logs-v1",
  theme: "gym-theme-v1",
  session: "gym-session-v1",
  /** B6: وزن الجسم — مفتاح جديد */
  body: "gym-bodylog-v1",
} as const;

/** مفاتيح الميزات — مشوّه على مستوى البيلد (A7) */
export const FEATURES = {
  ai: false,
} as const;

/** default rest — قابل للضبط من الإعدادات (B1)؛ ده الـ fallback لو الملف الافتراضي ما محفوظش قيمة */
export const DEFAULT_REST_SECONDS = 90;
export const REST_RANGE = [30, 300] as const;

/** أهداف الـ onboarding — القيم English دائمة (متخزنة في الملف الشخصي) */
export const GOAL_OPTIONS = ["Cutting", "Bulking", "General Fitness"] as const;
export const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"] as const;
