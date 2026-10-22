/**
 * مودال الثيم.
 */

import * as React from "react";
import { Modal, ModalHeader } from "./ui/Modal";
import { CheckIcon } from "./icons";
import { THEMES } from "../hooks/useTheme";
import type { ThemeKey } from "../types";

export const ThemeModal: React.FC<{
  open: boolean;
  theme: ThemeKey;
  onPick: (t: ThemeKey) => void;
  onClose: () => void;
}> = ({ open, theme, onPick, onClose }) => (
  <Modal open={open} onClose={onClose} sheetClass="theme-sheet">
    <ModalHeader title="اختار ثيمك" sub="اللون بيتغيّر على طول وبيتحفظ" onClose={onClose} />
    <div className="theme-grid">
      {THEMES.map(t => (
        <button key={t.key}
          className={`theme-swatch ${theme === t.key ? "theme-swatch-active" : ""}`}
          onClick={() => onPick(t.key)}>
          <span className="theme-dot" style={{ background: t.swatch }} />
          <span className="theme-name">{t.label}</span>
          {theme === t.key && <span className="theme-check"><CheckIcon size={12} /></span>}
        </button>
      ))}
    </div>
  </Modal>
);
