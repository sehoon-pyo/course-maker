import type { ComponentType } from "react";
import type { ChapterMeta, CourseMeta, SectionMeta } from "@/types";

/**
 * courses/{강의}/{ch.N_이름}/{sec.N_이름}/{sl.N_이름}/index.tsx 구조를 읽어 트리로 만든다.
 * 각 단계의 폴더에는 meta.ts가 있다. 슬라이드 순서는 section meta의 slides 배열이 정한다.
 */
const courseMetas = import.meta.glob<CourseMeta>("/courses/*/meta.ts", { eager: true, import: "default" });
const chapterMetas = import.meta.glob<ChapterMeta>("/courses/*/*/meta.ts", { eager: true, import: "default" });
const sectionMetas = import.meta.glob<SectionMeta>("/courses/*/*/*/meta.ts", { eager: true, import: "default" });
const slideModules = import.meta.glob<ComponentType>("/courses/*/*/*/*/index.tsx", { eager: true, import: "default" });

export interface SlideNode {
  /** `{강의}/{chapter}/{section}/{slide}` 폴더 이름. URL 해시로 쓴다. */
  key: string;
  id: string;
  name: string;
  Component: ComponentType;
}
export interface SectionNode {
  id: string;
  name: string;
  title: string;
  slides: SlideNode[];
}
export interface ChapterNode {
  id: string;
  name: string;
  title: string;
  sections: SectionNode[];
}
export interface CourseNode {
  id: string;
  title: string;
  chapters: ChapterNode[];
}

/** `{경로}/meta.ts` 키에서 `/courses/` 아래 폴더 이름들을 꺼낸다. */
const folders = (path: string) => path.split("/").slice(2, -1);

/** `ch.1_intro` → `intro` */
const nameOf = (folder: string) => folder.replace(/^[a-z]+\.\d+_/, "");

/** `ch.2_intro` → 2. 번호가 없으면 맨 뒤로 보낸다. */
const noOf = (folder: string) => Number(/^[a-z]+\.(\d+)_/.exec(folder)?.[1] ?? Infinity);
const byNo = <T extends { id: string }>(a: T, b: T) => noOf(a.id) - noOf(b.id);

function buildSlides(course: string, chapter: string, section: string, order: string[]): SlideNode[] {
  const prefix = `/courses/${course}/${chapter}/${section}/`;
  const existing = new Set(
    Object.keys(slideModules)
      .filter((p) => p.startsWith(prefix))
      .map((p) => folders(p)[3]),
  );

  const slides = order.flatMap((id) => {
    const Component = slideModules[`${prefix}${id}/index.tsx`];
    if (!Component) {
      console.warn(`[courses] meta에 있지만 폴더가 없는 슬라이드: ${prefix}${id}`);
      return [];
    }
    existing.delete(id);
    return [{ key: [course, chapter, section, id].join("/"), id, name: nameOf(id), Component }];
  });

  for (const id of existing) {
    console.warn(`[courses] 폴더는 있지만 meta에 없는 슬라이드(표시하지 않음): ${prefix}${id}`);
  }
  return slides;
}

export const courses: CourseNode[] = Object.entries(courseMetas).map(([coursePath, courseMeta]) => {
  const [courseId] = folders(coursePath);

  const chapters = Object.entries(chapterMetas)
    .filter(([p]) => folders(p)[0] === courseId)
    .map(([chapterPath, chapterMeta]): ChapterNode => {
      const [, chapterId] = folders(chapterPath);

      const sections = Object.entries(sectionMetas)
        .filter(([p]) => folders(p)[0] === courseId && folders(p)[1] === chapterId)
        .map(([sectionPath, sectionMeta]): SectionNode => {
          const [, , sectionId] = folders(sectionPath);
          return {
            id: sectionId,
            name: nameOf(sectionId),
            title: sectionMeta.title,
            slides: buildSlides(courseId, chapterId, sectionId, sectionMeta.slides),
          };
        })
        .sort(byNo);

      return { id: chapterId, name: nameOf(chapterId), title: chapterMeta.title, sections };
    })
    .sort(byNo);

  return { id: courseId, title: courseMeta.title, chapters };
});

export interface SlidePath {
  course: CourseNode;
  chapter: ChapterNode;
  section: SectionNode;
  slide: SlideNode;
}

/** 슬라이드 키로 상위 course/chapter/section을 찾는다. 상단 바의 현재 위치 표시에 쓴다. */
export function findPath(key: string): SlidePath | undefined {
  for (const course of courses) {
    for (const chapter of course.chapters) {
      for (const section of chapter.sections) {
        const slide = section.slides.find((s) => s.key === key);
        if (slide) return { course, chapter, section, slide };
      }
    }
  }
  return undefined;
}

/** 미리보기에서 이전/다음으로 이동하는 순서 */
export const allSlides: SlideNode[] = courses.flatMap((c) =>
  c.chapters.flatMap((ch) => ch.sections.flatMap((s) => s.slides)),
);
