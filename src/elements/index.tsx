import type { ReactNode } from "react";
import { DEFAULT_LAYOUT_ID } from "@/constants";
import { useMaster } from "@/masters/context";
import { textStyle } from "@/masters/Layers";
import { atStyle, type At } from "./at";
import { Layers } from "@/masters/Layers";
import { Inlines } from "./inlines";
import type { Sentence } from "./inline";
import { Placements, placeChildren, type PlacementProps } from "./slots";

export * from "./at";
export * from "./free";
export * from "./inline";
export * from "./inlines";
export * from "./widgets";
export type { PlacementProps } from "./slots";

function Tier({ name, children }: { name: "background" | "layout" | "element"; children: ReactNode }) {
  return <div className={`tier tier--${name}`}>{children}</div>;
}

/**
 * 슬라이드 한 장의 최상위 요소. 마스터(MasterFrame)가 준 layout을 골라 background, layout(장식), element 세 단계를 아래에서 위로 그린다.
 * 크기는 1920x1080 고정이며, 슬라이드 미리보기 영역(slide-preview-area)이 창 크기에 맞춰 축소해서 보여 준다.
 */
export function Slide({ layout = DEFAULT_LAYOUT_ID, children }: { layout?: string; children: ReactNode }) {
  const master = useMaster();
  const found = master.layouts[layout];
  if (!found) {
    throw new Error(
      `[masters] 마스터 "${master.id}"에 layout "${layout}"이 없습니다. 사용 가능한 layout: ${Object.keys(master.layouts).join(", ")}`,
    );
  }

  const placements = placeChildren(master.id, found, children);
  return (
    <>
      <Tier name="background">
        <Layers layers={found.background} tokens={master.tokens} />
      </Tier>
      <Tier name="layout">
        <Layers layers={found.decorations} tokens={master.tokens} />
      </Tier>
      <Tier name="element">
        <Placements masterId={master.id} layoutId={found.id} placements={placements} tokens={master.tokens} />
      </Tier>
    </>
  );
}

export function Title({ value }: { value: Sentence } & PlacementProps) {
  return (
    <h1 className="el-title">
      <Inlines value={value} />
    </h1>
  );
}
Title.slotKinds = ["title"] as const;

export function Paragraph({ value }: { value: Sentence } & PlacementProps) {
  return (
    <p className="el-paragraph">
      <Inlines value={value} />
    </p>
  );
}
Paragraph.slotKinds = ["body", "subtitle", "free"] as const;

export interface BulletsProps extends PlacementProps {
  items: Sentence[];
  /** 번호 목록(1. 2. 3.) */
  numbered?: boolean;
  /** 슬롯 대신 정한 위치에 놓는다. `w`를 생략하면 폭은 글에 맞춘다. */
  at?: At;
  /** 위치를 정했을 때의 글자 크기(px)와 색(직접 값 또는 토큰 이름). 슬롯에서는 슬롯의 값을 따른다. */
  size?: number;
  color?: string;
}

export function Bullets({ items, numbered, at, size, color }: BulletsProps) {
  const { tokens } = useMaster();
  const List = numbered ? "ol" : "ul";
  return (
    <List className="el-bullets" style={at ? { ...atStyle(at), ...textStyle({ size, color }, tokens) } : undefined}>
      {items.map((item, i) => (
        <li key={i}>
          <Inlines value={item} />
        </li>
      ))}
    </List>
  );
}
Bullets.slotKinds = ["body", "free"] as const;
