import { useEffect, useState } from "react";
import { courses, findPath, slidesOfChapter, slidesOfCourse } from "@/courses";
import { MasterFrame } from "@/masters/MasterFrame";
import { resolveMaster } from "@/masters/registry";
import type { Master } from "@/masters/types";
import { sectionTag } from "@/sections";
import { Sidebar } from "./Sidebar";
import { SlideErrorBoundary } from "./SlideErrorBoundary";
import { SlidePreviewArea } from "./SlidePreviewArea";
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

  // 해시가 가리키는 슬라이드가 없으면 슬라이드가 있는 첫 강의의 첫 슬라이드를 보여 준다.
  const found = findPath(key);
  const current = found?.slide ?? courses.flatMap(slidesOfCourse)[0];
  const path = found ?? (current ? findPath(current.key) : undefined);
  const course = path?.course;
  const chapter = path?.chapter;
  const courseSlides = course ? slidesOfCourse(course) : [];
  const index = current ? courseSlides.indexOf(current) : -1;

  const move = (delta: number) => {
    const next = courseSlides[index + delta];
    if (next) go(next.key);
  };

  const selectCourse = (courseId: string) => {
    const target = courses.find((c) => c.id === courseId);
    const first = target ? slidesOfCourse(target)[0] : undefined;
    if (first) go(first.key);
  };

  const selectChapter = (chapterId: string) => {
    const target = course?.chapters.find((ch) => ch.id === chapterId);
    const first = target ? slidesOfChapter(target)[0] : undefined;
    if (first) go(first.key);
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

  if (!path || !course || !chapter || !current) {
    return <p className="empty">표시할 슬라이드가 없습니다. courses/ 아래에 슬라이드를 추가하세요.</p>;
  }

  const { Component } = current;
  const sectionNo = path.chapter.sections.indexOf(path.section) + 1;
  const crumbs = [path.chapter.title, `${sectionTag(course.sectionLabel, sectionNo)} ${path.section.title}`, path.slide.name];

  // 마스터를 못 찾거나 올바르지 않으면 화면 전체가 멈추지 않게 슬라이드 자리에 오류를 보여 준다.
  let master: Master | undefined;
  let masterError: string | undefined;
  try {
    master = resolveMaster(course.id, course.master);
  } catch (e) {
    masterError = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="preview">
      <TopBar sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} crumbs={crumbs}>
        <label className="course-select">
          <span>강의</span>
          <select value={course.id} onChange={(e) => selectCourse(e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label className="course-select">
          <span>chapter</span>
          <select value={chapter.id} onChange={(e) => selectChapter(e.target.value)}>
            {course.chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title}
              </option>
            ))}
          </select>
        </label>
      </TopBar>
      <div className="body">
        {sidebarOpen && <Sidebar chapter={chapter} sectionLabel={course.sectionLabel} currentKey={current.key} onSelect={go} />}
        <main className="main">
          <SlidePreviewArea>
            {master ? (
              <SlideErrorBoundary key={current.key}>
                <MasterFrame
                  master={master}
                  chapter={{
                    sectionLabel: course.sectionLabel,
                    sections: chapter.sections.map((s) => ({ id: s.id, title: s.title })),
                  }}
                >
                  <Component />
                </MasterFrame>
              </SlideErrorBoundary>
            ) : (
              <pre className="slide-error">{masterError}</pre>
            )}
          </SlidePreviewArea>
          <footer className="controls">
            <button type="button" onClick={() => move(-1)} disabled={index === 0}>
              이전
            </button>
            <span>
              {index + 1} / {courseSlides.length}
            </span>
            <button type="button" onClick={() => move(1)} disabled={index === courseSlides.length - 1}>
              다음
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
