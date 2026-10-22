/**
 * عناصر التاب السفلي — في ملف مستقل عن icons.tsx
 * عشان قاعدة fast-refresh (الملف لا يصدّر إلا الثابت).
 */

import { BarChartIcon, CalendarIcon, ChatIcon, GridIcon } from "./icons";
import type { NavEntry } from "./icons";

export const navItems: NavEntry[] = [
  { page: "Home", Icon: GridIcon },
  { page: "Schedule", Icon: CalendarIcon },
  { page: "Progress", Icon: BarChartIcon },
  { page: "AI", Icon: ChatIcon },
];
