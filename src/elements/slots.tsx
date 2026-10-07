import { Children, createContext, isValidElement, useContext, useLayoutEffect, useRef, type ReactNode } from "react";
import { ANCHOR, textStyle } from "@/masters/Layers";
import type { Layout, ListSlot, Slot, TextSlot } from "@/masters/types";
import type { At } from "./at";

/** 요소가 들어갈 수 있는 슬롯 종류. 요소 컴포넌트의 정적 속성 `slotKinds`로 알린다(앞의 것이 우선). */
export type SlotKind = Slot["type"];

/** 모든 요소가 받는 속성. 자동 매핑이 모호할 때 들어갈 슬롯의 id를 지정한다. */
export interface PlacementProps {
  slot?: string;
}

/** 슬롯 안에 그려지는 요소가 자기가 들어간 슬롯을 읽는다(목차가 줄 모양을 알아야 한다). */
const SlotContext = createContext<Slot | null>(null);

export function useSlot(): Slot {
  const slot = useContext(SlotContext);
  if (!slot) throw new Error("[masters] 슬롯 안에서만 쓸 수 있는 요소입니다. at을 지정하지 말고 layout의 슬롯에 넣으세요.");
  return slot;
}

type Placement =
  | { kind: "slot"; slot: Slot; nodes: ReactNode[]; order: number }
  | { kind: "free"; node: ReactNode; order: number };

const kindsOf = (node: ReactNode): readonly SlotKind[] => {
  if (isValidElement(node) && typeof node.type === "function") {
    const kinds = (node.type as { slotKinds?: readonly SlotKind[] }).slotKinds;
    if (kinds) return kinds;
  }
  return ["free"];
};

const nameOf = (node: ReactNode): string =>
  isValidElement(node) ? (typeof node.type === "function" ? node.type.name : String(node.type)) : String(node);

/**
 * 자식을 배치한다. 쌓는 순서는 작성 순서이다(`order`).
 * - `slot` 속성이 있으면 그 슬롯에 넣는다.
 * - `at`이 있으면 슬롯 없이 절대 위치에 놓는다.
 * - 둘 다 없으면 요소가 알린 종류(`slotKinds`) 순서로 layout의 첫 슬롯에 넣는다. 같은 슬롯의 요소는 세로로 쌓인다.
 * 맞는 슬롯이 없으면 경고하고 그리지 않는다.
 */
export function placeChildren(masterId: string, layout: Layout, children: ReactNode): Placement[] {
  const placements: Placement[] = [];

  Children.toArray(children).forEach((child, order) => {
    const props = isValidElement<PlacementProps & { at?: At }>(child) ? child.props : undefined;
    let slot: Slot | undefined;

    if (props?.slot !== undefined) {
      slot = layout.slots.find((s) => s.id === props.slot);
      if (!slot) {
        throw new Error(
          `[masters] 마스터 "${masterId}"의 layout "${layout.id}"에 슬롯 "${props.slot}"이 없습니다. 사용 가능한 슬롯: ${layout.slots.map((s) => s.id).join(", ") || "없음"}`,
        );
      }
    } else if (props?.at) {
      placements.push({ kind: "free", node: child, order });
      return;
    } else {
      for (const kind of kindsOf(child)) {
        slot = layout.slots.find((s) => s.type === kind);
        if (slot) break;
      }
    }

    if (!slot) {
      console.warn(`[masters] 마스터 "${masterId}"의 layout "${layout.id}"에 ${nameOf(child)} 요소가 들어갈 슬롯이 없어 그리지 않습니다.`);
      return;
    }
    const existing = placements.find((p): p is Extract<Placement, { kind: "slot" }> => p.kind === "slot" && p.slot === slot);
    if (existing) existing.nodes.push(child);
    else placements.push({ kind: "slot", slot, nodes: [child], order });
  });

  return placements;
}

const warned = new Set<string>();

/** 슬롯의 `x, y, w, h`에 놓이는 컨테이너. 요소가 여럿이면 세로로 쌓는다. 내용이 넘치면 그대로 두고 경고만 한다. */
function TextSlotBox({
  masterId,
  layoutId,
  slot,
  z,
  tokens,
  children,
}: {
  masterId: string;
  layoutId: string;
  slot: TextSlot;
  z: number;
  tokens: Record<string, string>;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // scrollHeight는 글꼴의 글자 영역(줄 높이보다 큼)까지 재서 오탐이 나므로, 자식 요소의 박스로 잰다.
    let width = 0;
    let height = 0;
    for (const child of el.children as HTMLCollectionOf<HTMLElement>) {
      width = Math.max(width, child.offsetLeft + Math.max(child.offsetWidth, child.scrollWidth));
      height = Math.max(height, child.offsetTop + child.offsetHeight);
    }
    if (height > el.clientHeight + 1 || width > el.clientWidth + 1) {
      const message = `[masters] 마스터 "${masterId}"의 layout "${layoutId}" 슬롯 "${slot.id}"(${slot.w}×${slot.h})를 내용이 넘칩니다(${width}×${height}).`;
      if (!warned.has(message)) {
        warned.add(message);
        console.warn(message);
      }
    }
  });

  return (
    <div
      ref={ref}
      className={`slot slot--${slot.type}`}
      data-slot={slot.id}
      style={{
        left: slot.x,
        top: slot.y,
        width: slot.w,
        height: slot.h,
        zIndex: z,
        ...textStyle(slot, tokens),
        justifyContent: slot.anchor ? ANCHOR[slot.anchor] : undefined,
      }}
    >
      {children}
    </div>
  );
}

/** 목록 슬롯의 영역(첫 줄의 위에서 마지막 줄의 아래까지). 줄은 안에 들어간 요소(목차)가 그린다. */
function ListSlotBox({ slot, z, children }: { slot: ListSlot; z: number; children: ReactNode }) {
  return (
    <div
      className="slot slot--list"
      data-slot={slot.id}
      style={{ left: slot.x, top: slot.y, width: slot.w, height: slot.h + (slot.rows - 1) * slot.pitch, zIndex: z }}
    >
      {children}
    </div>
  );
}

/** `placeChildren`의 결과를 element 단계 안에 그린다. */
export function Placements({
  masterId,
  layoutId,
  placements,
  tokens,
}: {
  masterId: string;
  layoutId: string;
  placements: Placement[];
  tokens: Record<string, string>;
}) {
  return (
    <>
      {placements.map((p) => {
        const z = (p.order + 1) * 100;
        if (p.kind === "free") {
          return (
            <div key={`free-${p.order}`} className="free" style={{ zIndex: z }}>
              {p.node}
            </div>
          );
        }
        return (
          <SlotContext.Provider key={p.slot.id} value={p.slot}>
            {p.slot.type === "list" ? (
              <ListSlotBox slot={p.slot} z={z}>
                {p.nodes}
              </ListSlotBox>
            ) : (
              <TextSlotBox masterId={masterId} layoutId={layoutId} slot={p.slot} z={z} tokens={tokens}>
                {p.nodes}
              </TextSlotBox>
            )}
          </SlotContext.Provider>
        );
      })}
    </>
  );
}
