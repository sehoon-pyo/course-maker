/** 슬라이드 크기(1920x1080) 기준 px 좌표 */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type TextAlign = "left" | "center" | "right";

export interface TextStyle {
  /** px */
  size?: number;
  /** 직접 값(`#RRGGBB`) 또는 마스터 토큰 이름. 토큰 해석은 렌더링 단계에서 한다. */
  color?: string;
  align?: TextAlign;
  /** 세로 정렬. 슬롯과 층의 박스 안에서의 위치 */
  anchor?: "top" | "middle" | "bottom";
  bold?: boolean;
}

/* ---------- 층 (background와 layout의 장식) ---------- */

interface LayerBase {
  /** 같은 배열 안에서 고유해야 한다. 상속할 때 대체와 제거의 기준이 된다. */
  id: string;
}

/** 슬라이드 전체를 칠하는 색 */
export interface ColorLayer extends LayerBase {
  type: "color";
  value: string;
}

export interface ImageLayer extends LayerBase, Rect {
  type: "image";
  /** 마스터 폴더의 assets/에서 import한 주소 */
  src: string;
}

export interface Shadow {
  dx: number;
  dy: number;
  blur: number;
  color: string;
}

/** SVG 경로로 그리는 도형. PPTX의 자유형 값을 그대로 옮길 수 있다. */
export interface ShapeLayer extends LayerBase, Rect {
  type: "shape";
  /** `viewBox` 좌표계의 SVG path 데이터 */
  path: string;
  viewBox: { w: number; h: number };
  /** 직접 값 또는 마스터 토큰 이름 */
  fill: string;
  shadow?: Shadow;
}

/** layout에 고정된 문구 */
export interface TextLayer extends LayerBase, Rect, TextStyle {
  type: "text";
  value: string;
}

export type Layer = ColorLayer | ImageLayer | ShapeLayer | TextLayer;

/** layout의 background에서 master의 층을 뺀다. */
export interface LayerRemoval {
  id: string;
  remove: true;
}

/* ---------- 슬롯 ---------- */

export type TextSlotType = "title" | "subtitle" | "body" | "free";

export interface TextSlot extends Rect, TextStyle {
  id: string;
  type: TextSlotType;
}

export interface ListColumn extends TextStyle {
  /** 슬라이드 기준 px */
  x: number;
  w: number;
}

/**
 * 같은 모양이 반복되는 줄(목차의 항목). `y`는 첫 줄의 위, `h`는 한 줄의 높이이고,
 * n번째 줄(0부터)의 위는 `y + n * pitch`이다.
 */
export interface ListSlot extends Rect {
  id: string;
  type: "list";
  rows: number;
  pitch: number;
  columns: ListColumn[];
}

export type Slot = TextSlot | ListSlot;

/* ---------- layout과 master ---------- */

/** 마스터 파일이 선언하는 layout */
export interface LayoutDef {
  /**
   * 지정하지 않으면 master의 background를 그대로 쓴다.
   * 같은 id는 그 자리에서 대체하고, 새 id는 master의 층 위에 선언 순서대로 쌓고,
   * `{ id, remove: true }`는 master의 층을 뺀다.
   */
  background?: (Layer | LayerRemoval)[];
  /** 이 layout에만 있는 고정 장식 (구분선, 슬롯 테두리, 로고 등) */
  decorations?: Layer[];
  slots?: Slot[];
}

/** 마스터 파일(`index.tsx`)이 내보내는 값. `defineMaster`로 만든다. */
export interface MasterDef {
  /** CSS 변수 값. 키는 `--`로 시작한다. */
  tokens?: Record<string, string>;
  /** 아래에서 위로 쌓이는 층. 배열 순서가 쌓는 순서이다. */
  background: Layer[];
  /** 키가 layout id이다. */
  layouts: Record<string, LayoutDef>;
}

/** 상속과 대체를 모두 적용한 layout */
export interface Layout {
  id: string;
  background: Layer[];
  decorations: Layer[];
  slots: Slot[];
}

export type MasterSource = "course" | "tool";

/** 검증을 마치고 layout의 background 상속을 풀어 둔 마스터 */
export interface Master {
  /** 마스터 폴더 이름 */
  id: string;
  /** 강의 전용(`courses/{강의}/masters/`)인지 도구 제공(`src/masters/`)인지 */
  source: MasterSource;
  tokens: Record<string, string>;
  background: Layer[];
  layouts: Record<string, Layout>;
}
