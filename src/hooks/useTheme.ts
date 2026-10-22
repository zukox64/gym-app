import { useEffect, useState } from "react";
import type { ThemeKey } from "../types";
import { STORAGE_KEYS } from "../config";

export interface ThemeDef { key: ThemeKey; label: string; swatch: string }

/** الثيمات — labels بالعربي (C هيضيف ثيمات جديدة على نفس القايمة) */
export const THEMES: ThemeDef[] = [
  { key: "mono", label: "Dark", swatch: "#f5f6f7" },
  { key: "emerald", label: "Emerald", swatch: "#22c55e" },
  { key: "orange", label: "Sunset", swatch: "#f97316" },
  { key: "violet", label: "Violet", swatch: "#8b5cf6" },
  { key: "cyan", label: "Ice", swatch: "#06b6d4" },
  { key: "rose", label: "Rose", swatch: "#f43f5e" },
];

export const useTheme = (): { theme: ThemeKey; setTheme: (t: ThemeKey) => void } => {
  const [theme, setTheme] = useState<ThemeKey>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEYS.theme) as ThemeKey) || "mono";
    } catch {
      return "mono";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(STORAGE_KEYS.theme, theme); } catch { /* ignore */ }
  }, [theme]);

  return { theme, setTheme };
};
