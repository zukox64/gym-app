/**
 * سجل وزن الجسم (B6) — مفاتيح جديدة gym-bodylog-v1، وتقارن الحقلين مباشرة.
 */

import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "../config";
import { sanitizeBodyLog } from "../lib/migrations";
import type { BodyWeightPoint } from "../lib/migrations";

export const useBodyweight = (): {
  body: BodyWeightPoint[];
  addBody: (v: number, date: string) => void;
  removeBody: (date: string) => void;
  /** R2-4: للتحويل عند تبديل الوحدات */
  setBody: (next: BodyWeightPoint[] | ((prev: BodyWeightPoint[]) => BodyWeightPoint[])) => void;
} => {
  const [body, setBody] = useLocalStorage<BodyWeightPoint[]>(STORAGE_KEYS.body, () => [], {
    validate: sanitizeBodyLog,
  });

  const addBody = (v: number, date: string) => {
    setBody(prev => [{ d: date, v }, ...prev.filter(p => p.d !== date)]);
  };

  const removeBody = (date: string) => {
    setBody(prev => prev.filter(p => p.d !== date));
  };

  return { body, addBody, removeBody, setBody };
};
