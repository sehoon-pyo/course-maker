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

/** 슬라이드 한 장의 최상위 요소. 크기는 미리보기 스테이지(1920x1080)가 정한다. */
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
