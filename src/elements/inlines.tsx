import type { Inline, Sentence } from "./inline";

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
