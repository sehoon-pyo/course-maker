import type { ChapterNode } from "@/courses";
import { sectionTag } from "@/sections";

/** 선택된 chapter의 목차 (section → slide). 현재 슬라이드를 강조한다. */
export function Sidebar({
  chapter,
  sectionLabel,
  currentKey,
  onSelect,
}: {
  chapter: ChapterNode;
  /** section을 부르는 이름(강의 meta.ts의 sectionLabel) */
  sectionLabel: string;
  currentKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <nav className="sidebar" aria-label="목차">
      <p className="sidebar-label">목차</p>
      <h2>{chapter.title}</h2>
      {chapter.sections.map((section, sectionIndex) => (
        <div key={section.id} className="tree-section">
          <h4>
            <span className="section-tag">{sectionTag(sectionLabel, sectionIndex + 1)}</span>{" "}
            {section.title}
          </h4>
          <ol>
            {section.slides.map((slide, i) => (
              <li key={slide.key}>
                <button
                  type="button"
                  className={slide.key === currentKey ? "active" : undefined}
                  onClick={() => onSelect(slide.key)}
                >
                  <span className="no">{i + 1}</span>
                  {slide.name}
                </button>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </nav>
  );
}
