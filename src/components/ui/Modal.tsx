/**
 * قاعدة المودال (A4) + إمكانية الوصول (A6):
 *  - role="dialog" + aria-modal
 *  - Esc يقفل، الـ focus محبوس داخل الـ sheet، وبيرجع للمُطلق عند الإغلاق
 */

import * as React from "react";
import { useEffect, useRef } from "react";
import { XIcon } from "../icons";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** class إضافية للـ sheet (مثلاً finish-sheet / theme-sheet) */
  sheetClass?: string;
  label?: string;
  children: React.ReactNode;
}

const FOCUSABLE = "button:not([disabled]), input, select, textarea, a[href], [tabindex]:not([tabindex='-1'])";

export const Modal: React.FC<ModalProps> = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, sheetClass, label, children }, ref) => {
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // ركّز أول عنصر قابل للتركيز عند الفتح
    const first = sheet?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !sheet) return;
      // trap: دالة التبويب تلف جوا الـ sheet
      const focusables = [...sheet.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusables.length === 0) { e.preventDefault(); return; }
      const first0 = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first0 || !sheet.contains(active))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (active === last || !sheet.contains(active))) {
        e.preventDefault(); first0.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // رجّع الـ focus لمن فتح
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-backdrop" onClick={onClose} />
      <div
        ref={el => { sheetRef.current = el; if (typeof ref === "function") ref(el); else if (ref) ref.current = el; }}
        className={`modal-sheet ${sheetClass ?? ""}`}
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        {children}
      </div>
    </div>
  );
});

Modal.displayName = "Modal";

export interface ModalHeaderProps {
  title: string;
  sub?: string;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, sub, onClose }) => (
  <div className="modal-header">
    <div>
      <h3 className="modal-title">{title}</h3>
      {sub !== undefined && <p className="modal-sub">{sub}</p>}
    </div>
    <button className="close-btn" onClick={onClose} aria-label="إغلاق"><XIcon size={22} /></button>
  </div>
);
