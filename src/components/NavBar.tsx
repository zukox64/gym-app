/**
 * انتقالات الأسفل (bottom nav).
 */

import * as React from "react";
import { navItems } from "./icons";
import { FEATURES } from "../config";
import type { Page } from "../types";

export const NavBar: React.FC<{ page: Page; onGo: (p: Page) => void }> = ({ page, onGo }) => (
  <nav className="bottom-nav" dir="ltr">
    <div className="nav-inner">
      {navItems
        .filter(item => FEATURES.ai || item.page !== "AI")
        .map(({ page: p, Icon }) => (
          <button key={p} onClick={() => onGo(p)}
            className={`nav-item ${page === p ? "nav-active" : "nav-inactive"}`}>
            <span className={`nav-icon-wrap ${page === p ? "nav-icon-active" : ""}`}><Icon size={20} /></span>
          </button>
        ))}
    </div>
  </nav>
);
