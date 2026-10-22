import { useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "../config";
import { sanitizeLogs } from "../lib/migrations";
import type { WorkoutLog } from "../types";

/** اللوجز — история التمرينات, مع إضافة جاهزة في الأول */
export const useWorkoutLogs = (): { logs: WorkoutLog[]; setLogs: (next: WorkoutLog[] | ((prev: WorkoutLog[]) => WorkoutLog[])) => void; addLog: (entry: WorkoutLog) => void } => {
  const [logs, setLogs] = useLocalStorage<WorkoutLog[]>(STORAGE_KEYS.logs, () => [], { validate: sanitizeLogs });
  const addLog = useMemo(() => (entry: WorkoutLog) => setLogs(prev => [entry, ...prev]), [setLogs]);
  return { logs, setLogs, addLog };
};
