/**
 * R2-3: أدوات الحركة — كلها محمية بـ prefers-reduced-motion.
 * لا شيء هنا يلمس البيانات؛Buzz/ViewTransition/فونت فقط.
 */

/** هل المستخدم طلب تقليل الحركة؟ */
export const prefersReducedMotion = (): boolean => {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return true;
  }
};

/** هزة لمس قصيرة (محاطة بالحرس — مش كل النظام بيدعم) */
export const buzz = (ms = 10): void => {
  try {
    const n = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
    if (!prefersReducedMotion() && typeof n.vibrate === "function") n.vibrate(ms);
  } catch {
    /* ignore */
  }
};

/**
 * View Transitions API للتحولات الشاشية (R2-3) — بمكمل CSS (::view-transition-* + fallback entry animation).
 * النظام بيرجع للدالة الأصلية لو ما مدعومة.
 */
export const withViewTransition = (fn: () => void): void => {
  if (prefersReducedMotion()) {
    fn();
    return;
  }
  const docEt = document as Document & {
    startViewTransition?: (cb: () => void) => unknown;
  };
  if (typeof docEt.startViewTransition === "function") {
    docEt.startViewTransition(fn);
    return;
  }
  // fallback CSS: عناصر .dash-main/.dash-header بتترسم عادي مع أنيميشن الدخول
  fn();
};
