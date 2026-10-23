/**
 * تاب "تماريني" — الأيام + الـ picker + التعديل + التسجيل السريع + اختيار اليوم للسيشن.
 * الحالات المحلية كلها جوه؛ الخطة نفسها بتعديل عبر setPlan (App يحفظ).
 */

import * as React from "react";
import { useState } from "react";
import {
  CheckIcon,
  ChevronDown,
  EditIcon,
  MinusIcon,
  PaletteIcon,
  PlayIcon,
  PlusIcon,
  SettingsIcon,
  TrashIcon,
  XIcon,
} from "./icons";
import { ExerciseThumb } from "./ExerciseThumb";
import { ExercisePicker } from "./ExercisePicker";
import { FinishModal } from "./FinishModal";
import { unitOf } from "../lib/units";
import { clampF, clampN, REPS_RANGE, SETS_RANGE, WEIGHT_KG_SET, WEIGHT_LBS_SET } from "../lib/validate";
import { todayKey } from "../lib/date";
import { uid } from "../lib/id";
import { EXERCISE_LIBRARY } from "../data/exerciseLibrary";
import { S } from "../strings";
import type { Exercise, LoggedExercise, UserProfile, WorkoutDay, WorkoutLog } from "../types";

interface HomeTabProps {
  days: WorkoutDay[];
  profile: UserProfile | null;
  setPlan: (next: WorkoutDay[]) => void;
  addLog: (entry: WorkoutLog) => void;
  startSession: (dayId: string) => void;
  onToast: (msg: string) => void;
  onOpenTheme: () => void;
  onOpenSettings: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ days, profile, setPlan, addLog, startSession, onToast, onOpenTheme, onOpenSettings }) => {
  const unit = unitOf(profile);

  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<{ dayId: string; ex: Exercise } | null>(null);
  const [editSets, setEditSets] = useState(3);
  const [editReps, setEditReps] = useState(12);
  const [editWeight, setEditWeight] = useState(0);
  const [pickerDayId, setPickerDayId] = useState<string | null>(null);
  const [swapMode, setSwapMode] = useState(false);
  const [newDayLabel, setNewDayLabel] = useState("");
  const [showAddDay, setShowAddDay] = useState(false);
  const [renamingDay, setRenamingDay] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [dayToFinish, setDayToFinish] = useState<WorkoutDay | null>(null);
  const [finishWeights, setFinishWeights] = useState<Record<string, number>>({});

  const addExerciseToDay = (dayId: string, libEx: Omit<Exercise, "id">) => {
    setPlan(days.map(d => d.id === dayId ? { ...d, exercises: [...d.exercises, { ...libEx, id: uid() }] } : d));
  };

  const removeExercise = (dayId: string, exId: string) => {
    setPlan(days.map(d => d.id === dayId ? { ...d, exercises: d.exercises.filter(e => e.id !== exId) } : d));
  };

  const saveExerciseEdit = () => {
    if (!editingExercise) return;
    // R2-1: الحفظ دايمًا جوه الحدود (مجموعات 1–20، ع stabilization 1–200، وزن ≥ 0)
    const setCap = SETS_RANGE;
    const repCap = REPS_RANGE;
    const wCap = (profile?.weightUnit ?? "kg") === "lbs" ? WEIGHT_LBS_SET : WEIGHT_KG_SET;
    setPlan(days.map(d => d.id === editingExercise.dayId
      ? { ...d, exercises: d.exercises.map(e => e.id === editingExercise.ex.id
          ? { ...e,
              sets: clampN(editSets, setCap[0], setCap[1]),
              reps: clampN(editReps, repCap[0], repCap[1]),
              weight: clampF(editWeight, wCap[0], wCap[1]) }
          : e) }
      : d));
    setEditingExercise(null);
  };

  const addDay = () => {
    if (!newDayLabel.trim()) return;
    setPlan([...days, { id: uid(), label: newDayLabel.trim(), exercises: [] }]);
    setNewDayLabel(""); setShowAddDay(false);
  };

  const removeDay = (dayId: string) => {
    setPlan(days.filter(d => d.id !== dayId));
    if (expandedDay === dayId) setExpandedDay(null);
  };

  const confirmRename = () => {
    if (!renamingDay || !renameValue.trim()) return;
    setPlan(days.map(d => d.id === renamingDay ? { ...d, label: renameValue.trim() } : d));
    setRenamingDay(null);
  };

  const openFinish = (day: WorkoutDay) => {
    const w: Record<string, number> = {};
    day.exercises.forEach(e => { w[e.id] = e.weight || 0; });
    setFinishWeights(w);
    setDayToFinish(day);
  };

  /** B2: تحريك تمرين داخل اليوم (↑/↓) */
  const moveExercise = (dayId: string, index: number, dir: -1 | 1) => {
    setPlan(days.map(d => {
      if (d.id !== dayId) return d;
      const next = [...d.exercises];
      const j = index + dir;
      if (j < 0 || j >= next.length) return d;
      [next[index], next[j]] = [next[j], next[index]];
      return { ...d, exercises: next };
    }));
  };

  /** B3: استبدال تمرين ببديل من نفس العضلة — نفس الـ id والمجموعات/الأوزان تفضل */
  const swapExercise = (dayId: string, ex: Exercise, replacement: { name: string; muscle: string; sets: number; reps: number }) => {
    setPlan(days.map(d => d.id === dayId
      ? { ...d, exercises: d.exercises.map(e => e.id === ex.id ? { ...e, name: replacement.name, muscle: replacement.muscle, sets: replacement.sets, reps: replacement.reps } : e) }
      : d));
  };

  const finishDay = () => {
    if (!dayToFinish) return;
    const logged: LoggedExercise[] = dayToFinish.exercises.map(e => ({
      name: e.name, muscle: e.muscle, sets: e.sets, reps: e.reps, weight: finishWeights[e.id] || 0,
    }));
    const volume = logged.reduce((s, e) => s + e.sets * e.reps * e.weight, 0);
    addLog({
      id: uid(), date: todayKey(), dayId: dayToFinish.id,
      dayLabel: dayToFinish.label, exercises: logged, volume,
    });
    // الصق الأوزان الجديدة في الخطة
    setPlan(days.map(d => d.id === dayToFinish.id
      ? { ...d, exercises: d.exercises.map(e => ({ ...e, weight: finishWeights[e.id] || 0 })) }
      : d));
    setDayToFinish(null);
    onToast(S.home.logged);
  };

  const beginSession = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    if (!day) return;
    if (day.exercises.length === 0) { onToast(S.session.emptyDay); return; }
    setShowDayPicker(false);
    setExpandedDay(null);
    startSession(dayId);
  };

  const totalExercises = days.reduce((s, d) => s + d.exercises.length, 0);
  const pickerDay = days.find(d => d.id === pickerDayId) ?? null;

  return (
    <>
      <header className="header sticky dash-header">
        <div className="dash-header-row">
          <div>
            <h1 className="dash-title">{S.home.title}</h1>
            <p className="dash-sub">{S.home.sub(totalExercises, days.length)}</p>
          </div>
          <div className="dash-header-actions">
            <button className="icon-btn-circle" onClick={onOpenTheme} title={S.progress.theme}><PaletteIcon size={18} /></button>
            <button className="icon-btn-circle" onClick={onOpenSettings}><SettingsIcon size={18} /></button>
          </div>
        </div>
      </header>

      <main className="main dash-main">
        <button className="start-workout-btn" onClick={() => setShowDayPicker(true)}>
          <PlayIcon size={15} />
          <span>{S.home.start}</span>
          <em>{S.home.daysReady(days.length)}</em>
        </button>
        {days.map(day => {
          const isExpanded = expandedDay === day.id;
          const exCount = day.exercises.length;
          const muscles = [...new Set(day.exercises.map(e => e.muscle))].slice(0, 3).join(", ");

          return (
            <div key={day.id} className={`day-card ${isExpanded ? "day-card-open" : ""}`}>
              {renamingDay === day.id ? (
                <div className="day-rename-row">
                  <input className="field-input day-rename-input" value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && confirmRename()}
                    autoFocus onBlur={confirmRename} />
                </div>
              ) : (
                <button className="day-card-header" onClick={() => setExpandedDay(isExpanded ? null : day.id)}>
                  <div className="day-card-left">
                    <div className={`day-card-icon ${isExpanded ? "day-card-icon-open" : ""}`}>
                      <ChevronDown size={18} />
                    </div>
                    <div>
                      <h3 className="day-card-title">{day.label}</h3>
                      <p className="day-card-meta">{exCount > 0 ? `${exCount} exercises · ${muscles}` : S.home.noEx}</p>
                    </div>
                  </div>
                  <div className="day-card-actions" onClick={e => e.stopPropagation()}>
                    <button className="day-action-btn" onClick={() => { setRenamingDay(day.id); setRenameValue(day.label); }} title={S.home.rename}>
                      <EditIcon size={14} />
                    </button>
                    <button className="day-action-btn day-action-danger" onClick={() => removeDay(day.id)} title={S.home.deleteDay}>
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </button>
              )}

              <div
                key={day.id + (isExpanded ? "-o" : "-c")}
                className={`day-card-body-wrap ${isExpanded ? "open" : ""}`}
                aria-hidden={!isExpanded}
              >
                <div className="day-card-body">
                  {day.exercises.length === 0 ? (
                    <p className="day-empty">{S.home.addHere}</p>
                  ) : (
                    <div className="ex-list">
                      {day.exercises.map((ex, i) => (
                        <div key={ex.id} className="ex-row" style={{ "--i": i } as React.CSSProperties}>
                          <div className="ex-num">{i + 1}</div>
                          <ExerciseThumb name={ex.name} muscle={ex.muscle} />
                          <div className="ex-info">
                            <p className="ex-name">{ex.name}</p>
                            <p className="ex-muscle">{ex.muscle}{ex.weight ? ` · ${ex.weight} ${unit}` : ""}</p>
                          </div>
                          <div className="ex-sets">{ex.sets}×{ex.reps}</div>
                          <div className="ex-row-actions">
                            <button className="ex-action" aria-label="تحريك لفوق" disabled={i === 0}
                              onClick={() => moveExercise(day.id, i, -1)}>
                              <ChevronDown size={13} style={{ transform: "rotate(180deg)" }} />
                            </button>
                            <button className="ex-action" aria-label="تحريك لتحت" disabled={i === day.exercises.length - 1}
                              onClick={() => moveExercise(day.id, i, 1)}>
                              <ChevronDown size={13} />
                            </button>
                            <button className="ex-action" onClick={() => { setEditingExercise({ dayId: day.id, ex }); setEditSets(ex.sets); setEditReps(ex.reps); setEditWeight(ex.weight || 0); }}>
                              <EditIcon size={14} />
                            </button>
                            <button className="ex-action ex-action-danger" onClick={() => removeExercise(day.id, ex.id)}>
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="add-exercise-btn" onClick={() => { setPickerDayId(day.id); }}>
                    <PlusIcon size={16} /> {S.home.addExercise}
                  </button>
                  {day.exercises.length > 0 && (
                    <button className="finish-btn" onClick={() => beginSession(day.id)}>
                      <PlayIcon size={15} />
                      <span>ابدأ تمرين اليوم ده</span>
                    </button>
                  )}
                  {day.exercises.length > 0 && (
                    <button className="quick-log-btn" onClick={() => openFinish(day)}>
                      <CheckIcon size={14} />
                      <span>{S.home.quickLog}</span>
                    </button>
                  )}
                </div>
                </div>
            </div>
          );
        })}

        {showAddDay ? (
          <div className="add-day-row">
            <input className="field-input day-rename-input" placeholder={S.home.dayLabelPh}
              value={newDayLabel} onChange={e => setNewDayLabel(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addDay()} autoFocus />
            <div className="add-day-btns">
              <button className="btn-save" onClick={addDay}>{S.home.apply}</button>
              <button className="btn-cancel" onClick={() => { setShowAddDay(false); setNewDayLabel(""); }}>{S.home.cancel}</button>
            </div>
          </div>
        ) : (
          <button className="add-day-card" onClick={() => setShowAddDay(true)}>
            <PlusIcon size={22} /> <span>{S.home.addNewDay}</span>
          </button>
        )}
      </main>

      {editingExercise && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => { setEditingExercise(null); setSwapMode(false); }} />
          <div className="modal-sheet" role="dialog" aria-modal="true" aria-label={S.home.editTitle}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{S.home.editTitle}</h3>
                <p className="modal-sub">{editingExercise.ex.name}</p>
              </div>
              <button className="close-btn" onClick={() => { setEditingExercise(null); setSwapMode(false); }}><XIcon size={22} /></button>
            </div>
            <div className="edit-fields">
              <div className="edit-field">
                <label className="ob-field-label">{S.home.sets}</label>
                <div className="stepper">
                  <button className="stepper-btn" onClick={() => setEditSets(s => Math.max(1, s - 1))}><MinusIcon /></button>
                  <span className="stepper-label">{editSets}</span>
                  <button className="stepper-btn" onClick={() => setEditSets(s => Math.min(20, s + 1))}><PlusIcon size={14} /></button>
                </div>
              </div>
              <div className="edit-field">
                <label className="ob-field-label">{S.home.reps}</label>
                <div className="stepper">
                  <button className="stepper-btn" onClick={() => setEditReps(r => Math.max(1, r - 1))}><MinusIcon /></button>                  <span className="stepper-label">{editReps}</span>
                  <button className="stepper-btn" onClick={() => setEditReps(r => Math.min(200, r + 1))}><PlusIcon size={14} /></button>
                </div>
              </div>
            </div>

            <div className="edit-field edit-field-wide">
              <div className="ob-field-label-row">
                <label className="ob-field-label">{S.home.weightPerSet}</label>
                <span className="edit-weight-hint">{unit}</span>
              </div>
              <div className="stepper stepper-wide">
                <button className="stepper-btn" onClick={() => setEditWeight(w => Math.min(500, Math.max(0, w - 2.5)))}><MinusIcon /></button>
                <span className="stepper-label">{editWeight}</span>
                <button className="stepper-btn" onClick={() => setEditWeight(w => Math.min(500, Math.max(0, w) + 2.5))}><PlusIcon size={14} /></button>
              </div>
            </div>

            {/* B3: استبدال ببديل نفس العضلة */}
            {swapMode ? (
              <>
                <h4 className="swap-title">{S.home.swapTitle}</h4>
                <div className="swap-list">
                  {EXERCISE_LIBRARY
                    .filter(lib => lib.muscle === editingExercise.ex.muscle && lib.name !== editingExercise.ex.name)
                    .slice(0, 8)
                    .map(lib => (
                      <button key={lib.name} className="picker-item" onClick={() => {
                        swapExercise(editingExercise.dayId, editingExercise.ex, { name: lib.name, muscle: lib.muscle, sets: lib.sets, reps: lib.reps });
                        setEditingExercise(null); setSwapMode(false);
                      }}>
                        <ExerciseThumb name={lib.name} muscle={lib.muscle} size={36} />
                        <span className="swap-name">{lib.name}</span>
                        <span className="swap-sets">{lib.sets}×{lib.reps}</span>
                      </button>
                    ))}
                  {EXERCISE_LIBRARY.filter(lib => lib.muscle === editingExercise.ex.muscle && lib.name !== editingExercise.ex.name).length === 0 && (
                    <p className="day-empty">مفيش بدائل لنفس العضلة</p>
                  )}
                </div>
              </>
            ) : (
              <button className="btn-cancel modal-swap-toggle" onClick={() => setSwapMode(true)}>
                {S.home.swapBtn}
              </button>
            )}

            <button className="btn-save modal-save" onClick={saveExerciseEdit}>{S.home.apply}</button>
          </div>
        </div>
      )}

      <ExercisePicker
        key={pickerDayId ?? "none"}
        day={pickerDayId ? pickerDay : null}
        equipment={profile?.equipment ?? []}
        onPick={ex => { if (pickerDayId) addExerciseToDay(pickerDayId, ex); }}
        onClose={() => setPickerDayId(null)}
      />

      {dayToFinish && (
        <FinishModal
          day={dayToFinish}
          unit={unit}
          weights={finishWeights}
          setWeights={setFinishWeights}
          onConfirm={finishDay}
          onClose={() => setDayToFinish(null)}
        />
      )}

      {showDayPicker && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setShowDayPicker(false)} />
          <div className="modal-sheet theme-sheet" dir="rtl" role="dialog" aria-modal="true" aria-label={S.home.pickDay}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{S.home.pickDay}</h3>
                <p className="modal-sub">{S.home.pickDaySub}</p>
              </div>
              <button className="close-btn" onClick={() => setShowDayPicker(false)}><XIcon size={22} /></button>
            </div>
            <div className="day-picker-list">
              {days.map(d => (
                <button key={d.id} className="day-pick-row" onClick={() => beginSession(d.id)}
                  disabled={d.exercises.length === 0}>
                  <span className="day-pick-label">{d.label}</span>
                  <span className="day-pick-meta">{d.exercises.length > 0 ? S.home.exCount(d.exercises.length) : S.home.empty}</span>
                  <span className="day-pick-go"><PlayIcon size={13} /></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
