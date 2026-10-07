import { numberingOf, type ChapterNode, type SlideNode } from "@/courses";
import { sectionTag } from "@/sections";

/**
 * 선택된 chapter의 목차: head 슬라이드, section → slide, tail 슬라이드 순서이다.
 * 번호는 chapter 안에서 이어서 매기고, 숨김 슬라이드는 번호 없이 "숨김" 표시로 보여 준다.
 */
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
  const { numbers } = numberingOf(chapter);

  const slideItem = (slide: SlideNode) => (
    <li key={slide.key}>
      <button
        type="button"
        className={[slide.key === currentKey ? "active" : "", slide.hidden ? "hidden-slide" : ""].filter(Boolean).join(" ") || undefined}
        onClick={() => onSelect(slide.key)}
      >
        <span className="no">{numbers.get(slide.key)}</span>
        {slide.name}
        {slide.hidden && <span className="hidden-tag">숨김</span>}
      </button>
    </li>
  );

  return (
    <nav className="sidebar" aria-label="목차">
      <p className="sidebar-label">목차</p>
      <h2>{chapter.title}</h2>
      {chapter.head.length > 0 && <ol className="chapter-slides">{chapter.head.map(slideItem)}</ol>}
      {chapter.sections.map((section, sectionIndex) => (
        <div key={section.id} className="tree-section">
          <h4>
            <span className="section-tag">{sectionTag(sectionLabel, sectionIndex + 1)}</span>{" "}
            {section.title}
          </h4>
          <ol>{section.slides.map(slideItem)}</ol>
        </div>
      ))}
      {chapter.tail.length > 0 && <ol className="chapter-slides">{chapter.tail.map(slideItem)}</ol>}
    </nav>
  );
}
