import type { ReactNode } from "react";

interface TopBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  /** 현재 위치 (course / chapter / section / slide) */
  crumbs: string[];
  /** 오른쪽 영역. 버튼 등 상단에 넣을 항목을 여기에 추가한다. */
  children?: ReactNode;
}

/** 미리보기 창 상단 네비게이션 바 */
export function TopBar({ sidebarOpen, onToggleSidebar, crumbs, children }: TopBarProps) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar-toggle"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "사이드바 접기" : "사이드바 펼치기"}
        aria-expanded={sidebarOpen}
        title={sidebarOpen ? "사이드바 접기" : "사이드바 펼치기"}
      >
        ☰
      </button>
      <nav className="breadcrumb" aria-label="현재 위치">
        {crumbs.map((crumb, i) => (
          <span key={i}>{crumb}</span>
        ))}
      </nav>
      <div className="topbar-actions">{children}</div>
    </header>
  );
}
