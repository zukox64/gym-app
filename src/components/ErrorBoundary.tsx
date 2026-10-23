/**
 * ErrorBoundary (A7) — أي كراش في شجرة العرض بيقفل على شاشة أمان بدل الصفحة البيضاء،
 * والبيانات كلها localStorage فأمانة المستخدم محفوظة.
 */

import * as React from "react";
import { Component } from "react";
import { S } from "../strings";

interface BoundaryProps { children: React.ReactNode }
interface BoundaryState { hasError: boolean }

export class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    // للتصحيح — الكراش مش بيضيع في الصمت
    console.error("ErrorBoundary:", error, info.componentStack);
  }

  private reload = (): void => {
    // الحالة كلها على localStorage فما فيش فقدان بيانات — إعادة تحميل نظيفة
    window.location.reload();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="error-boundary" dir="rtl">
        <div className="error-boundary-card">
          <h1>{S.errorBoundary.title}</h1>
          <p>{S.errorBoundary.sub}</p>
          <button className="continue-btn" onClick={this.reload}>{S.errorBoundary.reload}</button>
        </div>
      </div>
    );
  }
}
