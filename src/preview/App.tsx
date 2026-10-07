import { useEffect, useState } from "react";
import { courses, findPath, numberingOf, slidesOfChapter, slidesOfCourse } from "@/courses";
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
  // 이전/다음과 번호는 chapter 기준이다. chapter가 파일 하나가 되는 단위이기 때문이다.
  const chapterSlides = chapter ? slidesOfChapter(chapter) : [];
  const index = current ? chapterSlides.indexOf(current) : -1;
  const chapterIndex = course && chapter ? course.chapters.indexOf(chapter) : -1;

  const move = (delta: number) => {
    const next = chapterSlides[index + delta];
    if (next) go(next.key);
  };

  /** 이전/다음 chapter의 첫 슬라이드. 슬라이드가 없는 chapter는 건너뛴다. */
  const targetChapterSlide = (delta: number) => {
    if (!course) return undefined;
    for (let i = chapterIndex + delta; i >= 0 && i < course.chapters.length; i += delta) {
      const first = slidesOfChapter(course.chapters[i])[0];
      if (first) return first;
    }
    return undefined;
  };
  const moveChapter = (delta: number) => {
    const target = targetChapterSlide(delta);
    if (target) go(target.key);
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
    // ←, →, PageUp, PageDown은 이전/다음 슬라이드, Ctrl + ←, Ctrl + →는 이전/다음 chapter
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.metaKey) return;
      const delta = e.key === "ArrowRight" || e.key === "PageDown" ? 1 : e.key === "ArrowLeft" || e.key === "PageUp" ? -1 : 0;
      if (delta === 0) return;
      if (e.ctrlKey) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          moveChapter(delta);
        }
        return;
      }
      move(delta);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!path || !course || !chapter || !current) {
    return <p className="empty">표시할 슬라이드가 없습니다. courses/ 아래에 슬라이드를 추가하세요.</p>;
  }

  const { Component } = current;
  // chapter 바로 아래의 슬라이드(head, tail)는 section이 없어서 위치 표시에 section이 빠진다.
  const section = path.section;
  const crumbs = [
    chapter.title,
    ...(section ? [`${sectionTag(course.sectionLabel, chapter.sections.indexOf(section) + 1)} ${section.title}`] : []),
    path.slide.name,
  ];
  const numbering = numberingOf(chapter);
  const currentNo = numbering.numbers.get(current.key);

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
          <select
            value={course.id}
            onChange={(e) => {
              selectCourse(e.target.value);
              e.target.blur();
            }}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label className="course-select">
          <span>chapter</span>
          <select
            value={chapter.id}
            onChange={(e) => {
              selectChapter(e.target.value);
              e.target.blur();
            }}
          >
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
            <button type="button" onClick={() => moveChapter(-1)} disabled={!targetChapterSlide(-1)} title="이전 chapter의 첫 슬라이드 (Ctrl + ←)">
              &lt;&lt; 이전 챕터
            </button>
            <button type="button" onClick={() => move(-1)} disabled={index <= 0} title="이전 슬라이드 (←)">
              &lt; 이전
            </button>
            <span className="counter">
              {current.hidden ? "숨김" : currentNo} / {numbering.total}
            </span>
            <button type="button" onClick={() => move(1)} disabled={index === chapterSlides.length - 1} title="다음 슬라이드 (→)">
              다음 &gt;
            </button>
            <button type="button" onClick={() => moveChapter(1)} disabled={!targetChapterSlide(1)} title="다음 chapter의 첫 슬라이드 (Ctrl + →)">
              다음 챕터 &gt;&gt;
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
