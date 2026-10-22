/**
 * قاعدة المودال (A4 — بدون a11y اضافية؛ A6 يضيف focus trap/aria على نفس القاعدة).
 */

import * as React from "react";
import { XIcon } from "../icons";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** class إضافية للـ sheet (مثلاً finish-sheet / theme-sheet) */
  sheetClass?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, sheetClass, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose} />
      <div className={`modal-sheet ${sheetClass ?? ""}`} dir="rtl">
        {children}
      </div>
    </div>
  );
};

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
    <button className="close-btn" onClick={onClose}><XIcon size={22} /></button>
  </div>
);
