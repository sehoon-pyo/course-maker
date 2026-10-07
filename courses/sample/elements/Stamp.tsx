import { Shape, type At } from "@/elements";

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
