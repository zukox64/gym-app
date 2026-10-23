/**
 * R2-3: فرقعة احتفال — canvas confetti أقل من 2 KB، ألوان من الـ brand، وما تلمسش الـ DOM بس layer واحد.
 * محترمة لـ prefers-reduced-motion (مفيش تشغيل عند التقليل) وبتمسح أي أثر بعد الانتهاء.
 */

import { prefersReducedMotion } from "./motion";

export const celebrate = (colors?: string[]): void => {
  if (prefersReducedMotion()) return;
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999";
    document.body.appendChild(canvas);

    const palette = colors && colors.length
      ? colors
      : ["#22c55e", "#facc15", "#f5f6f7", "#06b6d4"];
    const N = 90;
    const bits = Array.from({ length: N }, () => ({
      x: canvas.width / 2 + (Math.random() * 2 - 1) * 60,
      y: canvas.height / 2 + 40,
      vx: (Math.random() * 2 - 1) * 7,
      vy: -(Math.random() * 9 + 6),
      s: Math.random() * 5 + 3,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) / 4,
      c: palette[(Math.random() * palette.length) | 0],
      life: 1,
    }));

    let t = 0;
    const frame = (): void => {
      t += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const b of bits) {
        b.vy += 0.28;                     // جاذبية
        b.x += b.vx; b.y += b.vy; b.rot += b.vr;
        if (t > 70) b.life -= 0.06;       // بعد ثانية وفاه
        if (b.life <= 0) continue;
        ctx.globalAlpha = Math.max(0, b.life);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.fillStyle = b.c;
        ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (t < 130) requestAnimationFrame(frame);
      else canvas.remove();
    };
    requestAnimationFrame(frame);
  } catch {
    /* ignore — مفيش احتفال بدون canvas */
  }
};
