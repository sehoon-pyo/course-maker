import { Component, type ErrorInfo, type ReactNode } from "react";

/** 슬라이드를 그리다 난 오류(없는 layout, 없는 슬롯 등)를 화면 전체가 멈추지 않게 슬라이드 자리에 보여 준다. */
export class SlideErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.error) return <pre className="slide-error">{this.state.error.message}</pre>;
    return this.props.children;
  }
}
