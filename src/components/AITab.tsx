/**
 * تاب المدرب الذكي — للسياش placeholder؛ بيتفعّل من FEATURES.ai (A7).
 */

import * as React from "react";
import { ChatIcon } from "./icons";

export const AITab: React.FC = () => (
  <>
    <header className="header sticky dash-header">
      <div className="dash-header-row">
        <div>
          <h1 className="dash-title">المدرب الذكي</h1>
          <p className="dash-sub">قريب جداً</p>
        </div>
      </div>
    </header>
    <main className="main dash-main">
      <div className="card empty-state-card">
        <div className="empty-icon"><ChatIcon size={26} /></div>
        <h3 className="card-title">المدرب الذكي جاي في الطريق</h3>
        <p className="empty-sub">هيسألك عن هدفك ويبني لك خطة على مقاسك، ويعدّلها حسب تقدمك.</p>
      </div>
    </main>
  </>
);
