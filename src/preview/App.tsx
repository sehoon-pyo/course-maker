import { useEffect, useState } from "react";
import { allSlides, findPath } from "@/courses";
import { Sidebar } from "./Sidebar";
import { Stage } from "./Stage";
import { TopBar } from "./TopBar";
import { useHashRoute } from "./useHashRoute";

const SIDEBAR_KEY = "preview.sidebarOpen";

/** 저장소를 못 쓰는 환경(시크릿 창 등)에서도 동작하도록 예외를 무시한다. */
function loadSidebarOpen() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) !== "false";
  } catch {
    return true;
  }
}
function saveSidebarOpen(open: boolean) {
  try {
    localStorage.setItem(SIDEBAR_KEY, String(open));
  } catch {
    /* 저장하지 못해도 화면 동작에는 영향 없다 */
  }
}

export function App() {
  const [key, go] = useHashRoute();
  const [sidebarOpen, setSidebarOpen] = useState(loadSidebarOpen);

  const found = allSlides.findIndex((s) => s.key === key);
  const index = found >= 0 ? found : 0;
  const current = allSlides[index];

  const move = (delta: number) => {
    const next = allSlides[index + delta];
    if (next) go(next.key);
  };

  const toggleSidebar = () => {
    setSidebarOpen((open) => {
      saveSidebarOpen(!open);
      return !open;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") move(1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!current) {
    return <p className="empty">표시할 슬라이드가 없습니다. courses/ 아래에 슬라이드를 추가하세요.</p>;
  }

  const { Component } = current;
  const path = findPath(current.key);
  const crumbs = path ? [path.course.title, path.chapter.title, path.section.title, path.slide.name] : [];

  return (
    <div className="preview">
      <TopBar sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} crumbs={crumbs} />
      <div className="body">
        {sidebarOpen && <Sidebar currentKey={current.key} onSelect={go} />}
        <main className="main">
          <Stage>
            <Component />
          </Stage>
          <footer className="controls">
            <button type="button" onClick={() => move(-1)} disabled={index === 0}>
              이전
            </button>
            <span>
              {index + 1} / {allSlides.length}
            </span>
            <button type="button" onClick={() => move(1)} disabled={index === allSlides.length - 1}>
              다음
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
