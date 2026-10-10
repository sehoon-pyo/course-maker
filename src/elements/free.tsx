import type { CSSProperties } from "react";
import { resolveColor } from "@/masters/color";
import { useMaster } from "@/masters/context";
import { ANCHOR, textStyle } from "@/masters/Layers";
import type { Glow, Shadow, TextStyle } from "@/masters/types";
import { atStyle, type At, type AtBox } from "./at";
import type { Sentence } from "./inline";
import { Inlines } from "./inlines";
import type { PlacementProps } from "./slots";

/* 슬라이드에서 자유롭게 배치하는 요소. `at`이 있으면 슬라이드 기준 px 위치에 놓고, 없으면 슬롯 안에서 흐른다. */

const shadowFilter = (s: Shadow | undefined, tokens: Record<string, string>) =>
  s ? `drop-shadow(${s.dx}px ${s.dy}px ${s.blur / 2}px ${resolveColor(s.color, tokens)})` : undefined;

/* ---------- Text ---------- */

export interface TextProps extends TextStyle, PlacementProps {
  value: Sentence;
  at?: At;
  /** 바탕색(직접 값 또는 토큰 이름) */
  fill?: string;
  /** 줄 간격(글자 크기의 배수) */
  lineHeight?: number;
}

export function Text({ value, at, size, color, align, anchor, bold, fill, lineHeight }: TextProps) {
  const { tokens } = useMaster();
  const style: CSSProperties = {
    ...atStyle(at),
    ...textStyle({ size, color, align, bold }, tokens),
    background: resolveColor(fill, tokens),
    lineHeight,
  };
  // 세로 정렬은 높이를 정했을 때만 의미가 있다.
  if (anchor && at?.h !== undefined) {
    style.display = "flex";
    style.flexDirection = "column";
    style.justifyContent = ANCHOR[anchor];
  }
  return (
    <div className="el-text" style={style}>
      {/* flex로 세로 정렬할 때 글 조각(em, br 등)이 따로 쌓이지 않게 한 덩어리로 감싼다. */}
      <div>
        <Inlines value={value} />
      </div>
    </div>
  );
}
Text.slotKinds = ["free", "body"] as const;

/* ---------- Shape ---------- */

export interface ShapeLine {
  /** 직접 값 또는 토큰 이름 */
  color: string;
  /** px */
  width: number;
  dash?: "solid" | "dash";
  /** 선의 시작점과 끝점에 붙는 화살표 머리. 선(`line`)과 자유형(`path`)에만 쓴다. */
  start?: "arrow";
  end?: "arrow";
}

interface ShapeBase extends PlacementProps {
  /** 크기까지 정한다. 선(`line`)은 `h`가 0일 수 있다. */
  at: AtBox;
  /** 둥근 모서리의 반지름(px). `roundRect`만. 생략하면 짧은 변의 1/6 */
  radius?: number;
  /** 채움. 직접 값(투명도는 `rgba(...)`) 또는 토큰 이름. 생략하면 채우지 않는다. */
  fill?: string;
  line?: ShapeLine;
  /** 도형의 중심을 기준으로 회전(도) */
  rotate?: number;
  shadow?: Shadow;
  /** 도형의 글로우. 채움이 없는 도형은 테두리를 따라 번진다. */
  glow?: Glow;
  /** 도형 안의 글자 */
  text?: Sentence;
  textStyle?: TextStyle;
}

export type ShapeProps =
  | (ShapeBase & { kind: "rect" | "roundRect" | "ellipse" | "rightArrow" | "triangle" | "line" })
  | (ShapeBase & { kind: "path"; path: string; viewBox: { w: number; h: number } });

/** 도형 하나의 윤곽. 크기는 `at`의 `w`, `h`이다. */
function outline(p: ShapeProps) {
  const { w, h } = p.at;
  switch (p.kind) {
    case "rect":
      return <rect x={0} y={0} width={w} height={h} />;
    case "roundRect": {
      const r = p.radius ?? Math.min(w, h) / 6;
      return <rect x={0} y={0} width={w} height={h} rx={r} ry={r} />;
    }
    case "ellipse":
      return <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} />;
    case "triangle":
      return <polygon points={`${w / 2},0 ${w},${h} 0,${h}`} />;
    case "rightArrow": {
      // PowerPoint의 기본 화살표: 몸통 높이는 절반, 머리 길이는 짧은 변의 절반
      const head = Math.min(w, h) / 2;
      const top = h / 4;
      const bottom = (h * 3) / 4;
      return <polygon points={`0,${top} ${w - head},${top} ${w - head},0 ${w},${h / 2} ${w - head},${h} ${w - head},${bottom} 0,${bottom}`} />;
    }
    case "line":
      return <line x1={0} y1={0} x2={w} y2={h} />;
    case "path":
      return <path d={p.path} vectorEffect="non-scaling-stroke" />;
  }
}

type Point = [number, number];

/** 선의 양 끝점과 각 끝점에서의 방향을 정하는 이웃 점(px). 자유형은 경로 데이터의 처음과 마지막 좌표를 쓴다. */
function lineEnds(p: ShapeProps): { start: [Point, Point]; end: [Point, Point] } | null {
  const { w, h } = p.at;
  if (p.kind === "line") return { start: [[0, 0], [w, h]], end: [[w, h], [0, 0]] };
  if (p.kind !== "path") return null;
  const nums = (p.path.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map(Number);
  const pts: Point[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push([(nums[i] * w) / p.viewBox.w, (nums[i + 1] * h) / p.viewBox.h]);
  if (pts.length < 2) return null;
  // 곡선의 제어점이 끝점과 같으면 방향을 알 수 없으므로 다른 점이 나올 때까지 거슬러 간다.
  const differs = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]) > 0.01;
  const first = pts[0];
  const last = pts[pts.length - 1];
  const afterFirst = pts.find((q) => differs(q, first)) ?? first;
  const beforeLast = [...pts].reverse().find((q) => differs(q, last)) ?? last;
  return { start: [first, afterFirst], end: [last, beforeLast] };
}

