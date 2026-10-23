import type { Equipment } from "../types";

/** اختيارات المعدات في Onboarding — نفس النصوص المخزنة في gym-profile-v2 (TL3R) */
export const EQUIPMENT_OPTIONS = ["Full Gym", "Dumbbells", "Barbell", "Bodyweight Only"] as const;

/** أدوات المتاح لكل اختيار — الـ "Full Gym" بفتح كل حاجة */
const KITS: Record<string, Equipment[]> = {
  "Full Gym": ["Barbell", "Dumbbell", "Kettlebell", "Cable", "Machine", "EZ-Bar", "Bands", "Bench", "Pull-up Bar", "Bodyweight"],
  "Dumbbells": ["Dumbbell", "Kettlebell", "Bodyweight", "Bench", "Pull-up Bar", "Bands"],
  "Barbell": ["Barbell", "EZ-Bar", "Bench", "Pull-up Bar", "Bodyweight"],
  "Bodyweight Only": ["Bodyweight"],
};

/**
 * الأدوات الممنوحة للمستخدم بحسب اختياراته.
 * بتتقبل مع أي profile قديم: أي اختيار غير معروف بيمر السلك (يُُسقط فقط في الفلترة).
 */
export const grantedKits = (selections: readonly string[]): Equipment[] => {
  const set = new Set<Equipment>();
  for (const sel of selections) {
    const kit = KITS[sel];
    if (kit) for (const k of kit) set.add(k);
  }
  return [...set];
};

export const isFullGym = (selections: readonly string[]): boolean =>
  selections.some((s) => s.toLowerCase() === "full gym");
