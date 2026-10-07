import { Children, isValidElement, useLayoutEffect, useRef, type ReactNode } from "react";
import { ANCHOR, textStyle } from "@/masters/Layers";
import type { Layout, TextSlot, TextSlotType } from "@/masters/types";

/** 요소가 들어갈 수 있는 슬롯 종류. 요소 컴포넌트의 정적 속성 `slotKinds`로 알린다(앞의 것이 우선). */
export type SlotKind = TextSlotType;

/** 모든 요소가 받는 속성. 자동 매핑이 모호할 때 들어갈 슬롯의 id를 지정한다. */
export interface PlacementProps {
  slot?: string;
}

const kindsOf = (node: ReactNode): readonly SlotKind[] => {
  if (isValidElement(node) && typeof node.type === "function") {
    const kinds = (node.type as { slotKinds?: readonly SlotKind[] }).slotKinds;
    if (kinds) return kinds;
  }
  return ["free"];
};

/**
 * 자식을 슬롯별로 나눈다. `slot` 속성이 있으면 그 슬롯, 없으면 요소가 알린 종류(`slotKinds`) 순서로 layout의 첫 슬롯을 고른다.
 * 맞는 슬롯이 없으면 경고하고 그리지 않는다.
 */
export function placeChildren(masterId: string, layout: Layout, children: ReactNode): Map<TextSlot, ReactNode[]> {
  const textSlots = layout.slots.filter((s): s is TextSlot => s.type !== "list");
  const placed = new Map<TextSlot, ReactNode[]>();

  for (const child of Children.toArray(children)) {
    const explicit = isValidElement<PlacementProps>(child) ? child.props.slot : undefined;
    let slot: TextSlot | undefined;
    if (explicit !== undefined) {
      slot = textSlots.find((s) => s.id === explicit);
      if (!slot) {
        throw new Error(
          `[masters] 마스터 "${masterId}"의 layout "${layout.id}"에 슬롯 "${explicit}"이 없습니다. 사용 가능한 슬롯: ${textSlots.map((s) => s.id).join(", ") || "없음"}`,
        );
      }
    } else {
      for (const kind of kindsOf(child)) {
        slot = textSlots.find((s) => s.type === kind);
        if (slot) break;
      }
    }

    if (!slot) {
      const name = isValidElement(child) ? (typeof child.type === "function" ? child.type.name : String(child.type)) : String(child);
      console.warn(`[masters] 마스터 "${masterId}"의 layout "${layout.id}"에 ${name} 요소가 들어갈 슬롯이 없어 그리지 않습니다.`);
      continue;
    }
    placed.set(slot, [...(placed.get(slot) ?? []), child]);
  }
  return placed;
}

const warned = new Set<string>();

/** 슬롯의 `x, y, w, h`에 놓이는 컨테이너. 요소가 여럿이면 세로로 쌓는다. 내용이 넘치면 그대로 두고 경고만 한다. */
export function SlotBox({
  masterId,
  layoutId,
  slot,
  tokens,
  children,
}: {
  masterId: string;
  layoutId: string;
  slot: TextSlot;
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
        ...textStyle(slot, tokens),
        justifyContent: slot.anchor ? ANCHOR[slot.anchor] : undefined,
      }}
    >
      {children}
    </div>
  );
}
