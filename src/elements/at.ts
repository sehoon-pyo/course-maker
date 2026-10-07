import type { CSSProperties } from "react";

/** 슬라이드 기준 px 위치(1920x1080). `w`, `h`를 생략하면 내용에 맞춘다. */
export interface At {
  x: number;
  y: number;
  w?: number;
  h?: number;
}

/** 크기까지 정해야 하는 요소(도형, 프롬프트 박스)의 위치 */
export type AtBox = Required<At>;

/** `at`이 있는 요소의 절대 위치. 없으면 슬롯 안에서 흐른다. */
export function atStyle(at: At | undefined): CSSProperties | undefined {
  if (!at) return undefined;
  return { position: "absolute", left: at.x, top: at.y, width: at.w, height: at.h };
}
