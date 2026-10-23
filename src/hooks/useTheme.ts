import { useEffect, useState } from "react";
import type { ThemeKey } from "../types";
import { STORAGE_KEYS } from "../config";

export interface ThemeDef { key: ThemeKey; label: string; swatch: string; group: "dark" | "light" | "amoled" }

/** الثيمات الثمانية (R2-2) — labels عربية */
export const THEMES: ThemeDef[] = [
  { key: "mono", label: "أسود", swatch: "#f5f6f7", group: "dark" },
  { key: "emerald", label: "زمردي", swatch: "#22c55e", group: "dark" },
  { key: "orange", label: "غروب", swatch: "#f97316", group: "dark" },
  { key: "violet", label: "بنفسجي", swatch: "#8b5cf6", group: "dark" },
  { key: "cyan", label: "جليدي", swatch: "#06b6d4", group: "dark" },
  { key: "rose", label: "وردي", swatch: "#f43f5e", group: "dark" },
  { key: "light", label: "فاتح", swatch: "#111318", group: "light" },
  { key: "amoled", label: "أولي (OLED)", swatch: "#000000", group: "amoled" },
];

/** أول تشغيل: اتبع تفضيل النظام (R2-2) — فاتح لو النظام فاتح، وإلا الداكن */
export const systemPreferredTheme = (): ThemeKey => {
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "mono";
  } catch {
    return "mono";
  }
};

export const useTheme = (): { theme: ThemeKey; setTheme: (t: ThemeKey) => void } => {
  const [theme, setTheme] = useState<ThemeKey>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.theme) as ThemeKey | null;
      if (saved && THEMES.some(t => t.key === saved)) return saved;
      return systemPreferredTheme();
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