/** 끝점 tip에서 from 반대쪽을 향하는 화살표 머리. 크기는 선 굵기에 비례한다(PowerPoint의 큰 화살표 머리 정도). */
function arrowHead([tip, from]: [Point, Point], width: number): string {
  const len = Math.max(width * 5, 12);
  const half = Math.max(width * 2.5, 6);
  const dx = tip[0] - from[0];
  const dy = tip[1] - from[1];
  const d = Math.hypot(dx, dy) || 1;
  const ux = dx / d;
  const uy = dy / d;
  const bx = tip[0] - ux * len;
  const by = tip[1] - uy * len;
  return `${tip[0]},${tip[1]} ${bx - uy * half},${by + ux * half} ${bx + uy * half},${by - ux * half}`;
}

export function Shape(props: ShapeProps) {
  const { tokens } = useMaster();
  const { at, fill, line, rotate, shadow, glow, text, textStyle: textProps } = props;
  const stroke = line ? resolveColor(line.color, tokens) : undefined;
  const dash = line?.dash === "dash" ? `${line.width * 3} ${line.width}` : undefined;
  // 높이(또는 폭)가 0인 선은 viewBox가 유효하지 않아 그려지지 않으므로 svg의 크기는 최소 1로 둔다. 선은 svg 밖으로 그려도 보인다(overflow).
  const svgW = Math.max(at.w, 1);
  const svgH = Math.max(at.h, 1);
  const viewBox = props.kind === "path" ? `0 0 ${props.viewBox.w} ${props.viewBox.h}` : `0 0 ${svgW} ${svgH}`;
  const ends = line?.start || line?.end ? lineEnds(props) : null;

  return (
    <div
      className="el-shape"
      style={{
        ...atStyle(at),
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        filter: shadowFilter(shadow, tokens),
      }}
    >
      <svg
        width={svgW}
        height={svgH}
        viewBox={viewBox}
        preserveAspectRatio="none"
        style={{
          overflow: "visible",
          display: "block",
          // 글로우는 도형(svg)에만 건다. 도형 안의 글자는 textStyle.glow가 따로 정한다.
          filter: glow ? `drop-shadow(0 0 ${glow.radius}px ${resolveColor(glow.color, tokens)})` : undefined,
        }}
        fill={resolveColor(fill, tokens) ?? "none"}
        stroke={stroke ?? "none"}
        strokeWidth={line?.width}
        strokeDasharray={dash}
      >
        {outline(props)}
      </svg>
      {/* 화살표 머리는 viewBox의 늘림을 받지 않도록 px 좌표의 svg에 따로 그린다. */}
      {line && (line.start || line.end) && ends && (
        <svg width={svgW} height={svgH} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} fill={stroke}>
          {line.start && <polygon points={arrowHead(ends.start, line.width)} />}
          {line.end && <polygon points={arrowHead(ends.end, line.width)} />}
        </svg>
      )}
      {text !== undefined && (
        <div
          className="el-shape-text"
          style={{ ...textStyle(textProps ?? {}, tokens), justifyContent: ANCHOR[textProps?.anchor ?? "middle"] }}
        >
          <div>
            <Inlines value={text} />
          </div>
        </div>
      )}
    </div>
  );
}
Shape.slotKinds = ["free"] as const;

/* ---------- Image ---------- */

export interface ImageProps extends PlacementProps {
  /** 강의 폴더의 이미지를 import한 주소 */
  src: string;
  alt?: string;
  at?: At;
  /** `at`에 `w`, `h`를 둘 다 줬을 때 이미지를 맞추는 방식 */
  fit?: "contain" | "cover" | "fill";
}

export function Image({ src, alt = "", at, fit = "contain" }: ImageProps) {
  return <img className="el-image" src={src} alt={alt} draggable={false} style={{ ...atStyle(at), objectFit: fit }} />;
}
Image.slotKinds = ["free", "body"] as const;

/* ---------- Stamp ---------- */

export interface StampProps {
  /** 도장에 쓰는 글 (예: "완료") */
  value: string;
  /** `x, y`만 주면 크기는 기본(120×57.1)이다. */
  at: At & { x: number; y: number };
  /** 회전(도). 기본은 예시 PPT의 35.09° */
  rotate?: number;
  /** 선과 글자의 색. 기본은 하늘색 */
  color?: string;
}

/**
 * 네온 효과가 있는 도장. 예시 PPT의 마지막 장에 있는 "완료" 도장의 값이다.
 * 둥근 사각형(채움 없음, 선 3px), 도형의 글로우 4px, 글자의 글로우 10px(모두 알파 40%), 기울기 35.09°.
 */
export function Stamp({ value, at, rotate = 35.09, color = "#00B0F0" }: StampProps) {
  return (
    <Shape
      kind="roundRect"
      at={{ w: 120, h: 57.1, ...at }}
      line={{ color, width: 3 }}
      rotate={rotate}
      glow={{ radius: 4, color: "rgba(21, 103, 244, 0.4)" }}
      text={value}
      textStyle={{ color, size: 36, glow: { radius: 10, color: "rgba(0, 176, 240, 0.4)" } }}
    />
  );
}
Stamp.slotKinds = ["free"] as const;
