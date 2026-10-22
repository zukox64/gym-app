/**
 * أدوات التاريخ — تنسيق عربي مصري.
 */

export const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

/** مفتاح يوم بصيغة YYYY-MM-DD بتوقيت الجهاز */
export const todayKey = (d = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const monthLabel = (y: number, m0: number): string => `${AR_MONTHS[m0]} ${y}`;

export const fmtDate = (iso: string): string => {
  const parts = iso.split("-").map(Number);
  const d = parts[2] || 1;
  const m0 = (parts[1] || 1) - 1;
  return `${d} ${AR_MONTHS[m0]}`;
};

/** ثواني → m:ss */
export const fmtClock = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

/** إحداثيات رأس الشهر اليوم الأول وعدد الأيام */
export const monthMeta = (y: number, m0: number) => ({
  firstDayOfWeek: new Date(y, m0, 1).getDay(),
  daysInMonth: new Date(y, m0 + 1, 0).getDate(),
});
