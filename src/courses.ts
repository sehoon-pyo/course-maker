import type { ComponentType } from "react";
import { DEFAULT_MASTER_ID, DEFAULT_SECTION_LABEL } from "@/constants";
import type { ChapterMeta, CourseMeta, SectionMeta, SlideEntry } from "@/types";

/**
 * courses/{강의}/{chapter}/{section}/{slide}/index.tsx 구조를 읽어 트리로 만든다.
 * 각 단계의 폴더에는 meta.ts가 있고, 하위 항목의 순서는 meta.ts의 배열(chapters, sections, slides)이 정한다.
 * 폴더 이름의 번호(`ch.1_`, `sec.1_`, `sl.1_`)는 순서의 기준이 아니다.
 */
const courseMetas = import.meta.glob<CourseMeta>("/courses/*/meta.ts", { eager: true, import: "default" });
const chapterMetas = import.meta.glob<ChapterMeta>("/courses/*/*/meta.ts", { eager: true, import: "default" });
const sectionMetas = import.meta.glob<SectionMeta>("/courses/*/*/*/meta.ts", { eager: true, import: "default" });
const slideModules = import.meta.glob<ComponentType>("/courses/*/*/*/*/index.tsx", { eager: true, import: "default" });
// chapter 바로 아래의 슬라이드(head, tail). 마스터(`courses/{강의}/masters/{id}/index.tsx`)와 경로 모양이 같으므로
// 강의의 chapters 배열에 있는 chapter 폴더 아래만 읽는다.
const chapterSlideModules = import.meta.glob<ComponentType>("/courses/*/*/*/index.tsx", { eager: true, import: "default" });

export interface SlideNode {
  /** `{강의}/{chapter}/{section}/{slide}` 폴더 이름. URL 해시로 쓴다. */
  key: string;
  id: string;
  name: string;
  /** 숨김 슬라이드. 미리보기에서는 보이고, 내보낼 때는 제외한다. */
  hidden: boolean;
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
  /** section 앞에 오는 슬라이드(대제목, 목차 등) */
  head: SlideNode[];
  sections: SectionNode[];
  /** section 뒤에 오는 슬라이드 */
  tail: SlideNode[];
}
export interface CourseNode {
  id: string;
  title: string;
  /** 쓸 마스터 id. meta.ts에 없으면 `default`. */
  master: string;
  /** section을 부르는 이름. meta.ts에 없으면 `SECTION`. */
  sectionLabel: string;
  chapters: ChapterNode[];
}

/** `{경로}/meta.ts` 키에서 `/courses/` 아래 폴더 이름들을 꺼낸다. */
const folders = (path: string) => path.split("/").slice(2, -1);

/** 화면에 보이는 이름. 접두사와 번호는 선택이다: `ch.1_intro`, `ch.intro`, `intro` → `intro` */
const nameOf = (folder: string) => folder.replace(/^[a-z]+\.(\d+_)?/, "");

/**
 * meta의 배열(`order`)을 실제 폴더(`existing`)와 맞춘다. 배열의 순서를 따르고, 어긋난 항목은 경고한다.
 * - 배열에 있지만 폴더가 없는 항목은 건너뛴다.
 * - 폴더는 있지만 배열에 없는 항목은 표시하지 않는다.
 * - 배열에 같은 이름이 둘이면 첫 번째만 쓴다.
 */
function ordered(order: readonly string[], existing: Iterable<string>, kind: string, where: string): string[] {
  const exists = new Set(existing);
  const result: string[] = [];
  for (const id of order) {
    if (result.includes(id)) console.warn(`[courses] meta에 같은 ${kind} 항목이 두 번 있습니다(처음 것만 씀): ${where}${id}`);
    else if (!exists.has(id)) console.warn(`[courses] meta에 있지만 폴더가 없는 ${kind}: ${where}${id}`);
    else result.push(id);
  }
  for (const id of exists) {
    if (!order.includes(id)) console.warn(`[courses] 폴더는 있지만 meta에 없는 ${kind}(표시하지 않음): ${where}${id}`);
  }
  return result;
}

const toEntry = (e: SlideEntry) => (typeof e === "string" ? { id: e, hidden: false } : { id: e.id, hidden: e.hidden === true });

function buildSlides(course: string, chapter: string, section: string, entries: readonly SlideEntry[]): SlideNode[] {
  const where = `/courses/${course}/${chapter}/${section}/`;
  const normalized = entries.map(toEntry);
  const existing = Object.keys(slideModules)
    .filter((p) => p.startsWith(where))
    .map((p) => folders(p)[3]);

  return ordered(
    normalized.map((e) => e.id),
    existing,
    "슬라이드",
    where,
  ).map((id) => ({
    key: [course, chapter, section, id].join("/"),
    id,
    name: nameOf(id),
    hidden: normalized.find((e) => e.id === id)!.hidden,
    Component: slideModules[`${where}${id}/index.tsx`],
  }));
}

