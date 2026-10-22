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
} as const;

/** مفاتيح الميزات — مشوّه على مستوى البيلد (A7) */
export const FEATURES = {
  ai: false,
} as const;

/** default rest — B4 هيخلي الدهب قابل للتهيئة من Settings */
export const DEFAULT_REST_SECONDS = 90;

/** أهداف الـ onboarding — القيم English دائمة (متخزنة في الملف الشخصي) */
export const GOAL_OPTIONS = ["Cutting", "Bulking", "General Fitness"] as const;
export const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"] as const;
