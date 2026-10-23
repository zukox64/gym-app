/**
 * R2-6: Wake Lock — الشاشة متنمش وقت السيشن الحية (أثناء التمرين بس)،
 * وبيرجع يحصلها تاني لما المستخدم يرجع للتاب — النظام لو حرر اللوك (نوم) بنأخده تاني.
 */

import { useEffect } from "react";

type SentinelLike = { release: () => Promise<void> };
type WakeLockApi = { request: (type: "screen") => Promise<SentinelLike> };

export const useWakeLock = (active: boolean): void => {
  useEffect(() => {
    if (!active) return;
    const nav = navigator as Navigator & { wakeLock?: WakeLockApi };
    if (!nav.wakeLock) return; // مش مدعوم — عادي

    let sentinel: SentinelLike | null = null;
    let cancelled = false;

    const acquire = async (): Promise<void> => {
      try {
        if (!cancelled && document.visibilityState === "visible" && !sentinel) {
          sentinel = await nav.wakeLock!.request("screen");
        }
      } catch { /* المستخدم رفض أو النظام منع — مش حرج */ }
    };
    const release = async (): Promise<void> => {
      try { await sentinel?.release(); } catch { /* already released */ }
      sentinel = null;
    };

    void acquire();

    // لما التاب يرجع visible — المتصفح بيفصل اللوك تلقائيًا، نرجع تحت
    const onVisible = (): void => {
      if (document.visibilityState === "visible") void acquire();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void release();
    };
  }, [active]);
};