/** chapter 바로 아래의 슬라이드를 `head`와 `tail`로 나눠 만든다. 폴더 경고는 둘을 합쳐 한 번만 한다. */
function buildChapterSlides(
  course: string,
  chapter: string,
  head: readonly SlideEntry[],
  tail: readonly SlideEntry[],
): { head: SlideNode[]; tail: SlideNode[] } {
  const where = `/courses/${course}/${chapter}/`;
  const headEntries = head.map(toEntry);
  const entries = [...headEntries, ...tail.map(toEntry)];
  const existing = Object.keys(chapterSlideModules)
    .filter((p) => p.startsWith(where))
    .map((p) => folders(p)[2]);

  const ids = ordered(
    entries.map((e) => e.id),
    existing,
    "슬라이드",
    where,
  );
  const isHead = new Set(headEntries.map((e) => e.id));
  const make = (id: string): SlideNode => ({
    key: [course, chapter, id].join("/"),
    id,
    name: nameOf(id),
    hidden: entries.find((e) => e.id === id)!.hidden,
    Component: chapterSlideModules[`${where}${id}/index.tsx`],
  });
  return { head: ids.filter((id) => isHead.has(id)).map(make), tail: ids.filter((id) => !isHead.has(id)).map(make) };
}

function buildSections(course: string, chapter: string, order: readonly string[]): SectionNode[] {
  const metas = new Map<string, SectionMeta>();
  for (const [path, meta] of Object.entries(sectionMetas)) {
    const [c, ch, id] = folders(path);
    if (c === course && ch === chapter) metas.set(id, meta);
  }
  return ordered(order, metas.keys(), "section", `/courses/${course}/${chapter}/`).map((id) => {
    const meta = metas.get(id)!;
    return { id, name: nameOf(id), title: meta.title, slides: buildSlides(course, chapter, id, meta.slides ?? []) };
  });
}

function buildChapters(course: string, order: readonly string[]): ChapterNode[] {
  const metas = new Map<string, ChapterMeta>();
  for (const [path, meta] of Object.entries(chapterMetas)) {
    const [c, id] = folders(path);
    if (c === course) metas.set(id, meta);
  }
  return ordered(order, metas.keys(), "chapter", `/courses/${course}/`).map((id) => {
    const meta = metas.get(id)!;
    const { head, tail } = buildChapterSlides(course, id, meta.head ?? [], meta.tail ?? []);
    return { id, name: nameOf(id), title: meta.title, head, sections: buildSections(course, id, meta.sections ?? []), tail };
  });
}

export const courses: CourseNode[] = Object.entries(courseMetas).map(([coursePath, courseMeta]) => {
  const [courseId] = folders(coursePath);
  return {
    id: courseId,
    title: courseMeta.title,
    master: courseMeta.master ?? DEFAULT_MASTER_ID,
    sectionLabel: courseMeta.sectionLabel ?? DEFAULT_SECTION_LABEL,
    chapters: buildChapters(courseId, courseMeta.chapters ?? []),
  };
});

export interface SlidePath {
  course: CourseNode;
  chapter: ChapterNode;
  /** chapter 바로 아래의 슬라이드(head, tail)는 section이 없다. */
  section?: SectionNode;
  slide: SlideNode;
}

/** 슬라이드 키로 상위 course/chapter/section을 찾는다. 상단 바의 현재 위치 표시에 쓴다. */
export function findPath(key: string): SlidePath | undefined {
  for (const course of courses) {
    for (const chapter of course.chapters) {
      const own = [...chapter.head, ...chapter.tail].find((s) => s.key === key);
      if (own) return { course, chapter, slide: own };
      for (const section of chapter.sections) {
        const slide = section.slides.find((s) => s.key === key);
        if (slide) return { course, chapter, section, slide };
      }
    }
  }
  return undefined;
}

/** chapter의 슬라이드를 보이는 순서대로 반환한다: head, section의 슬라이드, tail. 숨김 슬라이드도 포함한다. */
export const slidesOfChapter = (chapter: ChapterNode): SlideNode[] => [
  ...chapter.head,
  ...chapter.sections.flatMap((section) => section.slides),
  ...chapter.tail,
];

export interface ChapterNumbering {
  /** 슬라이드 키 → chapter 안의 번호(1부터). 숨김 슬라이드는 번호가 없다. */
  numbers: Map<string, number>;
  /** 번호가 있는(숨김이 아닌) 슬라이드의 수 */
  total: number;
}

const numberings = new WeakMap<ChapterNode, ChapterNumbering>();

/** chapter 안의 번호. head, section, tail 순서로 이어서 매기고 숨김 슬라이드는 건너뛴다. */
export function numberingOf(chapter: ChapterNode): ChapterNumbering {
  let result = numberings.get(chapter);
  if (!result) {
    const numbers = new Map<string, number>();
    let n = 0;
    for (const slide of slidesOfChapter(chapter)) {
      if (!slide.hidden) numbers.set(slide.key, ++n);
    }
    result = { numbers, total: n };
    numberings.set(chapter, result);
  }
  return result;
}

/** 한 강의의 슬라이드를 미리보기에서 이전/다음으로 이동하는 순서대로 반환한다. 숨김 슬라이드도 포함한다. */
export const slidesOfCourse = (course: CourseNode): SlideNode[] => course.chapters.flatMap(slidesOfChapter);
