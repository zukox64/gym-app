/**
 * useLocalStorage — القناة الوحيدة للوصول للتخزين في التطبيق (A4):
 * قراءة آمنة + فاليديشن + fallback Initial، وكتابة كل تغيير بالحالة. مفيش أي مكوّن
 * تاني بيكتب localStorage مباشرة (استثناء الساعة/الثيم مقصود داخل hooks دي).
 */

import { useCallback, useState } from "react";

export interface UseLocalStorageOpts<T> {
  /** فاليديشن للشكل — برجّع null يبقى الداتا مش مقبولة ويهفترف الـ initial */
  validate?: (v: T) => T | null;
}

export function useLocalStorage<T>(
  key: string,
  initial: () => T,
  opts?: UseLocalStorageOpts<T>,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initial();
      const parsed = JSON.parse(raw) as T;
      if (opts?.validate) {
        return opts.validate(parsed) ?? initial();
      }
      return parsed;
    } catch {
      return initial();
    }
  });

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue(prev => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(v));
        } catch { /* ignore */ }
        return v;
      });
    },
    [key],
  );

  return [value, set];
}
