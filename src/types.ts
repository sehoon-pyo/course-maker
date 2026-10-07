/** course/meta.ts */
export interface CourseMeta {
  title: string;
  /** chapter 폴더 이름을 표시 순서대로 나열한다. 순서의 기준은 이 배열이다. */
  chapters: string[];
  /** 쓸 슬라이드 마스터 id. 없으면 `default`. */
  master?: string;
  /** section을 부르는 이름(예: `SECTION`, `UNIT`, `MODULE`). 없으면 `SECTION`. */
  sectionLabel?: string;
}

/** course/{chapter}/meta.ts */
export interface ChapterMeta {
  title: string;
  /**
   * section 앞에 오는 슬라이드(대제목, 목차 등). 슬라이드 폴더는 chapter 폴더 바로 아래에 둔다.
   * 항목의 형식은 section의 `slides`와 같다. 없으면 비어 있다.
   */
  head?: SlideEntry[];
  /** section 폴더 이름을 표시 순서대로 나열한다. 순서의 기준은 이 배열이다. */
  sections: string[];
  /** section 뒤에 오는 슬라이드(요약, 진행 현황 등). `head`와 같은 형식이다. 없으면 비어 있다. */
  tail?: SlideEntry[];
}

/** course/{chapter}/{section}/meta.ts */
export interface SectionMeta {
  title: string;
  /**
   * 슬라이드 폴더 이름을 표시 순서대로 나열한다. 순서의 기준은 이 배열이다.
   * 숨김 슬라이드는 `{ id, hidden: true }`로 쓴다(미리보기에서는 보이고 내보낼 때만 빠진다).
   */
  slides: SlideEntry[];
}

/** `slides` 배열의 항목. 문자열은 `{ id }`와 같다. */
export type SlideEntry = string | { id: string; hidden?: boolean };
