/**
 * مودال الإعدادات (A7) — تعديل الملف الشخصي + تصدير/استيراد النسخة الاحتياطية + الثيم.
 * الاستيراد نفسه: input[file] مخفي هنا؛ App بيتولى الـ parseBundle.
 */

import * as React from "react";
import { useRef } from "react";
import { Modal, ModalHeader } from "./ui/Modal";
import { ChevronDown, DownloadIcon, EditIcon, PaletteIcon, UploadIcon } from "./icons";
import { S } from "../strings";
import type { UserProfile } from "../types";

interface SettingsModalProps {
  profile: UserProfile | null;
  onEditProfile: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onOpenTheme: () => void;
  onClose: () => void;
}

const settingsRow = "settings-row";

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile, onEditProfile, onExport, onImportFile, onOpenTheme, onClose,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = () => fileRef.current?.click();

  return (
    <Modal open onClose={onClose} sheetClass="theme-sheet">
      <ModalHeader title={S.settings.title} sub={profile ? profile.name : ""} onClose={onClose} />

      <div className="settings-list">
        <button className={settingsRow} onClick={() => { onClose(); onEditProfile(); }}>
          <span className="settings-row-icon"><EditIcon size={18} /></span>
          <span className="settings-row-label">{S.settings.editProfile}</span>
          <span className="settings-row-go"><ChevronDown size={16} /></span>
        </button>
        <button className={settingsRow} onClick={() => { onExport(); }}>
          <span className="settings-row-icon"><DownloadIcon size={18} /></span>
          <span className="settings-row-label">{S.settings.export}</span>
          <span className="settings-row-go"><ChevronDown size={16} /></span>
        </button>
        <button className={settingsRow} onClick={pickFile}>
          <span className="settings-row-icon"><UploadIcon size={18} /></span>
          <span className="settings-row-label">{S.settings.import}</span>
          <span className="settings-row-go"><ChevronDown size={16} /></span>
        </button>
        <button className={settingsRow} onClick={() => { onClose(); onOpenTheme(); }}>
          <span className="settings-row-icon"><PaletteIcon size={18} /></span>
          <span className="settings-row-label">{S.settings.theme}</span>
          <span className="settings-row-go"><ChevronDown size={16} /></span>
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onImportFile(file);
          e.target.value = "";
        }}
      />
    </Modal>
  );
};
