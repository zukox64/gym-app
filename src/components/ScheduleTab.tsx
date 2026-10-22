/**
 * تاب "خطط جاهزة" — التطبيق من قوالب (مولّد A1 + معدات A2) تحصل هنا.
 */

import * as React from "react";
import { useState } from "react";
import { CheckIcon, PaletteIcon } from "./icons";
import { buildPlanFromTemplate } from "../lib/templateBuilder";
import { EXERCISE_LIBRARY } from "../data/exerciseLibrary";
import { PLAN_TEMPLATES } from "../data/templates";
import { uid } from "../lib/id";
import { S } from "../strings";
import type { PlanTemplate, UserProfile, WorkoutDay } from "../types";

interface ScheduleTabProps {
  profile: UserProfile | null;
  setPlan: (next: WorkoutDay[]) => void;
  goToHome: () => void;
  onToast: (msg: string) => void;
  onOpenTheme: () => void;
}

const levelFilterLabel = (l: string): string =>
  l === "All" ? "كل الخطط" : l === "Beginner" ? "مبتدئ" : l === "Intermediate" ? "متوسط" : "متقدم";

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ profile, setPlan, goToHome, onToast, onOpenTheme }) => {
  const [tplFilter, setTplFilter] = useState("All");

  const applyTemplate = (template: PlanTemplate) => {
    const equipment = profile?.equipment ?? ["Full Gym"];
    const level = profile?.level ?? "Intermediate";
    const built = buildPlanFromTemplate(template, EXERCISE_LIBRARY, equipment, level);
    const newDays: WorkoutDay[] = built.map(b => ({ id: uid(), label: b.label, exercises: b.exercises }));
    const incomplete = built.filter(b => !b.complete).length;
    setPlan(newDays);
    goToHome();
    if (incomplete > 0) {
      onToast(incomplete === 1 ? S.schedule.appliedOne : S.schedule.appliedMany(incomplete));
    }
  };

  return (
    <>
      <header className="header sticky dash-header">
        <div className="dash-header-row">
          <div>
            <h1 className="dash-title">{S.schedule.title}</h1>
            <p className="dash-sub">{S.schedule.sub}</p>
          </div>
          <div className="dash-header-actions">
            <button className="icon-btn-circle" onClick={onOpenTheme} title={S.progress.theme}><PaletteIcon size={18} /></button>
          </div>
        </div>
      </header>
      <main className="main dash-main tpl-main">
        <div className="tpl-filters">
          {["All", "Beginner", "Intermediate", "Advanced"].map(l => (
            <button key={l} className={`tpl-filter ${tplFilter === l ? "tpl-filter-active" : ""}`} onClick={() => setTplFilter(l)}>
              {levelFilterLabel(l)}
            </button>
          ))}
        </div>
        <div className="templates-grid">
          {PLAN_TEMPLATES.filter(t => tplFilter === "All" || t.level === tplFilter).map(t => (
            <div key={t.id} className="template-card">
              <div className="tpl-top">
                <span className="tpl-count">{t.days}<em>يوم</em></span>
                <div className="tpl-head">
                  <h3 className="template-name">{t.name}</h3>
                  <p className="template-desc">{t.description}</p>
                </div>
              </div>
              <div className="template-meta">
                <span className={`template-badge ${t.level === "Beginner" ? "badge-beginner" : t.level === "Advanced" ? "badge-advanced" : "badge-mid"}`}>{S.levelLabel(t.level)}</span>
                <span className="template-pill">{t.split}</span>
              </div>
              <div className="template-days">
                {t.daysPlan.map((dp, idx) => (
                  <div key={idx} className="template-day-row">
                    <div className="template-day-dot" />
                    <span className="template-day-label">{dp.label}</span>
                  </div>
                ))}
              </div>
              <button className="template-apply" onClick={() => applyTemplate(t)}>
                <CheckIcon size={14} />
                <span>{S.schedule.apply}</span>
              </button>
            </div>
          ))}
        </div>
        {(tplFilter !== "All") && PLAN_TEMPLATES.filter(t => tplFilter === t.level).length === 0 && (
          <p className="day-empty">{S.schedule.emptyLevel}</p>
        )}
      </main>
    </>
  );
};
