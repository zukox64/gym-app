/**
 * مودال "خلصت التمرين؟" — عرض فقط؛ weights/الـ confirm مملوكين للـ caller
 * (سلوك مطابق للكود الأصلي: openFinish بيجمع الأوزان الحالية).
 */

import * as React from "react";
import { Modal, ModalHeader } from "./ui/Modal";
import { celebrate } from "../lib/confetti";
import { buzz } from "../lib/motion";
import { MinusIcon, PlusIcon } from "./icons";
import { ExerciseThumb } from "./ExerciseThumb";
import type { WorkoutDay } from "../types";

interface FinishModalProps {
  day: WorkoutDay;
  unit: string;
  weights: Record<string, number>;
  setWeights: (next: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export const FinishModal: React.FC<FinishModalProps> = ({ day, unit, weights, setWeights, onConfirm, onClose }) => {
  const finishTotal = day.exercises.reduce((s, e) => s + e.sets * e.reps * (weights[e.id] || 0), 0);

  return (
    <Modal open onClose={onClose} sheetClass="finish-sheet">
      <ModalHeader title="خلصت التمرين؟" sub={`${day.label} · ${day.exercises.length} تمارين`} onClose={onClose} />
      <div className="finish-list">
        {day.exercises.map(e => (
          <div key={e.id} className="finish-row">
            <ExerciseThumb name={e.name} muscle={e.muscle} size={34} />
            <div className="finish-info">
              <p className="ex-name">{e.name}</p>
              <p className="ex-muscle">{e.sets} × {e.reps}</p>
            </div>
            <div className="weight-stepper">
              <button className="stepper-btn stepper-btn-sm" onClick={() => setWeights(w => ({ ...w, [e.id]: Math.max(0, (w[e.id] || 0) - 2.5) }))}><MinusIcon /></button>
              <span className="weight-val">{weights[e.id] || 0}<em>{unit}</em></span>
              <button className="stepper-btn stepper-btn-sm" onClick={() => setWeights(w => ({ ...w, [e.id]: (w[e.id] || 0) + 2.5 }))}><PlusIcon size={12} /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="finish-total">
        <span>إجمالي الوزن المرفوع</span>
        <strong>{finishTotal > 0 ? finishTotal.toLocaleString() : 0} {unit}</strong>
      </div>
      <button className="continue-btn finish-confirm" onClick={() => { buzz(30); celebrate(); onConfirm(); }}>سجّل التمرين</button>
    </Modal>
  );
};
