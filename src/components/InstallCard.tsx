/**
 * R2-6: كارت التثبيت PWA — beforeinstallprompt (كروم/أندرويد) تثبيت مباشر،
 * وإلا (iOS) تعليمات الإضافة لشاشة البداية. رفض المستخدم = إخفاء دائم (localStorage).
 */

import * as React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { S } from "../strings";
import { DownloadIcon, XIcon } from "./icons";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

/** iOS سفاري فيه مسّ (مش Mac بلمسة والوحدة دعمت standalone) — يتحسب مرة كونًا */
const isIOSDevice =
  typeof navigator !== "undefined"
  && (/iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.userAgent.includes("Macintosh") && "ontouchend" in document));

const isStandalonePwa = (): boolean =>
  typeof window !== "undefined"
  && (window.matchMedia?.("(display-mode: standalone)").matches === true
    || (window.navigator as Navigator & { standalone?: boolean }).standalone === true);

export const InstallCard: React.FC = () => {
  const [dismissed, setDismissed] = useLocalStorage<boolean>("gym-install-v1", () => false, { validate: v => typeof v === "boolean" });
  const [bip, setBip] = React.useState<BIPEvent | null>(null);

  /* أندرويد/ديسكتوب كروم: الحدث الأصلي (event handler — setState مسموح) */
  React.useEffect(() => {
    const onBip = (e: Event): void => {
      e.preventDefault();
      setBip(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  /* iOS: مشتق أثناء الـ render — بيتخفي لو مثبت أصلًا أو اترفض سابقًا */
  if (dismissed || !(bip !== null || (isIOSDevice && !isStandalonePwa()))) return null;
  const isIos = bip === null;

  const close = (): void => {
    setDismissed(true);
  };

  return (
    <div className="card install-card" role="note">
      <button className="install-close" onClick={close} aria-label="قفل"><XIcon size={16} /></button>
      <span className="install-icon">📱</span>
      <div className="install-copy">
        <h3 className="card-title">{S.pwa.installTitle}</h3>
        {isIos
          ? (
            <p className="install-steps">
              {S.pwa.installSub}
              <br />{S.pwa.installIosSteps} ↓ {S.pwa.installIosAdd}
            </p>
          )
          : (
            <p className="install-steps">{S.pwa.installSub}</p>
          )}
      </div>
      {bip && (
        <button
          className="btn-save install-btn"
          onClick={() => {
            void bip.prompt(); // الاختيار (قبول/رفض) بيقفل الكارت مع أي نتيجة بعد الثبات
          }}
        >
          <DownloadIcon size={15} /> {S.pwa.installCta}
        </button>
      )}
    </div>
  );
};
