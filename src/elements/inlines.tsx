import { useMaster } from "@/masters/context";
import { resolveIcon } from "@/masters/icon";
import type { Em, Inline, InlineChip, InlineIcon, Sentence } from "./inline";

function IconNode({ seg }: { seg: InlineIcon }) {
  const { icons } = useMaster();
  return <img className="el-inline-icon" src={resolveIcon(seg.src, icons)} alt="" draggable={false} />;
}

function EmNode({ seg }: { seg: Em }) {
  const { tokens } = useMaster();
  const token = `--em-${seg.color}`;
  if (!(token in tokens)) {
    const names = Object.keys(tokens).filter((k) => k.startsWith("--em-")).map((k) => k.slice(5));
    throw new Error(`[masters] 강조 색 "${seg.color}"이 마스터 tokens에 없습니다(${token}). 사용 가능한 색: ${names.join(", ") || "없음"}`);
  }
  return (
    <span className={seg.bold ? "em em--bold" : "em"} style={{ color: `var(${token})` }}>
      {seg.text}
    </span>
  );
}

function ChipNode({ seg }: { seg: InlineChip }) {
  const { icons } = useMaster();
  const src = resolveIcon(seg.icon, icons);
  return (
    <span className={src ? "el-chip el-chip--inline" : "el-chip el-chip--text el-chip--inline"}>
      {src && <img className="el-chip-icon" src={src} alt="" draggable={false} />}
      <span className="el-chip-text">{seg.text}</span>
    </span>
  );
}

function InlineNode({ seg }: { seg: Inline }) {
  if (typeof seg === "string") return <>{seg}</>;
  switch (seg.kind) {
    case "bold":
      return <strong>{seg.text}</strong>;
    case "code":
      return <code>{seg.text}</code>;
    case "badge":
      return <span className={`badge badge--${seg.color}`}>{seg.text}</span>;
    case "chip":
      return <ChipNode seg={seg} />;
    case "br":
      return <br />;
    case "em":
      return <EmNode seg={seg} />;
    case "icon":
      return <IconNode seg={seg} />;
    case "link":
      return (
        <a className="el-link" href={seg.href} target="_blank" rel="noopener noreferrer">
          {seg.text}
        </a>
      );
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
