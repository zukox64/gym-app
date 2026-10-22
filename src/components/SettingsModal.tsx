/**
 * مودال الإعدادات (A7) — تعديل الملف الشخصي + تصدير/استيراد النسخة الاحتياطية + الثيم.
 * الاستيراد نفسه: input[file] مخفي هنا؛ App بيتولى الـ parseBundle.
 */

import * as React from "react";
import { useRef } from "react";
import { Modal, ModalHeader } from "./ui/Modal";
import { ChevronDown, DownloadIcon, EditIcon, MinusIcon, PaletteIcon, PlusIcon, UploadIcon } from "./icons";
import { REST_RANGE } from "../config";
import { S } from "../strings";
import type { UserProfile } from "../types";

interface SettingsModalProps {
  profile: UserProfile | null;
  onEditProfile: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onRestDelta: (delta: number) => void;
  onExportCsv: () => void;
  onOpenTheme: () => void;
  onClose: () => void;
}

const settingsRow = "settings-row";

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile, onEditProfile, onExport, onImportFile, onRestDelta, onExportCsv, onOpenTheme, onClose,
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
        {/* B9: CSV */}
        <button className={settingsRow} onClick={() => { onExportCsv(); }}>
          <span className="settings-row-icon"><DownloadIcon size={18} /></span>
          <span className="settings-row-label">{S.settings.exportCsv}</span>
          <span className="settings-row-go"><ChevronDown size={16} /></span>
        </button>
        <button className={settingsRow} onClick={() => { onClose(); onOpenTheme(); }}>
          <span className="settings-row-icon"><PaletteIcon size={18} /></span>
          <span className="settings-row-label">{S.settings.theme}</span>
          <span className="settings-row-go"><ChevronDown size={16} /></span>
        </button>
      </div>

      {/* B1: الاستراحة الافتراضية — stepper ±15 داخل الحدود */}
      <div className="settings-rest">
        <span className="settings-rest-label">{S.settings.rest}</span>
        <div className="weight-stepper">
          <button className="stepper-btn stepper-btn-sm" onClick={() => onRestDelta(-15)}
            disabled={(profile?.restSeconds ?? 0) <= REST_RANGE[0]}><MinusIcon /></button>
          <span className="weight-val">{profile?.restSeconds ?? 90}<em>ث</em></span>
          <button className="stepper-btn stepper-btn-sm" onClick={() => onRestDelta(15)}
            disabled={(profile?.restSeconds ?? 90) >= REST_RANGE[1]}><PlusIcon size={12} /></button>
        </div>
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
