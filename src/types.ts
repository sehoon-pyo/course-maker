/** course/meta.ts */
export interface CourseMeta {
  title: string;
}

/** course/ch.N_이름/meta.ts */
export interface ChapterMeta {
  title: string;
}

/** course/ch.N_이름/sec.N_이름/meta.ts */
export interface SectionMeta {
  title: string;
  /** 슬라이드 폴더 이름을 표시 순서대로 나열한다. 순서의 기준은 이 배열이다. */
  slides: string[];
}
