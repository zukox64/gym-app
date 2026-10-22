/**
 * وحدات القياس (kg/lbs) والتنسيقات.
 */

import type { UserProfile } from "../types";

export const KG_PER_LB = 0.45359237;

/** تحويل وزن بين الوحدات (بدون تقريب — السياق يقرر) */
export const convertWeight = (v: number, from: "kg" | "lbs", to: "kg" | "lbs"): number => {
  if (from === to) return v;
  return to === "kg" ? v * KG_PER_LB : v / KG_PER_LB;
};

/** تنسيق حجم التمرين: أرقام كبيرة → 1.2k */
export const fmtVolume = (v: number): string => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`);

export const unitOf = (profile: UserProfile | null): "kg" | "lbs" => profile?.weightUnit || "kg";
