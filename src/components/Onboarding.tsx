/**
 * الـ Hero + الخطوات الأربعة لل_onboarding + تعديل الملف الشخصي — كل الحالة المحلية جوه (A4).
 * النسخ بالعربي (توحيد اللغة A7) — القيم المخزَّنة (goal/level) تفضل English زي ما هي.
 */

import * as React from "react";
import { useState } from "react";
import { DumbbellIcon } from "./icons";
import { EQUIPMENT_OPTIONS } from "../data/equipment";
import { GOAL_OPTIONS, LEVEL_OPTIONS } from "../config";
import { uid } from "../lib/id";
import {
  ageError,
  clampedProfile,
  heightError,
  nameError,
  targetError,
  weightError,
} from "../lib/validate";
import type { UserProfile, WorkoutDay } from "../types";
import { S } from "../strings";

interface OnboardingProps {
  /** لو فيه ملف محفوظ — بقى تعديل (Settings) */
  existing: UserProfile | null;
  onSave: (profile: UserProfile, plan: WorkoutDay[]) => void;
  onCancel: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ existing, onSave, onCancel }) => {
  const [showIntro, setShowIntro] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState(existing?.name ?? "");
  const [age, setAge] = useState<number | "">(existing?.age ?? "");
  const [weight, setWeight] = useState<number | "">(existing?.weight ?? "");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">(existing?.weightUnit ?? "lbs");
  const [height, setHeight] = useState<number | "">(existing?.height ?? "");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">(existing?.heightUnit ?? "cm");
  const [goal, setGoal] = useState(existing?.goal ?? "");
  const [targetWeight, setTargetWeight] = useState<number | "">(existing?.targetWeight ?? "");
  const [level, setLevel] = useState(existing?.level ?? "");
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(existing?.daysPerWeek ?? null);
  const [equipment, setEquipment] = useState<string[]>(existing ? [...existing.equipment] : []);
  const [error, setError] = useState("");
  /** A7: الأخطاء الحقلية تظهر بعد محاولة تمرين فاشلة (مش أثناء الكتابة) */
  const [showErrors, setShowErrors] = useState(false);

  const toggleEquipment = (item: string) =>
    setEquipment(p => p.includes(item) ? p.filter(i => i !== item) : [...p, item]);

  const errName = showErrors ? nameError(name) : null;
  const errAge = showErrors ? ageError(age) : null;
  const errWeight = showErrors ? weightError(weight, weightUnit) : null;
  const errHeight = showErrors ? heightError(height, heightUnit) : null;
  const errTarget = showErrors ? targetError(targetWeight, weightUnit) : null;

  /** التحقق قبل الانتقال — لو فيه غلطة بنعرض الأخطاء بدل ما نمنع الضغطة أصلًا */
  const tryAdvance = () => {
    setShowErrors(true);
    if (step === 1 && nameError(name)) return;
    if (step === 2 && (ageError(age) || weightError(weight, weightUnit) || heightError(height, heightUnit))) return;
    if (step === 3 && (!!targetError(targetWeight, weightUnit) || !goal || !level || !daysPerWeek || equipment.length === 0)) return;
    setError("");
    setStep(s => Math.min(4, s + 1));
  };

  const finish = () => {
    const invalid = nameError(name) || ageError(age) || weightError(weight, weightUnit)
      || heightError(height, heightUnit) || !!targetError(targetWeight, weightUnit)
      || !goal || !level || !daysPerWeek || equipment.length === 0;
    if (invalid) { setShowErrors(true); setError(S.onboarding.incomplete); return; }
    const clamped = clampedProfile({
      age: Number(age), weight: Number(weight), weightUnit,
      height: Number(height), heightUnit, targetWeight: Number(targetWeight),
    });
    const p: UserProfile = {
      name: name.trim(), ...clamped,
      weightUnit, heightUnit, goal,
      level, daysPerWeek: daysPerWeek!, equipment,
    };
    // سلوك الأصلي: الحفظ بيعمل خطة فاضية بعدد أيام الأسبوع (يتعبّى منها)
    const plan: WorkoutDay[] = Array.from({ length: p.daysPerWeek }, (_, i) => ({
      id: uid(), label: `Day ${i + 1}`, exercises: [],
    }));
    onSave(p, plan);
    setError(""); setStep(1);
  };

  /* ===== الـ Hero ===== */
  if (!showIntro && !existing) {
    return (
      <div className="hero" dir="rtl">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            {S.hero.badge}
          </div>

          <h1 className="hero-title">
            شيل تقيل،<br />
            <span className="hero-title-accent">وكبّر كل شهر.</span>
          </h1>

          <p className="hero-sub">
            خطط جاهزة تطبقها بضغطة، تتبّع لكل كيلو شلته، وتقرير شهري
            يوريك بالفلوس قد إيه اتطورت.
          </p>

          <div className="hero-chips">
            <div className="hero-chip"><strong>85</strong><span>تمرين</span></div>
            <div className="hero-chip"><strong>11</strong><span>خطط جاهزة</span></div>
            <div className="hero-chip"><strong>∞</strong><span>تتبع شهري</span></div>
          </div>

          <button className="hero-cta" onClick={() => setShowIntro(true)}>
            <DumbbellIcon size={20} />
            {S.hero.cta}
          </button>

          <p className="hero-foot">{S.hero.foot}</p>
        </div>
      </div>
    );
  }

  /* ===== الخطوات ===== */
  return (
    <div className="onboarding">
      <div className="ob-topbar">
        {step > 1 ? (
          <button className="ob-back-btn" onClick={() => setStep(s => Math.max(1, s - 1))}><span className="arrow-l">‹</span></button>
        ) : <span className="ob-topbar-spacer" />}
        <div className="ob-progress">
          {[1, 2, 3, 4].map(s => <span key={s} className={`ob-dot ${s <= step ? "ob-dot-active" : ""}`} />)}
        </div>
        {existing
          ? <button className="ob-cancel-btn" onClick={onCancel}>{S.onboarding.cancel}</button>
          : <span className="ob-topbar-spacer" />}
      </div>

      <div className="ob-content" key={step}>
        {step === 1 && (
          <>
            <h1 className="ob-question">{S.onboarding.qName}</h1>
            <input className="field-input ob-name-input" type="text" value={name}
              onChange={e => setName(e.target.value)} placeholder={S.onboarding.phName} autoFocus />
            {errName && <p className="field-error">{errName}</p>}
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="ob-question">{S.onboarding.qAbout}</h1>
            <div className="ob-field-group">
              <label className="ob-field-label">{S.onboarding.age}</label>
              <input className="field-input" type="number" inputMode="numeric" value={age}
                onChange={e => setAge(e.target.value === "" ? "" : Number(e.target.value))} placeholder={S.onboarding.years} />
              {errAge && <p className="field-error">{errAge}</p>}
            </div>
            <div className="ob-field-group">
              <div className="ob-field-label-row">
                <label className="ob-field-label">{S.onboarding.weight}</label>
                <div className="unit-toggle">
                  <button type="button" className={weightUnit === "lbs" ? "unit-btn unit-btn-active" : "unit-btn"} onClick={() => setWeightUnit("lbs")}>lbs</button>
                  <button type="button" className={weightUnit === "kg" ? "unit-btn unit-btn-active" : "unit-btn"} onClick={() => setWeightUnit("kg")}>kg</button>
                </div>
              </div>
              <input className="field-input" type="number" inputMode="numeric" value={weight}
                onChange={e => setWeight(e.target.value === "" ? "" : Number(e.target.value))} placeholder={S.onboarding.weight} />
              {errWeight && <p className="field-error">{errWeight}</p>}
            </div>
            <div className="ob-field-group">
              <div className="ob-field-label-row">
                <label className="ob-field-label">{S.onboarding.height}</label>
                <div className="unit-toggle">
                  <button type="button" className={heightUnit === "cm" ? "unit-btn unit-btn-active" : "unit-btn"} onClick={() => setHeightUnit("cm")}>cm</button>
                  <button type="button" className={heightUnit === "ft" ? "unit-btn unit-btn-active" : "unit-btn"} onClick={() => setHeightUnit("ft")}>ft</button>
                </div>
              </div>
              <input className="field-input" type="number" inputMode="numeric" value={height}
                onChange={e => setHeight(e.target.value === "" ? "" : Number(e.target.value))} placeholder={S.onboarding.height} />
              {errHeight && <p className="field-error">{errHeight}</p>}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="ob-question">{S.onboarding.qGoal}</h1>
            {GOAL_OPTIONS.map(opt => (
              <label key={opt} className={`option ${goal === opt ? "option-selected" : ""}`}>
                <input type="radio" name="goal" checked={goal === opt} onChange={() => setGoal(opt)} /><span>{S.goalLabel(opt)}</span>
              </label>
            ))}
            <div className="ob-field-group">
              <label className="ob-field-label">{S.onboarding.qTarget} ({weightUnit})</label>
              <input className="field-input" type="number" inputMode="numeric" value={targetWeight}
                onChange={e => setTargetWeight(e.target.value === "" ? "" : Number(e.target.value))} placeholder={S.onboarding.phTarget} />
              {errTarget && <p className="field-error">{errTarget}</p>}
            </div>
            <h2 className="question-title ob-subheading">{S.onboarding.qLevel}</h2>
            {LEVEL_OPTIONS.map(opt => (
              <label key={opt} className={`option ${level === opt ? "option-selected" : ""}`}>
                <input type="radio" name="level" checked={level === opt} onChange={() => setLevel(opt)} /><span>{S.levelLabel(opt)}</span>
              </label>
            ))}
            <h2 className="question-title ob-subheading">{S.onboarding.qDays}</h2>
            <div className="day-btn-row">
              {[2, 3, 4, 5, 6].map(d => (
                <button key={d} type="button" onClick={() => setDaysPerWeek(d)}
                  className={`day-btn ${daysPerWeek === d ? "day-btn-active" : ""}`}>{d}</button>
              ))}
            </div>
            <h2 className="question-title ob-subheading">{S.onboarding.qEquipment}</h2>
            {EQUIPMENT_OPTIONS.map(item => (
              <label key={item} className={`option ${equipment.includes(item) ? "option-selected" : ""}`}>
                <input type="checkbox" checked={equipment.includes(item)} onChange={() => toggleEquipment(item)} /><span>{S.equipmentLabel(item)}</span>
              </label>
            ))}
          </>
        )}
        {step === 4 && (
          <div className="ob-summary">
            <h1 className="ob-question">{S.onboarding.done(name)}</h1>
            <div className="card summary-card">
              <div className="summary-row"><span className="summary-label">{S.onboarding.lblGoal}</span><span className="summary-value">{S.goalLabel(goal)}</span></div>
              <div className="summary-row"><span className="summary-label">{S.onboarding.lblTarget}</span><span className="summary-value">{targetWeight}{weightUnit}</span></div>
              <div className="summary-row"><span className="summary-label">{S.onboarding.lblLevel}</span><span className="summary-value">{S.levelLabel(level)}</span></div>
              <div className="summary-row"><span className="summary-label">{S.onboarding.lblDays}</span><span className="summary-value">{daysPerWeek} {S.onboarding.daysWeek}</span></div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-box ob-error">{error}</div>}

      <div className="bottom-bar">
        {step < 4 ? (
          <button className="continue-btn" onClick={tryAdvance}>{S.onboarding.next}</button>
        ) : (
          <button className="continue-btn" onClick={finish}>
            {existing ? S.onboarding.save : S.onboarding.start}
          </button>
        )}
      </div>
    </div>
  );
};
