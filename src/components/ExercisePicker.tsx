/**
 * انتقاء التمارين (A2: الفلتر الافتراضي حسب معدات المستخدم + "إظهار الكل").
 */

import * as React from "react";
import { useMemo, useState } from "react";
import { Modal, ModalHeader } from "./ui/Modal";
import { PlusIcon, XIcon } from "./icons";
import { ExerciseThumb } from "./ExerciseThumb";
import { EXERCISE_LIBRARY } from "../data/exerciseLibrary";
import { equipmentCompatible } from "../lib/templateBuilder";
import type { LibraryEntry, WorkoutDay } from "../types";

interface PickerProps {
  day: WorkoutDay | null;
  equipment: string[];
  onPick: (ex: LibraryEntry) => void;
  onClose: () => void;
}

export const ExercisePicker: React.FC<PickerProps> = ({ day, equipment, onPick, onClose }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAllEquip, setShowAllEquip] = useState(false);

  const filtered = useMemo(() => EXERCISE_LIBRARY.filter(e => {
    // A2: افتراضيًا نعرض الحركات اللي تنفع مع معدات المستخدم، مع زر "حسب معداتي/الكل"
    if (!showAllEquip && equipment.length > 0 && !equipmentCompatible(e, equipment)) return false;
    if (filter !== "All" && e.muscle !== filter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [equipment, showAllEquip, filter, search]);

  const muscleFilters = ["All", ...Array.from(new Set(EXERCISE_LIBRARY.map(e => e.muscle)))];

  return (
    <Modal open={day !== null} onClose={onClose}>
      <ModalHeader title="Add Exercise" sub={day?.label} onClose={onClose} />
      <input className="field-input picker-search" placeholder="Search exercises..."
        value={search} onChange={e => setSearch(e.target.value)} />

      <div className="picker-filters">
        {muscleFilters.map(f => (
          <button key={f} className={`picker-filter ${filter === f ? "picker-filter-active" : ""}`}
            onClick={() => setFilter(f)}>{f}</button>
        ))}
        <button className={`picker-filter ${showAllEquip ? "picker-filter-active" : ""}`}
          onClick={() => setShowAllEquip(v => !v)}>{showAllEquip ? "الكل بالكامل" : "حسب معداتي"}</button>
      </div>

      <div className="picker-list">
        {filtered.map((ex, i) => (
          <button key={i} className="picker-item" onClick={() => onPick(ex)}>
            <ExerciseThumb name={ex.name} muscle={ex.muscle} />
            <div className="picker-item-info">
              <p className="ex-name">{ex.name}</p>
              <p className="ex-muscle">{ex.muscle} · {ex.sets}×{ex.reps}</p>
            </div>
            <div className="picker-item-add"><PlusIcon size={16} /></div>
          </button>
        ))}
        {filtered.length === 0 && <p className="day-empty">No exercises found</p>}
      </div>
    </Modal>
  );
};

export const PickerCloseIcon = XIcon;
