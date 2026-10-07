import type { ReactNode } from "react";
import type { Inline, Sentence } from "./inline";

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

/** 슬라이드 한 장의 최상위 요소. 크기는 1920x1080 고정이며, 슬라이드 미리보기 영역(slide-preview-area)이 창 크기에 맞춰 축소해서 보여 준다. */
export function Slide({ children }: { children: ReactNode }) {
  return <div className="slide">{children}</div>;
}

export function Title({ value }: { value: Sentence }) {
  return (
    <h1 className="el-title">
      <Inlines value={value} />
    </h1>
  );
}

export function Paragraph({ value }: { value: Sentence }) {
  return (
    <p className="el-paragraph">
      <Inlines value={value} />
    </p>
  );
}

export function Bullets({ items }: { items: Sentence[] }) {
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
