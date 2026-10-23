/**
 * R2-2: أساسيات الواجهة الموحّدة — مكان واحد لكل عناصر UI المتكررة.
 * كلها مبنية على توكنات CSS (تركب/ألوان/حركة)، ومتوافقة مع prefers-reduced-motion عبر قاعدة عامة في index.css.
 */

import * as React from "react";

/* ===== Button ===== */
export type BtnVariant = "solid" | "ghost" | "danger";

export interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  block?: boolean;
}

export const Btn: React.FC<BtnProps> = ({ variant = "solid", block, className, children, ...rest }) => (
  <button
    className={`btn btn-${variant}${block ? " btn-block" : ""}${className ? ` ${className}` : ""}`}
    {...rest}
  >
    {children}
  </button>
);

/* ===== Card ===== */
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { title?: string; badge?: string }> = ({
  title, badge, className, children, ...rest
}) => (
  <div className={`card${className ? ` ${className}` : ""}`} {...rest}>
    {(title || badge) && (
      <div className="card-head-row">
        {title && <h3 className="card-title">{title}</h3>}
        {badge && <span className="card-badge chip chip-brand">{badge}</span>}
      </div>
    )}
    {children}
  </div>
);

/* ===== Chip ===== */
export const Chip: React.FC<React.HTMLAttributes<HTMLSpanElement> & { brand?: boolean }> = ({
  brand, className, children, ...rest
}) => (
  <span className={`chip${brand ? " chip-brand" : ""}${className ? ` ${className}` : ""}`} {...rest}>
    {children}
  </span>
);

/* ===== Segmented ===== */
export interface SegmentedOption<T extends string> { value: T; label: string }

export const Segmented = <T extends string>({ options, value, onChange, ariaLabel }: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
}): React.ReactElement => (
  <div className="segmented" role="group" aria-label={ariaLabel}>
    {options.map(o => (
      <button key={o.value} aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
        {o.label}
      </button>
    ))}
  </div>
);

/* ===== Stepper ===== */
export const Stepper = ({ value, onDelta, min, max, step = 1, unit, label }: {
  value: number;
  onDelta: (next: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  label?: string;
}): React.ReactElement => (
  <div className="weight-stepper" role="group" aria-label={label}>
    <button className="stepper-btn stepper-btn-sm" aria-label="أنقص"
      disabled={value <= min} onClick={() => onDelta(Math.max(min, value - step))}>−</button>
    <span className="weight-val num" aria-live="polite">
      {value}
      {unit && <em>{unit}</em>}
    </span>
    <button className="stepper-btn stepper-btn-sm" aria-label="زد"
      disabled={value >= max} onClick={() => onDelta(Math.min(max, value + step))}>+</button>
  </div>
);

/* ===== ProgressRing (حلقة دائرية SVG) ===== */
export const ProgressRing = ({ pct, size = 84, stroke = 8, children }: {
  pct: number; size?: number; stroke?: number; children?: React.ReactNode;
}): React.ReactElement => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <span className="ring-wrap" style={{ width: size, height: size, position: "relative" }} role="img">
      <svg width={size} height={size} aria-hidden="true">
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle className="ring-fill" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - clamped)} />
      </svg>
      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </span>
    </span>
  );
};

/* ===== Skeleton ===== */
export const Skeleton = ({ h = 14, w, className }: { h?: number; w?: string | number; className?: string }) => (
  <span className={`sk${className ? ` ${className}` : ""}`} style={{ height: h, width: w }} aria-hidden="true" />
);

/* ===== EmptyState — رسمة SVG ليها شخصية ===== */
export type EmptyIllu = "dumbbell" | "calendar" | "trophy" | "scale";

const Illu: React.FC<{ kind: EmptyIllu }> = ({ kind }) => {
  if (kind === "calendar") {
    return (
      <svg viewBox="0 0 96 64" aria-hidden="true">
        <rect x="12" y="10" width="72" height="48" rx="8" fill="var(--surface-2)" stroke="var(--border)" />
        <line x1="12" y1="24" x2="84" y2="24" stroke="var(--border)" strokeWidth="2" />
        <rect x="20" y="32" width="12" height="8" rx="2" fill="var(--brand-weak)" />
        <rect x="42" y="32" width="12" height="8" rx="2" fill="var(--brand-weak)" />
        <rect x="64" y="42" width="12" height="8" rx="2" fill="var(--brand-weak)" />
      </svg>
    );
  }
  if (kind === "trophy") {
    return (
      <svg viewBox="0 0 96 64" aria-hidden="true">
        <path d="M38 12h20v14a10 10 0 0 1-20 0V12z" fill="var(--gold)" opacity=".9" />
        <path d="M38 16h-8a8 8 0 0 0 8 9M58 16h8a8 8 0 0 1-8 9" stroke="var(--gold)" fill="none" strokeWidth="2" />
        <rect x="44" y="36" width="8" height="10" fill="var(--surface-3)" />
        <rect x="36" y="46" width="24" height="6" rx="2" fill="var(--surface-3)" />
        <circle cx="78" cy="14" r="3" fill="var(--brand)" opacity=".6" />
        <circle cx="16" cy="20" r="2" fill="var(--brand)" opacity=".4" />
      </svg>
    );
  }
  if (kind === "scale") {
    return (
      <svg viewBox="0 0 96 64" aria-hidden="true">
        <ellipse cx="48" cy="46" rx="30" ry="10" fill="var(--surface-2)" stroke="var(--border)" />
        <path d="M28 44a20 12 0 0 1 40 0" fill="var(--surface-3)" />
        <line x1="48" y1="36" x2="56" y2="30" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="58" cy="28" r="2.5" fill="var(--brand)" />
      </svg>
    );
  }
  /* دمبل */
  return (
    <svg viewBox="0 0 96 64" aria-hidden="true">
      <g transform="rotate(-30 48 32)">
        <rect x="30" y="28" width="36" height="8" rx="4" fill="var(--surface-3)" />
        <rect x="22" y="20" width="9" height="24" rx="3" fill="var(--brand)" opacity=".85" />
        <rect x="65" y="20" width="9" height="24" rx="3" fill="var(--brand)" opacity=".85" />
      </g>
      <circle cx="82" cy="16" r="2.5" fill="var(--brand)" opacity=".5" />
      <circle cx="14" cy="48" r="2" fill="var(--brand)" opacity=".35" />
    </svg>
  );
};

export const EmptyState = ({ kind = "dumbbell", title, sub, action }: {
  kind?: EmptyIllu;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) => (
  <div className="empty-illu" role="status">
    <Illu kind={kind} />
    <p className="empty-title">{title}</p>
    {sub && <p className="empty-sub">{sub}</p>}
    {action}
  </div>
);

/* ===== BottomSheet ===== */
import { Modal } from "./Modal";

export const BottomSheet = ({ open, onClose, label, children }: {
  open: boolean; onClose: () => void; label: string; children: React.ReactNode;
}) => (
  <Modal open={open} onClose={onClose} sheetClass="bottom-sheet" label={label}>
    {children}
  </Modal>
);
