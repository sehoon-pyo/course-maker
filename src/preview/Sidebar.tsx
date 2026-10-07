import { courses } from "@/courses";

/** course → chapter → section → slide 트리. 현재 슬라이드를 강조한다. */
export function Sidebar({ currentKey, onSelect }: { currentKey: string; onSelect: (key: string) => void }) {
  return (
    <nav className="sidebar">
      {courses.map((course) => (
        <div key={course.id} className="tree-course">
          <h2>{course.title}</h2>
          {course.chapters.map((chapter) => (
            <div key={chapter.id} className="tree-chapter">
              <h3>{chapter.title}</h3>
              {chapter.sections.map((section) => (
                <div key={section.id} className="tree-section">
                  <h4>{section.title}</h4>
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
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
}
