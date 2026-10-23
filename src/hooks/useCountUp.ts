/**
 * R2-3: Count-up للأرقام الكبيرة — rAF + easing، بيغير فورًا لو المستخدم عايز تقليل الحركة.
 */

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motion";

export const useCountUp = (target: number, durMs = 700): number => {
  const [value, setValue] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const jump = (): void => { cancelAnimationFrame(raf.current); setValue(target); };
    if (prefersReducedMotion()) {
      // async حتى ما نحققش setState متزامن (قاعدة lint) — عملي نفس النتيجة فورًا
      raf.current = requestAnimationFrame(jump);
      return () => cancelAnimationFrame(raf.current);
    }
    const t0 = performance.now();
    const from = 0;
    const tick = (t: number): void => {
      const p = Math.min(1, (t - t0) / durMs);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, durMs]);

  return value;
};
