import { useMaster, useChapter } from "@/masters/context";
import { ANCHOR, textStyle } from "@/masters/Layers";
import { resolveColor } from "@/masters/color";
import { atStyle, type At, type AtBox } from "./at";
import type { Sentence } from "./inline";
import { Inlines } from "./inlines";
import { useSlot, type PlacementProps } from "./slots";

/* 모양을 마스터가 정하는 요소. 값(크기, 색, 간격)은 마스터 tokens의 --chip-*, --promptbox-* 변수가 정한다. */

/* ---------- Chip ---------- */

export interface ChipProps extends PlacementProps {
  value: Sentence;
  /** 아이콘 이미지 주소. 도구는 아이콘을 제공하지 않으므로 강의 폴더의 이미지를 import해서 준다. */
  icon?: string;
  /** `x, y`만 주면 폭은 글자에 맞춘다. */
  at?: At;
}

/** 아이콘과 글자가 들어가는 알약 모양 칩(단축키, 명령어 표시). 폭은 글자에 맞춰 자동으로 계산한다. */
export function Chip({ value, icon, at }: ChipProps) {
  return (
    <span className="el-chip" style={atStyle(at)}>
      {icon && <img className="el-chip-icon" src={icon} alt="" draggable={false} />}
      <span className="el-chip-text">
        <Inlines value={value} />
      </span>
    </span>
  );
}
Chip.slotKinds = ["free", "body"] as const;

/* ---------- PromptBox ---------- */

export interface PromptBoxProps extends PlacementProps {
  value: Sentence;
  /** 있으면 위쪽에 아이콘과 구분선이 생긴다. 도구는 아이콘을 제공하지 않는다. */
  icon?: string;
  at: AtBox;
}

/** 프롬프트를 보여 주는 어두운 상자. 안쪽 배치(머리, 구분선, 글 영역)는 상자 크기를 기준으로 정해진다. */
export function PromptBox({ value, icon, at }: PromptBoxProps) {
  return (
    <div className="el-promptbox" style={atStyle(at)}>
      {icon && (
        <>
          <div className="el-promptbox-head">
            <img src={icon} alt="" draggable={false} />
          </div>
          <div className="el-promptbox-line" />
        </>
      )}
      <div className="el-promptbox-body">
        <Inlines value={value} />
      </div>
    </div>
  );
}
PromptBox.slotKinds = ["free"] as const;

/* ---------- Toc ---------- */

const warned = new Set<string>();

/**
 * 목차. 지금 슬라이드가 속한 chapter의 section 목록으로 항목을 자동으로 채운다(직접 지정하지 않는다).
 * 번호 칸에는 `{sectionLabel} {순서}`, 제목 칸에는 section의 title이 들어간다. layout의 `list` 슬롯에 놓인다.
 */
export function Toc(_props: PlacementProps) {
  const slot = useSlot();
  const chapter = useChapter();
  const { tokens } = useMaster();
  if (slot.type !== "list") throw new Error(`[masters] Toc는 list 슬롯에만 들어갑니다(슬롯 "${slot.id}"는 ${slot.type}).`);

  if (chapter.sections.length > slot.rows) {
    const message = `[masters] 슬롯 "${slot.id}"는 ${slot.rows}줄인데 section이 ${chapter.sections.length}개입니다. 넘치는 항목은 표시하지 않습니다.`;
    if (!warned.has(message)) {
      warned.add(message);
      console.warn(message);
    }
  }

  return (
    <>
      {chapter.sections.slice(0, slot.rows).map((section, row) => {
        const texts = slot.columns.length >= 2 ? [`${chapter.sectionLabel} ${row + 1}`, section.title] : [section.title];
        return (
          <div key={section.id} className="toc-row" style={{ top: row * slot.pitch, height: slot.h }}>
            {slot.columns.map((column, i) => (
              <div
                key={i}
                className="toc-cell"
                style={{
                  left: column.x - slot.x,
                  width: column.w,
                  ...textStyle(column, tokens),
                  background: resolveColor(column.fill, tokens),
                  justifyContent: ANCHOR[column.anchor ?? "middle"],
                }}
              >
                {texts[i] ?? ""}
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}
Toc.slotKinds = ["list"] as const;
