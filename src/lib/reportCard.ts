/**
 * R2-5: كارت التقرير الشهري — canvas 1080×1350 بيرسم ملخص الشهر بالعربي،
 * ومريح للمشاركة (navigator.share) أو تنزيل. الرسم نقية (بدون React) مع input بسيط.
 */

export interface ReportCardData {
  monthLabel: string;
  sessions: number;
  volume: number;
  unit: string;
  streak: number;
  prList: [string, number][];
  favorite: string;
  bestDay: string | null;
  userName: string;
  /** أعلى عضلة بالحجم — للسطر الأخير */
  topMuscle: string;
}

const W = 1080;
const H = 1350;

/** رسم الكارت كامل على canvas — بيرجع nothing، بتستخدمه في toBlob/share */
export const drawMonthlyReport = (cv: HTMLCanvasElement, d: ReportCardData): void => {
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  if (!ctx) return;

  ctx.direction = "rtl";
  ctx.textBaseline = "alphabetic";

  /* خلفية متدرجة خضراء */
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0d2b20");
  bg.addColorStop(1, "#081a14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  /* إطار داخلي */
  ctx.strokeStyle = "rgba(255,255,255,.10)";
  ctx.lineWidth = 3;
  roundRect(ctx, 40, 40, W - 80, H - 80, 40);
  ctx.stroke();

  const ar = (size: number, weight = "700"): string => `${weight} ${size}px "Cairo", "Tajawal", "Segoe UI", sans-serif`;

  /* العنوان */
  ctx.fillStyle = "#8fe3b8";
  ctx.font = ar(40);
  ctx.fillText(d.monthLabel, W - 90, 150, W - 180);

  ctx.fillStyle = "#ffffff";
  ctx.font = ar(76, "800");
  ctx.fillText("تقرير الشهر", W - 90, 240, W - 180);

  /* الاسم */
  ctx.fillStyle = "rgba(255,255,255,.65)";
  ctx.font = ar(34);
  if (d.userName) ctx.fillText(`💪 ${d.userName}`, W - 90, 300, W - 180);

  /* الأرقام الكبيرة */
  bigNumber(ctx, d.volume, "حجم التدريب", ` ${d.unit}`, 430);
  bigNumber(ctx, d.sessions, "تمرين وصل", "", 600);

  /* سطر ستريك */
  ctx.fillStyle = "#ffd166";
  ctx.font = ar(40, "800");
  if (d.streak > 0) ctx.fillText(`🔥 ستريك ${d.streak} يوم`, W - 90, 740, W - 180);

  /* أقوى يوم + التمرين المفضل */
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.font = ar(34);
  const line3 = [
    d.bestDay ? `أقوى يوم: ${d.bestDay}` : null,
    d.favorite ? `المفضل: ${d.favorite}` : null,
    d.topMuscle ? `أكبر عضلة بالحجم: ${d.topMuscle}` : null,
  ].filter(Boolean).join("  ·  ");
  if (line3) ctx.fillText(line3, W - 90, 810, W - 180);

  /* أرقام شخصية */
  if (d.prList.length > 0) {
    ctx.fillStyle = "#8fe3b8";
    ctx.font = ar(38, "800");
    ctx.fillText("أعلى الأوزان", W - 90, 900, W - 180);
    ctx.fillStyle = "#ffffff";
    ctx.font = ar(32);
    d.prList.slice(0, 5).forEach(([name, w], i) => {
      ctx.fillText(`${name}`, W - 90, 960 + i * 52, W - 400);
      ctx.fillText(`${w} ${d.unit}`, 120, 960 + i * 52, 320);
    });
  }

  /* فوتر */
  ctx.fillStyle = "rgba(255,255,255,.4)";
  ctx.font = ar(28);
  ctx.fillText("Gym — تاب «تقدمك»", W - 90, H - 90, W - 180);
};

/** رقم كبير مع تسمية */
const bigNumber = (ctx: CanvasRenderingContext2D, v: number, label: string, suffix: string, y: number): void => {
  ctx.fillStyle = "rgba(255,255,255,.6)";
  ctx.font = `700 34px "Cairo", "Segoe UI", sans-serif`;
  ctx.fillText(label, W - 90, y - 66, W - 180);
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 84px "Cairo", "Segoe UI", sans-serif`;
  ctx.fillText(fmtNum(v) + suffix, W - 90, y, W - 180);
};

const fmtNum = (v: number): string => (v >= 10000 ? Math.round(v).toLocaleString("en-US") : String(Math.round(v)));

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/** تحويل blobs — المشاركة أو التنزيل */
export const shareOrDownload = (cv: HTMLCanvasElement, fileName: string): Promise<"shared" | "downloaded" | "failed"> =>
  new Promise(resolve => {
    cv.toBlob(async blob => {
      if (!blob) { resolve("failed"); return; }
      const file = new File([blob], fileName, { type: "image/png" });
      const nav = navigator as Navigator & {
        canShare?: (data: { files?: File[] }) => boolean;
        share?: (data: { title?: string; text?: string; files?: File[] }) => Promise<void>;
      };
      if (file && nav.canShare?.({ files: [file] }) && nav.share) {
        try {
          await nav.share({ title: fileName, files: [file] });
          resolve("shared");
          return;
        } catch { /* المستخدم قفل الشير — ننزل الملف */ }
      }
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 3000);
        resolve("downloaded");
      } catch {
        resolve("failed");
      }
    }, "image/png");
  });
