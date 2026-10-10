import { renderToStaticMarkup } from "react-dom/server";
import { courses, slidesOfChapter } from "@/courses";
import { MasterFrame } from "@/masters/MasterFrame";
import { resolveMaster } from "@/masters/registry";

/** 강의의 chapter 목록(순서대로). 내보내기 요청을 검사하고 파일 이름을 만들 때 쓴다. */
export function chaptersOf(courseId: string): { id: string; title: string }[] | undefined {
  return courses.find((c) => c.id === courseId)?.chapters.map(({ id, title }) => ({ id, title }));
}

/**
 * chapter의 슬라이드를 순서대로 HTML 조각으로 그린다. 미리보기와 같은 `MasterFrame`을 쓴다.
 * 숨김 슬라이드는 뺀다. 브라우저 없이 Node에서 실행되므로 이 함수 안에서 브라우저 API를 쓰지 않는다.
 */
export function renderChapter(courseId: string, chapterId: string): string[] {
  const course = courses.find((c) => c.id === courseId);
  const chapter = course?.chapters.find((ch) => ch.id === chapterId);
  if (!course || !chapter) throw new Error(`chapter를 찾을 수 없습니다: ${courseId}/${chapterId}`);

  const master = resolveMaster(course.id, course.master);
  const info = { sectionLabel: course.sectionLabel, sections: chapter.sections.map((s) => ({ id: s.id, title: s.title })) };

  return slidesOfChapter(chapter)
    .filter((slide) => !slide.hidden)
    .map(({ Component }) =>
      renderToStaticMarkup(
        <MasterFrame master={master} chapter={info}>
          <Component />
        </MasterFrame>,
      ),
    );
}
