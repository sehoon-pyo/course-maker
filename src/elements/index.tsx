import type { ReactNode } from "react";
import { DEFAULT_LAYOUT_ID } from "@/constants";
import { useMaster } from "@/masters/context";
import { Layers } from "@/masters/Layers";
import type { Inline, Sentence } from "./inline";
import { SlotBox, placeChildren, type PlacementProps } from "./slots";

export * from "./inline";

function InlineNode({ seg }: { seg: Inline }) {
  if (typeof seg === "string") return <>{seg}</>;
  switch (seg.kind) {
    case "bold":
      return <strong>{seg.text}</strong>;
    case "code":
      return <code>{seg.text}</code>;
    case "badge":
      return <span className={`badge badge--${seg.color}`}>{seg.text}</span>;
  }
}

export function Inlines({ value }: { value: Sentence }) {
  if (typeof value === "string") return <>{value}</>;
  return (
    <>
      {value.map((seg, i) => (
        <InlineNode key={i} seg={seg} />
      ))}
    </>
  );
}

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

  const placed = placeChildren(master.id, found, children);
  return (
    <>
      <Tier name="background">
        <Layers layers={found.background} tokens={master.tokens} />
      </Tier>
      <Tier name="layout">
        <Layers layers={found.decorations} tokens={master.tokens} />
      </Tier>
      <Tier name="element">
        {[...placed].map(([slot, nodes]) => (
          <SlotBox key={slot.id} masterId={master.id} layoutId={found.id} slot={slot} tokens={master.tokens}>
            {nodes}
          </SlotBox>
        ))}
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

export function Bullets({ items }: { items: Sentence[] } & PlacementProps) {
  return (
    <ul className="el-bullets">
      {items.map((item, i) => (
        <li key={i}>
          <Inlines value={item} />
        </li>
      ))}
    </ul>
  );
}
Bullets.slotKinds = ["body", "free"] as const;
